import { requireCsrf } from "@/lib/csrf";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/config/db";
import { sql } from "drizzle-orm";
import { verifyAccessToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { generateCertificateForCompletion } from "@/lib/certificate-service";
import { Course, EnrollCourse } from "@/app/types";
import { validateUUID } from "@/lib/validation";

// ===== POST - Inscribirse en un curso =====
export async function POST(
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

    const { id: courseId } = await params;

    // ===== VALIDAR UUID =====
    const idValidation = validateUUID(courseId, 'ID de curso');
    if (!idValidation.isValid) {
      return NextResponse.json(
        { error: idValidation.errors?.[0] || 'ID inválido' },
        { status: 400 }
      );
    }

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

    // Verificar visibilidad del curso
    if (!course.isPublic && course.companyId !== payload.companyId) {
      return NextResponse.json(
        { error: "No tienes acceso a este curso" },
        { status: 403 }
      );
    }

    const companyId = request.headers.get("x-company-id") || payload.companyId;

    // FIX 3: Verificar suscripción activa si el usuario pertenece a una empresa
    if (companyId) {
      const subResult = await db.execute(sql`
        SELECT id FROM subscriptions 
        WHERE "companyId" = ${companyId} 
          AND status = 'active' 
          AND "currentPeriodEnd" > NOW()
        LIMIT 1
      `);
      
      if (subResult.rows.length === 0) {
        return NextResponse.json(
          { error: "Tu empresa no tiene una suscripción activa" },
          { status: 403 }
        );
      }
    }

    try {
      // FIX 5: Use transaction to prevent race condition (duplicate enrollments)
      const enrollment = await db.transaction(async (tx) => {
        const result = await tx.execute(sql`
          INSERT INTO "enroll_course" (
            "course_id", "user_id", "company_id", "progress", "isCompleted",
            "completedChapters", "cid", "userEmail"
          ) VALUES (
            ${courseId}, ${payload.userId}, ${companyId || null}, 0, false,
            '{}', ${course.cid || ""}, ${payload.email}
          )
          ON CONFLICT ("course_id", "user_id") DO NOTHING
          RETURNING *
        `);

        if (result.rows.length === 0) {
          throw new Error("ALREADY_ENROLLED");
        }
        return result.rows[0];
      });

      return NextResponse.json(
        {
          success: true,
          message: "Inscripción exitosa",
          data: {
            enrollment: enrollment,
          },
        },
        { status: 201 }
      );
    } catch (error: any) {
      if (error.message === "ALREADY_ENROLLED") {
        return NextResponse.json(
          { error: "Ya estás inscrito en este curso" },
          { status: 409 }
        );
      }
      throw error;
    }
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

    // ===== VALIDAR UUID =====
    const idValidation = validateUUID(courseId, 'ID de curso');
    if (!idValidation.isValid) {
      return NextResponse.json(
        { error: idValidation.errors?.[0] || 'ID inválido' },
        { status: 400 }
      );
    }

    // Obtener inscripción del usuario
    const enrollmentResult = await db.execute(sql`
      SELECT
        ec.*,
        c.name as course_name,
        c.description as course_description,
        c.modules as course_modules
      FROM "enroll_course" ec
      LEFT JOIN courses c ON ec."course_id" = c.id
      WHERE ec."course_id" = ${courseId} AND ec."user_id" = ${payload.userId}
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

    const { id: courseId } = await params;

    // ===== VALIDAR UUID =====
    const idValidation = validateUUID(courseId, 'ID de curso');
    if (!idValidation.isValid) {
      return NextResponse.json(
        { error: idValidation.errors?.[0] || 'ID inválido' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { completedChapters, progress, isCompleted } = body;

    // Verificar que el usuario está inscrito
    const existingEnrollment = await db.execute(sql`
      SELECT * FROM "enroll_course"
      WHERE "course_id" = ${courseId} AND "user_id" = ${payload.userId}
    `);

    if (existingEnrollment.rows.length === 0) {
      return NextResponse.json(
        { error: "No estás inscrito en este curso" },
        { status: 404 }
      );
    }

    const enrollment = existingEnrollment.rows[0];
    const isNowCompleted = isCompleted !== undefined ? isCompleted : enrollment.isCompleted;
    const justCompleted = isNowCompleted && !enrollment.isCompleted;

    // Get course details for certificate generation (if needed)
    let courseRow: any;
    if (justCompleted) {
      const courseResult = await db.execute(sql`
        SELECT * FROM courses WHERE id = ${courseId} AND "isActive" = true
      `);
      if (courseResult.rows.length === 0) {
        console.error(`❌ Course not found for certificate generation: ${courseId}`);
        // Decide whether to fail the update or proceed without certificate generation
        // For now, we'll proceed, but log the error.
      } else {
        courseRow = courseResult.rows[0];
      }
    }

    // Actualizar progreso
    let updateQuery = sql`UPDATE "enroll_course" SET "updatedAt" = ${new Date().toISOString()}`;

    if (completedChapters !== undefined) {
      updateQuery = sql`${updateQuery}, "completedChapters" = ${JSON.stringify(completedChapters)}`;
    }
    if (progress !== undefined) {
      updateQuery = sql`${updateQuery}, "progress" = ${progress}`;
    }
    
    updateQuery = sql`${updateQuery}, "isCompleted" = ${isNowCompleted}`;
    if (justCompleted || (isNowCompleted && !enrollment.completedAt)) {
      updateQuery = sql`${updateQuery}, "completedAt" = ${new Date().toISOString()}`;
    }

    // FIX 5: Envolver en db.transaction
    const result = await db.transaction(async (tx) => {
      // 1. Actualizar enrollment
      const updatedEnrollment = await tx.execute(sql`
        ${updateQuery}
        WHERE "course_id" = ${courseId} AND "user_id" = ${payload.userId}
        RETURNING *
      `);
      
      const enrollmentRow = updatedEnrollment.rows[0];
      let certificateGenerated = false;

      // 2. Generar certificado si recién completó el curso
      if (justCompleted && courseRow) { // Only attempt if courseRow was found
        console.log(`🔍 Debug: Course completed, generating certificate for user ${payload.userId} and course ${courseId}`);
        
        // Verificar existencia previa
        const existingCert = await tx.execute(sql`
          SELECT id FROM certificates 
          WHERE "course_id" = ${courseId} AND "user_id" = ${payload.userId} AND "isActive" = true
        `);

        if (existingCert.rows.length === 0) {
          const { createCertificateData } = await import("@/lib/certificate-service");
          const { certificatesTable } = await import("@/config/schema");
          
          const certData = createCertificateData({
            courseId,
            userId: payload.userId,
            course: {
              id: String(courseRow.id),
              name: String(courseRow.name || ""),
              description: String(courseRow.description || ""),
              cid: String(courseRow.cid || ""),
            } as Course,
            enrollment: {
              id: String(enrollmentRow.id),
              courseId: String(enrollmentRow.course_id),
              userId: String(enrollmentRow.user_id),
              progress: Number(enrollmentRow.progress || 0),
              isCompleted: Boolean(enrollmentRow.isCompleted),
              completedAt: enrollmentRow.completedAt ? new Date(String(enrollmentRow.completedAt)) : undefined,
              completedChapters: [], // This might need to be populated from enrollmentRow if available
              enrolledAt: new Date(), // This might need to be populated from enrollmentRow if available
              createdAt: new Date(String(enrollmentRow.createdAt || new Date())),
              updatedAt: new Date(String(enrollmentRow.updatedAt || new Date())),
            } satisfies EnrollCourse,
            companyId: payload.companyId,
          });

          await tx.insert(certificatesTable).values(certData);
          certificateGenerated = true;
          console.log(`✅ Certificate generated logically inside transaction for user ${payload.userId} and course ${courseId}`);
        } else {
          console.log(`ℹ️ Certificate already exists for user ${payload.userId} and course ${courseId}. Skipping generation.`);
        }
      } else if (justCompleted && !courseRow) {
        console.error(`❌ Cannot generate certificate: Course details not found for course ID ${courseId}.`);
      }

      return {
        enrollment: enrollmentRow,
        certificateGenerated
      };
    });

    return NextResponse.json({
      success: true,
      message: "Progreso actualizado exitosamente",
      data: result,
    });
  } catch (error) {
    console.error("Error al actualizar progreso del curso:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// ===== DELETE - Desinscribirse de un curso =====
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

    const { id: courseId } = await params;

    // ===== VALIDAR UUID =====
    const idValidation = validateUUID(courseId, 'ID de curso');
    if (!idValidation.isValid) {
      return NextResponse.json(
        { error: idValidation.errors?.[0] || 'ID inválido' },
        { status: 400 }
      );
    }

    // Verificar que el usuario está inscrito
    const existingEnrollment = await db.execute(sql`
      SELECT * FROM "enroll_course"
      WHERE "course_id" = ${courseId} AND "user_id" = ${payload.userId}
    `);

    if (existingEnrollment.rows.length === 0) {
      return NextResponse.json(
        { error: "No estás inscrito en este curso" },
        { status: 404 }
      );
    }

    const enrollment = existingEnrollment.rows[0];

    // Evitar desinscripción de cursos completados (opcional)
    if (enrollment.isCompleted) {
      return NextResponse.json(
        {
          error: "No puedes desinscribirte de un curso completado. El certificado ya ha sido emitido.",
          code: "COURSE_COMPLETED"
        },
        { status: 400 }
      );
    }

    // Eliminar inscripción (soft delete o hard delete)
    await db.execute(sql`
      DELETE FROM "enroll_course"
      WHERE "course_id" = ${courseId} AND "user_id" = ${payload.userId}
    `);

    return NextResponse.json({
      success: true,
      message: "Te has desinscrito del curso exitosamente",
    });
  } catch (error) {
    console.error("Error al desinscribirse del curso:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
