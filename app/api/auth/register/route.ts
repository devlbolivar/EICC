import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "@/config/schema";
import {
  hashPassword,
  generateTokenPair,
  validateEmail,
  validatePassword,
  sanitizeName,
  generateEmailVerificationToken,
  TOKEN_EXPIRY,
} from "@/lib/auth";
import { sendVerificationEmail } from "@/lib/email-service";
import {
  validateAndSanitizeEmail,
  sanitizeString,
  validateSafeString,
} from "@/lib/utils";
import { SYSTEM_ROLES, Permission } from "@/app/types";
import { authRateLimit } from "@/lib/rate-limit";

const pg = neon(process.env.DATABASE_URL!);
const db = drizzle(pg, { schema });

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 5 intentos por 15 minutos
    const rateLimitResponse = await authRateLimit(request);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const body = await request.json();
    const { email, name, password, confirmPassword } = body;

    // ===== VALIDACIONES BÁSICAS =====
    if (!email || !name || !password || !confirmPassword) {
      return NextResponse.json(
        { error: "Todos los campos son requeridos" },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: "Las contraseñas no coinciden" },
        { status: 400 }
      );
    }

    // ===== VALIDAR Y SANITIZAR EMAIL =====
    const sanitizedEmail = validateAndSanitizeEmail(email);
    if (!sanitizedEmail || !validateEmail(sanitizedEmail)) {
      return NextResponse.json({ error: "Email inválido" }, { status: 400 });
    }

    // ===== VALIDAR Y SANITIZAR NOMBRE =====
    const sanitizedName = sanitizeName(name);
    if (!validateSafeString(sanitizedName, 255) || sanitizedName.length < 2) {
      return NextResponse.json(
        { error: "Nombre inválido (mínimo 2 caracteres)" },
        { status: 400 }
      );
    }

    // ===== VALIDAR CONTRASEÑA =====
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        { error: "Contraseña inválida", details: passwordValidation.errors },
        { status: 400 }
      );
    }

    // ===== VERIFICAR SI EL EMAIL YA EXISTE =====
    const existingUser = await db.query.usersTable.findFirst({
      where: (fields, { eq }) => eq(fields.email, sanitizedEmail),
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "El email ya está registrado" },
        { status: 409 }
      );
    }

    // ===== HASH DE CONTRASEÑA =====
    const passwordHash = await hashPassword(password);

    // ===== GENERAR TOKEN DE VERIFICACIÓN =====
    const verificationToken = generateEmailVerificationToken();
    const verificationExpires = new Date(Date.now() + TOKEN_EXPIRY.EMAIL_VERIFICATION);

    // ===== CREAR USUARIO =====
    const [newUser] = await db
      .insert(schema.usersTable)
      .values({
        email: sanitizedEmail,
        name: sanitizedName,
        passwordHash,
        emailVerified: false,
        emailVerificationToken: verificationToken,
        emailVerificationExpires: verificationExpires,
        isActive: true,
      })
      .returning();

    // ===== OBTENER ROL STUDENT =====
    const studentRole = await db.query.rolesTable.findFirst({
      where: (roles, { eq }) => eq(roles.name, SYSTEM_ROLES.STUDENT),
    });

    if (!studentRole) {
      return NextResponse.json(
        { error: "Error interno: rol de estudiante no encontrado" },
        { status: 500 }
      );
    }

    // ===== ASIGNAR ROL STUDENT AL USUARIO =====
    // Nota: companyId es null para usuarios registrados individualmente
    await db.insert(schema.userCompaniesTable).values({
      userId: newUser.id,
      companyId: null,
      roleId: studentRole.id,
      isActive: true,
      acceptedAt: new Date(),
    });

    // ===== ENVIAR EMAIL DE VERIFICACIÓN =====
    await sendVerificationEmail(newUser.email, newUser.name, verificationToken);

    // ===== GENERAR TOKENS =====
    const tokenPayload = {
      userId: newUser.id,
      email: newUser.email,
      name: newUser.name,
      companyId: undefined, // No company association on registration
      roleId: studentRole.id,
      permissions: studentRole.permissions as Permission[],
    };

    const tokens = generateTokenPair(tokenPayload);

    // ===== CONFIGURAR COOKIES =====
    const response = NextResponse.json(
      {
        success: true,
        message: "Usuario registrado exitosamente. Por favor verifica tu email.",
        data: {
          user: {
            id: newUser.id,
            email: newUser.email,
            name: newUser.name,
          },
          company: null,
          requiresVerification: true,
        },
      },
      { status: 201 }
    );

    // ===== SETEAR COOKIES CON CONFIGURACIÓN SEGURA =====
    const isProduction = process.env.NODE_ENV === "production";

    response.cookies.set("accessToken", tokens.accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60, // 7 días
      path: "/",
    });

    response.cookies.set("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60, // 30 días
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Error en registro:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
