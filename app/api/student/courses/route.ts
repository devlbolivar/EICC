import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/database";
import { enrollCourseTable, certificatesTable } from "@/config/schema";
import { coursesTable } from "@/config/schema";
import { eq, and } from "drizzle-orm";
import {
  DatabaseEnrolledCourse,
  EnrolledCourseResponse,
  transformToEnrolledCourses,
} from "@/app/types";
import { verifyStudentAuth } from "@/lib/admin-auth";
import { apiRateLimit } from "@/lib/rate-limit";

export async function GET(req: NextRequest) {
  try {
    // Rate limiting: 60 requests por minuto
    const rateLimitResponse = await apiRateLimit(req);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }
  } catch {
    // Continuar si hay error en rate limit
  }

  // ✅ SEGURO: Verificar autenticación desde JWT en cookies
  const authResult = await verifyStudentAuth(req);

  if (!authResult.authorized) {
    return authResult.response;
  }

  // Obtener userId del token verificado (no manipulable por el cliente)
  const userId = authResult.payload.userId;

  try {
    // Consulta con nombres originales de la base de datos
    const dbCourses = await db
      .select({
        id: coursesTable.id,
        name: coursesTable.name,
        description: coursesTable.description,
        progress: enrollCourseTable.progress,
        numberOfChapters: coursesTable.numberOfChapters,
        completedChapters: enrollCourseTable.completedChapters,
        isCompleted: enrollCourseTable.isCompleted,
        completedAt: enrollCourseTable.completedAt,
        estimatedDuration: coursesTable.estimatedDuration,
        updatedAt: enrollCourseTable.updatedAt,
        bannerImage: coursesTable.bannerImage,
        category: coursesTable.category,
        level: coursesTable.level,
        certificateId: certificatesTable.certificateId,
      })
      .from(enrollCourseTable)
      .innerJoin(coursesTable, eq(enrollCourseTable.courseId, coursesTable.id))
      .leftJoin(
        certificatesTable,
        and(
          eq(certificatesTable.courseId, coursesTable.id),
          eq(certificatesTable.userId, userId),
          eq(certificatesTable.isActive, true)
        )
      )
      .where(eq(enrollCourseTable.userId, userId));

    // Transformar a formato de respuesta API
    const enrolledCourses: EnrolledCourseResponse[] = transformToEnrolledCourses(
      dbCourses as DatabaseEnrolledCourse[]
    );

    return NextResponse.json({
      success: true,
      data: enrolledCourses,
    });
  } catch (error) {
    console.error("Error fetching enrolled courses:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
