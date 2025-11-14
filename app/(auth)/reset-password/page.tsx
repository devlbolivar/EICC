"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import Link from "next/link";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md space-y-6 rounded-lg border bg-white p-8 shadow-sm">
          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-bold text-gray-900">
              Token inválido
            </h1>
            <p className="text-gray-600">
              El enlace de reseteo es inválido o ha expirado.
            </p>
          </div>
          <div className="text-center">
            <Link
              href="/forgot-password"
              className="text-blue-600 hover:underline"
            >
              Solicitar nuevo enlace
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
    const validationErrors = validatePasswordStrength(password);
    setErrors(validationErrors);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }

    if (errors.length > 0) {
      toast.error("La contraseña no cumple los requisitos");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Contraseña actualizada exitosamente");
        router.push("/sign-in");
      } else {
        toast.error(data.error || "Error al resetear contraseña");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al resetear contraseña");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md space-y-6 rounded-lg border bg-white p-8 shadow-sm">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Resetear Contraseña
          </h1>
          <p className="text-gray-600">Ingresa tu nueva contraseña</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">Nueva Contraseña</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => handlePasswordChange(e.target.value)}
              required
              disabled={loading}
              placeholder="Mínimo 8 caracteres"
            />
            {formData.password && errors.length > 0 && (
              <div className="text-sm text-red-600">
                <p className="font-medium">Requisitos faltantes:</p>
                <ul className="ml-4 list-disc">
                  {errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}
            {formData.password && errors.length === 0 && (
              <p className="text-sm text-green-600">✓ Contraseña segura</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) =>
                setFormData({ ...formData, confirmPassword: e.target.value })
              }
              required
              disabled={loading}
              placeholder="Repite tu contraseña"
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
              errors.length > 0 ||
              formData.password !== formData.confirmPassword ||
              !formData.password
            }
          >
            {loading ? "Actualizando..." : "Actualizar contraseña"}
          </Button>
        </form>

        <div className="text-center">
          <Link
            href="/sign-in"
            className="text-sm text-blue-600 hover:underline"
          >
            Volver al inicio de sesión
          </Link>
        </div>
      </div>
    </div>
  );
}
