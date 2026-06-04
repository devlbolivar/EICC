/**
 * Company & Student Flows Integration Tests
 *
 * Tests:
 * - GET /api/company/employees (company manager sees their employees)
 * - GET /api/student/courses (student sees their enrolled courses)
 * - POST /api/user/change-password (user changes their own password)
 */

// ===== MOCKS =====

jest.mock("@/lib/csrf", () => ({
  requireCsrf: jest.fn().mockResolvedValue(null),
}));

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
      cookies: { set: jest.fn() },
    })),
  },
  NextRequest: jest.fn(),
}));

jest.mock("@/lib/auth", () => ({
  verifyAccessToken: jest.fn(),
}));

jest.mock("@/lib/admin-auth", () => ({
  verifyStudentAuth: jest.fn(),
}));

// Inline db: company/employees and change-password both create their own
// drizzle instance at module level. We return the SAME mock object every time
// so all routes share one controllable db.
jest.mock("@neondatabase/serverless", () => ({
  neon: jest.fn().mockReturnValue({}),
}));

jest.mock("drizzle-orm/neon-http", () => {
  const mockInlineDb = {
    query: {
      usersTable: { findFirst: jest.fn() },
      rolesTable: { findFirst: jest.fn() },
    },
    select: jest.fn(),
    update: jest.fn(),
    insert: jest.fn(),
  };
  return {
    drizzle: jest.fn().mockReturnValue(mockInlineDb),
  };
});

jest.mock("drizzle-orm", () => ({
  eq: jest.fn(() => ({})),
  and: jest.fn(() => ({})),
  like: jest.fn(() => ({})),
  desc: jest.fn(() => ({})),
  asc: jest.fn(() => ({})),
  sql: jest.fn(() => ({})),
  relations: jest.fn(() => ({})),
  count: jest.fn(() => ({})),
}));

// student/courses uses @/lib/database
jest.mock("@/lib/database", () => ({
  db: {
    select: jest.fn(),
    query: { usersTable: { findFirst: jest.fn() } },
  },
}));

jest.mock("bcryptjs", () => ({
  compare: jest.fn(),
  hash: jest.fn().mockResolvedValue("new-hashed-password"),
}));

// ===== IMPORTS =====

import { GET as getEmployees } from "@/app/api/company/employees/route";
import { GET as getStudentCourses } from "@/app/api/student/courses/route";
import { POST as changePassword } from "@/app/api/user/change-password/route";
import { NextRequest } from "next/server";
import { drizzle } from "drizzle-orm/neon-http";
import { db as libDb } from "@/lib/database";
import { verifyAccessToken } from "@/lib/auth";
import { verifyStudentAuth } from "@/lib/admin-auth";
import bcrypt from "bcryptjs";

// ===== TYPED MOCK REFS =====

// This is the same object returned every time drizzle() is called
const mockInlineDb = (drizzle as jest.Mock)() as {
  query: { usersTable: { findFirst: jest.Mock }; rolesTable: { findFirst: jest.Mock } };
  select: jest.Mock;
  update: jest.Mock;
  insert: jest.Mock;
};

const mockLibDb = libDb as { select: jest.Mock };
const mockVerifyAccessToken = verifyAccessToken as jest.Mock;
const mockVerifyStudentAuth = verifyStudentAuth as jest.Mock;
const mockBcryptCompare = bcrypt.compare as unknown as jest.Mock;

// ===== HELPERS =====

const USER_ID = "user-1";
const COMPANY_ID = "company-1";

function makeRequest(
  url: string,
  body: unknown = {},
  cookies: Record<string, string> = {}
): NextRequest {
  return {
    headers: { get: jest.fn(() => null) },
    cookies: {
      get: jest.fn((name: string) =>
        cookies[name] ? { value: cookies[name] } : undefined
      ),
    },
    json: jest.fn().mockResolvedValue(body),
    url,
  } as unknown as NextRequest;
}

/**
 * Creates a thenable fluent chain so any drizzle-style query can be awaited
 * regardless of which chained method is last.
 */
function makeSelectChain(result: unknown) {
  const chain: Record<string, unknown> = {};
  const methods = ["from", "innerJoin", "leftJoin", "where", "orderBy", "limit", "offset", "set", "returning"];
  methods.forEach((m) => {
    chain[m] = jest.fn(() => chain);
  });
  // Make the chain itself a thenable so `await chain` resolves to result
  chain["then"] = (resolve: (val: unknown) => unknown) => Promise.resolve(result).then(resolve);
  chain["catch"] = () => Promise.resolve(result);
  return chain;
}

function makeUpdateChain(resolveWith: unknown = undefined) {
  const chain: Record<string, unknown> = {};
  chain["set"] = jest.fn(() => chain);
  chain["where"] = jest.fn(() => Promise.resolve(resolveWith));
  return chain;
}

// ===== COMPANY EMPLOYEES TESTS =====

describe("GET /api/company/employees", () => {
  const managerPayload = {
    userId: USER_ID,
    companyId: COMPANY_ID,
    permissions: ["company:admin", "users:read"],
    email: "manager@company.com",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockVerifyAccessToken.mockReturnValue(managerPayload);
  });

  it("returns 401 when no access token is provided", async () => {
    mockVerifyAccessToken.mockReturnValue(null);

    const req = makeRequest("http://localhost/api/company/employees");
    const res = await getEmployees(req);

    expect(res.status).toBe(401);
  });

  it("returns 404 when user is not found in database", async () => {
    mockInlineDb.query.usersTable.findFirst.mockResolvedValue(null);

    const req = makeRequest(
      "http://localhost/api/company/employees",
      {},
      { accessToken: "valid-token" }
    );
    const res = await getEmployees(req);

    expect(res.status).toBe(404);
  });

  it("returns 404 when user has no active company association", async () => {
    mockInlineDb.query.usersTable.findFirst.mockResolvedValue({
      id: USER_ID,
      email: "manager@company.com",
    });
    // select().from().where().limit(1) → empty array
    mockInlineDb.select.mockReturnValueOnce(makeSelectChain([]));

    const req = makeRequest(
      "http://localhost/api/company/employees",
      {},
      { accessToken: "valid-token" }
    );
    const res = await getEmployees(req);

    expect(res.status).toBe(404);
  });

  it("returns 200 with employee list for authenticated company manager", async () => {
    mockInlineDb.query.usersTable.findFirst.mockResolvedValue({
      id: USER_ID,
      email: "manager@company.com",
      name: "Manager",
    });

    const mockEmployees = [
      {
        id: "emp-1", name: "Alice", email: "alice@co.com", isActive: true,
        lastLoginAt: null, createdAt: new Date(), joinedAt: new Date(),
        acceptedAt: new Date(), roleName: "student", roleDescription: "Estudiante",
        coursesCompleted: 1, certificatesCount: 0, phone: null, avatar: null,
      },
    ];

    // 1st select: userCompany lookup
    mockInlineDb.select.mockReturnValueOnce(makeSelectChain([{ companyId: COMPANY_ID, userId: USER_ID }]));
    // 2nd select: employee list
    mockInlineDb.select.mockReturnValueOnce(makeSelectChain(mockEmployees));
    // 3rd select: total count
    mockInlineDb.select.mockReturnValueOnce(makeSelectChain([{ count: 1 }]));
    // 4th select: stats
    mockInlineDb.select.mockReturnValueOnce(
      makeSelectChain([{ totalEmployees: 1, activeEmployees: 1, totalCoursesCompleted: 1, totalCertificates: 0 }])
    );

    const req = makeRequest(
      "http://localhost/api/company/employees?page=1&limit=10",
      {},
      { accessToken: "valid-token" }
    );
    const res = await getEmployees(req);

    expect(res.status).toBe(200);
    expect(res.json().success).toBe(true);
    expect(res.json().data.employees).toHaveLength(1);
  });
});

// ===== STUDENT COURSES TESTS =====

describe("GET /api/student/courses", () => {
  const studentPayload = {
    userId: USER_ID,
    companyId: COMPANY_ID,
    permissions: ["courses:enroll"],
    email: "student@company.com",
  };

  const mockEnrolledCourses = [
    {
      id: "course-1",
      name: "Intro TypeScript",
      description: "Aprende TS",
      progress: 75,
      numberOfChapters: 4,
      completedChapters: ["ch1", "ch2", "ch3"],
      isCompleted: false,
      completedAt: null,
      estimatedDuration: "2h",
      updatedAt: new Date(),
      bannerImage: null,
      category: "Tecnología",
      level: "Básico",
      certificateId: null,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockVerifyStudentAuth.mockResolvedValue({ authorized: true, payload: studentPayload });
  });

  it("returns enrolled courses for an authenticated student", async () => {
    const chain = {
      from: jest.fn(() => chain),
      innerJoin: jest.fn(() => chain),
      leftJoin: jest.fn(() => chain),
      where: jest.fn(() => Promise.resolve(mockEnrolledCourses)),
    };
    mockLibDb.select.mockReturnValue(chain);

    const req = makeRequest("http://localhost/api/student/courses", {}, { accessToken: "tok" });
    const res = await getStudentCourses(req);

    expect(res.status).toBe(200);
    expect(res.json().success).toBe(true);
    expect(Array.isArray(res.json().data)).toBe(true);
  });

  it("returns empty array when student has no enrollments", async () => {
    const chain = {
      from: jest.fn(() => chain),
      innerJoin: jest.fn(() => chain),
      leftJoin: jest.fn(() => chain),
      where: jest.fn(() => Promise.resolve([])),
    };
    mockLibDb.select.mockReturnValue(chain);

    const req = makeRequest("http://localhost/api/student/courses", {}, { accessToken: "tok" });
    const res = await getStudentCourses(req);

    expect(res.status).toBe(200);
    expect(res.json().data).toEqual([]);
  });

  it("returns 403 when user is not a student", async () => {
    mockVerifyStudentAuth.mockResolvedValue({
      authorized: false,
      response: {
        json: () => ({ error: "Acceso denegado. Se requiere rol de estudiante" }),
        status: 403,
      },
    });

    const req = makeRequest("http://localhost/api/student/courses");
    const res = await getStudentCourses(req);

    expect(res.status).toBe(403);
  });
});

// ===== CHANGE PASSWORD TESTS =====

describe("POST /api/user/change-password", () => {
  const userPayload = {
    userId: USER_ID,
    email: "user@example.com",
    permissions: ["courses:read"],
  };

  const existingUser = {
    id: USER_ID,
    email: "user@example.com",
    passwordHash: "current-hashed-password",
  };

  const validBody = {
    currentPassword: "OldPass1!",
    newPassword: "NewPass2@",
    confirmPassword: "NewPass2@",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockVerifyAccessToken.mockReturnValue(userPayload);
  });

  it("changes password successfully", async () => {
    mockInlineDb.query.usersTable.findFirst.mockResolvedValue(existingUser);
    mockBcryptCompare
      .mockResolvedValueOnce(true)   // current password correct
      .mockResolvedValueOnce(false); // new password is different

    mockInlineDb.update.mockReturnValue(makeUpdateChain(undefined));

    const req = makeRequest(
      "http://localhost/api/user/change-password",
      validBody,
      { accessToken: "valid-token" }
    );
    const res = await changePassword(req);

    expect(res.status).toBe(200);
    expect(res.json().success).toBe(true);
    expect(res.json().message).toContain("changed successfully");
  });

  it("returns 401 when current password is incorrect", async () => {
    mockInlineDb.query.usersTable.findFirst.mockResolvedValue(existingUser);
    mockBcryptCompare.mockResolvedValue(false);

    const req = makeRequest(
      "http://localhost/api/user/change-password",
      validBody,
      { accessToken: "valid-token" }
    );
    const res = await changePassword(req);

    expect(res.status).toBe(401);
    expect(res.json().error).toContain("incorrect");
  });

  it("returns 400 when new password is the same as current", async () => {
    mockInlineDb.query.usersTable.findFirst.mockResolvedValue(existingUser);
    mockBcryptCompare
      .mockResolvedValueOnce(true)  // current correct
      .mockResolvedValueOnce(true); // same password → rejected

    const req = makeRequest(
      "http://localhost/api/user/change-password",
      validBody,
      { accessToken: "valid-token" }
    );
    const res = await changePassword(req);

    expect(res.status).toBe(400);
    expect(res.json().error).toContain("different");
  });

  it("returns 400 for Zod validation failure (password too short)", async () => {
    const req = makeRequest(
      "http://localhost/api/user/change-password",
      { currentPassword: "OldPass1!", newPassword: "short", confirmPassword: "short" },
      { accessToken: "valid-token" }
    );
    const res = await changePassword(req);

    expect(res.status).toBe(400);
    expect(res.json().error).toContain("Validation");
  });

  it("returns 401 when no access token is provided", async () => {
    mockVerifyAccessToken.mockReturnValue(null);

    const req = makeRequest("http://localhost/api/user/change-password", validBody);
    const res = await changePassword(req);

    expect(res.status).toBe(401);
  });

  it("returns 400 when user account has no password (social login)", async () => {
    mockInlineDb.query.usersTable.findFirst.mockResolvedValue({
      ...existingUser,
      passwordHash: null,
    });

    const req = makeRequest(
      "http://localhost/api/user/change-password",
      validBody,
      { accessToken: "valid-token" }
    );
    const res = await changePassword(req);

    expect(res.status).toBe(400);
    expect(res.json().error).toContain("does not have a password");
  });

  it("returns 404 when user is not found", async () => {
    mockInlineDb.query.usersTable.findFirst.mockResolvedValue(null);

    const req = makeRequest(
      "http://localhost/api/user/change-password",
      validBody,
      { accessToken: "valid-token" }
    );
    const res = await changePassword(req);

    expect(res.status).toBe(404);
  });
});
