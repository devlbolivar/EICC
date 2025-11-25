import React from "react";
import { render, screen } from "@testing-library/react";
import AppHeader from "@/app/workspace/_components/AppHeader";
import { SidebarProvider } from "@/components/ui/sidebar";

// Helper function to render with SidebarProvider
const renderWithProvider = (component: React.ReactElement) => {
  return render(<SidebarProvider>{component}</SidebarProvider>);
};

describe("AppHeader Component", () => {
  it("renders header with default props", () => {
    renderWithProvider(<AppHeader />);

    // Verificar que el componente se renderiza sin errores
    const header = screen.getByTestId("app-header");
    expect(header).toBeInTheDocument();
  });

  it("renders header with hideSidebar prop", () => {
    renderWithProvider(<AppHeader hideSidebar={true} />);

    const header = screen.getByTestId("app-header");
    expect(header).toHaveClass("justify-end");
  });

  it("renders header without hideSidebar prop", () => {
    renderWithProvider(<AppHeader hideSidebar={false} />);

    const header = screen.getByTestId("app-header");
    expect(header).toHaveClass("justify-between");
  });

  it("renders header with default hideSidebar value", () => {
    renderWithProvider(<AppHeader />);

    const header = screen.getByTestId("app-header");
    expect(header).toHaveClass("justify-between");
  });

  it("applies correct styling classes", () => {
    renderWithProvider(<AppHeader />);

    const header = screen.getByTestId("app-header");
    expect(header).toHaveClass("flex", "items-center", "p-5", "shadow-sm");
  });

  it("renders with sidebar trigger when hideSidebar is false", () => {
    renderWithProvider(<AppHeader hideSidebar={false} />);

    // El SidebarTrigger debería estar presente
    const sidebarTrigger = document.querySelector(
      '[data-slot="sidebar-trigger"]'
    );
    expect(sidebarTrigger).toBeInTheDocument();
  });

  it("does not render sidebar trigger when hideSidebar is true", () => {
    renderWithProvider(<AppHeader hideSidebar={true} />);

    // El SidebarTrigger no debería estar presente
    const sidebarTrigger = document.querySelector(
      '[data-slot="sidebar-trigger"]'
    );
    expect(sidebarTrigger).not.toBeInTheDocument();
  });

  it("handles different hideSidebar values correctly", () => {
    const { rerender } = renderWithProvider(<AppHeader hideSidebar={true} />);

    let header = screen.getByTestId("app-header");
    expect(header).toHaveClass("justify-end");

    rerender(
      <SidebarProvider>
        <AppHeader hideSidebar={false} />
      </SidebarProvider>
    );
    header = screen.getByTestId("app-header");
    expect(header).toHaveClass("justify-between");
  });

  it("maintains consistent structure", () => {
    renderWithProvider(<AppHeader />);

    const header = screen.getByTestId("app-header");
    expect(header).toBeInTheDocument();
    expect(header?.children.length).toBeGreaterThan(0);
  });
});
