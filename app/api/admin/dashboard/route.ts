import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/database";
import * as schema from "@/config/schema";
import { verifyAdminAuth } from "@/lib/admin-auth";
import { eq, and, count, sql, isNotNull } from "drizzle-orm";
import { ERROR_MESSAGES } from "@/lib/constants";

export async function GET(request: NextRequest) {
  try {
    // ===== VERIFICAR AUTENTICACIÓN Y PERMISOS DE ADMIN =====
    const authResult = await verifyAdminAuth(request);
    if (!authResult.authorized) {
      return authResult.response;
    }

    // ===== OBTENER ESTADÍSTICAS DE LA BASE DE DATOS =====

    // Contar usuarios activos
    const activeUsersResult = await db
      .select({ count: count() })
      .from(schema.usersTable)
      .where(eq(schema.usersTable.isActive, true));

    // Contar empresas activas
    const activeCompaniesResult = await db
      .select({ count: count() })
      .from(schema.companiesTable)
      .where(eq(schema.companiesTable.isActive, true));

    // Contar cursos publicados
    const publishedCoursesResult = await db
      .select({ count: count() })
      .from(schema.coursesTable)
      .where(
        and(
          eq(schema.coursesTable.isActive, true),
          eq(schema.coursesTable.status, "Publicado")
        )
      );

    // Contar inscripciones totales
    const totalEnrollmentsResult = await db
      .select({ count: count() })
      .from(schema.enrollCourseTable);

    // Contar cursos completados
    const completedCoursesResult = await db
      .select({ count: count() })
      .from(schema.enrollCourseTable)
      .where(eq(schema.enrollCourseTable.isCompleted, true));

    // Obtener cursos más populares (con más inscripciones)
    const popularCoursesResult = await db
      .select({
        courseId: schema.enrollCourseTable.courseId,
        enrollmentCount: count(),
      })
      .from(schema.enrollCourseTable)
      .groupBy(schema.enrollCourseTable.courseId)
      .orderBy(sql`count(*) DESC`)
      .limit(5);

    // Obtener detalles de los cursos populares
    const popularCoursesDetails = await Promise.all(
      popularCoursesResult.map(async (popularCourse) => {
        if (!popularCourse.courseId) return null;

        const course = await db.query.coursesTable.findFirst({
          where: eq(schema.coursesTable.id, popularCourse.courseId),
        });
        return course
          ? {
              ...course,
              enrollmentCount: Number(popularCourse.enrollmentCount),
            }
          : null;
      })
    );

    // Obtener estadísticas de usuarios por empresa
    const usersByCompanyResult = await db
      .select({
        companyId: schema.userCompaniesTable.companyId,
        userCount: count(),
      })
      .from(schema.userCompaniesTable)
      .where(
        and(
          eq(schema.userCompaniesTable.isActive, true),
          isNotNull(schema.userCompaniesTable.companyId)
        )
      )
      .groupBy(schema.userCompaniesTable.companyId);

    // Obtener detalles de las empresas con más usuarios
    const companiesWithUserCounts = await Promise.all(
      usersByCompanyResult
        .sort((a, b) => Number(b.userCount) - Number(a.userCount))
        .slice(0, 5)
        .map(async (companyStats) => {
          if (!companyStats.companyId) return null;

          const company = await db.query.companiesTable.findFirst({
            where: eq(schema.companiesTable.id, companyStats.companyId),
          });
          return company
            ? {
                ...company,
                userCount: Number(companyStats.userCount),
              }
            : null;
        })
    );

    // ===== PREPARAR RESPUESTA =====
    const dashboardData = {
      statistics: {
        activeUsers: Number(activeUsersResult[0]?.count) || 0,
        activeCompanies: Number(activeCompaniesResult[0]?.count) || 0,
        publishedCourses: Number(publishedCoursesResult[0]?.count) || 0,
        totalEnrollments: Number(totalEnrollmentsResult[0]?.count) || 0,
        completedCourses: Number(completedCoursesResult[0]?.count) || 0,
      },
      popularCourses: popularCoursesDetails.filter(Boolean),
      topCompanies: companiesWithUserCounts.filter(Boolean),
    };

    return NextResponse.json({
      success: true,
      data: dashboardData,
    });
  } catch (error) {
    console.error("Error obteniendo datos del dashboard:", error);
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
