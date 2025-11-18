import { NextRequest } from "next/server";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "@/config/schema";
import { requireAdmin, handleApiError, successResponse, errorResponse } from "@/lib/api-helpers";
import { strictRateLimit } from "@/lib/rate-limit";
import { requireCsrf } from "@/lib/csrf";

const pg = neon(process.env.DATABASE_URL!);
const db = drizzle(pg, { schema });

export async function POST(request: NextRequest) {
  try {
    // ===== CSRF PROTECTION =====
    const csrfError = await requireCsrf(request);
    if (csrfError) return csrfError;

    // Rate limiting: 10 operaciones por minuto
    const rateLimitResponse = await strictRateLimit(request);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    // ✅ CORREGIDO: Verificar autenticación y permisos admin correctamente
    await requireAdmin(request);

    const { name, rut, description, website, industry, size } = await request.json();

    if (!name || !rut) {
      return errorResponse("Nombre y RUT son requeridos", 400);
    }

    const newCompany = await db
      .insert(schema.companiesTable)
      .values({
        name,
        rut,
        description: description || null,
        website: website || null,
        industry: industry || null,
        size: size || null,
        isActive: true,
      })
      .returning();

    return successResponse({ company: newCompany[0] });
  } catch (error) {
    console.error("Error al crear empresa:", error);
    return handleApiError(error);
  }
}
