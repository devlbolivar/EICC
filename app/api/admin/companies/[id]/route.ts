import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "@/config/schema";
import { verifyAdminAuth } from "@/lib/admin-auth";
import { validateCompanyData, validateUUID } from "@/lib/validation";
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

    const { id } = params;

    // ===== VALIDAR UUID =====
    const idValidation = validateUUID(id, 'ID de empresa');
    if (!idValidation.isValid) {
      return NextResponse.json(
        { error: idValidation.errors?.[0] || 'ID inválido' },
        { status: 400 }
      );
    }

    const body = await request.json();

    // ===== VALIDAR DATOS DE EMPRESA =====
    const validation = validateCompanyData({
      name: body.name,
      rut: body.rut,
      email: body.email,
      phone: body.phone,
      website: body.website,
      industry: body.industry,
      size: body.size,
      description: body.description,
    });

    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.errors?.[0] || 'Datos inválidos' },
        { status: 400 }
      );
    }

    const updatedCompany = await db
      .update(schema.companiesTable)
      .set({
        ...validation.data,
        isActive: body.isActive !== undefined ? body.isActive : undefined,
        updatedAt: new Date(),
      })
      .where(eq(schema.companiesTable.id, id))
      .returning();

    if (!updatedCompany.length) {
      return NextResponse.json(
        { error: 'Empresa no encontrada' },
        { status: 404 }
      );
    }

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

    const { id} = params;

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
