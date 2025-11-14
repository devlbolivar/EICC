import { db } from "../config/db.js";
import { sql } from "drizzle-orm";

async function checkRolePermissions() {
  try {
    console.log("Checking role permissions...");

    const result = await db.execute(sql`
      SELECT name, permissions 
      FROM roles 
      WHERE name = 'company'
    `);

    if (result.rows.length > 0) {
      const role = result.rows[0];
      console.log("Company role permissions:", role.permissions);
      console.log(
        "Has courses:read?",
        role.permissions.includes("courses:read")
      );
      console.log(
        "Has courses:view?",
        role.permissions.includes("courses:view")
      );
    } else {
      console.log("Company role not found!");
    }
  } catch (error) {
    console.error("Error checking role permissions:", error);
  } finally {
    process.exit(0);
  }
}

checkRolePermissions();
