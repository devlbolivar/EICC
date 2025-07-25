import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import db from "@/config/db";
import { usersTable, userCompaniesTable } from "@/config/schema";
import { eq, and } from "drizzle-orm";
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
      where: eq(usersTable.id, payload.userId),
    });

    if (!user || !user.isActive) {
      return NextResponse.json(
        { error: "Usuario no encontrado o inactivo" },
        { status: 401 }
      );
    }

    // ===== OBTENER COMPAÑÍAS Y ROLES =====
    const userCompanies = await db.query.userCompaniesTable.findMany({
      where: and(
        eq(userCompaniesTable.userId, user.id),
        eq(userCompaniesTable.isActive, true)
      ),
      with: {
        company: true,
        role: true,
      },
    });

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
