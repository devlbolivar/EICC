import { NextRequest, NextResponse } from "next/server";
import { createPortalSession } from "@/lib/stripe";
import { db } from "@/config/db";
import { subscriptionsTable } from "@/config/schema";
import { eq } from "drizzle-orm";
import { requireAuth, handleApiError } from "@/lib/api-helpers";

/**
 * POST /api/billing/portal
 * Crear una sesión del portal de facturación de Stripe
 * Permite a los clientes gestionar su suscripción, métodos de pago, etc.
 */
export async function POST(req: NextRequest) {
  try {
    // ✅ CORREGIDO: Verificar autenticación correctamente
    const { payload } = await requireAuth(req);

    const { companyId } = await req.json();

    if (!companyId) {
      return NextResponse.json(
        { error: "Se requiere companyId" },
        { status: 400 }
      );
    }

    // Obtener la suscripción de la empresa
    const subscription = await db
      .select()
      .from(subscriptionsTable)
      .where(eq(subscriptionsTable.companyId, companyId))
      .limit(1);

    if (!subscription.length || !subscription[0].stripeCustomerId) {
      return NextResponse.json(
        { error: "No se encontró suscripción para esta empresa" },
        { status: 404 }
      );
    }

    // Crear la sesión del portal
    const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";
    const returnUrl = `${baseUrl}/workspace/company/billing`;

    const portalSession = await createPortalSession(
      subscription[0].stripeCustomerId,
      returnUrl
    );

    return NextResponse.json({
      url: portalSession.url,
    });
  } catch (error) {
    console.error("Error creating portal session:", error);
    return handleApiError(error);
  }
}
