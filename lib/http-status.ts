/**
 * Códigos de estado HTTP
 * Centraliza todos los códigos de respuesta HTTP para evitar números mágicos
 */

export const HTTP_STATUS = {
  // 2xx Success
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,

  // 3xx Redirection
  MOVED_PERMANENTLY: 301,
  FOUND: 302,
  NOT_MODIFIED: 304,
  TEMPORARY_REDIRECT: 307,

  // 4xx Client Errors
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,

  // 5xx Server Errors
  INTERNAL_SERVER_ERROR: 500,
  NOT_IMPLEMENTED: 501,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
} as const;

/**
 * Tipo para códigos de estado HTTP válidos
 */
export type HttpStatusCode = typeof HTTP_STATUS[keyof typeof HTTP_STATUS];

/**
 * Mensajes de error por defecto para códigos de estado
 */
export const HTTP_STATUS_MESSAGES: Record<number, string> = {
  [HTTP_STATUS.BAD_REQUEST]: 'Solicitud incorrecta',
  [HTTP_STATUS.UNAUTHORIZED]: 'No autorizado',
  [HTTP_STATUS.FORBIDDEN]: 'Acceso prohibido',
  [HTTP_STATUS.NOT_FOUND]: 'No encontrado',
  [HTTP_STATUS.METHOD_NOT_ALLOWED]: 'Método no permitido',
  [HTTP_STATUS.CONFLICT]: 'Conflicto',
  [HTTP_STATUS.UNPROCESSABLE_ENTITY]: 'Entidad no procesable',
  [HTTP_STATUS.TOO_MANY_REQUESTS]: 'Demasiadas solicitudes',
  [HTTP_STATUS.INTERNAL_SERVER_ERROR]: 'Error interno del servidor',
  [HTTP_STATUS.SERVICE_UNAVAILABLE]: 'Servicio no disponible',
} as const;

/**
 * Verifica si un código de estado indica éxito (2xx)
 */
export function isSuccessStatus(status: number): boolean {
  return status >= 200 && status < 300;
}

/**
 * Verifica si un código de estado indica error del cliente (4xx)
 */
export function isClientErrorStatus(status: number): boolean {
  return status >= 400 && status < 500;
}

/**
 * Verifica si un código de estado indica error del servidor (5xx)
 */
export function isServerErrorStatus(status: number): boolean {
  return status >= 500 && status < 600;
}

/**
 * Obtiene el mensaje por defecto para un código de estado
 */
export function getStatusMessage(status: number): string {
  return HTTP_STATUS_MESSAGES[status] || 'Error desconocido';
}
