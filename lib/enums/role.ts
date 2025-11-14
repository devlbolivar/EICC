/**
 * Enumeraciones para roles del sistema
 * Define roles de usuarios y sus prioridades
 */

/**
 * Roles del sistema
 */
export enum SystemRole {
  ADMIN = 'admin',
  COMPANY = 'company',
  STUDENT = 'student',
}

/**
 * Labels en español para roles
 */
export const ROLE_LABELS: Record<SystemRole, string> = {
  [SystemRole.ADMIN]: 'Administrador',
  [SystemRole.COMPANY]: 'Empresa',
  [SystemRole.STUDENT]: 'Estudiante',
} as const;

/**
 * Prioridades de roles (mayor número = mayor prioridad)
 * Usado para determinar qué rol usar cuando un usuario tiene múltiples roles
 */
export const ROLE_PRIORITY: Record<SystemRole, number> = {
  [SystemRole.ADMIN]: 3,
  [SystemRole.COMPANY]: 2,
  [SystemRole.STUDENT]: 1,
} as const;

/**
 * Obtiene el label de un rol
 */
export function getRoleLabel(role: SystemRole | string): string {
  return ROLE_LABELS[role as SystemRole] || role;
}

/**
 * Obtiene la prioridad de un rol
 */
export function getRolePriority(role: SystemRole | string): number {
  return ROLE_PRIORITY[role as SystemRole] || 0;
}

/**
 * Compara dos roles y retorna el de mayor prioridad
 */
export function getHigherPriorityRole(role1: SystemRole, role2: SystemRole): SystemRole {
  return getRolePriority(role1) > getRolePriority(role2) ? role1 : role2;
}

/**
 * Valida si un string es un rol válido
 */
export function isValidSystemRole(role: string): role is SystemRole {
  return Object.values(SystemRole).includes(role as SystemRole);
}

/**
 * Obtiene el rol de mayor prioridad de una lista de roles
 */
export function getHighestPriorityRole(roles: SystemRole[]): SystemRole | null {
  if (roles.length === 0) return null;
  return roles.reduce((highest, current) => getHigherPriorityRole(highest, current));
}
