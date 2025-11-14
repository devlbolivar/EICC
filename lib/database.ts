import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "@/config/schema";

// Skip validation during build phase (Vercel, local builds, etc.)
const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build';

// Validar que DATABASE_URL esté configurado
if (!isBuildPhase && !process.env.DATABASE_URL) {
  console.error("Environment variables available:", Object.keys(process.env));
  throw new Error(
    "DATABASE_URL environment variable is not set. Please check your .env file."
  );
}

// Use a properly formatted dummy URL during build phase to prevent errors
// This won't be used for actual connections during build, just for initialization
const databaseUrl = process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/database';

// Configuración centralizada de la base de datos
const pg = neon(databaseUrl);
const db = drizzle(pg, { schema });

export { db, pg };
