import { SidebarTrigger } from "@/components/ui/sidebar";
import { UserButton } from "@clerk/nextjs";
import React from "react";

const AppHeader = ({ hideSidebar = false }: { hideSidebar?: boolean }) => {
  return (
    <div className="flex items-center justify-between p-5 shadow-sm">
      {!hideSidebar && <SidebarTrigger />}
      <UserButton />
    </div>
  );
};

export default AppHeader;
