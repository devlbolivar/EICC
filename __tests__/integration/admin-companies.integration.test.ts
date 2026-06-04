/**
 * Admin Companies Integration Tests
 *
 * Tests the admin company management API:
 * - PUT /api/admin/companies/[id] (update including subscriptionPlan)
 * - DELETE /api/admin/companies/[id] (with dependency checks)
 */

// ===== MOCKS =====

jest.mock("@/lib/csrf", () => ({
  requireCsrf: jest.fn().mockResolvedValue(null),
}));

jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((data: unknown, options?: { status?: number }) => ({
      json: () => data,
      status: options?.status ?? 200,
    })),
  },
  NextRequest: jest.fn(),
}));

jest.mock("@/lib/validation", () => ({
  validateUUID: jest.fn().mockReturnValue({ isValid: true }),
  validateCompanyData: jest.fn().mockReturnValue({
    isValid: true,
    data: {
      name: "Updated Company",
      rut: "12345678-9",
      email: "contact@company.com",
      phone: null,
      website: null,
      industry: "Tecnología",
      size: null,
      description: null,
    },
  }),
}));

jest.mock("@/lib/api-helpers", () => ({
  handleApiError: jest.fn(() => ({ json: () => ({ error: "Error interno" }), status: 500 })),
  successResponse: jest.fn((data: unknown) => ({ json: () => data, status: 200 })),
  errorResponse: jest.fn((message: string, status: number) => ({
    json: () => ({ error: message }),
    status,
  })),
}));

jest.mock("@/lib/admin-auth", () => ({
  verifyAdminAuth: jest.fn(),
}));

// The admin companies route creates its own drizzle instance via neon + drizzle.
// We mock those at the package level so all drizzle calls go through our fakes.
jest.mock("@neondatabase/serverless", () => ({
  neon: jest.fn().mockReturnValue({}),
}));

jest.mock("drizzle-orm/neon-http", () => ({
  drizzle: jest.fn().mockReturnValue({
    update: jest.fn(),
    delete: jest.fn(),
    select: jest.fn(),
    insert: jest.fn(),
  }),
}));

// drizzle-orm helpers used in the route and schema
jest.mock("drizzle-orm", () => ({
  eq: jest.fn((col: unknown, val: unknown) => ({ _type: "eq", col, val })),
  and: jest.fn((...args: unknown[]) => ({ _type: "and", args })),
  count: jest.fn(() => ({ _type: "count" })),
  relations: jest.fn(() => ({})),
  primaryKey: jest.fn(() => ({})),
  sql: jest.fn(),
}));

// ===== IMPORTS =====

import { PUT, DELETE } from "@/app/api/admin/companies/[id]/route";
import { NextRequest } from "next/server";
import { drizzle } from "drizzle-orm/neon-http";
import { verifyAdminAuth } from "@/lib/admin-auth";
import { validateUUID, validateCompanyData } from "@/lib/validation";

// ===== TYPED MOCK REFS =====

const mockVerifyAdminAuth = verifyAdminAuth as jest.Mock;
const mockValidateUUID = validateUUID as jest.Mock;
const mockValidateCompanyData = validateCompanyData as jest.Mock;
const mockDrizzle = drizzle as jest.Mock;

/** Returns the db object the route created via drizzle() */
function getAdminDb() {
  return mockDrizzle.mock.results[0]?.value ?? mockDrizzle();
}

// ===== CONSTANTS =====

const COMPANY_ID = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa";
const ADMIN_PAYLOAD = {
  userId: "admin-user-id",
  companyId: null,
  permissions: ["platform:admin"],
  email: "admin@platform.com",
};

// ===== HELPERS =====

function makeRequest(body: unknown): NextRequest {
  return {
    headers: { get: jest.fn(() => null) },
    cookies: {
      get: jest.fn((name: string) =>
        name === "accessToken" ? { value: "admin-token" } : undefined
      ),
    },
    json: jest.fn().mockResolvedValue(body),
  } as unknown as NextRequest;
}

function makeParams(id: string) {
  return { params: Promise.resolve({ id }) };
}

/** Build a chainable drizzle-style mock that resolves with `finalRows` */
function makeUpdateChain(finalRows: unknown[]) {
  const chain = {
    set: jest.fn(() => chain),
    where: jest.fn(() => ({ returning: jest.fn().mockResolvedValue(finalRows) })),
  };
  return chain;
}

function makeSelectCountChain(count: number) {
  return {
    from: jest.fn(() => ({
      where: jest.fn(() => Promise.resolve([{ count }])),
    })),
  };
}

function makeSelectRowsChain(rows: unknown[]) {
  return {
    from: jest.fn(() => ({
      where: jest.fn(() => ({
        limit: jest.fn(() => Promise.resolve(rows)),
      })),
    })),
  };
}

// ===== AUTH & AUTHORIZATION TESTS =====

describe("Admin Companies: Authentication & Authorization", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("rejects unauthenticated requests (401)", async () => {
    mockVerifyAdminAuth.mockResolvedValue({
      authorized: false,
      response: { json: () => ({ error: "Token requerido" }), status: 401 },
    });

    const res = await PUT(makeRequest({ name: "Co", rut: "12345678-9" }), makeParams(COMPANY_ID));

    expect(res.status).toBe(401);
  });

  it("rejects requests without admin permissions (403)", async () => {
    mockVerifyAdminAuth.mockResolvedValue({
      authorized: false,
      response: { json: () => ({ error: "Permisos insuficientes" }), status: 403 },
    });

    const res = await PUT(makeRequest({ name: "Co", rut: "12345678-9" }), makeParams(COMPANY_ID));

    expect(res.status).toBe(403);
  });
});

// ===== UPDATE COMPANY TESTS =====

describe("Admin Companies: Update Company (PUT)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockVerifyAdminAuth.mockResolvedValue({ authorized: true, payload: ADMIN_PAYLOAD });
    mockValidateUUID.mockReturnValue({ isValid: true });
    mockValidateCompanyData.mockReturnValue({
      isValid: true,
      data: { name: "Updated Company", rut: "12345678-9" },
    });
  });

  it("updates company and saves subscriptionPlan: starter", async () => {
    const updatedRow = { id: COMPANY_ID, subscriptionPlan: "starter", isActive: true };
    getAdminDb().update.mockReturnValue(makeUpdateChain([updatedRow]));

    const res = await PUT(
      makeRequest({ name: "Updated Company", rut: "12345678-9", subscriptionPlan: "starter" }),
      makeParams(COMPANY_ID)
    );

    expect(res.status).toBe(200);
    expect(getAdminDb().update).toHaveBeenCalled();
  });

  it("updates company and saves subscriptionPlan: pro", async () => {
    const updatedRow = { id: COMPANY_ID, subscriptionPlan: "pro" };
    getAdminDb().update.mockReturnValue(makeUpdateChain([updatedRow]));

    const res = await PUT(
      makeRequest({ name: "Updated Company", rut: "12345678-9", subscriptionPlan: "pro" }),
      makeParams(COMPANY_ID)
    );

    expect(res.status).toBe(200);
  });

  it("updates company and saves subscriptionPlan: free", async () => {
    const updatedRow = { id: COMPANY_ID, subscriptionPlan: "free" };
    getAdminDb().update.mockReturnValue(makeUpdateChain([updatedRow]));

    const res = await PUT(
      makeRequest({ name: "Updated Company", rut: "12345678-9", subscriptionPlan: "free" }),
      makeParams(COMPANY_ID)
    );

    expect(res.status).toBe(200);
  });

  it("ignores invalid subscriptionPlan values (e.g. 'enterprise')", async () => {
    // Route should still succeed — invalid plan is just omitted from the SET clause
    const updatedRow = { id: COMPANY_ID, subscriptionPlan: "free" }; // unchanged
    getAdminDb().update.mockReturnValue(makeUpdateChain([updatedRow]));

    const res = await PUT(
      makeRequest({ name: "Updated Company", rut: "12345678-9", subscriptionPlan: "enterprise" }),
      makeParams(COMPANY_ID)
    );

    expect(res.status).toBe(200);
  });

  it("updates isActive to false (deactivation)", async () => {
    const updatedRow = { id: COMPANY_ID, isActive: false };
    getAdminDb().update.mockReturnValue(makeUpdateChain([updatedRow]));

    const res = await PUT(
      makeRequest({ name: "Updated Company", rut: "12345678-9", isActive: false }),
      makeParams(COMPANY_ID)
    );

    expect(res.status).toBe(200);
  });

  it("returns 404 when company does not exist", async () => {
    getAdminDb().update.mockReturnValue(makeUpdateChain([])); // empty = not found

    const res = await PUT(
      makeRequest({ name: "Updated Company", rut: "12345678-9" }),
      makeParams(COMPANY_ID)
    );

    expect(res.status).toBe(404);
  });

  it("returns 400 for invalid UUID", async () => {
    mockValidateUUID.mockReturnValueOnce({ isValid: false, errors: ["ID inválido"] });

    const res = await PUT(
      makeRequest({ name: "Co", rut: "12345678-9" }),
      makeParams("not-a-valid-uuid")
    );

    expect(res.status).toBe(400);
  });

  it("returns 400 when company data validation fails", async () => {
    mockValidateCompanyData.mockReturnValueOnce({
      isValid: false,
      errors: ["Nombre requerido"],
    });

    const res = await PUT(makeRequest({ rut: "12345678-9" }), makeParams(COMPANY_ID));

    expect(res.status).toBe(400);
    expect(res.json().error).toContain("Nombre requerido");
  });
});

// ===== DELETE COMPANY TESTS =====

describe("Admin Companies: Delete Company (DELETE)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockVerifyAdminAuth.mockResolvedValue({ authorized: true, payload: ADMIN_PAYLOAD });
    mockValidateUUID.mockReturnValue({ isValid: true });
  });

  it("blocks deletion when company has active users", async () => {
    const db = getAdminDb();
    // First select: active users count = 2
    db.select.mockReturnValueOnce(makeSelectCountChain(2));

    const res = await DELETE(makeRequest({}), makeParams(COMPANY_ID));

    expect(res.status).toBe(400);
    expect(res.json().error).toContain("usuarios activos");
  });

  it("blocks deletion when company has associated courses", async () => {
    const db = getAdminDb();
    // First select: active users = 0
    db.select.mockReturnValueOnce(makeSelectCountChain(0));
    // Second select: courses count = 3
    db.select.mockReturnValueOnce(makeSelectCountChain(3));

    const res = await DELETE(makeRequest({}), makeParams(COMPANY_ID));

    expect(res.status).toBe(400);
    expect(res.json().error).toContain("cursos");
  });

  it("returns 404 when company does not exist", async () => {
    const db = getAdminDb();
    db.select
      .mockReturnValueOnce(makeSelectCountChain(0)) // active users = 0
      .mockReturnValueOnce(makeSelectCountChain(0)) // courses = 0
      .mockReturnValueOnce(makeSelectRowsChain([])); // company not found

    const res = await DELETE(makeRequest({}), makeParams(COMPANY_ID));

    expect(res.status).toBe(404);
  });

  it("deletes company successfully when no dependencies", async () => {
    const db = getAdminDb();
    db.select
      .mockReturnValueOnce(makeSelectCountChain(0))
      .mockReturnValueOnce(makeSelectCountChain(0))
      .mockReturnValueOnce(makeSelectRowsChain([{ id: COMPANY_ID }]));

    db.delete.mockReturnValue({
      where: jest.fn().mockResolvedValue(undefined),
    });

    const res = await DELETE(makeRequest({}), makeParams(COMPANY_ID));

    expect(res.status).toBe(200);
    expect(db.delete).toHaveBeenCalled();
  });

  it("returns 400 for invalid UUID", async () => {
    mockValidateUUID.mockReturnValueOnce({ isValid: false, errors: ["ID inválido"] });

    const res = await DELETE(makeRequest({}), makeParams("bad-id"));

    expect(res.status).toBe(400);
  });

  it("rejects unauthenticated requests (401)", async () => {
    mockVerifyAdminAuth.mockResolvedValue({
      authorized: false,
      response: { json: () => ({ error: "Token requerido" }), status: 401 },
    });

    const res = await DELETE(makeRequest({}), makeParams(COMPANY_ID));

    expect(res.status).toBe(401);
  });
});
