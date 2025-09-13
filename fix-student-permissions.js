import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./config/schema.js";
import { eq } from "drizzle-orm";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("❌ DATABASE_URL not found in environment variables");
  process.exit(1);
}

const client = postgres(connectionString);
const db = drizzle(client, { schema });

async function fixStudentPermissions() {
  try {
    console.log("🔧 Fixing student role permissions...");

    // Update student role to have correct permissions
    const [updatedRole] = await db
      .update(schema.rolesTable)
      .set({
        permissions: ["courses:read", "courses:enroll", "content:read"],
        updatedAt: new Date(),
      })
      .where(eq(schema.rolesTable.name, "student"))
      .returning();

    if (updatedRole) {
      console.log("✅ Student role permissions updated successfully");
      console.log("   New permissions:", updatedRole.permissions);
    } else {
      console.log("❌ Student role not found");
    }
  } catch (error) {
    console.error("❌ Error updating permissions:", error);
  } finally {
    await client.end();
  }
}

fixStudentPermissions();
