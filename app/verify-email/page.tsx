"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, XCircle, Loader2, Mail, ArrowLeft } from "lucide-react";

type VerificationStatus =
  | "waiting"
  | "verifying"
  | "success"
  | "already-verified"
  | "error";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<VerificationStatus>(
    token ? "verifying" : "waiting"
  );
  const [message, setMessage] = useState("");
  const [resending, setResending] = useState(false);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");

  useEffect(() => {
    if (token) {
      verifyEmail(token);
    }
  }, [token]);

  const verifyEmail = async (verificationToken: string) => {
    try {
      const response = await fetch(
        `/api/auth/verify-email?token=${verificationToken}`,
        { method: "GET" }
      );

      const data = await response.json();

      if (response.ok) {
        if (data.alreadyVerified) {
          setStatus("already-verified");
          setMessage("Tu email ya estaba verificado");
        } else {
          setStatus("success");
          setMessage("Email verificado exitosamente");
        }
      } else {
        setStatus("error");
        setMessage(data.error || "Error en la verificación");
      }
    } catch (error) {
      console.error("Verification error:", error);
      setStatus("error");
      setMessage("Ocurrió un error durante la verificación");
    }
  };

  const handleResendEmail = async () => {
    if (!email) {
      setEmailError("Por favor ingresa tu email");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError("Por favor ingresa un email válido");
      return;
    }

    setEmailError("");
    setResending(true);

    try {
      const response = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.alreadyVerified) {
          setMessage("Tu email ya está verificado. Puedes iniciar sesión.");
          setStatus("already-verified");
        } else {
          setMessage("Email de verificación enviado. Revisa tu bandeja de entrada.");
        }
      } else {
        setMessage(data.error || "Error al reenviar email");
      }
    } catch (error) {
      console.error("Resend error:", error);
      setMessage("Error al reenviar email de verificación");
    } finally {
      setResending(false);
    }
  };

  const handleContinue = () => {
    if (status === "success" || status === "already-verified") {
      router.push("/sign-in");
    } else {
      router.push("/sign-up");
    }
  };

  // Waiting for user to check email (no token provided)
  if (status === "waiting") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Mail className="h-16 w-16 text-blue-500" />
            </div>
            <CardTitle className="text-2xl">Verifica tu Email</CardTitle>
            <CardDescription>
              Te hemos enviado un enlace de verificación a tu email. Por favor
              revisa tu bandeja de entrada y haz clic en el enlace para activar
              tu cuenta.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-700">
              <p className="font-medium mb-1">Pasos a seguir:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Revisa tu bandeja de entrada</li>
                <li>Busca un email de verificación</li>
                <li>Haz clic en el enlace del email</li>
              </ol>
            </div>

            <div className="border-t pt-4">
              <p className="text-sm text-gray-600 mb-3">
                ¿No recibiste el email? Ingresa tu email para reenviar:
              </p>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setEmailError("");
                  }}
                  className={emailError ? "border-red-500" : ""}
                />
                {emailError && (
                  <p className="text-sm text-red-500">{emailError}</p>
                )}
              </div>

              <Button
                onClick={handleResendEmail}
                disabled={resending}
                className="w-full mt-3"
                variant="outline"
              >
                {resending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Reenviar Email de Verificación
                  </>
                )}
              </Button>

              {message && (
                <p className="text-sm text-center mt-3 text-gray-600">
                  {message}
                </p>
              )}
            </div>

            <Button
              onClick={() => router.push("/sign-in")}
              variant="ghost"
              className="w-full"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al Inicio de Sesión
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Verifying, success, error states
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          {/* Icon based on status */}
          <div className="flex justify-center mb-4">
            {status === "verifying" && (
              <Loader2 className="h-16 w-16 text-blue-500 animate-spin" />
            )}
            {status === "success" && (
              <CheckCircle2 className="h-16 w-16 text-green-500" />
            )}
            {status === "already-verified" && (
              <CheckCircle2 className="h-16 w-16 text-green-500" />
            )}
            {status === "error" && (
              <XCircle className="h-16 w-16 text-red-500" />
            )}
          </div>

          {/* Title */}
          <CardTitle className="text-2xl">
            {status === "verifying" && "Verificando Email..."}
            {status === "success" && "Email Verificado"}
            {status === "already-verified" && "Ya Verificado"}
            {status === "error" && "Error de Verificación"}
          </CardTitle>

          {/* Message */}
          <CardDescription className="text-base">{message}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Actions */}
          {(status === "success" || status === "already-verified") && (
            <Button onClick={handleContinue} className="w-full" size="lg">
              Continuar al Inicio de Sesión
            </Button>
          )}

          {status === "error" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="resend-email">Email</Label>
                <Input
                  id="resend-email"
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setEmailError("");
                  }}
                  className={emailError ? "border-red-500" : ""}
                />
                {emailError && (
                  <p className="text-sm text-red-500">{emailError}</p>
                )}
              </div>

              <Button
                onClick={handleResendEmail}
                disabled={resending}
                className="w-full"
                size="lg"
              >
                {resending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Reenviar Email de Verificación
                  </>
                )}
              </Button>

              <Button
                onClick={handleContinue}
                variant="outline"
                className="w-full"
                size="lg"
              >
                Volver al Registro
              </Button>
            </>
          )}

          {/* Help */}
          <p className="text-sm text-gray-500 text-center mt-6">
            ¿Necesitas ayuda?{" "}
            <a href="/support" className="text-blue-600 hover:underline">
              Contacta Soporte
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
