import { NextRequest, NextResponse } from "next/server";
import { db } from "@/config/db";
import { usersTable } from "@/config/schema";
import { eq, and, gt } from "drizzle-orm";
import { hashPassword, validatePassword } from "@/lib/auth";
import { authRateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 5 intentos por 15 minutos
    const rateLimitResponse = await authRateLimit(request);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const { token, password } = await request.json();

    // Validaciones básicas
    if (!token || typeof token !== "string") {
      return NextResponse.json(
        { error: "Token requerido" },
        { status: 400 }
      );
    }

    if (!password || typeof password !== "string") {
      return NextResponse.json(
        { error: "Contraseña requerida" },
        { status: 400 }
      );
    }

    // Validar fortaleza de contraseña
    const validation = validatePassword(password);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.errors[0] },
        { status: 400 }
      );
    }

    // Buscar usuario con token válido y no expirado
    const user = await db.query.usersTable.findFirst({
      where: and(
        eq(usersTable.resetPasswordToken, token),
        gt(usersTable.resetPasswordExpires, new Date())
      ),
    });

    if (!user) {
      return NextResponse.json(
        {
          error:
            "Token inválido o expirado. Por favor solicita un nuevo enlace de reseteo",
        },
        { status: 400 }
      );
    }

    // Hash de la nueva contraseña
    const passwordHash = await hashPassword(password);

    // Actualizar contraseña y limpiar tokens de reset
    await db
      .update(usersTable)
      .set({
        passwordHash,
        resetPasswordToken: null,
        resetPasswordExpires: null,
        updatedAt: new Date(),
      })
      .where(eq(usersTable.id, user.id));

    return NextResponse.json({
      success: true,
      message: "Contraseña actualizada exitosamente. Ya puedes iniciar sesión",
    });
  } catch (error) {
    console.error("Error en reset-password:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
