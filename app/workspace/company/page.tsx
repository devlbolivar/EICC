"use client";

import { useEffect } from "react";
import { redirect } from "next/navigation";

export default function CompanyPage() {
  useEffect(() => {
    // Redirect to the dashboard page
    redirect("/workspace/company/dashboard");
  }, []);

  // Show loading while redirecting
  return <div>Redirecting to dashboard...</div>;
}
