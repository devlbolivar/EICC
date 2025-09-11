"use client";

import React from "react";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  BookOpen,
  Award,
  User,
  HelpCircle,
  LogOut,
  PlayCircle,
  Search,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { PAGE_ROUTES } from "@/lib/constants";

const StudentNavMenu = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  const studentMenuItems = [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      path: PAGE_ROUTES.STUDENT.DASHBOARD,
    },
    {
      title: "Mis Cursos",
      icon: BookOpen,
      path: PAGE_ROUTES.STUDENT.COURSES,
    },
    {
      title: "Catálogo de Cursos",
      icon: Search,
      path: PAGE_ROUTES.STUDENT.CATALOG,
    },
    {
      title: "Certificados",
      icon: Award,
      path: PAGE_ROUTES.STUDENT.CERTIFICATES,
    },
    {
      title: "Perfil",
      icon: User,
      path: PAGE_ROUTES.STUDENT.PROFILE,
    },
    {
      title: "Soporte",
      icon: HelpCircle,
      path: PAGE_ROUTES.STUDENT.SUPPORT,
    },
  ];

  const isActive = (path: string) => pathname === path;
  const isSubItemActive = (path: string) => pathname === path;

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Estudiante</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {studentMenuItems.map((item, index) => (
            <SidebarMenuItem key={index}>
              {
                // Item simple
                <SidebarMenuButton
                  asChild
                  className="flex items-center gap-2 p-5"
                  isActive={isActive(item.path)}
                >
                  <Link
                    href={item.path}
                    className={`text-[17px] ${
                      isActive(item.path) &&
                      "text-primary bg-sidebar-primary-foreground"
                    }`}
                  >
                    <item.icon className="w-7 h-7" />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              }
            </SidebarMenuItem>
          ))}

          {/* Logout Button */}
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleLogout}
              className="flex items-center gap-2 p-5 text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <LogOut className="w-7 h-7" />
              <span className="text-[17px]">Cerrar sesión</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
};

export default StudentNavMenu;
