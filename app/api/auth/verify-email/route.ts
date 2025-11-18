import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq } from "drizzle-orm";
import * as schema from "@/config/schema";
import {
  generateEmailVerificationToken,
  isExpired,
  TOKEN_EXPIRY,
} from "@/lib/auth";
import { sendVerificationEmail } from "@/lib/email-service";
import { validateAndSanitizeEmail } from "@/lib/utils";

const pg = neon(process.env.DATABASE_URL!);
const db = drizzle(pg, { schema });

// GET - Verify email with token
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { error: "Token de verificación requerido" },
        { status: 400 }
      );
    }

    // Find user with this verification token
    const user = await db.query.usersTable.findFirst({
      where: (fields, { eq }) => eq(fields.emailVerificationToken, token),
    });

    if (!user) {
      return NextResponse.json(
        { error: "Token de verificación inválido o expirado" },
        { status: 400 }
      );
    }

    // Check if already verified
    if (user.emailVerified) {
      return NextResponse.json({
        success: true,
        message: "Email ya verificado",
        alreadyVerified: true,
      });
    }

    // Check if token has expired
    if (user.emailVerificationExpires && isExpired(user.emailVerificationExpires)) {
      return NextResponse.json(
        { error: "Token de verificación expirado. Por favor solicita uno nuevo." },
        { status: 400 }
      );
    }

    // Update user as verified
    await db
      .update(schema.usersTable)
      .set({
        emailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpires: null,
        updatedAt: new Date(),
      })
      .where(eq(schema.usersTable.id, user.id));

    return NextResponse.json({
      success: true,
      message: "Email verificado exitosamente",
      alreadyVerified: false,
    });
  } catch (error) {
    console.error("Email verification error:", error);
    return NextResponse.json(
      { error: "Error al verificar email" },
      { status: 500 }
    );
  }
}

// POST - Resend verification email
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Email es requerido" },
        { status: 400 }
      );
    }

    // Sanitize email
    const sanitizedEmail = validateAndSanitizeEmail(email);
    if (!sanitizedEmail) {
      return NextResponse.json(
        { error: "Email inválido" },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await db.query.usersTable.findFirst({
      where: (fields, { eq }) => eq(fields.email, sanitizedEmail),
    });

    // For security, don't reveal if email exists
    if (!user) {
      return NextResponse.json({
        success: true,
        message: "Si el email existe, se enviará un enlace de verificación",
      });
    }

    // If already verified
    if (user.emailVerified) {
      return NextResponse.json({
        success: true,
        message: "Email ya está verificado",
        alreadyVerified: true,
      });
    }

    // Generate new verification token
    const verificationToken = generateEmailVerificationToken();
    const verificationExpires = new Date(Date.now() + TOKEN_EXPIRY.EMAIL_VERIFICATION);

    // Update user with new token
    await db
      .update(schema.usersTable)
      .set({
        emailVerificationToken: verificationToken,
        emailVerificationExpires: verificationExpires,
        updatedAt: new Date(),
      })
      .where(eq(schema.usersTable.id, user.id));

    // Send verification email
    await sendVerificationEmail(user.email, user.name, verificationToken);

    return NextResponse.json({
      success: true,
      message: "Email de verificación enviado",
    });
  } catch (error) {
    console.error("Resend verification error:", error);
    return NextResponse.json(
      { error: "Error al reenviar email de verificación" },
      { status: 500 }
    );
  }
}
