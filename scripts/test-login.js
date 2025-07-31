// Cargar variables de entorno
require("dotenv").config();

const { neon } = require("@neondatabase/serverless");
const { drizzle } = require("drizzle-orm/neon-http");
const { sql } = require("drizzle-orm");
const bcrypt = require("bcryptjs");

// Configuración de la base de datos
const pg = neon(process.env.DATABASE_URL);
const db = drizzle(pg);

async function testLogin() {
  try {
    console.log("🔍 Probando login con credenciales de prueba...");

    // Test 1: Verificar usuario admin
    console.log("\n📊 Test 1: Verificar usuario admin");
    const adminResult = await db.execute(
      sql`SELECT * FROM users WHERE email = 'admin@test.com'`
    );

    if (adminResult.rows.length === 0) {
      console.log("❌ Usuario admin no encontrado");
      return;
    }

    const admin = adminResult.rows[0];
    console.log("✅ Usuario admin encontrado:", {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      isActive: admin.isactive,
      emailVerified: admin.emailverified,
    });

    // Test 2: Verificar relaciones usuario-empresa
    console.log("\n📊 Test 2: Verificar relaciones usuario-empresa");
    const userCompaniesResult = await db.execute(
      sql`
        SELECT 
          uc.id,
          uc.user_id,
          uc.company_id,
          uc.role_id,
          uc."isActive",
          r.name as role_name,
          r.permissions as role_permissions,
          c.name as company_name
        FROM user_companies uc
        LEFT JOIN roles r ON uc.role_id = r.id
        LEFT JOIN companies c ON uc.company_id = c.id
        WHERE uc.user_id = ${admin.id} AND uc."isActive" = true
      `
    );

    console.log("✅ Relaciones encontradas:", userCompaniesResult.rows.length);
    userCompaniesResult.rows.forEach((uc, index) => {
      console.log(
        `  ${index + 1}. Rol: ${uc.role_name}, Empresa: ${
          uc.company_name || "N/A"
        }`
      );
    });

    // Test 3: Simular validación de contraseña
    console.log("\n📊 Test 3: Simular validación de contraseña");
    const testPassword = "admin123";

    if (admin.passwordhash) {
      const isValid = await bcrypt.compare(testPassword, admin.passwordhash);
      console.log(`✅ Contraseña válida: ${isValid}`);
    } else {
      console.log("⚠️ Usuario sin contraseña hash");
    }

    // Test 4: Verificar estructura completa
    console.log("\n📊 Test 4: Verificar estructura completa");
    const completeUserResult = await db.execute(
      sql`
        SELECT 
          u.id,
          u.email,
          u.name,
          u."isActive",
          u."emailVerified",
          uc.role_id,
          r.name as role_name,
          r.permissions as role_permissions,
          c.id as company_id,
          c.name as company_name
        FROM users u
        LEFT JOIN user_companies uc ON u.id = uc.user_id AND uc."isActive" = true
        LEFT JOIN roles r ON uc.role_id = r.id
        LEFT JOIN companies c ON uc.company_id = c.id
        WHERE u.email = 'admin@test.com'
        ORDER BY r.name DESC
        LIMIT 1
      `
    );

    if (completeUserResult.rows.length > 0) {
      const user = completeUserResult.rows[0];
      console.log("✅ Estructura completa:", {
        id: user.id,
        email: user.email,
        name: user.name,
        isActive: user.isActive,
        emailVerified: user.emailVerified,
        roleName: user.role_name,
        companyName: user.company_name,
      });
    }

    console.log("\n🎉 Tests de login completados!");
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
  testLogin()
    .then(() => {
      console.log("\n✨ Proceso completado");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Error fatal:", error);
      process.exit(1);
    });
}

module.exports = { testLogin };
