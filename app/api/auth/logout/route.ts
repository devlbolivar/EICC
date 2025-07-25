import { NextResponse } from "next/server";

export async function POST() {
  try {
    // ===== CONFIGURAR RESPUESTA =====
    const response = NextResponse.json(
      {
        success: true,
        message: "Sesión cerrada exitosamente",
      },
      { status: 200 }
    );

    // ===== LIMPIAR COOKIES =====
    response.cookies.set("accessToken", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0, // Expirar inmediatamente
    });

    response.cookies.set("refreshToken", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0, // Expirar inmediatamente
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
