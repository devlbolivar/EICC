import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "@/config/schema";
import { verifyAdminAuth } from "@/lib/admin-auth";
import { eq, like, and, desc, asc, sql } from "drizzle-orm";

const pg = neon(process.env.DATABASE_URL!);
const db = drizzle(pg, { schema });

export async function GET(request: NextRequest) {
  try {
    // ===== VERIFICAR AUTENTICACIÓN Y PERMISOS DE ADMIN =====
    const authResult = await verifyAdminAuth(request);
    if (!authResult.authorized) {
      return authResult.response;
    }
    const payload = authResult.payload;

    // ===== OBTENER PARÁMETROS DE QUERY =====
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const role = searchParams.get("role") || "";
    const status = searchParams.get("status") || "";
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    const offset = (page - 1) * limit;

    // ===== CONSTRUIR FILTROS =====
    const filters = [];

    if (search) {
      filters.push(like(schema.usersTable.name, `%${search}%`));
      filters.push(like(schema.usersTable.email, `%${search}%`));
    }

    if (status) {
      if (status === "active") {
        filters.push(eq(schema.usersTable.isActive, true));
      } else if (status === "inactive") {
        filters.push(eq(schema.usersTable.isActive, false));
      }
    }

    // ===== CONSULTA PRINCIPAL =====
    const whereClause = filters.length > 0 ? and(...filters) : undefined;

    // Ordenamiento seguro
    let orderByClause;
    if (sortBy === "name") {
      orderByClause =
        sortOrder === "asc"
          ? asc(schema.usersTable.name)
          : desc(schema.usersTable.name);
    } else if (sortBy === "email") {
      orderByClause =
        sortOrder === "asc"
          ? asc(schema.usersTable.email)
          : desc(schema.usersTable.email);
    } else {
      orderByClause =
        sortOrder === "asc"
          ? asc(schema.usersTable.createdAt)
          : desc(schema.usersTable.createdAt);
    }

    // Obtener usuarios con sus relaciones de empresa y rol
    const users = await db
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
      .where(whereClause)
      .orderBy(orderByClause)
      .limit(limit)
      .offset(offset);

    // ===== CONTAR TOTAL DE USUARIOS =====
    const totalUsers = await db
      .select({ count: sql<number>`count(*)` })
      .from(schema.usersTable)
      .where(whereClause);

    const total = totalUsers[0]?.count || 0;

    // ===== FORMATEAR RESPUESTA =====
    // Agrupar resultados por usuario
    const userMap = new Map();

    users.forEach((row) => {
      const userId = row.id;

      if (!userMap.has(userId)) {
        // Crear usuario base
        userMap.set(userId, {
          id: row.id,
          email: row.email,
          name: row.name,
          avatar: row.avatar,
          isActive: row.isActive,
          emailVerified: row.emailVerified,
          lastLoginAt: row.lastLoginAt,
          createdAt: row.createdAt,
          updatedAt: row.updatedAt,
          age: row.age,
          subscriptionId: row.subscriptionId,
          roles: [],
        });
      }

      // Agregar rol si existe y está activo
      if (row.userCompanyId && row.userCompanyIsActive && row.roleName) {
        const user = userMap.get(userId);
        user.roles.push({
          role: row.roleName,
          company: row.companyName || "Individual",
          companyId: row.userCompanyCompanyId,
        });
      }
    });

    // Convertir a array y determinar rol principal
    const formattedUsers = Array.from(userMap.values()).map((user) => {
      // Determinar rol principal basado en prioridad
      const rolePriority = { admin: 3, company: 2, student: 1 };
      const primaryRole =
        user.roles.length > 0
          ? user.roles.sort((a: any, b: any) => {
              const priorityA =
                rolePriority[a.role as keyof typeof rolePriority] || 0;
              const priorityB =
                rolePriority[b.role as keyof typeof rolePriority] || 0;
              return priorityB - priorityA;
            })[0].role
          : "student";

      return {
        ...user,
        primaryRole,
      };
    });

    return NextResponse.json({
      users: formattedUsers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
