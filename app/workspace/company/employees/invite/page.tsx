"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserPlus, Mail, Send, Users, Copy, Check } from "lucide-react";
import { toast } from "sonner";

const InviteEmployees = () => {
  const [invitations, setInvitations] = React.useState<
    Array<{
      email: string;
      role: string;
      message: string;
    }>
  >([]);
  const [currentInvitation, setCurrentInvitation] = React.useState({
    email: "",
    role: "",
    message: "",
  });
  const [copiedEmail, setCopiedEmail] = React.useState<string | null>(null);

  const roles = [
    { value: "employee", label: "Empleado" },
    { value: "manager", label: "Gerente" },
    { value: "admin", label: "Administrador" },
  ];

  const addInvitation = () => {
    if (!currentInvitation.email || !currentInvitation.role) {
      toast.error("Por favor completa todos los campos requeridos");
      return;
    }

    setInvitations([...invitations, currentInvitation]);
    setCurrentInvitation({ email: "", role: "", message: "" });
    toast.success("Invitación agregada a la lista");
  };

  const removeInvitation = (index: number) => {
    setInvitations(invitations.filter((_, i) => i !== index));
  };

  const sendInvitations = () => {
    if (invitations.length === 0) {
      toast.error("No hay invitaciones para enviar");
      return;
    }

    // Aquí iría la lógica para enviar las invitaciones
    toast.success(`${invitations.length} invitaciones enviadas exitosamente`);
    setInvitations([]);
  };

  const copyInvitationLink = (email: string) => {
    const link = `${window.location.origin}/invite?email=${email}&company=techcorp`;
    navigator.clipboard.writeText(link);
    setCopiedEmail(email);
    toast.success("Enlace copiado al portapapeles");

    setTimeout(() => setCopiedEmail(null), 2000);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <UserPlus className="w-8 h-8 text-primary" />
        <h1 className="text-3xl font-bold">Invitar Empleados</h1>
      </div>

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
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Rol en la empresa *</Label>
              <Select
                value={currentInvitation.role}
                onValueChange={(value) =>
                  setCurrentInvitation({ ...currentInvitation, role: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un rol" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              />
            </div>

            <Button
              onClick={addInvitation}
              className="w-full flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              Agregar a la lista
            </Button>
          </CardContent>
        </Card>

        {/* Invitaciones pendientes */}
        <Card>
          <CardHeader>
            <CardTitle>
              Invitaciones Pendientes ({invitations.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {invitations.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No hay invitaciones pendientes</p>
                <p className="text-sm">Agrega empleados usando el formulario</p>
              </div>
            ) : (
              <div className="space-y-4">
                {invitations.map((invitation, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">{invitation.email}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Rol:{" "}
                        {roles.find((r) => r.value === invitation.role)?.label}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyInvitationLink(invitation.email)}
                      >
                        {copiedEmail === invitation.email ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeInvitation(index)}
                      >
                        Eliminar
                      </Button>
                    </div>
                  </div>
                ))}

                <Button
                  onClick={sendInvitations}
                  className="w-full flex items-center gap-2 mt-4"
                >
                  <Send className="w-4 h-4" />
                  Enviar {invitations.length} invitaciones
                </Button>
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
