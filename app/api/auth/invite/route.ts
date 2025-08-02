import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "@/config/schema";
import {
  generateInvitationToken,
  addDays,
  sanitizeEmail,
  validateEmail,
} from "@/lib/auth";
import { verifyAccessToken } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { ERROR_MESSAGES } from "@/lib/constants";

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

    // ===== VERIFICAR PERMISOS =====
    const hasInvitePermission = payload.permissions.includes("users:invite");
    if (!hasInvitePermission) {
      return NextResponse.json(
        { error: "No tienes permisos para invitar usuarios" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { email, roleName, companyId } = body;

    // ===== VALIDACIONES BÁSICAS =====
    if (!email || !roleName || !companyId) {
      return NextResponse.json(
        { error: "Email, rol y empresa son requeridos" },
        { status: 400 }
      );
    }

    const sanitizedEmail = sanitizeEmail(email);
    if (!validateEmail(sanitizedEmail)) {
      return NextResponse.json({ error: "Email inválido" }, { status: 400 });
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

    // ===== VERIFICAR QUE EL USUARIO TIENE ACCESO A LA EMPRESA =====
    if (payload.companyId !== companyId) {
      return NextResponse.json(
        { error: "No tienes acceso a esta empresa" },
        { status: 403 }
      );
    }

    // ===== OBTENER ROL =====
    const role = await db.query.rolesTable.findFirst({
      where: (roles, { eq }) => eq(roles.name, roleName),
    });

    if (!role) {
      return NextResponse.json({ error: "Rol no encontrado" }, { status: 404 });
    }

    // ===== VERIFICAR QUE NO HAY UNA INVITACIÓN PENDIENTE =====
    const existingInvitation = await db.query.invitationTokensTable.findFirst({
      where: (invitations, { and, eq }) =>
        and(
          eq(invitations.email, sanitizedEmail),
          eq(invitations.companyId, companyId),
          eq(invitations.isUsed, false)
        ),
    });

    if (existingInvitation) {
      return NextResponse.json(
        { error: "Ya existe una invitación pendiente para este email" },
        { status: 409 }
      );
    }

    // ===== VERIFICAR QUE EL USUARIO NO ESTÁ YA EN LA EMPRESA =====
    const existingUserCompany = await db.query.userCompaniesTable.findFirst({
      where: (userCompanies, { and, eq }) =>
        and(
          eq(userCompanies.companyId, companyId),
          eq(userCompanies.isActive, true)
        ),
      with: {
        user: true,
      },
    });

    if (
      existingUserCompany &&
      existingUserCompany.user?.email === sanitizedEmail
    ) {
      return NextResponse.json(
        { error: "El usuario ya pertenece a esta empresa" },
        { status: 409 }
      );
    }

    // ===== GENERAR TOKEN DE INVITACIÓN =====
    const invitationToken = generateInvitationToken();
    const expiresAt = addDays(new Date(), 7); // 7 días

    // ===== CREAR INVITACIÓN =====
    const [invitation] = await db
      .insert(schema.invitationTokensTable)
      .values({
        email: sanitizedEmail,
        companyId,
        roleId: role.id,
        token: invitationToken,
        invitedBy: payload.userId,
        expiresAt,
        isUsed: false,
      })
      .returning();

    // ===== ENVIAR EMAIL DE INVITACIÓN =====
    // Envío de email de invitación
    const invitationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/accept-invite?token=${invitationToken}`;

    console.log("Invitación enviada:", {
      to: sanitizedEmail,
      company: company.name,
      role: role.name,
      url: invitationUrl,
      expiresAt,
    });

    return NextResponse.json({
      success: true,
      message: "Invitación enviada exitosamente",
      data: {
        invitation: {
          id: invitation.id,
          email: invitation.email,
          role: role.name,
          expiresAt: invitation.expiresAt,
        },
        invitationUrl, // Solo para desarrollo, en producción se envía por email
      },
    });
  } catch (error) {
    console.error("Error enviando invitación:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
