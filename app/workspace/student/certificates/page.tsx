import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Eye, Award, Calendar, Clock } from "lucide-react";

const StudentCertificates = () => {
  const certificates = [
    {
      id: 1,
      title: "React Fundamentals",
      description: "Certificado de finalización del curso React Fundamentals",
      issuedDate: "2024-01-15",
      completedDate: "2024-01-15",
      duration: "8 horas",
      grade: "95%",
      status: "Completado",
      certificateUrl: "#",
      isDownloadable: true,
    },
    {
      id: 2,
      title: "TypeScript Avanzado",
      description: "Certificado de finalización del curso TypeScript Avanzado",
      issuedDate: "2024-02-20",
      completedDate: "2024-02-20",
      duration: "12 horas",
      grade: "92%",
      status: "Completado",
      certificateUrl: "#",
      isDownloadable: true,
    },
    {
      id: 3,
      title: "Node.js Backend Development",
      description:
        "Certificado de finalización del curso Node.js Backend Development",
      issuedDate: "2024-03-10",
      completedDate: "2024-03-10",
      duration: "10 horas",
      grade: "88%",
      status: "Completado",
      certificateUrl: "#",
      isDownloadable: true,
    },
    {
      id: 4,
      title: "Docker & DevOps",
      description: "Certificado de finalización del curso Docker & DevOps",
      issuedDate: "En progreso",
      completedDate: null,
      duration: "6 horas",
      grade: "En progreso",
      status: "En progreso",
      certificateUrl: null,
      isDownloadable: false,
    },
  ];

  const formatDate = (dateString: string) => {
    if (dateString === "En progreso") return dateString;
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mis Certificados</h1>
        <p className="text-muted-foreground">
          Visualiza y descarga tus certificados de finalización de cursos
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {certificates.map((certificate) => (
          <Card key={certificate.id} className="overflow-hidden">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{certificate.title}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {certificate.description}
                  </CardDescription>
                </div>
                <Award className="h-8 w-8 text-yellow-500" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge
                  variant={
                    certificate.status === "Completado"
                      ? "default"
                      : "secondary"
                  }
                >
                  {certificate.status}
                </Badge>
                {certificate.status === "Completado" && (
                  <Badge
                    variant="outline"
                    className="text-green-600 border-green-600"
                  >
                    {certificate.grade}
                  </Badge>
                )}
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Emitido: {formatDate(certificate.issuedDate)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>Duración: {certificate.duration}</span>
                </div>
                {certificate.completedDate && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>
                      Completado: {formatDate(certificate.completedDate)}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                {certificate.isDownloadable ? (
                  <>
                    <Button className="flex-1" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Descargar
                    </Button>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      Ver
                    </Button>
                  </>
                ) : (
                  <Button className="flex-1" size="sm" disabled>
                    <Clock className="h-4 w-4 mr-2" />
                    En progreso
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {certificates.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Award className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              No tienes certificados aún
            </h3>
            <p className="text-muted-foreground text-center mb-4">
              Completa cursos para obtener certificados y mostrar tus logros
            </p>
            <Button>
              <Award className="h-4 w-4 mr-2" />
              Explorar Cursos
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default StudentCertificates;
