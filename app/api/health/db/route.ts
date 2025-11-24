import { NextRequest, NextResponse } from "next/server";
import { db } from "@/config/db";
import { sql } from "drizzle-orm";

/**
 * GET /api/health/db
 * Health check endpoint to verify database setup and table existence
 */
export async function GET(_req: NextRequest) {
  try {
    const requiredTables = [
      'users',
      'companies',
      'roles',
      'user_companies',
      'courses',
      'modules',
      'lessons',
      'enroll_course',
      'invoices',
      'subscriptions',
      'certificates',
      'support_tickets',
      'ticket_messages'
    ];

    const missingTables: string[] = [];
    const existingTables: string[] = [];

    // Verificar cada tabla requerida
    for (const tableName of requiredTables) {
      try {
        // Intentar hacer una consulta simple a la tabla
        await db.execute(sql`SELECT 1 FROM ${sql.raw(`"${tableName}"`)} LIMIT 1`);
        existingTables.push(tableName);
      } catch (error: unknown) {
        // Si el error es "relation does not exist", la tabla no existe
        const dbError = error as { code?: string; message?: string };
        if (dbError.code === '42P01' || dbError.message?.includes('does not exist')) {
          missingTables.push(tableName);
        } else {
          // Si es otro tipo de error, la tabla existe pero hay otro problema
          existingTables.push(tableName);
        }
      }
    }

    const isHealthy = missingTables.length === 0;
    const status = isHealthy ? 200 : 503;

    return NextResponse.json(
      {
        success: isHealthy,
        status: isHealthy ? "healthy" : "unhealthy",
        database: {
          connected: true,
          tablesChecked: requiredTables.length,
          tablesExisting: existingTables.length,
          tablesMissing: missingTables.length,
        },
        tables: {
          existing: existingTables,
          missing: missingTables,
        },
        ...(missingTables.length > 0 && {
          message: "Database migrations have not been run. Some tables are missing.",
          instructions: [
            "1. Ensure DATABASE_URL is set in your environment",
            "2. Run: npm run db:migrate",
            "3. Or run: npm run db:push",
            "4. Then run: npm run db:setup (for initial data)",
            "",
            "See README.md section '🚀 Instalación' for detailed setup instructions"
          ]
        })
      },
      { status }
    );
  } catch (error) {
    console.error("Health check error:", error);

    return NextResponse.json(
      {
        success: false,
        status: "unhealthy",
        database: {
          connected: false,
          error: error instanceof Error ? error.message : "Unknown database error"
        },
        message: "Cannot connect to database",
        instructions: [
          "1. Verify DATABASE_URL is set correctly in .env.local",
          "2. Check that your database is running",
          "3. Verify network connectivity to database",
          "",
          "See README.md for database setup instructions"
        ]
      },
      { status: 503 }
    );
  }
}
