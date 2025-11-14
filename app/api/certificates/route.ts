import { NextRequest, NextResponse } from "next/server";
import { db } from "@/config/db";
import {
  certificatesTable,
  coursesTable,
  usersTable,
  companiesTable,
} from "@/config/schema";
import { sql, eq, and, desc } from "drizzle-orm";
import { verifyAccessToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { Certificate, CertificateCreateData } from "@/app/types";

// ===== GET - Listar certificados =====
export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken");

    if (!token) {
      return NextResponse.json(
        { error: "Token no encontrado" },
        { status: 401 }
      );
    }

    const payload = await verifyAccessToken(token.value);
    if (!payload) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    }

    // Obtener parámetros de consulta
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const userId = searchParams.get("userId");
    const courseId = searchParams.get("courseId");
    const search = searchParams.get("search");
    const status = searchParams.get("status");

    // Construir consulta base
    let whereConditions = sql`cert."isActive" = true`;

    // Si es estudiante, solo puede ver sus propios certificados
    if (
      payload.permissions.includes("courses:read") &&
      !payload.permissions.includes("courses:manage")
    ) {
      whereConditions = sql`${whereConditions} AND cert."user_id" = ${payload.userId}`;
    } else if (payload.companyId) {
      // Si es empresa, solo puede ver certificados de su empresa
      whereConditions = sql`${whereConditions} AND cert."company_id" = ${payload.companyId}`;
    }

    // Filtros adicionales
    if (userId) {
      whereConditions = sql`${whereConditions} AND cert."user_id" = ${userId}`;
    }
    if (courseId) {
      whereConditions = sql`${whereConditions} AND cert."course_id" = ${courseId}`;
    }
    if (search) {
      whereConditions = sql`${whereConditions} AND (
        LOWER(u.name) LIKE LOWER(${"%" + search + "%"}) OR
        LOWER(u.email) LIKE LOWER(${"%" + search + "%"}) OR
        LOWER(c.name) LIKE LOWER(${"%" + search + "%"}) OR
        LOWER(cert."certificateId") LIKE LOWER(${"%" + search + "%"})
      )`;
    }
    if (status && status !== "all") {
      if (status === "active") {
        whereConditions = sql`${whereConditions} AND cert."isActive" = true`;
      } else if (status === "expired") {
        whereConditions = sql`${whereConditions} AND cert."isActive" = false`;
      }
    }

    const query = sql`
      SELECT 
        cert.*,
        c.name as course_name,
        c.description as course_description,
        c.category as course_category,
        c.level as course_level,
        c."estimatedDuration" as course_duration,
        u.name as user_name,
        u.email as user_email,
        comp.name as company_name
      FROM certificates cert
      LEFT JOIN courses c ON cert."course_id" = c.id
      LEFT JOIN users u ON cert."user_id" = u.id
      LEFT JOIN companies comp ON cert."company_id" = comp.id
      WHERE ${whereConditions}
      ORDER BY cert."issuedDate" DESC
      LIMIT ${limit} OFFSET ${(page - 1) * limit}
    `;

    const result = await db.execute(query);

    // Obtener total de registros para paginación
    const countQuery = sql`
      SELECT COUNT(*) as total
      FROM certificates cert
      LEFT JOIN courses c ON cert."course_id" = c.id
      WHERE ${whereConditions}
    `;

    const countResult = await db.execute(countQuery);
    const total = parseInt(String(countResult.rows[0]?.total || "0"));

    return NextResponse.json({
      success: true,
      data: result.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching certificates:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// ===== POST - Crear certificado =====
export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken");

    if (!token) {
      return NextResponse.json(
        { error: "Token no encontrado" },
        { status: 401 }
      );
    }

    const payload = await verifyAccessToken(token.value);
    if (!payload) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    }

    // Verificar permisos
    if (
      !payload.permissions.includes("courses:manage") &&
      !payload.permissions.includes("courses:create")
    ) {
      return NextResponse.json(
        { error: "Sin permisos para crear certificados" },
        { status: 403 }
      );
    }

    const body: CertificateCreateData = await request.json();

    // Validar datos requeridos
    if (
      !body.courseId ||
      !body.userId ||
      !body.title ||
      body.grade === undefined
    ) {
      return NextResponse.json(
        { error: "Faltan campos requeridos" },
        { status: 400 }
      );
    }

    // Verificar que el curso existe
    const courseResult = await db.execute(
      sql`SELECT id FROM courses WHERE id = ${body.courseId} AND "isActive" = true`
    );

    if (courseResult.rows.length === 0) {
      return NextResponse.json(
        { error: "Curso no encontrado" },
        { status: 404 }
      );
    }

    // Verificar que el usuario existe
    const userResult = await db.execute(
      sql`SELECT id FROM users WHERE id = ${body.userId} AND "isActive" = true`
    );

    if (userResult.rows.length === 0) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // Generar ID único del certificado
    const certificateId = `CERT-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)
      .toUpperCase()}`;

    // Crear certificado
    const newCertificate = {
      certificateId,
      courseId: body.courseId,
      userId: body.userId,
      companyId: body.companyId || payload.companyId || null,
      title: body.title,
      description: body.description || null,
      grade: body.grade,
      completedDate: body.completedDate,
      duration: body.duration || null,
      certificateUrl: body.certificateUrl || null,
    };

    const result = await db
      .insert(certificatesTable)
      .values(newCertificate)
      .returning();

    return NextResponse.json({
      success: true,
      data: result[0],
      message: "Certificado creado exitosamente",
    });
  } catch (error) {
    console.error("Error creating certificate:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
