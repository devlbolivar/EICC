import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import db from "@/config/db";
import {
  userOrganizationsTable,
  usersTable,
  rolesTable,
  organizationsTable,
} from "@/config/schema";
import { eq, and } from "drizzle-orm";
import { generateTokenPair } from "@/lib/auth";
import { Permission } from "@/app/types";
import { InferSelectModel } from "drizzle-orm";

type UserOrganization = InferSelectModel<typeof userOrganizationsTable> & {
  organization?: InferSelectModel<typeof organizationsTable>;
  role?: InferSelectModel<typeof rolesTable>;
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { organizationId } = body;

    // ===== EXTRAER USUARIO DEL HEADER (SETEADO POR EL MIDDLEWARE) =====
    const userId = request.headers.get("x-user-id");
    const userEmail = request.headers.get("x-user-email");
    const userName = request.headers.get("x-user-name");

    if (!userId || !userEmail || !userName) {
      return NextResponse.json(
        { error: "Usuario no autenticado" },
        { status: 401 }
      );
    }

    // ===== VERIFICAR QUE EL USUARIO PERTENEZCA A LA ORGANIZACIÓN =====
    const userOrg = (await db.query.userOrganizationsTable.findFirst({
      where: and(
        eq(userOrganizationsTable.userId, userId),
        eq(userOrganizationsTable.organizationId, organizationId),
        eq(userOrganizationsTable.isActive, true)
      ),
      with: {
        organization: true,
        role: true,
      },
    })) as UserOrganization;

    if (!userOrg) {
      return NextResponse.json(
        { error: "No tienes acceso a esta organización" },
        { status: 403 }
      );
    }

    // ===== OBTENER TODAS LAS ORGANIZACIONES DEL USUARIO =====
    const userOrganizations = await db.query.userOrganizationsTable.findMany({
      where: and(
        eq(userOrganizationsTable.userId, userId),
        eq(userOrganizationsTable.isActive, true)
      ),
      with: {
        organization: true,
        role: true,
      },
    });

    // ===== GENERAR NUEVOS TOKENS CON LA NUEVA ORGANIZACIÓN =====
    const permissions = (userOrg.role?.permissions as Permission[]) || [];

    const tokenPayload = {
      userId,
      email: userEmail,
      name: userName,
      organizationId: userOrg.organizationId || undefined,
      roleId: userOrg.roleId,
      permissions,
    };

    const { accessToken, refreshToken } = generateTokenPair(tokenPayload);

    // ===== CONFIGURAR COOKIES =====
    const cookieStore = await cookies();

    // Cookie de acceso (httpOnly, secure en producción)
    cookieStore.set("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 días
      path: "/",
    });

    // Cookie de refresh (httpOnly, secure en producción)
    cookieStore.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60, // 30 días
      path: "/",
    });

    // ===== CONSTRUIR SESIÓN =====
    const user = await db.query.usersTable.findFirst({
      where: eq(usersTable.id, userId),
    });

    const session = {
      user: {
        id: user?.id,
        email: user?.email,
        name: user?.name,
        emailVerified: user?.emailVerified,
        avatar: user?.avatar,
        isActive: user?.isActive,
        lastLoginAt: user?.lastLoginAt,
        createdAt: user?.createdAt,
        updatedAt: user?.updatedAt,
      },
      userOrganizations: userOrganizations.map((uo) => ({
        id: uo.id,
        userId: uo.userId,
        organizationId: uo.organizationId,
        roleId: uo.roleId,
        isActive: uo.isActive,
        joinedAt: uo.joinedAt,
        invitedBy: uo.invitedBy,
        acceptedAt: uo.acceptedAt,
        organization: uo.organization,
        role: uo.role,
      })),
      currentOrganization: userOrg.organization,
      currentRole: userOrg.role,
      permissions,
    };

    return NextResponse.json({
      success: true,
      message: "Organización cambiada exitosamente",
      data: {
        accessToken,
        refreshToken,
        session,
      },
    });
  } catch (error) {
    console.error("Error cambiando organización:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
