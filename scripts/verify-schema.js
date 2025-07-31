// Cargar variables de entorno
require("dotenv").config();

const { neon } = require("@neondatabase/serverless");
const { drizzle } = require("drizzle-orm/neon-http");
const { sql } = require("drizzle-orm");

// Configuración de la base de datos
const pg = neon(process.env.DATABASE_URL);
const db = drizzle(pg);

async function verifySchema() {
  try {
    console.log("🔍 Verificando consistencia del schema...");

    // Verificar estructura de la tabla courses
    const coursesStructure = await db.execute(sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'courses' 
      ORDER BY ordinal_position
    `);

    console.log("\n📊 Estructura actual de la tabla courses:");
    coursesStructure.rows.forEach((row) => {
      console.log(
        `  - ${row.column_name}: ${row.data_type} ${
          row.is_nullable === "YES" ? "NULL" : "NOT NULL"
        } ${row.column_default ? `DEFAULT ${row.column_default}` : ""}`
      );
    });

    // Verificar columnas esperadas del schema unificado
    const expectedColumns = [
      "id",
      "cid",
      "name",
      "description",
      "numberOfChapters",
      "includeVideos",
      "difficulty",
      "category",
      "courseJson",
      "bannerImage",
      "courseContent",
      "createdBy",
      "companyId",
      "userEmail",
      "isPublic",
      "isActive",
      "createdAt",
      "updatedAt",
      "level",
      "status",
      "estimatedDuration",
      "visibility",
      "targetCompanies",
      "modules",
    ];

    const existingColumns = coursesStructure.rows.map((row) => row.column_name);
    const missingColumns = expectedColumns.filter(
      (col) => !existingColumns.includes(col)
    );
    const extraColumns = existingColumns.filter(
      (col) => !expectedColumns.includes(col)
    );

    console.log("\n🔍 Análisis de consistencia:");

    if (missingColumns.length > 0) {
      console.log("❌ Columnas faltantes:", missingColumns);
    } else {
      console.log("✅ Todas las columnas esperadas están presentes");
    }

    if (extraColumns.length > 0) {
      console.log("⚠️ Columnas adicionales (no esperadas):", extraColumns);
    } else {
      console.log("✅ No hay columnas extra");
    }

    // Verificar tipos de datos críticos
    const criticalChecks = [
      {
        column: "level",
        expectedType: "character varying",
        expectedDefault: "'Básico'",
      },
      {
        column: "status",
        expectedType: "character varying",
        expectedDefault: "'Borrador'",
      },
      {
        column: "visibility",
        expectedType: "character varying",
        expectedDefault: "'Público'",
      },
      {
        column: "targetCompanies",
        expectedType: "json",
        expectedDefault: "'[]'",
      },
      { column: "modules", expectedType: "json", expectedDefault: "'[]'" },
    ];

    console.log("\n🔍 Verificando tipos de datos críticos:");
    for (const check of criticalChecks) {
      const column = coursesStructure.rows.find(
        (row) => row.column_name === check.column
      );
      if (column) {
        const typeMatch = column.data_type === check.expectedType;
        const defaultMatch = column.column_default === check.expectedDefault;

        console.log(`  ${check.column}:`);
        console.log(
          `    - Tipo: ${column.data_type} ${typeMatch ? "✅" : "❌"}`
        );
        console.log(
          `    - Default: ${column.column_default || "NULL"} ${
            defaultMatch ? "✅" : "❌"
          }`
        );
      } else {
        console.log(`  ${check.column}: ❌ No encontrada`);
      }
    }

    // Verificar datos existentes
    const courseCount = await db.execute(
      sql`SELECT COUNT(*) as count FROM courses`
    );
    console.log(
      `\n📈 Total de cursos en la base de datos: ${courseCount.rows[0].count}`
    );

    const coursesWithNewFields = await db.execute(sql`
      SELECT COUNT(*) as count 
      FROM courses 
      WHERE level IS NOT NULL AND status IS NOT NULL AND visibility IS NOT NULL
    `);
    console.log(
      `📊 Cursos con nuevos campos: ${coursesWithNewFields.rows[0].count}`
    );

    console.log("\n🎉 Verificación completada!");

    if (missingColumns.length === 0 && extraColumns.length === 0) {
      console.log("✅ Schema está consistente con el schema unificado");
    } else {
      console.log(
        "⚠️ Se encontraron inconsistencias. Revisa los detalles arriba."
      );
    }
  } catch (error) {
    console.error("❌ Error durante la verificación:", error);
    process.exit(1);
  }
}

// Ejecutar verificación si el script se ejecuta directamente
if (require.main === module) {
  verifySchema()
    .then(() => {
      console.log("\n✨ Proceso completado");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Error fatal:", error);
      process.exit(1);
    });
}

module.exports = { verifySchema };
