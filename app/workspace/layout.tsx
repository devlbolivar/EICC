import React from "react";
import WorkspaceProvider from "./provider";

const WorkspaceLayout = ({ children }: { children: React.ReactNode }) => {
  return <WorkspaceProvider>{children}</WorkspaceProvider>;
};

export default WorkspaceLayout;
