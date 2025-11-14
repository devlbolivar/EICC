import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { randomBytes } from "crypto";
import { Permission, SYSTEM_ROLES, ROLE_PERMISSIONS } from "@/app/types";
import type { SignOptions } from "jsonwebtoken";

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
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

export async function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// ===== GENERACIÓN DE TOKENS =====
export function generateAccessToken(payload: Omit<JWTPayload, "type">): string {
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET not configured");
  }
  return jwt.sign({ ...payload, type: "access" as const }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  } as SignOptions);
}

export function generateRefreshToken(
  payload: Omit<JWTPayload, "type">
): string {
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET not configured");
  }
  return jwt.sign({ ...payload, type: "refresh" as const }, JWT_SECRET, {
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
    if (!JWT_SECRET) {
      console.error("JWT_SECRET not configured");
      return null;
    }
    const decoded = jwt.verify(token, JWT_SECRET);
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
  return randomBytes(32).toString("hex");
}

export function generatePasswordResetToken(): string {
  return randomBytes(32).toString("hex");
}

export function generateInvitationToken(): string {
  return randomBytes(32).toString("hex");
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

// ===== VALIDACIÓN DE DATOS =====
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePassword(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push("La contraseña debe tener al menos 8 caracteres");
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("La contraseña debe contener al menos una letra mayúscula");
  }

  if (!/[a-z]/.test(password)) {
    errors.push("La contraseña debe contener al menos una letra minúscula");
  }

  if (!/\d/.test(password)) {
    errors.push("La contraseña debe contener al menos un número");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validateOrganizationSlug(slug: string): boolean {
  const slugRegex = /^[a-z0-9-]+$/;
  return slugRegex.test(slug) && slug.length >= 3 && slug.length <= 50;
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

// ===== SANITIZACIÓN =====
export function sanitizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

export function sanitizeName(name: string): string {
  return name.trim().replace(/\s+/g, " ");
}

export function sanitizeSlug(slug: string): string {
  return slug
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-");
}

// ===== CONSTANTES =====
export const TOKEN_EXPIRY = {
  EMAIL_VERIFICATION: 24 * 60 * 60 * 1000, // 24 horas
  PASSWORD_RESET: 1 * 60 * 60 * 1000, // 1 hora
  INVITATION: 7 * 24 * 60 * 60 * 1000, // 7 días
} as const;

export const PASSWORD_REQUIREMENTS = {
  MIN_LENGTH: 8,
  REQUIRE_UPPERCASE: true,
  REQUIRE_LOWERCASE: true,
  REQUIRE_NUMBERS: true,
  REQUIRE_SPECIAL_CHARS: false,
} as const;

// ===== RE-EXPORTS =====
// Re-export verifyAuth from admin-auth for convenience
export { verifyAuth } from "@/lib/admin-auth";
