/**
 * Configuración de estilos para emails
 * Centraliza colores y estilos utilizados en templates de email
 */

export const EMAIL_COLORS = {
  // Colores primarios
  PRIMARY: '#3b82f6',
  PRIMARY_TEXT: '#ffffff',

  // Fondos
  BACKGROUND: '#f8fafc',
  CONTAINER_BG: '#ffffff',
  CODE_BG: '#e5e7eb',

  // Textos
  TEXT_DEFAULT: '#333333',
  TEXT_MUTED: '#6b7280',

  // Alertas y advertencias
  WARNING_BG: '#fef3c7',
  WARNING_BORDER: '#f59e0b',
  WARNING_TEXT: '#92400e',

  SUCCESS_BG: '#d1fae5',
  SUCCESS_BORDER: '#10b981',
  SUCCESS_TEXT: '#065f46',

  ERROR_BG: '#fee2e2',
  ERROR_BORDER: '#ef4444',
  ERROR_TEXT: '#991b1b',
} as const;

export const EMAIL_STYLES = {
  // Tipografía
  FONT_FAMILY: 'Arial, sans-serif',
  FONT_SIZE_NORMAL: '16px',
  FONT_SIZE_SMALL: '14px',
  LINE_HEIGHT: '1.6',

  // Espaciado
  PADDING_SMALL: '10px',
  PADDING_MEDIUM: '15px',
  PADDING_LARGE: '20px',
  PADDING_XL: '30px',

  // Bordes
  BORDER_RADIUS: '6px',
  BORDER_RADIUS_LARGE: '8px',

  // Contenedor
  MAX_WIDTH: '600px',
} as const;

/**
 * Genera estilos CSS para el cuerpo del email
 */
export function getBodyStyles(): string {
  return `
    font-family: ${EMAIL_STYLES.FONT_FAMILY};
    line-height: ${EMAIL_STYLES.LINE_HEIGHT};
    color: ${EMAIL_COLORS.TEXT_DEFAULT};
  `;
}

/**
 * Genera estilos CSS para el contenedor principal
 */
export function getContainerStyles(): string {
  return `
    max-width: ${EMAIL_STYLES.MAX_WIDTH};
    margin: 0 auto;
    padding: ${EMAIL_STYLES.PADDING_LARGE};
  `;
}

/**
 * Genera estilos CSS para el header
 */
export function getHeaderStyles(): string {
  return `
    background: ${EMAIL_COLORS.PRIMARY};
    color: ${EMAIL_COLORS.PRIMARY_TEXT};
    padding: ${EMAIL_STYLES.PADDING_LARGE};
    text-align: center;
    border-radius: ${EMAIL_STYLES.BORDER_RADIUS_LARGE} ${EMAIL_STYLES.BORDER_RADIUS_LARGE} 0 0;
  `;
}

/**
 * Genera estilos CSS para el contenido
 */
export function getContentStyles(): string {
  return `
    background: ${EMAIL_COLORS.BACKGROUND};
    padding: ${EMAIL_STYLES.PADDING_XL};
    border-radius: 0 0 ${EMAIL_STYLES.BORDER_RADIUS_LARGE} ${EMAIL_STYLES.BORDER_RADIUS_LARGE};
  `;
}

/**
 * Genera estilos CSS para botones
 */
export function getButtonStyles(): string {
  return `
    display: inline-block;
    background: ${EMAIL_COLORS.PRIMARY};
    color: ${EMAIL_COLORS.PRIMARY_TEXT};
    padding: 12px 24px;
    text-decoration: none;
    border-radius: ${EMAIL_STYLES.BORDER_RADIUS};
    margin: 20px 0;
  `;
}

/**
 * Genera estilos CSS para el footer
 */
export function getFooterStyles(): string {
  return `
    text-align: center;
    margin-top: ${EMAIL_STYLES.PADDING_XL};
    color: ${EMAIL_COLORS.TEXT_MUTED};
    font-size: ${EMAIL_STYLES.FONT_SIZE_SMALL};
  `;
}

/**
 * Genera estilos CSS para advertencias
 */
export function getWarningBoxStyles(): string {
  return `
    background: ${EMAIL_COLORS.WARNING_BG};
    border: 1px solid ${EMAIL_COLORS.WARNING_BORDER};
    padding: ${EMAIL_STYLES.PADDING_MEDIUM};
    border-radius: ${EMAIL_STYLES.BORDER_RADIUS};
    margin: 20px 0;
  `;
}

/**
 * Genera estilos CSS para bloques de código
 */
export function getCodeBoxStyles(): string {
  return `
    word-break: break-all;
    background: ${EMAIL_COLORS.CODE_BG};
    padding: ${EMAIL_STYLES.PADDING_SMALL};
    border-radius: 4px;
    font-family: monospace;
  `;
}
