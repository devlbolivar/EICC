/**
 * Configuración de seguridad
 * Centraliza valores relacionados con autenticación, hashing y tokens
 */

export const SECURITY_CONFIG = {
  // Bcrypt
  BCRYPT_SALT_ROUNDS: parseInt(process.env.BCRYPT_SALT_ROUNDS || '12'),

  // Tokens
  TOKEN_LENGTH_BYTES: 32, // Para randomBytes

  // Validación de campos
  EMAIL_MAX_LENGTH: 255,
  PASSWORD_MIN_LENGTH: 8,
  UUID_LENGTH: 36,

  // Nombres de cookies
  COOKIE_ACCESS_TOKEN: 'accessToken',
  COOKIE_REFRESH_TOKEN: 'refreshToken',
  COOKIE_CSRF_TOKEN: 'csrf_token',

  // CSRF Protection
  CSRF_TOKEN_EXPIRY_MS: 15 * 60 * 1000, // 15 minutos
  CSRF_HEADER_NAME: 'x-csrf-token',
} as const;
