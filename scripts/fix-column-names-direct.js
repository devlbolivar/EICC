// Cargar variables de entorno
require("dotenv").config();

const { neon } = require("@neondatabase/serverless");
const { drizzle } = require("drizzle-orm/neon-http");
const { sql } = require("drizzle-orm");

// Configuración de la base de datos
const pg = neon(process.env.DATABASE_URL);
const db = drizzle(pg);

async function fixColumnNamesDirect() {
  try {
    console.log("🔧 Corrigiendo nombres de columnas directamente...");

    // Verificar columnas actuales
    const currentColumns = await db.execute(sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'courses' 
      AND column_name IN ('estimatedduration', 'targetcompanies', 'created_by', 'company_id')
    `);

    console.log(
      "Columnas encontradas:",
      currentColumns.rows.map((row) => row.column_name)
    );

    // Corregir estimatedduration → estimatedDuration
    if (
      currentColumns.rows.some((row) => row.column_name === "estimatedduration")
    ) {
      console.log("🔄 Corrigiendo estimatedduration → estimatedDuration");
      try {
        await db.execute(
          sql`ALTER TABLE courses DROP COLUMN estimatedduration`
        );
        await db.execute(
          sql`ALTER TABLE courses ADD COLUMN "estimatedDuration" VARCHAR(100)`
        );
        console.log("✅ estimatedDuration corregida");
      } catch (error) {
        console.log("⚠️ Error al corregir estimatedDuration:", error.message);
      }
    }

    // Corregir targetcompanies → targetCompanies
    if (
      currentColumns.rows.some((row) => row.column_name === "targetcompanies")
    ) {
      console.log("🔄 Corrigiendo targetcompanies → targetCompanies");
      try {
        await db.execute(sql`ALTER TABLE courses DROP COLUMN targetcompanies`);
        await db.execute(
          sql`ALTER TABLE courses ADD COLUMN "targetCompanies" JSON DEFAULT '[]'`
        );
        console.log("✅ targetCompanies corregida");
      } catch (error) {
        console.log("⚠️ Error al corregir targetCompanies:", error.message);
      }
    }

    // Corregir created_by → createdBy
    if (currentColumns.rows.some((row) => row.column_name === "created_by")) {
      console.log("🔄 Corrigiendo created_by → createdBy");
      try {
        await db.execute(sql`ALTER TABLE courses DROP COLUMN created_by`);
        await db.execute(
          sql`ALTER TABLE courses ADD COLUMN "createdBy" UUID NOT NULL`
        );
        console.log("✅ createdBy corregida");
      } catch (error) {
        console.log("⚠️ Error al corregir createdBy:", error.message);
      }
    }

    // Corregir company_id → companyId
    if (currentColumns.rows.some((row) => row.column_name === "company_id")) {
      console.log("🔄 Corrigiendo company_id → companyId");
      try {
        await db.execute(sql`ALTER TABLE courses DROP COLUMN company_id`);
        await db.execute(sql`ALTER TABLE courses ADD COLUMN "companyId" UUID`);
        console.log("✅ companyId corregida");
      } catch (error) {
        console.log("⚠️ Error al corregir companyId:", error.message);
      }
    }

    // Verificar resultado final
    const finalCheck = await db.execute(sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'courses' 
      AND column_name IN ('estimatedDuration', 'targetCompanies', 'createdBy', 'companyId')
    `);

    console.log(
      "\n📊 Columnas corregidas:",
      finalCheck.rows.map((row) => row.column_name)
    );

    console.log("\n🎉 Corrección de nombres completada!");
  } catch (error) {
    console.error("❌ Error durante la corrección:", error);
    process.exit(1);
  }
}

// Ejecutar corrección si el script se ejecuta directamente
if (require.main === module) {
  fixColumnNamesDirect()
    .then(() => {
      console.log("\n✨ Proceso completado");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Error fatal:", error);
      process.exit(1);
    });
}

module.exports = { fixColumnNamesDirect };
