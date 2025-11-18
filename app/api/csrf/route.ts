import { NextRequest, NextResponse } from "next/server";
import { generateCsrfToken, getCsrfCookieConfig, CSRF_CONFIG } from "@/lib/csrf";
import { queryRateLimit } from "@/lib/rate-limit";

/**
 * GET /api/csrf
 *
 * Genera un nuevo token CSRF y lo almacena en una cookie httpOnly.
 * El token también se retorna en el body para uso en el header x-csrf-token.
 *
 * Patrón: Double-Submit Cookie
 * - El token se guarda en cookie httpOnly (protección XSS)
 * - El cliente envía el mismo token en header x-csrf-token
 * - El servidor compara ambos valores
 */
export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = await queryRateLimit(request);
    if (rateLimitResult) {
      return rateLimitResult;
    }

    // Generar nuevo token
    const { token, signature } = generateCsrfToken();

    // Configurar cookie
    const cookieConfig = getCsrfCookieConfig();

    // Crear respuesta
    const response = NextResponse.json(
      {
        success: true,
        data: {
          token,
          expiresIn: CSRF_CONFIG.EXPIRY_MS / 1000, // segundos
        },
      },
      { status: 200 }
    );

    // Establecer cookie httpOnly
    response.cookies.set(cookieConfig.name, token, cookieConfig.options);

    // Headers de seguridad adicionales
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
    response.headers.set("Pragma", "no-cache");

    return response;
  } catch (error) {
    console.error("Error generating CSRF token:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to generate CSRF token",
      },
      { status: 500 }
    );
  }
}

/**
 * OPTIONS /api/csrf
 *
 * Maneja preflight CORS requests
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Max-Age": "86400",
    },
  });
}
