/**
 * Admin Certificates Integration Tests
 *
 * Tests:
 * - GET /api/admin/certificates — list all certificates
 * - POST /api/admin/certificates/[id]/revoke — soft-delete (isActive = false)
 * - POST /api/admin/certificates/[id]/reissue — create replacement, revoke old
 *
 * Business rules (platform-guide § 12):
 *   Rule 19: Admin issues/reissues retroactively without plan check.
 *   Rule 20: Revocar = isActive = false. Reemitir = isActive = true.
 *   Rule 21: certificateId is a unique public UUID for sharing.
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

jest.mock("@/lib/admin-auth", () => ({
  verifyAdminAuth: jest.fn(),
}));

jest.mock("@/lib/validation", () => ({
  validateUUID: jest.fn().mockReturnValue({ isValid: true }),
}));

jest.mock("@/lib/utils", () => ({
  sanitizeString: jest.fn((s: string) => s),
}));

jest.mock("@/lib/certificate-service", () => ({
  generateCertificateId: jest.fn().mockReturnValue("new-cert-id-abc123"),
}));

jest.mock("@/config/schema", () => ({
  certificatesTable: {},
  usersTable: {},
  coursesTable: {},
  companiesTable: {},
  enrollCourseTable: {},
}));

jest.mock("drizzle-orm", () => ({
  eq: jest.fn(() => ({})),
  desc: jest.fn(() => ({})),
  and: jest.fn(() => ({})),
  relations: jest.fn(() => ({})),
}));

jest.mock("@/lib/database", () => ({
  db: {
    select: jest.fn(),
    update: jest.fn(),
    insert: jest.fn(),
  },
}));

// ===== IMPORTS =====

import { GET as getCertificates } from "@/app/api/admin/certificates/route";
import { POST as revokeCert } from "@/app/api/admin/certificates/[id]/revoke/route";
import { POST as reissueCert } from "@/app/api/admin/certificates/[id]/reissue/route";
import { NextRequest } from "next/server";
import { db } from "@/lib/database";
import { verifyAdminAuth } from "@/lib/admin-auth";
import { validateUUID } from "@/lib/validation";
import { generateCertificateId } from "@/lib/certificate-service";

// ===== TYPED MOCK REFS =====

const mockDb = db as { select: jest.Mock; update: jest.Mock; insert: jest.Mock };
const mockVerifyAdminAuth = verifyAdminAuth as jest.Mock;
const mockValidateUUID = validateUUID as jest.Mock;
const mockGenerateCertificateId = generateCertificateId as jest.Mock;

// ===== CONSTANTS =====

const CERT_UUID = "cccccccc-cccc-cccc-cccc-cccccccccccc";
const ADMIN_PAYLOAD = {
  userId: "admin-user-id",
  permissions: ["platform:admin"],
  email: "admin@platform.com",
};

// ===== HELPERS =====

function makeRequest(body: unknown = {}): NextRequest {
  return {
    headers: { get: jest.fn(() => null) },
    cookies: {
      get: jest.fn((name: string) =>
        name === "accessToken" ? { value: "admin-token" } : undefined
      ),
    },
    json: jest.fn().mockResolvedValue(body),
    url: "http://localhost/api/admin/certificates",
  } as unknown as NextRequest;
}

function makeParams(id: string) {
  return { params: Promise.resolve({ id }) };
}

function makeSelectChain(rows: unknown[]) {
  const chain: Record<string, unknown> = {};
  ["from", "leftJoin", "innerJoin", "where", "orderBy", "limit"].forEach((m) => {
    chain[m] = jest.fn(() => chain);
  });
  chain["then"] = (resolve: (v: unknown) => unknown) =>
    Promise.resolve(rows).then(resolve);
  chain["catch"] = () => Promise.resolve(rows);
  return chain;
}

function makeUpdateChainWithReturning(rows: unknown[]) {
  return {
    set: jest.fn(() => ({
      where: jest.fn(() => ({
        returning: jest.fn().mockResolvedValue(rows),
      })),
    })),
  };
}

function makeUpdateChainNoReturn() {
  return {
    set: jest.fn(() => ({
      where: jest.fn().mockResolvedValue(undefined),
    })),
  };
}

function makeInsertChain(rows: unknown[]) {
  return {
    values: jest.fn(() => ({
      returning: jest.fn().mockResolvedValue(rows),
    })),
  };
}

// ===== GET /api/admin/certificates =====

describe("GET /api/admin/certificates", () => {
  const mockCerts = [
    {
      id: CERT_UUID,
      certificateId: "public-cert-001",
      courseId: "course-1",
      userId: "user-1",
      companyId: "company-1",
      title: "TypeScript Avanzado",
      isActive: true,
      issuedDate: new Date(),
      userName: "Alice",
      userEmail: "alice@example.com",
      courseName: "TypeScript Avanzado",
      companyName: "Tech Corp",
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockVerifyAdminAuth.mockResolvedValue({ authorized: true, payload: ADMIN_PAYLOAD });
  });

  it("returns 200 with all certificates including joined user/course/company names", async () => {
    mockDb.select.mockReturnValue(makeSelectChain(mockCerts));

    const res = await getCertificates(makeRequest());

    expect(res.status).toBe(200);
    expect(res.json().success).toBe(true);
    expect(res.json().data).toHaveLength(1);
    expect(res.json().data[0].certificateId).toBe("public-cert-001");
    expect(res.json().data[0].userName).toBe("Alice");
  });

  it("returns 200 with an empty array when no certificates exist", async () => {
    mockDb.select.mockReturnValue(makeSelectChain([]));

    const res = await getCertificates(makeRequest());

    expect(res.status).toBe(200);
    expect(res.json().success).toBe(true);
    expect(res.json().data).toEqual([]);
  });

  it("returns 401 when not authenticated", async () => {
    mockVerifyAdminAuth.mockResolvedValue({
      authorized: false,
      response: { json: () => ({ error: "Token requerido" }), status: 401 },
    });

    const res = await getCertificates(makeRequest());

    expect(res.status).toBe(401);
  });

  it("returns 403 when caller lacks admin permissions", async () => {
    mockVerifyAdminAuth.mockResolvedValue({
      authorized: false,
      response: { json: () => ({ error: "Permisos insuficientes" }), status: 403 },
    });

    const res = await getCertificates(makeRequest());

    expect(res.status).toBe(403);
  });
});

// ===== POST /api/admin/certificates/[id]/revoke =====

describe("POST /api/admin/certificates/[id]/revoke", () => {
  const activeCert = {
    id: CERT_UUID,
    certificateId: "public-cert-abc",
    isActive: true,
    description: "Original certificate",
    updatedAt: null,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockVerifyAdminAuth.mockResolvedValue({ authorized: true, payload: ADMIN_PAYLOAD });
    mockValidateUUID.mockReturnValue({ isValid: true });
  });

  it("soft-deletes an active certificate (sets isActive = false)", async () => {
    const revokedCert = { ...activeCert, isActive: false };
    mockDb.select.mockReturnValue(makeSelectChain([activeCert]));
    mockDb.update.mockReturnValue(makeUpdateChainWithReturning([revokedCert]));

    const res = await revokeCert(makeRequest(), makeParams(CERT_UUID));

    expect(res.status).toBe(200);
    expect(res.json().success).toBe(true);
    expect(res.json().message).toContain("revocado");
    expect(mockDb.update).toHaveBeenCalled();
  });

  it("returns 404 when certificate does not exist", async () => {
    mockDb.select.mockReturnValue(makeSelectChain([]));

    const res = await revokeCert(makeRequest(), makeParams(CERT_UUID));

    expect(res.status).toBe(404);
    expect(res.json().error).toContain("no encontrado");
  });

  it("returns 400 when certificate is already revoked", async () => {
    const alreadyRevoked = { ...activeCert, isActive: false };
    mockDb.select.mockReturnValue(makeSelectChain([alreadyRevoked]));

    const res = await revokeCert(makeRequest(), makeParams(CERT_UUID));

    expect(res.status).toBe(400);
    expect(res.json().error).toContain("ya está revocado");
  });

  it("returns 400 for an invalid UUID", async () => {
    mockValidateUUID.mockReturnValueOnce({ isValid: false, errors: ["ID inválido"] });

    const res = await revokeCert(makeRequest(), makeParams("not-a-uuid"));

    expect(res.status).toBe(400);
  });

  it("returns 401 when not authenticated", async () => {
    mockVerifyAdminAuth.mockResolvedValue({
      authorized: false,
      response: { json: () => ({ error: "Token requerido" }), status: 401 },
    });

    const res = await revokeCert(makeRequest(), makeParams(CERT_UUID));

    expect(res.status).toBe(401);
  });

  it("appends the revocation reason to the certificate description", async () => {
    const revokedCert = { ...activeCert, isActive: false };
    mockDb.select.mockReturnValue(makeSelectChain([activeCert]));
    mockDb.update.mockReturnValue(makeUpdateChainWithReturning([revokedCert]));

    const res = await revokeCert(
      makeRequest({ reason: "Datos incorrectos en el certificado" }),
      makeParams(CERT_UUID)
    );

    expect(res.status).toBe(200);
    expect(mockDb.update).toHaveBeenCalled();
    // The set() call should include updated description with the reason
    const setArg = mockDb.update.mock.results[0]?.value?.set.mock.calls[0]?.[0];
    expect(setArg?.description).toContain("Datos incorrectos");
  });
});

// ===== POST /api/admin/certificates/[id]/reissue =====

describe("POST /api/admin/certificates/[id]/reissue", () => {
  const oldCert = {
    id: CERT_UUID,
    certificateId: "old-cert-xyz",
    courseId: "course-1",
    userId: "user-1",
    companyId: "company-1",
    title: "TypeScript Avanzado",
    description: "Original cert description",
    grade: 90,
    completedDate: new Date(),
    duration: "20h",
    certificateUrl: "https://certs.example.com/old",
    isActive: true,
  };

  const newCert = {
    ...oldCert,
    id: "new-cert-row-uuid",
    certificateId: "new-cert-id-abc123",
    isActive: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockVerifyAdminAuth.mockResolvedValue({ authorized: true, payload: ADMIN_PAYLOAD });
    mockValidateUUID.mockReturnValue({ isValid: true });
    mockGenerateCertificateId.mockReturnValue("new-cert-id-abc123");
  });

  it("creates a new certificate and revokes the old one", async () => {
    mockDb.select.mockReturnValue(makeSelectChain([oldCert]));
    mockDb.insert.mockReturnValue(makeInsertChain([newCert]));
    mockDb.update.mockReturnValue(makeUpdateChainNoReturn());

    const res = await reissueCert(makeRequest(), makeParams(CERT_UUID));

    expect(res.status).toBe(200);
    expect(res.json().success).toBe(true);
    expect(res.json().message).toContain("reemitido");
    expect(res.json().data.newCertificate).toBeDefined();
    expect(res.json().data.oldCertificate).toBeDefined();
  });

  it("generates a new unique certificateId for the replacement certificate", async () => {
    mockDb.select.mockReturnValue(makeSelectChain([oldCert]));
    mockDb.insert.mockReturnValue(makeInsertChain([newCert]));
    mockDb.update.mockReturnValue(makeUpdateChainNoReturn());

    await reissueCert(makeRequest(), makeParams(CERT_UUID));

    expect(mockGenerateCertificateId).toHaveBeenCalled();
  });

  it("calls both insert (new cert) and update (revoke old cert)", async () => {
    mockDb.select.mockReturnValue(makeSelectChain([oldCert]));
    mockDb.insert.mockReturnValue(makeInsertChain([newCert]));
    mockDb.update.mockReturnValue(makeUpdateChainNoReturn());

    await reissueCert(makeRequest(), makeParams(CERT_UUID));

    expect(mockDb.insert).toHaveBeenCalled();
    expect(mockDb.update).toHaveBeenCalled();
  });

  it("annotates the reissued certificate description with the original certificateId", async () => {
    mockDb.select.mockReturnValue(makeSelectChain([oldCert]));
    mockDb.insert.mockReturnValue(makeInsertChain([newCert]));
    mockDb.update.mockReturnValue(makeUpdateChainNoReturn());

    await reissueCert(makeRequest(), makeParams(CERT_UUID));

    const insertValuesArg = mockDb.insert.mock.results[0]?.value?.values.mock.calls[0]?.[0];
    expect(insertValuesArg?.description).toContain("REEMITIDO");
    expect(insertValuesArg?.description).toContain(oldCert.certificateId);
  });

  it("returns 404 when the certificate to reissue does not exist", async () => {
    mockDb.select.mockReturnValue(makeSelectChain([]));

    const res = await reissueCert(makeRequest(), makeParams(CERT_UUID));

    expect(res.status).toBe(404);
    expect(res.json().error).toContain("no encontrado");
  });

  it("returns 400 for an invalid UUID", async () => {
    mockValidateUUID.mockReturnValueOnce({ isValid: false, errors: ["ID inválido"] });

    const res = await reissueCert(makeRequest(), makeParams("bad-uuid"));

    expect(res.status).toBe(400);
  });

  it("returns 401 when not authenticated", async () => {
    mockVerifyAdminAuth.mockResolvedValue({
      authorized: false,
      response: { json: () => ({ error: "No autorizado" }), status: 401 },
    });

    const res = await reissueCert(makeRequest(), makeParams(CERT_UUID));

    expect(res.status).toBe(401);
  });
});
