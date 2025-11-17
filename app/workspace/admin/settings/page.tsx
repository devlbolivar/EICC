"use client";

import { useAdmin } from "@/hooks/use-admin";
import { redirect } from "next/navigation";
import { useState, useEffect } from "react";
import { toast } from "sonner";
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

interface Settings {
  // General
  appName: string;
  appUrl: string;
  timezone: string;
  language: string;
  // Security
  sessionTimeout: string;
  maxLoginAttempts: string;
  require2FA: string;
  requireEmailVerification: string;
  // Email
  smtpHost: string;
  smtpPort: string;
  smtpUser: string;
  smtpPass: string;
  fromEmail: string;
  // Database
  autoBackup: string;
  backupRetention: string;
  autoOptimize: string;
  maxConnections: string;
}

export default function AdminSettingsPage() {
  const { isAdmin } = useAdmin();
  const [settings, setSettings] = useState<Settings>({
    appName: "",
    appUrl: "",
    timezone: "",
    language: "",
    sessionTimeout: "",
    maxLoginAttempts: "",
    require2FA: "false",
    requireEmailVerification: "true",
    smtpHost: "",
    smtpPort: "",
    smtpUser: "",
    smtpPass: "",
    fromEmail: "",
    autoBackup: "true",
    backupRetention: "",
    autoOptimize: "true",
    maxConnections: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Redirigir si no es administrador
  if (!isAdmin) {
    redirect("/");
  }

  // Cargar configuraciones al montar el componente
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch("/api/admin/settings");
        if (!response.ok) {
          throw new Error("Error al cargar configuraciones");
        }
        const result = await response.json();
        if (result.success) {
          setSettings(result.data);
        }
      } catch (error) {
        console.error("Error cargando configuraciones:", error);
        toast.error("Error al cargar las configuraciones");
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  // Manejar cambios en los inputs
  const handleInputChange = (key: keyof Settings, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  // Manejar cambios en los switches
  const handleSwitchChange = (key: keyof Settings, checked: boolean) => {
    setSettings((prev) => ({ ...prev, [key]: String(checked) }));
  };

  // Guardar configuraciones
  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/admin/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        throw new Error("Error al guardar configuraciones");
      }

      const result = await response.json();
      if (result.success) {
        toast.success("Configuraciones guardadas exitosamente");
      }
    } catch (error) {
      console.error("Error guardando configuraciones:", error);
      toast.error("Error al guardar las configuraciones");
    } finally {
      setSaving(false);
    }
  };

  // Restaurar valores por defecto
  const handleRestore = async () => {
    const confirmed = confirm(
      "¿Estás seguro de que deseas restaurar los valores por defecto?"
    );
    if (!confirmed) return;

    setSettings({
      appName: "EICCC",
      appUrl: "https://eiccc.com",
      timezone: "america/santiago",
      language: "es",
      sessionTimeout: "120",
      maxLoginAttempts: "5",
      require2FA: "false",
      requireEmailVerification: "true",
      smtpHost: "",
      smtpPort: "587",
      smtpUser: "",
      smtpPass: "",
      fromEmail: "noreply@eiccc.com",
      autoBackup: "true",
      backupRetention: "30",
      autoOptimize: "true",
      maxConnections: "100",
    });
    toast.info("Valores restaurados. No olvides guardar los cambios.");
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-600">Cargando configuraciones...</p>
        </div>
      </div>
    );
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
                value={settings.appName}
                onChange={(e) => handleInputChange("appName", e.target.value)}
                placeholder="Nombre de la aplicación"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="appUrl">URL de la aplicación</Label>
              <Input
                id="appUrl"
                value={settings.appUrl}
                onChange={(e) => handleInputChange("appUrl", e.target.value)}
                placeholder="https://ejemplo.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="timezone">Zona horaria</Label>
              <Select
                value={settings.timezone}
                onValueChange={(value) => handleInputChange("timezone", value)}
              >
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
              <Select
                value={settings.language}
                onValueChange={(value) => handleInputChange("language", value)}
              >
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
                value={settings.sessionTimeout}
                onChange={(e) =>
                  handleInputChange("sessionTimeout", e.target.value)
                }
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
                value={settings.maxLoginAttempts}
                onChange={(e) =>
                  handleInputChange("maxLoginAttempts", e.target.value)
                }
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
              <Switch
                checked={settings.require2FA === "true"}
                onCheckedChange={(checked) =>
                  handleSwitchChange("require2FA", checked)
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Verificación de email</Label>
                <p className="text-sm text-gray-500">
                  Requerir verificación de email al registrarse
                </p>
              </div>
              <Switch
                checked={settings.requireEmailVerification === "true"}
                onCheckedChange={(checked) =>
                  handleSwitchChange("requireEmailVerification", checked)
                }
              />
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
              <Input
                id="smtpHost"
                value={settings.smtpHost}
                onChange={(e) => handleInputChange("smtpHost", e.target.value)}
                placeholder="smtp.gmail.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="smtpPort">Puerto SMTP</Label>
              <Input
                id="smtpPort"
                type="number"
                value={settings.smtpPort}
                onChange={(e) => handleInputChange("smtpPort", e.target.value)}
                placeholder="587"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="smtpUser">Usuario SMTP</Label>
              <Input
                id="smtpUser"
                value={settings.smtpUser}
                onChange={(e) => handleInputChange("smtpUser", e.target.value)}
                placeholder="usuario@ejemplo.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="smtpPass">Contraseña SMTP</Label>
              <Input
                id="smtpPass"
                type="password"
                value={settings.smtpPass}
                onChange={(e) => handleInputChange("smtpPass", e.target.value)}
                placeholder="Contraseña"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fromEmail">Email remitente</Label>
              <Input
                id="fromEmail"
                value={settings.fromEmail}
                onChange={(e) => handleInputChange("fromEmail", e.target.value)}
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
              <Switch
                checked={settings.autoBackup === "true"}
                onCheckedChange={(checked) =>
                  handleSwitchChange("autoBackup", checked)
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="backupRetention">
                Retención de respaldos (días)
              </Label>
              <Input
                id="backupRetention"
                type="number"
                value={settings.backupRetention}
                onChange={(e) =>
                  handleInputChange("backupRetention", e.target.value)
                }
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
              <Switch
                checked={settings.autoOptimize === "true"}
                onCheckedChange={(checked) =>
                  handleSwitchChange("autoOptimize", checked)
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxConnections">Conexiones máximas</Label>
              <Input
                id="maxConnections"
                type="number"
                value={settings.maxConnections}
                onChange={(e) =>
                  handleInputChange("maxConnections", e.target.value)
                }
                min="10"
                max="1000"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Botones de acción */}
      <div className="mt-8 flex gap-4">
        <Button onClick={handleSave} disabled={saving}>
          <Save className="w-4 h-4 mr-2" />
          {saving ? "Guardando..." : "Guardar Configuración"}
        </Button>
        <Button variant="outline" onClick={handleRestore} disabled={saving}>
          Restaurar Valores por Defecto
        </Button>
      </div>
    </div>
  );
}
