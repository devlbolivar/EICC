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
import { verifyAuth } from "@/lib/auth";

/**
 * POST /api/billing/checkout
 * Crear una sesión de checkout de Stripe para una suscripción
 */
export async function POST(req: NextRequest) {
  try {
    // Verificar autenticación
    const authResult = await verifyAuth(req);
    if (!authResult.valid || !authResult.user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const { priceId, companyId } = await req.json();

    // Validar datos requeridos
    if (!priceId) {
      return NextResponse.json(
        { error: "Se requiere priceId" },
        { status: 400 }
      );
    }

    if (!companyId) {
      return NextResponse.json(
        { error: "Se requiere companyId" },
        { status: 400 }
      );
    }

    // Verificar que el plan existe
    const plan = getBillingPlanByPriceId(priceId);
    if (!plan) {
      return NextResponse.json(
        { error: "Plan no encontrado" },
        { status: 404 }
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
        { status: 404 }
      );
    }

    // 🔒 SEGURIDAD: Verificar que el usuario pertenece a esta empresa
    const userCompany = await db
      .select()
      .from(userCompaniesTable)
      .where(
        and(
          eq(userCompaniesTable.userId, authResult.user.id),
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
        { status: 403 }
      );
    }

    // Verificar que el usuario tiene un rol apropiado (company o admin)
    // Solo admins y company managers pueden modificar facturación
    const roleResult = await db.query.rolesTable.findFirst({
      where: (roles, { eq }) => eq(roles.id, userCompany[0].roleId),
    });

    if (
      !roleResult ||
      (roleResult.name !== "company" && roleResult.name !== "admin")
    ) {
      return NextResponse.json(
        {
          error:
            "Solo administradores y gestores de empresa pueden modificar la facturación",
        },
        { status: 403 }
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
          { status: 400 }
        );
      }
    } else {
      // Crear un nuevo cliente en Stripe
      const customer = await stripe.customers.create({
        email: authResult.user.email,
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
    const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";
    const session = await createCheckoutSession(
      customerId,
      priceId,
      companyId,
      `${baseUrl}/workspace/company/billing?success=true`,
      `${baseUrl}/workspace/company/billing?canceled=true`
    );

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json(
      { error: "Error al crear la sesión de pago" },
      { status: 500 }
    );
  }
}
