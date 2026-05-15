import { requireCsrf } from "@/lib/csrf";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/config/db";
import { certificatesTable, usersTable, coursesTable, companiesTable } from "@/config/schema";
import { sql, getTableName } from "drizzle-orm";
import { verifyAccessToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { validateUUID } from "@/lib/validation";

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

    // ===== VALIDAR UUID =====
    const idValidation = validateUUID(certificateId, 'ID de certificado');
    if (!idValidation.isValid) {
      return NextResponse.json(
        { error: idValidation.errors?.[0] || 'ID inválido' },
        { status: 400 }
      );
    }

    // Obtener certificado con información relacionada
    const result = await db.execute(sql`
      SELECT
        cert.*,
        c.${sql.identifier(coursesTable.name.name)} as course_name,
        c.${sql.identifier(coursesTable.description.name)} as course_description,
        c.${sql.identifier(coursesTable.category.name)} as course_category,
        c.${sql.identifier(coursesTable.level.name)} as course_level,
        c.${sql.identifier(coursesTable.estimatedDuration.name)} as course_duration,
        c.${sql.identifier(coursesTable.bannerImage.name)} as course_banner,
        u.${sql.identifier(usersTable.name.name)} as user_name,
        u.${sql.identifier(usersTable.email.name)} as user_email,
        comp.${sql.identifier(companiesTable.name.name)} as company_name
      FROM ${sql.identifier(getTableName(certificatesTable))} cert
      LEFT JOIN ${sql.identifier(getTableName(coursesTable))} c ON cert.${sql.identifier(certificatesTable.courseId.name)} = c.${sql.identifier(coursesTable.id.name)}
      LEFT JOIN ${sql.identifier(getTableName(usersTable))} u ON cert.${sql.identifier(certificatesTable.userId.name)} = u.${sql.identifier(usersTable.id.name)}
      LEFT JOIN ${sql.identifier(getTableName(companiesTable))} comp ON cert.${sql.identifier(certificatesTable.companyId.name)} = comp.${sql.identifier(companiesTable.id.name)}
      WHERE cert.${sql.identifier(certificatesTable.certificateId.name)} = ${certificateId} AND cert.${sql.identifier(certificatesTable.isActive.name)} = true
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

    // Verificar permisos
    if (!payload.permissions.includes("courses:manage")) {
      return NextResponse.json(
        { error: "Sin permisos para actualizar certificados" },
        { status: 403 }
      );
    }

    const { id: certificateId } = await params;

    // ===== VALIDAR UUID =====
    const idValidation = validateUUID(certificateId, 'ID de certificado');
    if (!idValidation.isValid) {
      return NextResponse.json(
        { error: idValidation.errors?.[0] || 'ID inválido' },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Verificar que el certificado existe
    const existingCert = await db.execute(sql`
      SELECT * FROM ${sql.identifier(getTableName(certificatesTable))} WHERE ${sql.identifier(certificatesTable.id.name)} = ${certificateId}
    `);

    if (existingCert.rows.length === 0) {
      return NextResponse.json(
        { error: "Certificado no encontrado" },
        { status: 404 }
      );
    }

    // Actualizar certificado
    const updateQuery = sql`
      UPDATE ${sql.identifier(getTableName(certificatesTable))}
      SET
        ${sql.identifier(certificatesTable.updatedAt.name)} = ${new Date().toISOString()},
        ${sql.identifier(certificatesTable.title.name)} = ${body.title || existingCert.rows[0].title},
        ${sql.identifier(certificatesTable.description.name)} = ${body.description || existingCert.rows[0].description},
        ${sql.identifier(certificatesTable.grade.name)} = ${
          body.grade !== undefined ? body.grade : existingCert.rows[0].grade
        },
        ${sql.identifier(certificatesTable.certificateUrl.name)} = ${
          body.certificateUrl || existingCert.rows[0].certificateUrl
        }
      WHERE ${sql.identifier(certificatesTable.id.name)} = ${certificateId}
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

    // Verificar permisos
    if (!payload.permissions.includes("courses:manage")) {
      return NextResponse.json(
        { error: "Sin permisos para eliminar certificados" },
        { status: 403 }
      );
    }

    const { id: certificateId } = await params;

    // ===== VALIDAR UUID =====
    const idValidation = validateUUID(certificateId, 'ID de certificado');
    if (!idValidation.isValid) {
      return NextResponse.json(
        { error: idValidation.errors?.[0] || 'ID inválido' },
        { status: 400 }
      );
    }

    // Soft delete - marcar como inactivo
    const result = await db.execute(sql`
      UPDATE ${sql.identifier(getTableName(certificatesTable))}
      SET ${sql.identifier(certificatesTable.isActive.name)} = false, ${sql.identifier(certificatesTable.updatedAt.name)} = ${new Date().toISOString()}
      WHERE ${sql.identifier(certificatesTable.id.name)} = ${certificateId}
      RETURNING ${sql.identifier(certificatesTable.id.name)}
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
