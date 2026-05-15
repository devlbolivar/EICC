import { requireCsrf } from "@/lib/csrf";
import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "@/config/schema";
import { verifyAccessToken } from "@/lib/auth";
import { eq, and } from "drizzle-orm";

const pg = neon(process.env.DATABASE_URL!);
const db = drizzle(pg, { schema });

export async function POST(request: NextRequest) {
    const csrfResult = await requireCsrf(request);
    if (csrfResult) return csrfResult;

  try {
    // ===== VERIFICAR AUTENTICACIÓN =====
    const token =
      request.headers.get("authorization")?.replace("Bearer ", "") ||
      request.cookies.get("accessToken")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Token de acceso requerido" },
        { status: 401 }
      );
    }

    const payload = verifyAccessToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: "Token de acceso inválido" },
        { status: 401 }
      );
    }

    // ===== OBTENER USUARIO =====
    const user = await db.query.usersTable.findFirst({
      where: eq(schema.usersTable.id, payload.userId),
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // ===== VERIFICAR SI YA TIENE UNA EMPRESA =====
    const existingUserCompany = await db
      .select()
      .from(schema.userCompaniesTable)
      .where(
        and(
          eq(schema.userCompaniesTable.userId, user.id),
          eq(schema.userCompaniesTable.isActive, true)
        )
      )
      .limit(1);

    if (existingUserCompany.length > 0 && existingUserCompany[0].companyId) {
      return NextResponse.json(
        { error: "Ya tienes una empresa asociada" },
        { status: 400 }
      );
    }

    // ===== OBTENER DATOS DEL BODY =====
    const { name, taxId, taxIdType, description } = await request.json();

    if (!name || !taxId) {
      return NextResponse.json(
        { error: "Nombre e identificación fiscal son requeridos" },
        { status: 400 }
      );
    }

    // ===== VERIFICAR SI EL ID FISCAL YA EXISTE =====
    const existingCompany = await db.query.companiesTable.findFirst({
      where: eq(schema.companiesTable.rut, taxId),
    });

    if (existingCompany) {
      return NextResponse.json(
        { error: "El número de identificación fiscal ya está registrado" },
        { status: 409 }
      );
    }

    // ===== CREAR EMPRESA =====
    const newCompany = await db
      .insert(schema.companiesTable)
      .values({
        name,
        rut: taxId, // Store the tax ID in the rut field for backward compatibility
        taxIdType: taxIdType || "rut", // Store the tax ID type
        description: description || null,
        isActive: true,
        subscriptionPlan: "free",
      })
      .returning();

    // ===== ACTUALIZAR O CREAR RELACIÓN USUARIO-EMPRESA =====
    if (existingUserCompany.length > 0) {
      // Update existing user_companies record
      await db
        .update(schema.userCompaniesTable)
        .set({ companyId: newCompany[0].id })
        .where(eq(schema.userCompaniesTable.id, existingUserCompany[0].id));
    } else {
      // Create new user_companies record
      const companyRole = await db.query.rolesTable.findFirst({
        where: eq(schema.rolesTable.name, "company"),
      });

      if (!companyRole) {
        return NextResponse.json(
          { error: "No se encontró el rol de empresa" },
          { status: 500 }
        );
      }

      await db.insert(schema.userCompaniesTable).values({
        userId: user.id,
        companyId: newCompany[0].id,
        roleId: companyRole.id,
        isActive: true,
      });
    }

    return NextResponse.json({
      success: true,
      data: newCompany[0],
      message: "Empresa creada exitosamente",
    });
  } catch (error) {
    console.error("Error creando empresa para usuario:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
