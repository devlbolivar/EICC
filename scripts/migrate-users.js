// Cargar variables de entorno
require("dotenv").config();

const { neon } = require("@neondatabase/serverless");
const { drizzle } = require("drizzle-orm/neon-http");
const { sql } = require("drizzle-orm");

// Configuración de la base de datos
const pg = neon(process.env.DATABASE_URL);
const db = drizzle(pg);

async function migrateUsers() {
  try {
    console.log("🚀 Iniciando migración de la tabla users...");

    // Verificar si las columnas ya existen
    const checkColumns = await db.execute(sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND column_name IN ('age', 'subscriptionId')
    `);

    const existingColumns = checkColumns.rows.map((row) => row.column_name);
    console.log("Columnas existentes:", existingColumns);

    // Agregar columnas que no existen
    const columnsToAdd = [
      { name: "age", type: "INTEGER" },
      { name: "subscriptionId", type: "VARCHAR(255)" },
    ];

    for (const column of columnsToAdd) {
      if (!existingColumns.includes(column.name)) {
        console.log(`📝 Agregando columna: ${column.name}`);
        await db.execute(
          sql`ALTER TABLE users ADD COLUMN ${sql.raw(column.name)} ${sql.raw(
            column.type
          )}`
        );
        console.log(`✅ Columna ${column.name} agregada exitosamente`);
      } else {
        console.log(`⏭️ Columna ${column.name} ya existe, saltando...`);
      }
    }

    // Verificar la estructura final
    const finalStructure = await db.execute(sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      ORDER BY ordinal_position
    `);

    console.log("\n📊 Estructura final de la tabla users:");
    finalStructure.rows.forEach((row) => {
      console.log(
        `  - ${row.column_name}: ${row.data_type} ${
          row.is_nullable === "YES" ? "NULL" : "NOT NULL"
        } ${row.column_default ? `DEFAULT ${row.column_default}` : ""}`
      );
    });

    console.log("\n🎉 Migración de users completada exitosamente!");
  } catch (error) {
    console.error("❌ Error durante la migración:", error);
    process.exit(1);
  }
}

// Ejecutar migración si el script se ejecuta directamente
if (require.main === module) {
  migrateUsers()
    .then(() => {
      console.log("\n✨ Proceso completado");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Error fatal:", error);
      process.exit(1);
    });
}

module.exports = { migrateUsers };
