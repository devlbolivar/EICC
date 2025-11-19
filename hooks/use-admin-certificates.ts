import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { UI_TEXT } from "@/lib/constants";

export interface Certificate {
  id: string;
  certificateId: string;
  courseId: string;
  userId: string;
  companyId: string | null;
  title: string;
  description: string | null;
  grade: number;
  issuedDate: Date;
  completedDate: Date;
  duration: string | null;
  certificateUrl: string | null;
  isActive: boolean;
  userName: string;
  userEmail: string;
  courseName: string;
  companyName: string | null;
}

export interface UseAdminCertificatesReturn {
  certificates: Certificate[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useAdminCertificates(): UseAdminCertificatesReturn {
  const { session } = useAuth();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/admin/certificates", {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al obtener certificados");
      }

      const result = await response.json();
      setCertificates(result.data);
    } catch (err) {
      console.error("Error fetching certificates:", err);
      setError(
        err instanceof Error ? err.message : UI_TEXT.COMMON.UNKNOWN_ERROR
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchCertificates();
    }
  }, [session]);

  const refetch = () => {
    fetchCertificates();
  };

  return {
    certificates,
    loading,
    error,
    refetch,
  };
}
