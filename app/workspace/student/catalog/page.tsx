"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

// UI Components
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Icons
import {
  BookOpen,
  Clock,
  Users,
  Star,
  Search,
  Loader2,
  CheckCircle,
  Award,
  Calendar,
  Trophy,
} from "lucide-react";
import { Loader } from "@/components/ui/loader";

// Hooks and Types
import { useCourses } from "@/hooks/use-courses";
import { Course } from "@/app/types";
import { useAuth } from "@/context/AuthContext";

// Constants
const CONSTANTS = {
  ICON_SIZES: {
    SMALL: "h-4 w-4",
    MEDIUM: "h-5 w-5",
    LARGE: "h-6 w-6",
    EXTRA_LARGE: "h-12 w-12",
  },
  MESSAGES: {
    LOADING: "Cargando cursos...",
    ERROR_LOADING: "Error al cargar los cursos",
    RETRY: "Reintentar",
    NO_COURSES_FOUND: "No se encontraron cursos",
    NO_COURSES_DESCRIPTION: "No hay cursos disponibles en este momento",
    FILTER_ADJUSTMENT: "Intenta ajustar los filtros de búsqueda",
    ENROLL_SUCCESS: "¡Te has inscrito exitosamente en el curso!",
    ENROLL_ERROR: "No se pudo inscribir en el curso. Inténtalo de nuevo.",
    ENROLL_ERROR_GENERIC:
      "Error al inscribirse en el curso. Inténtalo de nuevo.",
    CERTIFICATE_NOT_FOUND: "No se encontró información del curso inscrito",
    CERTIFICATE_NOT_AVAILABLE:
      "El certificado aún no está disponible para este curso",
  },
  FILTERS: {
    CATEGORIES: [
      "Todos",
      "Negocios",
      "Frontend",
      "Backend",
      "DevOps",
      "Data Science",
      "Cloud",
    ],
    DIFFICULTIES: ["Todos", "Básico", "Intermedio", "Avanzado"],
  },
  RATINGS: {
    DEFAULT: 4.5,
    LABEL: "Nuevo",
  },
} as const;

const StudentCatalog = () => {
  const { session } = useAuth();
  const router = useRouter();
  const {
    courses,
    loading,
    error,
    fetchCourses,
    enrolledCourses,
    fetchEnrolledCourses,
    enrollInCourse,
  } = useCourses();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [selectedDifficulty, setSelectedDifficulty] = useState("Todos");
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<Set<string>>(
    new Set()
  );
  const [enrollingCourseId, setEnrollingCourseId] = useState<string | null>(
    null
  );
  const [categories, setCategories] = useState<string[]>(["Todos"]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Helper functions
  const getCourseGradient = (isCompleted: boolean) => {
    return isCompleted
      ? "bg-gradient-to-br from-green-500 to-emerald-600"
      : "bg-gradient-to-br from-blue-500 to-purple-600";
  };

  const getCourseIcon = (isCompleted: boolean) => {
    return isCompleted ? (
      <Trophy
        className={`${CONSTANTS.ICON_SIZES.EXTRA_LARGE} text-white opacity-90`}
      />
    ) : (
      <BookOpen
        className={`${CONSTANTS.ICON_SIZES.EXTRA_LARGE} text-white opacity-80`}
      />
    );
  };

  const getStatusBadge = (isCompleted: boolean, isEnrolled: boolean) => {
    if (isCompleted) {
      return (
        <Badge className="bg-green-600 text-white">
          <CheckCircle className="h-3 w-3 mr-1" />
          Completado
        </Badge>
      );
    }
    if (isEnrolled) {
      return <Badge className="bg-blue-600 text-white">En Progreso</Badge>;
    }
    return <Badge className="bg-gray-600 text-white">Disponible</Badge>;
  };

  const getActionButtons = (
    course: Course,
    isEnrolled: boolean,
    isCompleted: boolean
  ) => {
    if (isCompleted) {
      return (
        <>
          <Button
            className="flex-1"
            variant="outline"
            onClick={() => handleContinueCourse(course.id)}
          >
            <BookOpen className={`${CONSTANTS.ICON_SIZES.SMALL} mr-2`} />
            Repasar
          </Button>
          <Button
            className="flex-1"
            onClick={() => handleViewCertificate(course.id)}
          >
            <Award className={`${CONSTANTS.ICON_SIZES.SMALL} mr-2`} />
            Certificado
          </Button>
        </>
      );
    }
    if (isEnrolled) {
      return (
        <Button
          className="flex-1"
          variant="outline"
          onClick={() => handleContinueCourse(course.id)}
        >
          <BookOpen className={`${CONSTANTS.ICON_SIZES.SMALL} mr-2`} />
          Continuar
        </Button>
      );
    }
    return (
      <Button
        className="flex-1"
        onClick={() => handleEnrollInCourse(course.id)}
        disabled={enrollingCourseId === course.id}
      >
        {enrollingCourseId === course.id ? (
          <>
            <Loader2
              className={`${CONSTANTS.ICON_SIZES.SMALL} mr-2 animate-spin`}
            />
            Inscribiendo...
          </>
        ) : (
          <>
            <BookOpen className={`${CONSTANTS.ICON_SIZES.SMALL} mr-2`} />
            Inscribirse
          </>
        )}
      </Button>
    );
  };

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const response = await fetch("/api/courses/categories", {
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          const fetchedCategories = data.data?.categories || [];
          // Agregar "Todos" al inicio si no está
          setCategories(["Todos", ...fetchedCategories]);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        // Usar categorías por defecto en caso de error
        setCategories(CONSTANTS.FILTERS.CATEGORIES);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  // Fetch courses and enrolled courses on component mount
  useEffect(() => {
    fetchCourses();
    fetchEnrolledCourses();
  }, [fetchCourses, fetchEnrolledCourses]);

  // Update enrolled course IDs when enrolled courses change
  useEffect(() => {
    const enrolledIds = new Set(enrolledCourses.map((course) => course.id));
    setEnrolledCourseIds(enrolledIds);
  }, [enrolledCourses]);

  // Filter courses based on search and filters
  const filteredCourses = courses?.filter((course: Course) => {
    const matchesSearch =
      course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "Todos" || course.category === selectedCategory;
    const matchesDifficulty =
      selectedDifficulty === "Todos" || course.level === selectedDifficulty;

    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const difficulties = CONSTANTS.FILTERS.DIFFICULTIES;

  // Handle course enrollment
  const handleEnrollInCourse = async (courseId: string) => {
    if (enrollingCourseId) return; // Prevent multiple simultaneous enrollments

    setEnrollingCourseId(courseId);
    try {
      const success = await enrollInCourse(courseId);
      if (success) {
        // Refresh enrolled courses to update the UI
        await fetchEnrolledCourses();
        toast.success(CONSTANTS.MESSAGES.ENROLL_SUCCESS);
      } else {
        toast.error(CONSTANTS.MESSAGES.ENROLL_ERROR);
      }
    } catch (error) {
      console.error("Error enrolling in course:", error);
      toast.error(CONSTANTS.MESSAGES.ENROLL_ERROR_GENERIC);
    } finally {
      setEnrollingCourseId(null);
    }
  };

  // Handle continuing a course
  const handleContinueCourse = (courseId: string) => {
    router.push(`/workspace/student/courses/${courseId}`);
  };

  // Handle viewing certificate
  const handleViewCertificate = (courseId: string) => {
    const enrolledData = getEnrolledCourseData(courseId);

    if (!enrolledData) {
      toast.error(CONSTANTS.MESSAGES.CERTIFICATE_NOT_FOUND);
      return;
    }

    if (!enrolledData.certificateId) {
      toast.error(CONSTANTS.MESSAGES.CERTIFICATE_NOT_AVAILABLE);
      return;
    }

    // Navegar a la página del certificado
    router.push(`/workspace/student/certificates/${enrolledData.certificateId}`);
  };

  // Get enrolled course data for a specific course
  const getEnrolledCourseData = (courseId: string) => {
    return enrolledCourses.find((course) => course.id === courseId);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Catálogo de Cursos
        </h1>
        <p className="text-muted-foreground">
          Explora nuestra amplia selección de cursos y encuentra tu próximo
          desafío de aprendizaje
        </p>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search
            className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${CONSTANTS.ICON_SIZES.SMALL} text-muted-foreground`}
          />
          <Input
            placeholder="Buscar cursos..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Categoría" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={selectedDifficulty}
          onValueChange={setSelectedDifficulty}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Dificultad" />
          </SelectTrigger>
          <SelectContent>
            {difficulties.map((difficulty) => (
              <SelectItem key={difficulty} value={difficulty}>
                {difficulty}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Loading State */}
      {loading && (
        <Loader message={CONSTANTS.MESSAGES.LOADING} height="py-12" />
      )}

      {/* Error State */}
      {error && (
        <div className="text-center py-12">
          <p className="text-red-500 mb-4">
            {CONSTANTS.MESSAGES.ERROR_LOADING}: {error}
          </p>
          <Button onClick={() => fetchCourses()}>
            {CONSTANTS.MESSAGES.RETRY}
          </Button>
        </div>
      )}

      {/* No Courses State */}
      {!loading && !error && filteredCourses?.length === 0 && (
        <div className="text-center py-12">
          <BookOpen
            className={`${CONSTANTS.ICON_SIZES.EXTRA_LARGE} mx-auto text-muted-foreground mb-4`}
          />
          <h3 className="text-lg font-semibold mb-2">
            {CONSTANTS.MESSAGES.NO_COURSES_FOUND}
          </h3>
          <p className="text-muted-foreground">
            {searchTerm ||
            selectedCategory !== "Todos" ||
            selectedDifficulty !== "Todos"
              ? CONSTANTS.MESSAGES.FILTER_ADJUSTMENT
              : CONSTANTS.MESSAGES.NO_COURSES_DESCRIPTION}
          </p>
        </div>
      )}

      {/* Cursos */}
      {!loading && !error && filteredCourses?.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredCourses.map((course: Course) => {
            const isEnrolled = enrolledCourseIds.has(course.id);
            const enrolledData = getEnrolledCourseData(course.id);
            const isCompleted = enrolledData?.isCompleted || false;
            const progress = enrolledData?.progress || 0;
            const completedAt = enrolledData?.completedAt;

            return (
              <Card
                key={course.id}
                className={`overflow-hidden transition-all duration-200 ${
                  isCompleted
                    ? "ring-2 ring-green-200 bg-gradient-to-br from-green-50 to-emerald-50"
                    : isEnrolled
                    ? "ring-1 ring-blue-200"
                    : ""
                }`}
              >
                <div
                  className={`aspect-video relative ${getCourseGradient(
                    isCompleted
                  )}`}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    {getCourseIcon(isCompleted)}
                  </div>

                  {/* Status Badges */}
                  <div className="absolute top-2 right-2 flex flex-col gap-1">
                    {getStatusBadge(isCompleted, isEnrolled)}
                  </div>
                </div>

                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="line-clamp-2">
                        {course.name}
                      </CardTitle>
                      <CardDescription className="line-clamp-2">
                        {course.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{course.category}</Badge>
                    <Badge variant="outline">{course.level}</Badge>
                  </div>

                  {/* Progress Section for Enrolled Courses */}
                  {isEnrolled && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">Progreso</span>
                        <span className="text-muted-foreground">
                          {progress}%
                        </span>
                      </div>
                      <Progress value={progress} className="h-2" />
                      {isCompleted && completedAt && (
                        <div className="flex items-center gap-1 text-xs text-green-600">
                          <Calendar className="h-3 w-3" />
                          <span>
                            Completado el{" "}
                            {new Date(completedAt).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Clock
                        className={`${CONSTANTS.ICON_SIZES.SMALL} text-muted-foreground`}
                      />
                      <span>{course.estimatedDuration || "N/A"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users
                        className={`${CONSTANTS.ICON_SIZES.SMALL} text-muted-foreground`}
                      />
                      <span>{course.numberOfChapters} capítulos</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Star
                      className={`${CONSTANTS.ICON_SIZES.SMALL} fill-yellow-400 text-yellow-400`}
                    />
                    <span className="text-sm font-medium">
                      {CONSTANTS.RATINGS.DEFAULT}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      ({CONSTANTS.RATINGS.LABEL})
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    {getActionButtons(course, isEnrolled, isCompleted)}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StudentCatalog;
