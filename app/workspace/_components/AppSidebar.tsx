"use client";
import React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Plus,
  Book,
  GraduationCap,
  Settings,
  Users,
  CircleCheck,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import AddNewCourseDialog from "./AddNewCourseDialog";

const SideBarOptions = [
  { title: "Dashboard", icon: LayoutDashboard, path: "/workspace" },
  { title: "Cursos", icon: Book, path: "/workspace/courses" },
  { title: "Estudiantes", icon: Users, path: "/workspace/students" },
  { title: "Profesores", icon: GraduationCap, path: "/workspace/teachers" },
  { title: "Configuración", icon: Settings, path: "/workspace/settings" },
];

const AppSidebar = () => {
  const path = usePathname();

  return (
    <Sidebar>
      <SidebarHeader className="flex items-center justify-center">
        <Image src="/logo.svg" alt="logo" width={130} height={120} />
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <AddNewCourseDialog>
            <Button>
              <Plus />
              Crear nuevo curso
            </Button>
          </AddNewCourseDialog>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {SideBarOptions.map((option, index) => (
                <SidebarMenuItem key={index}>
                  <SidebarMenuButton
                    asChild
                    className="flex items-center gap-2 p-5"
                  >
                    <Link
                      href={option.path}
                      className={`text-[17px] ${
                        path.includes(option.path) &&
                        "text-primary bg-sidebar-primary-foreground"
                      }`}
                    >
                      <option.icon className="w-7 h-7" />
                      <span>{option.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  );
};

export default AppSidebar;
