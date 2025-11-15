import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/database";
import * as schema from "@/config/schema";
import { verifyAdminAuth } from "@/lib/admin-auth";
import { eq, desc } from "drizzle-orm";
import { ERROR_MESSAGES } from "@/lib/constants";

export async function GET(request: NextRequest) {
  try {
    // ===== VERIFICAR AUTENTICACIÓN Y PERMISOS DE ADMIN =====
    const authResult = await verifyAdminAuth(request);
    if (!authResult.authorized) {
      return authResult.response;
    }

    // ===== OBTENER ENROLLMENTS DE LA BASE DE DATOS =====
    const enrollments = await db
      .select({
        id: schema.enrollCourseTable.id,
        courseId: schema.enrollCourseTable.courseId,
        userId: schema.enrollCourseTable.userId,
        companyId: schema.enrollCourseTable.companyId,
        progress: schema.enrollCourseTable.progress,
        isCompleted: schema.enrollCourseTable.isCompleted,
        completedAt: schema.enrollCourseTable.completedAt,
        enrolledAt: schema.enrollCourseTable.enrolledAt,
        // Datos del usuario
        userName: schema.usersTable.name,
        userEmail: schema.usersTable.email,
        // Datos del curso
        courseName: schema.coursesTable.name,
        // Datos de la empresa
        companyName: schema.companiesTable.name,
      })
      .from(schema.enrollCourseTable)
      .leftJoin(
        schema.usersTable,
        eq(schema.enrollCourseTable.userId, schema.usersTable.id)
      )
      .leftJoin(
        schema.coursesTable,
        eq(schema.enrollCourseTable.courseId, schema.coursesTable.id)
      )
      .leftJoin(
        schema.companiesTable,
        eq(schema.enrollCourseTable.companyId, schema.companiesTable.id)
      )
      .orderBy(desc(schema.enrollCourseTable.enrolledAt));

    return NextResponse.json({
      success: true,
      data: enrollments,
    });
  } catch (error) {
    console.error("Error obteniendo enrollments:", error);
    return NextResponse.json(
      {
        error: ERROR_MESSAGES.SERVER_ERROR,
        details:
          error instanceof Error ? error.message : ERROR_MESSAGES.UNKNOWN_ERROR,
      },
      { status: 500 }
    );
  }
}
