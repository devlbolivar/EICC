import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "@/config/schema";
import { verifyAccessToken } from "@/lib/auth";
import { requireCsrf } from "@/lib/csrf";
import { eq, and } from "drizzle-orm";

const pg = neon(process.env.DATABASE_URL!);
const db = drizzle(pg, { schema });

export async function GET(request: NextRequest) {
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

    console.log("User ID:", user.id);

    // ===== OBTENER RELACIÓN USUARIO-EMPRESA ACTIVA =====
    const userCompanyResult = await db
      .select()
      .from(schema.userCompaniesTable)
      .where(
        and(
          eq(schema.userCompaniesTable.userId, user.id),
          eq(schema.userCompaniesTable.isActive, true)
        )
      )
      .limit(1);

    console.log("User company result:", userCompanyResult);

    if (userCompanyResult.length === 0) {
      // Check if user has any company relationships (active or inactive)
      const allUserCompanies = await db
        .select()
        .from(schema.userCompaniesTable)
        .where(eq(schema.userCompaniesTable.userId, user.id));

      console.log("All user companies:", allUserCompanies);

      return NextResponse.json(
        {
          error: "No se encontró una empresa activa asociada",
          debug: {
            userId: user.id,
            hasAnyCompanies: allUserCompanies.length > 0,
            companies: allUserCompanies.map((uc) => ({
              id: uc.id,
              companyId: uc.companyId,
              isActive: uc.isActive,
              roleId: uc.roleId,
            })),
          },
        },
        { status: 404 }
      );
    }

    const userCompany = userCompanyResult[0];

    // Check if companyId is null
    if (!userCompany.companyId) {
      return NextResponse.json(
        {
          error: "No estás asociado a ninguna empresa",
          code: "NO_COMPANY_ASSOCIATED",
          message:
            "Tu cuenta tiene permisos de empresa pero no estás asociado a ninguna empresa específica. Por favor, contacta al administrador o crea una nueva empresa.",
          debug: {
            userCompanyId: userCompany.id,
            companyId: userCompany.companyId,
            roleId: userCompany.roleId,
          },
        },
        { status: 404 }
      );
    }

    // ===== OBTENER DATOS DE LA EMPRESA =====
    const company = await db.query.companiesTable.findFirst({
      where: eq(schema.companiesTable.id, userCompany.companyId),
    });

    console.log("Company data:", company);

    if (!company) {
      return NextResponse.json(
        {
          error: "No se encontró la empresa con el ID especificado",
          debug: {
            companyId: userCompany.companyId,
            userCompanyId: userCompany.id,
          },
        },
        { status: 404 }
      );
    }

    // ===== OBTENER ROL DEL USUARIO =====
    const role = await db.query.rolesTable.findFirst({
      where: eq(schema.rolesTable.id, userCompany.roleId),
    });

    if (!role) {
      return NextResponse.json(
        { error: "No se encontró el rol del usuario" },
        { status: 404 }
      );
    }

    // ===== VERIFICAR PERMISOS DE COMPANY =====
    const hasCompanyPermissions =
      Array.isArray(role.permissions) &&
      role.permissions.some(
        (permission: string) =>
          permission === "company:admin" ||
          permission === "company:write" ||
          permission === "company:read"
      );

    if (!hasCompanyPermissions) {
      return NextResponse.json(
        { error: "No tienes permisos para acceder a esta información" },
        { status: 403 }
      );
    }

    // ===== PREPARAR DATOS DE LA EMPRESA =====
    const companyData = {
      id: company.id,
      name: company.name,
      rut: company.rut,
      taxIdType: company.taxIdType || "rut", // Default to "rut" for backward compatibility
      description: company.description,
      website: company.website,
      industry: company.industry,
      size: company.size,
      isActive: company.isActive,
      subscriptionPlan: company.subscriptionPlan,
      subscriptionExpiresAt: company.subscriptionExpiresAt,
      createdAt: company.createdAt,
      updatedAt: company.updatedAt,
    };

    return NextResponse.json({
      success: true,
      data: companyData,
    });
  } catch (error) {
    console.error("Error obteniendo perfil de empresa:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // ===== CSRF PROTECTION =====
    const csrfError = await requireCsrf(request);
    if (csrfError) return csrfError;

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

    // ===== OBTENER RELACIÓN USUARIO-EMPRESA ACTIVA =====
    const userCompanyResult = await db
      .select()
      .from(schema.userCompaniesTable)
      .where(
        and(
          eq(schema.userCompaniesTable.userId, user.id),
          eq(schema.userCompaniesTable.isActive, true)
        )
      )
      .limit(1);

    if (userCompanyResult.length === 0) {
      return NextResponse.json(
        { error: "No se encontró una empresa asociada" },
        { status: 404 }
      );
    }

    const userCompany = userCompanyResult[0];

    // ===== OBTENER DATOS DE LA EMPRESA =====
    const company = await db.query.companiesTable.findFirst({
      where: eq(schema.companiesTable.id, userCompany.companyId!),
    });

    if (!company) {
      return NextResponse.json(
        { error: "No se encontró la empresa asociada" },
        { status: 404 }
      );
    }

    // ===== OBTENER ROL DEL USUARIO =====
    const role = await db.query.rolesTable.findFirst({
      where: eq(schema.rolesTable.id, userCompany.roleId),
    });

    if (!role) {
      return NextResponse.json(
        { error: "No se encontró el rol del usuario" },
        { status: 404 }
      );
    }

    // ===== VERIFICAR PERMISOS DE ESCRITURA =====
    const hasWritePermissions =
      Array.isArray(role.permissions) &&
      role.permissions.some(
        (permission: string) =>
          permission === "company:admin" || permission === "company:write"
      );

    if (!hasWritePermissions) {
      return NextResponse.json(
        { error: "No tienes permisos para editar esta información" },
        { status: 403 }
      );
    }

    // ===== OBTENER DATOS DEL BODY =====
    const { name, rut, taxIdType, description, website, industry, size } =
      await request.json();

    // ===== VALIDAR DATOS REQUERIDOS =====
    if (!name || !rut) {
      return NextResponse.json(
        { error: "Nombre y RUT son requeridos" },
        { status: 400 }
      );
    }

    // ===== VERIFICAR SI EL RUT YA EXISTE (si es diferente al actual) =====
    if (rut !== company.rut) {
      const existingCompany = await db.query.companiesTable.findFirst({
        where: eq(schema.companiesTable.rut, rut),
      });

      if (existingCompany) {
        return NextResponse.json(
          { error: "El RUT ya está registrado por otra empresa" },
          { status: 409 }
        );
      }
    }

    // ===== ACTUALIZAR EMPRESA =====
    const updatedCompany = await db
      .update(schema.companiesTable)
      .set({
        name,
        rut,
        taxIdType: taxIdType || "rut",
        description: description || null,
        website: website || null,
        industry: industry || null,
        size: size || null,
        updatedAt: new Date(),
      })
      .where(eq(schema.companiesTable.id, company.id))
      .returning();

    return NextResponse.json({
      success: true,
      data: updatedCompany[0],
    });
  } catch (error) {
    console.error("Error actualizando perfil de empresa:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
