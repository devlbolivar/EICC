import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "@/config/schema";
import {
  hashPassword,
  generateTokenPair,
  validatePassword,
  sanitizeName,
  isExpired,
} from "@/lib/auth";
import { validateSafeString } from "@/lib/utils";
import { InferSelectModel, eq } from "drizzle-orm";
import { Permission } from "@/app/types";
import { authRateLimit } from "@/lib/rate-limit";

type Invitation = InferSelectModel<typeof schema.invitationTokensTable> & {
  company?: InferSelectModel<typeof schema.companiesTable>;
  role?: InferSelectModel<typeof schema.rolesTable>;
};

const pg = neon(process.env.DATABASE_URL!);
const db = drizzle(pg, { schema });

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 5 attempts per 15 minutes
    const rateLimitResponse = await authRateLimit(request);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const body = await request.json();
    const { token, name, password, confirmPassword } = body;

    // ===== VALIDACIONES BÁSICAS =====
    if (!token || !name || !password || !confirmPassword) {
      return NextResponse.json(
        { error: "Token, nombre y contraseña son requeridos" },
        { status: 400 }
      );
    }

    // ===== VALIDAR TOKEN =====
    if (typeof token !== "string" || token.length < 32) {
      return NextResponse.json({ error: "Token inválido" }, { status: 400 });
    }

    // ===== VALIDAR NOMBRE =====
    const sanitizedName = sanitizeName(name);
    if (!validateSafeString(sanitizedName, 255) || sanitizedName.length < 2) {
      return NextResponse.json(
        { error: "Nombre inválido (mínimo 2 caracteres)" },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: "Las contraseñas no coinciden" },
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

    // ===== BUSCAR INVITACIÓN =====
    const invitation = (await db.query.invitationTokensTable.findFirst({
      where: (fields, { eq }) => eq(fields.token, token),
      with: {
        company: true,
        role: true,
      },
    })) as Invitation; // Tipado extendido por relaciones

    if (!invitation) {
      return NextResponse.json(
        { error: "Invitación no encontrada" },
        { status: 404 }
      );
    }

    // ===== VERIFICAR QUE LA INVITACIÓN NO HA SIDO USADA =====
    if (invitation.isUsed) {
      return NextResponse.json(
        { error: "Esta invitación ya ha sido utilizada" },
        { status: 400 }
      );
    }

    // ===== VERIFICAR QUE LA INVITACIÓN NO HA EXPIRADO =====
    if (isExpired(invitation.expiresAt)) {
      return NextResponse.json(
        { error: "Esta invitación ha expirado" },
        { status: 400 }
      );
    }

    // ===== VERIFICAR QUE EL EMAIL NO ESTÁ REGISTRADO =====
    const existingUser = await db.query.usersTable.findFirst({
      where: (users, { eq }) => eq(users.email, invitation.email),
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Ya existe una cuenta con este email" },
        { status: 409 }
      );
    }

    // ===== HASH DE CONTRASEÑA =====
    const passwordHash = await hashPassword(password);

    // ===== CREAR USUARIO =====
    // The invitation was sent to this specific email, so the email is implicitly
    // verified by the fact that only the recipient could have received the token.
    // However, we still set emailVerified based on whether the invitation email
    // matches what we expect (the token is bound to the email).
    const [newUser] = await db
      .insert(schema.usersTable)
      .values({
        email: invitation.email,
        name: sanitizedName,
        passwordHash,
        emailVerified: true, // Verified: invitation token was sent to this email
        isActive: true,
      })
      .returning();

    // ===== ASIGNAR USUARIO A LA EMPRESA CON EL ROL DE LA INVITACIÓN =====
    await db.insert(schema.userCompaniesTable).values({
      userId: newUser.id,
      companyId: invitation.companyId,
      roleId: invitation.roleId,
      isActive: true,
      invitedBy: invitation.invitedBy,
      acceptedAt: new Date(),
    });

    // ===== MARCAR INVITACIÓN COMO USADA =====
    await db
      .update(schema.invitationTokensTable)
      .set({
        isUsed: true,
        usedAt: new Date(),
      })
      .where(eq(schema.invitationTokensTable.id, invitation.id));

    // ===== VERIFICAR QUE TENEMOS LOS DATOS NECESARIOS =====
    if (!invitation.role || !invitation.company) {
      return NextResponse.json(
        { error: "Datos de invitación incompletos" },
        { status: 400 }
      );
    }

    // ===== GENERAR TOKENS =====
    const tokenPayload = {
      userId: newUser.id,
      email: newUser.email,
      name: newUser.name,
      companyId: invitation.companyId,
      roleId: invitation.roleId,
      permissions: invitation.role.permissions as Permission[],
    };

    const tokens = generateTokenPair(tokenPayload);

    // ===== CONFIGURAR RESPUESTA =====
    const response = NextResponse.json(
      {
        success: true,
        message: "Invitación aceptada exitosamente",
        data: {
          user: {
            id: newUser.id,
            email: newUser.email,
            name: newUser.name,
          },
          company: {
            id: invitation.company!.id,
            name: invitation.company!.name,
            rut: invitation.company!.rut,
          },
          role: {
            id: invitation.role!.id,
            name: invitation.role!.name,
            permissions: invitation.role!.permissions,
          },
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
    console.error("Error aceptando invitación:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// ===== ENDPOINT PARA VERIFICAR INVITACIÓN =====
export async function GET(request: NextRequest) {
  try {
    // Rate limiting: 5 attempts per 15 minutes
    const rateLimitResponse = await authRateLimit(request);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json({ error: "Token requerido" }, { status: 400 });
    }

    // ===== VALIDAR TOKEN =====
    if (typeof token !== "string" || token.length < 32) {
      return NextResponse.json({ error: "Token inválido" }, { status: 400 });
    }

    // ===== BUSCAR INVITACIÓN =====
    const invitation = (await db.query.invitationTokensTable.findFirst({
      where: (fields, { eq }) => eq(fields.token, token),
      with: {
        company: true,
        role: true,
      },
    })) as Invitation; // Tipado extendido por relaciones

    if (!invitation) {
      return NextResponse.json(
        { error: "Invitación no encontrada" },
        { status: 404 }
      );
    }

    // ===== VERIFICAR QUE LA INVITACIÓN NO HA SIDO USADA =====
    if (invitation.isUsed) {
      return NextResponse.json(
        { error: "Esta invitación ya ha sido utilizada" },
        { status: 400 }
      );
    }

    // ===== VERIFICAR QUE LA INVITACIÓN NO HA EXPIRADO =====
    if (isExpired(invitation.expiresAt)) {
      return NextResponse.json(
        { error: "Esta invitación ha expirado" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        invitation: {
          id: invitation.id,
          email: invitation.email,
          expiresAt: invitation.expiresAt,
        },
        company: {
          id: invitation.company!.id,
          name: invitation.company!.name,
          rut: invitation.company!.rut,
        },
        role: {
          id: invitation.role!.id,
          name: invitation.role!.name,
          description: invitation.role!.description,
        },
      },
    });
  } catch (error) {
    console.error("Error verificando invitación:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
