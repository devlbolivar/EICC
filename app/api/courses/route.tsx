import db from "@/config/db";
import { coursesTable } from "@/config/schema";
import { eq, desc, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { verifyAccessToken } from "@/lib/auth";
import { validateUUID } from "@/lib/utils";

export async function GET(req: Request) {
  try {
    // ===== VERIFICAR AUTENTICACIÓN =====
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

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

    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get("courseId");

    // ===== VALIDAR PARÁMETROS =====
    if (courseId && courseId !== "0" && !validateUUID(courseId)) {
      return NextResponse.json(
        { error: "ID de curso inválido" },
        { status: 400 }
      );
    }

    if (courseId === "0") {
      // Obtener todos los cursos con contenido
      const result = await db
        .select()
        .from(coursesTable)
        .where(sql`${coursesTable.courseContent}::jsonb != '{}'::jsonb`);

      return NextResponse.json(result);
    }

    if (courseId) {
      // Obtener curso específico
      const result = await db
        .select()
        .from(coursesTable)
        .where(eq(coursesTable.cid, courseId));

      if (result.length === 0) {
        return NextResponse.json(
          { error: "Curso no encontrado" },
          { status: 404 }
        );
      }

      return NextResponse.json(result[0]);
    } else {
      // Obtener cursos del usuario autenticado
      const result = await db
        .select()
        .from(coursesTable)
        .where(eq(coursesTable.userEmail, payload.email))
        .orderBy(desc(coursesTable.createdAt));

      return NextResponse.json(result);
    }
  } catch (error) {
    console.error("Error obteniendo cursos:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
