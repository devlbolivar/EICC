"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

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
import { Alert, AlertDescription } from "@/components/ui/alert";

// Icons
import { Download, Award, Calendar, Clock, ExternalLink } from "lucide-react";
import { Loader } from "@/components/ui/loader";

// Hooks and Types
import { useCertificates } from "@/hooks/use-certificates";
import { PAGE_ROUTES } from "@/lib/constants";
import { Certificate } from "@/app/types";

// Constants
const CONSTANTS = {
  ICON_SIZES: {
    SMALL: "h-3 w-3",
    MEDIUM: "h-4 w-4",
    LARGE: "h-6 w-6",
    EXTRA_LARGE: "h-8 w-8",
    AWARD: "h-12 w-12",
  },
  MESSAGES: {
    TITLE: "Mis Certificados",
    DESCRIPTION:
      "Visualiza y descarga tus certificados de finalización de cursos",
    LOADING: "Cargando certificados...",
    ERROR: "Error al cargar los certificados",
    RETRY: "Reintentar",
    NO_CERTIFICATES: "No tienes certificados aún",
    NO_CERTIFICATES_DESCRIPTION:
      "Completa cursos para obtener certificados y mostrar tus logros",
    EXPLORE_COURSES: "Explorar Cursos",
    COMPLETED: "Completado",
    ISSUED: "Emitido",
    DURATION: "Duración",
    COMPLETED_DATE: "Completado",
    DOWNLOAD: "Descargar",
    DOWNLOAD_SHORT: "Desc.",
    VIEW_DETAIL: "Ver Detalle",
    VIEW_SHORT: "Ver",
    DEFAULT_DESCRIPTION: "Certificado de finalización del curso",
    IN_PROGRESS: "En progreso",
    NOT_AVAILABLE: "N/A",
  },
  SKELETON_COUNT: 6,
  DATE_FORMAT: {
    locale: "es-ES",
    options: {
      year: "numeric",
      month: "long",
      day: "numeric",
    },
  },
} as const;

const StudentCertificates = () => {
  const router = useRouter();
  const { certificates, loading, error, refetch } = useCertificates({
    autoFetch: true,
  });

  // Helper functions
  const formatDate = (dateString: string | Date) => {
    if (!dateString) return CONSTANTS.MESSAGES.NOT_AVAILABLE;
    if (dateString === CONSTANTS.MESSAGES.IN_PROGRESS) return dateString;
    return new Date(dateString).toLocaleDateString(
      CONSTANTS.DATE_FORMAT.locale,
      CONSTANTS.DATE_FORMAT.options
    );
  };

  const getCertificateDescription = (certificate: Certificate) => {
    return certificate.description || CONSTANTS.MESSAGES.DEFAULT_DESCRIPTION;
  };

  const getCertificateIcon = (size: string = CONSTANTS.ICON_SIZES.LARGE) => {
    return <Award className={`${size} text-yellow-500 flex-shrink-0`} />;
  };

  const getEmptyStateIcon = () => {
    return (
      <Award
        className={`${CONSTANTS.ICON_SIZES.AWARD} text-muted-foreground mb-4`}
      />
    );
  };

  const handleDownload = (certificate: Certificate) => {
    // Navigate to certificate detail page for download
    // Use certificateId (varchar) instead of id (uuid) for the API
    router.push(
      `${PAGE_ROUTES.STUDENT.CERTIFICATES}/${certificate.certificateId}`
    );
  };

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            {CONSTANTS.MESSAGES.TITLE}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            {CONSTANTS.MESSAGES.DESCRIPTION}
          </p>
        </div>
        <Loader message={CONSTANTS.MESSAGES.LOADING} height="h-64" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            {CONSTANTS.MESSAGES.TITLE}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            {CONSTANTS.MESSAGES.DESCRIPTION}
          </p>
        </div>
        <Alert variant="destructive">
          <AlertDescription className="text-sm">{error}</AlertDescription>
        </Alert>
        <Button onClick={refetch} className="w-full sm:w-auto">
          {CONSTANTS.MESSAGES.RETRY}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          {CONSTANTS.MESSAGES.TITLE}
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1">
          {CONSTANTS.MESSAGES.DESCRIPTION}
        </p>
      </div>

      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {certificates.map((certificate) => (
          <Card
            key={certificate.id}
            className="overflow-hidden hover:shadow-lg transition-shadow"
          >
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1 min-w-0 flex-1">
                  <CardTitle className="text-base sm:text-lg line-clamp-2 leading-tight">
                    {certificate.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-2 text-sm">
                    {getCertificateDescription(certificate)}
                  </CardDescription>
                </div>
                {getCertificateIcon("h-6 w-6 sm:h-8 sm:w-8")}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="default" className="text-xs">
                  {CONSTANTS.MESSAGES.COMPLETED}
                </Badge>
                <Badge
                  variant="outline"
                  className="text-green-600 border-green-600 text-xs"
                >
                  {certificate.grade}%
                </Badge>
              </div>

              <div className="space-y-2 text-xs sm:text-sm">
                <div className="flex items-center gap-2">
                  <Calendar
                    className={`${CONSTANTS.ICON_SIZES.SMALL} sm:${CONSTANTS.ICON_SIZES.MEDIUM} text-muted-foreground flex-shrink-0`}
                  />
                  <span className="truncate">
                    {CONSTANTS.MESSAGES.ISSUED}:{" "}
                    {formatDate(certificate.issuedDate)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock
                    className={`${CONSTANTS.ICON_SIZES.SMALL} sm:${CONSTANTS.ICON_SIZES.MEDIUM} text-muted-foreground flex-shrink-0`}
                  />
                  <span className="truncate">
                    {CONSTANTS.MESSAGES.DURATION}:{" "}
                    {certificate.duration || CONSTANTS.MESSAGES.NOT_AVAILABLE}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar
                    className={`${CONSTANTS.ICON_SIZES.SMALL} sm:${CONSTANTS.ICON_SIZES.MEDIUM} text-muted-foreground flex-shrink-0`}
                  />
                  <span className="truncate">
                    {CONSTANTS.MESSAGES.COMPLETED_DATE}:{" "}
                    {formatDate(certificate.completedDate)}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  className="flex-1"
                  size="sm"
                  onClick={() => handleDownload(certificate)}
                >
                  <Download
                    className={`${CONSTANTS.ICON_SIZES.SMALL} sm:${CONSTANTS.ICON_SIZES.MEDIUM} mr-1 sm:mr-2`}
                  />
                  <span className="hidden sm:inline">
                    {CONSTANTS.MESSAGES.DOWNLOAD}
                  </span>
                  <span className="sm:hidden">
                    {CONSTANTS.MESSAGES.DOWNLOAD_SHORT}
                  </span>
                </Button>
                <Link
                  href={`${PAGE_ROUTES.STUDENT.CERTIFICATES}/${certificate.certificateId}`}
                  className="flex-1 sm:flex-none"
                >
                  <Button variant="outline" size="sm" className="w-full">
                    <ExternalLink
                      className={`${CONSTANTS.ICON_SIZES.SMALL} sm:${CONSTANTS.ICON_SIZES.MEDIUM} mr-1 sm:mr-2`}
                    />
                    <span className="hidden sm:inline">
                      {CONSTANTS.MESSAGES.VIEW_DETAIL}
                    </span>
                    <span className="sm:hidden">
                      {CONSTANTS.MESSAGES.VIEW_SHORT}
                    </span>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {certificates.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            {getEmptyStateIcon()}
            <h3 className="text-lg font-semibold mb-2">
              {CONSTANTS.MESSAGES.NO_CERTIFICATES}
            </h3>
            <p className="text-muted-foreground text-center mb-4">
              {CONSTANTS.MESSAGES.NO_CERTIFICATES_DESCRIPTION}
            </p>
            <Link href={PAGE_ROUTES.STUDENT.CATALOG}>
              <Button>
                <Award className={`${CONSTANTS.ICON_SIZES.MEDIUM} mr-2`} />
                {CONSTANTS.MESSAGES.EXPLORE_COURSES}
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default StudentCertificates;
