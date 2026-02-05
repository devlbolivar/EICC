import "server-only";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { randomBytes, randomUUID } from "crypto";
import { Permission, SYSTEM_ROLES, ROLE_PERMISSIONS } from "@/app/types";
import type { SignOptions } from "jsonwebtoken";
import { SECURITY_CONFIG, TIMEOUT_CONFIG } from "@/lib/config";

// ===== CONFIGURACIÓN =====
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || "30d";

// ===== VALIDACIÓN DE CONFIGURACIÓN =====
// Skip validation during build phase (Vercel, local builds, etc.)
const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build';

if (!isBuildPhase && !JWT_SECRET) {
  if (process.env.NODE_ENV === "production") {
    console.error("❌ JWT_SECRET must be set in production environment");
    console.error("📝 Set this in your Vercel Environment Variables:");
    console.error("   Settings → Environment Variables → JWT_SECRET");
    throw new Error("JWT_SECRET must be set in production environment");
  }
  console.warn("⚠️ JWT_SECRET not set - using dummy value for development");
}

if (!isBuildPhase && JWT_SECRET === "your-secret-key-change-in-production") {
  console.warn("⚠️ Using default JWT_SECRET - NOT SECURE FOR PRODUCTION");
}

// ===== TIPOS =====
import { JWTPayload, TokenPair } from "@/app/types";

// ===== HASH DE CONTRASEÑAS =====
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SECURITY_CONFIG.BCRYPT_SALT_ROUNDS);
}

export async function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// ===== GENERACIÓN DE TOKENS =====
export function generateAccessToken(payload: Omit<JWTPayload, "type">): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET not configured");
  }
  return jwt.sign({ ...payload, type: "access" as const, jti: randomUUID() }, secret, {
    expiresIn: JWT_EXPIRES_IN,
  } as SignOptions);
}

export function generateRefreshToken(
  payload: Omit<JWTPayload, "type">
): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET not configured");
  }
  return jwt.sign({ ...payload, type: "refresh" as const, jti: randomUUID() }, secret, {
    expiresIn: REFRESH_TOKEN_EXPIRES_IN,
  } as SignOptions);
}

export function generateTokenPair(
  payload: Omit<JWTPayload, "type">
): TokenPair {
  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload),
  };
}

// ===== VERIFICACIÓN DE TOKENS (API Routes - Node.js) =====
export function verifyToken(token: string): JWTPayload | null {
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error("JWT_SECRET not configured");
      return null;
    }
    const decoded = jwt.verify(token, secret);
    return decoded as JWTPayload;
  } catch {
    return null;
  }
}

export function verifyAccessToken(token: string): JWTPayload | null {
  const payload = verifyToken(token);
  if (payload && payload.type === "access") {
    return payload;
  }
  return null;
}

export function verifyRefreshToken(token: string): JWTPayload | null {
  const payload = verifyToken(token);
  if (payload && payload.type === "refresh") {
    return payload;
  }
  return null;
}

// ===== VERIFICACIÓN DE TOKENS (Edge Runtime - Middleware) =====
// Edge Runtime functions moved to lib/auth-edge.ts to avoid Node.js module conflicts
// Import from @/lib/auth-edge for middleware usage
export { verifyTokenEdge, verifyAccessTokenEdge } from "@/lib/auth-edge";

// ===== GENERACIÓN DE TOKENS ESPECIALES =====
export function generateEmailVerificationToken(): string {
  return randomBytes(SECURITY_CONFIG.TOKEN_LENGTH_BYTES).toString("hex");
}

export function generatePasswordResetToken(): string {
  return randomBytes(SECURITY_CONFIG.TOKEN_LENGTH_BYTES).toString("hex");
}

export function generateInvitationToken(): string {
  return randomBytes(SECURITY_CONFIG.TOKEN_LENGTH_BYTES).toString("hex");
}

// ===== VALIDACIÓN DE PERMISOS =====
export function hasPermission(
  userPermissions: Permission[],
  requiredPermission: Permission
): boolean {
  return userPermissions.includes(requiredPermission);
}

export function hasAnyPermission(
  userPermissions: Permission[],
  requiredPermissions: Permission[]
): boolean {
  return requiredPermissions.some((permission) =>
    userPermissions.includes(permission)
  );
}

export function hasAllPermissions(
  userPermissions: Permission[],
  requiredPermissions: Permission[]
): boolean {
  return requiredPermissions.every((permission) =>
    userPermissions.includes(permission)
  );
}

export function getPermissionsForRole(roleName: string): Permission[] {
  return ROLE_PERMISSIONS[roleName] || [];
}

export function isSystemRole(roleName: string): boolean {
  return Object.values(SYSTEM_ROLES).includes(
    roleName as (typeof SYSTEM_ROLES)[keyof typeof SYSTEM_ROLES]
  );
}

// ===== UTILIDADES DE FECHA =====
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function addHours(date: Date, hours: number): Date {
  const result = new Date(date);
  result.setHours(result.getHours() + hours);
  return result;
}

export function isExpired(date: Date): boolean {
  return new Date() > date;
}

// ===== CONSTANTES =====
export const TOKEN_EXPIRY = {
  EMAIL_VERIFICATION: TIMEOUT_CONFIG.EMAIL_VERIFICATION_TOKEN_MS, // 24 horas
  PASSWORD_RESET: TIMEOUT_CONFIG.PASSWORD_RESET_TOKEN_MS, // 1 hora
  INVITATION: TIMEOUT_CONFIG.INVITATION_TOKEN_MS, // 7 días
} as const;

// ===== RE-EXPORTS =====
// Re-export verifyAuth from admin-auth for convenience
export { verifyAuth } from "@/lib/admin-auth";

// Re-export shared validation logic for server-side usage
export * from "@/lib/auth-shared";
