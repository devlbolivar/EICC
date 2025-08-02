import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/database";
import * as schema from "@/config/schema";
import { eq } from "drizzle-orm";
import { sql } from "drizzle-orm";
import { verifyAccessToken } from "@/lib/auth";
import { Permission } from "@/app/types";

export async function GET() {
  try {
    // ===== EXTRAER TOKEN =====
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Token no encontrado" },
        { status: 401 }
      );
    }

    // ===== VERIFICAR TOKEN =====
    const payload = verifyAccessToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    }

    // ===== OBTENER USUARIO =====
    const user = await db.query.usersTable.findFirst({
      where: eq(schema.usersTable.id, payload.userId),
    });

    if (!user || !user.isActive) {
      return NextResponse.json(
        { error: "Usuario no encontrado o inactivo" },
        { status: 401 }
      );
    }

    // ===== OBTENER COMPAÑÍAS Y ROLES =====
    const userCompaniesResult = await db.execute(
      sql`
        SELECT 
          uc.id,
          uc."userId",
          uc."companyId",
          uc."roleId",
          uc."isActive",
          uc."joinedAt",
          uc."invitedBy",
          uc."acceptedAt",
          c.id as company_id,
          c.name as company_name,
          c.rut as company_rut,
          c.description as company_description,
          c.logo as company_logo,
          c.website as company_website,
          c.industry as company_industry,
          c.size as company_size,
          c."isActive" as company_is_active,
          c."subscriptionPlan" as company_subscription_plan,
          c."subscriptionExpiresAt" as company_subscription_expires_at,
          c."createdAt" as company_created_at,
          c."updatedAt" as company_updated_at,
          r.id as role_id,
          r.name as role_name,
          r.description as role_description,
          r.permissions as role_permissions,
          r."isSystemRole" as role_is_system_role,
          r."createdAt" as role_created_at,
          r."updatedAt" as role_updated_at
        FROM user_companies uc
        LEFT JOIN companies c ON uc."companyId" = c.id
        LEFT JOIN roles r ON uc."roleId" = r.id
        WHERE uc."userId" = ${user.id} AND uc."isActive" = true
      `
    );

    const userCompanies = userCompaniesResult.rows.map((row) => ({
      id: row.id,
      userId: row.userId,
      companyId: row.companyId,
      roleId: row.roleId,
      isActive: row.isActive,
      joinedAt: row.joinedAt,
      invitedBy: row.invitedBy,
      acceptedAt: row.acceptedAt,
      company: row.company_id
        ? {
            id: row.company_id,
            name: row.company_name,
            rut: row.company_rut,
            description: row.company_description,
            logo: row.company_logo,
            website: row.company_website,
            industry: row.company_industry,
            size: row.company_size,
            isActive: row.company_is_active,
            subscriptionPlan: row.company_subscription_plan,
            subscriptionExpiresAt: row.company_subscription_expires_at,
            createdAt: row.company_created_at,
            updatedAt: row.company_updated_at,
          }
        : null,
      role: {
        id: row.role_id,
        name: row.role_name,
        description: row.role_description,
        permissions: row.role_permissions,
        isSystemRole: row.role_is_system_role,
        createdAt: row.role_created_at,
        updatedAt: row.role_updated_at,
      },
    }));

    // ===== DETERMINAR COMPAÑÍA Y ROL ACTUAL =====
    let currentCompany = null;
    let currentRole = null;
    let permissions = payload.permissions;

    if (payload.companyId && payload.roleId) {
      // Buscar la compañía y rol específicos del token
      const userComp = userCompanies.find(
        (uc) =>
          uc.companyId === payload.companyId && uc.roleId === payload.roleId
      );

      if (userComp) {
        currentCompany = userComp.company;
        currentRole = userComp.role;
      }
    } else if (userCompanies.length > 0) {
      // Si no hay compañía específica en el token, usar la primera
      currentCompany = userCompanies[0].company;
      currentRole = userCompanies[0].role;
      if (currentRole && currentRole.permissions) {
        permissions = currentRole.permissions as Permission[];
      }
    }

    // ===== CONSTRUIR SESIÓN =====
    const session = {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        emailVerified: user.emailVerified,
        avatar: user.avatar,
        isActive: user.isActive,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      userCompanies: userCompanies.map((uc) => ({
        id: uc.id,
        userId: uc.userId,
        companyId: uc.companyId,
        roleId: uc.roleId,
        isActive: uc.isActive,
        joinedAt: uc.joinedAt,
        invitedBy: uc.invitedBy,
        acceptedAt: uc.acceptedAt,
        company: uc.company,
        role: uc.role,
      })),
      currentCompany,
      currentRole,
      permissions,
    };

    return NextResponse.json({
      success: true,
      data: session,
    });
  } catch (error) {
    console.error("Error validando sesión:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
