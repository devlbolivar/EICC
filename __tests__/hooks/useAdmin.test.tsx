import { renderHook } from "@testing-library/react";
import { useAdmin } from "@/hooks/use-admin";
import {
  mockSession,
  mockStudentSession,
  mockCompanySession,
} from "@/lib/test-utils";

// Mock del contexto de autenticación
jest.mock("@/context/AuthContext", () => ({
  useAuth: jest.fn(),
}));

const mockUseAuth = require("@/context/AuthContext").useAuth;

describe("useAdmin Hook", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns false when no session is available", () => {
    mockUseAuth.mockReturnValue({
      session: null,
    });

    const { result } = renderHook(() => useAdmin());
    expect(result.current.isAdmin).toBe(false);
  });

  it("returns false when session has no permissions", () => {
    const sessionWithoutPermissions = {
      ...mockSession,
      permissions: [],
    };

    mockUseAuth.mockReturnValue({
      session: sessionWithoutPermissions,
    });

    const { result } = renderHook(() => useAdmin());
    expect(result.current.isAdmin).toBe(false);
  });

  it("returns true when user has platform:admin permission", () => {
    const adminSession = {
      ...mockSession,
      permissions: ["platform:admin"],
    };

    mockUseAuth.mockReturnValue({
      session: adminSession,
    });

    const { result } = renderHook(() => useAdmin());
    expect(result.current.isAdmin).toBe(true);
  });

  it("returns true when user has platform:write permission", () => {
    const adminSession = {
      ...mockSession,
      permissions: ["platform:write"],
    };

    mockUseAuth.mockReturnValue({
      session: adminSession,
    });

    const { result } = renderHook(() => useAdmin());
    expect(result.current.isAdmin).toBe(true);
  });

  it("returns true when user has platform:read permission", () => {
    const adminSession = {
      ...mockSession,
      permissions: ["platform:read"],
    };

    mockUseAuth.mockReturnValue({
      session: adminSession,
    });

    const { result } = renderHook(() => useAdmin());
    expect(result.current.isAdmin).toBe(true);
  });

  it("returns true when user has multiple admin permissions", () => {
    const adminSession = {
      ...mockSession,
      permissions: ["platform:admin", "platform:write", "users:manage"],
    };

    mockUseAuth.mockReturnValue({
      session: adminSession,
    });

    const { result } = renderHook(() => useAdmin());
    expect(result.current.isAdmin).toBe(true);
  });

  it("returns false for student session", () => {
    mockUseAuth.mockReturnValue({
      session: mockStudentSession,
    });

    const { result } = renderHook(() => useAdmin());
    expect(result.current.isAdmin).toBe(false);
  });

  it("returns false for company session", () => {
    mockUseAuth.mockReturnValue({
      session: mockCompanySession,
    });

    const { result } = renderHook(() => useAdmin());
    expect(result.current.isAdmin).toBe(false);
  });

  it("returns false when session has only non-admin permissions", () => {
    const nonAdminSession = {
      ...mockSession,
      permissions: ["courses:read", "courses:enroll", "content:read"],
    };

    mockUseAuth.mockReturnValue({
      session: nonAdminSession,
    });

    const { result } = renderHook(() => useAdmin());
    expect(result.current.isAdmin).toBe(false);
  });

  it("returns false when session has company permissions", () => {
    const companySession = {
      ...mockSession,
      permissions: ["company:admin", "courses:create"],
    };

    mockUseAuth.mockReturnValue({
      session: companySession,
    });

    const { result } = renderHook(() => useAdmin());
    expect(result.current.isAdmin).toBe(false);
  });

  it("handles undefined permissions gracefully", () => {
    const sessionWithUndefinedPermissions = {
      ...mockSession,
      permissions: undefined,
    };

    mockUseAuth.mockReturnValue({
      session: sessionWithUndefinedPermissions,
    });

    const { result } = renderHook(() => useAdmin());
    expect(result.current.isAdmin).toBe(false);
  });

  it("handles null permissions gracefully", () => {
    const sessionWithNullPermissions = {
      ...mockSession,
      permissions: null,
    };

    mockUseAuth.mockReturnValue({
      session: sessionWithNullPermissions,
    });

    const { result } = renderHook(() => useAdmin());
    expect(result.current.isAdmin).toBe(false);
  });

  it("returns false when session is empty object", () => {
    mockUseAuth.mockReturnValue({
      session: {},
    });

    const { result } = renderHook(() => useAdmin());
    expect(result.current.isAdmin).toBe(false);
  });

  it("returns false when session has empty permissions array", () => {
    const sessionWithEmptyPermissions = {
      ...mockSession,
      permissions: [],
    };

    mockUseAuth.mockReturnValue({
      session: sessionWithEmptyPermissions,
    });

    const { result } = renderHook(() => useAdmin());
    expect(result.current.isAdmin).toBe(false);
  });

  it("returns true when user has mixed permissions including admin", () => {
    const mixedSession = {
      ...mockSession,
      permissions: ["courses:read", "platform:admin", "content:read"],
    };

    mockUseAuth.mockReturnValue({
      session: mixedSession,
    });

    const { result } = renderHook(() => useAdmin());
    expect(result.current.isAdmin).toBe(true);
  });

  it("maintains consistent return structure", () => {
    mockUseAuth.mockReturnValue({
      session: mockSession,
    });

    const { result } = renderHook(() => useAdmin());
    expect(result.current).toHaveProperty("isAdmin");
    expect(typeof result.current.isAdmin).toBe("boolean");
  });
});
