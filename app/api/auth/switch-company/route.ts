import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "@/config/schema";
import { generateTokenPair, verifyAccessToken } from "@/lib/auth";
import { Permission } from "@/app/types";

const pg = neon(process.env.DATABASE_URL!);
const db = drizzle(pg, { schema });

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { companyId } = body;

    if (!companyId) {
      return NextResponse.json(
        { error: "ID de empresa requerido" },
        { status: 400 }
      );
    }

    // ===== VERIFICAR QUE LA EMPRESA EXISTE =====
    const company = await db.query.companiesTable.findFirst({
      where: (companies, { eq }) => eq(companies.id, companyId),
    });

    if (!company) {
      return NextResponse.json(
        { error: "Empresa no encontrada" },
        { status: 404 }
      );
    }

    // ===== VERIFICAR QUE EL USUARIO PERTENECE A LA EMPRESA =====
    const userCompany = await db.query.userCompaniesTable.findFirst({
      where: (userCompanies, { and, eq }) =>
        and(
          eq(userCompanies.userId, payload.userId),
          eq(userCompanies.companyId, companyId),
          eq(userCompanies.isActive, true)
        ),
      with: {
        role: true,
      },
    });

    if (!userCompany) {
      return NextResponse.json(
        { error: "No tienes acceso a esta empresa" },
        { status: 403 }
      );
    }

    // ===== GENERAR NUEVOS TOKENS CON LA NUEVA EMPRESA =====
    const tokenPayload = {
      userId: payload.userId,
      email: payload.email,
      name: payload.name,
      companyId: companyId,
      roleId: userCompany.roleId,
      permissions: userCompany.role.permissions as Permission[],
    };

    const tokens = generateTokenPair(tokenPayload);

    // ===== CONFIGURAR RESPUESTA =====
    const response = NextResponse.json(
      {
        success: true,
        message: "Empresa cambiada exitosamente",
        data: {
          company: {
            id: company.id,
            name: company.name,
            rut: company.rut,
            description: company.description,
            website: company.website,
            industry: company.industry,
            size: company.size,
            subscriptionPlan: company.subscriptionPlan,
          },
          role: {
            id: userCompany.role.id,
            name: userCompany.role.name,
            description: userCompany.role.description,
            permissions: userCompany.role.permissions,
          },
        },
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
    console.error("Error cambiando empresa:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
