# Guía de Plataforma — Online Learning Platform

Documento de referencia para entender el producto, sus reglas de negocio, flujos y arquitectura.
Aplica tanto al equipo de desarrollo como a Claude al momento de hacer cambios.

---

## Tabla de Contenidos

1. [Descripción General](#1-descripción-general)
2. [Modelo de Negocio](#2-modelo-de-negocio)
3. [Roles y Permisos](#3-roles-y-permisos)
4. [Flujos de Usuario](#4-flujos-de-usuario)
5. [Stack Técnico](#5-stack-técnico)
6. [Arquitectura del Proyecto](#6-arquitectura-del-proyecto)
7. [Base de Datos](#7-base-de-datos)
8. [Mapa de API Routes](#8-mapa-de-api-routes)
9. [Seguridad](#9-seguridad)
10. [Configuración y Comandos](#10-configuración-y-comandos)
11. [Estado del MVP](#11-estado-del-mvp)
12. [Reglas de Negocio Consolidadas](#12-reglas-de-negocio-consolidadas)

---

## 1. Descripción General

**Qué es:** Plataforma B2B de e-learning para PyMEs (5–50 empleados).

**Modelo:** El administrador de la plataforma crea y publica cursos. Las empresas se suscriben a un plan y sus empleados acceden al catálogo de cursos. Al completar un curso, los empleados reciben certificados (según el plan).

**Quién paga:** Las empresas (no los empleados individuales).

**Quién crea cursos:** Solo el administrador de la plataforma.

**Quién toma cursos:** Los empleados de las empresas suscritas.

---

## 2. Modelo de Negocio

### Planes

| Plan | Precio | Empleados máx. | Cursos accesibles | Certificados |
|---|---|---|---|---|
| **Free** (`free`) | $0/mes | 5 | 3 distintos del catálogo | No |
| **Starter** (`starter`) | $49/mes | 20 | Catálogo completo | Sí |
| **Pro** (`pro`) | $129/mes | 50 | Catálogo completo | Sí |

### Reglas de los planes

**Free:**
- La empresa puede tener hasta 5 empleados activos.
- Los empleados de la empresa pueden enrollarse en máximo 3 cursos distintos en total (no por empleado — es el conteo de `courseId` distintos en `enroll_course` para toda la empresa).
- Al completar un curso, **no** se emite certificado.
- Puede invitar empleados mientras no supere el límite de 5.

**Starter:**
- La empresa puede tener hasta 20 empleados activos.
- Acceso al catálogo completo (sin límite de cursos).
- Se emiten certificados al completar cursos.

**Pro:**
- La empresa puede tener hasta 50 empleados activos.
- Acceso al catálogo completo.
- Certificados habilitados.
- Reportes avanzados de progreso (dashboard admin).

### Estado de Stripe

Stripe **no está implementado** en el MVP. El administrador de la plataforma activa los planes directamente en la DB modificando el campo `subscriptionPlan` en la tabla `companies`. Cuando se integre Stripe en el futuro, el webhook deberá actualizar ese mismo campo.

### Constantes de planes

Definidas en `lib/plan-limits.ts`:
```typescript
PLAN_LIMITS = {
  free:    { maxEmployees: 5,  maxDistinctCourses: 3,        certificates: false },
  starter: { maxEmployees: 20, maxDistinctCourses: Infinity, certificates: true  },
  pro:     { maxEmployees: 50, maxDistinctCourses: Infinity, certificates: true  },
}
```

Helper: `getPlanLimits(plan: string): PlanLimits`

---

## 3. Roles y Permisos

### Los tres roles del sistema

| Rol | Descripción | Workspace |
|---|---|---|
| `admin` | Administrador de la plataforma. Gestiona todo. | `/workspace/admin` |
| `company` | Manager de empresa. Gestiona empleados y ve progreso. | `/workspace/company` |
| `student` | Empleado de una empresa. Toma cursos. | `/workspace/student` |

Los roles se almacenan en la tabla `roles` con un campo `permissions` (array JSON). Un usuario puede pertenecer a múltiples empresas con distintos roles.

### Árbol de permisos

```
platform:admin  → platform:write → platform:read
company:admin   → company:write  → company:read
                → company:billing → company:read
users:manage    → users:write, users:invite, users:remove → users:read
courses:manage  → courses:write, courses:create, courses:delete, courses:publish → courses:read
courses:enroll  → courses:read
courses:edit    → courses:write → courses:read
content:create  → content:read
```

### Permisos por rol (típicos)

**admin:** `platform:admin`, `users:manage`, `courses:manage`, `content:create`

**company:** `company:admin`, `users:invite`, `users:remove`, `courses:read`, `content:read`

**student:** `courses:enroll`, `courses:read`, `content:read`

### Cómo funciona el middleware

El middleware (`middleware.ts`) verifica el `accessToken` cookie en cada request protegido y:
1. Decodifica el JWT con `verifyAccessTokenEdge` (jose, edge-compatible).
2. Llama a `validateRouteAccess(permissions, pathname)` para confirmar acceso.
3. Inyecta `x-user-id`, `x-company-id`, `x-user-permissions` como **request headers** (no response) para que los route handlers los usen sin re-verificar el token.
4. Redirige al workspace correcto si el usuario accede a una ruta que no le corresponde.

---

## 4. Flujos de Usuario

### 4.1 Registro y acceso

#### Flujo completo de un nuevo estudiante (vía invitación)

```
1. Admin crea la empresa
      POST /api/admin/companies
      
2. Admin o Company Manager invita al empleado
      POST /api/auth/invite
      → Verifica límite de empleados según plan (PLAN_LIMITS.maxEmployees)
      → Genera token de 7 días
      → Envía email con link: /accept-invite?token=XXX
      
3. Empleado acepta invitación
      GET /accept-invite?token=XXX  →  página de registro
      POST /api/auth/accept-invite
      → Crea cuenta (si no existe) con passwordHash
      → Crea relación user_companies con el roleId de "student"
      → Marca token como usado (isUsed = true)
      
4. Empleado hace login
      POST /api/auth/login
      → Verifica email + password (bcrypt)
      → Verifica emailVerified = true (403 si no)
      → Verifica cuenta activa y no bloqueada
      → Retorna accessToken (15 min) + refreshToken (7 días) en httpOnly cookies
      → Redirige a /workspace/student
```

#### Flujo de registro directo (sign-up)

```
1. Usuario llena formulario en /sign-up
      POST /api/auth/register
      → Valida email + password (validatePassword de lib/auth-shared.ts)
      → Crea usuario con emailVerified = false
      → Envía email con token de verificación
      
2. Usuario verifica email
      GET /verify-email?token=XXX
      POST /api/auth/verify-email
      → Marca emailVerified = true
      
3. Usuario hace login (mismo flujo de arriba)
```

#### Flujo de reset de contraseña

```
1. /forgot-password → POST /api/auth/forgot-password
      → Genera token de reset, envía email
      
2. /reset-password?token=XXX → POST /api/auth/reset-password
      → Valida token, actualiza passwordHash
      → Actualiza passwordChangedAt (invalida tokens JWT anteriores)
```

### 4.2 Flujo de un estudiante tomando un curso

```
1. Explorar catálogo
      GET /workspace/student/catalog
      → Muestra cursos públicos (isPublic = true) o asignados a su empresa

2. Inscribirse en un curso
      POST /api/courses/{id}/enroll
      → Verifica permiso courses:enroll
      → Verifica visibilidad del curso para la empresa
      → Verifica límite de cursos del plan (Free: max 3 distintos en la empresa)
      → Crea fila en enroll_course con progress = 0
      
3. Tomar el curso
      GET /workspace/student/courses/{id}
      → Muestra módulos y lecciones
      → Marca capítulos completados via:
      PUT /api/courses/{id}/enroll
      { completedChapters: [...], progress: 75, isCompleted: false }
      
4. Completar el curso
      PUT /api/courses/{id}/enroll
      { progress: 100, isCompleted: true }
      → Registra completedAt
      → Si plan permite certificados: genera certificado automáticamente
         (INSERT en certificates con certificateId único)
      → Si plan es free: no genera certificado, solo registra completado
      
5. Ver certificado (Starter/Pro)
      GET /workspace/student/certificates
      → Certificado con link público para compartir: /certificates/{certificateId}
```

### 4.3 Flujo de un Company Manager

```
Login → /workspace/company/dashboard
  ├── Ver estadísticas de la empresa (empleados, cursos, progreso)
  ├── /company/employees
  │     ├── Ver lista de empleados activos
  │     └── Invitar empleado (con verificación de límite de plan)
  ├── /company/courses
  │     └── Ver cursos disponibles para la empresa
  ├── /company/progress
  │     └── Ver progreso de cada empleado en cada curso
  ├── /company/certificates
  │     └── Ver certificados emitidos a empleados
  └── /company/profile
        └── Editar datos de la empresa (nombre, logo, industria, etc.)
```

### 4.4 Flujo del Admin

```
Login → /workspace/admin
  ├── Dashboard: stats globales (usuarios, empresas, cursos, enrollments)
  ├── /admin/users
  │     ├── Crear usuarios
  │     ├── Editar usuarios
  │     └── Asignar a empresas con roles
  ├── /admin/companies
  │     ├── Crear empresas
  │     ├── Editar empresa (incluyendo subscriptionPlan para activar plan)
  │     └── Filtrar por plan (free / starter / pro)
  ├── /admin/courses
  │     ├── Crear curso (wizard: info básica → módulos → visibilidad → revisión)
  │     ├── Editar curso
  │     ├── Publicar / desactivar
  │     └── Asignar visibilidad (público, privado, por empresa)
  ├── /admin/enrollments
  │     └── Ver y gestionar todas las inscripciones
  └── /admin/certificates
        ├── Ver todos los certificados
        ├── Emitir certificado retroactivo
        ├── Revocar certificado
        └── Reemitir certificado revocado
```

### 4.5 Flujo de refresh de token

```
accessToken expira (15 min)
→ AuthContext detecta 401
→ Llama POST /api/auth/refresh con refreshToken cookie
→ Verifica refreshToken:
    - Firma válida
    - No expirado (7 días)
    - tokenVersion en DB coincide con JWT
    - passwordChangedAt < iat (no cambió contraseña)
→ Emite nuevo accessToken (15 min)
→ Retry del request original
```

### 4.6 Flujo de logout

```
POST /api/auth/logout
→ Incrementa tokenVersion del usuario en DB (invalida todos los refresh tokens)
→ Borra cookies accessToken y refreshToken
→ Redirige a /sign-in
```

---

## 5. Stack Técnico

| Categoría | Tecnología | Versión | Uso |
|---|---|---|---|
| Framework | Next.js | 15.x | App Router, SSR, API routes |
| UI | React | 18.x | Componentes |
| Lenguaje | TypeScript | 5.x | Tipo estático |
| Base de datos | PostgreSQL (Neon) | — | DB serverless |
| ORM | Drizzle ORM | 0.44.x | Queries type-safe |
| Auth | jsonwebtoken | 9.x | Generación JWT (server-only) |
| Auth edge | jose | 6.x | Verificación JWT en middleware |
| Hashing | bcryptjs | 3.x | Contraseñas |
| Email | Nodemailer | 7.x | SMTP (Mailtrap dev / SendGrid prod) |
| Componentes UI | Radix UI | Latest | Headless components |
| Estilos | Tailwind CSS | 4.x | Utility-first |
| Iconos | Lucide React | 0.511.x | Íconos |
| Notificaciones | Sonner | 2.x | Toast notifications |
| Markdown | React Markdown | 8.x | Rendering de contenido |
| Video | React YouTube | 10.x | Embeds de YouTube |
| Sanitización | DOMPurify | 3.x | HTML seguro |
| Validación | Zod | 4.x | Schema validation |
| HTTP client | Axios | 1.9.x | Requests del cliente |
| Dark mode | next-themes | 0.4.x | Tema oscuro/claro |
| Tests unitarios | Jest | 30.x | Unit/integration tests |
| Tests componentes | Testing Library | 16.x | Component testing |
| Tests E2E | Playwright | 1.57.x | End-to-end tests |

---

## 6. Arquitectura del Proyecto

```
app/
  (auth)/               # Páginas públicas: sign-in, sign-up, reset-password
  api/
    auth/               # login, register, logout, refresh, verify-email,
    │                   # forgot-password, reset-password, invite, accept-invite,
    │                   # switch-company, validate
    admin/              # users, companies, enrollments, certificates, reports
    company/            # profile, create-for-user
    courses/[id]/       # enroll (GET/POST/PUT/DELETE)
    student/            # courses, stats
    user/               # perfil del usuario autenticado
  workspace/
    admin/              # Dashboard, users, companies, courses, enrollments, certificates
    company/            # Dashboard, employees, courses, progress, certificates, profile
    student/            # Dashboard, catalog, courses, certificates, profile
    _components/        # Nav compartido entre workspaces
  types/index.ts        # Todos los tipos TypeScript centralizados

config/
  schema.ts             # Definición de todas las tablas Drizzle + relaciones
  db.ts                 # Instancia Drizzle (neon-http driver)

lib/
  auth.ts               # JWT generation/verification — SERVER ONLY (import "server-only")
  auth-edge.ts          # JWT verification edge-compatible (jose) — para middleware
  auth-shared.ts        # validatePassword() — importar desde aquí siempre
  constants.ts          # API_ROUTES, PAGE_ROUTES, UI_TEXT, fetchWithTimeout
  csrf.ts               # HMAC-signed double-submit CSRF tokens
  database.ts           # Drizzle db instance alternativa — SERVER ONLY
  permissions.ts        # PERMISSION_HIERARCHY, validateRouteAccess, getMostRestrictiveRole
  rate-limit.ts         # Rate limiting en memoria por IP
  plan-limits.ts        # PLAN_LIMITS, getPlanLimits() — reglas de los planes
  enums/
    subscription.ts     # SubscriptionPlan (free/starter/pro), SubscriptionStatus
    index.ts            # Re-exports de todos los enums
  config/
    security.ts         # SECURITY_CONFIG (bcrypt rounds, etc.)

context/
  AuthContext.tsx       # Estado auth del cliente + lógica de refresh

hooks/                  # Hooks de data-fetching por dominio
  use-admin.ts
  use-admin-users.ts
  use-admin-companies.ts
  use-courses.ts
  use-student.ts
  use-company.ts
  use-company-profile.ts
  use-csrf-token.ts     # Hook para obtener CSRF token

scripts/
  seed.ts               # Datos iniciales: roles, admin user, empresa demo
  setup-env.js          # Genera .env.local desde template

middleware.ts           # Autenticación, autorización, security headers, HTTPS redirect
```

---

## 7. Base de Datos

### Tablas principales

#### `users`
Cuentas de usuario.
- `id` UUID PK
- `email` único
- `name`
- `passwordHash` nullable (null = login social futuro)
- `emailVerified` boolean
- `isActive` boolean
- `tokenVersion` integer — se incrementa en logout para invalidar refresh tokens
- `passwordChangedAt` timestamp — se verifica en refresh para invalidar tokens viejos
- `lastLoginAt`, `phone`, `location`, `bio`, `age`

#### `companies`
Organizaciones suscritas.
- `id` UUID PK
- `name`, `rut`, `description`, `logo`, `website`, `industry`, `size`
- `isActive` boolean
- `subscriptionPlan` varchar — `'free'` | `'starter'` | `'pro'` (default: `'free'`)
- `subscriptionExpiresAt` timestamp

#### `roles`
Roles RBAC del sistema.
- `id` UUID PK
- `name` — `'admin'` | `'company'` | `'student'`
- `permissions` jsonb array — lista de strings de permisos
- `isSystemRole` boolean

#### `user_companies`
Relación N-to-N usuarios ↔ empresas.
- `userId` FK → users
- `companyId` FK → companies
- `roleId` FK → roles
- `isActive` boolean
- `invitedBy` FK → users
- `joinedAt`, `acceptedAt`
- Índice único: `user_company_idx` (userId, companyId)

#### `courses`
Cursos del catálogo.
- `id` UUID PK, `cid` varchar
- `name`, `description`, `category`, `difficulty`, `level`
- `numberOfChapters`, `estimatedDuration`
- `courseJson` jsonb — estructura de módulos/lecciones
- `modules` json
- `isPublic` boolean — visibilidad pública
- `isActive` boolean
- `visibility` — `'public'` | `'private'` | `'company'`
- `targetCompanies` json — lista de companyIds si visibility = 'company'
- `createdBy` FK → users
- `companyId` FK → companies (nullable, para cursos de empresa)
- `bannerImage`, `status`

#### `enroll_course`
Inscripciones de estudiantes.
- `courseId` FK → courses, `userId` FK → users, `companyId` FK → companies
- `progress` numeric (0–100)
- `isCompleted` boolean, `completedAt` timestamp
- `completedChapters` json — array de IDs de capítulos completados
- `enrolledAt`, `updatedAt`
- Índice único: `user_course_idx` (courseId, userId) — previene duplicados

#### `certificates`
Certificados emitidos.
- `certificateId` varchar único — ID público para compartir
- `courseId`, `userId`, `companyId` FK
- `title`, `description`, `grade` (0–100)
- `issuedDate`, `completedDate`, `duration`
- `isActive` boolean — false = revocado
- Índice único: `user_certificate_idx` (userId, courseId) — un cert por usuario/curso

#### `subscriptions`
Suscripciones Stripe (preparado para cuando se integre).
- `companyId` FK → companies
- `stripeCustomerId`, `stripeSubscriptionId`, `stripePriceId`
- `status` — `'active'` | `'inactive'` | `'cancelled'` | `'past_due'` | `'trialing'`
- `planName` — `'free'` | `'starter'` | `'pro'`
- `currentPeriodStart`, `currentPeriodEnd`, `cancelAtPeriodEnd`, `trialEnd`

#### `invitation_tokens`
Tokens de invitación por email.
- `email`, `companyId`, `roleId`, `invitedBy` FK
- `token` varchar único
- `expiresAt` timestamp (7 días desde creación)
- `isUsed` boolean, `usedAt`

#### `settings`
Configuraciones del sistema en DB.
- `key` único, `value`, `category`, `description`, `isEncrypted`

---

## 8. Mapa de API Routes

### Auth (públicas, sin CSRF)
| Method | Route | Descripción |
|---|---|---|
| POST | `/api/auth/login` | Login con email+password. Retorna JWT cookies. |
| POST | `/api/auth/register` | Registro. Envía email de verificación. |
| POST | `/api/auth/logout` | Limpia cookies, incrementa tokenVersion. |
| POST | `/api/auth/refresh` | Renueva accessToken usando refreshToken. |
| POST | `/api/auth/verify-email` | Verifica email con token. |
| POST | `/api/auth/forgot-password` | Genera token de reset. |
| POST | `/api/auth/reset-password` | Aplica nueva contraseña. |
| POST | `/api/auth/invite` | Invita empleado a empresa (verifica límite de plan). |
| POST | `/api/auth/accept-invite` | Acepta invitación y crea cuenta. |
| POST | `/api/auth/switch-company` | Cambia contexto de empresa (multi-empresa). |
| GET  | `/api/auth/validate` | Verifica sesión activa, retorna datos del usuario. |

### Cursos
| Method | Route | Descripción |
|---|---|---|
| GET  | `/api/courses` | Lista cursos (filtrada por rol/empresa). |
| POST | `/api/courses/{id}/enroll` | Inscribirse (verifica límite de plan). |
| GET  | `/api/courses/{id}/enroll` | Ver progreso del curso. |
| PUT  | `/api/courses/{id}/enroll` | Actualizar progreso (genera cert si completa). |
| DELETE | `/api/courses/{id}/enroll` | Desinscribirse (solo si no está completado). |

### Admin (requieren `platform:admin`)
| Method | Route | Descripción |
|---|---|---|
| GET/POST | `/api/admin/users` | Listar / crear usuarios. |
| GET/PUT/DELETE | `/api/admin/users/{id}` | Ver / editar / eliminar usuario. |
| POST | `/api/admin/users/create` | Crear usuario con empresa y rol. |
| GET/POST | `/api/admin/companies` | Listar / crear empresas. |
| GET/PUT | `/api/admin/companies/{id}` | Ver / editar empresa (incl. subscriptionPlan). |
| GET/POST | `/api/admin/enrollments` | Listar / crear inscripciones manualmente. |
| GET | `/api/admin/certificates` | Listar todos los certificados. |
| POST | `/api/admin/certificates/{id}/reissue` | Reemitir certificado. |
| POST | `/api/admin/certificates/{id}/revoke` | Revocar certificado. |
| GET | `/api/admin/reports` | Reportes: users-active, financial-monthly, financial-plans, etc. |

### Company (requieren `company:admin`)
| Method | Route | Descripción |
|---|---|---|
| GET/PUT | `/api/company/profile` | Ver / editar perfil de empresa. |
| POST | `/api/company/create-for-user` | Crear empresa y asignar al usuario actual. |

### Usuario
| Method | Route | Descripción |
|---|---|---|
| GET/PUT | `/api/user` | Ver / editar perfil del usuario autenticado. |

---

## 9. Seguridad

### Autenticación
- **JWT access token:** 15 minutos de vida. httpOnly cookie `accessToken`. Firmado con `JWT_SECRET`.
- **JWT refresh token:** 7 días de vida. httpOnly cookie `refreshToken`. Firmado con `REFRESH_TOKEN_SECRET`.
- **SameSite:** Cookies configuradas con `SameSite=Strict`.
- **tokenVersion:** Entero en `users` tabla. Se incrementa en logout. El refresh route verifica que el `tokenVersion` del JWT coincida con la DB — invalida todos los refresh tokens anteriores.
- **passwordChangedAt:** Timestamp en `users`. Si el usuario cambió contraseña después de que se emitió el token, el refresh falla.
- **Account lockout:** 5 intentos fallidos → cuenta bloqueada 15 minutos. Gestionado en memoria por IP.
- **Timing-safe login:** Siempre se ejecuta bcrypt.compare aunque el usuario no exista (con hash dummy) para evitar timing attacks.

### CSRF
- Double-submit cookie pattern con HMAC-SHA256.
- Token: `timestamp:random:signature`.
- Enviado en cookie `csrf_token` + header `x-csrf-token`.
- **Rutas exentas:** login, register, refresh, forgot-password, verify-email, accept-invite.
- **Todas las mutaciones** (POST/PUT/DELETE) deben incluir el header.
- Hook cliente: `use-csrf-token.ts`.

### Headers de Seguridad (todas las respuestas)
```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(), camera=(), payment=(), usb=()
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://js.stripe.com; ...
Strict-Transport-Security: max-age=31536000; includeSubDomains  (solo en producción)
```

### Rate Limiting
- En memoria, por IP.
- Aplicado en auth endpoints (login, register, invite, refresh).
- Configurado en `lib/rate-limit.ts`.

### Validaciones críticas
- **Passwords:** Siempre usar `validatePassword()` de `lib/auth-shared.ts`. Nunca validar inline.
- **UUIDs:** Usar `validateUUID()` de `lib/validation.ts` en todos los parámetros de ruta.
- **Paginación:** Siempre `Math.min(100, Math.max(1, limit))`.
- **Fetch cliente:** Siempre usar `fetchWithTimeout` de `lib/constants.ts`, no `fetch` directo.
- **Drizzle `and()`:** Si alguna condición puede ser `undefined`, verificar antes de pasarla — `and(undefined)` silenciosamente elimina la condición, causando bypass de autorización (IDOR).
- **Open redirects:** Validar que URLs de redirección comiencen con `/` y no con `//`.

### Headers internos (solo request, nunca response)
El middleware pasa al route handler:
- `x-user-id` — ID del usuario autenticado
- `x-company-id` — ID de la empresa activa
- `x-user-permissions` — JSON array de permisos

Nunca exponer estos headers en respuestas HTTP al cliente.

---

## 10. Configuración y Comandos

### Variables de entorno requeridas

```bash
DATABASE_URL              # Neon PostgreSQL: postgres://...
JWT_SECRET                # Mínimo 32 caracteres
REFRESH_TOKEN_SECRET      # Mínimo 32 caracteres
CSRF_SECRET               # Opcional, usa JWT_SECRET si no está
COOKIE_SECRET             # Para session management
SMTP_HOST                 # Ej: smtp.mailtrap.io
SMTP_PORT                 # Ej: 587
SMTP_USER                 # Credenciales SMTP
SMTP_PASS
EMAIL_FROM                # ej: noreply@tudominio.com
SUPPORT_EMAIL
NODE_ENV                  # development | production
NEXT_PUBLIC_APP_URL       # http://localhost:3000 (dev)
NEXT_PUBLIC_API_URL       # http://localhost:3000 (dev)
```

### Comandos de desarrollo

```bash
npm run dev               # Servidor de desarrollo
npm run build             # Build de producción (incluye lint + TS check)
npm run lint              # ESLint

# Base de datos
npm run db:generate       # Generar migraciones desde schema.ts
npm run db:migrate        # Aplicar migraciones
npm run db:push           # Push directo del schema (sin migraciones)
npm run db:studio         # Abrir Drizzle Studio UI
npm run db:setup          # Seed: roles + admin user + empresa demo
npm run db:test           # Verificar conexión a DB

# Tests
npm test                  # Todos los tests Jest
npm run test:watch        # Modo watch
npm run test:coverage     # Con cobertura (umbral 70%)
npm run test:unit         # Solo unit tests
npm run test:integration  # Tests de integración
npm run test:e2e          # Playwright E2E
npm run test:e2e:headed   # E2E con browser visible

# Test individual
npx jest __tests__/api/auth.test.ts
npx jest --testNamePattern="should login successfully"
```

### Setup inicial (proyecto nuevo)

```bash
cp .env.example .env.local   # o usar: node scripts/setup-env.js
npm install
npm run db:push              # Crear tablas
npm run db:setup             # Seed: admin user + roles
npm run dev
```

**Admin por defecto creado por seed:** Ver `scripts/seed.ts` para credenciales de desarrollo.

---

## 11. Estado del MVP

### Implementado y funcional
- ✅ Auth completo (JWT, refresh, logout, email verification, password reset)
- ✅ RBAC con 3 roles (admin, company, student)
- ✅ Gestión de empresas y empleados
- ✅ Invitación de empleados por email (con límite de plan)
- ✅ Catálogo de cursos con módulos, lecciones y video YouTube
- ✅ Enrollment con límite por plan (Free: máx 3 cursos distintos por empresa)
- ✅ Tracking de progreso por capítulo
- ✅ Emisión automática de certificados al completar (gated por plan)
- ✅ Gestión de certificados (admin: emitir, revocar, reemitir)
- ✅ Dashboards por rol con estadísticas
- ✅ CSRF, rate limiting, bcrypt, cookies httpOnly, security headers
- ✅ Multi-empresa (un usuario puede pertenecer a varias empresas)

### No implementado (fuera del MVP actual)
- ❌ **Stripe:** Tabla preparada, sin rutas de pago. El admin activa planes manualmente.
- ❌ **Upload de archivos:** `lib/storage.ts` existe pero sin endpoints de upload.
- ❌ **Google Gemini AI:** API keys configuradas pero sin integración.
- ❌ **Soporte tickets:** Páginas de soporte son placeholders.
- ❌ **Búsqueda avanzada:** Solo listados simples, sin full-text search.
- ❌ **Notificaciones en tiempo real:** Sin WebSocket.

### Deuda técnica conocida
- Errores de TypeScript pre-existentes en tests (tipos de Jest-dom, módulos faltantes de Stripe/support).
- Cobertura de tests incompleta: falta cubrir certificados, employee management, course creation.
- Logs de debug con emojis en código de producción.

---

## 12. Reglas de Negocio Consolidadas

Estas reglas deben respetarse en **cualquier cambio de código**.

### Autenticación
1. Nunca almacenar tokens en localStorage. Solo httpOnly cookies.
2. El accessToken dura 15 minutos. El refreshToken dura 7 días.
3. Logout siempre incrementa `tokenVersion` en DB.
4. Cambio de contraseña siempre actualiza `passwordChangedAt`.
5. Login falla si `emailVerified = false` (403, no 401).
6. Login falla si `isActive = false`.
7. Siempre ejecutar bcrypt aunque el usuario no exista (anti-timing).

### Invitaciones y empleados
8. Antes de crear invitación, verificar que la empresa no superó `PLAN_LIMITS[plan].maxEmployees`.
9. El conteo de empleados se hace sobre `user_companies` donde `isActive = true`.
10. Un token de invitación dura 7 días y solo puede usarse una vez (`isUsed`).
11. No enviar nueva invitación si ya existe una pendiente (no usada) para el mismo email+empresa.

### Enrollment
12. Un estudiante no puede inscribirse dos veces en el mismo curso (ON CONFLICT DO NOTHING).
13. Para plan `free`: verificar que `COUNT(DISTINCT courseId)` en `enroll_course` para la empresa sea < 3 antes de permitir el enrollment en un curso nuevo.
14. Para planes `starter`/`pro`: sin límite de cursos.
15. Un estudiante no puede desinscribirse de un curso ya completado.

### Certificados
16. El certificado se genera automáticamente cuando `isCompleted = true` y no existía uno previo.
17. Solo se genera si `getPlanLimits(plan).certificates === true`.
18. Plan `free`: no genera certificados.
19. Admin puede emitir certificados retroactivamente sin verificar el plan.
20. Revocar = `isActive = false` (soft delete). Reemitir = `isActive = true`.
21. `certificateId` es UUID único público para compartir (`/certificates/{certificateId}`).
22. Índice único `user_certificate_idx` en (userId, courseId) previene duplicados a nivel DB.

### Cursos
23. Solo el admin puede crear, editar y publicar cursos.
24. Visibilidad: `public` = todos los estudiantes, `private` = solo empresa propietaria, `company` = empresas específicas en `targetCompanies`.
25. Un curso inactivo (`isActive = false`) no aparece en el catálogo ni admite enrollment.

### Permisos y autorización
26. Los permisos se verifican en el route handler, no solo en middleware.
27. El middleware pasa permisos como `x-user-permissions` (request header, nunca response).
28. Nunca pasar `undefined` a `and()` en Drizzle — elimina la condición silenciosamente.
29. Validar siempre UUIDs de parámetros de ruta con `validateUUID()`.

### Planes
30. El campo autoritativo del plan es `companies.subscriptionPlan` (varchar).
31. Sin Stripe: el admin edita `subscriptionPlan` directamente en la empresa.
32. Con Stripe (futuro): el webhook actualiza `companies.subscriptionPlan`, no el check de la tabla `subscriptions`.
33. Los límites de plan están centralizados en `lib/plan-limits.ts` — no duplicar esa lógica.

---

*Última actualización: 2026-05-27*
