import { db } from "../config/db.js";
import { sql } from "drizzle-orm";

async function fixCompanyPermissions() {
  try {
    console.log("Fixing company role permissions...");

    // Update company role to include courses:read permission
    const result = await db.execute(sql`
      UPDATE roles 
      SET permissions = permissions || '["courses:read"]'::jsonb
      WHERE name = 'company' 
      AND NOT (permissions ? 'courses:read')
    `);

    console.log("Updated company role permissions");

    // Check the updated permissions
    const checkResult = await db.execute(sql`
      SELECT name, permissions 
      FROM roles 
      WHERE name = 'company'
    `);

    if (checkResult.rows.length > 0) {
      const role = checkResult.rows[0];
      console.log("Company role permissions after update:", role.permissions);
      console.log(
        "Has courses:read?",
        role.permissions.includes("courses:read")
      );
    }
  } catch (error) {
    console.error("Error fixing company permissions:", error);
  } finally {
    process.exit(0);
  }
}

fixCompanyPermissions();
