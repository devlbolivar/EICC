import React from "react";
import { render, screen } from "@testing-library/react";
import AppHeader from "@/app/workspace/_components/AppHeader";

describe("AppHeader Component", () => {
  it("renders header with default props", () => {
    render(<AppHeader />);

    // Verificar que el componente se renderiza sin errores
    const header = document.querySelector("div");
    expect(header).toBeInTheDocument();
  });

  it("renders header with hideSidebar prop", () => {
    render(<AppHeader hideSidebar={true} />);

    const header = document.querySelector("div");
    expect(header).toHaveClass("justify-end");
  });

  it("renders header without hideSidebar prop", () => {
    render(<AppHeader hideSidebar={false} />);

    const header = document.querySelector("div");
    expect(header).toHaveClass("justify-between");
  });

  it("renders header with default hideSidebar value", () => {
    render(<AppHeader />);

    const header = document.querySelector("div");
    expect(header).toHaveClass("justify-between");
  });

  it("applies correct styling classes", () => {
    render(<AppHeader />);

    const header = document.querySelector("div");
    expect(header).toHaveClass("flex", "items-center", "p-5", "shadow-sm");
  });

  it("renders with sidebar trigger when hideSidebar is false", () => {
    render(<AppHeader hideSidebar={false} />);

    // El SidebarTrigger debería estar presente
    const sidebarTrigger = document.querySelector(
      '[data-slot="sidebar-trigger"]'
    );
    expect(sidebarTrigger).toBeInTheDocument();
  });

  it("does not render sidebar trigger when hideSidebar is true", () => {
    render(<AppHeader hideSidebar={true} />);

    // El SidebarTrigger no debería estar presente
    const sidebarTrigger = document.querySelector(
      '[data-slot="sidebar-trigger"]'
    );
    expect(sidebarTrigger).not.toBeInTheDocument();
  });

  it("handles different hideSidebar values correctly", () => {
    const { rerender } = render(<AppHeader hideSidebar={true} />);

    let header = document.querySelector("div");
    expect(header).toHaveClass("justify-end");

    rerender(<AppHeader hideSidebar={false} />);
    header = document.querySelector("div");
    expect(header).toHaveClass("justify-between");
  });

  it("maintains consistent structure", () => {
    render(<AppHeader />);

    const header = document.querySelector("div");
    expect(header).toBeInTheDocument();
    expect(header?.children.length).toBeGreaterThan(0);
  });
});
