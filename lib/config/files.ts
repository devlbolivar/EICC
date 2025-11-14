/**
 * Configuración de archivos y uploads
 * Centraliza límites de tamaño y tipos permitidos
 */

const MB = 1024 * 1024;

export const FILE_CONFIG = {
  // Tamaños máximos
  MAX_SIZE_BYTES: parseInt(process.env.MAX_FILE_SIZE_MB || '5') * MB,
  MAX_SIZE_MB: parseInt(process.env.MAX_FILE_SIZE_MB || '5'),

  // Tipos de archivo permitidos
  ALLOWED_IMAGE_TYPES: [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
  ] as const,

  ALLOWED_DOCUMENT_TYPES: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ] as const,

  ALLOWED_VIDEO_TYPES: [
    'video/mp4',
    'video/webm',
    'video/ogg',
  ] as const,
} as const;

/**
 * Verifica si un tipo MIME es una imagen permitida
 */
export function isAllowedImageType(mimeType: string): boolean {
  return FILE_CONFIG.ALLOWED_IMAGE_TYPES.includes(mimeType as any);
}

/**
 * Verifica si un tipo MIME es un documento permitido
 */
export function isAllowedDocumentType(mimeType: string): boolean {
  return FILE_CONFIG.ALLOWED_DOCUMENT_TYPES.includes(mimeType as any);
}

/**
 * Verifica si un tipo MIME es un video permitido
 */
export function isAllowedVideoType(mimeType: string): boolean {
  return FILE_CONFIG.ALLOWED_VIDEO_TYPES.includes(mimeType as any);
}

/**
 * Verifica si un archivo excede el tamaño máximo
 */
export function exceedsMaxSize(sizeInBytes: number): boolean {
  return sizeInBytes > FILE_CONFIG.MAX_SIZE_BYTES;
}
