import { randomBytes, createHmac, timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";

// ===== CONFIGURACIÓN CSRF =====
const CSRF_SECRET = process.env.CSRF_SECRET || process.env.JWT_SECRET;
const CSRF_TOKEN_EXPIRY_MS = 15 * 60 * 1000; // 15 minutos
const CSRF_COOKIE_NAME = "csrf_token";
const CSRF_HEADER_NAME = "x-csrf-token";

// Skip validation during build phase
const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build';

if (!isBuildPhase && !CSRF_SECRET) {
  if (process.env.NODE_ENV === "production") {
    console.error("CSRF_SECRET or JWT_SECRET must be set in production");
    throw new Error("CSRF_SECRET not configured");
  }
  console.warn("CSRF_SECRET not set - using default for development");
}

// ===== TIPOS =====
interface CsrfValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Genera un token CSRF stateless firmado
 * Formato: timestamp:random:signature
 * @returns Token CSRF completo
 */
export function generateCsrfToken(): { token: string } {
  const timestamp = Date.now().toString();
  const random = randomBytes(16).toString("hex");
  const data = `${timestamp}:${random}`;

  const signature = createHmac("sha256", CSRF_SECRET || "unsafe-dev-csrf-secret-do-not-use-in-production")
    .update(data)
    .digest("hex");

  const token = `${data}:${signature}`;

  return { token };
}

/**
 * Valida un token CSRF stateless
 * @param token - Token a validar
 * @returns Resultado de la validación
 */
export function validateCsrfToken(token: string): CsrfValidationResult {
  if (!token) {
    return { valid: false, error: "CSRF token not provided" };
  }

  const parts = token.split(":");
  if (parts.length !== 3) {
    return { valid: false, error: "Invalid CSRF token format" };
  }

  const [timestampStr, random, signature] = parts;
  const timestamp = parseInt(timestampStr, 10);

  if (isNaN(timestamp)) {
    return { valid: false, error: "Invalid CSRF token timestamp" };
  }

  // Verificar expiración
  if (Date.now() > timestamp + CSRF_TOKEN_EXPIRY_MS) {
    return { valid: false, error: "CSRF token expired" };
  }

  // Verificar firma
  const data = `${timestampStr}:${random}`;
  const expectedSignature = createHmac("sha256", CSRF_SECRET || "unsafe-dev-csrf-secret-do-not-use-in-production")
    .update(data)
    .digest("hex");

  try {
    const signatureBuffer = Buffer.from(signature, "hex");
    const expectedBuffer = Buffer.from(expectedSignature, "hex");

    if (signatureBuffer.length !== expectedBuffer.length) {
      return { valid: false, error: "Invalid CSRF signature" };
    }

    if (!timingSafeEqual(signatureBuffer, expectedBuffer)) {
      return { valid: false, error: "Invalid CSRF signature" };
    }
  } catch {
    return { valid: false, error: "Invalid CSRF signature format" };
  }

  return { valid: true };
}

/**
 * Valida CSRF para un request (middleware helper)
 * Implementa el patrón Double-Submit Cookie
 */
export async function validateCsrfRequest(
  request: NextRequest
): Promise<CsrfValidationResult> {
  const method = request.method.toUpperCase();

  // Solo validar métodos que modifican datos
  if (!["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
    return { valid: true };
  }

  const pathname = new URL(request.url).pathname;

  // Excluir rutas que no requieren CSRF
  if (isExemptFromCsrf(pathname)) {
    return { valid: true };
  }

  // Obtener token del header
  const headerToken = request.headers.get(CSRF_HEADER_NAME);

  // Obtener token de la cookie
  const cookieToken = request.cookies.get(CSRF_COOKIE_NAME)?.value;

  // Validar presencia de tokens
  if (!headerToken) {
    logCsrfFailure(request, "Missing CSRF header");
    return { valid: false, error: "CSRF token required" };
  }

  if (!cookieToken) {
    logCsrfFailure(request, "Missing CSRF cookie");
    return { valid: false, error: "CSRF cookie not found" };
  }

  // Double-submit cookie pattern: comparar header con cookie
  if (headerToken !== cookieToken) {
    logCsrfFailure(request, "Token mismatch (double-submit)");
    return { valid: false, error: "CSRF token mismatch" };
  }

  // Validar la firma y expiración del token
  const validation = validateCsrfToken(headerToken);

  if (!validation.valid) {
    logCsrfFailure(request, validation.error || "Validation failed");
  }

  return validation;
}

/**
 * Middleware para validar CSRF en routes protegidas
 * Retorna NextResponse si hay error, null si es válido
 */
export async function csrfMiddleware(
  request: NextRequest
): Promise<NextResponse | null> {
  const validation = await validateCsrfRequest(request);

  if (!validation.valid) {
    return NextResponse.json(
      {
        success: false,
        error: validation.error || "CSRF validation failed",
      },
      { status: 403 }
    );
  }

  return null;
}

/**
 * Helper para aplicar CSRF en API route handlers
 * Uso: const csrfError = await requireCsrf(request);
 *      if (csrfError) return csrfError;
 */
export async function requireCsrf(
  request: NextRequest
): Promise<NextResponse | null> {
  return csrfMiddleware(request);
}

/**
 * Custom error para CSRF
 */
export class CsrfError extends Error {
  public statusCode: number;

  constructor(message: string, statusCode = 403) {
    super(message);
    this.name = "CsrfError";
    this.statusCode = statusCode;
  }
}

// ===== RUTAS EXENTAS DE CSRF =====
const csrfExemptRoutes = [
  // Only exempt routes that truly cannot include CSRF tokens:
  // - Login: no prior session to set CSRF cookie
  // - Forgot-password: no prior session
  // - Verify-email: GET-like operation via POST
  // - Refresh: uses httpOnly refresh token as implicit CSRF protection
  "/api/auth/login",
  "/api/auth/refresh",
  "/api/auth/forgot-password",
  "/api/auth/reset-password", // public flow: user arrives from email link with no session/CSRF cookie
  "/api/auth/verify-email",
  "/api/auth/accept-invite",
  // Webhooks from external services (use webhook signature verification)
  "/api/billing/webhooks",
  "/api/webhooks",
  // CSRF token endpoint itself
  "/api/csrf",
];

/**
 * Verifica si una ruta está exenta de validación CSRF
 */
function isExemptFromCsrf(pathname: string): boolean {
  return csrfExemptRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );
}

/**
 * Registra intentos de CSRF fallidos para auditoría
 */
function logCsrfFailure(request: NextRequest, reason: string): void {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  const pathname = new URL(request.url).pathname;
  const method = request.method;
  const userAgent = request.headers.get("user-agent") || "unknown";

  console.error("CSRF validation failed:", {
    timestamp: new Date().toISOString(),
    ip,
    method,
    pathname,
    reason,
    userAgent: userAgent.substring(0, 100), // Truncar user-agent largo
  });
}

// ===== UTILIDADES PARA TESTING =====

/**
 * Obtiene la configuración de cookie para CSRF
 */
export function getCsrfCookieConfig() {
  const isProduction = process.env.NODE_ENV === "production";

  return {
    name: CSRF_COOKIE_NAME,
    options: {
      httpOnly: true,
      secure: isProduction,
      sameSite: "strict" as const,
      path: "/",
      maxAge: Math.floor(CSRF_TOKEN_EXPIRY_MS / 1000), // en segundos
    },
  };
}

// ===== CONSTANTES EXPORTADAS =====
export const CSRF_CONFIG = {
  COOKIE_NAME: CSRF_COOKIE_NAME,
  HEADER_NAME: CSRF_HEADER_NAME,
  EXPIRY_MS: CSRF_TOKEN_EXPIRY_MS,
} as const;
