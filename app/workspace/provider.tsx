import React from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "./_components/AppSidebar";
import AppHeader from "./_components/AppHeader";
import WorkspaceGuard from "./_components/WorkspaceGuard";

const WorkspaceProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <WorkspaceGuard>
      <SidebarProvider>
        <AppSidebar />
        <div className="flex flex-col w-full">
          <AppHeader />
          <div className="p-10">{children}</div>
        </div>
      </SidebarProvider>
    </WorkspaceGuard>
  );
};

export default WorkspaceProvider;
