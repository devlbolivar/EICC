import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "@/config/schema";
import { verifyAccessToken } from "@/lib/auth";
import { eq, and, like, desc, asc, sql } from "drizzle-orm";

const pg = neon(process.env.DATABASE_URL!);
const db = drizzle(pg, { schema });

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

    // ===== OBTENER PARÁMETROS DE QUERY =====
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const sortBy = searchParams.get("sortBy") || "joinedAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    const offset = (page - 1) * limit;

    // ===== CONSTRUIR FILTROS =====
    const filters = [
      eq(schema.userCompaniesTable.companyId, companyId),
      eq(schema.userCompaniesTable.isActive, true),
    ];

    if (search) {
      filters.push(like(schema.usersTable.name, `%${search}%`));
    }

    if (status) {
      if (status === "active") {
        filters.push(eq(schema.usersTable.isActive, true));
      } else if (status === "inactive") {
        filters.push(eq(schema.usersTable.isActive, false));
      }
    }

    const whereClause = and(...filters);

    // ===== CONSTRUIR ORDENAMIENTO =====
    let orderByClause;
    switch (sortBy) {
      case "name":
        orderByClause =
          sortOrder === "asc"
            ? asc(schema.usersTable.name)
            : desc(schema.usersTable.name);
        break;
      case "email":
        orderByClause =
          sortOrder === "asc"
            ? asc(schema.usersTable.email)
            : desc(schema.usersTable.email);
        break;
      case "joinedAt":
        orderByClause =
          sortOrder === "asc"
            ? asc(schema.userCompaniesTable.joinedAt)
            : desc(schema.userCompaniesTable.joinedAt);
        break;
      default:
        orderByClause = desc(schema.userCompaniesTable.joinedAt);
    }

    // ===== OBTENER EMPLEADOS CON DATOS RELACIONADOS =====
    const employees = await db
      .select({
        // Datos del usuario
        id: schema.usersTable.id,
        name: schema.usersTable.name,
        email: schema.usersTable.email,
        phone: schema.usersTable.phone,
        avatar: schema.usersTable.avatar,
        isActive: schema.usersTable.isActive,
        lastLoginAt: schema.usersTable.lastLoginAt,
        createdAt: schema.usersTable.createdAt,
        // Datos de la relación usuario-empresa
        joinedAt: schema.userCompaniesTable.joinedAt,
        acceptedAt: schema.userCompaniesTable.acceptedAt,
        // Datos del rol
        roleName: schema.rolesTable.name,
        roleDescription: schema.rolesTable.description,
        // Contadores de cursos y certificados
        coursesCompleted: sql<number>`COALESCE((
          SELECT COUNT(*) 
          FROM ${schema.enrollCourseTable} 
          WHERE ${schema.enrollCourseTable.userId} = ${schema.usersTable.id} 
          AND ${schema.enrollCourseTable.isCompleted} = true
        ), 0)`,
        certificatesCount: sql<number>`COALESCE((
          SELECT COUNT(*) 
          FROM ${schema.certificatesTable} 
          WHERE ${schema.certificatesTable.userId} = ${schema.usersTable.id}
        ), 0)`,
      })
      .from(schema.usersTable)
      .innerJoin(
        schema.userCompaniesTable,
        eq(schema.usersTable.id, schema.userCompaniesTable.userId)
      )
      .innerJoin(
        schema.rolesTable,
        eq(schema.userCompaniesTable.roleId, schema.rolesTable.id)
      )
      .where(whereClause)
      .orderBy(orderByClause)
      .limit(limit)
      .offset(offset);

    // ===== CONTAR TOTAL DE EMPLEADOS =====
    const totalEmployees = await db
      .select({ count: sql<number>`count(*)` })
      .from(schema.usersTable)
      .innerJoin(
        schema.userCompaniesTable,
        eq(schema.usersTable.id, schema.userCompaniesTable.userId)
      )
      .where(
        and(
          eq(schema.userCompaniesTable.companyId, companyId),
          eq(schema.userCompaniesTable.isActive, true)
        )
      );

    const total = totalEmployees[0]?.count || 0;

    // ===== OBTENER ESTADÍSTICAS GENERALES =====
    const stats = await db
      .select({
        totalEmployees: sql<number>`COUNT(DISTINCT ${schema.usersTable.id})`,
        activeEmployees: sql<number>`COUNT(DISTINCT CASE WHEN ${schema.usersTable.isActive} = true THEN ${schema.usersTable.id} END)`,
        totalCoursesCompleted: sql<number>`COALESCE((
          SELECT COUNT(*) 
          FROM ${schema.enrollCourseTable} 
          WHERE ${schema.enrollCourseTable.companyId} = ${companyId}
          AND ${schema.enrollCourseTable.isCompleted} = true
        ), 0)`,
        totalCertificates: sql<number>`COALESCE((
          SELECT COUNT(*) 
          FROM ${schema.certificatesTable} 
          WHERE ${schema.certificatesTable.companyId} = ${companyId}
        ), 0)`,
      })
      .from(schema.usersTable)
      .innerJoin(
        schema.userCompaniesTable,
        eq(schema.usersTable.id, schema.userCompaniesTable.userId)
      )
      .where(
        and(
          eq(schema.userCompaniesTable.companyId, companyId),
          eq(schema.userCompaniesTable.isActive, true)
        )
      );

    const companyStats = stats[0] || {
      totalEmployees: 0,
      activeEmployees: 0,
      totalCoursesCompleted: 0,
      totalCertificates: 0,
    };

    // ===== FORMATEAR RESPUESTA =====
    const formattedEmployees = employees.map((employee) => ({
      id: employee.id,
      name: employee.name,
      email: employee.email,
      phone: employee.phone || "",
      role: employee.roleName,
      status: employee.isActive ? "active" : "inactive",
      joinedAt: employee.joinedAt?.toISOString().split("T")[0] || "",
      coursesCompleted: employee.coursesCompleted,
      certificates: employee.certificatesCount,
      avatar:
        employee.avatar ||
        employee.name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase(),
      lastLoginAt: employee.lastLoginAt,
    }));

    return NextResponse.json({
      success: true,
      data: {
        employees: formattedEmployees,
        stats: companyStats,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Error al obtener empleados:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error interno del servidor",
      },
      { status: 500 }
    );
  }
}
