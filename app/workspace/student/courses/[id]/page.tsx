"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
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
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

// Icons
import {
  PlayCircle,
  BookOpen,
  Clock,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  FileText,
  Award,
  Star,
  Share2,
  Bookmark,
  Volume2,
  VolumeX,
  Maximize2,
  ChevronDown,
  ChevronUp,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { Loader } from "@/components/ui/loader";

// Hooks and Types
import { useCourses } from "@/hooks/use-courses";
import { useCertificateCheck } from "@/hooks/use-certificate-check";
import { Course, EnrolledCourseResponse, Lesson } from "@/app/types";

// Constants
const CONSTANTS = {
  ICON_SIZES: {
    SMALL: "h-4 w-4",
    MEDIUM: "h-5 w-5",
    LARGE: "h-6 w-6",
    EXTRA_LARGE: "h-12 w-12",
  },
  ANIMATION_DELAYS: {
    CHAPTER_ADVANCE: 2000,
  },
  STORAGE_KEYS: {
    BOOKMARKS: (courseId: string) => `bookmarks_${courseId}`,
  },
  MESSAGES: {
    LOADING: "Cargando curso...",
    LOADING_DESCRIPTION: "Preparando tu experiencia de aprendizaje",
    COURSE_NOT_FOUND: "Curso no encontrado",
    NOT_ENROLLED: "No estás inscrito en este curso",
    NOT_ENROLLED_DESCRIPTION:
      "Parece que no estás inscrito en este curso. Ve al catálogo para inscribirte.",
    ERROR_DESCRIPTION:
      "No pudimos cargar el curso. Verifica tu conexión e inténtalo de nuevo.",
    CHAPTER_COMPLETED: "¡Capítulo completado! Continúa con el siguiente.",
    COURSE_COMPLETED: "¡Felicitaciones! Has completado todo el curso 🎉",
    CERTIFICATE_GENERATED:
      "¡Tu certificado ha sido generado automáticamente! 🏆",
    GENERATING_CERTIFICATE: "Generando tu certificado...",
    ADVANCING_CHAPTER: "Avanzando al siguiente capítulo...",
    BOOKMARK_ADDED: "Capítulo marcado",
    BOOKMARK_REMOVED: "Marcador eliminado",
    LINK_COPIED: "Enlace copiado al portapapeles",
  },
} as const;

export default function CourseLearning() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;

  const { getCourse, getEnrollment, updateProgress } = useCourses();
  const { checkAndCreateCertificate, isCreating } = useCertificateCheck();
  const [course, setCourse] = useState<Course | null>(null);
  const [enrollment, setEnrollment] = useState<EnrolledCourseResponse | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentChapter, setCurrentChapter] = useState(0);
  const [currentLesson, setCurrentLesson] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showResources, setShowResources] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [lastWatchedTime, setLastWatchedTime] = useState<number>(0);
  const [bookmarkedChapters, setBookmarkedChapters] = useState<Set<number>>(
    new Set()
  );

  const videoRef = useRef<HTMLIFrameElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Helper functions
  const getChapterStatus = useCallback(
    (chapterIndex: number) => {
      if (enrollment?.completedChapters?.[chapterIndex]) {
        return "completed";
      }
      if (chapterIndex === currentChapter) {
        return "current";
      }
      if (chapterIndex < currentChapter) {
        return "available";
      }
      return "locked";
    },
    [enrollment, currentChapter]
  );

  const getCompletionPercentage = useCallback(() => {
    if (!course || !enrollment) return 0;
    return Math.round(
      (Object.keys(enrollment.completedChapters || {}).length /
        course.numberOfChapters) *
        100
    );
  }, [course, enrollment]);

  const getCourseGradient = (isCompleted: boolean) => {
    return isCompleted
      ? "bg-gradient-to-br from-green-500 to-emerald-600"
      : "bg-gradient-to-br from-blue-500 to-purple-600";
  };

  const getChapterIcon = (status: string, index: number) => {
    switch (status) {
      case "completed":
        return (
          <CheckCircle
            className={`${CONSTANTS.ICON_SIZES.MEDIUM} text-green-600`}
          />
        );
      case "current":
        return (
          <div
            className={`${CONSTANTS.ICON_SIZES.MEDIUM} rounded-full bg-blue-600 flex items-center justify-center`}
          >
            <div className="h-2 w-2 bg-white rounded-full"></div>
          </div>
        );
      default:
        return (
          <div
            className={`${CONSTANTS.ICON_SIZES.MEDIUM} rounded-full border-2 border-gray-300 flex items-center justify-center`}
          >
            <span className="text-xs text-gray-500">{index + 1}</span>
          </div>
        );
    }
  };

  // Enhanced data fetching with better error handling
  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [courseData, enrollmentData] = await Promise.all([
          getCourse(courseId),
          getEnrollment(courseId),
        ]);

        if (!courseData) {
          setError(CONSTANTS.MESSAGES.COURSE_NOT_FOUND);
          return;
        }

        if (!enrollmentData) {
          setError(CONSTANTS.MESSAGES.NOT_ENROLLED);
          return;
        }

        setCourse(courseData);
        setEnrollment(enrollmentData as unknown as EnrolledCourseResponse);

        // Set current chapter based on progress - find first incomplete chapter
        const completedChapters = Object.keys(
          enrollmentData.completedChapters || {}
        );
        const firstIncompleteChapter = completedChapters.length;
        setCurrentChapter(
          Math.min(
            firstIncompleteChapter,
            (courseData.modules?.length || 1) - 1
          )
        );

        // Load bookmarked chapters from localStorage
        const savedBookmarks = localStorage.getItem(
          CONSTANTS.STORAGE_KEYS.BOOKMARKS(courseId)
        );
        if (savedBookmarks) {
          setBookmarkedChapters(new Set(JSON.parse(savedBookmarks)));
        }
      } catch (err) {
        console.error("Error fetching course data:", err);
        setError(CONSTANTS.MESSAGES.ERROR_DESCRIPTION);
        toast.error(CONSTANTS.MESSAGES.ERROR_DESCRIPTION);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseData();
  }, [courseId, getCourse, getEnrollment]);

  const handleChapterComplete = async (chapterIndex: number) => {
    if (!enrollment || isCompleting) return;

    try {
      setIsCompleting(true);

      const updatedCompletedChapters = {
        ...enrollment.completedChapters,
        [chapterIndex]: true,
      };

      const newProgress = Math.round(
        (Object.keys(updatedCompletedChapters).length /
          (course?.numberOfChapters || 1)) *
          100
      );

      const isCompleted = newProgress === 100;

      console.log("🔍 Debug: Updating course progress", {
        courseId,
        newProgress,
        isCompleted,
        completedChapters: updatedCompletedChapters,
      });

      const result = await updateProgress(courseId, {
        completedChapters: updatedCompletedChapters,
        progress: newProgress,
        isCompleted,
      });

      console.log("🔍 Debug: Progress update result", result);

      // Update local state
      setEnrollment({
        ...enrollment,
        completedChapters: updatedCompletedChapters,
        progress: newProgress,
        isCompleted,
      });

      // Show completion animation and message
      if (isCompleted) {
        toast.success(CONSTANTS.MESSAGES.COURSE_COMPLETED);

        // Show certificate generation status
        if (
          result &&
          typeof result === "object" &&
          "certificateGenerated" in result
        ) {
          const certResult = result as {
            success: boolean;
            certificateGenerated?: boolean;
          };
          if (certResult.certificateGenerated) {
            toast.success(CONSTANTS.MESSAGES.CERTIFICATE_GENERATED);
          } else {
            toast.info(CONSTANTS.MESSAGES.GENERATING_CERTIFICATE);
          }
        } else {
          toast.info(CONSTANTS.MESSAGES.GENERATING_CERTIFICATE);
        }

        // Auto-advance to next chapter if not the last one
        if (chapterIndex < (course?.numberOfChapters || 1) - 1) {
          setTimeout(() => {
            setCurrentChapter(chapterIndex + 1);
            toast.info(CONSTANTS.MESSAGES.ADVANCING_CHAPTER);
          }, CONSTANTS.ANIMATION_DELAYS.CHAPTER_ADVANCE);
        }
      } else {
        toast.success(CONSTANTS.MESSAGES.CHAPTER_COMPLETED);
      }
    } catch (err) {
      console.error("Error updating progress:", err);
      toast.error("Error al actualizar el progreso");
    } finally {
      setIsCompleting(false);
    }
  };

  const handleNextChapter = useCallback(() => {
    if (course && currentChapter < course.numberOfChapters - 1) {
      setCurrentChapter(currentChapter + 1);
      setCurrentLesson(0);
      // Scroll to top of content
      contentRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [course, currentChapter]);

  const handlePreviousChapter = useCallback(() => {
    if (currentChapter > 0) {
      setCurrentChapter(currentChapter - 1);
      setCurrentLesson(0);
      // Scroll to top of content
      contentRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [currentChapter]);

  // New utility functions
  const toggleBookmark = useCallback(
    (chapterIndex: number) => {
      const newBookmarks = new Set(bookmarkedChapters);
      if (newBookmarks.has(chapterIndex)) {
        newBookmarks.delete(chapterIndex);
        toast.info(CONSTANTS.MESSAGES.BOOKMARK_REMOVED);
      } else {
        newBookmarks.add(chapterIndex);
        toast.success(CONSTANTS.MESSAGES.BOOKMARK_ADDED);
      }
      setBookmarkedChapters(newBookmarks);
      localStorage.setItem(
        CONSTANTS.STORAGE_KEYS.BOOKMARKS(courseId),
        JSON.stringify([...newBookmarks])
      );
    },
    [bookmarkedChapters, courseId]
  );

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  const toggleMute = useCallback(() => {
    setIsVideoMuted(!isVideoMuted);
  }, [isVideoMuted]);

  const shareCourse = useCallback(() => {
    if (navigator.share) {
      navigator.share({
        title: course?.name,
        text: `Mira este curso: ${course?.name}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success(CONSTANTS.MESSAGES.LINK_COPIED);
    }
  }, [course]);

  if (loading) {
    return (
      <Loader
        message={CONSTANTS.MESSAGES.LOADING}
        height="min-h-[500px]"
        iconSize="h-6 w-6"
      />
    );
  }

  if (error || !course || !enrollment) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="text-center space-y-6 max-w-md mx-auto">
          <div className="relative">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <div className="absolute -top-2 -right-2 bg-red-100 rounded-full p-2">
              <BookOpen className="h-4 w-4 text-red-600" />
            </div>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2">
              {error || CONSTANTS.MESSAGES.COURSE_NOT_FOUND}
            </h3>
            <p className="text-muted-foreground mb-6">
              {error === CONSTANTS.MESSAGES.NOT_ENROLLED
                ? CONSTANTS.MESSAGES.NOT_ENROLLED_DESCRIPTION
                : CONSTANTS.MESSAGES.ERROR_DESCRIPTION}
            </p>
          </div>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => router.back()} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
            {error === CONSTANTS.MESSAGES.NOT_ENROLLED && (
              <Button onClick={() => router.push("/workspace/student/catalog")}>
                <BookOpen className="h-4 w-4 mr-2" />
                Ver Catálogo
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const chapters = course.modules || [];
  const currentChapterData = chapters[currentChapter];
  const currentLessonData = currentChapterData?.lessons?.[0]; // Always use first lesson
  const isChapterCompleted =
    enrollment.completedChapters?.[currentChapter] || false;
  const completionPercentage = getCompletionPercentage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Enhanced Header with Actions */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.back()}
                className="hover:bg-slate-100"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Button>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold tracking-tight line-clamp-1">
                  {course.name}
                </h1>
                <p className="text-sm text-muted-foreground line-clamp-1">
                  {course.description}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleBookmark(currentChapter)}
                className="hover:bg-yellow-100"
              >
                <Bookmark
                  className={`h-4 w-4 ${
                    bookmarkedChapters.has(currentChapter)
                      ? "fill-yellow-500 text-yellow-600"
                      : ""
                  }`}
                />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={shareCourse}
                className="hover:bg-blue-100"
              >
                <Share2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="lg:hidden"
              >
                {sidebarCollapsed ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronUp className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Progress Bar */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium">Progreso del curso</span>
                <Badge
                  variant="secondary"
                  className="bg-blue-100 text-blue-700"
                >
                  {completionPercentage}% completado
                </Badge>
              </div>
              <div className="text-sm text-muted-foreground">
                {Object.keys(enrollment.completedChapters || {}).length} de{" "}
                {course.numberOfChapters} capítulos
              </div>
            </div>
            <Progress
              value={completionPercentage}
              className="h-2 bg-slate-200"
            />
            {completionPercentage === 100 && (
              <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
                <Award className="h-4 w-4" />
                ¡Curso completado! ¡Felicitaciones!
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Course Content */}
      <div className="container mx-auto px-4 py-6">
        <div
          className={`grid gap-6 ${
            sidebarCollapsed ? "lg:grid-cols-1" : "lg:grid-cols-3"
          }`}
        >
          {/* Main Content */}
          <div
            className={`${
              sidebarCollapsed ? "lg:col-span-1" : "lg:col-span-2"
            } space-y-6`}
            ref={contentRef}
          >
            {/* Enhanced Chapter Card */}
            <Card className="overflow-hidden shadow-lg border-0 bg-white">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <Badge
                        variant="outline"
                        className="bg-blue-100 text-blue-700 border-blue-200"
                      >
                        Capítulo {currentChapter + 1}
                      </Badge>
                      <Badge
                        variant={isChapterCompleted ? "default" : "secondary"}
                      >
                        {isChapterCompleted ? "Completado" : "En progreso"}
                      </Badge>
                    </div>
                    <CardTitle className="text-2xl font-bold text-gray-900">
                      {currentChapterData?.title ||
                        `Lección ${currentChapter + 1}`}
                    </CardTitle>
                    <CardDescription className="text-base text-gray-600">
                      {currentChapterData?.description ||
                        "Contenido del capítulo"}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {bookmarkedChapters.has(currentChapter) && (
                      <Bookmark className="h-5 w-5 fill-yellow-500 text-yellow-600" />
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-0">
                {/* Enhanced Video Player */}
                {course.includeVideos && currentLessonData?.video && (
                  <div className="relative group">
                    <div className="aspect-video bg-black rounded-none overflow-hidden">
                      <iframe
                        ref={videoRef}
                        src={currentLessonData.video}
                        title={currentLessonData.title}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>

                    {/* Video Controls Overlay */}
                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={toggleMute}
                        className="bg-black/50 hover:bg-black/70 text-white border-0"
                      >
                        {isVideoMuted ? (
                          <VolumeX className="h-4 w-4" />
                        ) : (
                          <Volume2 className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={toggleFullscreen}
                        className="bg-black/50 hover:bg-black/70 text-white border-0"
                      >
                        <Maximize2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Enhanced Content Area */}
                <div className="p-6 space-y-6">
                  {/* Lesson Content */}
                  {currentLessonData?.text && (
                    <div className="prose prose-lg max-w-none">
                      <div
                        dangerouslySetInnerHTML={{
                          __html: currentLessonData.text,
                        }}
                      />
                    </div>
                  )}

                  {/* Chapter Description */}
                  {!currentLessonData?.text && (
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-gray-900">
                        Contenido del capítulo
                      </h4>
                      <p className="text-gray-600 leading-relaxed">
                        {currentChapterData?.description ||
                          "Este es el contenido del capítulo. Aquí se mostraría el material de aprendizaje, videos, textos, ejercicios, etc."}
                      </p>
                    </div>
                  )}

                  {/* Lesson Attachments */}
                  {currentLessonData?.attachments &&
                    currentLessonData.attachments.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="font-semibold text-gray-900">
                          Recursos adicionales
                        </h4>
                        <div className="grid gap-2">
                          {currentLessonData.attachments?.map(
                            (attachment, index) => (
                              <div
                                key={index}
                                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                              >
                                <FileText className="h-5 w-5 text-gray-500" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 truncate">
                                    {attachment.name}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {attachment.type.toUpperCase()}
                                  </p>
                                </div>
                                <Button size="sm" variant="ghost" asChild>
                                  <a
                                    href={attachment.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    <ExternalLink className="h-4 w-4" />
                                  </a>
                                </Button>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}

                  <Separator />

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      onClick={() => handleChapterComplete(currentChapter)}
                      disabled={isChapterCompleted || isCompleting}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                      size="lg"
                    >
                      {isCompleting ? (
                        <>
                          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                          Completando...
                        </>
                      ) : isChapterCompleted ? (
                        <>
                          <CheckCircle2 className="h-5 w-5 mr-2" />
                          Capítulo Completado
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-5 w-5 mr-2" />
                          Marcar como Completado
                        </>
                      )}
                    </Button>

                    {!isChapterCompleted && (
                      <Button
                        variant="outline"
                        onClick={() => setShowResources(!showResources)}
                        className="sm:w-auto"
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        {showResources ? "Ocultar" : "Mostrar"} Recursos
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Sidebar */}
          {!sidebarCollapsed && (
            <div className="lg:col-span-1 space-y-6">
              {/* Course Info Card */}
              <Card className="shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-blue-600" />
                    Información del curso
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {course.numberOfChapters}
                      </div>
                      <div className="text-xs text-blue-600">Capítulos</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {completionPercentage}%
                      </div>
                      <div className="text-xs text-green-600">Completado</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">
                        {course.estimatedDuration || "Duración no especificada"}
                      </span>
                    </div>

                    {course.includeVideos && (
                      <div className="flex items-center gap-3">
                        <PlayCircle className="h-4 w-4 text-blue-600" />
                        <span className="text-sm text-blue-600 font-medium">
                          Incluye videos
                        </span>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {course.level}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {course.category}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Enhanced Chapter Navigation */}
              <Card className="shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center justify-between">
                    <span>Capítulos</span>
                    <Badge variant="outline" className="text-xs">
                      {Object.keys(enrollment.completedChapters || {}).length}/
                      {course.numberOfChapters}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1 max-h-96 overflow-y-auto">
                  {chapters.map((chapter, index) => {
                    const hasVideo =
                      course.includeVideos && chapter.lessons?.[0]?.video;
                    const status = getChapterStatus(index);
                    const isBookmarked = bookmarkedChapters.has(index);

                    return (
                      <div
                        key={index}
                        className={`group flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                          status === "current"
                            ? "bg-blue-100 border border-blue-200 shadow-sm"
                            : status === "completed"
                            ? "bg-green-50 hover:bg-green-100"
                            : status === "locked"
                            ? "opacity-50 cursor-not-allowed"
                            : "hover:bg-gray-50"
                        }`}
                        onClick={() =>
                          status !== "locked" && setCurrentChapter(index)
                        }
                      >
                        <div className="flex-shrink-0">
                          {getChapterIcon(status, index)}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-sm font-medium truncate ${
                              status === "current"
                                ? "text-blue-900"
                                : "text-gray-900"
                            }`}
                          >
                            {chapter.title || `Capítulo ${index + 1}`}
                          </p>
                          {chapter.description && (
                            <p className="text-xs text-gray-500 truncate mt-1">
                              {chapter.description}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-1">
                          {hasVideo && (
                            <PlayCircle className="h-4 w-4 text-blue-600 flex-shrink-0" />
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleBookmark(index);
                            }}
                            className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                          >
                            <Bookmark
                              className={`h-3 w-3 ${
                                isBookmarked
                                  ? "fill-yellow-500 text-yellow-600"
                                  : "text-gray-400"
                              }`}
                            />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              {/* Enhanced Navigation Controls */}
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={handlePreviousChapter}
                    disabled={currentChapter === 0}
                    className="flex-1"
                    size="sm"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Anterior
                  </Button>
                  <Button
                    onClick={handleNextChapter}
                    disabled={currentChapter >= course.numberOfChapters - 1}
                    className="flex-1"
                    size="sm"
                  >
                    Siguiente
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>

                {/* Course Completion Actions */}
                {completionPercentage === 100 && (
                  <div className="space-y-2">
                    <Button
                      className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white"
                      onClick={async () => {
                        // First try to create certificate if it doesn't exist
                        const success = await checkAndCreateCertificate(
                          courseId
                        );
                        if (success) {
                          // Navigate to certificate page
                          router.push(
                            `/workspace/student/certificates/${courseId}`
                          );
                        }
                      }}
                      disabled={isCreating(courseId)}
                    >
                      {isCreating(courseId) ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Award className="h-4 w-4 mr-2" />
                      )}
                      {isCreating(courseId)
                        ? "Generando..."
                        : "Ver Certificado"}
                    </Button>
                    <Button variant="outline" className="w-full">
                      <Star className="h-4 w-4 mr-2" />
                      Calificar Curso
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
