/**
 * Configuración general de la aplicación
 * Centraliza URLs, nombres y configuraciones básicas
 */

export const APP_CONFIG = {
  // URLs base
  BASE_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  API_BASE_URL: process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',

  // Información de la aplicación
  APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || 'EICC Platform',
  SUPPORT_EMAIL: process.env.SUPPORT_EMAIL || 'support@eicc.com',

  // Stripe
  STRIPE_API_VERSION: (process.env.STRIPE_API_VERSION || '2024-10-28.acacia') as const,
} as const;

/**
 * Genera URL completa a partir de un path relativo
 * @param path - Path relativo (ej: '/reset-password')
 * @returns URL completa
 */
export function getFullUrl(path: string): string {
  const base = APP_CONFIG.BASE_URL;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${base}${cleanPath}`;
}

/**
 * Genera URL de API a partir de un path relativo
 * @param path - Path relativo (ej: '/api/users')
 * @returns URL completa de API
 */
export function getApiUrl(path: string): string {
  const base = APP_CONFIG.API_BASE_URL;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${base}${cleanPath}`;
}
