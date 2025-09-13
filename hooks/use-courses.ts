import { useState, useCallback } from "react";
import {
  Course,
  CourseCreateData,
  ApiResponse,
  PaginatedResponse,
  EnrolledCourseResponse,
} from "@/app/types";

interface UseCoursesReturn {
  // Estado
  courses: Course[];
  enrolledCourses: EnrolledCourseResponse[];
  loading: boolean;
  error: string | null;

  // Operaciones CRUD
  fetchCourses: (params?: {
    page?: number;
    limit?: number;
    category?: string;
    level?: string;
    status?: string;
    search?: string;
  }) => Promise<void>;
  fetchEnrolledCourses: () => Promise<void>;

  createCourse: (data: CourseCreateData) => Promise<Course | null>;
  updateCourse: (
    id: string,
    data: Partial<CourseCreateData>
  ) => Promise<Course | null>;
  deleteCourse: (id: string) => Promise<boolean>;
  getCourse: (id: string) => Promise<Course | null>;

  // Inscripciones
  enrollInCourse: (courseId: string) => Promise<boolean>;
  getEnrollment: (courseId: string) => Promise<any | null>;
  updateProgress: (
    courseId: string,
    data: {
      completedChapters?: any;
      progress?: number;
      isCompleted?: boolean;
    }
  ) => Promise<{ success: boolean; certificateGenerated?: boolean }>;

  // Utilidades
  clearError: () => void;
  refetch: () => Promise<void>;
}

export function useCourses(): UseCoursesReturn {
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrolledCourses, setEnrolledCourses] = useState<
    EnrolledCourseResponse[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Función para manejar errores
  const handleError = useCallback((err: any) => {
    console.error("Error en useCourses:", err);
    const errorMessage = err?.message || "Error interno del servidor";
    setError(errorMessage);
    return null;
  }, []);

  // Función para hacer requests
  const makeRequest = useCallback(
    async <T>(url: string, options: RequestInit = {}): Promise<T | null> => {
      setLoading(true);
      setError(null);

      try {
        let headers: HeadersInit = {};
        const accessToken = localStorage.getItem("accessToken");
        if (accessToken) {
          headers["Authorization"] = `Bearer ${accessToken}`;
        }
        headers = {
          "Content-Type": "application/json",
          ...headers,
        };

        const response = await fetch(url, {
          ...options,
          headers: {
            ...headers,
            ...options.headers,
          },
        });

        const data: ApiResponse<T> = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Error en la solicitud");
        }

        return data.data || null;
      } catch (err) {
        return handleError(err);
      }
    },
    [handleError]
  );

  // Obtener lista de cursos
  const fetchCourses = useCallback(
    async (params = {}) => {
      setLoading(true);
      setError(null);

      try {
        const searchParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            searchParams.append(key, value.toString());
          }
        });

        const url = `/api/courses${
          searchParams.toString() ? `?${searchParams.toString()}` : ""
        }`;
        const result = await makeRequest<{
          courses: Course[];
          pagination: any;
        }>(url);

        if (result) {
          setCourses(result.courses);
        }
      } catch (err) {
        handleError(err);
      } finally {
        setLoading(false);
      }
    },
    [makeRequest, handleError]
  );

  const fetchEnrolledCourses = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const url = `/api/student/courses`;
      const result = await makeRequest<EnrolledCourseResponse[]>(url);

      if (result) {
        setEnrolledCourses(result);
      }
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  }, [makeRequest, handleError]);
  // Crear curso
  const createCourse = useCallback(
    async (data: CourseCreateData): Promise<Course | null> => {
      setLoading(true);
      setError(null);

      try {
        const result = await makeRequest<{ course: Course }>("/api/courses", {
          method: "POST",
          body: JSON.stringify(data),
        });

        if (result) {
          // Actualizar la lista de cursos
          await fetchCourses();
          return result.course;
        }

        return null;
      } catch (err) {
        handleError(err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [makeRequest, handleError, fetchCourses]
  );

  // Actualizar curso
  const updateCourse = useCallback(
    async (
      id: string,
      data: Partial<CourseCreateData>
    ): Promise<Course | null> => {
      setLoading(true);
      setError(null);

      try {
        const result = await makeRequest<{ course: Course }>(
          `/api/courses/${id}`,
          {
            method: "PUT",
            body: JSON.stringify(data),
          }
        );

        if (result) {
          // Actualizar la lista de cursos
          await fetchCourses();
          return result.course;
        }

        return null;
      } catch (err) {
        handleError(err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [makeRequest, handleError, fetchCourses]
  );

  // Eliminar curso
  const deleteCourse = useCallback(
    async (id: string): Promise<boolean> => {
      setLoading(true);
      setError(null);

      try {
        const result = await makeRequest(`/api/courses/${id}`, {
          method: "DELETE",
        });

        if (result !== null) {
          // Actualizar la lista de cursos
          await fetchCourses();
          return true;
        }

        return false;
      } catch (err) {
        handleError(err);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [makeRequest, handleError, fetchCourses]
  );

  // Obtener curso por ID
  const getCourse = useCallback(
    async (id: string): Promise<Course | null> => {
      setLoading(true);
      setError(null);

      try {
        const result = await makeRequest<{ course: Course }>(
          `/api/courses/${id}`
        );
        return result?.course || null;
      } catch (err) {
        handleError(err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [makeRequest, handleError]
  );

  // Inscribirse en un curso
  const enrollInCourse = useCallback(
    async (courseId: string): Promise<boolean> => {
      setLoading(true);
      setError(null);

      try {
        const result = await makeRequest(`/api/courses/${courseId}/enroll`, {
          method: "POST",
        });

        return result !== null;
      } catch (err) {
        handleError(err);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [makeRequest, handleError]
  );

  // Obtener inscripción
  const getEnrollment = useCallback(
    async (courseId: string): Promise<any | null> => {
      setLoading(true);
      setError(null);

      try {
        const result = await makeRequest<{ enrollment: any }>(
          `/api/courses/${courseId}/enroll`
        );
        return result?.enrollment || null;
      } catch (err) {
        handleError(err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [makeRequest, handleError]
  );

  // Actualizar progreso
  const updateProgress = useCallback(
    async (
      courseId: string,
      data: {
        completedChapters?: any;
        progress?: number;
        isCompleted?: boolean;
      }
    ): Promise<{ success: boolean; certificateGenerated?: boolean }> => {
      setLoading(true);
      setError(null);

      try {
        const result = await makeRequest(`/api/courses/${courseId}/enroll`, {
          method: "PUT",
          body: JSON.stringify(data),
        });

        return {
          success: result !== null,
          certificateGenerated: (result as any)?.certificateGenerated || false,
        };
      } catch (err) {
        handleError(err);
        return { success: false };
      } finally {
        setLoading(false);
      }
    },
    [makeRequest, handleError]
  );

  // Limpiar error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Refetch
  const refetch = useCallback(async () => {
    await fetchCourses();
  }, [fetchCourses]);

  return {
    courses,
    enrolledCourses,
    loading,
    error,
    fetchCourses,
    fetchEnrolledCourses,
    createCourse,
    updateCourse,
    deleteCourse,
    getCourse,
    enrollInCourse,
    getEnrollment,
    updateProgress,
    clearError,
    refetch,
  };
}
