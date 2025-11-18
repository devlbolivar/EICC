/**
 * Integration tests for UUID validation in API endpoints
 *
 * These tests verify that all dynamic API endpoints properly validate
 * UUID parameters and return appropriate error responses for invalid inputs.
 */

import { NextRequest } from "next/server";

// Mock authentication to bypass auth checks
jest.mock("@/lib/auth", () => ({
  verifyAccessToken: jest.fn().mockResolvedValue({
    userId: "123e4567-e89b-12d3-a456-426614174000",
    email: "test@example.com",
    companyId: "123e4567-e89b-12d3-a456-426614174001",
    permissions: ["courses:read", "courses:edit", "courses:delete", "courses:enroll", "courses:manage"],
  }),
}));

jest.mock("@/lib/admin-auth", () => ({
  verifyAdminAuth: jest.fn().mockResolvedValue({
    authorized: true,
    payload: {
      userId: "123e4567-e89b-12d3-a456-426614174000",
      email: "admin@example.com",
      permissions: ["admin:all"],
    },
  }),
  verifyAuth: jest.fn().mockResolvedValue({
    authorized: true,
    payload: {
      userId: "123e4567-e89b-12d3-a456-426614174000",
      email: "test@example.com",
    },
  }),
  requireAdmin: jest.fn().mockResolvedValue({
    payload: {
      userId: "123e4567-e89b-12d3-a456-426614174000",
      email: "admin@example.com",
    },
  }),
}));

jest.mock("next/headers", () => ({
  cookies: jest.fn().mockResolvedValue({
    get: jest.fn().mockReturnValue({ value: "mock-token" }),
  }),
}));

// Helper function to create mock request
function createMockRequest(url: string, method: string = "GET", body?: object): NextRequest {
  const request = new NextRequest(new URL(url, "http://localhost:3000"), {
    method,
    ...(body && { body: JSON.stringify(body) }),
  });
  return request;
}

// Test data
const INVALID_IDS = [
  { id: "not-a-uuid", description: "random string" },
  { id: "12345", description: "numeric string" },
  { id: "", description: "empty string" },
  { id: "'; DROP TABLE users; --", description: "SQL injection" },
  { id: "<script>alert('xss')</script>", description: "XSS attempt" },
  { id: "../../etc/passwd", description: "path traversal" },
  { id: "null", description: "null string" },
  { id: "undefined", description: "undefined string" },
];

const VALID_UUID = "123e4567-e89b-12d3-a456-426614174000";

describe("UUID Validation Integration Tests", () => {

  describe("Admin Enrollments Endpoint", () => {
    let PUT: (request: NextRequest, context: { params: Promise<{ id: string }> }) => Promise<Response>;
    let DELETE: (request: NextRequest, context: { params: Promise<{ id: string }> }) => Promise<Response>;

    beforeAll(async () => {
      const module = await import("@/app/api/admin/enrollments/[id]/route");
      PUT = module.PUT;
      DELETE = module.DELETE;
    });

    INVALID_IDS.forEach(({ id, description }) => {
      it(`PUT returns 400 for ${description}`, async () => {
        const request = createMockRequest(`/api/admin/enrollments/${id}`, "PUT", { progress: 50 });
        const response = await PUT(request, { params: Promise.resolve({ id }) });
        expect(response.status).toBe(400);
        const data = await response.json();
        expect(data.error).toBeDefined();
      });

      it(`DELETE returns 400 for ${description}`, async () => {
        const request = createMockRequest(`/api/admin/enrollments/${id}`, "DELETE");
        const response = await DELETE(request, { params: Promise.resolve({ id }) });
        expect(response.status).toBe(400);
        const data = await response.json();
        expect(data.error).toBeDefined();
      });
    });
  });

  describe("Admin Certificates Reissue Endpoint", () => {
    let POST: (request: NextRequest, context: { params: Promise<{ id: string }> }) => Promise<Response>;

    beforeAll(async () => {
      const module = await import("@/app/api/admin/certificates/[id]/reissue/route");
      POST = module.POST;
    });

    INVALID_IDS.forEach(({ id, description }) => {
      it(`POST returns 400 for ${description}`, async () => {
        const request = createMockRequest(`/api/admin/certificates/${id}/reissue`, "POST");
        const response = await POST(request, { params: Promise.resolve({ id }) });
        expect(response.status).toBe(400);
        const data = await response.json();
        expect(data.error).toBeDefined();
      });
    });
  });

  describe("Admin Certificates Revoke Endpoint", () => {
    let POST: (request: NextRequest, context: { params: Promise<{ id: string }> }) => Promise<Response>;

    beforeAll(async () => {
      const module = await import("@/app/api/admin/certificates/[id]/revoke/route");
      POST = module.POST;
    });

    INVALID_IDS.forEach(({ id, description }) => {
      it(`POST returns 400 for ${description}`, async () => {
        const request = createMockRequest(`/api/admin/certificates/${id}/revoke`, "POST", {});
        const response = await POST(request, { params: Promise.resolve({ id }) });
        expect(response.status).toBe(400);
        const data = await response.json();
        expect(data.error).toBeDefined();
      });
    });
  });

  describe("Support Tickets Endpoint", () => {
    let GET: (request: NextRequest, context: { params: Promise<{ id: string }> }) => Promise<Response>;
    let PATCH: (request: NextRequest, context: { params: Promise<{ id: string }> }) => Promise<Response>;

    beforeAll(async () => {
      const module = await import("@/app/api/support/tickets/[id]/route");
      GET = module.GET;
      PATCH = module.PATCH;
    });

    INVALID_IDS.forEach(({ id, description }) => {
      it(`GET returns 400 for ${description}`, async () => {
        const request = createMockRequest(`/api/support/tickets/${id}`, "GET");
        const response = await GET(request, { params: Promise.resolve({ id }) });
        expect(response.status).toBe(400);
        const data = await response.json();
        expect(data.error).toBeDefined();
      });

      it(`PATCH returns 400 for ${description}`, async () => {
        const request = createMockRequest(`/api/support/tickets/${id}`, "PATCH", { status: "resolved" });
        const response = await PATCH(request, { params: Promise.resolve({ id }) });
        expect(response.status).toBe(400);
        const data = await response.json();
        expect(data.error).toBeDefined();
      });
    });
  });

  describe("Admin Support Tickets Endpoint", () => {
    let GET: (request: NextRequest, context: { params: Promise<{ id: string }> }) => Promise<Response>;

    beforeAll(async () => {
      const module = await import("@/app/api/support/admin/tickets/[id]/route");
      GET = module.GET;
    });

    INVALID_IDS.forEach(({ id, description }) => {
      it(`GET returns 400 for ${description}`, async () => {
        const request = createMockRequest(`/api/support/admin/tickets/${id}`, "GET");
        const response = await GET(request, { params: Promise.resolve({ id }) });
        expect(response.status).toBe(400);
        const data = await response.json();
        expect(data.error).toBeDefined();
      });
    });
  });

  // Test that validation happens BEFORE database queries
  describe("Validation Order", () => {
    it("should return 400 before attempting database query for invalid UUID", async () => {
      // This test ensures validation happens early in the request lifecycle
      const { GET } = await import("@/app/api/support/tickets/[id]/route");

      const invalidId = "invalid-uuid";
      const request = createMockRequest(`/api/support/tickets/${invalidId}`, "GET");
      const response = await GET(request, { params: Promise.resolve({ id: invalidId }) });

      // Should get 400, not 500 (which would indicate a DB error)
      expect(response.status).toBe(400);
    });
  });
});
