import { NextRequest, NextResponse } from "next/server";
import { db } from "@/config/db";
import { sql, eq, and } from "drizzle-orm";
import { verifyAccessToken } from "@/lib/auth";
import { cookies } from "next/headers";

// ===== GET - Obtener certificado específico =====
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id: certificateId } = await params;

    // Obtener certificado con información relacionada
    const result = await db.execute(sql`
      SELECT 
        cert.*,
        c.name as course_name,
        c.description as course_description,
        c.category as course_category,
        c.level as course_level,
        c."estimatedDuration" as course_duration,
        c."bannerImage" as course_banner,
        u.name as user_name,
        u.email as user_email,
        comp.name as company_name
      FROM certificates cert
      LEFT JOIN courses c ON cert."course_id" = c.id
      LEFT JOIN users u ON cert."user_id" = u.id
      LEFT JOIN companies comp ON cert."company_id" = comp.id
      WHERE cert."certificateId" = ${certificateId} AND cert."isActive" = true
    `);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Certificado no encontrado" },
        { status: 404 }
      );
    }

    const certificate = result.rows[0];

    // Verificar permisos - solo el propietario o admin puede ver
    if (
      certificate.user_id !== payload.userId &&
      !payload.permissions.includes("courses:manage")
    ) {
      return NextResponse.json(
        { error: "No tienes permisos para ver este certificado" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: certificate,
    });
  } catch (error) {
    console.error("Error fetching certificate:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// ===== PUT - Actualizar certificado =====
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    // Verificar permisos
    if (!payload.permissions.includes("courses:manage")) {
      return NextResponse.json(
        { error: "Sin permisos para actualizar certificados" },
        { status: 403 }
      );
    }

    const { id: certificateId } = await params;
    const body = await request.json();

    // Verificar que el certificado existe
    const existingCert = await db.execute(sql`
      SELECT * FROM certificates WHERE id = ${certificateId}
    `);

    if (existingCert.rows.length === 0) {
      return NextResponse.json(
        { error: "Certificado no encontrado" },
        { status: 404 }
      );
    }

    // Actualizar certificado
    const updateQuery = sql`
      UPDATE certificates 
      SET 
        "updatedAt" = ${new Date().toISOString()},
        title = ${body.title || existingCert.rows[0].title},
        description = ${body.description || existingCert.rows[0].description},
        grade = ${
          body.grade !== undefined ? body.grade : existingCert.rows[0].grade
        },
        "certificateUrl" = ${
          body.certificateUrl || existingCert.rows[0].certificateUrl
        }
      WHERE id = ${certificateId}
      RETURNING *
    `;

    const updatedCert = await db.execute(updateQuery);

    return NextResponse.json({
      success: true,
      data: updatedCert.rows[0],
      message: "Certificado actualizado exitosamente",
    });
  } catch (error) {
    console.error("Error updating certificate:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// ===== DELETE - Eliminar certificado =====
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    // Verificar permisos
    if (!payload.permissions.includes("courses:manage")) {
      return NextResponse.json(
        { error: "Sin permisos para eliminar certificados" },
        { status: 403 }
      );
    }

    const { id: certificateId } = await params;

    // Soft delete - marcar como inactivo
    const result = await db.execute(sql`
      UPDATE certificates 
      SET "isActive" = false, "updatedAt" = ${new Date().toISOString()}
      WHERE id = ${certificateId}
      RETURNING id
    `);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Certificado no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Certificado eliminado exitosamente",
    });
  } catch (error) {
    console.error("Error deleting certificate:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
