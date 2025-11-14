"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  UserPlus,
  Mail,
  Users,
  Copy,
  Check,
  Loader2,
  AlertCircle,
  RefreshCw,
  X,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import { useCompanyInvitations } from "@/hooks/use-company-invitations";

const InviteEmployees = () => {
  const {
    pendingInvitations,
    loading,
    error,
    creating,
    createInvitation,
    cancelInvitation,
    refreshInvitations,
    clearError,
  } = useCompanyInvitations();

  const [currentInvitation, setCurrentInvitation] = useState({
    email: "",
    message: "",
  });
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);

  const handleCreateInvitation = async () => {
    if (!currentInvitation.email) {
      toast.error("Por favor completa el email del empleado");
      return;
    }

    const result = await createInvitation({
      email: currentInvitation.email,
      message: currentInvitation.message,
    });

    if (result) {
      if (result.emailSent) {
        toast.success("Invitación enviada por email exitosamente");
      } else {
        toast.warning(
          "Invitación creada, pero el email no se pudo enviar. Revisa la configuración de email."
        );
      }
      setCurrentInvitation({ email: "", message: "" });
    }
  };

  const handleCancelInvitation = async (invitationId: string) => {
    const success = await cancelInvitation(invitationId);
    if (success) {
      toast.success("Invitación cancelada exitosamente");
    }
  };

  const copyInvitationLink = (token: string) => {
    const link = `${window.location.origin}/accept-invite?token=${token}`;
    navigator.clipboard.writeText(link);
    setCopiedEmail(token);
    toast.success("Enlace copiado al portapapeles");

    setTimeout(() => setCopiedEmail(null), 2000);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isExpired = (expiresAt: Date) => {
    return new Date(expiresAt) < new Date();
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <UserPlus className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold">Invitar Empleados</h1>
        </div>
        <Button
          variant="outline"
          onClick={refreshInvitations}
          disabled={loading}
          className="flex items-center gap-2"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
          Actualizar
        </Button>
      </div>

      {/* Error State */}
      {error && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <div>
                <p className="text-red-800 font-medium">
                  Error al cargar invitaciones
                </p>
                <p className="text-red-600 text-sm">{error}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={clearError}
                className="ml-auto"
              >
                Cerrar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formulario de invitación */}
        <Card>
          <CardHeader>
            <CardTitle>Nueva Invitación</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email del empleado *</Label>
              <Input
                id="email"
                type="email"
                placeholder="empleado@empresa.com"
                value={currentInvitation.email}
                onChange={(e) =>
                  setCurrentInvitation({
                    ...currentInvitation,
                    email: e.target.value,
                  })
                }
                disabled={creating}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Mensaje personalizado (opcional)</Label>
              <Textarea
                id="message"
                placeholder="¡Hola! Te invitamos a unirte a nuestra plataforma de aprendizaje..."
                value={currentInvitation.message}
                onChange={(e) =>
                  setCurrentInvitation({
                    ...currentInvitation,
                    message: e.target.value,
                  })
                }
                rows={3}
                disabled={creating}
              />
            </div>

            <Button
              onClick={handleCreateInvitation}
              disabled={creating || !currentInvitation.email}
              className="w-full flex items-center gap-2"
            >
              {creating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <UserPlus className="w-4 h-4" />
              )}
              {creating ? "Enviando invitación..." : "Enviar invitación"}
            </Button>
          </CardContent>
        </Card>

        {/* Invitaciones pendientes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Invitaciones Pendientes ({pendingInvitations.length})
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
                  <p className="text-muted-foreground">
                    Cargando invitaciones...
                  </p>
                </div>
              </div>
            ) : pendingInvitations.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No hay invitaciones pendientes</p>
                <p className="text-sm">
                  Envía una invitación usando el formulario
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingInvitations.map((invitation) => (
                  <div
                    key={invitation.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">{invitation.email}</span>
                        {isExpired(invitation.expiresAt) && (
                          <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                            Expirada
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Rol: {invitation.roleName}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                        <Clock className="w-3 h-3" />
                        <span>Expira: {formatDate(invitation.expiresAt)}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyInvitationLink(invitation.token)}
                        disabled={isExpired(invitation.expiresAt)}
                      >
                        {copiedEmail === invitation.token ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCancelInvitation(invitation.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Información adicional */}
      <Card>
        <CardHeader>
          <CardTitle>Información Importante</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Mail className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">Invitación por Email</h3>
              <p className="text-sm text-muted-foreground">
                Los empleados recibirán un email con un enlace para unirse a la
                empresa
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">Acceso Inmediato</h3>
              <p className="text-sm text-muted-foreground">
                Una vez que acepten la invitación, tendrán acceso a todos los
                cursos disponibles
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <UserPlus className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-2">Gestión de Roles</h3>
              <p className="text-sm text-muted-foreground">
                Puedes asignar diferentes roles y permisos según las necesidades
                de cada empleado
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InviteEmployees;
