import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "@/config/schema";
import { verifyAdminAuth } from "@/lib/admin-auth";
import { eq } from "drizzle-orm";

const pg = neon(process.env.DATABASE_URL!);
const db = drizzle(pg, { schema });

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // ===== VERIFICAR AUTENTICACIÓN Y PERMISOS DE ADMIN =====
    const authResult = await verifyAdminAuth(request);
    if (!authResult.authorized) {
      return authResult.response;
    }
    const payload = authResult.payload;

    const { id } = params;
    const { name, rut, email, phone, address, industry, plan, isActive } = await request.json();

    const updatedCompany = await db
      .update(schema.companiesTable)
      .set({
        name,
        rut,
        email,
        phone,
        address,
        industry,
        plan,
        isActive,
        updatedAt: new Date(),
      })
      .where(eq(schema.companiesTable.id, id))
      .returning();

    return NextResponse.json({ company: updatedCompany[0] });
  } catch (error) {
    console.error("Error al actualizar empresa:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // ===== VERIFICAR AUTENTICACIÓN Y PERMISOS DE ADMIN =====
    const authResult = await verifyAdminAuth(request);
    if (!authResult.authorized) {
      return authResult.response;
    }
    const payload = authResult.payload;

    const { id } = params;

    await db.delete(schema.companiesTable).where(eq(schema.companiesTable.id, id));

    return NextResponse.json({ message: "Empresa eliminada correctamente" });
  } catch (error) {
    console.error("Error al eliminar empresa:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
