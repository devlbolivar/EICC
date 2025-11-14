import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "@/config/schema";
import { verifyAdminAuth } from "@/lib/admin-auth";
import { validateUserData, validateEmail } from "@/lib/validation";
import { eq, and } from "drizzle-orm";
import bcrypt from "bcryptjs";

const pg = neon(process.env.DATABASE_URL!);
const db = drizzle(pg, { schema });

export async function POST(request: NextRequest) {
  try {
    // ===== VERIFICAR AUTENTICACIÓN Y PERMISOS DE ADMIN =====
    const authResult = await verifyAdminAuth(request);
    if (!authResult.authorized) {
      return authResult.response;
    }
    const payload = authResult.payload;

    const body = await request.json();

    // ===== VALIDAR EMAIL =====
    const emailValidation = validateEmail(body.email || '');
    if (!emailValidation.isValid) {
      return NextResponse.json(
        { error: emailValidation.errors?.[0] || 'Email inválido' },
        { status: 400 }
      );
    }

    // ===== OBTENER DATOS DEL BODY =====
    const body = await request.json();
    const {
      name,
      email,
      password,
      roleId,
      companyId,
      age,
      subscriptionId,
      isActive = true,
    } = body;

    // ===== VALIDAR DATOS REQUERIDOS =====
    if (!name || !email || !password || !roleId) {
      return NextResponse.json(
        { error: "Nombre, email, contraseña y rol son requeridos" },
        { status: 400 }
      );
    }

    // ===== VALIDAR EMAIL =====
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Formato de email inválido" },
        { status: 400 }
      );
    }

    // ===== VALIDAR CONTRASEÑA =====
    if (password.length < 6) {
      return NextResponse.json(
        { error: "La contraseña debe tener al menos 6 caracteres" },
        { status: 400 }
      );
    }

    // ===== VERIFICAR QUE EL EMAIL NO EXISTA =====
    const existingUser = await db.query.usersTable.findFirst({
      where: eq(schema.usersTable.email, email),
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "El email ya está registrado" },
        { status: 400 }
      );
    }

    // ===== VERIFICAR QUE EL ROL EXISTA =====
    const role = await db.query.rolesTable.findFirst({
      where: eq(schema.rolesTable.id, roleId),
    });

    if (!role) {
      return NextResponse.json({ error: "Rol no encontrado" }, { status: 400 });
    }

    // ===== VERIFICAR QUE LA EMPRESA EXISTA (SI SE ESPECIFICA) =====
    if (companyId) {
      const company = await db.query.companiesTable.findFirst({
        where: eq(schema.companiesTable.id, companyId),
      });

      if (!company) {
        return NextResponse.json(
          { error: "Empresa no encontrada" },
          { status: 400 }
        );
      }
    }

    // ===== ENCRIPTAR CONTRASEÑA =====
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // ===== CREAR USUARIO =====
    const newUser = await db
      .insert(schema.usersTable)
      .values({
        name,
        email,
        passwordHash,
        isActive,
        age: age || null,
        subscriptionId: subscriptionId || null,
        emailVerified: true, // Los usuarios creados por admin se consideran verificados
      })
      .returning();

    if (!newUser.length) {
      return NextResponse.json(
        { error: "Error al crear usuario" },
        { status: 500 }
      );
    }

    const createdUser = newUser[0];

    // ===== CREAR RELACIÓN USUARIO-EMPRESA =====
    await db.insert(schema.userCompaniesTable).values({
      userId: createdUser.id,
      companyId: companyId || null,
      roleId,
      isActive: true,
      invitedBy: payload.userId,
      acceptedAt: new Date(), // Se considera aceptado automáticamente
    });

    // ===== OBTENER USUARIO CREADO CON RELACIONES =====
    const userWithRelations = await db.query.usersTable.findFirst({
      where: eq(schema.usersTable.id, createdUser.id),
      with: {
        userCompanies: {
          with: {
            company: true,
            role: true,
            invitedByUser: true,
          },
        },
      },
    });

    // ===== FORMATEAR RESPUESTA =====
    const formattedUser = {
      id: userWithRelations!.id,
      email: userWithRelations!.email,
      name: userWithRelations!.name,
      avatar: userWithRelations!.avatar,
      isActive: userWithRelations!.isActive,
      emailVerified: userWithRelations!.emailVerified,
      lastLoginAt: userWithRelations!.lastLoginAt,
      createdAt: userWithRelations!.createdAt,
      updatedAt: userWithRelations!.updatedAt,
      age: userWithRelations!.age,
      subscriptionId: userWithRelations!.subscriptionId,
      userCompanies: userWithRelations!.userCompanies.map((uc) => ({
        id: uc.id,
        role: {
          id: uc.role.id,
          name: uc.role.name,
          description: uc.role.description,
          permissions: uc.role.permissions,
        },
        company: uc.company
          ? {
              id: uc.company.id,
              name: uc.company.name,
              description: uc.company.description,
            }
          : null,
        isActive: uc.isActive,
        joinedAt: uc.joinedAt,
        acceptedAt: uc.acceptedAt,
        invitedBy: uc.invitedByUser
          ? {
              id: uc.invitedByUser.id,
              name: uc.invitedByUser.name,
              email: uc.invitedByUser.email,
            }
          : null,
      })),
    };

    return NextResponse.json(
      {
        message: "Usuario creado correctamente",
        user: formattedUser,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error al crear usuario:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
