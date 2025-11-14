/**
 * Auth functions for Edge Runtime (Middleware)
 * Only compatible with Edge Runtime - uses jose for JWT verification
 */
import * as jose from "jose";
import type { JWTPayload } from "@/app/types";

// ===== CONFIGURACIÓN =====
const JWT_SECRET = process.env.JWT_SECRET;

// ===== VERIFICACIÓN DE TOKENS (Edge Runtime - Middleware) =====
export async function verifyTokenEdge(
  token: string
): Promise<JWTPayload | null> {
  try {
    if (!JWT_SECRET) {
      console.error("JWT_SECRET not configured");
      return null;
    }
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jose.jwtVerify(token, secret);
    return payload as unknown as JWTPayload;
  } catch {
    return null;
  }
}

export async function verifyAccessTokenEdge(
  token: string
): Promise<JWTPayload | null> {
  const payload = await verifyTokenEdge(token);
  if (payload && payload.type === "access") {
    return payload;
  }
  return null;
}
