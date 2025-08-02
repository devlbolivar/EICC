import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "@/config/schema";

// Configuración centralizada de la base de datos
const pg = neon(process.env.DATABASE_URL!);
const db = drizzle(pg, { schema });

export { db, pg };
