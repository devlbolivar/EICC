# 🔥 GUÍA DE CORRECCIONES CRÍTICAS - PASO A PASO

**Fecha:** 14 de Noviembre, 2025
**Branch:** `fix/critical-security-issues`
**Tiempo estimado:** 2-3 días

---

## 📋 ÍNDICE DE CORRECCIONES

- [x] ✅ Paso 1: Crear helpers centralizados (`lib/api-helpers.ts`) - **COMPLETADO**
- [x] ✅ Paso 2: Corregir `/api/billing/checkout` - **COMPLETADO**
- [ ] Paso 3: Corregir `/api/billing/subscription`
- [ ] Paso 4: Corregir `/api/billing/portal`
- [ ] Paso 5: Corregir `/api/billing/invoices`
- [ ] Paso 6: Corregir endpoints admin sin verificación
- [ ] Paso 7: Proteger POST `/api/user`
- [ ] Paso 8: Validar UUIDs en rutas dinámicas
- [ ] Paso 9: Eliminar localStorage de AuthContext
- [ ] Paso 10: Validar dependencias en DELETE empresa

---

## ✅ COMPLETADOS

### Paso 1: Helper Centralizado ✅

**Archivo creado:** `lib/api-helpers.ts`

Este archivo provee funciones reutilizables para:
- Autenticación consistente
- Manejo de errores estandarizado
- Respuestas API uniformes

### Paso 2: Corregir Billing Checkout ✅

**Archivo corregido:** `app/api/billing/checkout/route.ts`

Cambios realizados:
- ✅ Reemplazado `authResult.valid/user` por `payload`
- ✅ Actualizado manejo de errores
- ✅ Corregidas referencias a userId y email

---

## 🔧 PRÓXIMOS PASOS (Hazlos en orden)

### Paso 3: Corregir `/api/billing/subscription`

**Archivo:** `app/api/billing/subscription/route.ts`

**Buscar estas líneas (15-18):**
```typescript
const authResult = await verifyAuth(req);
if (!authResult.valid || !authResult.user) {
  return NextResponse.json({ error: "No autenticado" }, { status: 401 });
}
```

**Reemplazar con:**
```typescript
import { requireAuth, handleApiError } from "@/lib/api-helpers";

// En el handler:
const { payload } = await requireAuth(req);
```

**Actualizar catch block:**
```typescript
} catch (error) {
  console.error("Error fetching subscription:", error);
  return handleApiError(error);
}
```

**Comando para aplicar:**
```bash
# Editar el archivo manualmente o usar tu IDE
code app/api/billing/subscription/route.ts
```

---

### Paso 4: Corregir `/api/billing/portal`

**Archivo:** `app/api/billing/portal/route.ts`

**Aplicar el mismo patrón:**
1. Importar `requireAuth` y `handleApiError`
2. Cambiar `authResult.valid/user` por `await requireAuth(req)`
3. Actualizar catch block

---

### Paso 5: Corregir `/api/billing/invoices`

**Archivo:** `app/api/billing/invoices/route.ts`

Mismo patrón que los anteriores.

---

### Paso 6: Corregir Endpoints Admin Sin Verificación 🔴 CRÍTICO

#### 6.1 Admin Users [id] - PUT y DELETE

**Archivo:** `app/api/admin/users/[id]/route.ts`

**Buscar (línea ~164-180 en PUT):**
```typescript
const token = request.cookies.get("accessToken")?.value;
if (!token) {
  return NextResponse.json({ error: "No autenticado" }, { status: 401 });
}

const payload = verifyAccessToken(token);
if (!payload) {
  return NextResponse.json({ error: "Token inválido" }, { status: 401 });
}
```

**Reemplazar con:**
```typescript
import { requireAdmin, handleApiError, errorResponse } from "@/lib/api-helpers";

// Al inicio de PUT:
const { payload } = await requireAdmin(request);

// Al inicio de DELETE (también):
const { payload } = await requireAdmin(request);
```

**También actualizar catch blocks:**
```typescript
} catch (error) {
  console.error("Error updating user:", error);
  return handleApiError(error);
}
```

---

#### 6.2 Admin Companies Create

**Archivo:** `app/api/admin/companies/create/route.ts`

**Buscar (línea ~23-37):**
```typescript
const token = request.cookies.get("accessToken")?.value;
if (!token) {
  return NextResponse.json({ error: "No autenticado" }, { status: 401 });
}

const payload = verifyAccessToken(token);
if (!payload) {
  return NextResponse.json({ error: "Token inválido" }, { status: 401 });
}
```

**Reemplazar con:**
```typescript
import { requireAdmin, handleApiError, successResponse, errorResponse } from "@/lib/api-helpers";

// Al inicio del handler:
const { payload } = await requireAdmin(request);
```

---

#### 6.3 Admin Companies [id] - DELETE

**Archivo:** `app/api/admin/companies/[id]/route.ts`

**En DELETE handler (línea ~79+):**

**Agregar ANTES de la eliminación:**
```typescript
import { requireAdmin, handleApiError, errorResponse } from "@/lib/api-helpers";
import { and, eq, count as drizzleCount } from "drizzle-orm";

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { payload } = await requireAdmin(request);
    const { id } = await params;

    // ✅ VALIDAR DEPENDENCIAS ANTES DE ELIMINAR

    // 1. Verificar usuarios activos
    const activeUsersCount = await db
      .select({ count: drizzleCount() })
      .from(schema.userCompaniesTable)
      .where(
        and(
          eq(schema.userCompaniesTable.companyId, id),
          eq(schema.userCompaniesTable.isActive, true)
        )
      );

    if (activeUsersCount[0].count > 0) {
      return errorResponse(
        `No se puede eliminar: ${activeUsersCount[0].count} usuarios activos asociados`,
        400
      );
    }

    // 2. Verificar suscripción activa
    const activeSubscription = await db.query.subscriptionsTable.findFirst({
      where: and(
        eq(schema.subscriptionsTable.companyId, id),
        eq(schema.subscriptionsTable.status, "active")
      ),
    });

    if (activeSubscription) {
      return errorResponse(
        "No se puede eliminar: empresa tiene suscripción activa en Stripe",
        400
      );
    }

    // 3. Verificar cursos creados
    const coursesCount = await db
      .select({ count: drizzleCount() })
      .from(schema.coursesTable)
      .where(eq(schema.coursesTable.companyId, id));

    if (coursesCount[0].count > 0) {
      return errorResponse(
        `No se puede eliminar: empresa tiene ${coursesCount[0].count} cursos creados`,
        400
      );
    }

    // Si pasa todas las validaciones, proceder con eliminación
    await db
      .delete(schema.companiesTable)
      .where(eq(schema.companiesTable.id, id));

    return successResponse({ message: "Empresa eliminada exitosamente" });

  } catch (error) {
    return handleApiError(error);
  }
}
```

---

### Paso 7: Proteger POST `/api/user`

**Archivo:** `app/api/user/route.ts`

**Buscar el handler POST (línea ~175):**
```typescript
export async function POST(request: NextRequest) {
  try {
    const { name, email } = await request.json();
```

**Agregar autenticación AL INICIO:**
```typescript
import { requireAuth, handleApiError, successResponse } from "@/lib/api-helpers";

export async function POST(request: NextRequest) {
  try {
    // ✅ AGREGAR AUTENTICACIÓN
    const { payload } = await requireAuth(request);

    const { name, email } = await request.json();
    // resto del código...
```

**Y actualizar el catch:**
```typescript
  } catch (error) {
    return handleApiError(error);
  }
```

---

### Paso 8: Validar UUIDs en Rutas Dinámicas

**Archivos a corregir:**
- `app/api/courses/[id]/route.ts`
- `app/api/courses/[id]/enroll/route.ts`
- `app/api/certificates/[id]/route.ts`
- Todos los demás `[id]/route.ts`

**Primero, instalar uuid:**
```bash
npm install uuid
npm install --save-dev @types/uuid
```

**Crear validador en `lib/validators.ts`:**
```typescript
import { validate as isValidUUID } from 'uuid';
import { NextResponse } from 'next/server';
import { errorResponse } from './api-helpers';

export function validateUUID(id: string, fieldName = "ID"): NextResponse | null {
  if (!isValidUUID(id)) {
    return errorResponse(`${fieldName} inválido`, 400);
  }
  return null;
}
```

**Uso en cada endpoint [id]:**
```typescript
import { validateUUID } from '@/lib/validators';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    // ✅ VALIDAR UUID
    const validationError = validateUUID(id, "Course ID");
    if (validationError) return validationError;

    // Continuar con la lógica...
  } catch (error) {
    return handleApiError(error);
  }
}
```

**Aplica esto en TODOS los handlers (GET, PUT, DELETE) de archivos con [id].**

---

### Paso 9: Eliminar localStorage de AuthContext 🔐 SEGURIDAD

**Archivo:** `context/AuthContext.tsx`

**Buscar y ELIMINAR todas estas líneas:**

```typescript
// Línea ~101-102 en refreshToken:
localStorage.setItem("accessToken", data.data.accessToken);  // ❌ ELIMINAR
localStorage.setItem("refreshToken", data.data.refreshToken); // ❌ ELIMINAR

// Línea ~197-198 en switchCompany:
const token = localStorage.getItem("accessToken"); // ❌ ELIMINAR
if (!token) {
  throw new Error("No hay token de acceso");
}

// Línea ~218-219:
localStorage.setItem("accessToken", result.data.accessToken); // ❌ ELIMINAR
localStorage.setItem("refreshToken", result.data.refreshToken); // ❌ ELIMINAR
```

**En `switchCompany`, reemplazar con:**
```typescript
const switchCompany = async (companyId: string) => {
  try {
    // Los tokens están en cookies httpOnly, no necesitamos pasarlos manualmente
    const response = await fetch(API_ROUTES.AUTH.SWITCH_COMPANY, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ companyId }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Error cambiando empresa");
    }

    // Las cookies se actualizan automáticamente en el backend
    setSession(result.data.session);
    toast.success("Empresa cambiada exitosamente");
  } catch (error) {
    console.error("Error cambiando empresa:", error);
    toast.error(
      error instanceof Error ? error.message : "Error cambiando empresa"
    );
    throw error;
  }
};
```

---

### Paso 10: Crear .env.local y Validador

**10.1 Crear .env.local:**
```bash
cp .env.example .env.local
```

**10.2 Generar JWT_SECRET fuerte:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**Copiar el output y pegarlo en .env.local:**
```bash
JWT_SECRET=<pega_el_valor_generado_aquí>
```

**10.3 Configurar DATABASE_URL:**
Si usas Neon, ve a tu dashboard y copia la connection string.
Si usas PostgreSQL local:
```bash
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/eicc_db
```

**10.4 Crear validador de env vars:**

**Archivo:** `lib/env-validator.ts`
```typescript
const requiredEnvVars = [
  'DATABASE_URL',
  'JWT_SECRET',
  'NEXT_PUBLIC_APP_URL',
];

const optionalEnvVars = {
  'STRIPE_SECRET_KEY': 'Billing functionality will be disabled',
  'GOOGLE_GENERATIVE_AI_API_KEY': 'AI course generation will be disabled',
};

export function validateEnv() {
  const missing = requiredEnvVars.filter(key => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `❌ Missing required environment variables:\n${missing.map(v => `   - ${v}`).join('\n')}`
    );
  }

  // Validar JWT_SECRET strength
  if (process.env.JWT_SECRET!.length < 32) {
    throw new Error('❌ JWT_SECRET must be at least 32 characters long for security');
  }

  // Advertir sobre opcionales
  const missingOptional = Object.keys(optionalEnvVars).filter(key => !process.env[key]);
  if (missingOptional.length > 0) {
    console.warn('\n⚠️  Optional environment variables missing:');
    missingOptional.forEach(key => {
      console.warn(`   - ${key}: ${optionalEnvVars[key as keyof typeof optionalEnvVars]}`);
    });
    console.warn('');
  }

  console.log('✅ Environment variables validated successfully\n');
}
```

**10.5 Llamar validador en inicio:**

**Archivo:** `app/layout.tsx`

Agregar al inicio del archivo:
```typescript
import { validateEnv } from '@/lib/env-validator';

// Validar en startup (solo server-side)
if (typeof window === 'undefined') {
  validateEnv();
}
```

---

## 🧪 TESTING DESPUÉS DE CADA PASO

Después de cada corrección, verifica que funcione:

```bash
# 1. Verificar que no hay errores de TypeScript
npm run build

# 2. Iniciar en desarrollo
npm run dev

# 3. Probar el endpoint corregido
# Por ejemplo, para billing checkout:
curl -X POST http://localhost:3000/api/billing/checkout \
  -H "Content-Type: application/json" \
  -d '{"priceId":"price_test","companyId":"uuid"}' \
  --cookie "accessToken=<tu_token>"
```

**Deberías ver:**
- ❌ Antes: Error interno o comportamiento inesperado
- ✅ Después: Error 401 si no autenticado, o 403 si sin permisos (comportamiento correcto)

---

## 📝 CHECKLIST DE PROGRESO

Marca cada uno cuando lo completes:

**Billing (4 archivos):**
- [x] ✅ checkout/route.ts
- [ ] subscription/route.ts
- [ ] portal/route.ts
- [ ] invoices/route.ts

**Admin Endpoints (3 archivos):**
- [ ] admin/users/[id]/route.ts (PUT y DELETE)
- [ ] admin/companies/create/route.ts
- [ ] admin/companies/[id]/route.ts (DELETE con validaciones)

**Otros Críticos:**
- [ ] POST /api/user
- [ ] Validación UUID en ~10 archivos [id]
- [ ] Eliminar localStorage en AuthContext
- [ ] Crear .env.local
- [ ] Crear y ejecutar env-validator

---

## 🚀 COMANDOS GIT PARA COMMITS

Después de completar cada grupo de correcciones:

```bash
# Después de billing:
git add app/api/billing/ lib/api-helpers.ts
git commit -m "🔒 Fix critical auth bypass in billing endpoints

- Replaced incorrect authResult.valid/user checks
- Added requireAuth() helper for consistent validation
- Updated all 4 billing routes: checkout, subscription, portal, invoices
- Added proper error handling with handleApiError()

Fixes: Critical security vulnerability in payment system"

# Después de admin:
git add app/api/admin/
git commit -m "🔐 Add admin permission verification to sensitive endpoints

- Added requireAdmin() to users CRUD endpoints
- Added requireAdmin() to companies create/delete
- Added dependency validation before company deletion
- Prevents privilege escalation attacks

Fixes: Admin bypass vulnerability"

# Después de validación UUID:
git add app/api/*/[id]/ lib/validators.ts
git commit -m "✅ Add UUID validation to all dynamic route parameters

- Created validateUUID() helper
- Applied to courses, certificates, and user endpoints
- Prevents database errors from invalid IDs

Fixes: Input validation vulnerability"

# Después de AuthContext:
git add context/AuthContext.tsx
git commit -m "🔐 Remove insecure localStorage token storage

- Removed all localStorage token operations
- Use only httpOnly cookies for tokens
- Updated switchCompany to work with cookies

Fixes: XSS vulnerability via localStorage"

# Después de env validator:
git add lib/env-validator.ts app/layout.tsx .env.local
git commit -m "⚙️ Add environment variable validation on startup

- Created validateEnv() with required vars check
- Validates JWT_SECRET strength
- Warns about missing optional vars
- Prevents runtime errors from missing config

Fixes: Configuration management"
```

---

## ⏱️ TIEMPO ESTIMADO POR TAREA

| Tarea | Tiempo | Dificultad |
|-------|--------|------------|
| Billing (4 archivos) | 2 horas | Fácil |
| Admin endpoints (3 archivos) | 3 horas | Media |
| POST /api/user | 30 min | Fácil |
| UUID validation | 2 horas | Fácil |
| AuthContext localStorage | 1 hora | Media |
| .env + validator | 1 hora | Fácil |
| **TOTAL** | **9.5 horas** | **1-2 días** |

---

## 🆘 SI TIENES PROBLEMAS

### Error: "Cannot find module '@/lib/api-helpers'"

**Solución:**
```bash
# Verificar que el archivo existe
ls -la lib/api-helpers.ts

# Si no existe, créalo con el contenido del Paso 1
```

### Error: TypeScript en requireAuth/requireAdmin

**Solución:**
Asegúrate que `lib/admin-auth.ts` exporta correctamente `verifyAuth`:
```typescript
// En lib/admin-auth.ts debe existir:
export async function verifyAuth(request: NextRequest) {
  // ...
  return { authorized, payload, response };
}
```

### Error: "validate is not a function" (UUID)

**Solución:**
```bash
npm install uuid @types/uuid
```

---

## 🎯 SIGUIENTE PASO INMEDIATO

**AHORA:** Continúa con **Paso 3** (corregir `/api/billing/subscription`)

Abre el archivo y aplica el mismo patrón que viste en checkout.

**Tiempo:** 30 minutos
**Dificultad:** ⭐ Fácil (solo copiar el patrón)

¡Adelante! 🚀
