import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { UI_TEXT } from "@/lib/constants";

export interface Enrollment {
  id: string;
  courseId: string;
  userId: string;
  companyId: string | null;
  progress: number;
  isCompleted: boolean;
  completedAt: Date | null;
  enrolledAt: Date;
  userName: string;
  userEmail: string;
  courseName: string;
  companyName: string | null;
}

export interface UseAdminEnrollmentsReturn {
  enrollments: Enrollment[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useAdminEnrollments(): UseAdminEnrollmentsReturn {
  const { session } = useAuth();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEnrollments = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/admin/enrollments", {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al obtener enrollments");
      }

      const result = await response.json();
      setEnrollments(result.data);
    } catch (err) {
      console.error("Error fetching enrollments:", err);
      setError(
        err instanceof Error ? err.message : UI_TEXT.COMMON.UNKNOWN_ERROR
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchEnrollments();
    }
  }, [session]);

  const refetch = () => {
    fetchEnrollments();
  };

  return {
    enrollments,
    loading,
    error,
    refetch,
  };
}
