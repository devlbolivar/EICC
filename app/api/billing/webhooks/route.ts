import { NextRequest, NextResponse } from "next/server";
import { stripe, STRIPE_WEBHOOK_EVENTS } from "@/lib/stripe";
import { db } from "@/config/db";
import {
  subscriptionsTable,
  invoicesTable,
  companiesTable,
} from "@/config/schema";
import { eq } from "drizzle-orm";
import Stripe from "stripe";

/**
 * POST /api/billing/webhooks
 * Webhook endpoint para recibir eventos de Stripe
 * IMPORTANTE: Este endpoint debe estar configurado en el dashboard de Stripe
 */
export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    // Verificar la firma del webhook
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || ""
    );
  } catch (err) {
    console.error("⚠️  Webhook signature verification failed.", err);
    return NextResponse.json(
      { error: "Webhook signature verification failed" },
      { status: 400 }
    );
  }

  console.log(`✅ Webhook received: ${event.type}`);

  try {
    // Manejar diferentes tipos de eventos
    switch (event.type) {
      case STRIPE_WEBHOOK_EVENTS.CHECKOUT_SESSION_COMPLETED:
        await handleCheckoutSessionCompleted(
          event.data.object as Stripe.Checkout.Session
        );
        break;

      case STRIPE_WEBHOOK_EVENTS.CUSTOMER_SUBSCRIPTION_CREATED:
      case STRIPE_WEBHOOK_EVENTS.CUSTOMER_SUBSCRIPTION_UPDATED:
        await handleSubscriptionUpdate(
          event.data.object as Stripe.Subscription
        );
        break;

      case STRIPE_WEBHOOK_EVENTS.CUSTOMER_SUBSCRIPTION_DELETED:
        await handleSubscriptionDeleted(
          event.data.object as Stripe.Subscription
        );
        break;

      case STRIPE_WEBHOOK_EVENTS.INVOICE_PAID:
        await handleInvoicePaid(event.data.object as Stripe.Invoice);
        break;

      case STRIPE_WEBHOOK_EVENTS.INVOICE_PAYMENT_FAILED:
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      case STRIPE_WEBHOOK_EVENTS.INVOICE_FINALIZED:
        await handleInvoiceFinalized(event.data.object as Stripe.Invoice);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}

/**
 * Manejar el evento de checkout completado
 */
async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session
) {
  const companyId = session.metadata?.companyId;

  if (!companyId) {
    console.error("No companyId in checkout session metadata");
    return;
  }

  console.log(`Checkout completed for company: ${companyId}`);

  // Obtener el subscription ID de la sesión
  const subscriptionId = session.subscription as string;

  if (subscriptionId) {
    // Obtener detalles de la suscripción
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    await handleSubscriptionUpdate(subscription);
  }
}

/**
 * Actualizar o crear suscripción en la base de datos
 */
async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  const companyId = subscription.metadata?.companyId;

  if (!companyId) {
    console.error("No companyId in subscription metadata");
    return;
  }

  const priceId = subscription.items.data[0]?.price.id;
  const planName = getPlanNameFromPriceId(priceId);

  // Verificar si ya existe una suscripción
  const existingSubscription = await db
    .select()
    .from(subscriptionsTable)
    .where(eq(subscriptionsTable.companyId, companyId))
    .limit(1);

  const subscriptionData = {
    companyId,
    stripeCustomerId: customerId,
    stripeSubscriptionId: subscription.id,
    stripePriceId: priceId,
    status: subscription.status,
    planName,
    currentPeriodStart: new Date((subscription.current_period_start as number) * 1000),
    currentPeriodEnd: new Date((subscription.current_period_end as number) * 1000),
    cancelAtPeriodEnd: subscription.cancel_at_period_end as boolean,
    trialEnd: subscription.trial_end
      ? new Date((subscription.trial_end as number) * 1000)
      : null,
    updatedAt: new Date(),
  };

  if (existingSubscription.length > 0) {
    // Actualizar suscripción existente
    await db
      .update(subscriptionsTable)
      .set(subscriptionData)
      .where(eq(subscriptionsTable.id, existingSubscription[0].id));
  } else {
    // Crear nueva suscripción
    await db.insert(subscriptionsTable).values(subscriptionData);
  }

  // Actualizar el plan en la tabla de empresas
  await db
    .update(companiesTable)
    .set({
      subscriptionPlan: planName,
      subscriptionExpiresAt: new Date(subscription.current_period_end * 1000),
      updatedAt: new Date(),
    })
    .where(eq(companiesTable.id, companyId));

  console.log(`✅ Subscription updated for company: ${companyId}`);
}

/**
 * Manejar cancelación de suscripción
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const companyId = subscription.metadata?.companyId;

  if (!companyId) {
    console.error("No companyId in subscription metadata");
    return;
  }

  // Actualizar el estado a cancelado
  await db
    .update(subscriptionsTable)
    .set({
      status: "canceled",
      updatedAt: new Date(),
    })
    .where(eq(subscriptionsTable.companyId, companyId));

  // Revertir a plan gratuito
  await db
    .update(companiesTable)
    .set({
      subscriptionPlan: "free",
      subscriptionExpiresAt: null,
      updatedAt: new Date(),
    })
    .where(eq(companiesTable.id, companyId));

  console.log(`❌ Subscription canceled for company: ${companyId}`);
}

/**
 * Manejar factura pagada
 */
async function handleInvoicePaid(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;

  // Buscar la empresa por customer ID
  const subscription = await db
    .select()
    .from(subscriptionsTable)
    .where(eq(subscriptionsTable.stripeCustomerId, customerId))
    .limit(1);

  if (!subscription.length) {
    console.error("No subscription found for customer:", customerId);
    return;
  }

  const companyId = subscription[0].companyId;

  // Verificar si ya existe la factura
  const existingInvoice = await db
    .select()
    .from(invoicesTable)
    .where(eq(invoicesTable.stripeInvoiceId, invoice.id))
    .limit(1);

  const invoiceData = {
    companyId,
    stripeInvoiceId: invoice.id,
    stripeCustomerId: customerId,
    amount: invoice.amount_paid,
    currency: invoice.currency,
    status: invoice.status || "paid",
    invoiceNumber: invoice.number || undefined,
    description: invoice.lines.data[0]?.description || undefined,
    pdfUrl: invoice.invoice_pdf || undefined,
    hostedInvoiceUrl: invoice.hosted_invoice_url || undefined,
    billingReason: invoice.billing_reason || undefined,
    dueDate: invoice.due_date ? new Date(invoice.due_date * 1000) : null,
    paidAt: new Date(invoice.status_transitions.paid_at! * 1000),
    updatedAt: new Date(),
  };

  if (existingInvoice.length > 0) {
    // Actualizar factura existente
    await db
      .update(invoicesTable)
      .set(invoiceData)
      .where(eq(invoicesTable.id, existingInvoice[0].id));
  } else {
    // Crear nueva factura
    await db.insert(invoicesTable).values(invoiceData);
  }

  console.log(`💰 Invoice paid for company: ${companyId}`);
}

/**
 * Manejar fallo en el pago de factura
 */
async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;

  // Buscar la empresa
  const subscription = await db
    .select()
    .from(subscriptionsTable)
    .where(eq(subscriptionsTable.stripeCustomerId, customerId))
    .limit(1);

  if (!subscription.length) {
    console.error("No subscription found for customer:", customerId);
    return;
  }

  const companyId = subscription[0].companyId;

  // Actualizar estado de suscripción
  await db
    .update(subscriptionsTable)
    .set({
      status: "past_due",
      updatedAt: new Date(),
    })
    .where(eq(subscriptionsTable.companyId, companyId));

  console.log(`⚠️ Invoice payment failed for company: ${companyId}`);

  // Aquí podrías enviar un email de notificación al cliente
}

/**
 * Manejar factura finalizada
 */
async function handleInvoiceFinalized(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;

  // Buscar la empresa
  const subscription = await db
    .select()
    .from(subscriptionsTable)
    .where(eq(subscriptionsTable.stripeCustomerId, customerId))
    .limit(1);

  if (!subscription.length) {
    console.error("No subscription found for customer:", customerId);
    return;
  }

  const companyId = subscription[0].companyId;

  // Guardar/actualizar la factura
  const existingInvoice = await db
    .select()
    .from(invoicesTable)
    .where(eq(invoicesTable.stripeInvoiceId, invoice.id))
    .limit(1);

  const invoiceData = {
    companyId,
    stripeInvoiceId: invoice.id,
    stripeCustomerId: customerId,
    amount: invoice.amount_due,
    currency: invoice.currency,
    status: invoice.status || "open",
    invoiceNumber: invoice.number || undefined,
    description: invoice.lines.data[0]?.description || undefined,
    pdfUrl: invoice.invoice_pdf || undefined,
    hostedInvoiceUrl: invoice.hosted_invoice_url || undefined,
    billingReason: invoice.billing_reason || undefined,
    dueDate: invoice.due_date ? new Date(invoice.due_date * 1000) : null,
    paidAt: invoice.status_transitions.paid_at
      ? new Date(invoice.status_transitions.paid_at * 1000)
      : null,
    updatedAt: new Date(),
  };

  if (existingInvoice.length > 0) {
    await db
      .update(invoicesTable)
      .set(invoiceData)
      .where(eq(invoicesTable.id, existingInvoice[0].id));
  } else {
    await db.insert(invoicesTable).values(invoiceData);
  }

  console.log(`📄 Invoice finalized for company: ${companyId}`);
}

/**
 * Helper para obtener el nombre del plan desde el price ID
 */
function getPlanNameFromPriceId(priceId: string): string {
  const priceMap: Record<string, string> = {
    [process.env.STRIPE_PREMIUM_PRICE_ID || ""]: "premium",
    [process.env.STRIPE_PREMIUM_YEARLY_PRICE_ID || ""]: "premium_yearly",
    [process.env.STRIPE_ENTERPRISE_PRICE_ID || ""]: "enterprise",
    [process.env.STRIPE_ENTERPRISE_YEARLY_PRICE_ID || ""]: "enterprise_yearly",
  };

  return priceMap[priceId] || "free";
}

// Configuración para desactivar el body parser de Next.js
// Stripe requiere el raw body para verificar la firma
export const config = {
  api: {
    bodyParser: false,
  },
};
