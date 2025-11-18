import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/database";
import * as schema from "@/config/schema";
import { verifyAdminAuth } from "@/lib/admin-auth";
import { eq } from "drizzle-orm";
import { ERROR_MESSAGES } from "@/lib/constants";
import { generateCertificateId } from "@/lib/certificate-service";
import { validateUUID } from "@/lib/validation";

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

    // ===== VALIDAR UUID =====
    const idValidation = validateUUID(certificateId, 'ID de certificado');
    if (!idValidation.isValid) {
      return NextResponse.json(
        { error: idValidation.errors?.[0] || 'ID inválido' },
        { status: 400 }
      );
    }

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

    const oldCertificate = existingCertificate[0];

    // ===== GENERAR NUEVO CERTIFICATE ID =====
    const newCertificateId = generateCertificateId();

    // ===== CREAR NUEVO CERTIFICADO CON LOS MISMOS DATOS =====
    const newCertificate = await db
      .insert(schema.certificatesTable)
      .values({
        certificateId: newCertificateId,
        courseId: oldCertificate.courseId,
        userId: oldCertificate.userId,
        companyId: oldCertificate.companyId,
        title: oldCertificate.title,
        description: oldCertificate.description
          ? `${oldCertificate.description}\n\n[REEMITIDO] Certificado original: ${oldCertificate.certificateId}`
          : `[REEMITIDO] Certificado original: ${oldCertificate.certificateId}`,
        grade: oldCertificate.grade,
        completedDate: oldCertificate.completedDate,
        duration: oldCertificate.duration,
        certificateUrl: oldCertificate.certificateUrl, // Se puede regenerar si es necesario
        isActive: true,
      })
      .returning();

    // ===== OPCIONALMENTE REVOCAR EL CERTIFICADO ANTERIOR =====
    await db
      .update(schema.certificatesTable)
      .set({
        isActive: false,
        updatedAt: new Date(),
        description: oldCertificate.description
          ? `${oldCertificate.description}\n\n[REEMPLAZADO] Por certificado: ${newCertificateId}`
          : `[REEMPLAZADO] Por certificado: ${newCertificateId}`,
      })
      .where(eq(schema.certificatesTable.id, certificateId));

    return NextResponse.json({
      success: true,
      data: {
        oldCertificate: oldCertificate,
        newCertificate: newCertificate[0],
      },
      message: "Certificado reemitido exitosamente",
    });
  } catch (error) {
    console.error("Error reemitiendo certificado:", error);
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
