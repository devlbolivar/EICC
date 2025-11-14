/**
 * Enumeraciones para cursos
 * Define niveles, estados y visibilidad de cursos
 */

/**
 * Niveles de dificultad de cursos
 */
export enum CourseLevel {
  BASIC = 'basic',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
}

/**
 * Labels en español para niveles de curso
 */
export const COURSE_LEVEL_LABELS: Record<CourseLevel, string> = {
  [CourseLevel.BASIC]: 'Básico',
  [CourseLevel.INTERMEDIATE]: 'Intermedio',
  [CourseLevel.ADVANCED]: 'Avanzado',
} as const;

/**
 * Estados de publicación de cursos
 */
export enum CourseStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

/**
 * Labels en español para estados de curso
 */
export const COURSE_STATUS_LABELS: Record<CourseStatus, string> = {
  [CourseStatus.DRAFT]: 'Borrador',
  [CourseStatus.PUBLISHED]: 'Publicado',
  [CourseStatus.ARCHIVED]: 'Archivado',
} as const;

/**
 * Opciones de visibilidad de cursos
 */
export enum CourseVisibility {
  PUBLIC = 'public',
  PRIVATE = 'private',
  SPECIFIC_COMPANIES = 'specific_companies',
}

/**
 * Labels en español para visibilidad de curso
 */
export const COURSE_VISIBILITY_LABELS: Record<CourseVisibility, string> = {
  [CourseVisibility.PUBLIC]: 'Público',
  [CourseVisibility.PRIVATE]: 'Privado',
  [CourseVisibility.SPECIFIC_COMPANIES]: 'Empresas específicas',
} as const;

/**
 * Obtiene el label de un nivel de curso
 */
export function getCourseLevelLabel(level: CourseLevel | string): string {
  return COURSE_LEVEL_LABELS[level as CourseLevel] || level;
}

/**
 * Obtiene el label de un estado de curso
 */
export function getCourseStatusLabel(status: CourseStatus | string): string {
  return COURSE_STATUS_LABELS[status as CourseStatus] || status;
}

/**
 * Obtiene el label de una visibilidad de curso
 */
export function getCourseVisibilityLabel(visibility: CourseVisibility | string): string {
  return COURSE_VISIBILITY_LABELS[visibility as CourseVisibility] || visibility;
}

/**
 * Valida si un string es un nivel de curso válido
 */
export function isValidCourseLevel(level: string): level is CourseLevel {
  return Object.values(CourseLevel).includes(level as CourseLevel);
}

/**
 * Valida si un string es un estado de curso válido
 */
export function isValidCourseStatus(status: string): status is CourseStatus {
  return Object.values(CourseStatus).includes(status as CourseStatus);
}

/**
 * Valida si un string es una visibilidad de curso válida
 */
export function isValidCourseVisibility(visibility: string): visibility is CourseVisibility {
  return Object.values(CourseVisibility).includes(visibility as CourseVisibility);
}
