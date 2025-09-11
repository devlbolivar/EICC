import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "@/config/schema";
import { verifyAccessToken } from "@/lib/auth";
import { eq } from "drizzle-orm";

const pg = neon(process.env.DATABASE_URL!);
const db = drizzle(pg, { schema });

export async function GET(request: NextRequest) {
  try {
    // ===== VERIFICAR AUTENTICACIÓN Y PERMISOS =====
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

    // Verificar que el usuario sea admin
    const currentUser = await db
      .select()
      .from(schema.usersTable)
      .where(eq(schema.usersTable.id, payload.userId))
      .limit(1);

    if (!currentUser.length) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // Verificar permisos de admin (simplificado por ahora)
    // TODO: Implementar verificación completa de permisos

    // ===== OBTENER TODOS LOS ROLES =====
    const roles = await db
      .select()
      .from(schema.rolesTable)
      .orderBy(schema.rolesTable.name);

    // ===== FORMATEAR RESPUESTA =====
    const formattedRoles = roles.map((role) => ({
      id: role.id,
      name: role.name,
      description: role.description,
      permissions: role.permissions,
      isSystemRole: role.isSystemRole,
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
    }));

    return NextResponse.json({
      roles: formattedRoles,
    });
  } catch (error) {
    console.error("Error al obtener roles:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
