import { NextResponse } from "next/server";

interface RateLimitConfig {
  windowMs: number; // Ventana de tiempo en ms
  maxRequests: number; // Máximo de requests en la ventana
  message?: string; // Mensaje personalizado
}

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number;
}

// Store simple en memoria (para MVP, usar Redis en producción)
const rateLimitStore = new Map<string, RateLimitRecord>();

/**
 * Crea un rate limiter configurable para proteger endpoints
 * @param config - Configuración del rate limiter
 * @returns Función que verifica el rate limit y retorna NextResponse si excede el límite
 */
export function createRateLimiter(config: RateLimitConfig) {
  return async function rateLimit(
    req: Request
  ): Promise<NextResponse | null> {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";

    const pathname = new URL(req.url).pathname;
    const key = `${ip}:${pathname}`;
    const now = Date.now();

    // Limpiar registros expirados (probabilísticamente cada ~1000 requests)
    if (Math.random() < 0.001) {
      cleanExpiredRecords(now);
    }

    const record = rateLimitStore.get(key);

    // Primer request o ventana expirada
    if (!record || now > record.resetTime) {
      rateLimitStore.set(key, {
        count: 1,
        resetTime: now + config.windowMs,
      });

      // No retornamos response, solo headers que se agregarán después
      return null;
    }

    // Límite excedido
    if (record.count >= config.maxRequests) {
      const retryAfter = Math.ceil((record.resetTime - now) / 1000);

      console.warn("Rate limit exceeded:", {
        ip,
        pathname,
        count: record.count,
        limit: config.maxRequests,
        retryAfter,
      });

      return NextResponse.json(
        {
          error: config.message || "Too many requests",
          retryAfter,
        },
        {
          status: 429,
          headers: {
            "Retry-After": retryAfter.toString(),
            "X-RateLimit-Limit": config.maxRequests.toString(),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": record.resetTime.toString(),
          },
        }
      );
    }

    // Incrementar contador
    record.count++;

    return null;
  };
}

/**
 * Obtiene información del rate limit actual para un request
 * Útil para agregar headers informativos a las respuestas
 */
export function getRateLimitInfo(
  req: Request,
  config: RateLimitConfig
): RateLimitInfo {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";

  const pathname = new URL(req.url).pathname;
  const key = `${ip}:${pathname}`;
  const now = Date.now();

  const record = rateLimitStore.get(key);

  if (!record || now > record.resetTime) {
    return {
      limit: config.maxRequests,
      remaining: config.maxRequests,
      reset: now + config.windowMs,
    };
  }

  return {
    limit: config.maxRequests,
    remaining: Math.max(0, config.maxRequests - record.count),
    reset: record.resetTime,
  };
}

/**
 * Agrega headers de rate limit a una respuesta existente
 */
export function addRateLimitHeaders(
  response: NextResponse,
  info: RateLimitInfo
): NextResponse {
  response.headers.set("X-RateLimit-Limit", info.limit.toString());
  response.headers.set("X-RateLimit-Remaining", info.remaining.toString());
  response.headers.set("X-RateLimit-Reset", info.reset.toString());

  return response;
}

/**
 * Limpia registros expirados del store
 */
function cleanExpiredRecords(now: number): void {
  let cleaned = 0;
  for (const [key, record] of rateLimitStore.entries()) {
    if (now > record.resetTime) {
      rateLimitStore.delete(key);
      cleaned++;
    }
  }
  if (cleaned > 0) {
    console.log(`Rate limit store: cleaned ${cleaned} expired records`);
  }
}

/**
 * Obtiene el tamaño actual del store (útil para debugging/monitoring)
 */
export function getRateLimitStoreSize(): number {
  return rateLimitStore.size;
}

/**
 * Limpia todo el store (útil para testing)
 */
export function clearRateLimitStore(): void {
  rateLimitStore.clear();
}

// ==========================================
// PRESETS DE RATE LIMITING
// ==========================================

/**
 * Rate limit para autenticación
 * Muy estricto: 5 requests por 15 minutos
 * Uso: login, register, reset-password, forgot-password
 */
export const authRateLimit = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutos
  maxRequests: 5,
  message: "Too many authentication attempts. Please try again later.",
});

/**
 * Rate limit estricto para operaciones sensibles
 * 10 requests por minuto
 * Uso: creación de usuarios, invites, operaciones admin críticas
 */
export const strictRateLimit = createRateLimiter({
  windowMs: 60 * 1000, // 1 minuto
  maxRequests: 10,
  message: "Rate limit exceeded for sensitive operation.",
});

/**
 * Rate limit estándar para APIs
 * 60 requests por minuto
 * Uso: endpoints generales de lectura/escritura
 */
export const apiRateLimit = createRateLimiter({
  windowMs: 60 * 1000, // 1 minuto
  maxRequests: 60,
  message: "API rate limit exceeded.",
});

/**
 * Rate limit relajado para consultas
 * 120 requests por minuto
 * Uso: endpoints de solo lectura de bajo impacto
 */
export const queryRateLimit = createRateLimiter({
  windowMs: 60 * 1000, // 1 minuto
  maxRequests: 120,
  message: "Query rate limit exceeded.",
});

// ==========================================
// CONFIGURACIONES EXPORTADAS
// ==========================================

export const RATE_LIMIT_CONFIGS = {
  auth: {
    windowMs: 15 * 60 * 1000,
    maxRequests: 5,
  },
  strict: {
    windowMs: 60 * 1000,
    maxRequests: 10,
  },
  api: {
    windowMs: 60 * 1000,
    maxRequests: 60,
  },
  query: {
    windowMs: 60 * 1000,
    maxRequests: 120,
  },
} as const;
