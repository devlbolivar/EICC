import Stripe from "stripe";

// Skip Stripe initialization during build phase
const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build';

// Use a dummy key during build to prevent initialization errors
// Stripe requires a non-empty key, so we use a test key format during build
const stripeKey = process.env.STRIPE_SECRET_KEY || (isBuildPhase ? 'sk_test_build_dummy_key_for_nextjs_build_only' : '');

// Inicializar Stripe con la clave secreta
export const stripe = new Stripe(stripeKey, {
  apiVersion: "2024-10-28.acacia",
  typescript: true,
});

// Definición de tipos para planes
export interface BillingPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: "month" | "year";
  stripePriceId: string | null;
  features: string[];
  limits: {
    employees: number;
    courses: number;
    certificates: boolean;
    support: string;
    api: boolean;
    customBranding: boolean;
    analytics: boolean;
  };
  popular?: boolean;
}

// Configuración de planes de suscripción
export const BILLING_PLANS: Record<string, BillingPlan> = {
  FREE: {
    id: "free",
    name: "Free",
    description: "Plan gratuito para explorar la plataforma",
    price: 0,
    currency: "USD",
    interval: "month",
    stripePriceId: null, // No requiere pago
    features: [
      "Hasta 5 empleados",
      "Acceso a cursos básicos",
      "Certificados básicos",
      "Soporte por email",
      "Dashboard básico",
    ],
    limits: {
      employees: 5,
      courses: 10,
      certificates: true,
      support: "email",
      api: false,
      customBranding: false,
      analytics: false,
    },
  },
  PREMIUM: {
    id: "premium",
    name: "Premium",
    description: "Ideal para empresas en crecimiento",
    price: 299,
    currency: "USD",
    interval: "month",
    stripePriceId: process.env.STRIPE_PREMIUM_PRICE_ID || "",
    features: [
      "Hasta 50 empleados",
      "Acceso a todos los cursos",
      "Certificados ilimitados",
      "Certificados personalizados",
      "Soporte prioritario",
      "Reportes avanzados",
      "Dashboard completo",
      "Integración SSO",
    ],
    limits: {
      employees: 50,
      courses: -1, // ilimitado
      certificates: true,
      support: "priority",
      api: false,
      customBranding: true,
      analytics: true,
    },
    popular: true,
  },
  ENTERPRISE: {
    id: "enterprise",
    name: "Enterprise",
    description: "Solución completa para grandes empresas",
    price: 999,
    currency: "USD",
    interval: "month",
    stripePriceId: process.env.STRIPE_ENTERPRISE_PRICE_ID || "",
    features: [
      "Empleados ilimitados",
      "Acceso a todos los cursos",
      "Certificados ilimitados",
      "Certificados premium personalizados",
      "Soporte 24/7 dedicado",
      "Reportes avanzados y personalizados",
      "API de integración completa",
      "Custom branding completo",
      "Onboarding personalizado",
      "SLA garantizado",
      "Gestión de usuarios avanzada",
    ],
    limits: {
      employees: -1, // ilimitado
      courses: -1, // ilimitado
      certificates: true,
      support: "24/7",
      api: true,
      customBranding: true,
      analytics: true,
    },
  },
};

// Planes anuales con descuento
export const BILLING_PLANS_YEARLY: Record<string, BillingPlan> = {
  PREMIUM_YEARLY: {
    ...BILLING_PLANS.PREMIUM,
    id: "premium_yearly",
    name: "Premium Anual",
    price: 2990, // ~17% descuento
    interval: "year",
    stripePriceId: process.env.STRIPE_PREMIUM_YEARLY_PRICE_ID || "",
    description: "Plan Premium con facturación anual (ahorra 17%)",
  },
  ENTERPRISE_YEARLY: {
    ...BILLING_PLANS.ENTERPRISE,
    id: "enterprise_yearly",
    name: "Enterprise Anual",
    price: 9990, // ~17% descuento
    interval: "year",
    stripePriceId: process.env.STRIPE_ENTERPRISE_YEARLY_PRICE_ID || "",
    description: "Plan Enterprise con facturación anual (ahorra 17%)",
  },
};

// Función helper para obtener un plan por ID
export function getBillingPlan(planId: string): BillingPlan | null {
  const allPlans = { ...BILLING_PLANS, ...BILLING_PLANS_YEARLY };
  return allPlans[planId.toUpperCase()] || null;
}

// Función helper para obtener un plan por stripePriceId
export function getBillingPlanByPriceId(priceId: string): BillingPlan | null {
  const allPlans = { ...BILLING_PLANS, ...BILLING_PLANS_YEARLY };
  return (
    Object.values(allPlans).find((plan) => plan.stripePriceId === priceId) ||
    null
  );
}

// Función para formatear el precio
export function formatPrice(amount: number, currency: string = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
}

// Función para formatear fecha
export function formatDate(date: Date | string | number): string {
  const d =
    typeof date === "string" || typeof date === "number"
      ? new Date(date)
      : date;
  return d.toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// Función para verificar si un plan tiene una característica específica
export function planHasFeature(
  planId: string,
  feature: keyof BillingPlan["limits"]
): boolean {
  const plan = getBillingPlan(planId);
  if (!plan) return false;

  const value = plan.limits[feature];
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value > 0 || value === -1;
  return !!value;
}

// Función para verificar límites de uso
export function checkUsageLimit(
  planId: string,
  feature: keyof BillingPlan["limits"],
  currentUsage: number
): { allowed: boolean; limit: number; usage: number } {
  const plan = getBillingPlan(planId);
  if (!plan) {
    return { allowed: false, limit: 0, usage: currentUsage };
  }

  const limit = plan.limits[feature];
  if (typeof limit !== "number") {
    return { allowed: true, limit: -1, usage: currentUsage };
  }

  // -1 significa ilimitado
  if (limit === -1) {
    return { allowed: true, limit: -1, usage: currentUsage };
  }

  return {
    allowed: currentUsage < limit,
    limit,
    usage: currentUsage,
  };
}

// Constantes para Stripe
export const STRIPE_WEBHOOK_EVENTS = {
  CHECKOUT_SESSION_COMPLETED: "checkout.session.completed",
  CUSTOMER_SUBSCRIPTION_CREATED: "customer.subscription.created",
  CUSTOMER_SUBSCRIPTION_UPDATED: "customer.subscription.updated",
  CUSTOMER_SUBSCRIPTION_DELETED: "customer.subscription.deleted",
  INVOICE_PAID: "invoice.paid",
  INVOICE_PAYMENT_FAILED: "invoice.payment_failed",
  INVOICE_FINALIZED: "invoice.finalized",
} as const;

// Mapeo de estados de Stripe a estados de la app
export const SUBSCRIPTION_STATUS_MAP: Record<
  Stripe.Subscription.Status,
  string
> = {
  active: "active",
  canceled: "canceled",
  incomplete: "incomplete",
  incomplete_expired: "incomplete_expired",
  past_due: "past_due",
  trialing: "trialing",
  unpaid: "unpaid",
  paused: "paused",
};

// Función para crear un cliente de Stripe
export async function createStripeCustomer(
  email: string,
  name: string,
  companyId: string
): Promise<Stripe.Customer> {
  return await stripe.customers.create({
    email,
    name,
    metadata: {
      companyId,
    },
  });
}

// Función para crear una sesión de checkout
export async function createCheckoutSession(
  customerId: string,
  priceId: string,
  companyId: string,
  successUrl: string,
  cancelUrl: string
): Promise<Stripe.Checkout.Session> {
  return await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      companyId,
    },
    subscription_data: {
      metadata: {
        companyId,
      },
    },
    allow_promotion_codes: true,
    billing_address_collection: "required",
  });
}

// Función para crear una sesión del portal de clientes
export async function createPortalSession(
  customerId: string,
  returnUrl: string
): Promise<Stripe.BillingPortal.Session> {
  return await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });
}

// Función para cancelar una suscripción
export async function cancelSubscription(
  subscriptionId: string,
  immediately: boolean = false
): Promise<Stripe.Subscription> {
  if (immediately) {
    return await stripe.subscriptions.cancel(subscriptionId);
  } else {
    return await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });
  }
}

// Función para reanudar una suscripción
export async function resumeSubscription(
  subscriptionId: string
): Promise<Stripe.Subscription> {
  return await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: false,
  });
}
