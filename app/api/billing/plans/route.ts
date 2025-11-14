import { NextResponse } from "next/server";
import { BILLING_PLANS, BILLING_PLANS_YEARLY } from "@/lib/stripe";

/**
 * GET /api/billing/plans
 * Obtener todos los planes disponibles
 */
export async function GET() {
  try {
    const monthlyPlans = Object.values(BILLING_PLANS);
    const yearlyPlans = Object.values(BILLING_PLANS_YEARLY);

    return NextResponse.json({
      monthly: monthlyPlans,
      yearly: yearlyPlans,
      all: [...monthlyPlans, ...yearlyPlans],
    });
  } catch (error) {
    console.error("Error fetching plans:", error);
    return NextResponse.json(
      { error: "Error al obtener los planes" },
      { status: 500 }
    );
  }
}
