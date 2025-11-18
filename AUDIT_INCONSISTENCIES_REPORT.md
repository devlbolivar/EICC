# Reporte de Inconsistencias en Tipos y Modelos de Datos - EICC

## Resumen Ejecutivo
Se han identificado **5 categorías principales de inconsistencias** que afectan la comunicación entre Backend y Frontend:

1. **Naming Convention Mixto**: camelCase vs snake_case en consultas SQL
2. **Transformación de Campos en Respuestas**: sin documentación clara
3. **Tipos sin definir correctamente**: uso de `any` y `unknown`
4. **Campos adicionales no documentados en tipos**: campos derivados en respuestas de API
5. **Tabla con nombre mixedCase**: `enrollCourse` en lugar de snake_case

---

## 1. INCONSISTENCIA CRÍTICA: Naming Convention en Consultas SQL

### Problema
El schema define campos en **camelCase**, pero las consultas SQL raw usan **snake_case**:

#### Schema Definition (`config/schema.ts`)
```typescript
// enrollCourse table (líneas 160-183)
export const enrollCourseTable = pgTable("enrollCourse", {
  courseId: uuid("course_id"),      // ← camelCase en definición
  userId: uuid("user_id"),          // ← camelCase en definición
  companyId: uuid("company_id"),    // ← camelCase en definición
})

// certificates table (líneas 185-216)
export const certificatesTable = pgTable("certificates", {
  courseId: uuid("course_id"),      // ← camelCase en definición
  userId: uuid("user_id"),          // ← camelCase en definición
  companyId: uuid("company_id"),    // ← camelCase en definición
})
```

#### Consultas SQL Raw - Using snake_case
- **Archivo**: `app/api/certificates/route.ts` (líneas 45, 48, 53, 56)
```typescript
whereConditions = sql`${whereConditions} AND cert."user_id" = ${payload.userId}`;
whereConditions = sql`${whereConditions} AND cert."company_id" = ${payload.companyId}`;
whereConditions = sql`${whereConditions} AND cert."course_id" = ${courseId}`;
```

- **Archivo**: `app/api/courses/[id]/enroll/route.ts` (líneas 57, 86-87, 202, 347, 373)
```typescript
WHERE "course_id" = ${courseId} AND "user_id" = ${payload.userId}
INSERT INTO "enrollCourse" (
  "course_id", "user_id", "company_id", "progress", ...
```

- **Archivo**: `app/api/company/statistics/route.ts` (líneas 13-14, 32)
```typescript
LEFT JOIN "enrollCourse" ec ON uc."userId" = ec."user_id"
WHERE "company_id" = ${companyId}
```

### Archivos Afectados
- `/home/user/EICC/app/api/certificates/route.ts`
- `/home/user/EICC/app/api/certificates/[id]/route.ts`
- `/home/user/EICC/app/api/courses/[id]/enroll/route.ts`
- `/home/user/EICC/app/api/company/statistics/route.ts`
- `/home/user/EICC/app/api/company/employees/route.ts`
- `/home/user/EICC/app/api/admin/reports/route.ts`

### Impacto
**ALTO** - Puede causar inconsistencias en la base de datos y errores silenciosos en queries

---

## 2. TRANSFORMACIÓN DE CAMPOS EN RESPUESTAS DE API

### Problema
Los endpoints transforman nombres de campos sin documentar consistentemente.

#### Ejemplo 1: Student Courses Endpoint (`app/api/student/courses/route.ts`)
```typescript
select({
  id: coursesTable.id,
  title: coursesTable.name,              // ← Transformación: name → title
  image: coursesTable.bannerImage,       // ← Transformación: bannerImage → image
  category: coursesTable.category,
  level: coursesTable.level,
  // ...
})
```

**Archivo afectado**: 
- `/home/user/EICC/app/api/student/courses/route.ts` (líneas 17-31)

**Tipo esperado** (`app/types/index.ts` línea 367):
```typescript
export interface EnrolledCourseResponse {
  title: string;      // ← NO: name
  image: string;      // ← NO: bannerImage
}
```

#### Ejemplo 2: Company Employees Endpoint (`app/api/company/employees/route.ts`)
```typescript
select({
  roleName: schema.rolesTable.name,      // ← roleName en query
  // ...
})

// Pero en respuesta se transforma:
role: employee.roleName,                 // ← Renombrado a 'role'
status: employee.isActive ? "active" : "inactive",  // ← Transformado
```

**Archivo afectado**:
- `/home/user/EICC/app/api/company/employees/route.ts` (líneas 144, 232, 233)

#### Ejemplo 3: Certificates Endpoint con Campos Derivados (`app/api/certificates/route.ts`)
```typescript
// En la query SELECT devuelve campos adicionales que NO están en el schema:
SELECT 
  cert.*,
  c.name as course_name,           // ← Derivado, no en schema
  c.description as course_description, // ← Derivado, no en schema
  c.category as course_category,   // ← Derivado, no en schema
  c.level as course_level,         // ← Derivado, no en schema
  u.name as user_name,             // ← Derivado, no en schema
  u.email as user_email,           // ← Derivado, no en schema
  comp.name as company_name        // ← Derivado, no en schema
```

**Archivos afectados**:
- `/home/user/EICC/app/api/certificates/route.ts` (líneas 74-88)
- `/home/user/EICC/app/api/certificates/[id]/route.ts` (líneas 34-47)
- `/home/user/EICC/app/api/company/statistics/route.ts` (líneas 18-29, 43-51)
- `/home/user/EICC/app/api/courses/[id]/enroll/route.ts` (líneas 141-143)

**Tipo en TypeScript** (`app/types/index.ts` líneas 325-334):
```typescript
export interface Certificate extends BaseEntity {
  // ... campos base ...
  
  // ← PROBLEMA: Estos campos están documentados pero no siempre se devuelven
  course_name?: string;
  course_description?: string;
  course_category?: string;
  course_level?: string;
  course_duration?: string;
  course_banner?: string;
  user_name?: string;
  user_email?: string;
  company_name?: string;
}
```

### Impacto
**ALTO** - El frontend espera ciertos campos que no están documentados en los tipos, causando problemas de null/undefined

---

## 3. TIPOS SIN DEFINIR CORRECTAMENTE - uso de `any` y `unknown`

### Ubicaciones Problemáticas

#### En API Routes
- `/home/user/EICC/app/api/auth/login/route.ts` (línea 157)
```typescript
primaryUserCompany.role_permissions as unknown as Permission[]
```

- `/home/user/EICC/app/api/billing/webhooks/route.ts` (línea 142)
```typescript
const sub = subscription as unknown as Record<string, unknown>;
```

- `/home/user/EICC/app/api/admin/users/[id]/route.ts` (línea 97)
```typescript
role: { id: string; name: string; description: string | null; permissions: unknown };
```

#### En Hooks
- `/home/user/EICC/hooks/use-courses.ts` (líneas 43, 123, 324, 343, 359)
```typescript
completedChapters?: any;                    // ← Debería ser Record<string, boolean>
pagination: any;                            // ← Debería ser PaginationData
result?.enrollment: any;                    // ← Debería ser EnrollCourse
certificateGenerated: (result as any)?...   // ← Debería estar tipificado
```

- `/home/user/EICC/hooks/use-certificates.ts` (línea 97)
```typescript
data: { success: boolean; data: Certificate[]; pagination: any } = ...
```

- `/home/user/EICC/hooks/use-company-certificates.ts` (línea 149)
```typescript
pagination: any;
```

### Impacto
**MEDIO** - Pérdida de type safety en runtime, posibles bugs en refactorización

---

## 4. INCONSISTENCIA: Tabla `enrollCourse` con nombre mixedCase

### Problema
- **Definición en schema** (`config/schema.ts` línea 161):
```typescript
export const enrollCourseTable = pgTable("enrollCourse", {  // ← mixedCase
```

- **Convención esperada**: snake_case (`enroll_course`)
- **Impacto**: Tabla funciona pero no sigue convención de PostgreSQL

### Referenciado en SQL como:
```typescript
FROM "enrollCourse" ec           // ← Requiere quotes por ser mixedCase
INSERT INTO "enrollCourse" (...)
```

### Archivos afectados
- `/home/user/EICC/config/schema.ts` (línea 161)
- Todos los archivos API que hacen queries a `"enrollCourse"`

---

## 5. CAMPOS QUE EXISTEN EN SCHEMA PERO NO SE DEVUELVEN EN ALGUNAS APIs

### Campos del Schema de Users no siempre devueltos
En `/home/user/EICC/config/schema.ts` (líneas 31-52), el schema define:
```typescript
phone: varchar({ length: 50 }),
location: varchar({ length: 255 }),
bio: text(),
age: integer(),
subscriptionId: varchar({ length: 255 }),
```

**¿Se devuelven siempre?**
- ✅ En `/app/api/user/route.ts` GET: SÍ (líneas 110-112)
- ❌ En `/app/api/admin/users/route.ts`: NO
- ❌ En `/app/api/company/employees/route.ts`: Solo `phone` (línea 135)

### Campos del Schema de Courses no documentados
```typescript
courseJson?: json();           // ← Documentado en types pero no siempre devuelto
courseContent?: json();        // ← Documentado en types pero no siempre devuelto
targetCompanies?: json();      // ← NO está en tipo Certificate
visibility?: varchar();        // ← En schema pero no en EnrolledCourseResponse
```

### Impacto
**MEDIO** - El frontend no sabe si esperar ciertos campos o no

---

## 6. CAMPOS QUE EL FRONTEND USA PERO NO ESTÁN EN SCHEMA

Según los componentes (ej: `student/certificates/page.tsx`):
```typescript
certificate.certificateId    // ✓ Existe en schema
certificate.title            // ✓ Existe en schema
certificate.grade            // ✓ Existe en schema
certificate.issuedDate       // ✓ Existe en schema
certificate.completedDate    // ✓ Existe en schema
certificate.duration         // ✓ Existe en schema
```

**Resultado**: Esta sección parece OK

---

## RESUMEN DE PROBLEMAS CRÍTICOS

| ID | Problema | Severidad | Archivos | Solución |
|:---|:---------|:----------|:---------|:---------|
| 1  | Mixing camelCase (schema) con snake_case (SQL) | CRÍTICA | 6+ archivos API | Unificar a camelCase o usar Drizzle ORM siempre |
| 2  | Transformación de campos no documentada | ALTA | 4+ archivos API | Documentar todas las transformaciones |
| 3  | Campos derivados en responses | ALTA | Certificados, Employees | Agregar a tipos TypeScript |
| 4  | Uso de `any`/`unknown` | MEDIA | 8+ archivos | Crear tipos específicos |
| 5  | Tabla mixedCase `enrollCourse` | BAJA | Schema y todas las APIs | Renombrar a `enroll_course` |

---

## RECOMENDACIONES DE UNIFICACIÓN

### Opción 1: Usar camelCase en toda la aplicación (RECOMENDADO)
- Mantener schema con camelCase ✓ (ya está así)
- Usar Drizzle ORM query builder en lugar de SQL raw
- Actualizar tipos TypeScript para matching
- Eliminar todas las transformaciones manuales

**Ventajas**:
- Consistencia con TypeScript/JavaScript
- Mejor integración con ORM
- Menos errores de tipado

### Opción 2: Usar snake_case en toda la aplicación
- Cambiar schema a snake_case
- Cambiar tipos TypeScript a snake_case
- Usar transformadores automáticos en API responses

**Ventajas**:
- Consistencia con PostgreSQL
- Mejor para base de datos

**Desventajas**:
- Más trabajo de refactorización
- Rompe convenciones JavaScript/TypeScript

---

## PLAN DE ACCIÓN RECOMENDADO

### Fase 1: Adoptar camelCase (Corto plazo - 1-2 semanas)
1. Reemplazar todas las consultas SQL raw con Drizzle ORM queries
2. Crear función helper para transformar respuestas automáticamente
3. Actualizar tipos TypeScript para campos derivados
4. Documentar transformaciones en cada endpoint

### Fase 2: Limpiar tipos (Corto plazo - 1 semana)
1. Reemplazar `any` con tipos específicos
2. Crear tipos para paginación reutilizable
3. Crear tipos para respuestas de API comunes

### Fase 3: Refactor de Tabla (Mediano plazo - 1 mes)
1. Crear migrations para renombrar `enrollCourse` a `enroll_course`
2. Actualizar todas las referencias
3. Implementar backward compatibility si es necesario

