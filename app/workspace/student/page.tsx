"use client";

import { useAuth } from "@/context/AuthContext";
import { useStudent } from "@/hooks/use-student";
import { redirect } from "next/navigation";
import { useEffect } from "react";

export default function StudentPage() {
  const { session } = useAuth();
  const { isStudent } = useStudent();

  useEffect(() => {
    if (session?.user?.id && isStudent) {
      // Redirect to the dynamic route with the user's ID
      redirect(`/workspace/student/${session.user.id}`);
    }
  }, [session?.user?.id, isStudent]);

  if (!isStudent) {
    redirect("/");
  }

  // Show loading while redirecting
  return <div>Redirecting to your dashboard...</div>;
}
