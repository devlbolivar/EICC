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
    const { email, name, password, confirmPassword, companyData } = body;

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

    let companyId: string | null = null;

    // ===== SI SE PROPORCIONA DATOS DE EMPRESA =====
    if (companyData) {
      const { companyName, rut, description, website, industry, size } =
        companyData;

      if (!companyName || !rut) {
        return NextResponse.json(
          { error: "Nombre de empresa y RUT son requeridos" },
          { status: 400 }
        );
      }

      // ===== VALIDAR DATOS DE EMPRESA =====
      if (!validateSafeString(companyName, 255) || companyName.length < 2) {
        return NextResponse.json(
          { error: "Nombre de empresa inválido" },
          { status: 400 }
        );
      }

      if (!validateSafeString(rut, 20)) {
        return NextResponse.json({ error: "RUT inválido" }, { status: 400 });
      }

      // ===== VERIFICAR SI EL RUT YA EXISTE =====
      const existingCompany = await db.query.companiesTable.findFirst({
        where: (fields, { eq }) => eq(fields.rut, rut),
      });

      if (existingCompany) {
        return NextResponse.json(
          { error: "El RUT ya está registrado" },
          { status: 409 }
        );
      }

      // ===== CREAR EMPRESA =====
      const [newCompany] = await db
        .insert(schema.companiesTable)
        .values({
          name: sanitizeString(companyName),
          rut: sanitizeString(rut),
          description: description ? sanitizeString(description) : null,
          website: website ? sanitizeString(website) : null,
          industry: industry ? sanitizeString(industry) : null,
          size: size ? sanitizeString(size) : null,
          isActive: true,
          subscriptionPlan: "free",
        })
        .returning();

      companyId = newCompany.id;

      // ===== OBTENER ROL COMPANY =====
      const companyRole = await db.query.rolesTable.findFirst({
        where: (roles, { eq }) => eq(roles.name, SYSTEM_ROLES.COMPANY),
      });

      if (companyRole) {
        // ===== ASIGNAR ROL COMPANY AL USUARIO EN LA EMPRESA =====
        await db.insert(schema.userCompaniesTable).values({
          userId: newUser.id,
          companyId: newCompany.id,
          roleId: companyRole.id,
          isActive: true,
          acceptedAt: new Date(),
        });
      }
    }

    // ===== ASIGNAR ROL STUDENT AL USUARIO =====
    await db.insert(schema.userCompaniesTable).values({
      userId: newUser.id,
      companyId, // null para usuarios individuales
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
      companyId: companyId || undefined,
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
          company: companyId ? { id: companyId } : null,
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
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 días
      path: "/",
    });

    response.cookies.set("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
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
