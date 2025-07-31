"use client";

import { useAdmin } from "@/hooks/use-admin";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

interface CourseAdminGuardProps {
  children: ReactNode;
}

export function CourseAdminGuard({ children }: CourseAdminGuardProps) {
  const { isAdmin } = useAdmin();

  // Redirigir si no es administrador
  if (!isAdmin) {
    redirect("/");
  }

  return <>{children}</>;
}
