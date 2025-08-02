import { NextRequest, NextResponse } from "next/server";
import { db } from "@/config/db";
import { sql } from "drizzle-orm";
import { verifyAccessToken } from "@/lib/auth";
import { cookies } from "next/headers";

// ===== POST - Inscribirse en un curso =====
export async function POST(
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

    // Verificar que el curso existe y está activo
    const courseResult = await db.execute(sql`
      SELECT * FROM courses WHERE id = ${courseId} AND "isActive" = true
    `);

    if (courseResult.rows.length === 0) {
      return NextResponse.json(
        { error: "Curso no encontrado" },
        { status: 404 }
      );
    }

    const course = courseResult.rows[0];

    // Verificar permisos de acceso al curso
    if (!payload.permissions.includes("courses:enroll")) {
      return NextResponse.json(
        { error: "Sin permisos para inscribirse en cursos" },
        { status: 403 }
      );
    }

    // Verificar si el usuario ya está inscrito
    const existingEnrollment = await db.execute(sql`
      SELECT * FROM "enrollCourse" 
      WHERE "courseId" = ${courseId} AND "userId" = ${payload.userId}
    `);

    if (existingEnrollment.rows.length > 0) {
      return NextResponse.json(
        { error: "Ya estás inscrito en este curso" },
        { status: 409 }
      );
    }

    // Verificar visibilidad del curso
    if (!course.isPublic && course.companyId !== payload.companyId) {
      return NextResponse.json(
        { error: "No tienes acceso a este curso" },
        { status: 403 }
      );
    }

    // Inscribir al usuario
    const enrollment = await db.execute(sql`
      INSERT INTO "enrollCourse" (
        "courseId", "userId", "companyId", "progress", "isCompleted", 
        "completedChapters", "cid", "userEmail"
      ) VALUES (
        ${courseId}, ${payload.userId}, ${payload.companyId}, 0, false, 
        '{}', ${course.cid}, ${payload.email}
      ) RETURNING *
    `);

    return NextResponse.json(
      {
        success: true,
        message: "Inscripción exitosa",
        data: {
          enrollment: enrollment.rows[0],
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error al inscribirse en el curso:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// ===== GET - Obtener progreso del curso =====
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

    // Obtener inscripción del usuario
    const enrollmentResult = await db.execute(sql`
      SELECT 
        ec.*,
        c.name as course_name,
        c.description as course_description,
        c.modules as course_modules
      FROM "enrollCourse" ec
      LEFT JOIN courses c ON ec."courseId" = c.id
      WHERE ec."courseId" = ${courseId} AND ec."userId" = ${payload.userId}
    `);

    if (enrollmentResult.rows.length === 0) {
      return NextResponse.json(
        { error: "No estás inscrito en este curso" },
        { status: 404 }
      );
    }

    const enrollment = enrollmentResult.rows[0];

    return NextResponse.json({
      success: true,
      data: {
        enrollment,
      },
    });
  } catch (error) {
    console.error("Error al obtener progreso del curso:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// ===== PUT - Actualizar progreso del curso =====
export async function PUT(
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
    const body = await request.json();
    const { completedChapters, progress, isCompleted } = body;

    // Verificar que el usuario está inscrito
    const existingEnrollment = await db.execute(sql`
      SELECT * FROM "enrollCourse" 
      WHERE "courseId" = ${courseId} AND "userId" = ${payload.userId}
    `);

    if (existingEnrollment.rows.length === 0) {
      return NextResponse.json(
        { error: "No estás inscrito en este curso" },
        { status: 404 }
      );
    }

    // Actualizar progreso
    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (completedChapters !== undefined) {
      updateData.completedChapters = completedChapters;
    }
    if (progress !== undefined) {
      updateData.progress = progress;
    }
    if (isCompleted !== undefined) {
      updateData.isCompleted = isCompleted;
      if (isCompleted) {
        updateData.completedAt = new Date();
      }
    }

    const updatedEnrollment = await db.execute(sql`
      UPDATE "enrollCourse" 
      SET ${sql.raw(
        Object.entries(updateData)
          .map(
            ([key, value]) =>
              `"${key}" = ${typeof value === "string" ? `'${value}'` : value}`
          )
          .join(", ")
      )}
      WHERE "courseId" = ${courseId} AND "userId" = ${payload.userId}
      RETURNING *
    `);

    return NextResponse.json({
      success: true,
      message: "Progreso actualizado exitosamente",
      data: {
        enrollment: updatedEnrollment.rows[0],
      },
    });
  } catch (error) {
    console.error("Error al actualizar progreso del curso:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
