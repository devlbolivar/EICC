import { NextResponse } from "next/server";
import { db } from "@/config/db";
import { coursesTable, userCompaniesTable, enrollCourseTable, certificatesTable, usersTable } from "@/config/schema";
import { verifyAccessToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { sql } from "drizzle-orm";

export async function GET() {
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
    if (
      !payload.permissions.includes("courses:read") &&
      !payload.permissions.includes("courses:view") &&
      !payload.permissions.includes("courses:create")
    ) {
      return NextResponse.json(
        { error: "Sin permisos para ver estadísticas" },
        { status: 403 }
      );
    }

    const companyId = payload.companyId;

    // Obtener estadísticas de cursos
    const coursesStats = await db.execute(sql`
      SELECT
        COUNT(*) as total_courses,
        COUNT(CASE WHEN ${sql.identifier(coursesTable.status.name)} = 'Publicado' THEN 1 END) as published_courses,
        COUNT(CASE WHEN ${sql.identifier(coursesTable.status.name)} = 'Borrador' THEN 1 END) as draft_courses,
        COUNT(CASE WHEN ${sql.identifier(coursesTable.isActive.name)} = true THEN 1 END) as active_courses
      FROM ${sql.identifier(coursesTable._.name)}
      WHERE ${sql.identifier(coursesTable.companyId.name)} = ${companyId}
    `);

    // Obtener estadísticas de empleados de la empresa
    const employeesStats = await db.execute(sql`
      SELECT
        COUNT(DISTINCT uc.${sql.identifier(userCompaniesTable.userId.name)}) as enrolled_employees,
        COUNT(ec.${sql.identifier(enrollCourseTable.userId.name)}) as total_enrollments,
        COUNT(CASE WHEN ec.${sql.identifier(enrollCourseTable.completedAt.name)} IS NOT NULL THEN 1 END) as completed_enrollments
      FROM ${sql.identifier(userCompaniesTable._.name)} uc
      LEFT JOIN ${sql.identifier(enrollCourseTable._.name)} ec ON uc.${sql.identifier(userCompaniesTable.userId.name)} = ec.${sql.identifier(enrollCourseTable.userId.name)}
      WHERE uc.${sql.identifier(userCompaniesTable.companyId.name)} = ${companyId} AND uc.${sql.identifier(userCompaniesTable.isActive.name)} = true
    `);

    // Obtener estadísticas de certificados
    const certificatesStats = await db.execute(sql`
      SELECT
        COUNT(*) as total_certificates,
        COUNT(CASE WHEN ${sql.identifier(certificatesTable.issuedDate.name)} >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as certificates_last_month,
        COUNT(CASE WHEN ${sql.identifier(certificatesTable.issuedDate.name)} >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as certificates_last_week
      FROM ${sql.identifier(certificatesTable._.name)}
      WHERE ${sql.identifier(certificatesTable.companyId.name)} = ${companyId}
    `);

    // Calcular promedio de finalización
    const completionStats = await db.execute(sql`
      SELECT
        CASE
          WHEN COUNT(ec.${sql.identifier(enrollCourseTable.userId.name)}) > 0
          THEN ROUND(
            (COUNT(CASE WHEN ec.${sql.identifier(enrollCourseTable.completedAt.name)} IS NOT NULL THEN 1 END)::DECIMAL / COUNT(ec.${sql.identifier(enrollCourseTable.userId.name)})) * 100,
            2
          )
          ELSE 0
        END as average_completion
      FROM ${sql.identifier(enrollCourseTable._.name)} ec
      JOIN ${sql.identifier(coursesTable._.name)} c ON ec.${sql.identifier(enrollCourseTable.courseId.name)} = c.${sql.identifier(coursesTable.id.name)}
      WHERE c.${sql.identifier(coursesTable.companyId.name)} = ${companyId}
    `);

    // Obtener cursos más populares
    const popularCourses = await db.execute(sql`
      SELECT
        c.${sql.identifier(coursesTable.id.name)},
        c.${sql.identifier(coursesTable.name.name)},
        c.${sql.identifier(coursesTable.bannerImage.name)},
        COUNT(ec.${sql.identifier(enrollCourseTable.userId.name)}) as enrollment_count
      FROM ${sql.identifier(coursesTable._.name)} c
      LEFT JOIN ${sql.identifier(enrollCourseTable._.name)} ec ON c.${sql.identifier(coursesTable.id.name)} = ec.${sql.identifier(enrollCourseTable.courseId.name)}
      WHERE c.${sql.identifier(coursesTable.companyId.name)} = ${companyId} AND c.${sql.identifier(coursesTable.isActive.name)} = true
      GROUP BY c.${sql.identifier(coursesTable.id.name)}, c.${sql.identifier(coursesTable.name.name)}, c.${sql.identifier(coursesTable.bannerImage.name)}
      ORDER BY enrollment_count DESC
      LIMIT 5
    `);

    // Obtener actividad reciente
    const recentActivity = await db.execute(sql`
      SELECT
        'enrollment' as type,
        u.${sql.identifier(usersTable.name.name)} as user_name,
        c.${sql.identifier(coursesTable.name.name)} as course_name,
        ec.${sql.identifier(enrollCourseTable.enrolledAt.name)} as activity_date
      FROM ${sql.identifier(enrollCourseTable._.name)} ec
      JOIN ${sql.identifier(usersTable._.name)} u ON ec.${sql.identifier(enrollCourseTable.userId.name)} = u.${sql.identifier(usersTable.id.name)}
      JOIN ${sql.identifier(coursesTable._.name)} c ON ec.${sql.identifier(enrollCourseTable.courseId.name)} = c.${sql.identifier(coursesTable.id.name)}
      WHERE c.${sql.identifier(coursesTable.companyId.name)} = ${companyId}
      AND ec.${sql.identifier(enrollCourseTable.enrolledAt.name)} >= CURRENT_DATE - INTERVAL '7 days'

      UNION ALL

      SELECT
        'completion' as type,
        u.${sql.identifier(usersTable.name.name)} as user_name,
        c.${sql.identifier(coursesTable.name.name)} as course_name,
        ec.${sql.identifier(enrollCourseTable.completedAt.name)} as activity_date
      FROM ${sql.identifier(enrollCourseTable._.name)} ec
      JOIN ${sql.identifier(usersTable._.name)} u ON ec.${sql.identifier(enrollCourseTable.userId.name)} = u.${sql.identifier(usersTable.id.name)}
      JOIN ${sql.identifier(coursesTable._.name)} c ON ec.${sql.identifier(enrollCourseTable.courseId.name)} = c.${sql.identifier(coursesTable.id.name)}
      WHERE c.${sql.identifier(coursesTable.companyId.name)} = ${companyId}
      AND ec.${sql.identifier(enrollCourseTable.completedAt.name)} >= CURRENT_DATE - INTERVAL '7 days'

      ORDER BY activity_date DESC
      LIMIT 10
    `);

    const stats = {
      courses: {
        total: parseInt(String(coursesStats.rows[0]?.total_courses || "0")),
        published: parseInt(
          String(coursesStats.rows[0]?.published_courses || "0")
        ),
        draft: parseInt(String(coursesStats.rows[0]?.draft_courses || "0")),
        active: parseInt(String(coursesStats.rows[0]?.active_courses || "0")),
      },
      employees: {
        enrolled: parseInt(
          String(employeesStats.rows[0]?.enrolled_employees || "0")
        ),
        totalEnrollments: parseInt(
          String(employeesStats.rows[0]?.total_enrollments || "0")
        ),
        completed: parseInt(
          String(employeesStats.rows[0]?.completed_enrollments || "0")
        ),
      },
      certificates: {
        total: parseInt(
          String(certificatesStats.rows[0]?.total_certificates || "0")
        ),
        lastMonth: parseInt(
          String(certificatesStats.rows[0]?.certificates_last_month || "0")
        ),
        lastWeek: parseInt(
          String(certificatesStats.rows[0]?.certificates_last_week || "0")
        ),
      },
      completion: {
        average: parseFloat(
          String(completionStats.rows[0]?.average_completion || "0")
        ),
      },
      popularCourses: popularCourses.rows || [],
      recentActivity: recentActivity.rows || [],
    };

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Error al obtener estadísticas:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
