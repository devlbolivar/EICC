import { validate as isValidUUID } from 'uuid';
import { errorResponse } from './api-helpers';

/**
 * Valida que un string sea un UUID válido
 * @param id - String a validar
 * @param fieldName - Nombre del campo para el mensaje de error
 * @returns NextResponse con error 400 si es inválido, null si es válido
 */
export function validateUUIDParam(id: string, fieldName = "ID") {
  if (!isValidUUID(id)) {
    return errorResponse(
      `${fieldName} inválido. Debe ser un UUID válido.`,
      400
    );
  }
  return null;
}

/**
 * Valida múltiples UUIDs a la vez
 * @param params - Objeto con pares { campo: valor }
 * @returns NextResponse con error si alguno es inválido, null si todos son válidos
 */
export function validateUUIDParams(params: Record<string, string>) {
  for (const [fieldName, value] of Object.entries(params)) {
    if (!value) continue; // Skip null/undefined

    if (!isValidUUID(value)) {
      return errorResponse(
        `${fieldName} inválido. Debe ser un UUID válido.`,
        400
      );
    }
  }
  return null;
}

/**
 * Valida que un UUID existe y retorna true/false
 * @param id - String a validar
 * @returns boolean
 */
export function isUUID(id: string): boolean {
  return isValidUUID(id);
}
