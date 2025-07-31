// Cargar variables de entorno
require("dotenv").config();

const { neon } = require("@neondatabase/serverless");
const { drizzle } = require("drizzle-orm/neon-http");
const { sql } = require("drizzle-orm");

// Configuración de la base de datos
const pg = neon(process.env.DATABASE_URL);
const db = drizzle(pg);

async function fixColumnNames() {
  try {
    console.log("🔧 Verificando y corrigiendo nombres de columnas...");

    // Verificar columnas existentes con nombres incorrectos
    const checkColumns = await db.execute(sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'courses' 
      AND column_name IN ('estimated_duration', 'target_companies', 'estimatedduration', 'targetcompanies')
    `);

    const existingColumns = checkColumns.rows.map((row) => row.column_name);
    console.log(
      "Columnas con nombres incorrectos encontradas:",
      existingColumns
    );

    // Corregir nombres de columnas si existen
    const columnMappings = [
      { old: "estimated_duration", new: "estimatedDuration" },
      { old: "target_companies", new: "targetCompanies" },
      { old: "estimatedduration", new: "estimatedDuration" },
      { old: "targetcompanies", new: "targetCompanies" },
    ];

    for (const mapping of columnMappings) {
      if (existingColumns.includes(mapping.old)) {
        console.log(`🔄 Renombrando columna: ${mapping.old} → ${mapping.new}`);

        try {
          await db.execute(
            sql`ALTER TABLE courses RENAME COLUMN ${sql.raw(
              mapping.old
            )} TO ${sql.raw(mapping.new)}`
          );
          console.log(
            `✅ Columna renombrada exitosamente: ${mapping.old} → ${mapping.new}`
          );
        } catch (error) {
          console.log(`⚠️ Error al renombrar ${mapping.old}: ${error.message}`);
        }
      } else {
        console.log(`⏭️ Columna ${mapping.old} no existe, saltando...`);
      }
    }

    // Verificar la estructura final
    const finalStructure = await db.execute(sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'courses' 
      AND column_name IN ('level', 'status', 'estimatedDuration', 'visibility', 'targetCompanies', 'modules')
      ORDER BY column_name
    `);

    console.log("\n📊 Columnas nuevas en la tabla courses:");
    finalStructure.rows.forEach((row) => {
      console.log(
        `  - ${row.column_name}: ${row.data_type} ${
          row.is_nullable === "YES" ? "NULL" : "NOT NULL"
        } ${row.column_default ? `DEFAULT ${row.column_default}` : ""}`
      );
    });

    console.log("\n🎉 Verificación de nombres de columnas completada!");
  } catch (error) {
    console.error("❌ Error durante la verificación:", error);
    process.exit(1);
  }
}

// Ejecutar verificación si el script se ejecuta directamente
if (require.main === module) {
  fixColumnNames()
    .then(() => {
      console.log("\n✨ Proceso completado");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Error fatal:", error);
      process.exit(1);
    });
}

module.exports = { fixColumnNames };
