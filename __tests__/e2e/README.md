# 🎭 Tests E2E con Playwright

Tests end-to-end para validar flujos completos de usuario en la plataforma.

## 🚀 Instalación

```bash
# Instalar Playwright
npm install -D @playwright/test

# Instalar browsers
npx playwright install

# Instalar dependencias de sistema (Linux/WSL)
npx playwright install-deps
```

## 🧪 Ejecutar Tests

```bash
# Todos los tests E2E
npm run test:e2e

# Con UI interactiva
npm run test:e2e:ui

# En modo debug
npm run test:e2e:debug

# Solo un archivo específico
npx playwright test auth-flow.e2e.test.ts

# Solo un browser específico
npx playwright test --project=chromium

# En modo headed (ver el browser)
npx playwright test --headed
```

## 📁 Estructura

```
__tests__/e2e/
├── auth-flow.e2e.test.ts           # Login, registro, logout
├── course-enrollment.e2e.test.ts   # Inscripción a cursos (por crear)
├── company-dashboard.e2e.test.ts   # Dashboard empresa (por crear)
├── billing-flow.e2e.test.ts        # Flujo de facturación (por crear)
└── README.md                       # Esta documentación
```

## 🎯 Tests Implementados

### ✅ Auth Flow (auth-flow.e2e.test.ts)

- [x] Registro de usuario
- [x] Login con credenciales válidas
- [x] Error con credenciales incorrectas
- [x] Logout
- [x] Protección de rutas privadas
- [x] Persistencia de sesión
- [x] Navegación post-login
- [x] Validación de formularios
- [x] Responsive design

## 📝 Crear Nuevo Test E2E

```typescript
import { test, expect } from '@playwright/test';

test.describe('Nombre del Flujo', () => {
  test.beforeEach(async ({ page }) => {
    // Setup antes de cada test
    await page.goto('/');
  });

  test('descripción del test', async ({ page }) => {
    // 1. Arrange - Preparar
    await page.goto('/mi-pagina');

    // 2. Act - Ejecutar acción
    await page.click('button');

    // 3. Assert - Verificar
    await expect(page.locator('h1')).toContainText('Éxito');
  });
});
```

## 🔍 Selectores Útiles

```typescript
// Por texto
page.locator('text=Login');

// Por rol
page.getByRole('button', { name: 'Submit' });

// Por placeholder
page.getByPlaceholder('Email');

// Por label
page.getByLabel('Password');

// Por data-testid
page.getByTestId('submit-button');

// CSS selector
page.locator('button[type="submit"]');

// Combinados
page.locator('button:has-text("Login")');
```

## 🎨 Best Practices

### 1. Tests Independientes
Cada test debe poder ejecutarse solo y en cualquier orden.

### 2. Datos Únicos
Usar timestamps para datos únicos:
```typescript
const testUser = {
  email: `test-${Date.now()}@example.com`,
};
```

### 3. Esperas Explícitas
Siempre esperar por elementos antes de interactuar:
```typescript
await page.waitForSelector('button');
await page.click('button');
```

### 4. Assertions Claras
Usar assertions específicas y descriptivas:
```typescript
await expect(page.locator('h1')).toContainText('Dashboard');
await expect(page).toHaveURL('/workspace/dashboard');
```

### 5. Cleanup
Limpiar estado antes/después de cada test:
```typescript
test.beforeEach(async ({ page }) => {
  await page.context().clearCookies();
});
```

## 🐛 Debugging

### Ver el Browser Durante Tests
```bash
npx playwright test --headed --slowMo=1000
```

### Pausar Ejecución
```typescript
await page.pause(); // Abre Playwright Inspector
```

### Screenshots
```typescript
await page.screenshot({ path: 'screenshot.png' });
```

### Trace Viewer
```bash
# Grabar traces
npx playwright test --trace on

# Ver traces
npx playwright show-trace trace.zip
```

### Debug con VS Code
1. Instalar extensión "Playwright Test for VSCode"
2. Click en el ícono de play al lado del test
3. Usar breakpoints normalmente

## 📊 Reports

```bash
# Generar reporte HTML
npx playwright test --reporter=html

# Ver último reporte
npx playwright show-report

# Report para CI
npx playwright test --reporter=github
```

## 🔧 Configuración

La configuración está en `playwright.config.ts`:

- **Timeout:** 60s por test, 5s por assertion
- **Retries:** 2 en CI, 0 en local
- **Browsers:** Chromium, Firefox, Safari
- **Mobile:** Chrome y Safari mobile
- **Base URL:** http://localhost:3000
- **Screenshots:** Solo en fallo
- **Videos:** Solo en retry

## 🌐 Browsers Soportados

| Browser | Desktop | Mobile |
|---------|---------|--------|
| Chromium | ✅ | ✅ |
| Firefox | ✅ | ❌ |
| WebKit (Safari) | ✅ | ✅ |

## 📚 Recursos

- [Documentación Playwright](https://playwright.dev)
- [API Reference](https://playwright.dev/docs/api/class-playwright)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Ejemplos](https://github.com/microsoft/playwright/tree/main/examples)

## ✅ Checklist Pre-Deploy

- [ ] Todos los tests E2E pasan
- [ ] Tests en múltiples browsers
- [ ] Tests en mobile
- [ ] Screenshots de fallos revisados
- [ ] Traces analizados si hay fallos intermitentes
- [ ] Coverage de flujos críticos ≥ 80%

---

**Próximos Tests a Implementar:**
1. `course-enrollment.e2e.test.ts` - Flujo completo de inscripción
2. `company-dashboard.e2e.test.ts` - Dashboard y gestión de empresa
3. `billing-flow.e2e.test.ts` - Suscripciones y pagos

