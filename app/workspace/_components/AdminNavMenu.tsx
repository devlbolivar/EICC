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
  Users,
  Building2,
  BookOpen,
  GraduationCap,
  Award,
  BarChart3,
  Settings,
  HelpCircle,
  Plus,
  List,
  LogOut,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const AdminNavMenu = () => {
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

  const adminMenuItems = [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      path: "/workspace/admin/dashboard",
    },
    {
      title: "Usuarios",
      icon: Users,
      subItems: [
        {
          title: "Lista de usuarios",
          icon: List,
          path: "/workspace/admin/users",
        },
        {
          title: "Crear usuario",
          icon: Plus,
          path: "/workspace/admin/users/create",
        },
      ],
    },
    {
      title: "Empresas",
      icon: Building2,
      subItems: [
        {
          title: "Lista de empresas",
          icon: List,
          path: "/workspace/admin/companies",
        },
        {
          title: "Crear empresa",
          icon: Plus,
          path: "/workspace/admin/companies/create",
        },
      ],
    },
    {
      title: "Cursos",
      icon: BookOpen,
      subItems: [
        {
          title: "Lista de cursos",
          icon: List,
          path: "/workspace/admin/courses",
        },
        {
          title: "Crear curso",
          icon: Plus,
          path: "/workspace/admin/courses/create",
        },
      ],
    },
    {
      title: "Matrículas",
      icon: GraduationCap,
      path: "/workspace/admin/enrollments",
    },
    {
      title: "Certificaciones",
      icon: Award,
      path: "/workspace/admin/certificates",
    },
    {
      title: "Reportes & Analytics",
      icon: BarChart3,
      path: "/workspace/admin/reports",
    },
    {
      title: "Configuraciones",
      icon: Settings,
      path: "/workspace/admin/settings",
    },
    {
      title: "Soporte",
      icon: HelpCircle,
      path: "/workspace/admin/support",
    },
  ];

  const isActive = (path: string) => pathname === path;
  const isSubItemActive = (path: string) => pathname === path;

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Administración</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {adminMenuItems.map((item, index) => (
            <SidebarMenuItem key={index}>
              {item.subItems ? (
                // Item con submenú
                <SidebarMenuButton
                  asChild
                  className="flex items-center gap-2 p-5"
                  isActive={item.subItems.some((subItem) =>
                    isSubItemActive(subItem.path)
                  )}
                >
                  <Link
                    href={item.subItems[0].path}
                    className="text-[17px] flex items-center gap-2"
                  >
                    <item.icon className="w-7 h-7" />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              ) : (
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
              )}

              {/* Submenú */}
              {item.subItems && (
                <SidebarMenuSub>
                  {item.subItems.map((subItem, subIndex) => (
                    <SidebarMenuSubItem key={subIndex}>
                      <SidebarMenuSubButton
                        asChild
                        isActive={isSubItemActive(subItem.path)}
                      >
                        <Link
                          href={subItem.path}
                          className={`flex items-center gap-2 ${
                            isSubItemActive(subItem.path) &&
                            "text-primary bg-sidebar-primary-foreground"
                          }`}
                        >
                          <subItem.icon className="w-4 h-4" />
                          <span>{subItem.title}</span>
                        </Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub>
              )}
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

export default AdminNavMenu;
