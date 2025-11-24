/**
 * Tests E2E: Flujo de Autenticación
 * Prioridad: CRÍTICA
 * 
 * Tests end-to-end completos del flujo de autenticación:
 * - Registro de usuario
 * - Login
 * - Logout
 * - Protección de rutas
 */

import { test, expect } from '@playwright/test';

// Datos de prueba únicos por ejecución
const testUser = {
  email: `test-e2e-${Date.now()}@example.com`,
  password: 'Test1234!',
  name: 'E2E Test User',
};

test.describe('Flujo de Autenticación E2E', () => {
  
  test.beforeEach(async ({ page }) => {
    // Limpiar cookies y storage antes de cada test
    await page.context().clearCookies();
    await page.context().clearPermissions();
  });

  test('debería completar el flujo de registro exitosamente', async ({ page }) => {
    // 1. Navegar a la página de registro
    await page.goto('/register');
    await expect(page).toHaveURL('/register');
    await expect(page.locator('h1')).toContainText(/registro|registrarse|crear cuenta/i);

    // 2. Llenar el formulario de registro
    await page.fill('input[name="name"]', testUser.name);
    await page.fill('input[name="email"]', testUser.email);
    await page.fill('input[name="password"]', testUser.password);
    await page.fill('input[name="confirmPassword"]', testUser.password);

    // 3. Verificar que el botón de submit esté habilitado
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeEnabled();

    // 4. Submit del formulario
    await submitButton.click();

    // 5. Esperar redirección (debería ir a dashboard o verify-email)
    await page.waitForURL(/\/(workspace|verify-email|dashboard)/);

    // 6. Verificar que el usuario está autenticado
    const cookies = await page.context().cookies();
    const hasAccessToken = cookies.some(cookie => cookie.name === 'accessToken');
    expect(hasAccessToken).toBeTruthy();
  });

  test('debería iniciar sesión con credenciales válidas', async ({ page }) => {
    // Nota: Este test asume que el usuario ya fue registrado en el test anterior
    
    // 1. Navegar a login
    await page.goto('/login');
    await expect(page).toHaveURL('/login');

    // 2. Llenar formulario
    await page.fill('input[name="email"]', testUser.email);
    await page.fill('input[name="password"]', testUser.password);

    // 3. Click en login
    await page.click('button[type="submit"]');

    // 4. Esperar redirección al dashboard
    await page.waitForURL(/\/workspace/);

    // 5. Verificar que estamos en el workspace
    await expect(page.locator('body')).toContainText(/dashboard|inicio|bienvenido/i);

    // 6. Verificar cookies de sesión
    const cookies = await page.context().cookies();
    expect(cookies.some(c => c.name === 'accessToken')).toBeTruthy();
    expect(cookies.some(c => c.name === 'refreshToken')).toBeTruthy();
  });

  test('debería mostrar error con credenciales incorrectas', async ({ page }) => {
    // 1. Navegar a login
    await page.goto('/login');

    // 2. Intentar login con password incorrecta
    await page.fill('input[name="email"]', testUser.email);
    await page.fill('input[name="password"]', 'WrongPassword123!');
    await page.click('button[type="submit"]');

    // 3. Verificar mensaje de error
    await expect(page.locator('text=/error|incorrecto|inválido/i')).toBeVisible({
      timeout: 5000,
    });

    // 4. Verificar que no hay cookies de sesión
    const cookies = await page.context().cookies();
    expect(cookies.some(c => c.name === 'accessToken')).toBeFalsy();
  });

  test('debería cerrar sesión correctamente', async ({ page, context }) => {
    // 1. Primero hacer login
    await page.goto('/login');
    await page.fill('input[name="email"]', testUser.email);
    await page.fill('input[name="password"]', testUser.password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/workspace/);

    // 2. Verificar que tenemos cookies
    let cookies = await context.cookies();
    expect(cookies.some(c => c.name === 'accessToken')).toBeTruthy();

    // 3. Hacer logout (buscar botón de logout)
    const logoutButton = page.locator('button:has-text("Cerrar sesión"), button:has-text("Logout"), a:has-text("Salir")').first();
    await logoutButton.click();

    // 4. Esperar redirección a login
    await page.waitForURL('/login', { timeout: 10000 });

    // 5. Verificar que las cookies fueron eliminadas
    cookies = await context.cookies();
    expect(cookies.some(c => c.name === 'accessToken')).toBeFalsy();
  });

  test('debería proteger rutas privadas sin autenticación', async ({ page }) => {
    // 1. Intentar acceder a ruta protegida sin login
    await page.goto('/workspace/student/dashboard');

    // 2. Debería redirigir a login
    await expect(page).toHaveURL('/login');

    // 3. Verificar que no podemos acceder
    await expect(page.locator('h1')).not.toContainText(/dashboard/i);
  });

  test('debería mantener sesión después de recargar página', async ({ page, context }) => {
    // 1. Login
    await page.goto('/login');
    await page.fill('input[name="email"]', testUser.email);
    await page.fill('input[name="password"]', testUser.password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/workspace/);

    // 2. Recargar página
    await page.reload();

    // 3. Verificar que seguimos autenticados
    await expect(page).toHaveURL(/\/workspace/);
    
    // 4. Verificar cookies
    const cookies = await context.cookies();
    expect(cookies.some(c => c.name === 'accessToken')).toBeTruthy();
  });
});

test.describe('Flujo de Navegación Post-Login', () => {
  test.beforeEach(async ({ page }) => {
    // Setup: Login antes de cada test
    await page.goto('/login');
    await page.fill('input[name="email"]', testUser.email);
    await page.fill('input[name="password"]', testUser.password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/workspace/);
  });

  test('debería navegar al dashboard correctamente', async ({ page }) => {
    // El beforeEach ya nos lleva al workspace
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('debería acceder a la página de perfil', async ({ page }) => {
    // 1. Buscar link/botón de perfil
    const profileLink = page.locator('a[href*="profile"], button:has-text("Perfil")').first();
    await profileLink.click();

    // 2. Verificar que estamos en perfil
    await expect(page).toHaveURL(/\/profile/);
    await expect(page.locator('text=/perfil|profile/i')).toBeVisible();
  });

  test('debería mostrar nombre del usuario en la UI', async ({ page }) => {
    // Verificar que el nombre del usuario aparece en algún lugar de la UI
    await expect(page.locator(`text=${testUser.name}`)).toBeVisible({
      timeout: 10000,
    });
  });
});

test.describe('Validación de Formularios', () => {
  test('debería validar formato de email en registro', async ({ page }) => {
    await page.goto('/register');
    
    // Intentar con email inválido
    await page.fill('input[name="email"]', 'invalid-email');
    await page.fill('input[name="password"]', 'Test1234!');
    await page.fill('input[name="confirmPassword"]', 'Test1234!');
    await page.fill('input[name="name"]', 'Test User');
    
    // El botón debería estar deshabilitado o mostrar error
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();
    
    // Debe mostrar error o no permitir submit
    await expect(page.locator('text=/email.*válido|correo.*inválido/i')).toBeVisible({
      timeout: 5000,
    });
  });

  test('debería validar contraseñas coincidentes en registro', async ({ page }) => {
    await page.goto('/register');
    
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'Test1234!');
    await page.fill('input[name="confirmPassword"]', 'DifferentPassword!');
    await page.fill('input[name="name"]', 'Test User');
    
    await page.click('button[type="submit"]');
    
    // Debe mostrar error de contraseñas no coincidentes
    await expect(page.locator('text=/contraseñas.*coinciden|passwords.*match/i')).toBeVisible({
      timeout: 5000,
    });
  });

  test('debería validar fortaleza de contraseña', async ({ page }) => {
    await page.goto('/register');
    
    // Contraseña débil
    await page.fill('input[name="password"]', '123456');
    
    // Debe mostrar indicador de contraseña débil
    await expect(page.locator('text=/débil|weak|requisitos/i')).toBeVisible({
      timeout: 5000,
    });
  });
});

test.describe('Responsive Design', () => {
  test('debería funcionar en mobile', async ({ page }) => {
    // Configurar viewport mobile
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/login');
    
    // Verificar que el formulario es visible y usable
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    
    // Hacer login
    await page.fill('input[name="email"]', testUser.email);
    await page.fill('input[name="password"]', testUser.password);
    await page.click('button[type="submit"]');
    
    await page.waitForURL(/\/workspace/);
    await expect(page.locator('body')).toBeVisible();
  });
});

