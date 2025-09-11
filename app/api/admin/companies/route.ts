import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "@/config/schema";
import { verifyAccessToken } from "@/lib/auth";
import { eq, like, and, desc, asc, sql } from "drizzle-orm";

const pg = neon(process.env.DATABASE_URL!);
const db = drizzle(pg, { schema });

export async function GET(request: NextRequest) {
  try {
    const token =
      request.headers.get("authorization")?.replace("Bearer ", "") ||
      request.cookies.get("accessToken")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Token de acceso requerido" },
        { status: 401 }
      );
    }

    const payload = verifyAccessToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: "Token de acceso inválido" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";

    const offset = (page - 1) * limit;

    const filters = [];
    if (search) {
      filters.push(like(schema.companiesTable.name, `%${search}%`));
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
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error al obtener empresas:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}