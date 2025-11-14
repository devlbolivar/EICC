import { NextRequest, NextResponse } from "next/server";
import {
  stripe,
  createCheckoutSession,
  getBillingPlanByPriceId,
} from "@/lib/stripe";
import { db } from "@/config/db";
import {
  subscriptionsTable,
  companiesTable,
  userCompaniesTable,
} from "@/config/schema";
import { eq, and } from "drizzle-orm";
import { requireAuth, handleApiError } from "@/lib/api-helpers";
import { APP_CONFIG } from "@/lib/config";
import { HTTP_STATUS } from "@/lib/http-status";
import { SystemRole } from "@/lib/enums";

/**
 * POST /api/billing/checkout
 * Crear una sesión de checkout de Stripe para una suscripción
 */
export async function POST(req: NextRequest) {
  try {
    // ✅ CORREGIDO: Verificar autenticación correctamente
    const { payload } = await requireAuth(req);

    const { priceId, companyId } = await req.json();

    // Validar datos requeridos
    if (!priceId) {
      return NextResponse.json(
        { error: "Se requiere priceId" },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    if (!companyId) {
      return NextResponse.json(
        { error: "Se requiere companyId" },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    // Verificar que el plan existe
    const plan = getBillingPlanByPriceId(priceId);
    if (!plan) {
      return NextResponse.json(
        { error: "Plan no encontrado" },
        { status: HTTP_STATUS.NOT_FOUND }
      );
    }

    // Obtener información de la empresa
    const company = await db
      .select()
      .from(companiesTable)
      .where(eq(companiesTable.id, companyId))
      .limit(1);

    if (!company.length) {
      return NextResponse.json(
        { error: "Empresa no encontrada" },
        { status: HTTP_STATUS.NOT_FOUND }
      );
    }

    // 🔒 SEGURIDAD: Verificar que el usuario pertenece a esta empresa
    const userCompany = await db
      .select()
      .from(userCompaniesTable)
      .where(
        and(
          eq(userCompaniesTable.userId, payload.userId),
          eq(userCompaniesTable.companyId, companyId),
          eq(userCompaniesTable.isActive, true)
        )
      )
      .limit(1);

    if (!userCompany.length) {
      return NextResponse.json(
        {
          error:
            "No tienes permisos para gestionar la facturación de esta empresa",
        },
        { status: HTTP_STATUS.FORBIDDEN }
      );
    }

    // Verificar que el usuario tiene un rol apropiado (company o admin)
    // Solo admins y company managers pueden modificar facturación
    const roleResult = await db.query.rolesTable.findFirst({
      where: (roles, { eq }) => eq(roles.id, userCompany[0].roleId),
    });

    if (
      !roleResult ||
      (roleResult.name !== SystemRole.COMPANY && roleResult.name !== SystemRole.ADMIN)
    ) {
      return NextResponse.json(
        {
          error:
            "Solo administradores y gestores de empresa pueden modificar la facturación",
        },
        { status: HTTP_STATUS.FORBIDDEN }
      );
    }

    // Verificar si ya tiene una suscripción
    const existingSubscription = await db
      .select()
      .from(subscriptionsTable)
      .where(eq(subscriptionsTable.companyId, companyId))
      .limit(1);

    let customerId: string;

    if (existingSubscription.length > 0) {
      // Ya existe una suscripción, usar el customer ID existente
      customerId = existingSubscription[0].stripeCustomerId;

      // Verificar si tiene una suscripción activa
      if (existingSubscription[0].status === "active") {
        return NextResponse.json(
          {
            error:
              "Ya tiene una suscripción activa. Use el portal para cambiar de plan.",
          },
          { status: HTTP_STATUS.BAD_REQUEST }
        );
      }
    } else {
      // Crear un nuevo cliente en Stripe
      const customer = await stripe.customers.create({
        email: payload.email,
        name: company[0].name,
        metadata: {
          companyId: companyId,
        },
      });
      customerId = customer.id;

      // Guardar la información básica de suscripción
      await db.insert(subscriptionsTable).values({
        companyId: companyId,
        stripeCustomerId: customerId,
        status: "inactive",
        planName: plan.id,
      });
    }

    // Crear la sesión de checkout
    const session = await createCheckoutSession(
      customerId,
      priceId,
      companyId,
      `${APP_CONFIG.BASE_URL}/workspace/company/billing?success=true`,
      `${APP_CONFIG.BASE_URL}/workspace/company/billing?canceled=true`
    );

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return handleApiError(error);
  }
}
