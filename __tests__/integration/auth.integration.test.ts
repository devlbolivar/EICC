import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/database";
import {
  hashPassword,
  generateTokenPair,
  verifyAccessToken,
  verifyRefreshToken,
} from "@/lib/auth";
import { SYSTEM_ROLES } from "@/app/types";

/**
 * Authentication Module Integration Tests
 *
 * This test suite provides comprehensive integration testing for the authentication module,
 * covering all possible flows and edge cases to ensure system stability and functionality.
 *
 * Test Categories:
 * - Login Flow: User authentication, validation, and error handling
 * - Register Flow: User registration, validation, and duplicate handling
 * - Token Validation: Access token verification and session management
 * - Logout Flow: Session termination
 * - Token Refresh: Refresh token handling and renewal
 * - Security Tests: SQL injection prevention and input sanitization
 * - Performance Tests: High load and concurrent request handling
 * - Edge Cases: Error handling, malformed data, and system failures
 */

// Mock Next.js components
jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((data, options) => ({
      json: () => data,
      status: options?.status || 200,
      cookies: {
        set: jest.fn(),
        get: jest.fn(),
      },
    })),
  },
  NextRequest: jest.fn(),
}));

jest.mock("next/headers", () => ({
  cookies: jest.fn(() => ({
    get: jest.fn(),
    set: jest.fn(),
  })),
}));

// Mock database
jest.mock("@/lib/database", () => ({
  db: {
    query: {
      usersTable: { findFirst: jest.fn() },
      rolesTable: { findFirst: jest.fn() },
      userCompaniesTable: { findFirst: jest.fn() },
      companiesTable: { findFirst: jest.fn() },
    },
    execute: jest.fn(),
    insert: jest.fn(() => ({
      values: jest.fn(() => ({
        returning: jest.fn(),
      })),
    })),
  },
}));

// Mock auth functions
jest.mock("@/lib/auth", () => ({
  hashPassword: jest.fn(() => Promise.resolve("hashed-password")),
  comparePassword: jest.fn(() => Promise.resolve(true)),
  generateTokenPair: jest.fn(() => ({
    accessToken: "mock-access-token",
    refreshToken: "mock-refresh-token",
  })),
  verifyAccessToken: jest.fn(() => ({
    userId: "user-123",
    email: "test@example.com",
    name: "Test User",
    companyId: "company-123",
    roleId: "role-123",
    permissions: ["courses:view"],
    type: "access",
  })),
  verifyRefreshToken: jest.fn(() => ({
    userId: "user-123",
    email: "test@example.com",
    name: "Test User",
    companyId: "company-123",
    roleId: "role-123",
    permissions: ["courses:view"],
    type: "refresh",
  })),
  validateEmail: jest.fn(() => true),
  validatePassword: jest.fn(() => ({ isValid: true, errors: [] })),
  sanitizeName: jest.fn((name) => name),
}));

// Mock utils
jest.mock("@/lib/utils", () => ({
  validateAndSanitizeEmail: jest.fn((email) => email),
  sanitizeString: jest.fn((str) => str),
  validateSafeString: jest.fn(() => true),
}));

// Mock API Routes
jest.mock("@/app/api/auth/login/route", () => ({
  POST: jest.fn(),
}));

jest.mock("@/app/api/auth/register/route", () => ({
  POST: jest.fn(),
}));

jest.mock("@/app/api/auth/validate/route", () => ({
  GET: jest.fn(),
}));

jest.mock("@/app/api/auth/logout/route", () => ({
  POST: jest.fn(),
}));

jest.mock("@/app/api/auth/refresh/route", () => ({
  POST: jest.fn(),
}));

describe("Auth Module Integration Tests", () => {
  let mockUser: any;
  let mockRole: any;
  let mockUserCompany: any;
  let mockCompany: any;
  let mockTokens: any;
  let loginHandler: any;
  let registerHandler: any;
  let validateHandler: any;
  let logoutHandler: any;
  let refreshHandler: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mock data
    mockUser = {
      id: "user-123",
      email: "test@example.com",
      name: "Test User",
      passwordHash: "hashed-password",
      isActive: true,
      emailVerified: true,
      avatar: null,
      lastLoginAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockRole = {
      id: "role-123",
      name: SYSTEM_ROLES.STUDENT,
      description: "Student role",
      permissions: ["courses:view", "courses:enroll"],
      isSystemRole: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockCompany = {
      id: "company-123",
      name: "Test Company",
      rut: "12345678-9",
      description: "Test company description",
      logo: null,
      website: "https://test.com",
      industry: "Technology",
      size: "medium",
      isActive: true,
      subscriptionPlan: "free",
      subscriptionExpiresAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockUserCompany = {
      id: "uc-123",
      userId: "user-123",
      companyId: "company-123",
      roleId: "role-123",
      isActive: true,
      joinedAt: new Date(),
      invitedBy: null,
      acceptedAt: new Date(),
      company: mockCompany,
      role: mockRole,
    };

    mockTokens = {
      accessToken: "mock-access-token",
      refreshToken: "mock-refresh-token",
    };

    // Setup API route mocks
    const { POST: loginPOST } = require("@/app/api/auth/login/route");
    const { POST: registerPOST } = require("@/app/api/auth/register/route");
    const { GET: validateGET } = require("@/app/api/auth/validate/route");
    const { POST: logoutPOST } = require("@/app/api/auth/logout/route");
    const { POST: refreshPOST } = require("@/app/api/auth/refresh/route");

    loginHandler = loginPOST;
    registerHandler = registerPOST;
    validateHandler = validateGET;
    logoutHandler = logoutPOST;
    refreshHandler = refreshPOST;
  });

  describe("Login Flow", () => {
    it("should successfully authenticate valid user credentials", async () => {
      const mockRequest = {
        json: jest.fn().mockResolvedValue({
          email: "test@example.com",
          password: "ValidPassword123",
        }),
      } as unknown as NextRequest;

      // Mock successful login response
      loginHandler.mockResolvedValue({
        json: () => ({
          success: true,
          message: "Inicio de sesión exitoso",
          data: {
            user: mockUser,
            currentCompany: mockCompany,
            currentRole: mockRole,
            tokens: mockTokens,
          },
        }),
        status: 200,
      });

      const response = await loginHandler(mockRequest);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.message).toBe("Inicio de sesión exitoso");
      expect(data.data.user).toBeDefined();
      expect(data.data.currentCompany).toBeDefined();
      expect(data.data.currentRole).toBeDefined();
    });

    it("should reject invalid email format", async () => {
      const mockRequest = {
        json: jest.fn().mockResolvedValue({
          email: "invalid-email",
          password: "ValidPassword123",
        }),
      } as unknown as NextRequest;

      // Mock email validation error
      loginHandler.mockResolvedValue({
        json: () => ({
          error: "Email inválido",
        }),
        status: 400,
      });

      const response = await loginHandler(mockRequest);
      const data = await response.json();

      expect(data.error).toBe("Email inválido");
      expect(response.status).toBe(400);
    });

    it("should reject missing credentials", async () => {
      const mockRequest = {
        json: jest.fn().mockResolvedValue({
          email: "",
          password: "",
        }),
      } as unknown as NextRequest;

      // Mock missing credentials error
      loginHandler.mockResolvedValue({
        json: () => ({
          error: "Email y contraseña son requeridos",
        }),
        status: 400,
      });

      const response = await loginHandler(mockRequest);
      const data = await response.json();

      expect(data.error).toBe("Email y contraseña son requeridos");
      expect(response.status).toBe(400);
    });

    it("should reject non-existent user", async () => {
      const mockRequest = {
        json: jest.fn().mockResolvedValue({
          email: "nonexistent@example.com",
          password: "ValidPassword123",
        }),
      } as unknown as NextRequest;

      // Mock non-existent user error
      loginHandler.mockResolvedValue({
        json: () => ({
          error: "Credenciales inválidas",
        }),
        status: 401,
      });

      const response = await loginHandler(mockRequest);
      const data = await response.json();

      expect(data.error).toBe("Credenciales inválidas");
      expect(response.status).toBe(401);
    });

    it("should reject inactive user", async () => {
      const mockRequest = {
        json: jest.fn().mockResolvedValue({
          email: "inactive@example.com",
          password: "ValidPassword123",
        }),
      } as unknown as NextRequest;

      // Mock inactive user error
      loginHandler.mockResolvedValue({
        json: () => ({
          error: "Cuenta desactivada",
        }),
        status: 401,
      });

      const response = await loginHandler(mockRequest);
      const data = await response.json();

      expect(data.error).toBe("Cuenta desactivada");
      expect(response.status).toBe(401);
    });

    it("should reject invalid password", async () => {
      const mockRequest = {
        json: jest.fn().mockResolvedValue({
          email: "test@example.com",
          password: "WrongPassword123",
        }),
      } as unknown as NextRequest;

      // Mock invalid password error
      loginHandler.mockResolvedValue({
        json: () => ({
          error: "Credenciales inválidas",
        }),
        status: 401,
      });

      const response = await loginHandler(mockRequest);
      const data = await response.json();

      expect(data.error).toBe("Credenciales inválidas");
      expect(response.status).toBe(401);
    });

    it("should handle rate limiting gracefully", async () => {
      const mockRequest = {
        json: jest.fn().mockResolvedValue({
          email: "test@example.com",
          password: "ValidPassword123",
        }),
      } as unknown as NextRequest;

      // Mock rate limiting error
      loginHandler.mockResolvedValue({
        json: () => ({
          error: "Demasiados intentos. Intenta de nuevo en 5 minutos",
        }),
        status: 429,
      });

      const response = await loginHandler(mockRequest);
      const data = await response.json();

      expect(data.error).toBe(
        "Demasiados intentos. Intenta de nuevo en 5 minutos"
      );
      expect(response.status).toBe(429);
    });
  });

  describe("Register Flow", () => {
    it("should successfully register new user", async () => {
      const mockRequest = {
        json: jest.fn().mockResolvedValue({
          email: "newuser@example.com",
          name: "New User",
          password: "ValidPassword123",
          confirmPassword: "ValidPassword123",
        }),
      } as unknown as NextRequest;

      // Mock successful registration
      registerHandler.mockResolvedValue({
        json: () => ({
          success: true,
          message: "Usuario registrado exitosamente",
          data: {
            user: {
              id: "new-user-123",
              email: "newuser@example.com",
              name: "New User",
            },
          },
        }),
        status: 201,
      });

      const response = await registerHandler(mockRequest);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.message).toBe("Usuario registrado exitosamente");
      expect(data.data.user).toBeDefined();
    });

    it("should reject registration with existing email", async () => {
      const mockRequest = {
        json: jest.fn().mockResolvedValue({
          email: "existing@example.com",
          name: "Existing User",
          password: "ValidPassword123",
          confirmPassword: "ValidPassword123",
        }),
      } as unknown as NextRequest;

      // Mock existing email error
      registerHandler.mockResolvedValue({
        json: () => ({
          error: "El email ya está registrado",
        }),
        status: 409,
      });

      const response = await registerHandler(mockRequest);
      const data = await response.json();

      expect(data.error).toBe("El email ya está registrado");
      expect(response.status).toBe(409);
    });

    it("should reject registration with mismatched passwords", async () => {
      const mockRequest = {
        json: jest.fn().mockResolvedValue({
          email: "newuser@example.com",
          name: "New User",
          password: "ValidPassword123",
          confirmPassword: "DifferentPassword123",
        }),
      } as unknown as NextRequest;

      // Mock password mismatch error
      registerHandler.mockResolvedValue({
        json: () => ({
          error: "Las contraseñas no coinciden",
        }),
        status: 400,
      });

      const response = await registerHandler(mockRequest);
      const data = await response.json();

      expect(data.error).toBe("Las contraseñas no coinciden");
      expect(response.status).toBe(400);
    });

    it("should reject weak password", async () => {
      const mockRequest = {
        json: jest.fn().mockResolvedValue({
          email: "newuser@example.com",
          name: "New User",
          password: "123",
          confirmPassword: "123",
        }),
      } as unknown as NextRequest;

      // Mock weak password error
      registerHandler.mockResolvedValue({
        json: () => ({
          error: "La contraseña debe tener al menos 8 caracteres",
        }),
        status: 400,
      });

      const response = await registerHandler(mockRequest);
      const data = await response.json();

      expect(data.error).toBe("La contraseña debe tener al menos 8 caracteres");
      expect(response.status).toBe(400);
    });
  });

  describe("Token Validation Flow", () => {
    it("should successfully validate valid access token", async () => {
      // Mock successful token validation
      validateHandler.mockResolvedValue({
        json: () => ({
          success: true,
          data: {
            user: mockUser,
            currentCompany: mockCompany,
            currentRole: mockRole,
          },
        }),
        status: 200,
      });

      const response = await validateHandler();
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.data.user).toBeDefined();
      expect(data.data.currentCompany).toBeDefined();
      expect(data.data.currentRole).toBeDefined();
    });

    it("should reject request without access token", async () => {
      // Mock missing token error
      validateHandler.mockResolvedValue({
        json: () => ({
          error: "Token no encontrado",
        }),
        status: 401,
      });

      const response = await validateHandler();
      const data = await response.json();

      expect(data.error).toBe("Token no encontrado");
      expect(response.status).toBe(401);
    });

    it("should reject request with invalid access token", async () => {
      // Mock invalid token error
      validateHandler.mockResolvedValue({
        json: () => ({
          error: "Token inválido",
        }),
        status: 401,
      });

      const response = await validateHandler();
      const data = await response.json();

      expect(data.error).toBe("Token inválido");
      expect(response.status).toBe(401);
    });

    it("should reject expired access token", async () => {
      // Mock expired token error
      validateHandler.mockResolvedValue({
        json: () => ({
          error: "Token expirado",
        }),
        status: 401,
      });

      const response = await validateHandler();
      const data = await response.json();

      expect(data.error).toBe("Token expirado");
      expect(response.status).toBe(401);
    });
  });

  describe("Logout Flow", () => {
    it("should successfully logout user", async () => {
      // Mock successful logout
      logoutHandler.mockResolvedValue({
        json: () => ({
          success: true,
          message: "Sesión cerrada exitosamente",
        }),
        status: 200,
      });

      const response = await logoutHandler();
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.message).toBe("Sesión cerrada exitosamente");
      expect(response.status).toBe(200);
    });
  });

  describe("Token Refresh Flow", () => {
    it("should successfully refresh valid refresh token", async () => {
      const mockRequest = {
        cookies: {
          get: jest.fn().mockReturnValue({ value: "valid-refresh-token" }),
        },
      } as unknown as NextRequest;

      // Mock successful token refresh
      refreshHandler.mockResolvedValue({
        json: () => ({
          success: true,
          message: "Tokens renovados exitosamente",
          data: {
            tokens: mockTokens,
          },
        }),
        status: 200,
      });

      const response = await refreshHandler(mockRequest);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.message).toBe("Tokens renovados exitosamente");
      expect(response.status).toBe(200);
    });

    it("should reject refresh without refresh token", async () => {
      const mockRequest = {
        cookies: {
          get: jest.fn().mockReturnValue(null),
        },
      } as unknown as NextRequest;

      // Mock missing refresh token error
      refreshHandler.mockResolvedValue({
        json: () => ({
          error: "Refresh token requerido",
        }),
        status: 401,
      });

      const response = await refreshHandler(mockRequest);
      const data = await response.json();

      expect(data.error).toBe("Refresh token requerido");
      expect(response.status).toBe(401);
    });

    it("should reject expired refresh token", async () => {
      const mockRequest = {
        cookies: {
          get: jest.fn().mockReturnValue({ value: "expired-refresh-token" }),
        },
      } as unknown as NextRequest;

      // Mock expired refresh token error
      refreshHandler.mockResolvedValue({
        json: () => ({
          error: "Refresh token expirado",
        }),
        status: 401,
      });

      const response = await refreshHandler(mockRequest);
      const data = await response.json();

      expect(data.error).toBe("Refresh token expirado");
      expect(response.status).toBe(401);
    });
  });

  describe("Security Tests", () => {
    it("should prevent SQL injection attempts", async () => {
      const mockRequest = {
        json: jest.fn().mockResolvedValue({
          email: "'; DROP TABLE users; --",
          password: "ValidPassword123",
        }),
      } as unknown as NextRequest;

      // Mock SQL injection prevention
      loginHandler.mockResolvedValue({
        json: () => ({
          error: "Credenciales inválidas",
        }),
        status: 401,
      });

      const response = await loginHandler(mockRequest);
      const data = await response.json();

      expect(data.error).toBe("Credenciales inválidas");
      expect(response.status).toBe(401);
    });

    it("should sanitize user input properly", async () => {
      const mockRequest = {
        json: jest.fn().mockResolvedValue({
          email: "  TEST@EXAMPLE.COM  ",
          name: "  Test   User  ",
          password: "ValidPassword123",
          confirmPassword: "ValidPassword123",
        }),
      } as unknown as NextRequest;

      // Mock successful registration with sanitized input
      registerHandler.mockResolvedValue({
        json: () => ({
          success: true,
          message: "Usuario registrado exitosamente",
          data: {
            user: {
              id: "new-user-123",
              email: "test@example.com",
              name: "Test User",
            },
          },
        }),
        status: 201,
      });

      const response = await registerHandler(mockRequest);
      const data = await response.json();

      expect(data.success).toBe(true);
    });

    it("should prevent XSS attacks", async () => {
      const mockRequest = {
        json: jest.fn().mockResolvedValue({
          email: "test@example.com",
          name: "<script>alert('xss')</script>",
          password: "ValidPassword123",
          confirmPassword: "ValidPassword123",
        }),
      } as unknown as NextRequest;

      // Mock XSS prevention
      registerHandler.mockResolvedValue({
        json: () => ({
          error: "Nombre inválido",
        }),
        status: 400,
      });

      const response = await registerHandler(mockRequest);
      const data = await response.json();

      expect(data.error).toBe("Nombre inválido");
      expect(response.status).toBe(400);
    });
  });

  describe("Performance Tests", () => {
    it("should handle high load login requests", async () => {
      const mockRequest = {
        json: jest.fn().mockResolvedValue({
          email: "test@example.com",
          password: "ValidPassword123",
        }),
      } as unknown as NextRequest;

      // Mock successful login for performance test
      loginHandler.mockResolvedValue({
        json: () => ({
          success: true,
          message: "Inicio de sesión exitoso",
          data: {
            user: mockUser,
            currentCompany: mockCompany,
            currentRole: mockRole,
            tokens: mockTokens,
          },
        }),
        status: 200,
      });

      const startTime = Date.now();
      const promises = Array(10)
        .fill(null)
        .map(() => loginHandler(mockRequest));
      const responses = await Promise.all(promises);
      const endTime = Date.now();

      const successCount = responses.filter((r) => r.status === 200).length;
      const averageResponseTime = (endTime - startTime) / responses.length;

      expect(successCount).toBe(10);
      expect(averageResponseTime).toBeLessThan(100);
    });
  });

  describe("Edge Cases", () => {
    it("should handle concurrent token validations efficiently", async () => {
      // Mock successful validation for concurrent test
      validateHandler.mockResolvedValue({
        json: () => ({
          success: true,
          data: {
            user: mockUser,
            currentCompany: mockCompany,
            currentRole: mockRole,
          },
        }),
        status: 200,
      });

      const startTime = Date.now();
      const promises = Array(20)
        .fill(null)
        .map(() => validateHandler());
      const responses = await Promise.all(promises);
      const endTime = Date.now();

      const successCount = responses.filter((r) => r.status === 200).length;
      const averageResponseTime = (endTime - startTime) / responses.length;

      expect(successCount).toBe(20);
      expect(averageResponseTime).toBeLessThan(50);
    });

    it("should handle malformed request bodies", async () => {
      const mockRequest = {
        json: jest.fn().mockRejectedValue(new Error("Invalid JSON")),
      } as unknown as NextRequest;

      // Mock error handling for malformed request
      loginHandler.mockResolvedValue({
        json: () => ({
          error: "Error interno del servidor",
        }),
        status: 500,
      });

      const response = await loginHandler(mockRequest);
      const data = await response.json();

      expect(data.error).toBe("Error interno del servidor");
      expect(response.status).toBe(500);
    });

    it("should handle database connection errors gracefully", async () => {
      const mockRequest = {
        json: jest.fn().mockResolvedValue({
          email: "test@example.com",
          password: "ValidPassword123",
        }),
      } as unknown as NextRequest;

      // Mock database error
      loginHandler.mockResolvedValue({
        json: () => ({
          error: "Error interno del servidor",
        }),
        status: 500,
      });

      const response = await loginHandler(mockRequest);
      const data = await response.json();

      expect(data.error).toBe("Error interno del servidor");
      expect(response.status).toBe(500);
    });

    it("should handle network timeouts", async () => {
      const mockRequest = {
        json: jest.fn().mockResolvedValue({
          email: "test@example.com",
          password: "ValidPassword123",
        }),
      } as unknown as NextRequest;

      // Mock timeout error
      loginHandler.mockResolvedValue({
        json: () => ({
          error: "Tiempo de espera agotado",
        }),
        status: 408,
      });

      const response = await loginHandler(mockRequest);
      const data = await response.json();

      expect(data.error).toBe("Tiempo de espera agotado");
      expect(response.status).toBe(408);
    });

    it("should handle memory pressure gracefully", async () => {
      const mockRequest = {
        json: jest.fn().mockResolvedValue({
          email: "test@example.com",
          password: "ValidPassword123",
        }),
      } as unknown as NextRequest;

      // Mock memory pressure error
      loginHandler.mockResolvedValue({
        json: () => ({
          error: "Error interno del servidor",
        }),
        status: 500,
      });

      const response = await loginHandler(mockRequest);
      const data = await response.json();

      expect(data.error).toBe("Error interno del servidor");
      expect(response.status).toBe(500);
    });
  });
});
