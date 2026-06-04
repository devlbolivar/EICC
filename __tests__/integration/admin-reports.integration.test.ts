/**
 * Admin Reports Integration Tests
 *
 * Tests GET /api/admin/reports for:
 * - Authentication & authorization
 * - Required `type` query parameter
 * - All report categories: financial, users, courses, companies
 * - CSV format output via `format=csv`
 * - Unknown report type rejection
 */

// ===== MOCKS =====

jest.mock("@/lib/admin-auth", () => ({
  verifyAdminAuth: jest.fn(),
}));

// NextResponse must handle both static .json() and constructor new NextResponse()
// (CSV reports use `new NextResponse(csv, { headers: { ... } })`)
jest.mock("next/server", () => ({
  NextResponse: Object.assign(
    jest.fn().mockImplementation(
      (body: unknown, init?: { headers?: Record<string, string>; status?: number }) => ({
        _body: body,
        headers: init?.headers ?? {},
        status: init?.status ?? 200,
      })
    ),
    {
      json: jest.fn((data: unknown, options?: { status?: number }) => ({
        json: () => data,
        status: options?.status ?? 200,
      })),
    }
  ),
  NextRequest: jest.fn(),
}));

jest.mock("@/config/schema", () => ({
  usersTable: { id: "id", name: "name", email: "email" },
  enrollCourseTable: { id: "id", userId: "userId", isCompleted: "isCompleted" },
  certificatesTable: { id: "id", userId: "userId", courseId: "courseId", grade: "grade" },
  coursesTable: { id: "id", name: "name", category: "category" },
  companiesTable: { id: "id", name: "name" },
}));

jest.mock("drizzle-orm", () => ({
  eq: jest.fn(() => ({})),
  sql: jest.fn((..._args: unknown[]) => ({ _sql: true })),
  relations: jest.fn(() => ({})),
  count: jest.fn(() => ({})),
}));

jest.mock("@/lib/database", () => ({
  db: {
    execute: jest.fn(),
    select: jest.fn(),
  },
}));

// ===== IMPORTS =====

import { GET as getReport } from "@/app/api/admin/reports/route";
import { NextRequest } from "next/server";
import { db } from "@/lib/database";
import { verifyAdminAuth } from "@/lib/admin-auth";

// ===== TYPED REFS =====

const mockDb = db as { execute: jest.Mock; select: jest.Mock };
const mockVerifyAdminAuth = verifyAdminAuth as jest.Mock;

// ===== CONSTANTS =====

const ADMIN_PAYLOAD = {
  userId: "admin-id",
  permissions: ["platform:admin"],
  email: "admin@platform.com",
};

// ===== HELPERS =====

function makeRequest(params: Record<string, string>): NextRequest {
  const url = new URL("http://localhost/api/admin/reports");
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  return {
    url: url.toString(),
    headers: { get: jest.fn(() => null) },
    cookies: { get: jest.fn(() => ({ value: "admin-token" })) },
    json: jest.fn().mockResolvedValue({}),
  } as unknown as NextRequest;
}

function makeSelectChain(rows: unknown[]) {
  const chain: Record<string, unknown> = {};
  ["from", "leftJoin", "innerJoin", "where", "groupBy", "orderBy", "having", "limit"].forEach(
    (m) => { chain[m] = jest.fn(() => chain); }
  );
  chain["then"] = (resolve: (v: unknown) => unknown) => Promise.resolve(rows).then(resolve);
  chain["catch"] = () => Promise.resolve(rows);
  return chain;
}

// ===== AUTH & AUTHORIZATION =====

describe("GET /api/admin/reports – Authentication", () => {
  beforeEach(() => { jest.clearAllMocks(); });

  it("returns 401 when not authenticated", async () => {
    mockVerifyAdminAuth.mockResolvedValue({
      authorized: false,
      response: { json: () => ({ error: "Token requerido" }), status: 401 },
    });

    const res = await getReport(makeRequest({ type: "financial-monthly" }));

    expect(res.status).toBe(401);
  });

  it("returns 403 when caller lacks admin permissions", async () => {
    mockVerifyAdminAuth.mockResolvedValue({
      authorized: false,
      response: { json: () => ({ error: "Permisos insuficientes" }), status: 403 },
    });

    const res = await getReport(makeRequest({ type: "financial-monthly" }));

    expect(res.status).toBe(403);
  });
});

// ===== PARAMETER VALIDATION =====

describe("GET /api/admin/reports – Parameter Validation", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockVerifyAdminAuth.mockResolvedValue({ authorized: true, payload: ADMIN_PAYLOAD });
  });

  it("returns 400 when 'type' query param is missing", async () => {
    const res = await getReport(makeRequest({}));

    expect(res.status).toBe(400);
    expect(res.json().error).toContain("requerido");
  });

  it("returns 400 for an unrecognized report type", async () => {
    const res = await getReport(makeRequest({ type: "totally-unknown-report" }));

    expect(res.status).toBe(400);
    expect(res.json().error).toContain("no válido");
  });
});

// ===== FINANCIAL REPORTS =====

describe("GET /api/admin/reports – Financial Reports (JSON)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockVerifyAdminAuth.mockResolvedValue({ authorized: true, payload: ADMIN_PAYLOAD });
  });

  it("returns monthly revenue data for 'financial-monthly'", async () => {
    mockDb.execute.mockResolvedValue({
      rows: [{ month: "2026-05-01", subscriptions: 12, revenue: 1548 }],
    });

    const res = await getReport(makeRequest({ type: "financial-monthly" }));

    expect(res.status).toBe(200);
    expect(res.json().success).toBe(true);
    expect(res.json().data[0].revenue).toBe(1548);
    expect(res.json().filename).toContain("ingresos-mensuales");
  });

  it("returns per-plan breakdown for 'financial-plans'", async () => {
    mockDb.execute.mockResolvedValue({
      rows: [
        { plan: "pro", count: 5, total_revenue: 645, avg_revenue: 129 },
        { plan: "starter", count: 8, total_revenue: 392, avg_revenue: 49 },
      ],
    });

    const res = await getReport(makeRequest({ type: "financial-plans" }));

    expect(res.status).toBe(200);
    expect(res.json().data).toHaveLength(2);
    expect(res.json().data[0].plan).toBe("pro");
  });

  it("returns churn rates for 'financial-churn'", async () => {
    mockDb.execute.mockResolvedValue({
      rows: [{ month: "2026-05-01", total_subscriptions: 20, cancelled: 2, churn_rate: 10 }],
    });

    const res = await getReport(makeRequest({ type: "financial-churn" }));

    expect(res.status).toBe(200);
    expect(res.json().data[0].churn_rate).toBe(10);
  });

  it("returns empty data array when no active subscriptions exist", async () => {
    mockDb.execute.mockResolvedValue({ rows: [] });

    const res = await getReport(makeRequest({ type: "financial-monthly" }));

    expect(res.status).toBe(200);
    expect(res.json().data).toEqual([]);
  });
});

// ===== USER REPORTS =====

describe("GET /api/admin/reports – User Reports (JSON)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockVerifyAdminAuth.mockResolvedValue({ authorized: true, payload: ADMIN_PAYLOAD });
  });

  it("returns monthly user counts for 'users-monthly'", async () => {
    mockDb.execute.mockResolvedValue({
      rows: [{ month: "2026-05-01", count: 35, admins: 2, users: 33 }],
    });

    const res = await getReport(makeRequest({ type: "users-monthly" }));

    expect(res.status).toBe(200);
    expect(res.json().data[0].count).toBe(35);
  });

  it("returns enrollment and cert counts per user for 'users-activity' (db.select chain)", async () => {
    mockDb.select.mockReturnValue(
      makeSelectChain([
        { id: "u1", name: "Alice", email: "alice@co.com", enrollments: 3, completedCourses: 2, certificates: 2 },
      ])
    );

    const res = await getReport(makeRequest({ type: "users-activity" }));

    expect(res.status).toBe(200);
    expect(res.json().data[0].certificates).toBe(2);
  });

  it("returns role distribution for 'users-by-role'", async () => {
    mockDb.execute.mockResolvedValue({
      rows: [
        { role: "student", count: 50, percentage: 85.5 },
        { role: "company", count: 8, percentage: 13.6 },
      ],
    });

    const res = await getReport(makeRequest({ type: "users-by-role" }));

    expect(res.status).toBe(200);
    expect(res.json().data).toHaveLength(2);
  });
});

// ===== COURSE REPORTS =====

describe("GET /api/admin/reports – Course Reports (JSON)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockVerifyAdminAuth.mockResolvedValue({ authorized: true, payload: ADMIN_PAYLOAD });
  });

  it("returns enrollment counts per course for 'courses-popular' (db.select chain)", async () => {
    mockDb.select.mockReturnValue(
      makeSelectChain([
        { id: "c1", name: "TypeScript", category: "Tech", enrollments: 30, completions: 20, certificates: 18 },
      ])
    );

    const res = await getReport(makeRequest({ type: "courses-popular" }));

    expect(res.status).toBe(200);
    expect(res.json().data[0].enrollments).toBe(30);
  });

  it("returns completion rates for 'courses-completion'", async () => {
    mockDb.execute.mockResolvedValue({
      rows: [{ id: "c1", name: "TypeScript", category: "Tech", total_enrollments: 20, completed: 15, completion_rate: 75 }],
    });

    const res = await getReport(makeRequest({ type: "courses-completion" }));

    expect(res.status).toBe(200);
    expect(res.json().data[0].completion_rate).toBe(75);
  });

  it("returns avg grade per course for 'courses-ratings' (db.select chain)", async () => {
    mockDb.select.mockReturnValue(
      makeSelectChain([
        { id: "c1", name: "TypeScript", category: "Tech", avgGrade: 88.5, totalCertificates: 15 },
      ])
    );

    const res = await getReport(makeRequest({ type: "courses-ratings" }));

    expect(res.status).toBe(200);
    expect(res.json().data[0].avgGrade).toBe(88.5);
  });
});

// ===== COMPANY REPORTS =====

describe("GET /api/admin/reports – Company Reports (JSON)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockVerifyAdminAuth.mockResolvedValue({ authorized: true, payload: ADMIN_PAYLOAD });
  });

  it("returns activity metrics per company for 'companies-activity'", async () => {
    mockDb.execute.mockResolvedValue({
      rows: [{ id: "co1", name: "Acme", totalUsers: 10, totalEnrollments: 25, completedCourses: 18, certificates: 15 }],
    });

    const res = await getReport(makeRequest({ type: "companies-activity" }));

    expect(res.status).toBe(200);
    expect(res.json().data[0].name).toBe("Acme");
  });

  it("returns plan distribution for 'companies-by-plan'", async () => {
    mockDb.execute.mockResolvedValue({
      rows: [
        { plan: "starter", companies: 7, active: 6, inactive: 1 },
        { plan: "pro", companies: 3, active: 3, inactive: 0 },
      ],
    });

    const res = await getReport(makeRequest({ type: "companies-by-plan" }));

    expect(res.status).toBe(200);
    expect(res.json().data[0].plan).toBe("starter");
  });

  it("returns renewal schedule for 'companies-renewals'", async () => {
    mockDb.execute.mockResolvedValue({
      rows: [{ id: "co1", name: "Acme", plan: "pro", startDate: "2026-05-01", endDate: "2026-06-01", status: "Activa" }],
    });

    const res = await getReport(makeRequest({ type: "companies-renewals" }));

    expect(res.status).toBe(200);
    expect(res.json().data[0].status).toBe("Activa");
  });
});

// ===== CSV FORMAT =====

describe("GET /api/admin/reports – CSV Format", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockVerifyAdminAuth.mockResolvedValue({ authorized: true, payload: ADMIN_PAYLOAD });
    mockDb.execute.mockResolvedValue({
      rows: [{ month: "2026-05-01", subscriptions: 5, revenue: 645 }],
    });
  });

  it("returns a response with text/csv content-type header when format=csv", async () => {
    const res = await getReport(makeRequest({ type: "financial-monthly", format: "csv" }));

    // Route uses `new NextResponse(csv, { headers: { "Content-Type": "text/csv" } })`
    // Our mock wraps this as { _body, headers, status }
    expect(res).toBeDefined();
    const csvRes = res as { _body: string; headers: Record<string, string> };
    expect(csvRes.headers?.["Content-Type"]).toBe("text/csv");
  });

  it("includes a Content-Disposition attachment header with filename", async () => {
    const res = await getReport(makeRequest({ type: "financial-monthly", format: "csv" }));

    const csvRes = res as { headers: Record<string, string> };
    expect(csvRes.headers?.["Content-Disposition"]).toContain("attachment");
    expect(csvRes.headers?.["Content-Disposition"]).toContain(".csv");
  });

  it("includes column headers and data rows in the CSV body", async () => {
    const res = await getReport(makeRequest({ type: "financial-monthly", format: "csv" }));

    const csvRes = res as { _body: string };
    expect(typeof csvRes._body).toBe("string");
    expect(csvRes._body).toContain("month");
    expect(csvRes._body).toContain("revenue");
  });
});
