/**
 * Configuración de timeouts y duraciones
 * Centraliza todos los valores de tiempo en milisegundos
 */

// Helpers para convertir tiempo
const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

export const TIMEOUT_CONFIG = {
  // Cookies (en segundos para cookie maxAge)
  COOKIE_ACCESS_TOKEN_SECONDS: 7 * 24 * 60 * 60, // 7 días
  COOKIE_REFRESH_TOKEN_SECONDS: 30 * 24 * 60 * 60, // 30 días

  // Tokens de email (en milisegundos)
  EMAIL_VERIFICATION_TOKEN_MS: 24 * HOUR, // 24 horas
  PASSWORD_RESET_TOKEN_MS: 1 * HOUR, // 1 hora
  INVITATION_TOKEN_MS: 7 * DAY, // 7 días

  // UI Timeouts (en milisegundos)
  TOAST_MESSAGE_MS: 3000, // 3 segundos
  COPY_FEEDBACK_MS: 2000, // 2 segundos
  REDIRECT_DELAY_MS: 1000, // 1 segundo
  POLLING_INTERVAL_MS: 100, // 100 ms

  // Session
  SESSION_IDLE_TIMEOUT_MS: 30 * MINUTE, // 30 minutos
} as const;

// Helpers para acceder a valores en formato amigable
export const TIMEOUTS = {
  get COOKIE_ACCESS_TOKEN_DAYS() {
    return TIMEOUT_CONFIG.COOKIE_ACCESS_TOKEN_SECONDS / (24 * 60 * 60);
  },
  get COOKIE_REFRESH_TOKEN_DAYS() {
    return TIMEOUT_CONFIG.COOKIE_REFRESH_TOKEN_SECONDS / (24 * 60 * 60);
  },
  get EMAIL_VERIFICATION_HOURS() {
    return TIMEOUT_CONFIG.EMAIL_VERIFICATION_TOKEN_MS / HOUR;
  },
  get PASSWORD_RESET_HOURS() {
    return TIMEOUT_CONFIG.PASSWORD_RESET_TOKEN_MS / HOUR;
  },
  get INVITATION_DAYS() {
    return TIMEOUT_CONFIG.INVITATION_TOKEN_MS / DAY;
  },
} as const;
