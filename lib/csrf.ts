import { randomBytes, createHmac, timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

// ===== CONFIGURACIÓN CSRF =====
const CSRF_SECRET = process.env.CSRF_SECRET || process.env.JWT_SECRET;
const CSRF_TOKEN_EXPIRY_MS = 15 * 60 * 1000; // 15 minutos
const CSRF_TOKEN_LENGTH = 32; // bytes
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
interface CsrfTokenData {
  token: string;
  expiresAt: number;
  signature: string;
}

interface CsrfValidationResult {
  valid: boolean;
  error?: string;
}

// ===== STORE EN MEMORIA (para MVP, usar Redis en producción) =====
const csrfTokenStore = new Map<string, CsrfTokenData>();

/**
 * Genera un token CSRF criptográficamente seguro
 * @returns Token CSRF con su firma
 */
export function generateCsrfToken(): { token: string; signature: string } {
  const token = randomBytes(CSRF_TOKEN_LENGTH).toString("hex");
  const expiresAt = Date.now() + CSRF_TOKEN_EXPIRY_MS;

  // Crear firma HMAC para el token
  const signature = createHmac("sha256", CSRF_SECRET || "dev-secret")
    .update(`${token}:${expiresAt}`)
    .digest("hex");

  // Almacenar en memoria
  csrfTokenStore.set(token, {
    token,
    expiresAt,
    signature,
  });

  // Limpiar tokens expirados probabilísticamente
  if (Math.random() < 0.01) {
    cleanExpiredTokens();
  }

  return { token, signature };
}

/**
 * Valida un token CSRF
 * @param token - Token a validar
 * @param signature - Firma del token (opcional, para doble validación)
 * @returns Resultado de la validación
 */
export function validateCsrfToken(
  token: string,
  signature?: string
): CsrfValidationResult {
  if (!token) {
    return { valid: false, error: "CSRF token not provided" };
  }

  const tokenData = csrfTokenStore.get(token);

  if (!tokenData) {
    console.warn("CSRF validation failed: token not found", {
      token: token.substring(0, 8) + "...",
      timestamp: new Date().toISOString(),
    });
    return { valid: false, error: "Invalid CSRF token" };
  }

  // Verificar expiración
  if (Date.now() > tokenData.expiresAt) {
    csrfTokenStore.delete(token);
    console.warn("CSRF validation failed: token expired", {
      token: token.substring(0, 8) + "...",
      expiredAt: new Date(tokenData.expiresAt).toISOString(),
    });
    return { valid: false, error: "CSRF token expired" };
  }

  // Verificar firma si se proporciona
  if (signature) {
    const expectedSignature = tokenData.signature;

    try {
      const signatureBuffer = Buffer.from(signature, "hex");
      const expectedBuffer = Buffer.from(expectedSignature, "hex");

      if (signatureBuffer.length !== expectedBuffer.length) {
        return { valid: false, error: "Invalid CSRF signature" };
      }

      if (!timingSafeEqual(signatureBuffer, expectedBuffer)) {
        console.warn("CSRF validation failed: signature mismatch", {
          token: token.substring(0, 8) + "...",
        });
        return { valid: false, error: "Invalid CSRF signature" };
      }
    } catch {
      return { valid: false, error: "Invalid CSRF signature format" };
    }
  }

  return { valid: true };
}

/**
 * Invalida un token CSRF (útil para single-use tokens)
 * @param token - Token a invalidar
 */
export function invalidateCsrfToken(token: string): void {
  csrfTokenStore.delete(token);
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

  // Validar token en el store
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
  // Auth routes (usan sus propios mecanismos)
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/logout",
  "/api/auth/refresh",
  "/api/auth/forgot-password",
  "/api/auth/reset-password",
  "/api/auth/verify-email",
  "/api/auth/accept-invite",
  // Webhooks externos
  "/api/billing/webhooks",
  "/api/webhooks",
  // CSRF token endpoint
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

/**
 * Limpia tokens expirados del store
 */
function cleanExpiredTokens(): void {
  const now = Date.now();
  let cleaned = 0;

  for (const [token, data] of csrfTokenStore.entries()) {
    if (now > data.expiresAt) {
      csrfTokenStore.delete(token);
      cleaned++;
    }
  }

  if (cleaned > 0) {
    console.log(`CSRF store: cleaned ${cleaned} expired tokens`);
  }
}

// ===== UTILIDADES PARA TESTING =====

/**
 * Obtiene el tamaño actual del store
 */
export function getCsrfStoreSize(): number {
  return csrfTokenStore.size;
}

/**
 * Limpia todo el store (para testing)
 */
export function clearCsrfStore(): void {
  csrfTokenStore.clear();
}

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
  TOKEN_LENGTH: CSRF_TOKEN_LENGTH,
} as const;
