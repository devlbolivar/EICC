import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "@/config/schema";

// Validar que DATABASE_URL esté configurado
if (!process.env.DATABASE_URL) {
  console.error("Environment variables available:", Object.keys(process.env));
  throw new Error(
    "DATABASE_URL environment variable is not set. Please check your .env file."
  );
}

// Configuración centralizada de la base de datos
const pg = neon(process.env.DATABASE_URL);
const db = drizzle(pg, { schema });

export { db, pg };
