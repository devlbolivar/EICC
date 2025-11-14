import { NextRequest, NextResponse } from "next/server";
import { verifyAuth, verifyAdminAuth } from "@/lib/admin-auth";

/**
 * Helper para verificar autenticación en API routes
 * Uso: const { authorized, payload } = await requireAuth(request);
 */
export async function requireAuth(request: NextRequest) {
  const authResult = await verifyAuth(request);

  if (!authResult.authorized) {
    throw new AuthError(authResult.response);
  }

  return {
    authorized: true,
    payload: authResult.payload!,
  };
}

/**
 * Helper para verificar autenticación + permisos admin
 * Uso: const { authorized, payload } = await requireAdmin(request);
 */
export async function requireAdmin(request: NextRequest) {
  const authResult = await verifyAdminAuth(request);

  if (!authResult.authorized) {
    throw new AuthError(authResult.response);
  }

  return {
    authorized: true,
    payload: authResult.payload!,
  };
}

/**
 * Custom error para manejar errores de autenticación
 */
export class AuthError extends Error {
  constructor(public response: NextResponse) {
    super("Authentication failed");
    this.name = "AuthError";
  }
}

/**
 * Helper para manejar errores en API routes
 */
export function handleApiError(error: unknown) {
  console.error("API Error:", error);

  if (error instanceof AuthError) {
    return error.response;
  }

  return NextResponse.json(
    {
      success: false,
      error: error instanceof Error ? error.message : "Error interno del servidor"
    },
    { status: 500 }
  );
}

/**
 * Helper para respuestas exitosas consistentes
 */
export function successResponse(data: Record<string, unknown>, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

/**
 * Helper para respuestas de error consistentes
 */
export function errorResponse(error: string, status = 400) {
  return NextResponse.json({ success: false, error }, { status });
}
