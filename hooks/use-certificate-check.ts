import { useState, useCallback } from "react";
import { useCsrfToken } from "@/hooks/use-csrf-token";
import { toast } from "sonner";

interface UseCertificateCheckReturn {
  checkAndCreateCertificate: (courseId: string) => Promise<boolean>;
  isCreating: (courseId: string) => boolean;
  setCreating: (courseId: string, creating: boolean) => void;
}

export function useCertificateCheck(): UseCertificateCheckReturn {
  const { fetchWithCsrf } = useCsrfToken();
  const [creatingCourses, setCreatingCourses] = useState<Set<string>>(
    new Set()
  );

  const setCreating = useCallback((courseId: string, creating: boolean) => {
    setCreatingCourses((prev) => {
      const newSet = new Set(prev);
      if (creating) {
        newSet.add(courseId);
      } else {
        newSet.delete(courseId);
      }
      return newSet;
    });
  }, []);

  const isCreating = useCallback(
    (courseId: string) => {
      return creatingCourses.has(courseId);
    },
    [creatingCourses]
  );

  const checkAndCreateCertificate = useCallback(
    async (courseId: string): Promise<boolean> => {
      try {
        setCreating(courseId, true);

        // First, check if certificate already exists
        const checkResponse = await fetch(
          `/api/certificates?courseId=${courseId}`
        );
        if (checkResponse.ok) {
          const checkResult = await checkResponse.json();
          if (
            checkResult.success &&
            checkResult.data &&
            checkResult.data.length > 0
          ) {
            toast.success("¡Certificado encontrado! 🎉");
            return true;
          }
        }

        // If no certificate exists, create one
        const response = await fetchWithCsrf("/api/certificates/retroactive", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ courseId }),
        });

        const result = await response.json();

        if (result.success) {
          if (result.alreadyExists) {
            toast.success("¡Certificado encontrado! 🎉");
          } else {
            toast.success("¡Certificado generado exitosamente! 🎉");
          }
          return true;
        } else {
          console.error("Failed to create certificate:", result.error);
          toast.error("No se pudo generar el certificado. Inténtalo de nuevo.");
          return false;
        }
      } catch (error) {
        console.error("Error creating certificate:", error);
        toast.error("Error al generar el certificado");
        return false;
      } finally {
        setCreating(courseId, false);
      }
    },
    [setCreating, fetchWithCsrf]
  );

  return {
    checkAndCreateCertificate,
    isCreating,
    setCreating,
  };
}
