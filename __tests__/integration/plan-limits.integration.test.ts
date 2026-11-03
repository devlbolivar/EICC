jest.mock("@/lib/transactional-database", () => ({ transactionalDb: jest.requireMock("@/config/db").db }));
/**
 * Plan Limits Integration Tests
 *
 * Tests the business rules enforced by subscription plans:
 * - Free plan: max 5 employees (invite route)
 * - Free plan: max 3 distinct courses (enroll route)
 * - Free plan: no certificates on completion (enroll PUT)
 * - Starter/Pro: no employee or course limits; certificates enabled
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

jest.mock("next/headers", () => ({
  cookies: jest.fn(() => ({
    get: jest.fn((name: string) =>
      name === "accessToken" ? { value: "mock-token" } : undefined
    ),
    set: jest.fn(),
  })),
}));

jest.mock("@/lib/validation", () => ({
  validateUUID: jest.fn().mockReturnValue({ isValid: true }),
}));

// Enroll route imports db from @/config/db
jest.mock("@/config/db", () => ({
  db: {
    execute: jest.fn(),
    transaction: jest.fn(),
  },
}));

// Invite route creates its own db via neon + drizzle at module level.
// We mock those packages so the route's db instance uses our fakes.
jest.mock("@neondatabase/serverless", () => ({
  neon: jest.fn().mockReturnValue({}),
}));

jest.mock("drizzle-orm/neon-http", () => ({
  drizzle: jest.fn().mockReturnValue({
    query: {
      companiesTable: { findFirst: jest.fn() },
      userCompaniesTable: { findMany: jest.fn(), findFirst: jest.fn() },
      rolesTable: { findFirst: jest.fn() },
      invitationTokensTable: { findFirst: jest.fn() },
    },
    insert: jest.fn(),
  }),
}));

jest.mock("@/lib/auth", () => ({
  verifyAccessToken: jest.fn(),
  generateInvitationToken: jest.fn().mockReturnValue("test-invite-token"),
  addDays: jest.fn().mockReturnValue(new Date("2026-06-03")),
  sanitizeEmail: jest.fn((email: string) => email.toLowerCase().trim()),
  validateEmail: jest.fn().mockReturnValue(true),
}));

// Needed for Starter/Pro completion tests: route dynamically imports these
jest.mock("@/lib/certificate-service", () => ({
  createCertificateData: jest.fn().mockReturnValue({ certificateId: "test-cert-id-123" }),
}));

jest.mock("@/config/schema", () => ({
  certificatesTable: {},
  companiesTable: {},
  userCompaniesTable: {},
  rolesTable: {},
  invitationTokensTable: {},
  usersTable: {},
  coursesTable: {},
  enrollCourseTable: {},
}));

// ===== IMPORTS =====

import { POST as enrollPost, PUT as enrollPut } from "@/app/api/courses/[id]/enroll/route";
import { POST as invitePost } from "@/app/api/auth/invite/route";
import { NextRequest } from "next/server";
import { db } from "@/config/db";
import { drizzle } from "drizzle-orm/neon-http";
import { verifyAccessToken } from "@/lib/auth";

// ===== TYPED MOCK REFS =====

const mockDb = db as { execute: jest.Mock; transaction: jest.Mock };
const mockVerifyAccessToken = verifyAccessToken as jest.Mock;

// Get the invite route's db instance (created when module loads via drizzle mock)
const mockDrizzle = drizzle as jest.Mock;

// ===== CONSTANTS =====

const COURSE_ID = "11111111-1111-1111-1111-111111111111";
const COMPANY_ID = "22222222-2222-2222-2222-222222222222";
const USER_ID = "33333333-3333-3333-3333-333333333333";

// ===== HELPERS =====

function makeRequest(body: unknown, extraHeaders: Record<string, string> = {}): NextRequest {
  return {
    headers: {
      get: jest.fn((key: string) => extraHeaders[key] ?? null),
    },
    cookies: {
      get: jest.fn((name: string) =>
        name === "accessToken" ? { value: "mock-token" } : undefined
      ),
    },
    json: jest.fn().mockResolvedValue(body),
  } as unknown as NextRequest;
}

function makeParams(id: string) {
  return { params: Promise.resolve({ id }) };
}

/** Returns the db object the invite route created via drizzle() */
function getInviteDb() {
  // drizzle() is called once at module load — return the mock that was returned
  return mockDrizzle.mock.results[0]?.value ?? mockDrizzle();
}

// ===== PLAN LIMITS: EMPLOYEE INVITE =====

describe("Plan Limits: Employee Invite", () => {
  const adminPayload = {
    userId: USER_ID,
    companyId: COMPANY_ID,
    permissions: ["users:invite"],
    email: "admin@company.com",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockVerifyAccessToken.mockReturnValue(adminPayload);
  });

  it("blocks invite when Free plan is at max employees (5)", async () => {
    const idb = getInviteDb();
    idb.query.companiesTable.findFirst.mockResolvedValue({
      id: COMPANY_ID,
      name: "Test Co",
      subscriptionPlan: "free",
    });
    idb.query.userCompaniesTable.findMany.mockResolvedValue(
      Array.from({ length: 5 }, (_, i) => ({ id: `uc-${i}` }))
    );

    const req = makeRequest({ email: "new@example.com", roleName: "student", companyId: COMPANY_ID });
    const res = await invitePost(req);

    expect(res.status).toBe(403);
    const body = res.json();
    expect(body.code).toBe("EMPLOYEE_LIMIT_REACHED");
    expect(body.error).toContain("5");
  });

  it("allows invite on Free plan when below employee limit (4 employees)", async () => {
    const idb = getInviteDb();
    idb.query.companiesTable.findFirst.mockResolvedValue({
      id: COMPANY_ID,
      name: "Test Co",
      subscriptionPlan: "free",
    });
    idb.query.userCompaniesTable.findMany.mockResolvedValue(
      Array.from({ length: 4 }, (_, i) => ({ id: `uc-${i}` }))
    );
    idb.query.rolesTable.findFirst.mockResolvedValue({ id: "role-student", name: "student" });
    idb.query.invitationTokensTable.findFirst.mockResolvedValue(null);
    idb.query.userCompaniesTable.findFirst.mockResolvedValue(null);
    idb.insert.mockReturnValue({
      values: jest.fn(() => ({
        returning: jest.fn().mockResolvedValue([
          { id: "inv-1", email: "new@example.com", expiresAt: new Date("2026-06-03") },
        ]),
      })),
    });

    const req = makeRequest({ email: "new@example.com", roleName: "student", companyId: COMPANY_ID });
    const res = await invitePost(req);

    expect(res.status).toBe(200);
    expect(res.json().success).toBe(true);
  });

  it("blocks invite on Starter plan at max employees (20)", async () => {
    const idb = getInviteDb();
    idb.query.companiesTable.findFirst.mockResolvedValue({
      id: COMPANY_ID,
      name: "Big Co",
      subscriptionPlan: "starter",
    });
    idb.query.userCompaniesTable.findMany.mockResolvedValue(
      Array.from({ length: 20 }, (_, i) => ({ id: `uc-${i}` }))
    );

    const req = makeRequest({ email: "new@example.com", roleName: "student", companyId: COMPANY_ID });
    const res = await invitePost(req);

    expect(res.status).toBe(403);
    const body = res.json();
    expect(body.code).toBe("EMPLOYEE_LIMIT_REACHED");
    expect(body.error).toContain("20");
  });

  it("blocks invite on Pro plan at max employees (50)", async () => {
    const idb = getInviteDb();
    idb.query.companiesTable.findFirst.mockResolvedValue({
      id: COMPANY_ID,
      name: "Enterprise Co",
      subscriptionPlan: "pro",
    });
    idb.query.userCompaniesTable.findMany.mockResolvedValue(
      Array.from({ length: 50 }, (_, i) => ({ id: `uc-${i}` }))
    );

    const req = makeRequest({ email: "new@example.com", roleName: "student", companyId: COMPANY_ID });
    const res = await invitePost(req);

    expect(res.status).toBe(403);
    const body = res.json();
    expect(body.code).toBe("EMPLOYEE_LIMIT_REACHED");
    expect(body.error).toContain("50");
  });

  it("returns 401 when no token is provided", async () => {
    mockVerifyAccessToken.mockReturnValue(null);

    const req = makeRequest({ email: "new@example.com", roleName: "student", companyId: COMPANY_ID });
    const res = await invitePost(req);

    expect(res.status).toBe(401);
  });

  it("returns 403 when caller lacks users:invite permission", async () => {
    mockVerifyAccessToken.mockReturnValue({ ...adminPayload, permissions: ["courses:read"] });

    const req = makeRequest({ email: "new@example.com", roleName: "student", companyId: COMPANY_ID });
    const res = await invitePost(req);

    expect(res.status).toBe(403);
  });

  it("returns 400 when required fields are missing", async () => {
    const req = makeRequest({ email: "new@example.com" }); // missing roleName + companyId
    const res = await invitePost(req);

    expect(res.status).toBe(400);
  });

  it("returns 404 when company does not exist", async () => {
    const idb = getInviteDb();
    idb.query.companiesTable.findFirst.mockResolvedValue(null);

    const req = makeRequest({ email: "new@example.com", roleName: "student", companyId: COMPANY_ID });
    const res = await invitePost(req);

    expect(res.status).toBe(404);
  });

  it("returns 409 when there is already a pending invitation", async () => {
    const idb = getInviteDb();
    idb.query.companiesTable.findFirst.mockResolvedValue({
      id: COMPANY_ID,
      name: "Test Co",
      subscriptionPlan: "free",
    });
    idb.query.userCompaniesTable.findMany.mockResolvedValue([{ id: "uc-1" }]);
    idb.query.invitationTokensTable.findFirst.mockResolvedValue({ id: "inv-existing" });

    const req = makeRequest({ email: "new@example.com", roleName: "student", companyId: COMPANY_ID });
    const res = await invitePost(req);

    expect(res.status).toBe(409);
  });
});

// ===== PLAN LIMITS: COURSE ENROLLMENT =====

describe("Plan Limits: Course Enrollment (POST)", () => {
  const studentPayload = {
    userId: USER_ID,
    companyId: COMPANY_ID,
    permissions: ["courses:enroll"],
    email: "student@company.com",
  };

  const mockCourse = {
    id: COURSE_ID,
    cid: "cid-1",
    isActive: true,
    isPublic: true,
    visibility: "public",
    companyId: null,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockVerifyAccessToken.mockReturnValue(studentPayload);
  });

  it("blocks enrollment on Free plan when 3 distinct courses already accessed", async () => {
    mockDb.execute
      .mockResolvedValueOnce({ rows: [mockCourse] })                    // course exists
      .mockResolvedValueOnce({ rows: [{ subscriptionPlan: "free" }] }) // company plan
      .mockResolvedValueOnce({ rows: [{ count: "3" }] })               // distinct count = 3
      .mockResolvedValueOnce({ rows: [] });                             // not enrolled in this course

    const req = makeRequest({});
    const res = await enrollPost(req, makeParams(COURSE_ID));

    expect(res.status).toBe(403);
    const body = res.json();
    expect(body.code).toBe("COURSE_LIMIT_REACHED");
    expect(body.error).toContain("3");
  });

  it("allows enrollment on Free plan when already enrolled in the same course (at limit)", async () => {
    mockDb.execute
      .mockResolvedValueOnce({ rows: [mockCourse] })
      .mockResolvedValueOnce({ rows: [{ subscriptionPlan: "free" }] })
      .mockResolvedValueOnce({ rows: [{ count: "3" }] })
      .mockResolvedValueOnce({ rows: [{ id: "enroll-1" }] }); // already enrolled → skip limit

    // transaction throws because of ON CONFLICT DO NOTHING
    mockDb.transaction.mockImplementation(async (cb: (tx: unknown) => Promise<unknown>) => {
      const tx = { execute: jest.fn().mockRejectedValueOnce(new Error("ALREADY_ENROLLED")) };
      return cb(tx);
    });

    const req = makeRequest({});
    const res = await enrollPost(req, makeParams(COURSE_ID));

    expect(res.status).toBe(409);
    expect(res.json().error).toContain("Ya estás inscrito");
  });

  it("allows enrollment on Free plan when below limit (2 distinct courses)", async () => {
    mockDb.execute
      .mockResolvedValueOnce({ rows: [mockCourse] })
      .mockResolvedValueOnce({ rows: [{ subscriptionPlan: "free" }] })
      .mockResolvedValueOnce({ rows: [{ count: "2" }] })
      .mockResolvedValueOnce({ rows: [] }); // not enrolled yet

    mockDb.transaction.mockImplementation(async (cb: (tx: unknown) => Promise<unknown>) => {
      const tx = {
        execute: jest.fn().mockResolvedValueOnce({
          rows: [{ id: "enroll-new", course_id: COURSE_ID, user_id: USER_ID }],
        }),
      };
      return cb(tx);
    });

    const req = makeRequest({});
    const res = await enrollPost(req, makeParams(COURSE_ID));

    expect(res.status).toBe(201);
    expect(res.json().success).toBe(true);
  });

  it("allows unlimited enrollment on Starter plan (no distinct course limit)", async () => {
    mockDb.execute
      .mockResolvedValueOnce({ rows: [mockCourse] })
      .mockResolvedValueOnce({ rows: [{ subscriptionPlan: "starter" }] });
    // No distinct count query — Infinity limit skips that block

    mockDb.transaction.mockImplementation(async (cb: (tx: unknown) => Promise<unknown>) => {
      const tx = {
        execute: jest.fn().mockResolvedValueOnce({
          rows: [{ id: "enroll-new", course_id: COURSE_ID, user_id: USER_ID }],
        }),
      };
      return cb(tx);
    });

    const req = makeRequest({});
    const res = await enrollPost(req, makeParams(COURSE_ID));

    expect(res.status).toBe(201);
  });

  it("allows unlimited enrollment on Pro plan", async () => {
    mockDb.execute
      .mockResolvedValueOnce({ rows: [mockCourse] })
      .mockResolvedValueOnce({ rows: [{ subscriptionPlan: "pro" }] });

    mockDb.transaction.mockImplementation(async (cb: (tx: unknown) => Promise<unknown>) => {
      const tx = {
        execute: jest.fn().mockResolvedValueOnce({
          rows: [{ id: "enroll-new", course_id: COURSE_ID, user_id: USER_ID }],
        }),
      };
      return cb(tx);
    });

    const req = makeRequest({});
    const res = await enrollPost(req, makeParams(COURSE_ID));

    expect(res.status).toBe(201);
  });

  it("returns 401 when no access token", async () => {
    mockVerifyAccessToken.mockReturnValue(null);

    const req = makeRequest({});
    const res = await enrollPost(req, makeParams(COURSE_ID));

    expect(res.status).toBe(401);
  });

  it("returns 403 when user lacks courses:enroll permission", async () => {
    mockVerifyAccessToken.mockReturnValue({ ...studentPayload, permissions: ["courses:read"] });
    mockDb.execute.mockResolvedValueOnce({ rows: [mockCourse] });

    const req = makeRequest({});
    const res = await enrollPost(req, makeParams(COURSE_ID));

    expect(res.status).toBe(403);
  });

  it("returns 404 when course does not exist", async () => {
    mockDb.execute.mockResolvedValueOnce({ rows: [] });

    const req = makeRequest({});
    const res = await enrollPost(req, makeParams(COURSE_ID));

    expect(res.status).toBe(404);
  });
});

// ===== PLAN LIMITS: CERTIFICATE GATE =====

describe("Plan Limits: Certificate Gate on Course Completion (PUT)", () => {
  const studentPayload = {
    userId: USER_ID,
    companyId: COMPANY_ID,
    permissions: ["courses:enroll"],
    email: "student@company.com",
  };

  const incompleteEnrollment = {
    id: "enroll-1",
    course_id: COURSE_ID,
    user_id: USER_ID,
    progress: 80,
    isCompleted: false,
    completedAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const completedEnrollmentRow = {
    ...incompleteEnrollment,
    isCompleted: true,
    progress: 100,
    completedAt: new Date().toISOString(),
  };

  const mockCourseRow = {
    id: COURSE_ID,
    name: "Test Course",
    description: "A test",
    cid: "cid-1",
    isActive: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockVerifyAccessToken.mockReturnValue(studentPayload);
  });

  it("completes course on Free plan WITHOUT generating a certificate", async () => {
    // Outer DB calls: existing enrollment + course details
    mockDb.execute
      .mockResolvedValueOnce({ rows: [incompleteEnrollment] })
      .mockResolvedValueOnce({ rows: [mockCourseRow] });

    // Transaction: update enrollment + company plan (Free)
    mockDb.transaction.mockImplementation(async (cb: (tx: unknown) => Promise<unknown>) => {
      const tx = {
        execute: jest.fn()
          .mockResolvedValueOnce({ rows: [completedEnrollmentRow] })   // update enrollment
          .mockResolvedValueOnce({ rows: [{ subscriptionPlan: "free" }] }), // company plan
        insert: jest.fn(),
      };
      return cb(tx);
    });

    const req = makeRequest({ isCompleted: true, progress: 100, completedChapters: ["ch1"] });
    const res = await enrollPut(req, makeParams(COURSE_ID));

    expect(res.status).toBe(200);
    const body = res.json();
    expect(body.success).toBe(true);
    // Free plan: no certificate should be generated
    expect(body.data.certificateGenerated).toBe(false);
  });

  it("returns 404 when user is not enrolled in the course", async () => {
    mockDb.execute.mockResolvedValueOnce({ rows: [] });

    const req = makeRequest({ isCompleted: true, progress: 100 });
    const res = await enrollPut(req, makeParams(COURSE_ID));

    expect(res.status).toBe(404);
    expect(res.json().error).toContain("No estás inscrito");
  });

  it("returns 401 when no access token", async () => {
    mockVerifyAccessToken.mockReturnValue(null);

    const req = makeRequest({ progress: 50 });
    const res = await enrollPut(req, makeParams(COURSE_ID));

    expect(res.status).toBe(401);
  });

  it("updates progress without completing (no certificate check)", async () => {
    mockDb.execute.mockResolvedValueOnce({ rows: [incompleteEnrollment] });

    mockDb.transaction.mockImplementation(async (cb: (tx: unknown) => Promise<unknown>) => {
      const tx = {
        execute: jest.fn()
          .mockResolvedValueOnce({ rows: [{ ...incompleteEnrollment, progress: 60 }] })
          .mockResolvedValueOnce({ rows: [{ subscriptionPlan: "free" }] }),
        insert: jest.fn(),
      };
      return cb(tx);
    });

    const req = makeRequest({ progress: 60, completedChapters: ["ch1"] });
    const res = await enrollPut(req, makeParams(COURSE_ID));

    expect(res.status).toBe(200);
    expect(res.json().data.certificateGenerated).toBe(false);
  });
});

// ===== PLAN LIMITS: CERTIFICATE GENERATION ON PAID PLANS =====

describe("Plan Limits: Certificate Generation on Starter/Pro Completion (PUT)", () => {
  const studentPayload = {
    userId: USER_ID,
    companyId: COMPANY_ID,
    permissions: ["courses:enroll"],
    email: "student@company.com",
  };

  const incompleteEnrollment = {
    id: "enroll-paid-1",
    course_id: COURSE_ID,
    user_id: USER_ID,
    progress: 80,
    isCompleted: false,
    completedAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const completedEnrollmentRow = {
    ...incompleteEnrollment,
    isCompleted: true,
    progress: 100,
    completedAt: new Date().toISOString(),
  };

  const mockCourseRow = {
    id: COURSE_ID,
    name: "TypeScript Avanzado",
    description: "Aprende TypeScript",
    cid: "cid-ts",
    isActive: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockVerifyAccessToken.mockReturnValue(studentPayload);
  });

  it("generates a certificate when a Starter plan student completes a course", async () => {
    // Outer: existing enrollment check + course row fetch (because justCompleted = true)
    mockDb.execute
      .mockResolvedValueOnce({ rows: [incompleteEnrollment] })
      .mockResolvedValueOnce({ rows: [mockCourseRow] });

    mockDb.transaction.mockImplementation(async (cb: (tx: unknown) => Promise<unknown>) => {
      const tx = {
        execute: jest.fn()
          .mockResolvedValueOnce({ rows: [completedEnrollmentRow] })          // update enrollment
          .mockResolvedValueOnce({ rows: [{ subscriptionPlan: "starter" }] }) // company plan
          .mockResolvedValueOnce({ rows: [] }),                                // no existing cert
        insert: jest.fn().mockReturnValue({
          values: jest.fn().mockResolvedValue(undefined),
        }),
      };
      return cb(tx);
    });

    const req = makeRequest({ isCompleted: true, progress: 100, completedChapters: ["ch1", "ch2"] });
    const res = await enrollPut(req, makeParams(COURSE_ID));

    expect(res.status).toBe(200);
    expect(res.json().success).toBe(true);
    expect(res.json().data.certificateGenerated).toBe(true);
  });

  it("generates a certificate when a Pro plan student completes a course", async () => {
    mockDb.execute
      .mockResolvedValueOnce({ rows: [incompleteEnrollment] })
      .mockResolvedValueOnce({ rows: [mockCourseRow] });

    mockDb.transaction.mockImplementation(async (cb: (tx: unknown) => Promise<unknown>) => {
      const tx = {
        execute: jest.fn()
          .mockResolvedValueOnce({ rows: [completedEnrollmentRow] })
          .mockResolvedValueOnce({ rows: [{ subscriptionPlan: "pro" }] })
          .mockResolvedValueOnce({ rows: [] }), // no existing cert
        insert: jest.fn().mockReturnValue({
          values: jest.fn().mockResolvedValue(undefined),
        }),
      };
      return cb(tx);
    });

    const req = makeRequest({ isCompleted: true, progress: 100, completedChapters: ["ch1", "ch2"] });
    const res = await enrollPut(req, makeParams(COURSE_ID));

    expect(res.status).toBe(200);
    expect(res.json().data.certificateGenerated).toBe(true);
  });

  it("does NOT generate a duplicate certificate when one already exists for the same user+course", async () => {
    mockDb.execute
      .mockResolvedValueOnce({ rows: [incompleteEnrollment] })
      .mockResolvedValueOnce({ rows: [mockCourseRow] });

    const insertMock = jest.fn();
    mockDb.transaction.mockImplementation(async (cb: (tx: unknown) => Promise<unknown>) => {
      const tx = {
        execute: jest.fn()
          .mockResolvedValueOnce({ rows: [completedEnrollmentRow] })
          .mockResolvedValueOnce({ rows: [{ subscriptionPlan: "starter" }] })
          .mockResolvedValueOnce({ rows: [{ id: "existing-cert-id" }] }), // cert already exists
        insert: insertMock,
      };
      return cb(tx);
    });

    const req = makeRequest({ isCompleted: true, progress: 100, completedChapters: ["ch1"] });
    const res = await enrollPut(req, makeParams(COURSE_ID));

    expect(res.status).toBe(200);
    // Certificate already existed — no new one created
    expect(res.json().data.certificateGenerated).toBe(false);
    expect(insertMock).not.toHaveBeenCalled();
  });

  it("completes the enrollment even when course row is missing (no certificate, no crash)", async () => {
    // First outer call returns existing enrollment
    mockDb.execute
      .mockResolvedValueOnce({ rows: [incompleteEnrollment] })
      .mockResolvedValueOnce({ rows: [] }); // course not found — no cert generation

    mockDb.transaction.mockImplementation(async (cb: (tx: unknown) => Promise<unknown>) => {
      const tx = {
        execute: jest.fn()
          .mockResolvedValueOnce({ rows: [completedEnrollmentRow] })
          .mockResolvedValueOnce({ rows: [{ subscriptionPlan: "starter" }] }),
        insert: jest.fn(),
      };
      return cb(tx);
    });

    const req = makeRequest({ isCompleted: true, progress: 100 });
    const res = await enrollPut(req, makeParams(COURSE_ID));

    expect(res.status).toBe(200);
    expect(res.json().data.certificateGenerated).toBe(false);
  });
});
