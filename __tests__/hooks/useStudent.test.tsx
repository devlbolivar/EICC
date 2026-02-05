import { renderHook } from "@testing-library/react";
import { useStudent } from "@/hooks/use-student";
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

describe("useStudent Hook", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns false when no session is available", () => {
    mockUseAuth.mockReturnValue({
      session: null,
    });

    const { result } = renderHook(() => useStudent());
    expect(result.current.isStudent).toBe(false);
  });

  it("returns false when session has no permissions", () => {
    const sessionWithoutPermissions = {
      ...mockSession,
      permissions: [],
    };

    mockUseAuth.mockReturnValue({
      session: sessionWithoutPermissions,
    });

    const { result } = renderHook(() => useStudent());
    expect(result.current.isStudent).toBe(false);
  });

  it("returns true when user has student permissions only", () => {
    const studentSession = {
      ...mockSession,
      permissions: ["courses:read", "courses:enroll", "content:read"],
    };

    mockUseAuth.mockReturnValue({
      session: studentSession,
    });

    const { result } = renderHook(() => useStudent());
    expect(result.current.isStudent).toBe(true);
  });

  it("returns true when user has courses:enroll permission", () => {
    const studentSession = {
      ...mockSession,
      permissions: ["courses:enroll"],
    };

    mockUseAuth.mockReturnValue({
      session: studentSession,
    });

    const { result } = renderHook(() => useStudent());
    expect(result.current.isStudent).toBe(true);
  });

  it("returns true when user has courses:read permission", () => {
    const studentSession = {
      ...mockSession,
      permissions: ["courses:read"],
    };

    mockUseAuth.mockReturnValue({
      session: studentSession,
    });

    const { result } = renderHook(() => useStudent());
    expect(result.current.isStudent).toBe(true);
  });

  it("returns true when user has content:read permission", () => {
    const studentSession = {
      ...mockSession,
      permissions: ["content:read"],
    };

    mockUseAuth.mockReturnValue({
      session: studentSession,
    });

    const { result } = renderHook(() => useStudent());
    expect(result.current.isStudent).toBe(true);
  });

  it("returns false when user has admin permissions", () => {
    const adminSession = {
      ...mockSession,
      permissions: ["platform:admin", "courses:read"],
    };

    mockUseAuth.mockReturnValue({
      session: adminSession,
    });

    const { result } = renderHook(() => useStudent());
    expect(result.current.isStudent).toBe(false);
  });

  it("returns false when user has company permissions", () => {
    const companySession = {
      ...mockSession,
      permissions: ["company:admin", "courses:read"],
    };

    mockUseAuth.mockReturnValue({
      session: companySession,
    });

    const { result } = renderHook(() => useStudent());
    expect(result.current.isStudent).toBe(false);
  });

  it("returns false when user has platform permissions", () => {
    const platformSession = {
      ...mockSession,
      permissions: ["platform:read", "courses:enroll"],
    };

    mockUseAuth.mockReturnValue({
      session: platformSession,
    });

    const { result } = renderHook(() => useStudent());
    expect(result.current.isStudent).toBe(false);
  });

  it("returns false when user has mixed admin and student permissions", () => {
    const mixedSession = {
      ...mockSession,
      permissions: ["platform:admin", "courses:enroll", "content:read"],
    };

    mockUseAuth.mockReturnValue({
      session: mixedSession,
    });

    const { result } = renderHook(() => useStudent());
    expect(result.current.isStudent).toBe(false);
  });

  it("returns false when user has mixed company and student permissions", () => {
    const mixedSession = {
      ...mockSession,
      permissions: ["company:admin", "courses:read", "content:read"],
    };

    mockUseAuth.mockReturnValue({
      session: mixedSession,
    });

    const { result } = renderHook(() => useStudent());
    expect(result.current.isStudent).toBe(false);
  });

  it("returns true for student session with student permissions", () => {
    mockUseAuth.mockReturnValue({
      session: mockStudentSession,
    });

    const { result } = renderHook(() => useStudent());
    expect(result.current.isStudent).toBe(true);
  });

  it("returns false for admin session", () => {
    mockUseAuth.mockReturnValue({
      session: mockSession,
    });

    const { result } = renderHook(() => useStudent());
    expect(result.current.isStudent).toBe(false);
  });

  it("returns false for company session", () => {
    mockUseAuth.mockReturnValue({
      session: mockCompanySession,
    });

    const { result } = renderHook(() => useStudent());
    expect(result.current.isStudent).toBe(false);
  });

  it("handles undefined permissions gracefully", () => {
    const sessionWithUndefinedPermissions = {
      ...mockSession,
      permissions: undefined,
    };

    mockUseAuth.mockReturnValue({
      session: sessionWithUndefinedPermissions,
    });

    const { result } = renderHook(() => useStudent());
    expect(result.current.isStudent).toBe(false);
  });

  it("handles null permissions gracefully", () => {
    const sessionWithNullPermissions = {
      ...mockSession,
      permissions: null,
    };

    mockUseAuth.mockReturnValue({
      session: sessionWithNullPermissions,
    });

    const { result } = renderHook(() => useStudent());
    expect(result.current.isStudent).toBe(false);
  });

  it("returns false when session is empty object", () => {
    mockUseAuth.mockReturnValue({
      session: {},
    });

    const { result } = renderHook(() => useStudent());
    expect(result.current.isStudent).toBe(false);
  });

  it("returns false when session has empty permissions array", () => {
    const sessionWithEmptyPermissions = {
      ...mockSession,
      permissions: [],
    };

    mockUseAuth.mockReturnValue({
      session: sessionWithEmptyPermissions,
    });

    const { result } = renderHook(() => useStudent());
    expect(result.current.isStudent).toBe(false);
  });

  it("returns true when user has only student permissions", () => {
    const pureStudentSession = {
      ...mockSession,
      permissions: ["courses:read", "courses:enroll", "content:read"],
    };

    mockUseAuth.mockReturnValue({
      session: pureStudentSession,
    });

    const { result } = renderHook(() => useStudent());
    expect(result.current.isStudent).toBe(true);
  });

  it("maintains consistent return structure", () => {
    mockUseAuth.mockReturnValue({
      session: mockStudentSession,
    });

    const { result } = renderHook(() => useStudent());
    expect(result.current).toHaveProperty("isStudent");
    expect(typeof result.current.isStudent).toBe("boolean");
  });

  it("handles edge case with only one student permission", () => {
    const singlePermissionSession = {
      ...mockSession,
      permissions: ["courses:enroll"],
    };

    mockUseAuth.mockReturnValue({
      session: singlePermissionSession,
    });

    const { result } = renderHook(() => useStudent());
    expect(result.current.isStudent).toBe(true);
  });
});
