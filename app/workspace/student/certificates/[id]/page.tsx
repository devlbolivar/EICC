"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
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
  Download,
  Share2,
  Award,
  Calendar,
  Clock,
  User,
  BookOpen,
  Building,
} from "lucide-react";
// Removed direct import - will use API instead
import { CertificateResponse } from "@/app/types";
import { toast } from "sonner";

export default function CertificateViewPage() {
  const params = useParams();
  const router = useRouter();
  const certificateId = params.id as string;

  const [certificate, setCertificate] = useState<CertificateResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCertificate = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get user ID from token or context
        const response = await fetch("/api/user");
        if (!response.ok) {
          throw new Error("Failed to get user info");
        }

        const userData = await response.json();
        console.log("🔍 Debug: User data response", userData);

        const userId = userData.data?.user?.id;
        console.log("🔍 Debug: Extracted user ID", userId);

        if (!userId) {
          console.error("🔍 Debug: No user ID found in response", userData);
          throw new Error("User not authenticated");
        }

        // Try to fetch certificate by certificate ID first, then by course ID
        console.log("🔍 Debug: Fetching certificate", {
          certificateId,
          userId,
        });

        let certResponse;
        let certData;
        let cert = null;

        // First try: fetch by certificate ID
        try {
          certResponse = await fetch(`/api/certificates/${certificateId}`);
          if (certResponse.ok) {
            certData = await certResponse.json();
            console.log("🔍 Debug: Certificate by ID response", certData);
            cert = certData.success ? certData.data : null;
          }
        } catch (err) {
          console.log(
            "🔍 Debug: Certificate by ID failed, trying by course ID",
            err
          );
        }

        // Second try: fetch by course ID (for backward compatibility)
        // Only try this if the certificateId looks like a UUID (course ID)
        if (
          !cert &&
          certificateId.match(
            /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
          )
        ) {
          try {
            certResponse = await fetch(
              `/api/certificates?courseId=${certificateId}&userId=${userId}`
            );
            if (certResponse.ok) {
              certData = await certResponse.json();
              console.log(
                "🔍 Debug: Certificate by course ID response",
                certData
              );
              cert = certData.success ? certData.data[0] : null;
            }
          } catch (err) {
            console.log("🔍 Debug: Certificate by course ID also failed", err);
          }
        }

        if (!cert) {
          console.error("🔍 Debug: No certificate found", {
            certificateId,
            userId,
            certData,
          });
          setError("Certificado no encontrado");
          return;
        }

        setCertificate(cert);
      } catch (err) {
        console.error("Error fetching certificate:", err);
        setError(err instanceof Error ? err.message : "Error desconocido");
      } finally {
        setLoading(false);
      }
    };

    if (certificateId) {
      fetchCertificate();
    }
  }, [certificateId]);

  const handleDownload = () => {
    // Generate and download PDF certificate
    if (!certificate) {
      toast.error("No hay certificado para descargar");
      return;
    }

    // Create a simple HTML certificate for now
    const certificateHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${certificate.title}</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            text-align: center; 
            padding: 40px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            margin: 0;
          }
          .certificate {
            background: white;
            color: #333;
            padding: 60px;
            border-radius: 20px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            max-width: 800px;
            margin: 0 auto;
          }
          .header {
            font-size: 36px;
            font-weight: bold;
            margin-bottom: 20px;
            color: #2c3e50;
          }
          .subtitle {
            font-size: 18px;
            color: #7f8c8d;
            margin-bottom: 40px;
          }
          .student-name {
            font-size: 28px;
            font-weight: bold;
            color: #2c3e50;
            margin: 30px 0;
          }
          .course-name {
            font-size: 24px;
            color: #34495e;
            margin: 20px 0;
          }
          .details {
            display: flex;
            justify-content: space-around;
            margin: 40px 0;
            font-size: 16px;
          }
          .detail-item {
            text-align: center;
          }
          .detail-label {
            font-weight: bold;
            color: #7f8c8d;
          }
          .certificate-id {
            font-family: monospace;
            background: #ecf0f1;
            padding: 10px;
            border-radius: 5px;
            margin: 20px 0;
            font-size: 14px;
          }
          .footer {
            margin-top: 40px;
            font-size: 14px;
            color: #7f8c8d;
          }
        </style>
      </head>
      <body>
        <div class="certificate">
          <div class="header">🏆 CERTIFICADO DE FINALIZACIÓN</div>
          <div class="subtitle">Se otorga el presente certificado a</div>
          <div class="student-name">${certificate.user_name}</div>
          <div class="subtitle">por haber completado exitosamente el curso</div>
          <div class="course-name">"${certificate.course_name}"</div>
          
          <div class="details">
            <div class="detail-item">
              <div class="detail-label">Calificación</div>
              <div>${certificate.grade}%</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Duración</div>
              <div>${certificate.duration}</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Fecha de Finalización</div>
              <div>${new Date(certificate.completedDate).toLocaleDateString(
                "es-ES"
              )}</div>
            </div>
          </div>
          
          <div class="certificate-id">
            ID del Certificado: ${certificate.certificateId}
          </div>
          
          <div class="footer">
            <p>Este certificado es válido y puede ser verificado en cualquier momento.</p>
            <p>Emitido el ${new Date(certificate.issuedDate).toLocaleDateString(
              "es-ES"
            )}</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Open in new window for printing
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(certificateHTML);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 500);
      toast.success("Certificado listo para imprimir/guardar como PDF");
    } else {
      toast.error("No se pudo abrir la ventana de impresión");
    }
  };

  const handleShare = () => {
    if (navigator.share && certificate) {
      navigator.share({
        title: certificate.title,
        text: `He completado el curso "${certificate.course_name}" y obtuve mi certificado!`,
        url: window.location.href,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast.success("Enlace copiado al portapapeles");
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-muted-foreground">Cargando certificado...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !certificate) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Award className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">
              Certificado no encontrado
            </h2>
            <p className="text-muted-foreground mb-4">
              {error || "No se pudo encontrar el certificado para este curso."}
            </p>
            <Button onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Mi Certificado</h1>
            <p className="text-muted-foreground">
              Certificado de finalización del curso
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Imprimir/PDF
          </Button>
          <Button variant="outline" onClick={handleShare}>
            <Share2 className="h-4 w-4 mr-2" />
            Compartir
          </Button>
        </div>
      </div>

      {/* Certificate Card */}
      <Card className="max-w-4xl mx-auto">
        <CardHeader className="text-center border-b">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-full p-4">
              <Award className="h-12 w-12 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">
            {certificate.title}
          </CardTitle>
          <CardDescription className="text-lg">
            {certificate.description}
          </CardDescription>
        </CardHeader>

        <CardContent className="p-8">
          {/* Certificate Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Estudiante</p>
                  <p className="font-semibold">{certificate.user_name}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <BookOpen className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Curso</p>
                  <p className="font-semibold">{certificate.course_name}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">
                    Fecha de finalización
                  </p>
                  <p className="font-semibold">
                    {new Date(certificate.completedDate).toLocaleDateString(
                      "es-ES",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }
                    )}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Award className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Calificación</p>
                  <p className="font-semibold">{certificate.grade}%</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Duración</p>
                  <p className="font-semibold">{certificate.duration}</p>
                </div>
              </div>

              {certificate.company_name && (
                <div className="flex items-center gap-3">
                  <Building className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Empresa</p>
                    <p className="font-semibold">{certificate.company_name}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Certificate ID */}
          <div className="bg-muted rounded-lg p-4 text-center">
            <p className="text-sm text-muted-foreground mb-1">
              ID del Certificado
            </p>
            <p className="font-mono text-sm font-semibold">
              {certificate.certificateId}
            </p>
          </div>

          {/* Verification Info */}
          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>
              Este certificado es válido y puede ser verificado en cualquier
              momento.
            </p>
            <p className="mt-1">
              Emitido el{" "}
              {new Date(certificate.issuedDate).toLocaleDateString("es-ES")}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
