import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/database";
import { verifyRefreshToken, generateTokenPair } from "@/lib/auth";
import { and, eq } from "drizzle-orm";
import * as schema from "@/config/schema";
import { Permission } from "@/app/types";

export async function POST(request: NextRequest) {
  try {
    // ===== OBTENER REFRESH TOKEN =====
    const refreshToken = request.cookies.get("refreshToken")?.value;

    if (!refreshToken) {
      return NextResponse.json(
        { error: "Refresh token requerido" },
        { status: 401 }
      );
    }

    // ===== VERIFICAR REFRESH TOKEN =====
    const payload = verifyRefreshToken(refreshToken);
    if (!payload) {
      return NextResponse.json(
        { error: "Refresh token inválido" },
        { status: 401 }
      );
    }

    // ===== VERIFICAR QUE EL USUARIO EXISTE Y ESTÁ ACTIVO =====
    const user = await db.query.usersTable.findFirst({
      where: (users, { eq }) => eq(users.id, payload.userId),
    });

    if (!user || !user.isActive) {
      return NextResponse.json(
        { error: "Usuario no encontrado o inactivo" },
        { status: 401 }
      );
    }

    // ===== VERIFICAR QUE EL TOKEN NO FUE EMITIDO ANTES DE UN CAMBIO DE CONTRASEÑA =====
    if (user.passwordChangedAt) {
      const iat = (payload as typeof payload & { iat?: number }).iat;
      if (iat && user.passwordChangedAt > new Date(iat * 1000)) {
        return NextResponse.json(
          { error: "Sesión inválida. Por favor inicia sesión nuevamente." },
          { status: 401 }
        );
      }
    }

    // ===== VERIFICAR QUE TENEMOS LOS DATOS NECESARIOS =====
    if (!payload.roleId) {
      return NextResponse.json(
        { error: "Token de refresh inválido: falta roleId" },
        { status: 401 }
      );
    }

    // ===== VERIFICAR QUE LA RELACIÓN USUARIO-EMPRESA EXISTE =====
    const userCompany = await db.query.userCompaniesTable.findFirst({
      where: and(
        eq(schema.userCompaniesTable.userId, payload.userId),
        eq(schema.userCompaniesTable.roleId, payload.roleId),
        eq(schema.userCompaniesTable.isActive, true)
      ),
      with: {
        role: true,
      },
    });

    if (!userCompany) {
      return NextResponse.json(
        { error: "Relación usuario-empresa no encontrada" },
        { status: 401 }
      );
    }

    // ===== GENERAR NUEVOS TOKENS =====
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      name: user.name,
      companyId: userCompany.companyId || undefined,
      roleId: userCompany.roleId,
      permissions: userCompany.role.permissions as Permission[],
    };

    const tokens = generateTokenPair(tokenPayload);

    // ===== CONFIGURAR RESPUESTA =====
    const response = NextResponse.json(
      {
        success: true,
        message: "Tokens renovados exitosamente",
      },
      { status: 200 }
    );

    // ===== ACTUALIZAR COOKIES =====
    response.cookies.set("accessToken", tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60, // 7 días
    });

    response.cookies.set("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60, // 30 días
    });

    return response;
  } catch (error) {
    console.error("Error renovando tokens:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
