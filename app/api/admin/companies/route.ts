import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "@/config/schema";
import { verifyAdminAuth } from "@/lib/admin-auth";
import { and, desc, sql } from "drizzle-orm";
import { createPaginationInfo } from "@/lib/pagination";

const pg = neon(process.env.DATABASE_URL!);
const db = drizzle(pg, { schema });

export async function GET(request: NextRequest) {
  try {
    // ===== VERIFICAR AUTENTICACIÓN Y PERMISOS DE ADMIN =====
    const authResult = await verifyAdminAuth(request);
    if (!authResult.authorized) {
      return authResult.response;
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const industry = searchParams.get("industry") || "";
    const plan = searchParams.get("plan") || "";
    const isActive = searchParams.get("isActive");

    const offset = (page - 1) * limit;

    const filters = [];

    // ===== BÚSQUEDA AVANZADA - Buscar en múltiples campos =====
    if (search) {
      // Buscar en nombre, RUT, email, o teléfono
      filters.push(
        sql`(
          LOWER(${schema.companiesTable.name}) LIKE LOWER(${`%${search}%`}) OR
          LOWER(${schema.companiesTable.rut}) LIKE LOWER(${`%${search}%`}) OR
          LOWER(${schema.companiesTable.email}) LIKE LOWER(${`%${search}%`}) OR
          ${schema.companiesTable.phone} LIKE ${`%${search}%`}
        )`
      );
    }

    // ===== FILTRO POR INDUSTRIA =====
    if (industry) {
      filters.push(sql`${schema.companiesTable.industry} = ${industry}`);
    }

    // ===== FILTRO POR PLAN =====
    if (plan) {
      filters.push(sql`${schema.companiesTable.plan} = ${plan}`);
    }

    // ===== FILTRO POR ESTADO ACTIVO =====
    if (isActive !== null && isActive !== undefined && isActive !== "") {
      const activeValue = isActive === "true";
      filters.push(sql`${schema.companiesTable.isActive} = ${activeValue}`);
    }

    const whereClause = filters.length > 0 ? and(...filters) : undefined;

    const companies = await db
      .select()
      .from(schema.companiesTable)
      .where(whereClause)
      .orderBy(desc(schema.companiesTable.createdAt))
      .limit(limit)
      .offset(offset);

    const totalCompanies = await db
      .select({ count: sql<number>`count(*)` })
      .from(schema.companiesTable)
      .where(whereClause);

    const total = totalCompanies[0]?.count || 0;

    return NextResponse.json({
      companies,
      pagination: createPaginationInfo(page, limit, total),
    });
  } catch (error) {
    console.error("Error al obtener empresas:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}