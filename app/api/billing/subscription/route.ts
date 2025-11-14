import { NextRequest, NextResponse } from "next/server";
import { db } from "@/config/db";
import { subscriptionsTable, companiesTable } from "@/config/schema";
import { eq } from "drizzle-orm";
import { requireAuth, handleApiError } from "@/lib/api-helpers";
import { getBillingPlan } from "@/lib/stripe";

/**
 * GET /api/billing/subscription?companyId={id}
 * Obtener la suscripción actual de una empresa
 */
export async function GET(req: NextRequest) {
  try {
    // ✅ CORREGIDO: Verificar autenticación correctamente
    const { payload } = await requireAuth(req);

    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get("companyId");

    if (!companyId) {
      return NextResponse.json(
        { error: "Se requiere companyId" },
        { status: 400 }
      );
    }

    // Obtener la empresa
    const company = await db
      .select()
      .from(companiesTable)
      .where(eq(companiesTable.id, companyId))
      .limit(1);

    if (!company.length) {
      return NextResponse.json(
        { error: "Empresa no encontrada" },
        { status: 404 }
      );
    }

    // Obtener la suscripción
    const subscription = await db
      .select()
      .from(subscriptionsTable)
      .where(eq(subscriptionsTable.companyId, companyId))
      .limit(1);

    if (!subscription.length) {
      // No tiene suscripción, devolver plan gratuito
      return NextResponse.json({
        plan: getBillingPlan("free"),
        status: "active",
        isFreePlan: true,
        company: {
          id: company[0].id,
          name: company[0].name,
          subscriptionPlan: company[0].subscriptionPlan || "free",
        },
      });
    }

    const sub = subscription[0];
    const plan = getBillingPlan(sub.planName);

    return NextResponse.json({
      id: sub.id,
      plan,
      status: sub.status,
      stripeCustomerId: sub.stripeCustomerId,
      stripeSubscriptionId: sub.stripeSubscriptionId,
      currentPeriodStart: sub.currentPeriodStart,
      currentPeriodEnd: sub.currentPeriodEnd,
      cancelAtPeriodEnd: sub.cancelAtPeriodEnd,
      trialEnd: sub.trialEnd,
      isFreePlan: sub.planName === "free",
      company: {
        id: company[0].id,
        name: company[0].name,
        subscriptionPlan: company[0].subscriptionPlan || "free",
      },
    });
  } catch (error) {
    console.error("Error fetching subscription:", error);
    return handleApiError(error);
  }
}
