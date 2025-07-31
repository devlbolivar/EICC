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
  Building2,
  Users,
  BookOpen,
  TrendingUp,
  Award,
  CreditCard,
  HelpCircle,
  UserPlus,
  LogOut,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const CompanyNavMenu = () => {
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

  const companyMenuItems = [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      path: "/workspace/company/dashboard",
    },
    {
      title: "Mi Empresa",
      icon: Building2,
      subItems: [
        {
          title: "Perfil de la empresa",
          icon: Building2,
          path: "/workspace/company/profile",
        },
        {
          title: "Empleados",
          icon: Users,
          path: "/workspace/company/employees",
        },
        {
          title: "Invitar empleados",
          icon: UserPlus,
          path: "/workspace/company/employees/invite",
        },
      ],
    },
    {
      title: "Cursos Disponibles",
      icon: BookOpen,
      path: "/workspace/company/courses",
    },
    {
      title: "Progreso de Empleados",
      icon: TrendingUp,
      path: "/workspace/company/progress",
    },
    {
      title: "Certificados",
      icon: Award,
      path: "/workspace/company/certificates",
    },
    {
      title: "Facturación / Pagos",
      icon: CreditCard,
      path: "/workspace/company/billing",
    },
    {
      title: "Soporte",
      icon: HelpCircle,
      path: "/workspace/company/support",
    },
  ];

  const isActive = (path: string) => pathname === path;
  const isSubItemActive = (path: string) => pathname === path;

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Empresa</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {companyMenuItems.map((item, index) => (
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

export default CompanyNavMenu;
