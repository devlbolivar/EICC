import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "@/config/schema";
import { verifyAdminAuth } from "@/lib/admin-auth";
import { validateUserData, validateUUID } from "@/lib/validation";
import { eq, and } from "drizzle-orm";

const pg = neon(process.env.DATABASE_URL!);
const db = drizzle(pg, { schema });

// ===== OBTENER USUARIO ESPECÍFICO =====
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // ===== VERIFICAR AUTENTICACIÓN Y PERMISOS DE ADMIN =====
    const authResult = await verifyAdminAuth(request);
    if (!authResult.authorized) {
      return authResult.response;
    }
    const payload = authResult.payload;

    // ===== VALIDAR UUID =====
    const idValidation = validateUUID(id, 'ID de usuario');
    if (!idValidation.isValid) {
      return NextResponse.json(
        { error: idValidation.errors?.[0] || 'ID inválido' },
        { status: 400 }
      );
    }

    // ===== OBTENER USUARIO =====
    const userData = await db
      .select({
        id: schema.usersTable.id,
        email: schema.usersTable.email,
        name: schema.usersTable.name,
        avatar: schema.usersTable.avatar,
        isActive: schema.usersTable.isActive,
        emailVerified: schema.usersTable.emailVerified,
        lastLoginAt: schema.usersTable.lastLoginAt,
        createdAt: schema.usersTable.createdAt,
        updatedAt: schema.usersTable.updatedAt,
        age: schema.usersTable.age,
        subscriptionId: schema.usersTable.subscriptionId,
        // Relaciones
        userCompanyId: schema.userCompaniesTable.id,
        userCompanyRoleId: schema.userCompaniesTable.roleId,
        userCompanyCompanyId: schema.userCompaniesTable.companyId,
        userCompanyIsActive: schema.userCompaniesTable.isActive,
        userCompanyJoinedAt: schema.userCompaniesTable.joinedAt,
        userCompanyAcceptedAt: schema.userCompaniesTable.acceptedAt,
        userCompanyInvitedBy: schema.userCompaniesTable.invitedBy,
        roleName: schema.rolesTable.name,
        roleDescription: schema.rolesTable.description,
        rolePermissions: schema.rolesTable.permissions,
        companyName: schema.companiesTable.name,
        companyDescription: schema.companiesTable.description,
      })
      .from(schema.usersTable)
      .leftJoin(
        schema.userCompaniesTable,
        eq(schema.usersTable.id, schema.userCompaniesTable.userId)
      )
      .leftJoin(
        schema.rolesTable,
        eq(schema.userCompaniesTable.roleId, schema.rolesTable.id)
      )
      .leftJoin(
        schema.companiesTable,
        eq(schema.userCompaniesTable.companyId, schema.companiesTable.id)
      )
      .where(eq(schema.usersTable.id, id));

    if (!userData.length) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // ===== FORMATEAR RESPUESTA =====
    const baseUser = userData[0];
    const userCompanies: any[] = [];

    // Procesar las relaciones de empresa
    userData.forEach((row) => {
      if (row.userCompanyId && row.userCompanyIsActive && row.roleName) {
        userCompanies.push({
          id: row.userCompanyId,
          role: {
            id: row.userCompanyRoleId,
            name: row.roleName,
            description: row.roleDescription,
            permissions: row.rolePermissions,
          },
          company: row.companyName
            ? {
                id: row.userCompanyCompanyId,
                name: row.companyName,
                description: row.companyDescription,
              }
            : null,
          isActive: row.userCompanyIsActive,
          joinedAt: row.userCompanyJoinedAt,
          acceptedAt: row.userCompanyAcceptedAt,
          invitedBy: row.userCompanyInvitedBy
            ? {
                id: row.userCompanyInvitedBy,
                name: "Usuario invitador", // TODO: Obtener nombre del invitador
                email: "email@example.com", // TODO: Obtener email del invitador
              }
            : null,
        });
      }
    });

    const formattedUser = {
      id: baseUser.id,
      email: baseUser.email,
      name: baseUser.name,
      avatar: baseUser.avatar,
      isActive: baseUser.isActive,
      emailVerified: baseUser.emailVerified,
      lastLoginAt: baseUser.lastLoginAt,
      createdAt: baseUser.createdAt,
      updatedAt: baseUser.updatedAt,
      age: baseUser.age,
      subscriptionId: baseUser.subscriptionId,
      userCompanies,
    };

    return NextResponse.json(formattedUser);
  } catch (error) {
    console.error("Error al obtener usuario:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// ===== ACTUALIZAR USUARIO =====
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // ===== VERIFICAR AUTENTICACIÓN Y PERMISOS =====
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

    // Verificar que el usuario sea admin
    const currentUser = await db
      .select()
      .from(schema.usersTable)
      .where(eq(schema.usersTable.id, payload.userId))
      .limit(1);

    if (!currentUser.length) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // Verificar permisos de admin (simplificado por ahora)
    // TODO: Implementar verificación completa de permisos

    // ===== OBTENER DATOS DEL BODY =====
    const body = await request.json();
    const { name, email, isActive, age, subscriptionId } = body;

    // ===== VALIDAR DATOS =====
    if (!name || !email) {
      return NextResponse.json(
        { error: "Nombre y email son requeridos" },
        { status: 400 }
      );
    }

    // Verificar si el email ya existe (excluyendo el usuario actual)
    const existingUser = await db
      .select()
      .from(schema.usersTable)
      .where(
        and(eq(schema.usersTable.email, email), eq(schema.usersTable.id, id))
      )
      .limit(1);

    if (existingUser.length > 0 && existingUser[0].id !== id) {
      return NextResponse.json(
        { error: "El email ya está en uso" },
        { status: 400 }
      );
    }

    // ===== ACTUALIZAR USUARIO =====
    const updatedUser = await db
      .update(schema.usersTable)
      .set({
        name,
        email,
        isActive: isActive !== undefined ? isActive : true,
        age: age || null,
        subscriptionId: subscriptionId || null,
        updatedAt: new Date(),
      })
      .where(eq(schema.usersTable.id, id))
      .returning();

    if (!updatedUser.length) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Usuario actualizado correctamente",
      user: updatedUser[0],
    });
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// ===== ELIMINAR USUARIO =====
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // ===== VERIFICAR AUTENTICACIÓN Y PERMISOS =====
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

    // Verificar que el usuario sea admin
    const currentUser = await db
      .select()
      .from(schema.usersTable)
      .where(eq(schema.usersTable.id, payload.userId))
      .limit(1);

    if (!currentUser.length) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // Verificar permisos de admin (simplificado por ahora)
    // TODO: Implementar verificación completa de permisos

    // ===== VERIFICAR QUE NO SE ELIMINE A SÍ MISMO =====
    if (id === payload.userId) {
      return NextResponse.json(
        { error: "No puedes eliminar tu propia cuenta" },
        { status: 400 }
      );
    }

    // ===== VERIFICAR QUE EL USUARIO EXISTA =====
    const userToDelete = await db
      .select()
      .from(schema.usersTable)
      .where(eq(schema.usersTable.id, id))
      .limit(1);

    if (!userToDelete.length) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // ===== ELIMINAR USUARIO =====
    await db.delete(schema.usersTable).where(eq(schema.usersTable.id, id));

    return NextResponse.json({
      message: "Usuario eliminado correctamente",
    });
  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
