# 🧪 Estrategia de Testing Completa para MVP

**Fecha:** 2025-11-23  
**Estado del Proyecto:** MVP Estabilizado  
**Objetivo:** Cobertura de tests progresiva y práctica

---

## 📊 Estado Actual del Testing

### ✅ Ya Implementado

| Tipo | Herramienta | Archivos | Estado |
|------|-------------|----------|--------|
| **Unitarios** | Jest + RTL | 9 archivos | ✅ Funcional |
| **Integración** | Jest | 3 archivos | ✅ Funcional |
| **E2E** | - | 0 archivos | ❌ Falta |

### 📈 Cobertura Actual

- **Tests Unitarios:** ~135 tests (componentes, hooks, utilidades)
- **Tests Integración:** Auth + Courses + UUID validation
- **Cobertura de Código:** 70% configurado como mínimo

---

## 🎯 Estrategia Recomendada (Pirámide de Testing)

```
         /\        E2E Tests (10%)
        /  \       - Flujos críticos
       /----\      - Happy paths principales
      /  🔴  \     
     /--------\    Integration Tests (30%)
    /    🟡    \   - APIs completas
   /------------\  - Flujos de negocio
  /     🟢      \ Unit Tests (60%)
 /________________\ - Componentes
                    - Hooks
                    - Utils
```

### Prioridad para MVP

1. **🟢 Tests Unitarios** (60% del esfuerzo)
2. **🟡 Tests de Integración** (30% del esfuerzo)
3. **🔴 Tests E2E** (10% del esfuerzo)

---

## 📋 Plan de Acción Priorizado

### FASE 1: Completar Tests Unitarios Críticos (Alta Prioridad)

**Tiempo estimado:** 2-3 días

#### 1.1 Tests de API Routes (CRÍTICO)

```typescript
// __tests__/api/auth/login.test.ts
// __tests__/api/auth/register.test.ts
// __tests__/api/courses/route.test.ts
// __tests__/api/company/employees/route.test.ts
// __tests__/api/billing/subscription/route.test.ts
```

**Prioridad:** 🔴 ALTA  
**Razón:** Las APIs son el core del MVP

#### 1.2 Tests de Hooks Faltantes

```typescript
// __tests__/hooks/use-courses.test.ts
// __tests__/hooks/use-billing.test.ts
// __tests__/hooks/use-company-profile.test.ts
// __tests__/hooks/use-certificates.test.ts
```

**Prioridad:** 🟡 MEDIA  
**Razón:** Los hooks controlan la lógica de negocio en el frontend

#### 1.3 Tests de Validación y Seguridad

```typescript
// __tests__/lib/password-utils.test.ts
// __tests__/lib/csrf.test.ts
// __tests__/lib/uuid-validator.test.ts
// __tests__/lib/user-validation.test.ts
```

**Prioridad:** 🔴 ALTA  
**Razón:** La seguridad es crítica

---

### FASE 2: Extender Tests de Integración (Media Prioridad)

**Tiempo estimado:** 3-4 días

#### 2.1 Tests de Flujos de Negocio Completos

```typescript
// __tests__/integration/billing.integration.test.ts
// - Crear suscripción
// - Actualizar plan
// - Cancelar suscripción
// - Recibir webhooks de Stripe

// __tests__/integration/enrollment.integration.test.ts
// - Inscribirse a curso
// - Completar capítulos
// - Generar certificado

// __tests__/integration/company.integration.test.ts
// - Crear empresa
// - Invitar empleados
// - Gestionar permisos
// - Ver estadísticas
```

**Prioridad:** 🟡 MEDIA  
**Razón:** Validan flujos completos del MVP

#### 2.2 Tests de Permisos y Autorización

```typescript
// __tests__/integration/permissions.integration.test.ts
// - Admin puede todo
// - Company admin limitado a su empresa
// - Student solo sus cursos
// - Rechazar accesos no autorizados
```

**Prioridad:** 🔴 ALTA  
**Razón:** Seguridad de acceso

---

### FASE 3: Implementar Tests E2E (Baja Prioridad)

**Tiempo estimado:** 2-3 días

#### 3.1 Configurar Playwright

```bash
npm install -D @playwright/test
npx playwright install
```

```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './__tests__/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

#### 3.2 Tests E2E Críticos para MVP

```typescript
// __tests__/e2e/auth-flow.e2e.test.ts
// - Usuario puede registrarse
// - Usuario puede iniciar sesión
// - Usuario puede cerrar sesión

// __tests__/e2e/course-enrollment.e2e.test.ts
// - Estudiante navega catálogo
// - Estudiante se inscribe a curso
// - Estudiante completa lecciones
// - Estudiante obtiene certificado

// __tests__/e2e/company-dashboard.e2e.test.ts
// - Admin ve dashboard
// - Admin invita empleado
// - Admin ve estadísticas
// - Admin descarga reportes

// __tests__/e2e/billing-flow.e2e.test.ts
// - Empresa ve planes
// - Empresa inicia suscripción
// - Redirección a Stripe
// - Webhook actualiza estado
```

**Prioridad:** 🟢 BAJA (post-MVP)  
**Razón:** Nice to have, pero tests de integración cubren la mayoría

---

## 🛠️ Templates de Tests

### Template: Test Unitario de API Route

```typescript
// __tests__/api/courses/[id]/route.test.ts
import { GET, PUT, DELETE } from '@/app/api/courses/[id]/route';
import { NextRequest } from 'next/server';

// Mock de dependencias
jest.mock('@/config/db');
jest.mock('@/lib/auth');

describe('API: GET /api/courses/[id]', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('debería retornar un curso por ID', async () => {
    // Arrange
    const mockCourse = {
      id: 'test-uuid',
      name: 'Test Course',
      description: 'Test Description',
    };
    
    (db.select as jest.Mock).mockResolvedValue([mockCourse]);
    (verifyAccessToken as jest.Mock).mockResolvedValue({
      userId: 'user-id',
      permissions: ['courses:read'],
    });

    const req = new NextRequest('http://localhost/api/courses/test-uuid');

    // Act
    const response = await GET(req, { params: { id: 'test-uuid' } });
    const data = await response.json();

    // Assert
    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toEqual(mockCourse);
  });

  it('debería retornar 404 si el curso no existe', async () => {
    // Arrange
    (db.select as jest.Mock).mockResolvedValue([]);
    
    const req = new NextRequest('http://localhost/api/courses/invalid-id');

    // Act
    const response = await GET(req, { params: { id: 'invalid-id' } });
    const data = await response.json();

    // Assert
    expect(response.status).toBe(404);
    expect(data.success).toBe(false);
  });

  it('debería retornar 401 sin autenticación', async () => {
    // Arrange
    (verifyAccessToken as jest.Mock).mockResolvedValue(null);
    
    const req = new NextRequest('http://localhost/api/courses/test-uuid');

    // Act
    const response = await GET(req, { params: { id: 'test-uuid' } });

    // Assert
    expect(response.status).toBe(401);
  });
});
```

### Template: Test de Integración

```typescript
// __tests__/integration/enrollment-flow.integration.test.ts
import { db } from '@/config/db';
import { enrollCourseTable, certificatesTable } from '@/config/schema';

describe('Enrollment Flow Integration', () => {
  let testUser: any;
  let testCourse: any;

  beforeAll(async () => {
    // Setup: Crear datos de prueba
    testUser = await db.insert(usersTable).values({
      email: 'test@example.com',
      name: 'Test User',
    }).returning();

    testCourse = await db.insert(coursesTable).values({
      name: 'Test Course',
      numberOfChapters: 5,
    }).returning();
  });

  afterAll(async () => {
    // Cleanup: Limpiar datos de prueba
    await db.delete(enrollCourseTable).where(eq(enrollCourseTable.userId, testUser.id));
    await db.delete(usersTable).where(eq(usersTable.id, testUser.id));
  });

  it('debería inscribir usuario, completar curso y generar certificado', async () => {
    // 1. Inscribirse al curso
    const enrollment = await db.insert(enrollCourseTable).values({
      userId: testUser.id,
      courseId: testCourse.id,
      progress: 0,
    }).returning();

    expect(enrollment[0]).toBeDefined();
    expect(enrollment[0].progress).toBe(0);

    // 2. Completar capítulos
    await db.update(enrollCourseTable)
      .set({ progress: 100, isCompleted: true })
      .where(eq(enrollCourseTable.id, enrollment[0].id));

    // 3. Generar certificado
    const certificate = await db.insert(certificatesTable).values({
      userId: testUser.id,
      courseId: testCourse.id,
      certificateId: `CERT-${Date.now()}`,
      title: 'Certificate Title',
      grade: 95,
    }).returning();

    expect(certificate[0]).toBeDefined();
    expect(certificate[0].grade).toBe(95);
  });
});
```

### Template: Test E2E con Playwright

```typescript
// __tests__/e2e/auth-flow.e2e.test.ts
import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('usuario puede registrarse e iniciar sesión', async ({ page }) => {
    // 1. Navegar a registro
    await page.goto('/register');

    // 2. Llenar formulario
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'Test1234!');
    await page.fill('input[name="confirmPassword"]', 'Test1234!');
    await page.fill('input[name="name"]', 'Test User');

    // 3. Submit
    await page.click('button[type="submit"]');

    // 4. Verificar redirección
    await expect(page).toHaveURL('/workspace/student/dashboard');

    // 5. Verificar elementos del dashboard
    await expect(page.locator('h1')).toContainText('Dashboard');
  });

  test('usuario no puede acceder sin autenticación', async ({ page }) => {
    // 1. Intentar acceder a ruta protegida
    await page.goto('/workspace/student/dashboard');

    // 2. Verificar redirección a login
    await expect(page).toHaveURL('/login');
  });
});
```

---

## 📊 Priorización de Tests por Módulo

### 🔴 CRÍTICO (Implementar YA)

1. **Autenticación (API Routes)**
   - Login/Logout/Register
   - Token validation/refresh
   - Password reset

2. **Billing (Stripe)**
   - Webhooks
   - Subscription CRUD
   - Invoice generation

3. **Permisos y Autorización**
   - Role-based access
   - Company-scoped access
   - Admin vs User permissions

### 🟡 IMPORTANTE (Implementar en 1 semana)

4. **Cursos (CRUD completo)**
   - Create/Read/Update/Delete
   - Enrollment
   - Progress tracking

5. **Certificados**
   - Generation
   - Validation
   - Download

6. **Empresa (Company Management)**
   - Employee invitations
   - Statistics
   - Profile management

### 🟢 DESEABLE (Post-MVP)

7. **Soporte**
   - Ticket creation
   - Messages

8. **Reportes**
   - Dashboard statistics
   - Export data

---

## 🚀 Scripts NPM Sugeridos

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:unit": "jest __tests__/(components|hooks|lib)",
    "test:integration": "jest __tests__/integration",
    "test:api": "jest __tests__/api",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:debug": "playwright test --debug",
    "test:all": "npm run test && npm run test:e2e",
    "test:ci": "npm run test:coverage && npm run test:e2e"
  }
}
```

---

## 🎯 Métricas de Éxito

### Para Lanzamiento MVP

- ✅ Cobertura de código: **≥ 70%**
- ✅ Tests API críticas: **100%**
- ✅ Tests de autenticación: **100%**
- ✅ Tests de billing: **100%**
- ⚠️ Tests E2E: **≥ 5 flujos críticos**

### Post-MVP

- ✅ Cobertura de código: **≥ 80%**
- ✅ Tests E2E: **≥ 15 flujos**
- ✅ Tests de performance: **≥ 5**
- ✅ Tests de accesibilidad: **≥ 10**

---

## 📖 Guías y Best Practices

### General

1. **Seguir patrón AAA:** Arrange, Act, Assert
2. **Tests independientes:** No depender de orden de ejecución
3. **Nombres descriptivos:** `should do X when Y`
4. **Mock externo, test interno:** Mockear APIs externas, DB, etc.
5. **Tests rápidos:** Unitarios < 50ms, Integración < 500ms

### Específico por Tipo

#### Tests Unitarios
- Mockear todas las dependencias
- Probar una sola cosa por test
- Cubrir casos edge y errores

#### Tests de Integración
- Usar base de datos de test
- Limpiar datos después de cada test
- Probar flujos completos

#### Tests E2E
- Solo happy paths y casos críticos
- Usar datos de prueba realistas
- Limpiar estado entre tests

---

## 🔧 Herramientas Recomendadas

### Ya Instaladas ✅
- **Jest** - Framework de testing
- **React Testing Library** - Tests de componentes
- **@testing-library/user-event** - Simulación de eventos
- **node-mocks-http** - Mock de requests HTTP

### Por Instalar 📦

```bash
# Para E2E
npm install -D @playwright/test

# Para tests visuales (opcional)
npm install -D @storybook/react

# Para coverage badges (opcional)
npm install -D jest-coverage-badges

# Para tests de performance (opcional)
npm install -D lighthouse
```

---

## 📅 Cronograma Sugerido

| Semana | Actividad | Tiempo |
|--------|-----------|--------|
| 1 | Tests unitarios API críticas | 16h |
| 2 | Tests integración billing + enrollment | 16h |
| 3 | Tests unitarios hooks + validación | 12h |
| 4 | Tests E2E flujos principales | 12h |
| 5 | Ajustes y cobertura final | 8h |

**Total:** ~64 horas (~2 semanas de trabajo)

---

## ✅ Checklist de Implementación

### Esta Semana
- [ ] Crear tests para `/api/auth/login`
- [ ] Crear tests para `/api/auth/register`
- [ ] Crear tests para `/api/billing/webhooks`
- [ ] Crear tests para `use-courses` hook
- [ ] Crear tests para `password-utils`

### Próxima Semana
- [ ] Tests de integración: billing flow completo
- [ ] Tests de integración: enrollment flow
- [ ] Tests unitarios: hooks faltantes
- [ ] Configurar Playwright para E2E

### Mes 1
- [ ] 5 tests E2E de flujos críticos
- [ ] Cobertura ≥ 75%
- [ ] CI/CD con tests automáticos
- [ ] Documentation de tests actualizada

---

**Siguiente Paso Recomendado:** Empezar con tests de API Routes críticas (auth y billing).

**Archivo sugerido:** `__tests__/api/auth/login.test.ts`

