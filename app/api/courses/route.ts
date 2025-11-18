import { NextRequest, NextResponse } from "next/server";
import { db } from "@/config/db";
import { coursesTable } from "@/config/schema";
import { sql } from "drizzle-orm";
import { verifyAccessToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { Module, Lesson } from "@/app/types";
import { createPaginationInfo } from "@/lib/pagination";
import { apiRateLimit } from "@/lib/rate-limit";

// ===== GET - Listar cursos =====
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

    // Verificar permisos - aceptar courses:read, courses:view, o courses:create
    if (
      !payload.permissions.includes("courses:read") &&
      !payload.permissions.includes("courses:view") &&
      !payload.permissions.includes("courses:create")
    ) {
      return NextResponse.json(
        { error: "Sin permisos para ver cursos" },
        { status: 403 }
      );
    }

    // Obtener parámetros de consulta
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    // Construir consulta base
    const query = sql`
      SELECT 
        c.*,
        u.name as creator_name,
        u.email as creator_email,
        comp.name as company_name
      FROM courses c
      LEFT JOIN users u ON c."createdBy" = u.id
      LEFT JOIN companies comp ON c."companyId" = comp.id
      WHERE c."isActive" = true
      ORDER BY c."createdAt" DESC
      LIMIT ${limit} OFFSET ${(page - 1) * limit}
    `;

    const result = await db.execute(query);

    // Obtener total de registros para paginación
    const countQuery = sql`
      SELECT COUNT(*) as total
      FROM courses c
      WHERE c."isActive" = true
    `;

    const countResult = await db.execute(countQuery);
    const total = parseInt(String(countResult.rows[0]?.total || "0"));

    const response = {
      success: true,
      data: {
        courses: result.rows || [],
        pagination: createPaginationInfo(page, limit, total),
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error al listar cursos:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// ===== POST - Crear curso =====
export async function POST(request: NextRequest) {
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
    if (!payload.permissions.includes("courses:create")) {
      return NextResponse.json(
        { error: "Sin permisos para crear cursos" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      name,
      description,
      category,
      level,
      estimatedDuration,
      visibility,
      targetCompanies,
      modules,
      bannerImage,
    } = body;

    // Validaciones básicas
    if (!name || !description || !category || !level) {
      return NextResponse.json(
        { error: "Campos obligatorios faltantes" },
        { status: 400 }
      );
    }

    // Generar CID único
    const cid = `course_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    // Crear curso
    const newCourse = await db
      .insert(coursesTable)
      .values({
        cid,
        name,
        description,
        numberOfChapters: modules?.length || 0,
        includeVideos:
          modules?.some((module: Module) =>
            module.lessons?.some((lesson: Lesson) => lesson.video)
          ) || false,
        difficulty: level,
        category,
        level,
        status: "Borrador",
        estimatedDuration,
        visibility,
        targetCompanies: Array.isArray(targetCompanies) ? targetCompanies : [],
        modules: modules || [],
        bannerImage: bannerImage || "",
        createdBy: payload.userId,
        companyId: payload.companyId,
        isPublic: visibility === "Público",
        isActive: true,
      })
      .returning();

    return NextResponse.json(
      {
        success: true,
        message: "Curso creado exitosamente",
        data: {
          course: newCourse[0],
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error al crear curso:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
