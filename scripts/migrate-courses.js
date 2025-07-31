// Cargar variables de entorno
require("dotenv").config();

const { neon } = require("@neondatabase/serverless");
const { drizzle } = require("drizzle-orm/neon-http");
const { sql } = require("drizzle-orm");

// Configuración de la base de datos
const pg = neon(process.env.DATABASE_URL);
const db = drizzle(pg);

async function migrateCourses() {
  try {
    console.log("🚀 Iniciando migración de la tabla courses...");

    // Verificar si las columnas ya existen
    const checkColumns = await db.execute(sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'courses' 
      AND column_name IN ('level', 'status', 'estimatedDuration', 'visibility', 'targetCompanies', 'modules')
    `);

    const existingColumns = checkColumns.rows.map((row) => row.column_name);
    console.log("Columnas existentes:", existingColumns);

    // Agregar columnas que no existen (usando nombres correctos del schema)
    const columnsToAdd = [
      { name: "level", type: "VARCHAR(50) DEFAULT 'Básico' NOT NULL" },
      { name: "status", type: "VARCHAR(50) DEFAULT 'Borrador' NOT NULL" },
      { name: "estimatedDuration", type: "VARCHAR(100)" },
      { name: "visibility", type: "VARCHAR(50) DEFAULT 'Público' NOT NULL" },
      { name: "targetCompanies", type: "JSON DEFAULT '[]'" },
      { name: "modules", type: "JSON DEFAULT '[]'" },
    ];

    for (const column of columnsToAdd) {
      if (!existingColumns.includes(column.name)) {
        console.log(`📝 Agregando columna: ${column.name}`);
        await db.execute(
          sql`ALTER TABLE courses ADD COLUMN ${sql.raw(column.name)} ${sql.raw(
            column.type
          )}`
        );
        console.log(`✅ Columna ${column.name} agregada exitosamente`);
      } else {
        console.log(`⏭️ Columna ${column.name} ya existe, saltando...`);
      }
    }

    // Actualizar datos existentes si es necesario
    console.log("🔄 Actualizando datos existentes...");

    // Actualizar cursos existentes con valores por defecto
    await db.execute(sql`
      UPDATE courses 
      SET 
        level = COALESCE(level, 'Básico'),
        status = COALESCE(status, 'Borrador'),
        visibility = COALESCE(visibility, 'Público'),
        targetCompanies = COALESCE(targetCompanies, '[]'),
        modules = COALESCE(modules, '[]')
      WHERE level IS NULL OR status IS NULL OR visibility IS NULL
    `);

    console.log("✅ Datos existentes actualizados");

    // Verificar la estructura final
    const finalStructure = await db.execute(sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'courses' 
      ORDER BY ordinal_position
    `);

    console.log("\n📊 Estructura final de la tabla courses:");
    finalStructure.rows.forEach((row) => {
      console.log(
        `  - ${row.column_name}: ${row.data_type} ${
          row.is_nullable === "YES" ? "NULL" : "NOT NULL"
        } ${row.column_default ? `DEFAULT ${row.column_default}` : ""}`
      );
    });

    console.log("\n🎉 Migración completada exitosamente!");
    console.log("\n📋 Resumen de cambios:");
    console.log(
      "  ✅ Nuevas columnas agregadas para gestión avanzada de cursos"
    );
    console.log("  ✅ Valores por defecto configurados");
    console.log("  ✅ Datos existentes actualizados");
    console.log(
      "\n🚀 La funcionalidad de gestión de cursos está lista para usar!"
    );
  } catch (error) {
    console.error("❌ Error durante la migración:", error);
    process.exit(1);
  }
}

// Ejecutar migración si el script se ejecuta directamente
if (require.main === module) {
  migrateCourses()
    .then(() => {
      console.log("\n✨ Proceso completado");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Error fatal:", error);
      process.exit(1);
    });
}

module.exports = { migrateCourses };
