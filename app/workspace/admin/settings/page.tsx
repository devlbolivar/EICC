"use client";

import { useAdmin } from "@/hooks/use-admin";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Save, Globe, Shield, Mail, Database } from "lucide-react";

export default function AdminSettingsPage() {
  const { isAdmin } = useAdmin();

  // Redirigir si no es administrador
  if (!isAdmin) {
    redirect("/");
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Configuraciones</h1>
          <p className="text-gray-600 mt-2">
            Configura los parámetros del sistema
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuración General */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Configuración General
            </CardTitle>
            <CardDescription>
              Configuración básica de la plataforma
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="appName">Nombre de la aplicación</Label>
              <Input
                id="appName"
                defaultValue="EICCC"
                placeholder="Nombre de la aplicación"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="appUrl">URL de la aplicación</Label>
              <Input
                id="appUrl"
                defaultValue="https://eiccc.com"
                placeholder="https://ejemplo.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="timezone">Zona horaria</Label>
              <Select defaultValue="america/santiago">
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona zona horaria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="america/santiago">
                    Santiago (GMT-3)
                  </SelectItem>
                  <SelectItem value="america/new_york">
                    Nueva York (GMT-5)
                  </SelectItem>
                  <SelectItem value="europe/madrid">Madrid (GMT+1)</SelectItem>
                  <SelectItem value="utc">UTC</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="language">Idioma por defecto</Label>
              <Select defaultValue="es">
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona idioma" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="es">Español</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="pt">Português</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Configuración de Seguridad */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Seguridad
            </CardTitle>
            <CardDescription>
              Configuración de seguridad y autenticación
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="sessionTimeout">Tiempo de sesión (minutos)</Label>
              <Input
                id="sessionTimeout"
                type="number"
                defaultValue="120"
                min="30"
                max="1440"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxLoginAttempts">
                Intentos máximos de login
              </Label>
              <Input
                id="maxLoginAttempts"
                type="number"
                defaultValue="5"
                min="3"
                max="10"
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Autenticación de dos factores</Label>
                <p className="text-sm text-gray-500">
                  Requerir 2FA para todos los usuarios
                </p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Verificación de email</Label>
                <p className="text-sm text-gray-500">
                  Requerir verificación de email al registrarse
                </p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* Configuración de Email */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Configuración de Email
            </CardTitle>
            <CardDescription>
              Configuración del servicio de email
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="smtpHost">Servidor SMTP</Label>
              <Input id="smtpHost" placeholder="smtp.gmail.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="smtpPort">Puerto SMTP</Label>
              <Input
                id="smtpPort"
                type="number"
                defaultValue="587"
                placeholder="587"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="smtpUser">Usuario SMTP</Label>
              <Input id="smtpUser" placeholder="usuario@ejemplo.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="smtpPass">Contraseña SMTP</Label>
              <Input id="smtpPass" type="password" placeholder="Contraseña" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fromEmail">Email remitente</Label>
              <Input
                id="fromEmail"
                defaultValue="noreply@eiccc.com"
                placeholder="noreply@ejemplo.com"
              />
            </div>
          </CardContent>
        </Card>

        {/* Configuración de Base de Datos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Base de Datos
            </CardTitle>
            <CardDescription>
              Configuración de respaldos y mantenimiento
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Respaldos automáticos</Label>
                <p className="text-sm text-gray-500">
                  Realizar respaldos diarios automáticos
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="space-y-2">
              <Label htmlFor="backupRetention">
                Retención de respaldos (días)
              </Label>
              <Input
                id="backupRetention"
                type="number"
                defaultValue="30"
                min="7"
                max="365"
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Optimización automática</Label>
                <p className="text-sm text-gray-500">
                  Optimizar base de datos semanalmente
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxConnections">Conexiones máximas</Label>
              <Input
                id="maxConnections"
                type="number"
                defaultValue="100"
                min="10"
                max="1000"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Botones de acción */}
      <div className="mt-8 flex gap-4">
        <Button>
          <Save className="w-4 h-4 mr-2" />
          Guardar Configuración
        </Button>
        <Button variant="outline">Restaurar Valores por Defecto</Button>
      </div>
    </div>
  );
}
