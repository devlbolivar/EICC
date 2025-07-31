"use client";
import React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";

import Image from "next/image";
import AdminNavMenu from "./AdminNavMenu";
import CompanyNavMenu from "./CompanyNavMenu";
import StudentNavMenu from "./StudentNavMenu";
import { useAdmin } from "@/hooks/use-admin";
import { useCompany } from "@/hooks/use-company";
import { useStudent } from "@/hooks/use-student";
import { useAuth } from "@/context/AuthContext";

const AppSidebar = () => {
  const { session } = useAuth();
  const { isAdmin } = useAdmin();
  const { isCompany } = useCompany();
  const { isStudent } = useStudent();

  // Logs de depuración
  console.log("AppSidebar Debug:", {
    isAdmin,
    isCompany,
    isStudent,
    session: session
      ? {
          user: session.user?.name,
          currentRole: session.currentRole?.name,
          permissions: session.permissions,
          userCompanies: session.userCompanies?.length,
        }
      : null,
  });

  return (
    <Sidebar>
      <SidebarHeader className="flex items-center justify-center flex-row mt-2">
        <Image
          src="/logo-minimalista.png"
          alt="EICCC Logo"
          width={40}
          height={40}
        />
        <h2 className="text-gray-800 text-2xl font-bold leading-tight tracking-[-0.015em]">
          EICCC
        </h2>
      </SidebarHeader>

      <SidebarContent>
        {/* Menú de Administración - Solo visible para administradores */}
        {isAdmin && <AdminNavMenu />}

        {/* Menú de Empresa - Solo visible para usuarios con rol de empresa */}
        {isCompany && <CompanyNavMenu />}

        {/* Menú de Estudiante - Solo visible para usuarios con rol de estudiante */}
        {isStudent && <StudentNavMenu />}
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  );
};

export default AppSidebar;
