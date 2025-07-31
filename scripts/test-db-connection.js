// Cargar variables de entorno
require("dotenv").config();

const { neon } = require("@neondatabase/serverless");
const { drizzle } = require("drizzle-orm/neon-http");
const { sql } = require("drizzle-orm");

// Configuración de la base de datos
const pg = neon(process.env.DATABASE_URL);
const db = drizzle(pg);

async function testDbConnection() {
  try {
    console.log("🔍 Probando conexión a la base de datos...");

    // Test 1: Conexión básica
    console.log("\n📊 Test 1: Conexión básica");
    const result = await db.execute(sql`SELECT 1 as test`);
    console.log("✅ Conexión exitosa:", result.rows[0]);

    // Test 2: Verificar tabla users
    console.log("\n📊 Test 2: Verificar tabla users");
    const usersCount = await db.execute(
      sql`SELECT COUNT(*) as count FROM users`
    );
    console.log("✅ Usuarios en BD:", usersCount.rows[0].count);

    // Test 3: Verificar estructura de users
    console.log("\n📊 Test 3: Estructura de tabla users");
    const usersStructure = await db.execute(sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      ORDER BY ordinal_position
    `);

    console.log("Columnas de users:");
    usersStructure.rows.forEach((row) => {
      console.log(
        `  - ${row.column_name}: ${row.data_type} ${
          row.is_nullable === "YES" ? "NULL" : "NOT NULL"
        }`
      );
    });

    // Test 4: Consulta simple de users
    console.log("\n📊 Test 4: Consulta simple de users");
    const users = await db.execute(
      sql`SELECT id, email, name FROM users LIMIT 5`
    );
    console.log("Usuarios encontrados:", users.rows.length);
    users.rows.forEach((user) => {
      console.log(`  - ${user.email} (${user.name})`);
    });

    // Test 5: Verificar tabla user_companies
    console.log("\n📊 Test 5: Verificar tabla user_companies");
    const userCompaniesCount = await db.execute(
      sql`SELECT COUNT(*) as count FROM user_companies`
    );
    console.log(
      "✅ Relaciones usuario-empresa:",
      userCompaniesCount.rows[0].count
    );

    // Test 6: Verificar tabla roles
    console.log("\n📊 Test 6: Verificar tabla roles");
    const rolesCount = await db.execute(
      sql`SELECT COUNT(*) as count FROM roles`
    );
    console.log("✅ Roles en BD:", rolesCount.rows[0].count);

    console.log("\n🎉 Todos los tests completados exitosamente!");
  } catch (error) {
    console.error("❌ Error durante los tests:", error);
    console.error("Detalles del error:", {
      message: error.message,
      code: error.code,
      detail: error.detail,
      hint: error.hint,
    });
    process.exit(1);
  }
}

// Ejecutar tests si el script se ejecuta directamente
if (require.main === module) {
  testDbConnection()
    .then(() => {
      console.log("\n✨ Proceso completado");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Error fatal:", error);
      process.exit(1);
    });
}

module.exports = { testDbConnection };
