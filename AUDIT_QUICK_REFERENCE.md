# GUÍA RÁPIDA - INCONSISTENCIAS EN EICC

## ARCHIVOS CON PROBLEMAS (Ubicación Rápida)

### 🔴 CRÍTICOS - Cambios urgentes

| Archivo | Líneas | Problema | Solución |
|---------|--------|----------|----------|
| `/app/api/certificates/route.ts` | 45,48,53,56 | snake_case en queries | Usar Drizzle ORM |
| `/app/api/certificates/[id]/route.ts` | 34-47 | Campos derivados no tipificados | Agregar a Certificate interface |
| `/app/api/courses/[id]/enroll/route.ts` | 57,86-92,202,347,373 | SQL raw con snake_case | Usar Drizzle ORM |
| `/app/api/company/statistics/route.ts` | 13,32 | Mixtura camelCase/snake_case | Consistencia en naming |
| `/config/schema.ts` | 161 | Tabla "enrollCourse" (mixedCase) | Cambiar a "enroll_course" |
| `/app/types/index.ts` | 305-334 | Certificate sin todos los campos | Agregar campos derivados |

### 🟡 ALTOS - Refactorización necesaria

| Archivo | Líneas | Problema | Solución |
|---------|--------|----------|----------|
| `/app/api/student/courses/route.ts` | 17-31 | Transformaciones sin documentar | Documentar en comentarios |
| `/app/api/company/employees/route.ts` | 130-245 | Múltiples transformaciones | Crear tipo CompanyEmployee |
| `/app/api/company/profile/route.ts` | 62 | Relaciones no tipificadas | Verificar tipos |
| `/app/api/admin/reports/route.ts` | Multiple | Naming inconsistente | Verificar todas las queries |

### 🟠 MEDIOS - Mejoras de tipo safety

| Archivo | Líneas | Problema | Solución |
|---------|--------|----------|----------|
| `/hooks/use-courses.ts` | 43,123,324,343,359 | `any` sin tipar | Crear tipos específicos |
| `/hooks/use-certificates.ts` | 97 | `pagination: any` | Crear PaginationInfo |
| `/hooks/use-company-certificates.ts` | 149 | `pagination: any` | Crear PaginationInfo |
| `/app/api/auth/login/route.ts` | 157 | Double cast a unknown | Remover casteos innecesarios |

---

## PATRONES DE SOLUCIÓN RECOMENDADOS

### Patrón 1: Reemplazar SQL raw con Drizzle ORM

**ANTES** (Problemático):
```typescript
// app/api/certificates/route.ts:85-92
const query = sql`
  SELECT cert.*
  FROM certificates cert
  LEFT JOIN courses c ON cert."course_id" = c.id
  WHERE cert."user_id" = ${payload.userId}
`;
const result = await db.execute(query);
```

**DESPUÉS** (Correcto):
```typescript
const result = await db
  .select({ ...certificatesTable, courseName: coursesTable.name })
  .from(certificatesTable)
  .leftJoin(coursesTable, eq(certificatesTable.courseId, coursesTable.id))
  .where(eq(certificatesTable.userId, payload.userId));
```

### Patrón 2: Documentar transformaciones en tipos

**ANTES**:
```typescript
export interface EnrolledCourseResponse {
  title: string;  // ← ¿De dónde viene?
  image: string;  // ← ¿De dónde viene?
}
```

**DESPUÉS**:
```typescript
/**
 * Respuesta de cursos inscritos
 * TRANSFORMACIONES:
 * - coursesTable.name → title
 * - coursesTable.bannerImage → image
 * - coursesTable.numberOfChapters → totalChapters
 * - coursesTable.estimatedDuration → estimatedTime
 * - enrollCourseTable.updatedAt → lastAccessed
 */
export interface EnrolledCourseResponse {
  id: string;
  title: string;      // Mapped from Course.name
  image: string;      // Mapped from Course.bannerImage
  totalChapters: number;  // Mapped from Course.numberOfChapters
  // ...
}
```

### Patrón 3: Crear tipos para respuestas comunes

**CREAR** en `/app/types/index.ts`:
```typescript
export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiListResponse<T> {
  success: boolean;
  data: T[];
  pagination: PaginationInfo;
}

export interface CompanyEmployee {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;  // Transformed from roleName
  status: "active" | "inactive";  // Transformed from isActive
  joinedAt: string;
  coursesCompleted: number;
  certificates: number;
  avatar: string;
  lastLoginAt?: Date;
}
```

### Patrón 4: Usar constantes para naming

**CREAR** en `/lib/constants.ts`:
```typescript
// Field mappings for API transformations
export const FIELD_MAPPINGS = {
  COURSES: {
    name: 'title',
    bannerImage: 'image',
    numberOfChapters: 'totalChapters',
    estimatedDuration: 'estimatedTime',
  },
  EMPLOYEES: {
    roleName: 'role',
    isActive: 'status',
    certificatesCount: 'certificates',
  },
} as const;
```

---

## CHECKLIST DE VERIFICACIÓN

### Al crear nuevo endpoint:
- [ ] ¿Usa Drizzle ORM o SQL raw?
  - Si SQL raw: ¿Está consistente naming?
- [ ] ¿Hay transformaciones de campos?
  - Si sí: ¿Están documentadas en tipo?
- [ ] ¿Hay campos derivados de JOINs?
  - Si sí: ¿Están en interface TypeScript?
- [ ] ¿Hay `any` o `unknown`?
  - Si sí: ¿Se puede tipar correctamente?
- [ ] ¿Paginación? ¿Usa tipo común?

---

## ESTADÍSTICAS DE INCONSISTENCIAS

```
Total de Inconsistencias: 15+

Por Severidad:
- CRÍTICAS: 3 (15%)
- ALTAS: 4 (25%)
- MEDIAS: 8 (60%)

Por Tipo:
- Naming convention (camelCase vs snake_case): 6
- Campos derivados sin tipar: 4
- Transformaciones sin documentar: 3
- Uso de `any`/`unknown`: 5
- Tabla con nombre incorrecto: 1

Por Ubicación:
- API Routes: 10
- Hooks: 5
- Schema/Types: 2
- Config: 1
```

