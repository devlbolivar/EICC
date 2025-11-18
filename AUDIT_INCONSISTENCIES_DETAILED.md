# MATRIZ DETALLADA DE INCONSISTENCIAS - EICC

## Tabla de Inconsistencias Específicas

### 1. ENDPOINTS DE CERTIFICADOS

#### Problema 1.1: Campos con snake_case en queries, camelCase en schema
| Elemento | Donde | Tipo | Referencia |
|----------|-------|------|-----------|
| **courseId** | Schema: camelCase | `uuid("course_id")` | config/schema.ts:191 |
| **courseId** | Query SQL: snake_case | `"course_id"` | app/api/certificates/route.ts:56 |
| **userId** | Schema: camelCase | `uuid("user_id")` | config/schema.ts:194 |
| **userId** | Query SQL: snake_case | `"user_id"` | app/api/certificates/route.ts:53 |
| **companyId** | Schema: camelCase | `uuid("company_id")` | config/schema.ts:197 |
| **companyId** | Query SQL: snake_case | `"company_id"` | app/api/certificates/route.ts:48 |

#### Problema 1.2: Campos derivados no documentados en tipos
```
SELECT
  cert.*,
  c.name as course_name,           -- NO está en Certificate interface
  c.description as course_description,
  c.category as course_category,
  c.level as course_level,
  c."estimatedDuration" as course_duration,
  u.name as user_name,             -- Sí está (línea 325 de types)
  u.email as user_email,           -- Sí está (línea 332 de types)
  comp.name as company_name        -- NO está documentado
FROM certificates cert
```

**Estado en types** (app/types/index.ts:305-334):
```typescript
export interface Certificate extends BaseEntity {
  // ... campos del schema ...
  
  // Estos SÍ están documentados:
  user_name?: string;       // Línea 331
  user_email?: string;      // Línea 332
  
  // Estos NO están documentados:
  course_name?: string;     // ← FALTA agregar (pero se devuelve)
  course_description?: string;
  course_category?: string;
  course_level?: string;
  course_duration?: string;
  course_banner?: string;
  company_name?: string;    // ← FALTA agregar (pero se devuelve)
}
```

**Archivos problemáticos**:
- `/home/user/EICC/app/api/certificates/route.ts:74-88`
- `/home/user/EICC/app/api/certificates/[id]/route.ts:34-47`

---

### 2. ENDPOINT DE INSCRIPCIÓN A CURSOS

#### Problema 2.1: Tabla `enrollCourse` con nombre mixedCase

| Problema | Definición | Valor |
|----------|-----------|-------|
| **Nombre de tabla** | Schema | `"enrollCourse"` (mixedCase) |
| **Convención PostgreSQL** | Esperado | `"enroll_course"` (snake_case) |
| **Impacto** | Sql | Requiere quoted identifiers |

```typescript
// config/schema.ts:160-161
export const enrollCourseTable = pgTable(
  "enrollCourse",  // ← PROBLEMA: debería ser "enroll_course"
  { ... }
)
```

**Referencias en SQL raw**:
- `FROM "enrollCourse" ec` - app/api/courses/[id]/enroll/route.ts:56, 144
- `INSERT INTO "enrollCourse"` - app/api/courses/[id]/enroll/route.ts:85
- `UPDATE "enrollCourse"` - app/api/courses/[id]/enroll/route.ts:213, 231
- `DELETE FROM "enrollCourse"` - app/api/courses/[id]/enroll/route.ts:372

---

### 3. ENDPOINT DE CURSOS INSCRITOS (STUDENT)

#### Problema 3.1: Transformación de campos sin documentar

```typescript
// app/api/student/courses/route.ts:17-31
.select({
  id: coursesTable.id,
  title: coursesTable.name,              // ← TRANSFORMADO: name → title
  description: coursesTable.description,
  progress: enrollCourseTable.progress,
  totalChapters: coursesTable.numberOfChapters,  // ← TRANSFORMADO
  completedChapters: enrollCourseTable.completedChapters,
  isCompleted: enrollCourseTable.isCompleted,
  completedAt: enrollCourseTable.completedAt,
  estimatedTime: coursesTable.estimatedDuration,  // ← TRANSFORMADO
  lastAccessed: enrollCourseTable.updatedAt,     // ← TRANSFORMADO
  image: coursesTable.bannerImage,       // ← TRANSFORMADO: bannerImage → image
  category: coursesTable.category,
  level: coursesTable.level,
  certificateId: certificatesTable.certificateId,
})
```

**Tipo esperado** (app/types/index.ts:367-382):
```typescript
export interface EnrolledCourseResponse {
  id: string;                    // ✓ Coincide
  title: string;                 // ✓ Coincide (pero fue transformado de 'name')
  description: string;           // ✓ Coincide
  progress: number;              // ✓ Coincide
  totalChapters: number;         // ✓ Coincide (pero fue transformado)
  completedChapters: number;     // ✗ TIPO MALO: Debería ser Record<string, boolean>
  isCompleted: boolean;          // ✓ Coincide
  completedAt?: string;          // ✓ Coincide
  estimatedTime: string;         // ✓ Coincide (pero fue transformado)
  lastAccessed: string;          // ✓ Coincide (pero fue transformado)
  image: string;                 // ✓ Coincide (pero fue transformado)
  category: string;              // ✓ Coincide
  level: string;                 // ✓ Coincide
  certificateId?: string | null; // ✓ Coincide
}
```

---

### 4. ENDPOINT DE EMPLEADOS

#### Problema 4.1: Múltiples transformaciones de campos

```typescript
// app/api/company/employees/route.ts:130-157
.select({
  id: schema.usersTable.id,
  name: schema.usersTable.name,
  email: schema.usersTable.email,
  phone: schema.usersTable.phone,
  avatar: schema.usersTable.avatar,
  isActive: schema.usersTable.isActive,
  lastLoginAt: schema.usersTable.lastLoginAt,
  createdAt: schema.usersTable.createdAt,
  joinedAt: schema.userCompaniesTable.joinedAt,
  acceptedAt: schema.userCompaniesTable.acceptedAt,
  roleName: schema.rolesTable.name,         // ← PROBLEMA: 'roleName' en query
  roleDescription: schema.rolesTable.description,
  coursesCompleted: sql<number>`...`,       // ← CALCULADO
  certificatesCount: sql<number>`...`,      // ← CALCULADO
})

// Después se transforma en respuesta (líneas 227-245):
const formattedEmployees = employees.map((employee) => ({
  id: employee.id,
  name: employee.name,
  email: employee.email,
  phone: employee.phone || "",
  role: employee.roleName,                  // ← TRANSFORMADO: roleName → role
  status: employee.isActive ? "active" : "inactive",  // ← TRANSFORMADO: boolean → string
  joinedAt: employee.joinedAt?.toISOString().split("T")[0] || "",  // ← FORMATEADO
  coursesCompleted: employee.coursesCompleted,
  certificates: employee.certificatesCount,  // ← RENOMBRADO: Count → Singular
  avatar: employee.avatar || ...,
  lastLoginAt: employee.lastLoginAt,
}))
```

**Tipo esperado**: NO DEFINIDO en app/types/index.ts
- Debería existir un tipo `CompanyEmployee` que especifique la transformación

---

### 5. ENDPOINT DE ESTADÍSTICAS

#### Problema 5.1: Campos con snake_case en queries

```typescript
// app/api/company/statistics/route.ts:13-14
LEFT JOIN "enrollCourse" ec ON uc."userId" = ec."user_id"
                                                    ^^^ INCONSISTENTE

// Más ejemplos:
WHERE "company_id" = ${companyId}   // ← snake_case
AND c."level" = 'basic'              // ← camelCase
```

---

## ANÁLISIS DE TIPOS CON `any` O `unknown`

### En Hooks - `use-courses.ts`
```typescript
// Línea 43: completedChapters debería ser Record<string, boolean>
completedChapters?: any;

// Línea 123: pagination debería ser PaginationInfo
pagination: any;

// Línea 324: enrollment debería ser EnrollCourse
const result = await makeRequest<{ enrollment: any }>(...)

// Línea 359: certificateGenerated es string o boolean?
(result as any)?.certificateGenerated || false
```

**Definición de tipo correcta**:
```typescript
export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface CourseProgress {
  completedChapters: Record<string, boolean>;
  progress: number;
  isCompleted: boolean;
  certificateGenerated?: boolean;
}
```

### En API - `auth/login/route.ts`
```typescript
// Línea 157: role_permissions es array de Permission
primaryUserCompany.role_permissions as unknown as Permission[]
                  ^^^^^^^^^^^^^^^^^^^  ^^^^^^^
                  Campo dudoso      Doble cast innecesario
```

---

## MATRIZ DE CAMPOS EN ENDPOINTS

| Campo | Definido en Schema | Se devuelve en... | Tipo en Types | Problema |
|-------|-------------------|------------------|---------------|----------|
| **courseId** | ✓ | Algunos endpoints | ✓ | snake_case en SQL |
| **userId** | ✓ | Algunos endpoints | ✓ | snake_case en SQL |
| **companyId** | ✓ | Algunos endpoints | ✓ | snake_case en SQL |
| **course_name** | ✗ | Certificates | ✓ (pero opcional) | Derivado, no documentado |
| **user_name** | ✗ | Certificates | ✓ (opcional) | Derivado, documentado |
| **user_email** | ✗ | Certificates | ✓ (opcional) | Derivado, documentado |
| **company_name** | ✗ | Certificates | ✗ | Derivado, NO documentado |
| **course_banner** | ✗ | Certificates | ✓ (opcional) | Derivado, NO está en respuesta |
| **role** | ✗ | Employees | ✗ | Transformado de roleName |
| **status** | ✗ | Employees | ✗ | Transformado de isActive |
| **certificates** | ✗ | Employees | ✗ | Transformado de certificatesCount |

---

## RESUMEN POR SEVERIDAD

### CRÍTICOS (Riesgo de bugs en runtime)
1. **Mixing camelCase/snake_case en SQL**: 6+ endpoints
2. **Campos derivados no tipificados**: Certificates, Company Employees
3. **Tabla enrollCourse con nombre incorrecto**: Base de datos

### ALTOS (Inconsistencias que afectan mantenibilidad)
1. **Transformaciones no documentadas**: Student Courses, Employees
2. **Tipos parcialmente documentados**: Certificate con campos opcionales
3. **Casting innecesario a unknown**: Login route

### MEDIOS (Pérdida de type safety)
1. **Uso de `any` en hooks**: 4+ hooks
2. **Campos opcionales inconsistentes**: Users en diferentes endpoints
3. **Paginación sin tipo común**: `pagination: any` en múltiples lugares

