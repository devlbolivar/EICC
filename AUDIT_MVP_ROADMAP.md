# Auditoría Técnica y Roadmap MVP - EICC

**Fecha:** 2025-11-18
**Versión:** 1.0
**Estado:** Auditoría Completa

---

## Resumen Ejecutivo

### Estado General del Proyecto

| Aspecto | Puntuación | Estado |
|---------|------------|--------|
| **Funcionalidad Core** | 75% | Funcional con gaps |
| **Seguridad** | 60% | Requiere correcciones críticas |
| **Estabilidad Frontend** | 65% | Varios flujos rotos |
| **Calidad de Código** | 70% | Inconsistencias en tipos |
| **Documentación** | 80% | Buena pero desactualizada |

### Veredicto: NO LISTO PARA PRODUCCIÓN

El proyecto tiene una base sólida pero presenta **showstoppers críticos** que deben resolverse antes del lanzamiento.

---

## Sección 1: Showstoppers Críticos

### 1.1 Vulnerabilidad de Seguridad en Stripe Webhooks

**Severidad:** 🔴 CRÍTICA
**Archivo:** `/app/api/billing/webhooks/route.ts:35`

```typescript
// ❌ PROBLEMA: Fallback a string vacío permite webhooks falsos
event = stripe.webhooks.constructEvent(
  body,
  signature,
  process.env.STRIPE_WEBHOOK_SECRET || ""  // CRÍTICO
);
```

**Impacto:** Un atacante puede enviar webhooks falsos para:
- Activar suscripciones sin pago
- Modificar planes de usuarios
- Fraude financiero

**Corrección:**
```typescript
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
if (!webhookSecret) {
  console.error("STRIPE_WEBHOOK_SECRET is not configured");
  return NextResponse.json(
    { error: "Webhook configuration error" },
    { status: 500 }
  );
}

event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
```

---

### 1.2 Página de Billing Completamente Rota

**Severidad:** 🔴 CRÍTICA
**Archivo:** `/app/workspace/company/billing/page.tsx:25-26`

```typescript
// ❌ PROBLEMA: useCompany() solo retorna { isCompany }
const { company, employees } = useCompany(); // company = undefined
const companyId = company?.id; // undefined - página no funciona
```

**Impacto:** La página de facturación de empresa no carga. Los usuarios no pueden:
- Ver su plan actual
- Gestionar suscripción
- Ver límites de uso

**Corrección:**
```typescript
import { useCompanyProfile } from "@/hooks/use-company-profile";
import { useCompanyEmployees } from "@/hooks/use-company-employees";

export default function BillingPage() {
  const { company, loading: companyLoading } = useCompanyProfile();
  const { employees, loading: employeesLoading } = useCompanyEmployees();

  const companyId = company?.id;
  const employeeUsage = checkUsageLimit("employees", employees?.length || 0);
  // ...
}
```

---

### 1.3 Autenticación Insegura por Headers

**Severidad:** 🔴 CRÍTICA
**Archivo:** `/app/api/student/courses/route.ts:9`

```typescript
// ❌ PROBLEMA: Headers pueden ser manipulados por el cliente
const userId = req.headers.get("x-user-id");
```

**Impacto:** Cualquier usuario puede acceder a cursos de otros usuarios modificando el header.

**Corrección:**
```typescript
import { cookies } from "next/headers";
import { verifyAccessToken } from "@/lib/auth";

export async function GET(req: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken");

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = verifyAccessToken(token.value);
  if (!payload) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  const userId = payload.userId;
  // ...
}
```

---

### 1.4 Drizzle ORM/Kit Desincronizados

**Severidad:** 🔴 CRÍTICA
**Archivo:** `/package.json`

```json
{
  "drizzle-orm": "^0.43.1",  // v0.43
  "drizzle-kit": "^0.31.1"   // v0.31 - 12 versiones atrás
}
```

**Impacto:**
- Migraciones pueden fallar
- Incompatibilidad de schemas
- Bugs difíciles de diagnosticar

**Corrección:**
```bash
npm install --save-dev drizzle-kit@^0.43
```

---

### 1.5 TypeScript/ESLint Errors Ignorados en Build

**Severidad:** 🟠 ALTA
**Archivo:** `/next.config.js:3-7`

```javascript
eslint: {
  ignoreDuringBuilds: true,  // ❌ Oculta errores
},
typescript: {
  ignoreBuildErrors: true,   // ❌ Oculta errores
},
```

**Impacto:** Errores de tipo y linting se despliegan a producción sin detectar.

**Corrección:**
```javascript
eslint: {
  ignoreDuringBuilds: false,
},
typescript: {
  ignoreBuildErrors: false,
},
```

---

## Sección 2: Dependencias y Variables de Entorno

### 2.1 Variables de Entorno Críticas

| Variable | Requerida | Validación | Riesgo |
|----------|-----------|------------|--------|
| `JWT_SECRET` | ✅ | ✅ | Bajo |
| `DATABASE_URL` | ✅ | ⚠️ Fallback inseguro | Medio |
| `STRIPE_SECRET_KEY` | ✅ | ⚠️ Dummy key | Alto |
| `STRIPE_WEBHOOK_SECRET` | ✅ | ❌ Fallback vacío | **Crítico** |
| `GOOGLE_GENERATIVE_AI_API_KEY` | ✅ | ❌ Sin validar | Medio |

### 2.2 Dependencias sin Implementación

```
- Rate Limiting: Documentado pero NO implementado
- CSRF Protection: Documentado pero NO implementado
- Logging estructurado: NO existe (recomendado: winston/pino)
```

### 2.3 Riesgos de Estabilidad

1. **API de Google GenAI (^0.14.1)**: Versión beta, API puede cambiar
2. **Sin Dockerización**: Dificulta despliegue consistente
3. **Sin CI/CD pipeline**: Riesgo de regresiones

---

## Sección 3: Características Faltantes para MVP

### 3.1 Funcionalidades Core Incompletas

| Característica | Estado | Impacto |
|----------------|--------|---------|
| Rate Limiting | ❌ No implementado | Vulnerable a ataques de fuerza bruta |
| CSRF Protection | ❌ No implementado | Vulnerable a ataques CSRF |
| Email Verification | ❌ No implementado | Usuarios sin verificar |
| Sistema de Soporte | 📋 Solo mockup | Sin funcionalidad real |
| Reportes/Analytics | 📋 Solo mockup | Sin datos reales |

### 3.2 Flujos de Usuario Incompletos

| Flujo | Estado | Problema |
|-------|--------|----------|
| **Registro → Verificación** | ❌ Roto | Redirige a `/verify-email` que no existe |
| **Billing (Empresa)** | ❌ Roto | Destructuring error, datos undefined |
| **Soporte (Todos)** | 📋 Mockup | 3 páginas sin API backend |
| **Cambio de Contraseña** | ❌ Incompleto | Frontend existe, sin endpoint |
| **Actualizar Perfil** | ❌ Incompleto | Sin persistencia real |

### 3.3 Páginas que son Solo Mockups

1. `/workspace/student/support/page.tsx` - 100% mockup
2. `/workspace/company/support/page.tsx` - 100% mockup
3. `/workspace/admin/support/page.tsx` - 100% mockup
4. `/workspace/student/profile/page.tsx` - Parcialmente mockup

---

## Sección 4: Inconsistencias Lógicas y Arquitectónicas

### 4.1 Inconsistencias de Naming Convention

**Problema:** El schema usa camelCase pero queries SQL raw usan snake_case.

| Schema | SQL Raw | Archivos Afectados |
|--------|---------|-------------------|
| `userId` | `"user_id"` | 6+ archivos |
| `companyId` | `"company_id"` | 4+ archivos |
| `courseId` | `"course_id"` | 3+ archivos |

**Archivos con problemas:**
- `/app/api/certificates/route.ts` (líneas 45, 48, 53, 56)
- `/app/api/courses/[id]/enroll/route.ts` (líneas 57, 86-92)
- `/app/api/company/statistics/route.ts` (líneas 13-14, 32)

### 4.2 Tipos con `any` sin tipar

**Archivo:** `/hooks/use-courses.ts`
```typescript
completedChapters?: any         // Debería ser Record<string, boolean>
pagination: any                  // Debería ser PaginationInfo
```

### 4.3 Transformaciones de Campos sin Documentar

**Archivo:** `/app/api/student/courses/route.ts:17-31`
```typescript
coursesTable.name → title           // Sin comentario
coursesTable.bannerImage → image    // Sin comentario
coursesTable.numberOfChapters → totalChapters  // Sin comentario
```

---

## Sección 5: Discrepancias Documentación vs Implementación

| Documentación Promete | Realidad |
|-----------------------|----------|
| Rate limiting implementado | ❌ No existe |
| CSRF tokens implementado | ❌ No existe |
| Seguridad 90% | ⚠️ ~60% con críticos |
| Admin dashboard funcional | ⚠️ Parcialmente conectado |
| Email verification | ❌ No implementado |

---

## Sección 6: Problemas de Seguridad

### 6.1 Vulnerabilidades por OWASP

| # | Vulnerabilidad | OWASP | Severidad | Archivo |
|---|----------------|-------|-----------|---------|
| 1 | Stripe webhook sin validar | A02:2021 | 🔴 Crítico | `billing/webhooks/route.ts:35` |
| 2 | Sin rate limiting | A05:2021 | 🟠 Alto | Rutas de auth |
| 3 | Headers con info sensible | A01:2021 | 🟠 Alto | `middleware.ts:197-209` |
| 4 | Password débil en admin | A07:2021 | 🟠 Alto | `admin/users/create/route.ts:53` |
| 5 | Sin CSRF protection | A01:2021 | 🟡 Medio | Rutas DELETE/POST |

### 6.2 Logging de Datos Sensibles

**Archivos afectados:**
- `/app/api/user/statistics/route.ts:135-152` - Expone emails
- `/app/api/courses/[id]/enroll/route.ts:76-82` - Expone IDs y emails

---

## Plan de Acción Priorizado para MVP

### Fase 1: Showstoppers Críticos (Semana 1)

| # | Tarea | Archivo | Esfuerzo |
|---|-------|---------|----------|
| 1 | Fijar Stripe webhook secret | `billing/webhooks/route.ts` | 1h |
| 2 | Fijar página billing (useCompany) | `company/billing/page.tsx` | 2h |
| 3 | Reemplazar auth por headers | `student/courses/route.ts` | 2h |
| 4 | Sincronizar drizzle-kit | `package.json` | 30min |
| 5 | Habilitar TypeScript errors en build | `next.config.js` | 30min + correcciones |

**Entregable:** Aplicación sin errores críticos de seguridad.

---

### Fase 2: Seguridad y Estabilidad (Semana 2)

| # | Tarea | Archivos | Esfuerzo |
|---|-------|----------|----------|
| 6 | Implementar rate limiting | `lib/rate-limit.ts` + rutas auth | 4h |
| 7 | Remover headers sensibles | `middleware.ts` | 1h |
| 8 | Fijar localStorage en SSR | 3 hooks | 2h |
| 9 | Remover logs de datos sensibles | 2 archivos | 1h |
| 10 | Validar UUID en todos los endpoints | Multiple | 2h |

**Entregable:** Seguridad aceptable para MVP.

---

### Fase 3: Flujos de Usuario (Semana 3)

| # | Tarea | Archivos | Esfuerzo |
|---|-------|----------|----------|
| 11 | Crear página /verify-email | Nueva página | 4h |
| 12 | Implementar API de soporte | 3 endpoints + páginas | 8h |
| 13 | Completar cambio de contraseña | Endpoint + frontend | 3h |
| 14 | Fijar actualización de perfil | `student/profile/page.tsx` | 2h |
| 15 | Agregar AbortController a hooks | 5 hooks | 3h |

**Entregable:** Todos los flujos de usuario completos.

---

### Fase 4: Calidad de Código (Semana 4)

| # | Tarea | Archivos | Esfuerzo |
|---|-------|----------|----------|
| 16 | Unificar naming convention | Schema + queries | 4h |
| 17 | Tipar correctamente (eliminar any) | Hooks | 3h |
| 18 | Documentar transformaciones | APIs | 2h |
| 19 | Implementar CSRF protection | Middleware | 4h |
| 20 | Agregar logging estructurado | Nueva lib | 4h |

**Entregable:** Código mantenible y seguro.

---

### Fase 5: DevOps y Deployment (Semana 5)

| # | Tarea | Archivos | Esfuerzo |
|---|-------|----------|----------|
| 21 | Crear Dockerfile | Nuevo archivo | 2h |
| 22 | Crear docker-compose.yml | Nuevo archivo | 2h |
| 23 | Configurar CI/CD básico | GitHub Actions | 4h |
| 24 | Testing E2E crítico | Tests | 8h |
| 25 | Documentar deployment | README | 2h |

**Entregable:** MVP desplegable y testeado.

---

## Apéndice A: Correcciones Detalladas

### A.1 Fijar Stripe Webhook (Crítico)

```typescript
// /app/api/billing/webhooks/route.ts

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing signature" },
      { status: 400 }
    );
  }

  // ✅ CORRECCIÓN: No usar fallback
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET not configured");
    return NextResponse.json(
      { error: "Server configuration error" },
      { status: 500 }
    );
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
  }

  // ... resto del código
}
```

### A.2 Fijar Billing Page

```typescript
// /app/workspace/company/billing/page.tsx

"use client";

import { useCompanyProfile } from "@/hooks/use-company-profile";
import { useCompanyEmployees } from "@/hooks/use-company-employees";
import { useBilling } from "@/hooks/use-billing";

export default function BillingPage() {
  const { company, loading: companyLoading, error: companyError } = useCompanyProfile();
  const { employees, loading: employeesLoading } = useCompanyEmployees();
  const { subscription, loading: billingLoading } = useBilling();

  const isLoading = companyLoading || employeesLoading || billingLoading;

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (companyError || !company) {
    return <ErrorMessage message="Error loading company data" />;
  }

  const companyId = company.id;
  const employeeCount = employees?.length || 0;
  const employeeUsage = checkUsageLimit("employees", employeeCount);

  // ... resto del componente
}
```

### A.3 Rate Limiting Middleware

```typescript
// /lib/rate-limit.ts

import { NextResponse } from "next/server";

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export function rateLimit(config: RateLimitConfig) {
  return async function middleware(req: Request): Promise<NextResponse | null> {
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    const key = `${ip}:${new URL(req.url).pathname}`;
    const now = Date.now();

    const record = rateLimitStore.get(key);

    if (!record || now > record.resetTime) {
      rateLimitStore.set(key, {
        count: 1,
        resetTime: now + config.windowMs,
      });
      return null;
    }

    if (record.count >= config.maxRequests) {
      return NextResponse.json(
        { error: "Too many requests" },
        { status: 429 }
      );
    }

    record.count++;
    return null;
  };
}

// Uso en rutas de auth:
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  maxRequests: 5,
});
```

### A.4 Fijar localStorage en SSR

```typescript
// /hooks/use-admin-companies.ts (y otros hooks similares)

const getToken = (): string | null => {
  // ✅ CORRECCIÓN: Verificar que estamos en el cliente
  if (typeof window === "undefined") {
    return null;
  }

  const token = localStorage.getItem("accessToken");
  return token || null;
};
```

---

## Apéndice B: Métricas de Éxito

### Para considerar el MVP completo:

1. **Seguridad:** 0 vulnerabilidades críticas, 0 altas
2. **Funcionalidad:** 100% flujos de usuario funcionando
3. **Estabilidad:** 0 errores de TypeScript en build
4. **Testing:** >70% coverage en rutas críticas
5. **Performance:** Tiempo de carga <3s

---

## Conclusión

El proyecto EICC tiene una arquitectura sólida y moderna, pero presenta **5 showstoppers críticos** que impiden su lanzamiento a producción. Con las correcciones propuestas en este roadmap, estimamos **5 semanas de trabajo** para alcanzar un MVP funcional y seguro.

**Prioridades inmediatas:**
1. Seguridad de pagos (Stripe webhooks)
2. Flujos de usuario rotos (billing, auth)
3. Rate limiting y CSRF
4. Testing y deployment

---

*Documento generado por auditoría técnica automatizada*
*Proyecto: EICC - Plataforma de E-Learning*
