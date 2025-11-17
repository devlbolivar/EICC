import { NextRequest, NextResponse } from "next/server";
import { db } from "@/config/db";
import { sql } from "drizzle-orm";

// ===== GET - Obtener categorías únicas de cursos =====
export async function GET(request: NextRequest) {
  try {
    // Obtener categorías únicas de cursos activos y publicados
    const result = await db.execute(sql`
      SELECT DISTINCT category
      FROM courses
      WHERE "isActive" = true AND status = 'published'
      ORDER BY category ASC
    `);

    // Extraer solo los valores de categoría
    const categories = result.rows
      .map((row: any) => row.category)
      .filter((category: string) => category && category.trim() !== "");

    return NextResponse.json({
      success: true,
      data: {
        categories,
      },
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
