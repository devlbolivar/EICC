import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { sql } from "drizzle-orm";

// Configurar la conexión a la base de datos
const client = neon(process.env.DATABASE_URL);
const db = drizzle(client);

async function fixUserPermissions() {
  try {
    console.log("🔧 Fixing user permissions...");

    // Buscar el usuario con rol company que no tiene courses:read
    const usersWithoutCoursesRead = await db.execute(sql`
      SELECT 
        u.id,
        u.email,
        u.name,
        r.permissions as role_permissions,
        uc.permissions as user_permissions
      FROM users u
      JOIN user_companies uc ON u.id = uc."userId"
      JOIN roles r ON uc."roleId" = r.id
      WHERE r.name = 'company'
      AND NOT (r.permissions ? 'courses:read')
    `);

    console.log(
      "Users without courses:read permission:",
      usersWithoutCoursesRead.rows
    );

    // Actualizar el rol company para incluir courses:read
    const updateRoleResult = await db.execute(sql`
      UPDATE roles 
      SET permissions = permissions || '["courses:read"]'::jsonb
      WHERE name = 'company' 
      AND NOT (permissions ? 'courses:read')
    `);

    console.log("Updated company role permissions");

    // Verificar que el rol ahora tiene courses:read
    const checkRoleResult = await db.execute(sql`
      SELECT name, permissions 
      FROM roles 
      WHERE name = 'company'
    `);

    if (checkRoleResult.rows.length > 0) {
      const role = checkRoleResult.rows[0];
      console.log("Company role permissions after update:", role.permissions);
      console.log(
        "Has courses:read?",
        role.permissions.includes("courses:read")
      );
    }

    // También verificar si hay usuarios con permisos específicos que necesiten actualización
    const usersWithCompanyRole = await db.execute(sql`
      SELECT 
        u.id,
        u.email,
        u.name,
        r.permissions as role_permissions
      FROM users u
      JOIN user_companies uc ON u.id = uc."userId"
      JOIN roles r ON uc."roleId" = r.id
      WHERE r.name = 'company'
    `);

    console.log("All users with company role:", usersWithCompanyRole.rows);
  } catch (error) {
    console.error("Error fixing user permissions:", error);
  } finally {
    process.exit(0);
  }
}

fixUserPermissions();
