import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "@/config/schema";
import { verifyAccessToken } from "@/lib/auth";
import { eq, and, desc } from "drizzle-orm";
import { emailService } from "@/lib/email-service";

const pg = neon(process.env.DATABASE_URL!);
const db = drizzle(pg, { schema });

// ===== OBTENER ROLES DISPONIBLES =====
export async function GET(request: NextRequest) {
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

    // ===== OBTENER USUARIO Y SU EMPRESA =====
    const user = await db.query.usersTable.findFirst({
      where: eq(schema.usersTable.id, payload.userId),
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // Obtener la relación usuario-empresa activa
    const userCompany = await db
      .select()
      .from(schema.userCompaniesTable)
      .where(
        and(
          eq(schema.userCompaniesTable.userId, user.id),
          eq(schema.userCompaniesTable.isActive, true)
        )
      )
      .limit(1);

    if (userCompany.length === 0) {
      return NextResponse.json(
        { error: "Usuario no está asociado a ninguna empresa" },
        { status: 404 }
      );
    }

    const companyId = userCompany[0].companyId;
    if (!companyId) {
      return NextResponse.json(
        { error: "Usuario no está asociado a ninguna empresa" },
        { status: 404 }
      );
    }

    // ===== OBTENER INVITACIONES PENDIENTES =====
    const pendingInvitations = await db
      .select({
        id: schema.invitationTokensTable.id,
        email: schema.invitationTokensTable.email,
        token: schema.invitationTokensTable.token,
        expiresAt: schema.invitationTokensTable.expiresAt,
        isUsed: schema.invitationTokensTable.isUsed,
        createdAt: schema.invitationTokensTable.createdAt,
        roleName: schema.rolesTable.name,
        roleDescription: schema.rolesTable.description,
      })
      .from(schema.invitationTokensTable)
      .innerJoin(
        schema.rolesTable,
        eq(schema.invitationTokensTable.roleId, schema.rolesTable.id)
      )
      .where(
        and(
          eq(schema.invitationTokensTable.companyId, companyId),
          eq(schema.invitationTokensTable.isUsed, false)
        )
      )
      .orderBy(desc(schema.invitationTokensTable.createdAt));

    return NextResponse.json({
      success: true,
      data: {
        pendingInvitations,
      },
    });
  } catch (error) {
    console.error("Error al obtener datos de invitación:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error interno del servidor",
      },
      { status: 500 }
    );
  }
}

// ===== CREAR INVITACIÓN =====
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

    // ===== OBTENER USUARIO Y SU EMPRESA =====
    const user = await db.query.usersTable.findFirst({
      where: eq(schema.usersTable.id, payload.userId),
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // Obtener la relación usuario-empresa activa
    const userCompany = await db
      .select()
      .from(schema.userCompaniesTable)
      .where(
        and(
          eq(schema.userCompaniesTable.userId, user.id),
          eq(schema.userCompaniesTable.isActive, true)
        )
      )
      .limit(1);

    if (userCompany.length === 0) {
      return NextResponse.json(
        { error: "Usuario no está asociado a ninguna empresa" },
        { status: 404 }
      );
    }

    const companyId = userCompany[0].companyId;
    if (!companyId) {
      return NextResponse.json(
        { error: "Usuario no está asociado a ninguna empresa" },
        { status: 404 }
      );
    }

    // ===== OBTENER DATOS DEL BODY =====
    const body = await request.json();
    const { email, message } = body;

    // ===== VALIDACIONES =====
    if (!email) {
      return NextResponse.json(
        { error: "Email es requerido" },
        { status: 400 }
      );
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Formato de email inválido" },
        { status: 400 }
      );
    }

    // ===== OBTENER ROL POR DEFECTO (EMPLEADO) =====
    let role = await db.query.rolesTable.findFirst({
      where: eq(schema.rolesTable.name, "Empleado"),
    });

    // Si no existe el rol "Empleado", crear uno por defecto
    if (!role) {
      const [newRole] = await db
        .insert(schema.rolesTable)
        .values({
          name: "Empleado",
          description: "Rol básico para empleados de la empresa",
          permissions: ["company:read", "courses:read", "certificates:read"],
          isSystemRole: false,
        })
        .returning();
      role = newRole;
    }

    // ===== VERIFICAR QUE NO EXISTE UNA INVITACIÓN PENDIENTE =====
    const existingInvitation = await db.query.invitationTokensTable.findFirst({
      where: and(
        eq(schema.invitationTokensTable.email, email),
        eq(schema.invitationTokensTable.companyId, companyId),
        eq(schema.invitationTokensTable.isUsed, false)
      ),
    });

    if (existingInvitation) {
      return NextResponse.json(
        { error: "Ya existe una invitación pendiente para este email" },
        { status: 400 }
      );
    }

    // ===== VERIFICAR QUE EL USUARIO NO ESTÁ YA EN LA EMPRESA =====
    const existingUser = await db.query.usersTable.findFirst({
      where: eq(schema.usersTable.email, email),
    });

    if (existingUser) {
      const userInCompany = await db.query.userCompaniesTable.findFirst({
        where: and(
          eq(schema.userCompaniesTable.userId, existingUser.id),
          eq(schema.userCompaniesTable.companyId, companyId),
          eq(schema.userCompaniesTable.isActive, true)
        ),
      });

      if (userInCompany) {
        return NextResponse.json(
          { error: "Este usuario ya es miembro de la empresa" },
          { status: 400 }
        );
      }
    }

    // ===== GENERAR TOKEN DE INVITACIÓN =====
    const invitationToken = require("crypto").randomBytes(32).toString("hex");
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 días

    // ===== CREAR INVITACIÓN =====
    const [invitation] = await db
      .insert(schema.invitationTokensTable)
      .values({
        email: email.toLowerCase().trim(),
        companyId,
        roleId: role.id,
        token: invitationToken,
        invitedBy: payload.userId,
        expiresAt,
        isUsed: false,
      })
      .returning();

    // ===== GENERAR URL DE INVITACIÓN =====
    const invitationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/accept-invite?token=${invitationToken}`;

    // ===== OBTENER INFORMACIÓN DE LA EMPRESA =====
    const company = await db.query.companiesTable.findFirst({
      where: eq(schema.companiesTable.id, companyId),
    });

    // ===== ENVIAR EMAIL DE INVITACIÓN =====
    let emailSent = false;
    if (company) {
      emailSent = await emailService.sendInvitationEmail({
        recipientEmail: invitation.email,
        companyName: company.name,
        invitationUrl,
        expiresAt: invitation.expiresAt,
        customMessage: message,
      });
    }

    return NextResponse.json({
      success: true,
      message: emailSent
        ? "Invitación creada y enviada por email exitosamente"
        : "Invitación creada exitosamente (email no enviado - revisar configuración)",
      data: {
        invitation: {
          id: invitation.id,
          email: invitation.email,
          role: role.name,
          expiresAt: invitation.expiresAt,
          invitationUrl,
        },
        emailSent,
      },
    });
  } catch (error) {
    console.error("Error al crear invitación:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error interno del servidor",
      },
      { status: 500 }
    );
  }
}

// ===== CANCELAR INVITACIÓN =====
export async function DELETE(request: NextRequest) {
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

    // ===== OBTENER ID DE LA INVITACIÓN =====
    const { searchParams } = new URL(request.url);
    const invitationId = searchParams.get("id");

    if (!invitationId) {
      return NextResponse.json(
        { error: "ID de invitación requerido" },
        { status: 400 }
      );
    }

    // ===== OBTENER USUARIO Y SU EMPRESA =====
    const user = await db.query.usersTable.findFirst({
      where: eq(schema.usersTable.id, payload.userId),
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // Obtener la relación usuario-empresa activa
    const userCompany = await db
      .select()
      .from(schema.userCompaniesTable)
      .where(
        and(
          eq(schema.userCompaniesTable.userId, user.id),
          eq(schema.userCompaniesTable.isActive, true)
        )
      )
      .limit(1);

    if (userCompany.length === 0) {
      return NextResponse.json(
        { error: "Usuario no está asociado a ninguna empresa" },
        { status: 404 }
      );
    }

    const companyId = userCompany[0].companyId;

    // ===== VERIFICAR QUE LA INVITACIÓN PERTENECE A LA EMPRESA =====
    const invitation = await db.query.invitationTokensTable.findFirst({
      where: and(
        eq(schema.invitationTokensTable.id, invitationId),
        companyId
          ? eq(schema.invitationTokensTable.companyId, companyId)
          : undefined
      ),
    });

    if (!invitation) {
      return NextResponse.json(
        { error: "Invitación no encontrada" },
        { status: 404 }
      );
    }

    // ===== ELIMINAR INVITACIÓN =====
    await db
      .delete(schema.invitationTokensTable)
      .where(eq(schema.invitationTokensTable.id, invitationId));

    return NextResponse.json({
      success: true,
      message: "Invitación cancelada exitosamente",
    });
  } catch (error) {
    console.error("Error al cancelar invitación:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error interno del servidor",
      },
      { status: 500 }
    );
  }
}
