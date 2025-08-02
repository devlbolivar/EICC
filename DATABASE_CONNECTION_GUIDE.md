# Guía de Conexión a la Base de Datos

## Problema Resuelto

El error `CONNECTION_ENDED` se debía a una configuración inconsistente de la base de datos en diferentes archivos de la aplicación.

## Solución Implementada

### 1. Configuración Centralizada

Se creó un archivo centralizado para la configuración de la base de datos:

```typescript
// lib/database.ts
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "@/config/schema";

const pg = neon(process.env.DATABASE_URL!);
const db = drizzle(pg, { schema });

export { db, pg };
```

### 2. Uso Consistente

Todos los archivos de API ahora usan la configuración centralizada:

```typescript
// En cualquier archivo de API
import { db } from "@/lib/database";
import * as schema from "@/config/schema";

// Usar db para consultas
const users = await db.select().from(schema.usersTable);
```

### 3. Eliminación de Cierres Manuales

Con `@neondatabase/serverless`, NO es necesario cerrar manualmente las conexiones. Se eliminaron todos los `client.end()` y `pg.end()`.

## Archivos Corregidos

- ✅ `app/api/admin/dashboard/route.ts`
- ✅ `app/api/user/route.ts`
- ✅ `app/api/auth/register/route.ts`
- ✅ `app/api/auth/accept-invite/route.ts`
- ✅ `app/api/auth/switch-company/route.ts`
- ✅ `app/api/auth/invite/route.ts`

## Buenas Prácticas

### ✅ Hacer

1. **Usar la configuración centralizada**:

   ```typescript
   import { db } from "@/lib/database";
   ```

2. **Importar el schema directamente**:

   ```typescript
   import * as schema from "@/config/schema";
   ```

3. **Usar consultas consistentes**:
   ```typescript
   const result = await db.select().from(schema.usersTable);
   ```

### ❌ No Hacer

1. **NO crear conexiones múltiples**:

   ```typescript
   // ❌ Malo
   const client = postgres(connectionString);
   const db = drizzle(client, { schema });
   ```

2. **NO cerrar conexiones manualmente**:

   ```typescript
   // ❌ Malo
   finally {
     await client.end();
   }
   ```

3. **NO mezclar drivers**:
   ```typescript
   // ❌ Malo - mezclar postgres y neon
   import postgres from "postgres";
   import { neon } from "@neondatabase/serverless";
   ```

## Pruebas

Para verificar que la conexión funciona correctamente:

```bash
npm run db:test
```

## Variables de Entorno

Asegúrate de que `DATABASE_URL` esté configurada correctamente en tu archivo `.env`:

```env
DATABASE_URL="postgresql://user:password@host:port/database"
```

## Monitoreo

Si vuelves a ver errores de conexión:

1. Verifica que `DATABASE_URL` esté configurada
2. Ejecuta `npm run db:test` para probar la conexión
3. Revisa los logs del servidor para errores específicos
4. Verifica que no haya múltiples conexiones abiertas

## Notas Importantes

- `@neondatabase/serverless` maneja automáticamente el pooling de conexiones
- No es necesario cerrar conexiones manualmente
- La configuración centralizada evita inconsistencias
- Todos los archivos de API deben usar la misma configuración
