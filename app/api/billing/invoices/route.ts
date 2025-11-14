import { NextRequest, NextResponse } from "next/server";
import { db } from "@/config/db";
import { invoicesTable } from "@/config/schema";
import { eq, desc } from "drizzle-orm";
import { verifyAuth } from "@/lib/auth";

/**
 * GET /api/billing/invoices?companyId={id}
 * Obtener el historial de facturas de una empresa
 */
export async function GET(req: NextRequest) {
  try {
    // Verificar autenticación
    const authResult = await verifyAuth(req);
    if (!authResult.valid || !authResult.user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get("companyId");
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = parseInt(searchParams.get("offset") || "0");

    if (!companyId) {
      return NextResponse.json(
        { error: "Se requiere companyId" },
        { status: 400 }
      );
    }

    // Obtener las facturas
    const invoices = await db
      .select()
      .from(invoicesTable)
      .where(eq(invoicesTable.companyId, companyId))
      .orderBy(desc(invoicesTable.createdAt))
      .limit(limit)
      .offset(offset);

    // Calcular estadísticas
    const allInvoices = await db
      .select()
      .from(invoicesTable)
      .where(eq(invoicesTable.companyId, companyId));

    const totalPaid = allInvoices
      .filter((inv) => inv.status === "paid")
      .reduce((sum, inv) => sum + inv.amount, 0);

    const totalInvoices = allInvoices.length;
    const paidInvoices = allInvoices.filter(
      (inv) => inv.status === "paid"
    ).length;
    const pendingInvoices = allInvoices.filter(
      (inv) => inv.status === "open"
    ).length;

    return NextResponse.json({
      invoices: invoices.map((invoice) => ({
        id: invoice.id,
        stripeInvoiceId: invoice.stripeInvoiceId,
        amount: invoice.amount,
        currency: invoice.currency,
        status: invoice.status,
        invoiceNumber: invoice.invoiceNumber,
        description: invoice.description,
        pdfUrl: invoice.pdfUrl,
        hostedInvoiceUrl: invoice.hostedInvoiceUrl,
        billingReason: invoice.billingReason,
        dueDate: invoice.dueDate,
        paidAt: invoice.paidAt,
        createdAt: invoice.createdAt,
      })),
      stats: {
        total: totalInvoices,
        paid: paidInvoices,
        pending: pendingInvoices,
        totalPaid: totalPaid,
      },
      pagination: {
        limit,
        offset,
        hasMore: invoices.length === limit,
      },
    });
  } catch (error) {
    console.error("Error fetching invoices:", error);
    return NextResponse.json(
      { error: "Error al obtener las facturas" },
      { status: 500 }
    );
  }
}
