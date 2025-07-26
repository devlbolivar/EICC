"use client";
import React from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { User, Mail, Calendar, Edit, Save, X } from "lucide-react";

const StudentProfile = () => {
  const [isEditing, setIsEditing] = React.useState(false);

  const userProfile = {
    name: "Juan Pérez",
    email: "juan.perez@example.com",
    phone: "+56 9 1234 5678",
    location: "Santiago, Chile",
    bio: "Desarrollador web apasionado por aprender nuevas tecnologías. Me especializo en React, TypeScript y Node.js.",
    joinDate: "2023-03-15",
    avatar: "/online-education.png",
    coursesCompleted: 12,
    certificatesEarned: 8,
    totalStudyHours: 156,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mi Perfil</h1>
          <p className="text-muted-foreground">
            Gestiona tu información personal y preferencias
          </p>
        </div>
        <Button
          onClick={() => setIsEditing(!isEditing)}
          variant={isEditing ? "outline" : "default"}
        >
          {isEditing ? (
            <>
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </>
          ) : (
            <>
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </>
          )}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Información Principal */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Información Personal</CardTitle>
              <CardDescription>
                Actualiza tu información personal y de contacto
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre completo</Label>
                  <Input
                    id="name"
                    defaultValue={userProfile.name}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Correo electrónico</Label>
                  <Input
                    id="email"
                    type="email"
                    defaultValue={userProfile.email}
                    disabled={!isEditing}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input
                    id="phone"
                    defaultValue={userProfile.phone}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Ubicación</Label>
                  <Input
                    id="location"
                    defaultValue={userProfile.location}
                    disabled={!isEditing}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Biografía</Label>
                <Textarea
                  id="bio"
                  defaultValue={userProfile.bio}
                  disabled={!isEditing}
                  rows={3}
                />
              </div>
              {isEditing && (
                <div className="flex gap-2">
                  <Button>
                    <Save className="h-4 w-4 mr-2" />
                    Guardar cambios
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Seguridad</CardTitle>
              <CardDescription>
                Gestiona tu contraseña y configuraciones de seguridad
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Contraseña actual</Label>
                  <Input
                    id="current-password"
                    type="password"
                    placeholder="••••••••"
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">Nueva contraseña</Label>
                  <Input
                    id="new-password"
                    type="password"
                    placeholder="••••••••"
                    disabled={!isEditing}
                  />
                </div>
              </div>
              {isEditing && (
                <Button variant="outline">Cambiar contraseña</Button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Avatar y Stats */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <User className="h-12 w-12 text-white" />
                  </div>
                  {isEditing && (
                    <Button
                      size="sm"
                      className="absolute -bottom-2 -right-2 rounded-full w-8 h-8"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-semibold">{userProfile.name}</h3>
                  <p className="text-sm text-muted-foreground">Estudiante</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Estadísticas */}
          <Card>
            <CardHeader>
              <CardTitle>Estadísticas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Cursos completados</span>
                <span className="font-semibold">
                  {userProfile.coursesCompleted}
                </span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm">Certificados</span>
                <span className="font-semibold">
                  {userProfile.certificatesEarned}
                </span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm">Horas de estudio</span>
                <span className="font-semibold">
                  {userProfile.totalStudyHours}h
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Información de la cuenta */}
          <Card>
            <CardHeader>
              <CardTitle>Información de la cuenta</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Miembro desde</span>
                <span className="font-medium">
                  {new Date(userProfile.joinDate).toLocaleDateString("es-ES", {
                    year: "numeric",
                    month: "long",
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>Email verificado</span>
                <span className="text-green-600">✓</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
