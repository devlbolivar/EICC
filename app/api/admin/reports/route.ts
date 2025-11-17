import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/database";
import * as schema from "@/config/schema";
import { verifyAdminAuth } from "@/lib/admin-auth";
import { eq, sql } from "drizzle-orm";
import { ERROR_MESSAGES } from "@/lib/constants";

// ===== Helper para convertir datos a CSV =====
function convertToCSV(data: Record<string, unknown>[], headers: string[]): string {
  const headerRow = headers.join(",");
  const rows = data.map((row) =>
    headers.map((header) => {
      const value = row[header];
      // Escapar valores que contienen comas o comillas
      if (value && typeof value === "string" && (value.includes(",") || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value ?? "";
    }).join(",")
  );
  return [headerRow, ...rows].join("\n");
}

export async function GET(request: NextRequest) {
  try {
    // ===== VERIFICAR AUTENTICACIÓN Y PERMISOS DE ADMIN =====
    const authResult = await verifyAdminAuth(request);
    if (!authResult.authorized) {
      return authResult.response;
    }

    // ===== OBTENER PARÁMETROS DE BÚSQUEDA =====
    const { searchParams } = new URL(request.url);
    const reportType = searchParams.get("type");
    const format = searchParams.get("format") || "json"; // json o csv

    if (!reportType) {
      return NextResponse.json(
        { error: "Tipo de reporte requerido" },
        { status: 400 }
      );
    }

    let reportData: { rows: Record<string, unknown>[] };
    let headers: string[] = [];
    let filename = `reporte-${reportType}-${Date.now()}`;

    // ===== GENERAR REPORTES SEGÚN EL TIPO =====
    switch (reportType) {
      // ===== REPORTES DE USUARIOS =====
      case "users-monthly":
        reportData = await db.execute(sql`
          SELECT
            DATE_TRUNC('month', "createdAt") as month,
            COUNT(*) as count,
            COUNT(CASE WHEN role = 'admin' THEN 1 END) as admins,
            COUNT(CASE WHEN role = 'user' THEN 1 END) as users
          FROM users
          GROUP BY DATE_TRUNC('month', "createdAt")
          ORDER BY month DESC
        `);
        headers = ["month", "count", "admins", "users"];
        filename = `usuarios-por-mes-${Date.now()}`;
        break;

      case "users-activity":
        // Simulando actividad - en producción se debería tener una tabla de logs
        reportData = await db
          .select({
            id: schema.usersTable.id,
            name: schema.usersTable.name,
            email: schema.usersTable.email,
            enrollments: sql<number>`COUNT(DISTINCT ${schema.enrollCourseTable.id})`,
            completedCourses: sql<number>`COUNT(DISTINCT CASE WHEN ${schema.enrollCourseTable.isCompleted} = true THEN ${schema.enrollCourseTable.id} END)`,
            certificates: sql<number>`COUNT(DISTINCT ${schema.certificatesTable.id})`,
          })
          .from(schema.usersTable)
          .leftJoin(
            schema.enrollCourseTable,
            eq(schema.usersTable.id, schema.enrollCourseTable.userId)
          )
          .leftJoin(
            schema.certificatesTable,
            eq(schema.usersTable.id, schema.certificatesTable.userId)
          )
          .groupBy(schema.usersTable.id, schema.usersTable.name, schema.usersTable.email);
        reportData = { rows: reportData };
        headers = ["id", "name", "email", "enrollments", "completedCourses", "certificates"];
        filename = `actividad-usuarios-${Date.now()}`;
        break;

      case "users-by-role":
        reportData = await db.execute(sql`
          SELECT
            role,
            COUNT(*) as count,
            ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
          FROM users
          GROUP BY role
          ORDER BY count DESC
        `);
        headers = ["role", "count", "percentage"];
        filename = `usuarios-por-rol-${Date.now()}`;
        break;

      // ===== REPORTES DE CURSOS =====
      case "courses-popular":
        reportData = await db
          .select({
            id: schema.coursesTable.id,
            name: schema.coursesTable.name,
            category: schema.coursesTable.category,
            enrollments: sql<number>`COUNT(DISTINCT ${schema.enrollCourseTable.id})`,
            completions: sql<number>`COUNT(DISTINCT CASE WHEN ${schema.enrollCourseTable.isCompleted} = true THEN ${schema.enrollCourseTable.id} END)`,
            certificates: sql<number>`COUNT(DISTINCT ${schema.certificatesTable.id})`,
          })
          .from(schema.coursesTable)
          .leftJoin(
            schema.enrollCourseTable,
            eq(schema.coursesTable.id, schema.enrollCourseTable.courseId)
          )
          .leftJoin(
            schema.certificatesTable,
            eq(schema.coursesTable.id, schema.certificatesTable.courseId)
          )
          .groupBy(schema.coursesTable.id, schema.coursesTable.name, schema.coursesTable.category)
          .orderBy(sql`COUNT(DISTINCT ${schema.enrollCourseTable.id}) DESC`);
        reportData = { rows: reportData };
        headers = ["id", "name", "category", "enrollments", "completions", "certificates"];
        filename = `cursos-populares-${Date.now()}`;
        break;

      case "courses-completion":
        reportData = await db.execute(sql`
          SELECT
            c.id,
            c.name,
            c.category,
            COUNT(DISTINCT ec.id) as total_enrollments,
            COUNT(DISTINCT CASE WHEN ec."isCompleted" = true THEN ec.id END) as completed,
            ROUND(
              COUNT(DISTINCT CASE WHEN ec."isCompleted" = true THEN ec.id END) * 100.0 /
              NULLIF(COUNT(DISTINCT ec.id), 0),
              2
            ) as completion_rate
          FROM courses c
          LEFT JOIN "enrollCourse" ec ON c.id = ec."course_id"
          GROUP BY c.id, c.name, c.category
          HAVING COUNT(DISTINCT ec.id) > 0
          ORDER BY completion_rate DESC
        `);
        headers = ["id", "name", "category", "total_enrollments", "completed", "completion_rate"];
        filename = `tasa-finalizacion-${Date.now()}`;
        break;

      case "courses-ratings":
        // Simulando ratings - en producción habría una tabla de ratings
        reportData = await db
          .select({
            id: schema.coursesTable.id,
            name: schema.coursesTable.name,
            category: schema.coursesTable.category,
            avgGrade: sql<number>`ROUND(AVG(${schema.certificatesTable.grade}), 2)`,
            totalCertificates: sql<number>`COUNT(${schema.certificatesTable.id})`,
          })
          .from(schema.coursesTable)
          .leftJoin(
            schema.certificatesTable,
            eq(schema.coursesTable.id, schema.certificatesTable.courseId)
          )
          .groupBy(schema.coursesTable.id, schema.coursesTable.name, schema.coursesTable.category)
          .having(sql`COUNT(${schema.certificatesTable.id}) > 0`)
          .orderBy(sql`AVG(${schema.certificatesTable.grade}) DESC`);
        reportData = { rows: reportData };
        headers = ["id", "name", "category", "avgGrade", "totalCertificates"];
        filename = `evaluaciones-cursos-${Date.now()}`;
        break;

      // ===== REPORTES DE EMPRESAS =====
      case "companies-by-plan":
        reportData = await db.execute(sql`
          SELECT
            s.plan,
            COUNT(DISTINCT s.company_id) as companies,
            SUM(CASE WHEN s.status = 'active' THEN 1 ELSE 0 END) as active,
            SUM(CASE WHEN s.status = 'inactive' THEN 1 ELSE 0 END) as inactive
          FROM subscriptions s
          GROUP BY s.plan
          ORDER BY companies DESC
        `);
        headers = ["plan", "companies", "active", "inactive"];
        filename = `empresas-por-plan-${Date.now()}`;
        break;

      case "companies-renewals":
        reportData = await db.execute(sql`
          SELECT
            comp.id,
            comp.name,
            s.plan,
            s."startDate",
            s."endDate",
            CASE
              WHEN s."endDate" < NOW() THEN 'Expirada'
              WHEN s."endDate" < NOW() + INTERVAL '30 days' THEN 'Por vencer'
              ELSE 'Activa'
            END as status
          FROM companies comp
          LEFT JOIN subscriptions s ON comp.id = s.company_id
          WHERE s.status = 'active'
          ORDER BY s."endDate" ASC
        `);
        headers = ["id", "name", "plan", "startDate", "endDate", "status"];
        filename = `renovaciones-${Date.now()}`;
        break;

      case "companies-activity":
        reportData = await db
          .select({
            id: schema.companiesTable.id,
            name: schema.companiesTable.name,
            totalUsers: sql<number>`COUNT(DISTINCT ${schema.usersTable.id})`,
            totalEnrollments: sql<number>`COUNT(DISTINCT ${schema.enrollCourseTable.id})`,
            completedCourses: sql<number>`COUNT(DISTINCT CASE WHEN ${schema.enrollCourseTable.isCompleted} = true THEN ${schema.enrollCourseTable.id} END)`,
            certificates: sql<number>`COUNT(DISTINCT ${schema.certificatesTable.id})`,
          })
          .from(schema.companiesTable)
          .leftJoin(
            schema.usersTable,
            eq(schema.companiesTable.id, schema.usersTable.companyId)
          )
          .leftJoin(
            schema.enrollCourseTable,
            eq(schema.companiesTable.id, schema.enrollCourseTable.companyId)
          )
          .leftJoin(
            schema.certificatesTable,
            eq(schema.companiesTable.id, schema.certificatesTable.companyId)
          )
          .groupBy(schema.companiesTable.id, schema.companiesTable.name)
          .orderBy(sql`COUNT(DISTINCT ${schema.enrollCourseTable.id}) DESC`);
        reportData = { rows: reportData };
        headers = ["id", "name", "totalUsers", "totalEnrollments", "completedCourses", "certificates"];
        filename = `actividad-empresas-${Date.now()}`;
        break;

      // ===== REPORTES FINANCIEROS =====
      case "financial-monthly":
        reportData = await db.execute(sql`
          SELECT
            DATE_TRUNC('month', s."startDate") as month,
            COUNT(*) as subscriptions,
            SUM(CASE
              WHEN s.plan = 'enterprise' THEN 500
              WHEN s.plan = 'corporate' THEN 300
              WHEN s.plan = 'startup' THEN 100
              ELSE 0
            END) as revenue
          FROM subscriptions s
          WHERE s.status = 'active'
          GROUP BY DATE_TRUNC('month', s."startDate")
          ORDER BY month DESC
        `);
        headers = ["month", "subscriptions", "revenue"];
        filename = `ingresos-mensuales-${Date.now()}`;
        break;

      case "financial-plans":
        reportData = await db.execute(sql`
          SELECT
            plan,
            COUNT(*) as count,
            SUM(CASE
              WHEN plan = 'enterprise' THEN 500
              WHEN plan = 'corporate' THEN 300
              WHEN plan = 'startup' THEN 100
              ELSE 0
            END) as total_revenue,
            ROUND(AVG(CASE
              WHEN plan = 'enterprise' THEN 500
              WHEN plan = 'corporate' THEN 300
              WHEN plan = 'startup' THEN 100
              ELSE 0
            END), 2) as avg_revenue
          FROM subscriptions
          WHERE status = 'active'
          GROUP BY plan
          ORDER BY total_revenue DESC
        `);
        headers = ["plan", "count", "total_revenue", "avg_revenue"];
        filename = `planes-vendidos-${Date.now()}`;
        break;

      case "financial-churn":
        reportData = await db.execute(sql`
          SELECT
            DATE_TRUNC('month', s."endDate") as month,
            COUNT(*) as total_subscriptions,
            SUM(CASE WHEN s.status = 'inactive' THEN 1 ELSE 0 END) as cancelled,
            ROUND(
              SUM(CASE WHEN s.status = 'inactive' THEN 1 ELSE 0 END) * 100.0 /
              COUNT(*),
              2
            ) as churn_rate
          FROM subscriptions s
          GROUP BY DATE_TRUNC('month', s."endDate")
          ORDER BY month DESC
        `);
        headers = ["month", "total_subscriptions", "cancelled", "churn_rate"];
        filename = `churn-rate-${Date.now()}`;
        break;

      default:
        return NextResponse.json(
          { error: "Tipo de reporte no válido" },
          { status: 400 }
        );
    }

    // ===== DEVOLVER EN EL FORMATO SOLICITADO =====
    if (format === "csv") {
      const csv = convertToCSV(reportData.rows, headers);
      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="${filename}.csv"`,
        },
      });
    } else {
      return NextResponse.json({
        success: true,
        data: reportData.rows,
        filename: `${filename}.json`,
      });
    }
  } catch (error) {
    console.error("Error generando reporte:", error);
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
