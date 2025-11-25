import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ===== UTILIDADES DE SEGURIDAD =====

/**
 * Sanitiza una cadena de texto para prevenir XSS
 */
export function sanitizeString(input: string): string {
  if (typeof input !== "string") {
    return "";
  }

  return input
    .replace(/<[^>]*>/g, "") // Quita etiquetas HTML completas
    .replace(/javascript:/gi, "")
    .replace(/on\w+=/gi, "")
    .trim();
}

/**
 * Valida y sanitiza un email
 */
export function validateAndSanitizeEmail(email: string): string | null {
  if (!email || typeof email !== "string") {
    return null;
  }

  const sanitized = email.toLowerCase().trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  return emailRegex.test(sanitized) ? sanitized : null;
}

/**
 * Valida que una cadena contenga solo caracteres seguros
 */
export function validateSafeString(
  input: string,
  maxLength: number = 255
): boolean {
  if (!input || typeof input !== "string") {
    return false;
  }

  if (input.length > maxLength) {
    return false;
  }

  // Solo permite letras, números, espacios y algunos caracteres especiales
  const safeRegex = /^[a-zA-Z0-9\s\-_.,!?()]+$/;
  return safeRegex.test(input);
}

/**
 * Genera un token seguro aleatorio
 */
export function generateSecureToken(length: number = 32): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  const randomArray = new Uint8Array(length);
  crypto.getRandomValues(randomArray);

  for (let i = 0; i < length; i++) {
    result += chars.charAt(randomArray[i] % chars.length);
  }

  return result;
}

/**
 * Valida un UUID
 */
export function validateUUID(uuid: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Limpia un objeto de propiedades potencialmente peligrosas
 */
export function sanitizeObject<T extends Record<string, unknown>>(
  obj: T
): Partial<T> {
  const sanitized: Partial<T> = {};

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === "string") {
      // Si es un email, sanitizarlo como email
      if (key === "email" || key.toLowerCase().includes("email")) {
        const emailSanitized = validateAndSanitizeEmail(value);
        sanitized[key as keyof T] = (emailSanitized || value) as T[keyof T];
      } else {
        sanitized[key as keyof T] = sanitizeString(value) as T[keyof T];
      }
    } else if (Array.isArray(value)) {
      // Sanitizar cada elemento del array si es una cadena
      sanitized[key as keyof T] = value.map((item) =>
        typeof item === "string" ? sanitizeString(item) : item
      ) as T[keyof T];
    } else if (
      typeof value === "object" &&
      value !== null
    ) {
      sanitized[key as keyof T] = sanitizeObject(
        value as Record<string, unknown>
      ) as T[keyof T];
    } else {
      sanitized[key as keyof T] = value as T[keyof T];
    }
  }

  return sanitized;
}

/**
 * Valida que un objeto contenga solo propiedades permitidas
 */
export function validateAllowedProperties<T extends Record<string, unknown>>(
  obj: T,
  allowedProperties: (keyof T)[]
): boolean {
  return Object.keys(obj).every((key) =>
    allowedProperties.includes(key as keyof T)
  );
}
