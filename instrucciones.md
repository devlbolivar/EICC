# Tests de Integración — Instrucciones y Estado

## Stack y contexto

- Next.js 15 App Router, TypeScript, PostgreSQL (Neon serverless) + Drizzle ORM
- JWT auth con httpOnly cookies (accessToken 15min, refreshToken 7d)
- Roles: admin, company, student con permisos RBAC
- Jest con jsdom, módulos mockeados (sin DB real en integration tests)
- Alias `@/` apunta a la raíz del proyecto

---

## Tests ya escritos (NO duplicar)

| Archivo | Rutas cubiertas |
|---|---|
| ✅ `auth-flows.integration.test.ts` | POST login, register, refresh, logout |
| ✅ `plan-limits.integration.test.ts` | Invite limits, enrollment limits, cert gate Free + Starter/Pro |
| ✅ `admin-companies.integration.test.ts` | PUT/DELETE `/api/admin/companies/[id]` |
| ✅ `company-student-flows.integration.test.ts` | GET employees, GET student/courses, POST change-password |
| ✅ `admin-certificates.integration.test.ts` | GET certificates, POST revoke, POST reissue |
| ✅ `admin-reports.integration.test.ts` | GET reports (todos los tipos + CSV) |

---

## Rutas pendientes (alta prioridad)

### 1. `app/api/auth/forgot-password/route.ts`

Flujo: usuario da su email → se genera token → se loguea la URL de reset (sin SMTP real).

Casos a testear:
- 200: email de usuario existente → genera token, responde con mensaje genérico
- 200: email de usuario NO existente → misma respuesta (no revelar si existe — anti-enumeración)
- 400: email faltante
- 400: email con formato inválido

### 2. `app/api/auth/reset-password/route.ts`

Flujo: usuario da token + nueva contraseña → se valida token → se actualiza contraseña + `passwordChangedAt`.

Casos a testear:
- 200: token válido + nueva contraseña válida → contraseña actualizada
- 400: token faltante
- 400: token inválido o expirado
- 400: contraseña que no cumple requisitos
- 400: contraseñas no coinciden (si el route valida `confirmPassword`)

### 3. `app/api/auth/accept-invite/route.ts`

Flujo: usuario con token de invitación → si no tiene cuenta se crea, si ya existe se asocia a la empresa. Token marcado como `isUsed = true`.

Casos a testear:
- 200: token válido + datos completos → usuario creado/asociado a empresa
- 400: token faltante
- 404: token no encontrado en DB
- 409: token ya usado (`isUsed = true`)
- 400: token expirado (`expiresAt < now`)

### 4. `app/api/admin/companies/route.ts` — GET (listar empresas)

Flujo: admin obtiene lista paginada con filtros opcionales (`search`, `plan`, `isActive`).

Casos a testear:
- 200: admin autenticado → lista con paginación (`data`, `total`, `page`)
- 200: filtro por `plan=free` / `starter` / `pro`
- 200: filtro por `isActive=false`
- 200: búsqueda por nombre (`search=acme`)
- 401: sin token
- 403: usuario sin permisos de admin

### 5. `app/api/courses/route.ts` — GET (catálogo)

Flujo: lista de cursos filtrada por visibilidad según el rol del usuario.

Casos a testear:
- 200: student ve solo cursos públicos (`isPublic = true`)
- 200: admin ve todos los cursos (activos e inactivos)
- 200: company manager ve cursos públicos + los de su empresa
- 401: sin token
- 200: paginación respeta `limit` y `page`

### 6. `app/api/courses/[id]/route.ts` — GET (detalle)

Flujo: usuario obtiene detalle de un curso con control de visibilidad.

Casos a testear:
- 200: curso público → accesible para cualquier usuario autenticado
- 403: curso privado de otra empresa → student no puede verlo
- 404: curso no existe o está inactivo
- 401: sin token
- 400: UUID inválido en el parámetro de ruta

---

## Archivos a crear

```
__tests__/integration/auth-recovery.integration.test.ts
  → forgot-password + reset-password + accept-invite

__tests__/integration/courses-catalog.integration.test.ts
  → GET /api/courses  +  GET /api/courses/[id]

__tests__/integration/admin-listings.integration.test.ts
  → GET /api/admin/companies
```

Leer los route handlers antes de escribir los tests para confirmar qué módulo de DB usan (`@/config/db`, `@/lib/database` o inline neon+drizzle) y qué validaciones aplican.

---

## Patrón de tests (CRÍTICO — seguir exactamente)

### Bug TDZ en jest.mock()

Las variables `const` definidas fuera de `jest.mock()` no pueden referenciarse dentro del factory (Temporal Dead Zone). Definir el mock object DENTRO del factory:

```typescript
// ✅ CORRECTO
jest.mock("drizzle-orm/neon-http", () => {
  const mockDb = {
    query: { usersTable: { findFirst: jest.fn() } },
    insert: jest.fn(),
    update: jest.fn(),
  };
  return { drizzle: jest.fn().mockReturnValue(mockDb) };
});

// Acceder así después de los imports:
import { drizzle } from "drizzle-orm/neon-http";
const mockInlineDb = (drizzle as jest.Mock)(); // siempre devuelve el mismo mockDb

// ❌ INCORRECTO — ReferenceError: Cannot access before initialization
const mockDb = { ... };
jest.mock("drizzle-orm/neon-http", () => ({
  drizzle: jest.fn().mockReturnValue(mockDb), // TDZ error
}));
```

### Rutas con db inline (neon + drizzle en el módulo)

```typescript
jest.mock("@neondatabase/serverless", () => ({ neon: jest.fn().mockReturnValue({}) }));
jest.mock("drizzle-orm/neon-http", () => {
  const mockDb = { query: { usersTable: { findFirst: jest.fn() } }, insert: jest.fn() };
  return { drizzle: jest.fn().mockReturnValue(mockDb) };
});
```

### Rutas con db importado (`@/config/db` o `@/lib/database`)

```typescript
jest.mock("@/config/db", () => ({
  db: { execute: jest.fn(), transaction: jest.fn() },
}));
import { db } from "@/config/db";
const mockDb = db as { execute: jest.Mock; transaction: jest.Mock };
```

### Mocks estándar (incluir en todos los tests)

```typescript
jest.mock("@/lib/csrf", () => ({ requireCsrf: jest.fn().mockResolvedValue(null) }));
jest.mock("@/lib/rate-limit", () => ({
  authRateLimit: jest.fn().mockResolvedValue(null),
  apiRateLimit: jest.fn().mockResolvedValue(null),
  strictRateLimit: jest.fn().mockResolvedValue(null),
}));
jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((data: unknown, options?: { status?: number }) => ({
      json: () => data,
      status: options?.status ?? 200,
      cookies: { set: jest.fn(), get: jest.fn() },
    })),
  },
  NextRequest: jest.fn(),
}));
jest.mock("drizzle-orm", () => ({
  eq: jest.fn(() => ({})), and: jest.fn(() => ({})), or: jest.fn(() => ({})),
  like: jest.fn(() => ({})), ilike: jest.fn(() => ({})),
  desc: jest.fn(() => ({})), asc: jest.fn(() => ({})),
  sql: jest.fn(() => ({})), relations: jest.fn(() => ({})), count: jest.fn(() => ({})),
}));
```

### Helper — cadena fluida de Drizzle (awaitable en cualquier método)

```typescript
function makeSelectChain(result: unknown) {
  const chain: Record<string, unknown> = {};
  ["from", "innerJoin", "leftJoin", "where", "orderBy", "limit", "offset", "groupBy", "having"].forEach(m => {
    chain[m] = jest.fn(() => chain);
  });
  chain["then"] = (resolve: (val: unknown) => unknown) => Promise.resolve(result).then(resolve);
  chain["catch"] = () => Promise.resolve(result);
  return chain;
}
```

### Helper — NextRequest mock

```typescript
function makeRequest(
  body: unknown = {},
  cookies: Record<string, string> = {},
  headers: Record<string, string> = {}
): NextRequest {
  return {
    headers: { get: jest.fn((key: string) => headers[key] ?? null) },
    cookies: { get: jest.fn((name: string) => cookies[name] ? { value: cookies[name] } : undefined) },
    json: jest.fn().mockResolvedValue(body),
    url: "http://localhost/api/test",
  } as unknown as NextRequest;
}
```

### Estructura de cada archivo de test

```typescript
// 1. Todos los jest.mock() al inicio (antes de imports)
// 2. Imports de routes + mocks tipados
// 3. Constantes (UUIDs fijos, payloads base)
// 4. Helpers (makeRequest, makeSelectChain, etc.)
// 5. describe blocks, cada uno con beforeEach(() => { jest.clearAllMocks(); })
// 6. Verificar siempre: status code + al menos un campo del body
```

---

## Comando para verificar

```bash
npx jest __tests__/integration/<nombre>.integration.test.ts --no-coverage
```
