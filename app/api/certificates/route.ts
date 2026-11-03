import { requireCsrf } from "@/lib/csrf";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/config/db";
import { certificatesTable, usersTable, coursesTable, companiesTable } from "@/config/schema";
import { sql, getTableName } from "drizzle-orm";
import { verifyAccessToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { CertificateCreateData } from "@/app/types";
import { createPaginationInfo } from "@/lib/pagination";
import { apiRateLimit } from "@/lib/rate-limit";

// ===== GET - Listar certificados =====
export async function GET(request: NextRequest) {
  try {
    // Rate limiting: 60 requests por minuto
    const rateLimitResponse = await apiRateLimit(request);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

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
    const page = Math.max(parseInt(searchParams.get("page") || "1"), 1);
    const rawLimit = parseInt(searchParams.get("limit") || "10");
    // FIX 4: Limit pagination to max 100 items to prevent DoS
    const limit = Math.min(Math.max(rawLimit, 1), 100);
    const userId = searchParams.get("userId");
    const courseId = searchParams.get("courseId");
    const search = searchParams.get("search");
    const status = searchParams.get("status");

    // Construir consulta base
    let whereConditions = sql`cert.${sql.identifier(certificatesTable.isActive.name)} = true`;

    // Si es estudiante, solo puede ver sus propios certificados
    if (
      payload.permissions.includes("courses:read") &&
      !payload.permissions.includes("courses:manage")
    ) {
      whereConditions = sql`${whereConditions} AND cert.${sql.identifier(certificatesTable.userId.name)} = ${payload.userId}`;
    } else if (payload.companyId) {
      // Si es empresa, solo puede ver certificados de su empresa
      whereConditions = sql`${whereConditions} AND cert.${sql.identifier(certificatesTable.companyId.name)} = ${payload.companyId}`;
    }

    // Filtros adicionales
    if (userId) {
      whereConditions = sql`${whereConditions} AND cert.${sql.identifier(certificatesTable.userId.name)} = ${userId}`;
    }
    if (courseId) {
      whereConditions = sql`${whereConditions} AND cert.${sql.identifier(certificatesTable.courseId.name)} = ${courseId}`;
    }
    if (search) {
      whereConditions = sql`${whereConditions} AND (
        LOWER(u.${sql.identifier(usersTable.name.name)}) LIKE LOWER(${"%" + search + "%"}) OR
        LOWER(u.${sql.identifier(usersTable.email.name)}) LIKE LOWER(${"%" + search + "%"}) OR
        LOWER(c.${sql.identifier(coursesTable.name.name)}) LIKE LOWER(${"%" + search + "%"}) OR
        LOWER(cert.${sql.identifier(certificatesTable.certificateId.name)}) LIKE LOWER(${"%" + search + "%"})
      )`;
    }
    if (status && status !== "all") {
      if (status === "active") {
        whereConditions = sql`${whereConditions} AND cert.${sql.identifier(certificatesTable.isActive.name)} = true`;
      } else if (status === "expired") {
        whereConditions = sql`${whereConditions} AND cert.${sql.identifier(certificatesTable.isActive.name)} = false`;
      }
    }

    const query = sql`
      SELECT
        cert.*,
        c.${sql.identifier(coursesTable.name.name)} as course_name,
        c.${sql.identifier(coursesTable.description.name)} as course_description,
        c.${sql.identifier(coursesTable.category.name)} as course_category,
        c.${sql.identifier(coursesTable.level.name)} as course_level,
        c.${sql.identifier(coursesTable.estimatedDuration.name)} as course_duration,
        u.${sql.identifier(usersTable.name.name)} as user_name,
        u.${sql.identifier(usersTable.email.name)} as user_email,
        comp.${sql.identifier(companiesTable.name.name)} as company_name
      FROM ${sql.identifier(getTableName(certificatesTable))} cert
      LEFT JOIN ${sql.identifier(getTableName(coursesTable))} c ON cert.${sql.identifier(certificatesTable.courseId.name)} = c.${sql.identifier(coursesTable.id.name)}
      LEFT JOIN ${sql.identifier(getTableName(usersTable))} u ON cert.${sql.identifier(certificatesTable.userId.name)} = u.${sql.identifier(usersTable.id.name)}
      LEFT JOIN ${sql.identifier(getTableName(companiesTable))} comp ON cert.${sql.identifier(certificatesTable.companyId.name)} = comp.${sql.identifier(companiesTable.id.name)}
      WHERE ${whereConditions}
      ORDER BY cert.${sql.identifier(certificatesTable.issuedDate.name)} DESC
      LIMIT ${limit} OFFSET ${(page - 1) * limit}
    `;

    const result = await db.execute(query);

    // Obtener total de registros para paginación
    const countQuery = sql`
      SELECT COUNT(*) as total
      FROM ${sql.identifier(getTableName(certificatesTable))} cert
      LEFT JOIN ${sql.identifier(getTableName(coursesTable))} c ON cert.${sql.identifier(certificatesTable.courseId.name)} = c.${sql.identifier(coursesTable.id.name)}
      LEFT JOIN ${sql.identifier(getTableName(usersTable))} u ON cert.${sql.identifier(certificatesTable.userId.name)} = u.${sql.identifier(usersTable.id.name)}
      WHERE ${whereConditions}
    `;

    const countResult = await db.execute(countQuery);
    const total = parseInt(String(countResult.rows[0]?.total || "0"));

    return NextResponse.json({
      success: true,
      data: result.rows,
      pagination: createPaginationInfo(page, limit, total),
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
    const csrfResult = await requireCsrf(request);
    if (csrfResult) return csrfResult;

  try {
    // Rate limiting: 60 requests por minuto
    const rateLimitResponse = await apiRateLimit(request);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

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
      sql`SELECT ${sql.identifier(coursesTable.id.name)} FROM ${sql.identifier(getTableName(coursesTable))} WHERE ${sql.identifier(coursesTable.id.name)} = ${body.courseId} AND ${sql.identifier(coursesTable.isActive.name)} = true`
    );

    if (courseResult.rows.length === 0) {
      return NextResponse.json(
        { error: "Curso no encontrado" },
        { status: 404 }
      );
    }

    // Verificar que el usuario existe
    const userResult = await db.execute(
      sql`SELECT ${sql.identifier(usersTable.id.name)} FROM ${sql.identifier(getTableName(usersTable))} WHERE ${sql.identifier(usersTable.id.name)} = ${body.userId} AND ${sql.identifier(usersTable.isActive.name)} = true`
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
