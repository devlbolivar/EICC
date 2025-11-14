import { NextResponse } from "next/server";
import { db } from "@/config/db";
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
        COUNT(CASE WHEN status = 'Publicado' THEN 1 END) as published_courses,
        COUNT(CASE WHEN status = 'Borrador' THEN 1 END) as draft_courses,
        COUNT(CASE WHEN "isActive" = true THEN 1 END) as active_courses
      FROM courses 
      WHERE "companyId" = ${companyId}
    `);

    // Obtener estadísticas de empleados de la empresa
    const employeesStats = await db.execute(sql`
      SELECT 
        COUNT(DISTINCT uc."userId") as enrolled_employees,
        COUNT(ec."user_id") as total_enrollments,
        COUNT(CASE WHEN ec."completedAt" IS NOT NULL THEN 1 END) as completed_enrollments
      FROM "user_companies" uc
      LEFT JOIN "enrollCourse" ec ON uc."userId" = ec."user_id"
      WHERE uc."companyId" = ${companyId} AND uc."isActive" = true
    `);

    // Obtener estadísticas de certificados
    const certificatesStats = await db.execute(sql`
      SELECT 
        COUNT(*) as total_certificates,
        COUNT(CASE WHEN "issuedDate" >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as certificates_last_month,
        COUNT(CASE WHEN "issuedDate" >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as certificates_last_week
      FROM certificates 
      WHERE "company_id" = ${companyId}
    `);

    // Calcular promedio de finalización
    const completionStats = await db.execute(sql`
      SELECT 
        CASE 
          WHEN COUNT(ec."user_id") > 0 
          THEN ROUND(
            (COUNT(CASE WHEN ec."completedAt" IS NOT NULL THEN 1 END)::DECIMAL / COUNT(ec."user_id")) * 100, 
            2
          )
          ELSE 0 
        END as average_completion
      FROM "enrollCourse" ec
      JOIN courses c ON ec."course_id" = c.id
      WHERE c."companyId" = ${companyId}
    `);

    // Obtener cursos más populares
    const popularCourses = await db.execute(sql`
      SELECT 
        c.id,
        c.name,
        c."bannerImage",
        COUNT(ec."user_id") as enrollment_count
      FROM courses c
      LEFT JOIN "enrollCourse" ec ON c.id = ec."course_id"
      WHERE c."companyId" = ${companyId} AND c."isActive" = true
      GROUP BY c.id, c.name, c."bannerImage"
      ORDER BY enrollment_count DESC
      LIMIT 5
    `);

    // Obtener actividad reciente
    const recentActivity = await db.execute(sql`
      SELECT 
        'enrollment' as type,
        u.name as user_name,
        c.name as course_name,
        ec."enrolledAt" as activity_date
      FROM "enrollCourse" ec
      JOIN users u ON ec."user_id" = u.id
      JOIN courses c ON ec."course_id" = c.id
      WHERE c."companyId" = ${companyId}
      AND ec."enrolledAt" >= CURRENT_DATE - INTERVAL '7 days'
      
      UNION ALL
      
      SELECT 
        'completion' as type,
        u.name as user_name,
        c.name as course_name,
        ec."completedAt" as activity_date
      FROM "enrollCourse" ec
      JOIN users u ON ec."user_id" = u.id
      JOIN courses c ON ec."course_id" = c.id
      WHERE c."companyId" = ${companyId}
      AND ec."completedAt" >= CURRENT_DATE - INTERVAL '7 days'
      
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
