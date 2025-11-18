import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/database";
import * as schema from "@/config/schema";
import { verifyAdminAuth } from "@/lib/admin-auth";
import { eq } from "drizzle-orm";
import { ERROR_MESSAGES } from "@/lib/constants";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // ===== VERIFICAR AUTENTICACIÓN Y PERMISOS DE ADMIN =====
    const authResult = await verifyAdminAuth(request);
    if (!authResult.authorized) {
      return authResult.response;
    }

    const { id: certificateId } = await params;

    // ===== OBTENER DATOS DEL BODY (opcional: razón de revocación) =====
    const body = await request.json().catch(() => ({}));
    const { reason } = body;

    // ===== VERIFICAR QUE EL CERTIFICADO EXISTE =====
    const existingCertificate = await db
      .select()
      .from(schema.certificatesTable)
      .where(eq(schema.certificatesTable.id, certificateId))
      .limit(1);

    if (existingCertificate.length === 0) {
      return NextResponse.json(
        { error: "Certificado no encontrado" },
        { status: 404 }
      );
    }

    // ===== VERIFICAR SI YA ESTÁ REVOCADO =====
    if (!existingCertificate[0].isActive) {
      return NextResponse.json(
        { error: "El certificado ya está revocado" },
        { status: 400 }
      );
    }

    // ===== REVOCAR CERTIFICADO (Soft delete) =====
    const revokedCertificate = await db
      .update(schema.certificatesTable)
      .set({
        isActive: false,
        updatedAt: new Date(),
        // Si tuviéramos un campo para la razón, lo agregaríamos aquí
        description: reason
          ? `${existingCertificate[0].description || ""}\n\n[REVOCADO] Razón: ${reason}`
          : existingCertificate[0].description,
      })
      .where(eq(schema.certificatesTable.id, certificateId))
      .returning();

    return NextResponse.json({
      success: true,
      data: revokedCertificate[0],
      message: "Certificado revocado exitosamente",
    });
  } catch (error) {
    console.error("Error revocando certificado:", error);
    return NextResponse.json(
      {
        error: ERROR_MESSAGES.SERVER_ERROR,
        details:
          error instanceof Error ? error.message : ERROR_MESSAGES.UNKNOWN_ERROR,
      },
      { status: 500 }
    );
  }
}
