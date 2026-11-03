"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  BookOpen,
  Clock,
  Users,
  Eye,
  Play,
  FileText,
  CheckCircle,
  AlertCircle,
  Loader2,
  Calendar,
  User,
  Building,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Award,
} from "lucide-react";
import { Course, Module, Lesson } from "@/app/types";
import { API_ROUTES, ERROR_MESSAGES } from "@/lib/constants";
import { useCsrfToken } from "@/hooks/use-csrf-token";
import { toast } from "sonner";

// Componente para el reproductor de video
const VideoPlayer = ({ videoUrl }: { videoUrl: string }) => {
  const getVideoEmbedUrl = (url: string) => {
    // YouTube
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      const videoId = url.includes("youtu.be")
        ? url.split("youtu.be/")[1]?.split("?")[0]
        : url.match(/[?&]v=([^&]+)/)?.[1];
      return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    }

    // Vimeo
    if (url.includes("vimeo.com")) {
      const videoId = url.match(/vimeo\.com\/(\d+)/)?.[1];
      return videoId ? `https://player.vimeo.com/video/${videoId}` : null;
    }

    return null;
  };

  const embedUrl = getVideoEmbedUrl(videoUrl);

  if (!embedUrl) {
    return (
      <div className="space-y-2">
        <div className="text-sm text-blue-600 bg-blue-50 p-3 rounded flex items-center gap-2">
          <ExternalLink className="w-4 h-4" />
          <span>URL del video:</span>
        </div>
        <a
          href={videoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-blue-600 hover:text-blue-800 underline break-all"
        >
          {videoUrl}
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
        <iframe
          src={embedUrl}
          className="absolute top-0 left-0 w-full h-full rounded-lg"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title="Video player"
        />
      </div>
      <div className="text-xs text-gray-500 flex items-center gap-1">
        <ExternalLink className="w-3 h-3" />
        <a
          href={videoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-gray-700 underline"
        >
          Ver en plataforma original
        </a>
      </div>
    </div>
  );
};

export default function CompanyCourseViewPage() {
  const { fetchWithCsrf } = useCsrfToken();
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedLessons, setExpandedLessons] = useState<Set<string>>(
    new Set()
  );
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        setError(null);

        // Validate if courseId is a valid UUID format
        const uuidRegex =
          /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(courseId)) {
          throw new Error("ID de curso inválido");
        }

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
        setCourse(data.data.course);
      } catch (err) {
        console.error("Error fetching course:", err);
        setError(
          err instanceof Error ? err.message : ERROR_MESSAGES.UNKNOWN_ERROR
        );
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      fetchCourse();
    }
  }, [courseId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Publicado":
        return "bg-green-100 text-green-800";
      case "Borrador":
        return "bg-yellow-100 text-yellow-800";
      case "Archivado":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "Básico":
        return "bg-blue-100 text-blue-800";
      case "Intermedio":
        return "bg-orange-100 text-orange-800";
      case "Avanzado":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case "Público":
        return <Users className="w-4 h-4" />;
      case "Privado":
        return <Eye className="w-4 h-4" />;
      case "Empresas específicas":
        return <Users className="w-4 h-4" />;
      default:
        return <Users className="w-4 h-4" />;
    }
  };

  const getLessonIcon = (lesson: Lesson) => {
    if (lesson.video) return <Play className="w-4 h-4" />;
    if (lesson.text) return <FileText className="w-4 h-4" />;
    return <FileText className="w-4 h-4" />;
  };

  const toggleLessonExpansion = (lessonId: string) => {
    setExpandedLessons((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(lessonId)) {
        newSet.delete(lessonId);
      } else {
        newSet.add(lessonId);
      }
      return newSet;
    });
  };

  const isLessonExpanded = (lessonId: string) => {
    return expandedLessons.has(lessonId);
  };

  const handleStartCourse = async () => {
    try {
      setEnrolling(true);

      // Inscribir al usuario en el curso
      const response = await fetchWithCsrf(`/api/courses/${courseId}/enroll`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          courseId: courseId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al inscribirse en el curso");
      }

      toast.success("Inscrito exitosamente en el curso");

      // Redirigir al curso en la vista de estudiante
      router.push(`/workspace/student/courses/${courseId}`);
    } catch (err) {
      console.error("Error enrolling in course:", err);
      toast.error(err instanceof Error ? err.message : "Error al inscribirse en el curso");
    } finally {
      setEnrolling(false);
    }
  };

  const handleViewContent = () => {
    // Expandir todas las lecciones
    if (course?.modules) {
      const allLessonIds = new Set<string>();
      course.modules.forEach((module: Module, moduleIndex: number) => {
        module.lessons?.forEach((_: Lesson, lessonIndex: number) => {
          allLessonIds.add(`${moduleIndex}-${lessonIndex}`);
        });
      });
      setExpandedLessons(allLessonIds);

      // Scroll a la sección de contenido
      const contentSection = document.querySelector('[data-content-section]');
      if (contentSection) {
        contentSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleViewCertificate = () => {
    // Navegar a la página de certificados
    router.push(`/workspace/company/certificates?course=${courseId}`);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando curso...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600">
              {error || "Error al cargar el curso"}
            </p>
            <div className="mt-4 space-x-2">
              <Button onClick={() => window.location.reload()}>
                Reintentar
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push("/workspace/company/courses")}
              >
                Volver
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/workspace/company/courses">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {course.name}
              </h1>
              <p className="text-gray-600 mt-2">Vista detallada del curso</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              className="flex items-center gap-2"
              onClick={handleStartCourse}
              disabled={enrolling}
            >
              {enrolling ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Inscribiendo...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Iniciar Curso
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Información principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Banner del curso */}
          {course.bannerImage && (
            <Card className="overflow-hidden">
              <div className="relative h-48 w-full">
                <Image
                  src={course.bannerImage}
                  alt={course.name}
                  fill
                  className="object-cover"
                />
                <div className="absolute top-4 right-4 flex gap-2">
                  {course.isPublic && (
                    <Badge className="bg-green-500">
                      <Users className="w-3 h-3 mr-1" />
                      Público
                    </Badge>
                  )}
                  <Badge className={getStatusColor(course.status)}>
                    {course.status}
                  </Badge>
                </div>
              </div>
            </Card>
          )}

          {/* Información del curso */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Información del Curso
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">{course.name}</h3>
                <p className="text-gray-600">{course.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium text-gray-500">
                    Categoría
                  </span>
                  <p className="text-sm">{course.category}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">
                    Nivel
                  </span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${getLevelColor(
                      course.level
                    )}`}
                  >
                    {course.level}
                  </span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">
                    Estado
                  </span>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${getStatusColor(
                        course.status
                      )}`}
                    >
                      {course.status}
                    </span>
                  </div>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">
                    Visibilidad
                  </span>
                  <div className="flex items-center gap-1">
                    {getVisibilityIcon(course.visibility)}
                    <span className="text-sm">{course.visibility}</span>
                  </div>
                </div>
              </div>

              {course.estimatedDuration && (
                <div>
                  <span className="text-sm font-medium text-gray-500">
                    Duración estimada
                  </span>
                  <p className="text-sm">{course.estimatedDuration}</p>
                </div>
              )}

              {course.targetCompanies && course.targetCompanies.length > 0 && (
                <div>
                  <span className="text-sm font-medium text-gray-500">
                    Empresas objetivo
                  </span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {course.targetCompanies.map((company, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs"
                      >
                        {company}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Módulos y lecciones */}
          <Card data-content-section>
            <CardHeader>
              <CardTitle>Contenido del Curso</CardTitle>
              <CardDescription>
                {course.numberOfChapters} módulos •{" "}
                {course.modules?.reduce(
                  (total, module) => total + (module.lessons?.length || 0),
                  0
                ) || 0}{" "}
                lecciones
              </CardDescription>
            </CardHeader>
            <CardContent>
              {course.modules && course.modules.length > 0 ? (
                <div className="space-y-4">
                  {course.modules.map((module: Module, moduleIndex: number) => (
                    <div key={moduleIndex} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-lg">
                          Módulo {moduleIndex + 1}: {module.title}
                        </h4>
                        <span className="text-sm text-gray-500">
                          {module.lessons?.length || 0} lecciones
                        </span>
                      </div>
                      {module.description && (
                        <p className="text-gray-600 mb-3">
                          {module.description}
                        </p>
                      )}
                      {module.lessons && module.lessons.length > 0 && (
                        <div className="space-y-2">
                          {module.lessons.map(
                            (lesson: Lesson, lessonIndex: number) => {
                              const lessonId = `${moduleIndex}-${lessonIndex}`;
                              const isExpanded = isLessonExpanded(lessonId);

                              return (
                                <div
                                  key={lessonIndex}
                                  className="border border-gray-200 rounded-lg overflow-hidden"
                                >
                                  <div
                                    className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors"
                                    onClick={() =>
                                      toggleLessonExpansion(lessonId)
                                    }
                                  >
                                    <div className="flex items-center gap-2 flex-1">
                                      {isExpanded ? (
                                        <ChevronDown className="w-4 h-4 text-gray-500" />
                                      ) : (
                                        <ChevronRight className="w-4 h-4 text-gray-500" />
                                      )}
                                      {getLessonIcon(lesson)}
                                      <span className="text-sm font-medium">
                                        Lección {lessonIndex + 1}:{" "}
                                        {lesson.title}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      {lesson.video && (
                                        <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                                          Video
                                        </span>
                                      )}
                                      {lesson.text && (
                                        <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                                          Texto
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  {isExpanded && (
                                    <div className="p-4 bg-white border-t border-gray-200">
                                      <div className="space-y-3">
                                        {lesson.text && (
                                          <div>
                                            <h5 className="text-sm font-medium text-gray-700 mb-2">
                                              Contenido de texto:
                                            </h5>
                                            <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                                              {lesson.text}
                                            </div>
                                          </div>
                                        )}

                                        {lesson.video && (
                                          <div>
                                            <h5 className="text-sm font-medium text-gray-700 mb-2">
                                              Video:
                                            </h5>
                                            <VideoPlayer
                                              videoUrl={lesson.video}
                                            />
                                          </div>
                                        )}

                                        {lesson.attachments &&
                                          lesson.attachments.length > 0 && (
                                            <div>
                                              <h5 className="text-sm font-medium text-gray-700 mb-2">
                                                Archivos adjuntos:
                                              </h5>
                                              <div className="space-y-1">
                                                {lesson.attachments.map(
                                                  (attachment, index) => (
                                                    <div
                                                      key={index}
                                                      className="text-sm text-gray-600 bg-gray-50 p-2 rounded flex items-center gap-2"
                                                    >
                                                      <FileText className="w-4 h-4" />
                                                      <span>
                                                        {attachment.name}
                                                      </span>
                                                      <span className="text-xs text-gray-500">
                                                        ({attachment.type})
                                                      </span>
                                                    </div>
                                                  )
                                                )}
                                              </div>
                                            </div>
                                          )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            }
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No hay módulos configurados para este curso</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar con información adicional */}
        <div className="space-y-6">
          {/* Estadísticas del curso */}
          <Card>
            <CardHeader>
              <CardTitle>Estadísticas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Módulos</span>
                <span className="font-semibold">{course.numberOfChapters}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Lecciones totales</span>
                <span className="font-semibold">
                  {course.modules?.reduce(
                    (total, module) => total + (module.lessons?.length || 0),
                    0
                  ) || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Incluye videos</span>
                <span className="font-semibold">
                  {course.includeVideos ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-gray-400" />
                  )}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Información del creador */}
          <Card>
            <CardHeader>
              <CardTitle>Información del Creador</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">
                    {course.creator?.name || "Usuario"}
                  </p>
                  <p className="text-sm text-gray-500">
                    {course.creator?.email || "Sin email"}
                  </p>
                </div>
              </div>
              {course.company?.name && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Building className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium">{course.company.name}</p>
                    <p className="text-sm text-gray-500">Empresa</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Fechas */}
          <Card>
            <CardHeader>
              <CardTitle>Fechas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm font-medium">Creado</p>
                  <p className="text-xs text-gray-500">
                    {new Date(course.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              {course.updatedAt && (
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium">Actualizado</p>
                    <p className="text-xs text-gray-500">
                      {new Date(course.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Acciones del curso */}
          <Card>
            <CardHeader>
              <CardTitle>Acciones</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                className="w-full flex items-center gap-2"
                onClick={handleStartCourse}
                disabled={enrolling}
              >
                {enrolling ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Inscribiendo...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    Iniciar Curso
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                className="w-full flex items-center gap-2"
                onClick={handleViewContent}
              >
                <BookOpen className="w-4 h-4" />
                Ver Contenido
              </Button>
              <Button
                variant="outline"
                className="w-full flex items-center gap-2"
                onClick={handleViewCertificate}
              >
                <Award className="w-4 h-4" />
                Ver Certificado
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
