// Configuración para diferentes tipos de tests

export const TEST_CONFIG = {
  // Timeouts
  TIMEOUTS: {
    SHORT: 1000,
    MEDIUM: 3000,
    LONG: 5000,
    VERY_LONG: 10000,
  },

  // Datos de prueba
  TEST_DATA: {
    USER: {
      id: "test-user-id",
      email: "test@example.com",
      name: "Test User",
      avatar: null,
      emailVerified: true,
      isActive: true,
      lastLoginAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    COMPANY: {
      id: "test-company-id",
      name: "Test Company",
      rut: "12345678-9",
      isActive: true,
      subscriptionPlan: "free",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    COURSE: {
      id: "test-course-id",
      cid: "test-course-cid",
      name: "Test Course",
      description: "This is a test course",
      numberOfChapters: 5,
      includeVideos: true,
      difficulty: "beginner",
      category: "programming",
      bannerImage: "/test-banner.jpg",
      courseContent: [],
      createdBy: "test-user-id",
      companyId: "test-company-id",
      isPublic: true,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  },

  // Permisos de prueba
  PERMISSIONS: {
    ADMIN: ["platform:admin", "users:manage"],
    COMPANY: ["company:admin", "courses:create", "users:invite"],
    STUDENT: ["courses:read", "courses:enroll", "content:read"],
  },

  // Rutas de prueba
  ROUTES: {
    ADMIN: "/workspace/admin",
    COMPANY: "/workspace/company/dashboard",
    STUDENT: "/workspace/student",
    LOGIN: "/sign-in",
    REGISTER: "/sign-up",
  },

  // Configuración de mocks
  MOCKS: {
    // Mock de fetch para API calls
    FETCH: {
      SUCCESS: (data: any) =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(data),
          status: 200,
        }),
      ERROR: (error: string) =>
        Promise.resolve({
          ok: false,
          json: () => Promise.resolve({ error }),
          status: 400,
        }),
      UNAUTHORIZED: () =>
        Promise.resolve({
          ok: false,
          json: () => Promise.resolve({ error: "Unauthorized" }),
          status: 401,
        }),
    },

    // Mock de localStorage
    LOCAL_STORAGE: {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
    },

    // Mock de sessionStorage
    SESSION_STORAGE: {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
    },
  },

  // Utilidades de testing
  UTILS: {
    // Esperar por un elemento
    waitForElement: (selector: string, timeout = 5000) => {
      return new Promise((resolve, reject) => {
        const startTime = Date.now();

        const checkElement = () => {
          const element = document.querySelector(selector);
          if (element) {
            resolve(element);
            return;
          }

          if (Date.now() - startTime > timeout) {
            reject(
              new Error(`Element ${selector} not found within ${timeout}ms`)
            );
            return;
          }

          setTimeout(checkElement, 100);
        };

        checkElement();
      });
    },

    // Simular delay
    delay: (ms: number) => new Promise((resolve) => setTimeout(resolve, ms)),

    // Limpiar mocks
    clearMocks: () => {
      jest.clearAllMocks();
      localStorage.clear();
      sessionStorage.clear();
    },

    // Mock de console para reducir ruido en tests
    mockConsole: () => {
      const originalConsole = { ...console };

      beforeEach(() => {
        console.log = jest.fn();
        console.warn = jest.fn();
        console.error = jest.fn();
      });

      afterEach(() => {
        console.log = originalConsole.log;
        console.warn = originalConsole.warn;
        console.error = originalConsole.error;
      });
    },
  },

  // Configuración de cobertura
  COVERAGE: {
    THRESHOLDS: {
      global: {
        branches: 70,
        functions: 70,
        lines: 70,
        statements: 70,
      },
    },
    EXCLUDE: [
      "**/*.d.ts",
      "**/node_modules/**",
      "**/coverage/**",
      "**/dist/**",
      "**/.next/**",
    ],
  },
};

// Configuración específica para diferentes entornos
export const ENV_CONFIG = {
  TEST: {
    NODE_ENV: "test",
    JWT_SECRET: "test-secret-key",
    DATABASE_URL: "postgresql://test:test@localhost:5432/test",
  },
  DEVELOPMENT: {
    NODE_ENV: "development",
    JWT_SECRET: "dev-secret-key",
    DATABASE_URL: "postgresql://dev:dev@localhost:5432/dev",
  },
  PRODUCTION: {
    NODE_ENV: "production",
    JWT_SECRET: process.env.JWT_SECRET,
    DATABASE_URL: process.env.DATABASE_URL,
  },
};

// Configuración de tests por categoría
export const TEST_CATEGORIES = {
  UNIT: {
    description: "Tests unitarios de funciones y componentes individuales",
    pattern: "**/*.test.ts",
    timeout: 5000,
  },
  INTEGRATION: {
    description: "Tests de integración entre componentes",
    pattern: "**/*.integration.test.ts",
    timeout: 10000,
  },
  E2E: {
    description: "Tests end-to-end de flujos completos",
    pattern: "**/*.e2e.test.ts",
    timeout: 30000,
  },
};

// Configuración de mocks globales
export const GLOBAL_MOCKS = {
  // Mock de Next.js Image
  "next/image": () => "img",

  // Mock de Next.js Link - usando función que retorna un objeto en lugar de JSX
  "next/link": ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => ({
    type: "a",
    props: { href, children },
  }),

  // Mock de Next.js router
  "next/navigation": {
    useRouter: () => ({
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    }),
    usePathname: () => "/",
    useSearchParams: () => new URLSearchParams(),
  },

  // Mock de sonner (toast)
  sonner: {
    toast: {
      success: jest.fn(),
      error: jest.fn(),
      warning: jest.fn(),
      info: jest.fn(),
    },
  },
};
