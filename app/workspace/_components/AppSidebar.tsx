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
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Plus,
  Book,
  Settings,
  CreditCard,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import AddNewCourseDialog from "./AddNewCourseDialog";
import Image from "next/image";

const SideBarOptions = [
  { title: "Dashboard", icon: LayoutDashboard, path: "/workspace" },
  { title: "Mis cursos", icon: Book, path: "/workspace/my-learning" },
  { title: "Explorar cursos", icon: Book, path: "/workspace/explore" },
  { title: "Perfil", icon: Settings, path: "/workspace/profile" },
  { title: "Billing", icon: CreditCard, path: "/workspace/billing" },
];

const AppSidebar = () => {
  const path = usePathname();

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
                        path === option.path &&
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
