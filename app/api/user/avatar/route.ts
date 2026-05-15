import { requireCsrf } from "@/lib/csrf";
import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken } from "@/lib/auth";
import { db } from "@/config/db";
import { sql } from "drizzle-orm";
import { cookies } from "next/headers";

// ===== POST - Upload avatar (base64) =====
export async function POST(request: NextRequest) {
    const csrfResult = await requireCsrf(request);
    if (csrfResult) return csrfResult;

  try {
    // Verificar autenticación
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken");

    if (!token) {
      return NextResponse.json(
        { error: "Token no encontrado" },
        { status: 401 }
      );
    }

    const payload = await verifyAccessToken(token.value);
    if (!payload) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    }

    const body = await request.json();
    const { avatar } = body;

    if (!avatar) {
      return NextResponse.json(
        { error: "Avatar requerido" },
        { status: 400 }
      );
    }

    // Validar que sea una imagen base64 válida
    if (!avatar.startsWith("data:image/")) {
      return NextResponse.json(
        { error: "Formato de imagen inválido. Use data:image/..." },
        { status: 400 }
      );
    }

    // Limitar tamaño (aproximadamente 5MB en base64)
    if (avatar.length > 7000000) {
      return NextResponse.json(
        { error: "Imagen demasiado grande. Máximo 5MB" },
        { status: 400 }
      );
    }

    // Actualizar avatar del usuario
    const result = await db.execute(sql`
      UPDATE users
      SET avatar = ${avatar}, "updatedAt" = ${new Date().toISOString()}
      WHERE id = ${payload.userId}
      RETURNING id, name, email, avatar
    `);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Avatar actualizado exitosamente",
      data: {
        user: result.rows[0],
      },
    });
  } catch (error) {
    console.error("Error al subir avatar:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// ===== DELETE - Eliminar avatar =====
export async function DELETE(_request: NextRequest) {
    const csrfResult = await requireCsrf(_request);
    if (csrfResult) return csrfResult;

  try {
    // Verificar autenticación
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken");

    if (!token) {
      return NextResponse.json(
        { error: "Token no encontrado" },
        { status: 401 }
      );
    }

    const payload = await verifyAccessToken(token.value);
    if (!payload) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    }

    // Eliminar avatar del usuario
    const result = await db.execute(sql`
      UPDATE users
      SET avatar = NULL, "updatedAt" = ${new Date().toISOString()}
      WHERE id = ${payload.userId}
      RETURNING id, name, email, avatar
    `);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Avatar eliminado exitosamente",
      data: {
        user: result.rows[0],
      },
    });
  } catch (error) {
    console.error("Error al eliminar avatar:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
