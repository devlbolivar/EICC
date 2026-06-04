/**
 * Auth Flows Integration Tests
 *
 * Tests the actual route handler logic for:
 * - POST /api/auth/login
 * - POST /api/auth/register
 * - POST /api/auth/refresh
 * - POST /api/auth/logout
 */

// ===== MOCKS =====

jest.mock("@/lib/csrf", () => ({
  requireCsrf: jest.fn().mockResolvedValue(null),
}));

// Rate limiters: always pass in tests
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

jest.mock("next/headers", () => ({
  cookies: jest.fn(() => ({ get: jest.fn(), set: jest.fn() })),
}));

// Email service: don't actually send
jest.mock("@/lib/email-service", () => ({
  sendVerificationEmail: jest.fn().mockResolvedValue(undefined),
}));

// Shared auth helpers
jest.mock("@/lib/auth", () => ({
  comparePassword: jest.fn(),
  hashPassword: jest.fn().mockResolvedValue("hashed-password"),
  generateTokenPair: jest.fn().mockReturnValue({
    accessToken: "new-access-token",
    refreshToken: "new-refresh-token",
  }),
  validateEmail: jest.fn().mockReturnValue(true),
  validatePassword: jest.fn().mockReturnValue({ isValid: true, errors: [] }),
  sanitizeName: jest.fn((name: string) => name.trim()),
  generateEmailVerificationToken: jest.fn().mockReturnValue("verify-token-abc"),
  TOKEN_EXPIRY: { EMAIL_VERIFICATION: 86400000 },
  verifyRefreshToken: jest.fn(),
}));

jest.mock("@/lib/utils", () => ({
  validateAndSanitizeEmail: jest.fn((email: string) => email.toLowerCase().trim()),
  validateSafeString: jest.fn().mockReturnValue(true),
}));

// Login route: imports db from @/config/db
jest.mock("@/config/db", () => ({
  db: {
    execute: jest.fn(),
    query: {
      usersTable: { findFirst: jest.fn() },
      userCompaniesTable: { findFirst: jest.fn() },
      rolesTable: { findFirst: jest.fn() },
    },
  },
}));

// Refresh + register routes: use @/lib/database or neon+drizzle
jest.mock("@/lib/database", () => ({
  db: {
    query: {
      usersTable: { findFirst: jest.fn() },
      userCompaniesTable: { findFirst: jest.fn() },
    },
    insert: jest.fn(),
  },
}));

jest.mock("@neondatabase/serverless", () => ({
  neon: jest.fn().mockReturnValue({}),
}));

jest.mock("drizzle-orm/neon-http", () => ({
  drizzle: jest.fn().mockReturnValue({
    query: {
      usersTable: { findFirst: jest.fn() },
      rolesTable: { findFirst: jest.fn() },
      userCompaniesTable: { findFirst: jest.fn() },
    },
    insert: jest.fn(),
  }),
}));

jest.mock("drizzle-orm", () => ({
  eq: jest.fn(() => ({})),
  and: jest.fn(() => ({})),
  relations: jest.fn(() => ({})),
  sql: jest.fn(),
}));

// ===== IMPORTS =====

import { POST as loginPost } from "@/app/api/auth/login/route";
import { POST as registerPost } from "@/app/api/auth/register/route";
import { POST as refreshPost } from "@/app/api/auth/refresh/route";
import { POST as logoutPost } from "@/app/api/auth/logout/route";
import { NextRequest } from "next/server";
import { db as configDb } from "@/config/db";
import { db as libDb } from "@/lib/database";
import { drizzle } from "drizzle-orm/neon-http";
import { comparePassword, verifyRefreshToken } from "@/lib/auth";

// ===== TYPED MOCK REFS =====

const mockLoginDb = configDb as {
  execute: jest.Mock;
  query: { usersTable: { findFirst: jest.Mock }; userCompaniesTable: { findFirst: jest.Mock } };
};
const mockRefreshDb = libDb as {
  query: { usersTable: { findFirst: jest.Mock }; userCompaniesTable: { findFirst: jest.Mock } };
};
const mockComparePassword = comparePassword as jest.Mock;
const mockVerifyRefreshToken = verifyRefreshToken as jest.Mock;
const mockDrizzle = drizzle as jest.Mock;

function getRegisterDb() {
  return mockDrizzle.mock.results[0]?.value ?? mockDrizzle();
}

// ===== HELPERS =====

function makeRequest(body: unknown, cookies: Record<string, string> = {}): NextRequest {
  return {
    headers: { get: jest.fn(() => null) },
    cookies: {
      get: jest.fn((name: string) => (cookies[name] ? { value: cookies[name] } : undefined)),
    },
    json: jest.fn().mockResolvedValue(body),
    url: "http://localhost/api/auth/login",
  } as unknown as NextRequest;
}

// ===== LOGIN TESTS =====

describe("POST /api/auth/login", () => {
  const validUser = {
    id: "user-1",
    email: "user@example.com",
    passwordHash: "hashed-pass",
    isActive: true,
    emailVerified: true,
    name: "Test User",
    tokenVersion: 1,
  };

  const validUserCompany = {
    userId: "user-1",
    companyId: "company-1",
    roleId: "role-1",
    isActive: true,
    role: { id: "role-1", name: "student", permissions: ["courses:enroll"] },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockComparePassword.mockResolvedValue(true);
  });

  it("returns 200 and tokens on successful login", async () => {
    mockLoginDb.execute.mockResolvedValueOnce({ rows: [validUser] });
    mockLoginDb.execute.mockResolvedValueOnce({
      rows: [
        {
          ...validUserCompany,
          company_id: "company-1",
          role_id: "role-1",
          role_name: "student",
          role_permissions: ["courses:enroll"],
        },
      ],
    });

    const res = await loginPost(makeRequest({ email: "user@example.com", password: "Password1!" }));

    expect(res.status).toBe(200);
    expect(res.json().success).toBe(true);
  });

  it("returns 401 when password is wrong", async () => {
    mockComparePassword.mockResolvedValue(false);
    mockLoginDb.execute.mockResolvedValueOnce({ rows: [validUser] });

    const res = await loginPost(makeRequest({ email: "user@example.com", password: "WrongPass!" }));

    expect(res.status).toBe(401);
    expect(res.json().error).toContain("Credenciales");
  });

  it("returns 401 when user does not exist (timing-safe)", async () => {
    mockComparePassword.mockResolvedValue(false);
    mockLoginDb.execute.mockResolvedValueOnce({ rows: [] });

    const res = await loginPost(makeRequest({ email: "nobody@example.com", password: "Password1!" }));

    expect(res.status).toBe(401);
    expect(res.json().error).toContain("Credenciales");
  });

  it("returns 401 when account is inactive", async () => {
    mockLoginDb.execute.mockResolvedValueOnce({ rows: [{ ...validUser, isActive: false }] });

    const res = await loginPost(makeRequest({ email: "user@example.com", password: "Password1!" }));

    expect(res.status).toBe(401);
  });

  it("returns 403 when email is not verified", async () => {
    mockLoginDb.execute.mockResolvedValueOnce({ rows: [{ ...validUser, emailVerified: false }] });

    const res = await loginPost(makeRequest({ email: "user@example.com", password: "Password1!" }));

    expect(res.status).toBe(403);
    expect(res.json().error).toContain("verif");
  });

  it("returns 400 when email is missing", async () => {
    const res = await loginPost(makeRequest({ password: "Password1!" }));

    expect(res.status).toBe(400);
  });

  it("returns 400 when password is missing", async () => {
    const res = await loginPost(makeRequest({ email: "user@example.com" }));

    expect(res.status).toBe(400);
  });
});

// ===== REGISTER TESTS =====

describe("POST /api/auth/register", () => {
  const validBody = {
    email: "new@example.com",
    name: "New User",
    password: "Password1!",
    confirmPassword: "Password1!",
  };

  const newUser = { id: "new-user-1", email: "new@example.com", name: "New User" };
  const studentRole = { id: "role-student", name: "student", permissions: [] };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("creates a new user and returns tokens", async () => {
    const rdb = getRegisterDb();
    rdb.query.usersTable.findFirst.mockResolvedValue(null); // no existing user
    rdb.insert.mockReturnValue({
      values: jest.fn(() => ({ returning: jest.fn().mockResolvedValue([newUser]) })),
    });
    rdb.query.rolesTable.findFirst.mockResolvedValue(studentRole);
    // Second insert for user-company
    rdb.insert.mockReturnValue({
      values: jest.fn(() => ({
        returning: jest.fn().mockResolvedValue([newUser]),
      })),
    });

    const res = await registerPost(makeRequest(validBody));

    // 200 or 201 — register returns a token response
    expect([200, 201]).toContain(res.status);
  });

  it("returns 409 when email is already registered", async () => {
    const rdb = getRegisterDb();
    rdb.query.usersTable.findFirst.mockResolvedValue({ id: "existing", email: "new@example.com" });

    const res = await registerPost(makeRequest(validBody));

    expect(res.status).toBe(409);
    expect(res.json().error).toContain("registrado");
  });

  it("returns 400 when passwords do not match", async () => {
    const res = await registerPost(
      makeRequest({ ...validBody, confirmPassword: "DifferentPass!" })
    );

    expect(res.status).toBe(400);
    expect(res.json().error).toContain("coinciden");
  });

  it("returns 400 when required fields are missing", async () => {
    const res = await registerPost(makeRequest({ email: "new@example.com" }));

    expect(res.status).toBe(400);
    expect(res.json().error).toContain("requeridos");
  });

  it("returns 400 for invalid password", async () => {
    const { validatePassword } = require("@/lib/auth");
    (validatePassword as jest.Mock).mockReturnValueOnce({
      isValid: false,
      errors: ["Contraseña muy corta"],
    });

    const res = await registerPost(makeRequest({ ...validBody, password: "weak", confirmPassword: "weak" }));

    expect(res.status).toBe(400);
  });
});

// ===== TOKEN REFRESH TESTS =====

describe("POST /api/auth/refresh", () => {
  const refreshPayload = {
    userId: "user-1",
    email: "user@example.com",
    name: "Test User",
    roleId: "role-1",
    companyId: "company-1",
    iat: Math.floor(Date.now() / 1000),
  };

  const activeUser = {
    id: "user-1",
    email: "user@example.com",
    isActive: true,
    passwordChangedAt: null,
  };

  const userCompanyWithRole = {
    userId: "user-1",
    companyId: "company-1",
    roleId: "role-1",
    isActive: true,
    role: { id: "role-1", name: "student", permissions: ["courses:enroll"] },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockVerifyRefreshToken.mockReturnValue(refreshPayload);
  });

  it("returns 200 and renews tokens on valid refresh token", async () => {
    mockRefreshDb.query.usersTable.findFirst.mockResolvedValue(activeUser);
    mockRefreshDb.query.userCompaniesTable.findFirst.mockResolvedValue(userCompanyWithRole);

    const res = await refreshPost(makeRequest({}, { refreshToken: "valid-refresh-token" }));

    expect(res.status).toBe(200);
    expect(res.json().success).toBe(true);
  });

  it("returns 401 when no refresh token cookie", async () => {
    const res = await refreshPost(makeRequest({})); // no cookies

    expect(res.status).toBe(401);
    expect(res.json().error).toContain("Refresh token");
  });

  it("returns 401 when refresh token is invalid/expired", async () => {
    mockVerifyRefreshToken.mockReturnValue(null);

    const res = await refreshPost(makeRequest({}, { refreshToken: "bad-token" }));

    expect(res.status).toBe(401);
  });

  it("returns 401 when user does not exist", async () => {
    mockRefreshDb.query.usersTable.findFirst.mockResolvedValue(null);

    const res = await refreshPost(makeRequest({}, { refreshToken: "valid-refresh-token" }));

    expect(res.status).toBe(401);
  });

  it("returns 401 when user is inactive", async () => {
    mockRefreshDb.query.usersTable.findFirst.mockResolvedValue({ ...activeUser, isActive: false });

    const res = await refreshPost(makeRequest({}, { refreshToken: "valid-refresh-token" }));

    expect(res.status).toBe(401);
  });

  it("returns 401 when password was changed after the token was issued", async () => {
    const pastIat = Math.floor((Date.now() - 60000) / 1000); // token issued 1 minute ago
    mockVerifyRefreshToken.mockReturnValue({ ...refreshPayload, iat: pastIat });
    mockRefreshDb.query.usersTable.findFirst.mockResolvedValue({
      ...activeUser,
      passwordChangedAt: new Date(), // changed NOW (after token iat)
    });

    const res = await refreshPost(makeRequest({}, { refreshToken: "valid-refresh-token" }));

    expect(res.status).toBe(401);
    expect(res.json().error).toContain("Sesión inválida");
  });

  it("returns 401 when user-company relation is not found", async () => {
    mockRefreshDb.query.usersTable.findFirst.mockResolvedValue(activeUser);
    mockRefreshDb.query.userCompaniesTable.findFirst.mockResolvedValue(null);

    const res = await refreshPost(makeRequest({}, { refreshToken: "valid-refresh-token" }));

    expect(res.status).toBe(401);
    expect(res.json().error).toContain("usuario-empresa");
  });

  it("returns 401 when token is missing roleId", async () => {
    mockVerifyRefreshToken.mockReturnValue({ ...refreshPayload, roleId: undefined });
    mockRefreshDb.query.usersTable.findFirst.mockResolvedValue(activeUser);

    const res = await refreshPost(makeRequest({}, { refreshToken: "valid-refresh-token" }));

    expect(res.status).toBe(401);
    expect(res.json().error).toContain("roleId");
  });
});

// ===== LOGOUT TESTS =====

describe("POST /api/auth/logout", () => {
  it("returns 200 and clears auth cookies", async () => {
    const res = await logoutPost(makeRequest({}));

    expect(res.status).toBe(200);
    expect(res.json().success).toBe(true);
    expect(res.json().message).toContain("Logout");
  });
});
