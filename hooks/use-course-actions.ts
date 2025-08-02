import { useState } from "react";
import { useRouter } from "next/navigation";
import { API_ROUTES, SUCCESS_MESSAGES } from "@/lib/constants";
import { toast } from "sonner";

export interface CourseActionParams {
  courseId: string;
  courseName?: string;
  newStatus?: string;
}

export const useCourseActions = () => {
  const router = useRouter();
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Función para ver curso
  const viewCourse = async ({ courseId }: CourseActionParams) => {
    try {
      setActionLoading(`view-${courseId}`);

      const response = await fetch(`${API_ROUTES.COURSES}/${courseId}`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al obtener el curso");
      }

      // Navegar a la página de vista del curso
      router.push(`/workspace/admin/courses/${courseId}/view`);
    } catch (error) {
      console.error("Error viewing course:", error);
      toast.error(
        error instanceof Error ? error.message : "Error al ver el curso"
      );
    } finally {
      setActionLoading(null);
    }
  };

  // Función para editar curso
  const editCourse = async ({ courseId }: CourseActionParams) => {
    try {
      setActionLoading(`edit-${courseId}`);

      // Verificar que el curso existe antes de navegar
      const response = await fetch(`${API_ROUTES.COURSES}/${courseId}`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al obtener el curso");
      }

      // Navegar a la página de edición del curso
      router.push(`/workspace/admin/courses/${courseId}/edit`);
    } catch (error) {
      console.error("Error editing course:", error);
      toast.error(
        error instanceof Error ? error.message : "Error al editar el curso"
      );
    } finally {
      setActionLoading(null);
    }
  };

  // Función para eliminar curso
  const deleteCourse = async ({ courseId, courseName }: CourseActionParams) => {
    try {
      setActionLoading(`delete-${courseId}`);

      // Confirmar eliminación
      const confirmed = window.confirm(
        `¿Estás seguro de que quieres eliminar el curso "${courseName}"? Esta acción no se puede deshacer.`
      );

      if (!confirmed) {
        setActionLoading(null);
        return;
      }

      const response = await fetch(`${API_ROUTES.COURSES}/${courseId}`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al eliminar el curso");
      }

      toast.success(SUCCESS_MESSAGES.COURSE_DELETED);

      // Recargar la página actual
      window.location.reload();
    } catch (error) {
      console.error("Error deleting course:", error);
      toast.error(
        error instanceof Error ? error.message : "Error al eliminar el curso"
      );
    } finally {
      setActionLoading(null);
    }
  };

  // Función para cambiar estado del curso
  const changeCourseStatus = async ({
    courseId,
    newStatus,
  }: CourseActionParams) => {
    if (!newStatus) return;

    try {
      setActionLoading(`status-${courseId}`);

      const response = await fetch(`${API_ROUTES.COURSES}/${courseId}`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: newStatus,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Error al cambiar el estado del curso"
        );
      }

      toast.success(`Estado del curso cambiado a ${newStatus}`);

      // Recargar la página actual
      window.location.reload();
    } catch (error) {
      console.error("Error changing course status:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Error al cambiar el estado del curso"
      );
    } finally {
      setActionLoading(null);
    }
  };

  // Función para duplicar curso
  const duplicateCourse = async ({ courseId }: CourseActionParams) => {
    try {
      setActionLoading(`duplicate-${courseId}`);

      // Obtener el curso original
      const response = await fetch(`${API_ROUTES.COURSES}/${courseId}`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al obtener el curso");
      }

      const data = await response.json();
      const originalCourse = data.data.course;

      // Crear copia del curso
      const duplicateCourse = {
        ...originalCourse,
        name: `${originalCourse.name} (Copia)`,
        status: "Borrador",
        isActive: true,
      };

      // Eliminar campos que no se deben copiar
      delete duplicateCourse.id;
      delete duplicateCourse.cid;
      delete duplicateCourse.createdAt;
      delete duplicateCourse.updatedAt;

      const createResponse = await fetch(API_ROUTES.COURSES, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(duplicateCourse),
      });

      if (!createResponse.ok) {
        const errorData = await createResponse.json();
        throw new Error(errorData.error || "Error al duplicar el curso");
      }

      toast.success("Curso duplicado exitosamente");

      // Recargar la página actual
      window.location.reload();
    } catch (error) {
      console.error("Error duplicating course:", error);
      toast.error(
        error instanceof Error ? error.message : "Error al duplicar el curso"
      );
    } finally {
      setActionLoading(null);
    }
  };

  return {
    actionLoading,
    viewCourse,
    editCourse,
    deleteCourse,
    changeCourseStatus,
    duplicateCourse,
  };
};
