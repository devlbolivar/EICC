import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "@/config/schema";
import { verifyAccessToken } from "@/lib/auth";
import { eq, and, sql } from "drizzle-orm";

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

    // ===== OBTENER USUARIO PARA VERIFICAR EMAIL =====
    const user = await db.query.usersTable.findFirst({
      where: eq(schema.usersTable.id, payload.userId),
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // ===== OBTENER ESTADÍSTICAS DE CURSOS COMPLETADOS =====
    // Intentar primero por userId, luego por userEmail como fallback
    let completedCoursesResult = await db
      .select({
        count: sql<number>`count(*)`,
      })
      .from(schema.enrollCourseTable)
      .where(
        and(
          eq(schema.enrollCourseTable.userId, payload.userId),
          eq(schema.enrollCourseTable.isCompleted, true)
        )
      );

    // Si no hay resultados por userId, intentar por userEmail
    if (completedCoursesResult[0]?.count === 0) {
      completedCoursesResult = await db
        .select({
          count: sql<number>`count(*)`,
        })
        .from(schema.enrollCourseTable)
        .where(
          and(
            eq(schema.enrollCourseTable.userEmail, user.email),
            eq(schema.enrollCourseTable.isCompleted, true)
          )
        );
    }

    const coursesCompleted = completedCoursesResult[0]?.count || 0;

    // ===== OBTENER TOTAL DE CURSOS INSCRITOS =====
    let totalEnrollmentsResult = await db
      .select({
        count: sql<number>`count(*)`,
      })
      .from(schema.enrollCourseTable)
      .where(eq(schema.enrollCourseTable.userId, payload.userId));

    // Si no hay resultados por userId, intentar por userEmail
    if (totalEnrollmentsResult[0]?.count === 0) {
      totalEnrollmentsResult = await db
        .select({
          count: sql<number>`count(*)`,
        })
        .from(schema.enrollCourseTable)
        .where(eq(schema.enrollCourseTable.userEmail, user.email));
    }

    const totalEnrollments = totalEnrollmentsResult[0]?.count || 0;

    // ===== CALCULAR HORAS DE ESTUDIO ESTIMADAS =====
    // Por ahora, estimamos 2 horas por curso completado
    // En el futuro, esto podría calcularse basándose en el contenido real
    const totalStudyHours = coursesCompleted * 2;

    // ===== OBTENER CERTIFICADOS (por ahora igual a cursos completados) =====
    const certificatesEarned = coursesCompleted;

    // ===== OBTENER PROGRESO PROMEDIO =====
    let progressResult = await db
      .select({
        avgProgress: sql<number>`avg(${schema.enrollCourseTable.progress})`,
      })
      .from(schema.enrollCourseTable)
      .where(eq(schema.enrollCourseTable.userId, payload.userId));

    // Si no hay resultados por userId, intentar por userEmail
    if (progressResult[0]?.avgProgress === null) {
      progressResult = await db
        .select({
          avgProgress: sql<number>`avg(${schema.enrollCourseTable.progress})`,
        })
        .from(schema.enrollCourseTable)
        .where(eq(schema.enrollCourseTable.userEmail, user.email));
    }

    // ===== DEBUG: Verificar si hay datos de inscripciones =====
    const allEnrollments = await db
      .select()
      .from(schema.enrollCourseTable)
      .where(eq(schema.enrollCourseTable.userId, payload.userId))
      .limit(5);

    // ===== DEBUG: Verificar todos los enrollments para ver si hay datos =====
    const allEnrollmentsInDB = await db
      .select()
      .from(schema.enrollCourseTable)
      .limit(10);

    console.log("Statistics Debug:", {
      userId: payload.userId,
      userEmail: user.email,
      coursesCompleted,
      totalEnrollments,
      totalStudyHours,
      certificatesEarned,
      allEnrollments: allEnrollments.length,
      sampleEnrollments: allEnrollments.map((e) => ({
        id: e.id,
        courseId: e.courseId,
        userId: e.userId,
        userEmail: e.userEmail,
        isCompleted: e.isCompleted,
        progress: e.progress,
      })),
      totalEnrollmentsInDB: allEnrollmentsInDB.length,
    });

    const averageProgress = progressResult[0]?.avgProgress || 0;

    return NextResponse.json({
      success: true,
      data: {
        coursesCompleted,
        totalEnrollments,
        certificatesEarned,
        totalStudyHours,
        averageProgress: Math.round(averageProgress),
      },
    });
  } catch (error) {
    console.error("Error obteniendo estadísticas del usuario:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
