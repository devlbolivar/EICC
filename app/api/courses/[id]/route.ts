import { canReadCourse, canModifyCourse, isPlatformAdmin } from "@/lib/course-access";
import { requireCsrf } from "@/lib/csrf";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/config/db";
import { coursesTable } from "@/config/schema";
import { sql } from "drizzle-orm";
import { verifyAccessToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { Module, Lesson } from "@/app/types";
import { validateUUIDParam } from "@/lib/uuid-validator";
import { handleApiError } from "@/lib/api-helpers";

// ===== GET - Obtener curso por ID =====
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id: courseId } = await params;

    // ✅ VALIDAR UUID
    const uuidError = validateUUIDParam(courseId, "Course ID");
    if (uuidError) return uuidError;

    // Obtener curso con información del creador y empresa
    const result = await db.execute(sql`
      SELECT 
        c.*,
        u.name as creator_name,
        u.email as creator_email,
        comp.name as company_name
      FROM courses c
      LEFT JOIN users u ON c."createdBy" = u.id
      LEFT JOIN companies comp ON c."companyId" = comp.id
      WHERE c.id = ${courseId} AND c."isActive" = true
    `);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Curso no encontrado" },
        { status: 404 }
      );
    }

    const course = result.rows[0];

    if (!canReadCourse(payload, course)) {
      return NextResponse.json({ error: "Sin permisos para ver este curso" }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      data: {
        course,
      },
    });
  } catch (error) {
    console.error("Error al obtener curso:", error);
    return handleApiError(error);
  }
}

// ===== PUT - Actualizar curso =====
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
    const csrfResult = await requireCsrf(request);
    if (csrfResult) return csrfResult;

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
    if (!isPlatformAdmin(payload) && !payload.permissions.includes("courses:edit")) {
      return NextResponse.json(
        { error: "Sin permisos para editar cursos" },
        { status: 403 }
      );
    }

    const { id: courseId } = await params;

    // ✅ VALIDAR UUID
    const uuidError = validateUUIDParam(courseId, "Course ID");
    if (uuidError) return uuidError;

    const body = await request.json();

    // Verificar que el curso existe y pertenece al usuario/empresa
    const existingCourse = await db.execute(sql`
      SELECT * FROM courses WHERE id = ${courseId} AND "isActive" = true
    `);

    if (existingCourse.rows.length === 0) {
      return NextResponse.json(
        { error: "Curso no encontrado" },
        { status: 404 }
      );
    }

    const course = existingCourse.rows[0];

    // Verificar propiedad del curso
    if (!canModifyCourse(payload, course, "courses:edit")) {
      return NextResponse.json(
        { error: "Sin permisos para editar este curso" },
        { status: 403 }
      );
    }

    // Preparar datos de actualización
    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    // Campos que se pueden actualizar
    if (body.name) updateData.name = body.name;
    if (body.description) updateData.description = body.description;
    if (body.category) updateData.category = body.category;
    if (body.level) updateData.level = body.level;
    if (body.status) updateData.status = body.status;
    if (body.estimatedDuration)
      updateData.estimatedDuration = body.estimatedDuration;
    if (body.visibility) {
      updateData.visibility = body.visibility;
      updateData.isPublic = ["public", "Público"].includes(body.visibility);
    }
    if (body.targetCompanies) updateData.targetCompanies = body.targetCompanies;
    if (body.modules) {
      updateData.modules = body.modules;
      updateData.numberOfChapters = body.modules.length;
      updateData.includeVideos = body.modules.some((module: Module) =>
        module.lessons?.some((lesson: Lesson) => lesson.video)
      );
    }
    if (body.bannerImage !== undefined)
      updateData.bannerImage = body.bannerImage;


    // Actualizar curso
    const updatedCourse = await db
      .update(coursesTable)
      .set(updateData)
      .where(eq(coursesTable.id, courseId))
      .returning();

    return NextResponse.json({
      success: true,
      message: "Curso actualizado exitosamente",
      data: {
        course: updatedCourse[0],
      },
    });
  } catch (error) {
    console.error("Error al actualizar curso:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// ===== DELETE - Eliminar curso =====
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
    const csrfResult = await requireCsrf(request);
    if (csrfResult) return csrfResult;

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
    if (!isPlatformAdmin(payload) && !payload.permissions.includes("courses:delete")) {
      return NextResponse.json(
        { error: "Sin permisos para eliminar cursos" },
        { status: 403 }
      );
    }

    const { id: courseId } = await params;

    // ✅ VALIDAR UUID
    const uuidError = validateUUIDParam(courseId, "Course ID");
    if (uuidError) return uuidError;

    // Verificar que el curso existe
    const existingCourse = await db.execute(sql`
      SELECT * FROM courses WHERE id = ${courseId} AND "isActive" = true
    `);

    if (existingCourse.rows.length === 0) {
      return NextResponse.json(
        { error: "Curso no encontrado" },
        { status: 404 }
      );
    }

    const course = existingCourse.rows[0];

    // Verificar propiedad del curso
    if (!canModifyCourse(payload, course, "courses:delete")) {
      return NextResponse.json(
        { error: "Sin permisos para eliminar este curso" },
        { status: 403 }
      );
    }

    // Soft delete - marcar como inactivo
    await db
      .update(coursesTable)
      .set({
        isActive: false,
        updatedAt: new Date(),
      })
      .where(eq(coursesTable.id, courseId));

    return NextResponse.json({
      success: true,
      message: "Curso eliminado exitosamente",
    });
  } catch (error) {
    console.error("Error al eliminar curso:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
