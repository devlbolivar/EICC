# Unificación de Schemas de Base de Datos

## Problema Identificado

Existían dos archivos `schema.ts` con estructuras diferentes que causaban confusión y posibles bugs:

1. **`config/schema.ts`** (252 líneas) - Más completo con relaciones
2. **`drizzle/schema.ts`** (142 líneas) - Más simple, sin relaciones

### Problemas específicos:

- Inconsistencia de tipos de IDs (integer vs uuid)
- Falta de relaciones en uno de los schemas
- Campos diferentes entre ambos schemas
- Configuración confusa en `drizzle.config.ts`

## Solución Implementada

### 1. Schema Unificado (`config/schema.ts`)

Se unificó todo en `config/schema.ts` manteniendo:

- ✅ Todas las relaciones completas
- ✅ Todos los campos de ambos schemas
- ✅ Tipos consistentes (UUID para IDs)
- ✅ Alias para compatibilidad

### 2. Campos Adicionales Agregados

**Tabla `users`:**

- `age: integer()`
- `subscriptionId: varchar({ length: 255 })`

**Tabla `courses`:**

- `level: varchar({ length: 50 }).default("Básico")`
- `status: varchar({ length: 50 }).default("Borrador")`
- `estimatedDuration: varchar({ length: 100 })`
- `visibility: varchar({ length: 50 }).default("Público")`
- `targetCompanies: json().default([])`
- `modules: json().default([])`

### 3. Alias para Compatibilidad

Se agregaron alias para mantener compatibilidad con el código existente:

```typescript
export const users = usersTable;
export const companies = companiesTable;
export const courses = coursesTable;
export const enrollCourse = enrollCourseTable;
export const invitationTokens = invitationTokensTable;
export const roles = rolesTable;
export const userCompanies = userCompaniesTable;
```

### 4. Archivos Actualizados

- ✅ `config/db.tsx` - Ahora usa `./schema`
- ✅ `app/api/courses/route.ts` - Ahora usa `@/config/schema`
- ✅ `drizzle/relations.ts` - Actualizado para usar schema unificado
- ✅ `drizzle/schema.ts` - Eliminado (ya no necesario)

## Scripts de Migración Corregidos

### Problemas Identificados en `migrate-courses.js`:

1. **Nombres de columnas incorrectos**: Usaba `estimated_duration` y `target_companies` (snake_case) en lugar de `estimatedDuration` y `targetCompanies` (camelCase)
2. **Tipos de datos inconsistentes**: JSON como string en lugar de array
3. **Falta de verificación de consistencia**

### Scripts Creados/Corregidos:

#### 1. `scripts/migrate-courses.js` (Corregido)

- ✅ Usa nombres de columnas correctos (camelCase)
- ✅ Tipos de datos consistentes con el schema
- ✅ Verificación de columnas existentes

#### 2. `scripts/fix-column-names.js` (Nuevo)

- 🔧 Corrige nombres de columnas incorrectos si existen
- 🔧 Renombra `estimated_duration` → `estimatedDuration`
- 🔧 Renombra `target_companies` → `targetCompanies`

#### 3. `scripts/verify-schema.js` (Nuevo)

- 🔍 Verifica consistencia entre BD y schema unificado
- 🔍 Detecta columnas faltantes o extra
- 🔍 Valida tipos de datos críticos
- 🔍 Reporta estadísticas de datos

### Uso de los Scripts:

```bash
# 1. Ejecutar migración corregida
node scripts/migrate-courses.js

# 2. Corregir nombres de columnas si es necesario
node scripts/fix-column-names.js

# 3. Verificar consistencia
node scripts/verify-schema.js
```

## Beneficios

1. **Consistencia**: Un solo schema con tipos consistentes
2. **Mantenibilidad**: Un solo lugar para mantener el schema
3. **Funcionalidad completa**: Todas las relaciones y campos disponibles
4. **Compatibilidad**: Código existente sigue funcionando
5. **Claridad**: No más confusión sobre qué schema usar
6. **Verificación**: Scripts para detectar y corregir inconsistencias

## Uso

### Importar tablas:

```typescript
import { usersTable, coursesTable } from "@/config/schema";
```

### Importar con alias (compatibilidad):

```typescript
import { users, courses } from "@/config/schema";
```

### Importar todo el schema:

```typescript
import * as schema from "@/config/schema";
```

## Migración de Base de Datos

Si necesitas migrar la base de datos para reflejar los cambios:

1. Ejecuta las migraciones de Drizzle:

   ```bash
   npm run db:generate
   npm run db:migrate
   ```

2. Ejecuta los scripts de corrección:

   ```bash
   node scripts/migrate-courses.js
   node scripts/fix-column-names.js
   node scripts/verify-schema.js
   ```

3. Verifica que no haya errores de tipos en el código

## Notas Importantes

- El archivo `drizzle/schema.ts` fue eliminado
- Todas las importaciones ahora apuntan a `config/schema.ts`
- Las relaciones están definidas en `config/schema.ts`
- El archivo `drizzle/relations.ts` se mantiene por compatibilidad pero las relaciones principales están en `config/schema.ts`
- Los scripts de migración han sido corregidos para usar nombres de columnas consistentes
- Se agregaron scripts de verificación para detectar inconsistencias
