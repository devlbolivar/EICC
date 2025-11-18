import { NextRequest, NextResponse } from "next/server";
import { db } from "@/config/db";
import { usersTable } from "@/config/schema";
import { eq } from "drizzle-orm";
import { generatePasswordResetToken, addHours } from "@/lib/auth";
import { sendPasswordResetEmail } from "@/lib/email-service";
import { authRateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 5 intentos por 15 minutos
    const rateLimitResponse = await authRateLimit(request);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const { email } = await request.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email requerido" },
        { status: 400 }
      );
    }

    const sanitizedEmail = email.toLowerCase().trim();

    // Buscar usuario
    const user = await db.query.usersTable.findFirst({
      where: eq(usersTable.email, sanitizedEmail),
    });

    // IMPORTANTE: Siempre retornar éxito para prevenir enumeración de usuarios
    // No revelar si el email existe o no en la base de datos
    if (!user) {
      return NextResponse.json({
        success: true,
        message:
          "Si el email existe en nuestro sistema, recibirás instrucciones para resetear tu contraseña",
      });
    }

    // Generar token de reset
    const resetToken = generatePasswordResetToken();
    const resetExpires = addHours(new Date(), 1); // Token válido por 1 hora

    // Guardar token en base de datos
    await db
      .update(usersTable)
      .set({
        resetPasswordToken: resetToken,
        resetPasswordExpires: resetExpires,
        updatedAt: new Date(),
      })
      .where(eq(usersTable.id, user.id));

    // Enviar email con instrucciones
    try {
      await sendPasswordResetEmail(user.email, resetToken, user.name);
    } catch {
      // No fallar si el email no se puede enviar
      // En producción, esto debería ir a un sistema de monitoreo
    }

    return NextResponse.json({
      success: true,
      message:
        "Si el email existe en nuestro sistema, recibirás instrucciones para resetear tu contraseña",
    });
  } catch {
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
