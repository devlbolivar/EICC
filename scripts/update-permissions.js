import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../config/schema.js";
import { SYSTEM_ROLES, ROLE_PERMISSIONS } from "../app/types/index.js";

const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString);
const db = drizzle<typeof schema>(client, { schema });

async function updatePermissions() {
  try {
    console.log("🔄 Actualizando permisos de roles en la base de datos...");

    for (const [roleName, permissions] of Object.entries(ROLE_PERMISSIONS)) {
      console.log(`📝 Actualizando rol: ${roleName}`);
      console.log(`   Permisos: ${permissions.join(", ")}`);

      const [updatedRole] = await db
        .update(schema.rolesTable)
        .set({
          permissions: permissions,
          updatedAt: new Date(),
        })
        .where((roles, { eq }) => eq(roles.name, roleName))
        .returning();

      if (updatedRole) {
        console.log(`✅ Rol ${roleName} actualizado exitosamente`);
      } else {
        console.log(`❌ No se encontró el rol ${roleName}`);
      }
    }

    console.log("🎉 Actualización de permisos completada");
  } catch (error) {
    console.error("❌ Error actualizando permisos:", error);
  } finally {
    await client.end();
  }
}

updatePermissions(); 