import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import {
  render as customRender,
  mockSession,
  mockStudentSession,
  mockCompanySession,
} from "../utils/test-utils";
import WorkspaceGuard from "@/app/workspace/_components/WorkspaceGuard";

// Mock del contexto de autenticación
jest.mock("@/context/AuthContext", () => ({
  useAuth: jest.fn(),
}));

const mockUseAuth = require("@/context/AuthContext").useAuth;

describe("WorkspaceGuard Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders children when not a protected route", () => {
    mockUseAuth.mockReturnValue({
      session: mockSession,
      loading: false,
    });

    render(
      <WorkspaceGuard>
        <div data-testid="test-content">Test Content</div>
      </WorkspaceGuard>
    );

    expect(screen.getByTestId("test-content")).toBeInTheDocument();
  });

  it("shows loading state when authentication is loading", () => {
    mockUseAuth.mockReturnValue({
      session: null,
      loading: true,
    });

    render(
      <WorkspaceGuard>
        <div data-testid="test-content">Test Content</div>
      </WorkspaceGuard>
    );

    expect(
      screen.getByText("Verificando autenticación...")
    ).toBeInTheDocument();
    expect(screen.queryByTestId("test-content")).not.toBeInTheDocument();
  });

  it("shows loading state when redirecting", async () => {
    mockUseAuth.mockReturnValue({
      session: mockSession,
      loading: false,
    });

    render(
      <WorkspaceGuard>
        <div data-testid="test-content">Test Content</div>
      </WorkspaceGuard>
    );

    // Simular redirección
    await waitFor(() => {
      expect(screen.getByText("Redirigiendo...")).toBeInTheDocument();
    });
  });

  it("renders children when user has valid session and permissions", () => {
    mockUseAuth.mockReturnValue({
      session: mockSession,
      loading: false,
    });

    render(
      <WorkspaceGuard>
        <div data-testid="test-content">Test Content</div>
      </WorkspaceGuard>
    );

    expect(screen.getByTestId("test-content")).toBeInTheDocument();
  });

  it("handles student session correctly", () => {
    mockUseAuth.mockReturnValue({
      session: mockStudentSession,
      loading: false,
    });

    render(
      <WorkspaceGuard>
        <div data-testid="test-content">Test Content</div>
      </WorkspaceGuard>
    );

    expect(screen.getByTestId("test-content")).toBeInTheDocument();
  });

  it("handles company session correctly", () => {
    mockUseAuth.mockReturnValue({
      session: mockCompanySession,
      loading: false,
    });

    render(
      <WorkspaceGuard>
        <div data-testid="test-content">Test Content</div>
      </WorkspaceGuard>
    );

    expect(screen.getByTestId("test-content")).toBeInTheDocument();
  });

  it("handles session without role", () => {
    const sessionWithoutRole = {
      ...mockSession,
      currentRole: null,
    };

    mockUseAuth.mockReturnValue({
      session: sessionWithoutRole,
      loading: false,
    });

    render(
      <WorkspaceGuard>
        <div data-testid="test-content">Test Content</div>
      </WorkspaceGuard>
    );

    // Debería redirigir cuando no hay rol
    expect(screen.queryByTestId("test-content")).not.toBeInTheDocument();
  });

  it("handles session without permissions", () => {
    const sessionWithoutPermissions = {
      ...mockSession,
      permissions: [],
    };

    mockUseAuth.mockReturnValue({
      session: sessionWithoutPermissions,
      loading: false,
    });

    render(
      <WorkspaceGuard>
        <div data-testid="test-content">Test Content</div>
      </WorkspaceGuard>
    );

    // Debería redirigir cuando no hay permisos
    expect(screen.queryByTestId("test-content")).not.toBeInTheDocument();
  });

  it("handles null session", () => {
    mockUseAuth.mockReturnValue({
      session: null,
      loading: false,
    });

    render(
      <WorkspaceGuard>
        <div data-testid="test-content">Test Content</div>
      </WorkspaceGuard>
    );

    // Debería redirigir cuando no hay sesión
    expect(screen.queryByTestId("test-content")).not.toBeInTheDocument();
  });

  it("renders loading spinner with correct styling", () => {
    mockUseAuth.mockReturnValue({
      session: null,
      loading: true,
    });

    render(
      <WorkspaceGuard>
        <div data-testid="test-content">Test Content</div>
      </WorkspaceGuard>
    );

    const loadingContainer = screen.getByText(
      "Verificando autenticación..."
    ).parentElement;
    expect(loadingContainer).toHaveClass(
      "min-h-screen",
      "flex",
      "items-center",
      "justify-center"
    );
  });

  it("renders redirecting spinner with correct styling", async () => {
    mockUseAuth.mockReturnValue({
      session: mockSession,
      loading: false,
    });

    render(
      <WorkspaceGuard>
        <div data-testid="test-content">Test Content</div>
      </WorkspaceGuard>
    );

    await waitFor(() => {
      const redirectingContainer =
        screen.getByText("Redirigiendo...").parentElement;
      expect(redirectingContainer).toHaveClass(
        "min-h-screen",
        "flex",
        "items-center",
        "justify-center"
      );
    });
  });

  it("maintains component structure during state changes", () => {
    const { rerender } = render(
      <WorkspaceGuard>
        <div data-testid="test-content">Test Content</div>
      </WorkspaceGuard>
    );

    // Cambiar de loading a session válida
    mockUseAuth.mockReturnValue({
      session: null,
      loading: true,
    });

    rerender(
      <WorkspaceGuard>
        <div data-testid="test-content">Test Content</div>
      </WorkspaceGuard>
    );

    expect(
      screen.getByText("Verificando autenticación...")
    ).toBeInTheDocument();

    // Cambiar a session válida
    mockUseAuth.mockReturnValue({
      session: mockSession,
      loading: false,
    });

    rerender(
      <WorkspaceGuard>
        <div data-testid="test-content">Test Content</div>
      </WorkspaceGuard>
    );

    expect(screen.getByTestId("test-content")).toBeInTheDocument();
  });
});
