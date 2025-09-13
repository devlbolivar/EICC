import { NextRequest, NextResponse } from "next/server";
import { db } from "@/config/db";
import { sql } from "drizzle-orm";
import { verifyAccessToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { generateCertificateForCompletion } from "@/lib/certificate-service";

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
      WHERE "course_id" = ${courseId} AND "user_id" = ${payload.userId}
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
    console.log("Course data:", {
      cid: course.cid,
      courseId,
      userId: payload.userId,
      companyId: payload.companyId,
      email: payload.email,
    });

    const enrollment = await db.execute(sql`
      INSERT INTO "enrollCourse" (
        "course_id", "user_id", "company_id", "progress", "isCompleted", 
        "completedChapters", "cid", "userEmail"
      ) VALUES (
        ${courseId}, ${payload.userId}, ${payload.companyId || null}, 0, false, 
        '{}', ${course.cid || ""}, ${payload.email}
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
      WHERE "course_id" = ${courseId} AND "user_id" = ${payload.userId}
    `);

    if (existingEnrollment.rows.length === 0) {
      return NextResponse.json(
        { error: "No estás inscrito en este curso" },
        { status: 404 }
      );
    }

    // Actualizar progreso - use individual field updates
    let updateQuery = sql`UPDATE "enrollCourse" SET "updatedAt" = ${new Date().toISOString()}`;

    if (completedChapters !== undefined) {
      updateQuery = sql`${updateQuery}, "completedChapters" = ${JSON.stringify(
        completedChapters
      )}`;
    }
    if (progress !== undefined) {
      updateQuery = sql`${updateQuery}, "progress" = ${progress}`;
    }
    if (isCompleted !== undefined) {
      updateQuery = sql`${updateQuery}, "isCompleted" = ${isCompleted}`;
      if (isCompleted) {
        updateQuery = sql`${updateQuery}, "completedAt" = ${new Date()}`;
      }
    }

    const updatedEnrollment = await db.execute(sql`
      ${updateQuery}
      WHERE "course_id" = ${courseId} AND "user_id" = ${payload.userId}
      RETURNING *
    `);

    // If course is completed, generate certificate automatically
    let certificateGenerated = false;
    if (isCompleted) {
      console.log(
        `🔍 Debug: Course completed, generating certificate for user ${payload.userId} and course ${courseId}`
      );

      try {
        // Get course details for certificate generation
        const courseResult = await db.execute(sql`
          SELECT * FROM courses WHERE id = ${courseId} AND "isActive" = true
        `);

        console.log(`🔍 Debug: Course query result`, {
          courseFound: courseResult.rows.length > 0,
        });

        if (courseResult.rows.length > 0) {
          const course = courseResult.rows[0] as any;
          const enrollment = updatedEnrollment.rows[0] as any;

          console.log(`🔍 Debug: Certificate generation data`, {
            courseId,
            userId: payload.userId,
            courseName: course.name,
            companyId: payload.companyId,
          });

          const certificateResult = await generateCertificateForCompletion({
            courseId,
            userId: payload.userId,
            course,
            enrollment,
            companyId: payload.companyId,
          });

          certificateGenerated = certificateResult.success;

          console.log(
            `🔍 Debug: Certificate generation result`,
            certificateResult
          );

          if (certificateResult.success) {
            console.log(
              `✅ Certificate generated for user ${payload.userId} and course ${courseId}`
            );
          } else {
            console.error(
              `❌ Failed to generate certificate: ${certificateResult.error}`
            );
          }
        } else {
          console.error(
            `❌ Course not found for certificate generation: ${courseId}`
          );
        }
      } catch (error) {
        console.error("❌ Error generating certificate:", error);
        // Don't fail the progress update if certificate generation fails
      }
    } else {
      console.log(
        `🔍 Debug: Course not completed yet (progress: ${progress}%)`
      );
    }

    return NextResponse.json({
      success: true,
      message: "Progreso actualizado exitosamente",
      data: {
        enrollment: updatedEnrollment.rows[0],
        certificateGenerated,
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
