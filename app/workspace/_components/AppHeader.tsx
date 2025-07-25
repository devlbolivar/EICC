import { SidebarTrigger } from "@/components/ui/sidebar";
import React from "react";

const AppHeader = ({ hideSidebar = false }: { hideSidebar?: boolean }) => {
  return (
    <div
      className={`flex items-center ${
        hideSidebar ? "justify-end" : "justify-between"
      } p-5 shadow-sm`}
    >
      {!hideSidebar && <SidebarTrigger />}
    </div>
  );
};

export default AppHeader;
