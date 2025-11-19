"use client";

import { useAdmin } from "@/hooks/use-admin";
import { useAdminUsers } from "@/hooks/use-admin-users";
import { redirect } from "next/navigation";
import { useState, useEffect } from "react";
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
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Calendar,
  User as UserIcon,
  Building,
  Save,
  X,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";

// User data structure returned from admin API
interface UserCompanyData {
  id: string;
  role: { id: string; name: string; description?: string; permissions?: string[] };
  company?: { id: string; name: string; description?: string };
  isActive?: boolean;
  joinedAt: string | Date;
  acceptedAt?: string | Date;
  invitedBy?: { name: string; email: string };
}

interface AdminUserDetail {
  id: string;
  name: string;
  email: string;
  avatar?: string | null;
  isActive: boolean;
  emailVerified?: boolean;
  age?: number | null;
  subscriptionId?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  lastLoginAt?: string | Date | null;
  userCompanies?: UserCompanyData[];
}

export default function UserDetailPage() {
  const { isAdmin } = useAdmin();
  const { getUser, deleteUser, updateUser } = useAdminUsers();
  const params = useParams();
  const router = useRouter();

  const [user, setUser] = useState<AdminUserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    age: "",
    subscriptionId: "",
    isActive: true,
  });

  // Redirigir si no es administrador
  if (!isAdmin) {
    redirect("/");
  }

  useEffect(() => {
    const loadUser = async () => {
      try {
        setLoading(true);
        const userData = await getUser(params.id as string);
        setUser(userData);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Error al cargar usuario"
        );
        toast.error("Error al cargar usuario");
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      loadUser();
    }
  }, [params.id, getUser]);

  const handleDeleteUser = async () => {
    try {
      await deleteUser(params.id as string);
      toast.success("Usuario eliminado correctamente");
      router.push("/workspace/admin/users");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Error al eliminar usuario"
      );
    }
  };

  const handleEditClick = () => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        age: user.age?.toString() || "",
        subscriptionId: user.subscriptionId || "",
        isActive: user.isActive ?? true,
      });
      setShowEditModal(true);
    }
  };

  const handleInputChange = (field: string, value: string | number | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSaving(true);
      await updateUser(params.id as string, {
        ...formData,
        age: formData.age ? parseInt(formData.age) : undefined,
      });
      toast.success("Usuario actualizado correctamente");
      setShowEditModal(false);
      // Recargar datos del usuario
      const updatedUser = await getUser(params.id as string);
      setUser(updatedUser);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Error al actualizar usuario"
      );
    } finally {
      setSaving(false);
    }
  };

  const getRoleBadgeColor = (roleName: string) => {
    switch (roleName) {
      case "admin":
        return "bg-red-100 text-red-800";
      case "company":
        return "bg-blue-100 text-blue-800";
      case "student":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusBadgeColor = (isActive: boolean) => {
    return isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800";
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {error || "Usuario no encontrado"}
          </h2>
          <Link href="/workspace/admin/users">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver a la lista
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Link href="/workspace/admin/users">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
          </Link>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleEditClick}>
              <Edit className="w-4 h-4 mr-2" />
              Editar
            </Button>
            <Button variant="outline" size="sm" onClick={handleDeleteUser}>
              <Trash2 className="w-4 h-4 mr-2" />
              Eliminar
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
            {user.avatar ? (
              <Image
                src={user.avatar}
                alt={user.name}
                width={64}
                height={64}
                className="w-16 h-16 rounded-full"
                unoptimized
              />
            ) : (
              <span className="text-gray-600 text-2xl font-medium">
                {user.name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{user.name}</h1>
            <p className="text-gray-600">{user.email}</p>
            <div className="flex gap-2 mt-2">
              <Badge className={getStatusBadgeColor(user.isActive)}>
                {user.isActive ? "Activo" : "Inactivo"}
              </Badge>
              {user.emailVerified && (
                <Badge variant="secondary">Email Verificado</Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Información Personal */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserIcon className="w-5 h-5" />
              Información Personal
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Nombre
                </label>
                <p className="text-gray-900">{user.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Email
                </label>
                <p className="text-gray-900">{user.email}</p>
              </div>
              {user.age && (
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Edad
                  </label>
                  <p className="text-gray-900">{user.age} años</p>
                </div>
              )}
              {user.subscriptionId && (
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    ID Suscripción
                  </label>
                  <p className="text-gray-900">{user.subscriptionId}</p>
                </div>
              )}
            </div>
            <Separator />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Estado
                </label>
                <Badge className={getStatusBadgeColor(user.isActive)}>
                  {user.isActive ? "Activo" : "Inactivo"}
                </Badge>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Email Verificado
                </label>
                <Badge variant={user.emailVerified ? "default" : "secondary"}>
                  {user.emailVerified ? "Sí" : "No"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Información de Actividad */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Información de Actividad
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Fecha de Creación
                </label>
                <p className="text-gray-900">
                  {new Date(user.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Última Actualización
                </label>
                <p className="text-gray-900">
                  {new Date(user.updatedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <Separator />
            <div>
              <label className="text-sm font-medium text-gray-500">
                Último Login
              </label>
              <p className="text-gray-900">
                {user.lastLoginAt
                  ? new Date(user.lastLoginAt).toLocaleDateString() +
                    " " +
                    new Date(user.lastLoginAt).toLocaleTimeString()
                  : "Nunca ha iniciado sesión"}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Roles y Empresas */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="w-5 h-5" />
              Roles y Empresas
            </CardTitle>
            <CardDescription>
              Relaciones del usuario con empresas y roles asignados
            </CardDescription>
          </CardHeader>
          <CardContent>
            {user.userCompanies && user.userCompanies.length > 0 ? (
              <div className="space-y-4">
                {user.userCompanies.map((userCompany: UserCompanyData) => (
                  <div key={userCompany.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Badge
                          className={getRoleBadgeColor(userCompany.role.name)}
                        >
                          {userCompany.role.name}
                        </Badge>
                        <Badge
                          variant={
                            userCompany.isActive ? "default" : "secondary"
                          }
                        >
                          {userCompany.isActive ? "Activo" : "Inactivo"}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-500">
                        ID: {userCompany.id}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Empresa
                        </label>
                        <p className="text-gray-900">
                          {userCompany.company
                            ? userCompany.company.name
                            : "Usuario Individual"}
                        </p>
                        {userCompany.company?.description && (
                          <p className="text-sm text-gray-600 mt-1">
                            {userCompany.company.description}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Rol
                        </label>
                        <p className="text-gray-900">{userCompany.role.name}</p>
                        {userCompany.role.description && (
                          <p className="text-sm text-gray-600 mt-1">
                            {userCompany.role.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Fecha de Unión
                        </label>
                        <p className="text-gray-900">
                          {new Date(userCompany.joinedAt).toLocaleDateString()}
                        </p>
                      </div>

                      {userCompany.acceptedAt && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">
                            Fecha de Aceptación
                          </label>
                          <p className="text-gray-900">
                            {new Date(
                              userCompany.acceptedAt
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      )}

                      {userCompany.invitedBy && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">
                            Invitado por
                          </label>
                          <p className="text-gray-900">
                            {userCompany.invitedBy.name}
                          </p>
                          <p className="text-sm text-gray-600">
                            {userCompany.invitedBy.email}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Permisos del rol */}
                    {userCompany.role.permissions &&
                      userCompany.role.permissions.length > 0 && (
                        <div className="mt-4">
                          <label className="text-sm font-medium text-gray-500">
                            Permisos
                          </label>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {userCompany.role.permissions.map(
                              (permission: string, permIndex: number) => (
                                <Badge
                                  key={permIndex}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {permission}
                                </Badge>
                              )
                            )}
                          </div>
                        </div>
                      )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <UserIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No hay roles o empresas asignadas</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modal de Edición */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserIcon className="w-5 h-5" />
              Editar Usuario
            </DialogTitle>
            <DialogDescription>
              Modifica la información personal del usuario. Los cambios se
              aplicarán inmediatamente.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Información Personal */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Información Personal
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Nombre completo"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="correo@ejemplo.com"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="age">Edad</Label>
                  <Input
                    id="age"
                    type="number"
                    value={formData.age}
                    onChange={(e) => handleInputChange("age", e.target.value)}
                    placeholder="25"
                    min="0"
                    max="120"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subscriptionId">ID Suscripción</Label>
                  <Input
                    id="subscriptionId"
                    value={formData.subscriptionId}
                    onChange={(e) =>
                      handleInputChange("subscriptionId", e.target.value)
                    }
                    placeholder="sub_123456789"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Estado del Usuario */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Estado de la Cuenta
              </h3>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="space-y-1">
                  <Label className="text-base">Estado del Usuario</Label>
                  <p className="text-sm text-gray-600">
                    Activar o desactivar la cuenta del usuario
                  </p>
                </div>
                <Switch
                  checked={formData.isActive}
                  onCheckedChange={(checked) =>
                    handleInputChange("isActive", checked)
                  }
                />
              </div>
            </div>

            <Separator />

            {/* Información de Solo Lectura */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Información del Sistema
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Email Verificado</Label>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={user?.emailVerified ? "default" : "secondary"}
                    >
                      {user?.emailVerified ? "Sí" : "No"}
                    </Badge>
                    <span className="text-xs text-gray-500">No editable</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Último Login</Label>
                  <p className="text-sm text-gray-600">
                    {user?.lastLoginAt
                      ? new Date(user.lastLoginAt).toLocaleDateString() +
                        " " +
                        new Date(user.lastLoginAt).toLocaleTimeString()
                      : "Nunca ha iniciado sesión"}
                  </p>
                </div>
              </div>
            </div>

            {/* Botones de Acción */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowEditModal(false)}
                disabled={saving}
              >
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
              <Button type="submit" disabled={saving}>
                <Save className="w-4 h-4 mr-2" />
                {saving ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
