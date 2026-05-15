import { requireCsrf } from "@/lib/csrf";
import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "@/config/schema";
import { verifyAccessToken } from "@/lib/auth";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { strictRateLimit } from "@/lib/rate-limit";

const pg = neon(process.env.DATABASE_URL!);
const db = drizzle(pg, { schema });

export async function PUT(request: NextRequest) {
    const csrfResult = await requireCsrf(request);
    if (csrfResult) return csrfResult;

  try {
    // Rate limiting: 10 operaciones por minuto (sensible)
    const rateLimitResponse = await strictRateLimit(request);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

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
    const { currentPassword, newPassword, confirmPassword } = body;

    // ===== VALIDACIONES =====
    if (!currentPassword || !newPassword || !confirmPassword) {
      return NextResponse.json(
        { error: "Todos los campos son requeridos" },
        { status: 400 }
      );
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { error: "Las contraseñas nuevas no coinciden" },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "La nueva contraseña debe tener al menos 6 caracteres" },
        { status: 400 }
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

    if (!user.passwordHash) {
      return NextResponse.json(
        { error: "Este usuario no tiene contraseña configurada" },
        { status: 400 }
      );
    }

    // ===== VERIFICAR CONTRASEÑA ACTUAL =====
    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      user.passwordHash
    );

    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        { error: "La contraseña actual es incorrecta" },
        { status: 400 }
      );
    }

    // ===== HASH DE LA NUEVA CONTRASEÑA =====
    const saltRounds = 12;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    // ===== ACTUALIZAR CONTRASEÑA =====
    await db
      .update(schema.usersTable)
      .set({
        passwordHash: newPasswordHash,
        updatedAt: new Date(),
      })
      .where(eq(schema.usersTable.id, payload.userId));

    return NextResponse.json({
      success: true,
      message: "Contraseña actualizada exitosamente",
    });
  } catch (error) {
    console.error("Error actualizando contraseña:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
