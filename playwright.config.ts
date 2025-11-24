import { defineConfig, devices } from '@playwright/test';

/**
 * Configuración de Playwright para Tests E2E
 * Ver https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  // Directorio donde están los tests E2E
  testDir: './__tests__/e2e',
  
  // Ejecutar tests en paralelo
  fullyParallel: true,
  
  // Fallar build si hay tests con .only en CI
  forbidOnly: !!process.env.CI,
  
  // Reintentos en CI
  retries: process.env.CI ? 2 : 0,
  
  // Workers (threads) para ejecutar tests
  workers: process.env.CI ? 1 : undefined,
  
  // Reporter: HTML para local, GitHub para CI
  reporter: process.env.CI ? 'github' : 'html',
  
  // Configuración compartida para todos los tests
  use: {
    // Base URL para requests
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',
    
    // Captura de trazas en el primer reintento
    trace: 'on-first-retry',
    
    // Screenshots en caso de fallo
    screenshot: 'only-on-failure',
    
    // Video solo en el primer reintento
    video: 'retain-on-failure',
    
    // Timeout para navegación
    navigationTimeout: 30000,
    
    // Timeout para acciones
    actionTimeout: 10000,
  },

  // Configurar timeout global
  timeout: 60000, // 60 segundos por test
  expect: {
    timeout: 5000, // 5 segundos para assertions
  },

  // Configuración de proyectos (browsers)
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    // Tests en mobile
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  // Servidor web para tests
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000, // 2 minutos para iniciar
    stdout: 'ignore',
    stderr: 'pipe',
  },
});

