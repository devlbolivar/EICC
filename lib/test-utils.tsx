import React, { ReactElement } from "react";
import { render, RenderOptions } from "@testing-library/react";
import { AuthProvider } from "@/context/AuthContext";

// Mock del contexto de autenticación para testing
const mockAuthContext = {
  session: null,
  loading: false,
  login: jest.fn(),
  register: jest.fn(),
  logout: jest.fn(),
  switchCompany: jest.fn(),
  hasPermission: jest.fn(),
  hasAnyPermission: jest.fn(),
  hasAllPermissions: jest.fn(),
};

// Wrapper personalizado para testing
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return <AuthProvider>{children}</AuthProvider>;
};

// Renderizar con providers
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) => render(ui, { wrapper: AllTheProviders, ...options });

// Mock de datos de usuario para testing
export const mockUser = {
  id: "test-user-id",
  email: "test@example.com",
  name: "Test User",
  avatar: null,
  emailVerified: true,
  isActive: true,
  lastLoginAt: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const mockSession = {
  user: mockUser,
  userCompanies: [
    {
      id: "test-user-company-id",
      userId: "test-user-id",
      companyId: "test-company-id",
      roleId: "test-role-id",
      isActive: true,
      joinedAt: new Date(),
      company: {
        id: "test-company-id",
        name: "Test Company",
        rut: "12345678-9",
        isActive: true,
        subscriptionPlan: "free",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      role: {
        id: "test-role-id",
        name: "admin",
        description: "Administrador",
        permissions: ["platform:admin", "users:manage"],
        isSystemRole: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    },
  ],
  currentCompany: {
    id: "test-company-id",
    name: "Test Company",
    rut: "12345678-9",
  },
  currentRole: {
    id: "test-role-id",
    name: "admin",
    permissions: ["platform:admin", "users:manage"],
  },
  permissions: ["platform:admin", "users:manage"],
};

// Mock de datos de estudiante
export const mockStudentSession = {
  ...mockSession,
  currentRole: {
    id: "student-role-id",
    name: "student",
    permissions: ["courses:read", "courses:enroll", "content:read"],
  },
  permissions: ["courses:read", "courses:enroll", "content:read"],
};

// Mock de datos de empresa
export const mockCompanySession = {
  ...mockSession,
  currentRole: {
    id: "company-role-id",
    name: "company",
    permissions: ["company:admin", "courses:create", "users:invite"],
  },
  permissions: ["company:admin", "courses:create", "users:invite"],
};

// Mock de curso para testing
export const mockCourse = {
  id: "test-course-id",
  cid: "test-course-cid",
  name: "Test Course",
  description: "This is a test course",
  numberOfChapters: 5,
  includeVideos: true,
  difficulty: "beginner",
  category: "programming",
  bannerImage: "/test-banner.jpg",
  courseContent: [],
  createdBy: "test-user-id",
  companyId: "test-company-id",
  isPublic: true,
  isActive: true,
  level: "Básico" as const,
  status: "Borrador" as const,
  estimatedDuration: "2 horas",
  visibility: "Público" as const,
  targetCompanies: [],
  modules: [],
  createdAt: new Date(),
  updatedAt: new Date(),
};

// Función para simular delay
export const waitFor = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

// Función para limpiar mocks
export const clearMocks = () => {
  jest.clearAllMocks();
};

// Exportar todo
export * from "@testing-library/react";
export { customRender as render };

