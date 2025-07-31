import React, { ReactElement } from "react";
import { render, RenderOptions } from "@testing-library/react";
import { AuthProvider } from "@/context/AuthContext";
import { SidebarProvider } from "@/components/ui/sidebar";

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

// Wrapper personalizado para testing con todos los providers necesarios
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <AuthProvider>
      <SidebarProvider>{children}</SidebarProvider>
    </AuthProvider>
  );
};

// Renderizar con providers completos
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) => render(ui, { wrapper: AllTheProviders, ...options });

// Wrapper solo con AuthProvider (para componentes que no necesitan sidebar)
const AuthOnlyProvider = ({ children }: { children: React.ReactNode }) => {
  return <AuthProvider>{children}</AuthProvider>;
};

const renderWithAuth = (
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) => render(ui, { wrapper: AuthOnlyProvider, ...options });

// Wrapper solo con SidebarProvider (para componentes que solo necesitan sidebar)
const SidebarOnlyProvider = ({ children }: { children: React.ReactNode }) => {
  return <SidebarProvider>{children}</SidebarProvider>;
};

const renderWithSidebar = (
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) => render(ui, { wrapper: SidebarOnlyProvider, ...options });

// Exportar todo
export * from "@testing-library/react";
export { customRender as render };
export { renderWithAuth };
export { renderWithSidebar };
