import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../config/schema.js";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error(
    "❌ Error: DATABASE_URL no está configurada en las variables de entorno"
  );
  console.error("Por favor, configura DATABASE_URL en tu archivo .env");
  process.exit(1);
}

console.log("🔍 Probando conexión a la base de datos...");

try {
  const pg = neon(connectionString);
  const db = drizzle(pg, { schema });

  // Probar una consulta simple
  const result = await db
    .select({ count: sql`count(*)` })
    .from(schema.usersTable);

  console.log("✅ Conexión exitosa a la base de datos");
  console.log(
    `📊 Total de usuarios en la base de datos: ${result[0]?.count || 0}`
  );

  // Probar una consulta más compleja
  const activeUsers = await db
    .select({ count: sql`count(*)` })
    .from(schema.usersTable)
    .where(sql`is_active = true`);

  console.log(`👥 Usuarios activos: ${activeUsers[0]?.count || 0}`);

  console.log("🎉 Todas las pruebas de conexión pasaron exitosamente");
} catch (error) {
  console.error("❌ Error conectando a la base de datos:", error);
  console.error("Detalles del error:", error.message);
  process.exit(1);
}
