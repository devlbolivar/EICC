"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import Link from "next/link";

interface InvitationData {
  email: string;
  companyName: string;
  roleName: string;
  invitedBy: string;
}

export default function AcceptInvitePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(true);
  const [inviteData, setInviteData] = useState<InvitationData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    password: "",
    confirmPassword: "",
  });
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);

  useEffect(() => {
    if (!token) {
      setError("Token de invitación no proporcionado");
      setValidating(false);
      return;
    }

    // Validar el token y obtener datos de la invitación
    const validateToken = async () => {
      try {
        // Por ahora, validamos directamente en el submit
        // En una implementación completa, habría un endpoint de validación
        setValidating(false);
      } catch (error) {
        setError("Error al validar la invitación");
        setValidating(false);
      }
    };

    validateToken();
  }, [token]);

  const validatePasswordStrength = (password: string): string[] => {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push("Mínimo 8 caracteres");
    }
    if (!/[A-Z]/.test(password)) {
      errors.push("Al menos una mayúscula");
    }
    if (!/[a-z]/.test(password)) {
      errors.push("Al menos una minúscula");
    }
    if (!/\d/.test(password)) {
      errors.push("Al menos un número");
    }

    return errors;
  };

  const handlePasswordChange = (password: string) => {
    setFormData({ ...formData, password });
    const errors = validatePasswordStrength(password);
    setPasswordErrors(errors);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Por favor ingresa tu nombre");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }

    if (passwordErrors.length > 0) {
      toast.error("La contraseña no cumple los requisitos de seguridad");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/accept-invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          name: formData.name.trim(),
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("¡Cuenta creada exitosamente! Ya puedes iniciar sesión");
        setTimeout(() => {
          router.push("/sign-in");
        }, 1500);
      } else {
        toast.error(data.error || "Error al aceptar invitación");
        if (data.error?.includes("expirado") || data.error?.includes("inválid")) {
          setError(data.error);
        }
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al aceptar invitación");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md space-y-6 rounded-lg border bg-white p-8 shadow-sm">
          <div className="space-y-2 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <svg
                className="h-6 w-6 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              Token no proporcionado
            </h1>
            <p className="text-gray-600">
              La invitación debe incluir un token válido. Por favor verifica el
              enlace que recibiste.
            </p>
          </div>
          <div className="text-center">
            <Link href="/sign-in" className="text-blue-600 hover:underline">
              Ir al inicio de sesión
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md space-y-6 rounded-lg border bg-white p-8 shadow-sm">
          <div className="space-y-2 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <svg
                className="h-6 w-6 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              Invitación inválida
            </h1>
            <p className="text-gray-600">{error}</p>
            <p className="text-sm text-gray-500">
              La invitación puede haber expirado (válida por 7 días) o ya haber
              sido utilizada.
            </p>
          </div>
          <div className="space-y-2 text-center">
            <p className="text-sm text-gray-600">
              Contacta al administrador de tu empresa para recibir una nueva
              invitación.
            </p>
            <Link href="/sign-in" className="text-blue-600 hover:underline">
              Ir al inicio de sesión
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (validating) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
          <p className="mt-4 text-gray-600">Validando invitación...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md space-y-6 rounded-lg border bg-white p-8 shadow-sm">
        <div className="space-y-2 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            <svg
              className="h-6 w-6 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            Acepta tu invitación
          </h1>
          <p className="text-gray-600">
            Crea tu cuenta para empezar a usar la plataforma
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre completo *</Label>
            <Input
              id="name"
              type="text"
              placeholder="Juan Pérez"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Contraseña *</Label>
            <Input
              id="password"
              type="password"
              placeholder="Mínimo 8 caracteres"
              value={formData.password}
              onChange={(e) => handlePasswordChange(e.target.value)}
              required
              disabled={loading}
            />
            {formData.password && passwordErrors.length > 0 && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
                <p className="font-medium">Requisitos faltantes:</p>
                <ul className="ml-4 mt-1 list-disc space-y-1">
                  {passwordErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}
            {formData.password && passwordErrors.length === 0 && (
              <p className="text-sm text-green-600">✓ Contraseña segura</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar contraseña *</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Repite tu contraseña"
              value={formData.confirmPassword}
              onChange={(e) =>
                setFormData({ ...formData, confirmPassword: e.target.value })
              }
              required
              disabled={loading}
            />
            {formData.confirmPassword &&
              formData.password !== formData.confirmPassword && (
                <p className="text-sm text-red-600">
                  Las contraseñas no coinciden
                </p>
              )}
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={
              loading ||
              passwordErrors.length > 0 ||
              formData.password !== formData.confirmPassword ||
              !formData.name.trim() ||
              !formData.password
            }
          >
            {loading ? "Creando cuenta..." : "Crear cuenta y continuar"}
          </Button>
        </form>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            ¿Ya tienes cuenta?{" "}
            <Link href="/sign-in" className="text-blue-600 hover:underline">
              Iniciar sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
