import { requireCsrf } from "@/lib/csrf";
import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "@/config/schema";
import { verifyAdminAuth } from "@/lib/admin-auth";
import { validateCompanyData, validateUUID } from "@/lib/validation";
import { handleApiError, successResponse, errorResponse } from "@/lib/api-helpers";
import { eq, and, count as drizzleCount } from "drizzle-orm";

const pg = neon(process.env.DATABASE_URL!);
const db = drizzle(pg, { schema });

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const csrfResult = await requireCsrf(request);
    if (csrfResult) return csrfResult;

  try {
    // ===== VERIFICAR AUTENTICACIÓN Y PERMISOS DE ADMIN =====
    const authResult = await verifyAdminAuth(request);
    if (!authResult.authorized) {
      return authResult.response;
    }

    const { id } = await params;

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

    return successResponse({ company: updatedCompany[0] });
  } catch (error) {
    console.error("Error al actualizar empresa:", error);
    return handleApiError(error);
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const csrfResult = await requireCsrf(request);
    if (csrfResult) return csrfResult;

  try {
    // ===== VERIFICAR AUTENTICACIÓN Y PERMISOS DE ADMIN =====
    const authResult = await verifyAdminAuth(request);
    if (!authResult.authorized) {
      return authResult.response;
    }

    const { id } = await params;

    // ===== VALIDAR UUID =====
    const idValidation = validateUUID(id, 'ID de empresa');
    if (!idValidation.isValid) {
      return NextResponse.json(
        { error: idValidation.errors?.[0] || 'ID inválido' },
        { status: 400 }
      );
    }

    // ✅ CRÍTICO: Validar dependencias antes de eliminar

    // 1. Verificar usuarios activos asociados
    const activeUsersCount = await db
      .select({ count: drizzleCount() })
      .from(schema.userCompaniesTable)
      .where(
        and(
          eq(schema.userCompaniesTable.companyId, id),
          eq(schema.userCompaniesTable.isActive, true)
        )
      );

    if (activeUsersCount[0].count > 0) {
      return errorResponse(
        `No se puede eliminar: ${activeUsersCount[0].count} usuarios activos asociados. Desactiva o reasigna los usuarios primero.`,
        400
      );
    }

    // 2. Verificar cursos asociados
    const coursesCount = await db
      .select({ count: drizzleCount() })
      .from(schema.coursesTable)
      .where(eq(schema.coursesTable.companyId, id));

    if (coursesCount[0].count > 0) {
      return errorResponse(
        `No se puede eliminar: empresa tiene ${coursesCount[0].count} cursos asociados. Elimina o reasigna los cursos primero.`,
        400
      );
    }

    // 3. Verificar que la empresa exista antes de eliminar
    const companyExists = await db
      .select()
      .from(schema.companiesTable)
      .where(eq(schema.companiesTable.id, id))
      .limit(1);

    if (!companyExists.length) {
      return errorResponse("Empresa no encontrada", 404);
    }

    // Si pasa todas las validaciones, eliminar
    await db.delete(schema.companiesTable).where(eq(schema.companiesTable.id, id));

    return successResponse({ message: "Empresa eliminada correctamente" });
  } catch (error) {
    console.error("Error al eliminar empresa:", error);
    return handleApiError(error);
  }
}
