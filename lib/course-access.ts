import { sql } from 'drizzle-orm';

type CourseActor = { userId: string; companyId?: string | null; permissions: readonly string[] };
type CourseResource = {
  createdBy?: unknown;
  companyId?: unknown;
  isPublic?: unknown;
  visibility?: unknown;
  targetCompanies?: unknown;
};

export function isPlatformAdmin(actor: CourseActor): boolean {
  return actor.permissions.includes('platform:admin');
}

export function canReadCourse(actor: CourseActor, course: CourseResource): boolean {
  if (isPlatformAdmin(actor)) return true;
  if (!actor.permissions.some(p => ['courses:read', 'courses:view', 'courses:create', 'courses:enroll'].includes(p))) return false;
  return course.createdBy === actor.userId ||
    Boolean(actor.companyId && course.companyId === actor.companyId) ||
    (course.isPublic === true && ['public', 'Público'].includes(String(course.visibility))) ||
    (Boolean(actor.companyId) && ['specific_companies', 'Empresas específicas'].includes(String(course.visibility)) &&
      Array.isArray(course.targetCompanies) && course.targetCompanies.includes(actor.companyId));
}

export function canModifyCourse(actor: CourseActor, course: CourseResource, permission: 'courses:edit' | 'courses:delete'): boolean {
  if (isPlatformAdmin(actor)) return true;
  if (!actor.permissions.includes(permission)) return false;
  return course.createdBy === actor.userId || Boolean(
    actor.companyId && course.companyId === actor.companyId && actor.permissions.includes('company:admin')
  );
}

/** SQL equivalent of canReadCourse's resource scope. Queries must alias courses as c. */
export function courseReadScope(actor: CourseActor) {
  if (isPlatformAdmin(actor)) return sql`true`;
  return sql`(
    c."createdBy" = ${actor.userId}
    OR (c."isPublic" = true AND c.visibility IN ('public', 'Público'))
    OR ${actor.companyId ? sql`(
      c."companyId" = ${actor.companyId}
      OR (c.visibility IN ('specific_companies', 'Empresas específicas')
        AND c."targetCompanies"::jsonb @> ${JSON.stringify([actor.companyId])}::jsonb)
    )` : sql`false`}
  )`;
}
