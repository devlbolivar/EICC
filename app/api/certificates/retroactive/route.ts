import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken } from "@/lib/auth";
import { cookies } from "next/headers";
import {
  ensureCertificatesForUser,
  createRetroactiveCertificate,
} from "@/lib/retroactive-certificates";

// ===== POST - Create missing certificates for user =====
export async function POST(request: NextRequest) {
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
    const { courseId, userId, companyId } = body;

    // Si se especifica un courseId, crear certificado para ese curso específico
    if (courseId) {
      const targetUserId = userId || payload.userId;
      const result = await createRetroactiveCertificate(
        courseId,
        targetUserId,
        companyId || payload.companyId
      );

      if (result.success) {
        const message = result.alreadyExists
          ? "Certificado ya existe"
          : "Certificado creado exitosamente";
        return NextResponse.json({
          success: true,
          message,
          data: result.certificate,
          alreadyExists: result.alreadyExists || false,
        });
      } else {
        return NextResponse.json(
          {
            success: false,
            error: result.error,
          },
          { status: 400 }
        );
      }
    }

    // Si no se especifica courseId, crear todos los certificados faltantes
    const targetUserId = userId || payload.userId;
    const result = await ensureCertificatesForUser(
      targetUserId,
      companyId || payload.companyId
    );

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: result.message,
        data: {
          created: result.created,
          errors: result.errors || [],
        },
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error creating retroactive certificates:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
