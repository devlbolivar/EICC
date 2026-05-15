import { requireCsrf } from "@/lib/csrf";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    const csrfResult = await requireCsrf(request);
    if (csrfResult) return csrfResult;

  try {
    const response = NextResponse.json(
      { success: true, message: "Logout exitoso" },
      { status: 200 }
    );

    // Limpiar cookies de autenticación
    response.cookies.set("accessToken", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 0, // Expirar inmediatamente
      path: "/",
    });

    response.cookies.set("refreshToken", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 0, // Expirar inmediatamente
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Error en logout:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
