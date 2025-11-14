"use client";

import { useAdmin } from "@/hooks/use-admin";
import { useAdminUsers } from "@/hooks/use-admin-users";
import { redirect } from "next/navigation";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  User,
  Save,
  X,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function AdminUsersPage() {
  const { isAdmin } = useAdmin();
  const searchParams = useSearchParams();
  const {
    users,
    loading,
    error,
    pagination,
    filters,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    getRoles,
    getCompanies,
    setFilters,
    clearError,
  } = useAdminUsers();

  // Estados para el formulario de creación
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [roles, setRoles] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    roleId: "",
    companyId: "",
    age: "",
    subscriptionId: "",
    isActive: true,
  });

  // Redirigir si no es administrador
  if (!isAdmin) {
    redirect("/");
  }

  // Cargar roles y empresas al montar el componente
  useEffect(() => {
    const loadFormData = async () => {
      try {
        const [rolesData, companiesData] = await Promise.all([
          getRoles(),
          getCompanies(),
        ]);
        setRoles(rolesData);
        setCompanies(companiesData);
      } catch (error) {
        console.error("Error al cargar datos del formulario:", error);
      }
    };

    loadFormData();
  }, []);

  // Verificar si debe abrir el modal de creación
  useEffect(() => {
    if (searchParams.get("create") === "true") {
      setIsCreateDialogOpen(true);
      // Limpiar el parámetro de la URL
      const url = new URL(window.location.href);
      url.searchParams.delete("create");
      window.history.replaceState({}, "", url.toString());
    }
  }, [searchParams]);

  // Manejar cambios en los filtros
  const handleFilterChange = (key: string, value: string) => {
    setFilters({ [key]: value });
  };

  // Aplicar filtros
  const applyFilters = () => {
    fetchUsers({
      page: 1,
      search: filters.search,
      role: filters.role === "all-roles" ? "" : filters.role,
      status: filters.status === "all-status" ? "" : filters.status,
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder,
    });
  };

  // Limpiar filtros
  const clearFilters = () => {
    setFilters({
      search: "",
      role: "all-roles",
      status: "all-status",
      sortBy: "createdAt",
      sortOrder: "desc",
    });
    fetchUsers({
      page: 1,
      search: "",
      role: "",
      status: "",
      sortBy: "createdAt",
      sortOrder: "desc",
    });
  };

  // Manejar creación de usuario
  const handleCreateUser = async () => {
    try {
      await createUser({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        roleId: formData.roleId,
        companyId: formData.companyId || undefined,
        age: formData.age ? parseInt(formData.age) : undefined,
        subscriptionId: formData.subscriptionId || undefined,
        isActive: formData.isActive,
      });

      toast.success("Usuario creado correctamente");
      setIsCreateDialogOpen(false);
      resetForm();
      fetchUsers(); // Recargar lista
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Error al crear usuario"
      );
    }
  };

  // Manejar edición de usuario
  const handleEditUser = async () => {
    if (!selectedUser) return;

    try {
      await updateUser(selectedUser.id, {
        name: formData.name,
        email: formData.email,
        isActive: formData.isActive,
        age: formData.age ? parseInt(formData.age) : undefined,
        subscriptionId: formData.subscriptionId || undefined,
      });

      toast.success("Usuario actualizado correctamente");
      setIsEditDialogOpen(false);
      resetForm();
      fetchUsers(); // Recargar lista
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Error al actualizar usuario"
      );
    }
  };

  // Manejar eliminación de usuario
  const handleDeleteUser = async (userId: string) => {
    try {
      await deleteUser(userId);
      toast.success("Usuario eliminado correctamente");
      fetchUsers(); // Recargar lista
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Error al eliminar usuario"
      );
    }
  };

  // Abrir diálogo de edición
  const openEditDialog = (user: any) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: "",
      roleId: user.userCompanies?.[0]?.role?.id || "",
      companyId: user.userCompanies?.[0]?.company?.id || "",
      age: user.age?.toString() || "",
      subscriptionId: user.subscriptionId || "",
      isActive: user.isActive,
    });
    setIsEditDialogOpen(true);
  };

  // Resetear formulario
  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      roleId: "",
      companyId: "",
      age: "",
      subscriptionId: "",
      isActive: true,
    });
    setSelectedUser(null);
  };

  // Obtener color del badge según el rol
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
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

  // Obtener color del badge según el estado
  const getStatusBadgeColor = (isActive: boolean) => {
    return isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800";
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Usuarios</h1>
            <p className="text-gray-600 mt-2">
              Gestiona todos los usuarios del sistema
            </p>
          </div>
          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          >
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()}>
                <Plus className="w-4 h-4 mr-2" />
                Crear Usuario
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Crear Nuevo Usuario
                </DialogTitle>
                <DialogDescription>
                  Completa la información del nuevo usuario. Los campos marcados
                  con * son obligatorios.
                </DialogDescription>
              </DialogHeader>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleCreateUser();
                }}
                className="space-y-6"
              >
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
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
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
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        placeholder="correo@ejemplo.com"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password">Contraseña *</Label>
                      <Input
                        id="password"
                        type="password"
                        value={formData.password}
                        onChange={(e) =>
                          setFormData({ ...formData, password: e.target.value })
                        }
                        placeholder="Mínimo 6 caracteres"
                        required
                      />
                      <p className="text-xs text-gray-500">
                        Mínimo 6 caracteres
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="age">Edad</Label>
                      <Input
                        id="age"
                        type="number"
                        value={formData.age}
                        onChange={(e) =>
                          setFormData({ ...formData, age: e.target.value })
                        }
                        placeholder="25"
                        min="0"
                        max="120"
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Rol y Empresa */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Asignación de Rol y Empresa
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="role">Rol *</Label>
                      <Select
                        value={formData.roleId}
                        onValueChange={(value) =>
                          setFormData({ ...formData, roleId: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar rol" />
                        </SelectTrigger>
                        <SelectContent>
                          {roles.map((role) => (
                            <SelectItem key={role.id} value={role.id}>
                              {role.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="company">Empresa</Label>
                      <Select
                        value={formData.companyId || "null-company"}
                        onValueChange={(value) =>
                          setFormData({
                            ...formData,
                            companyId: value === "null-company" ? "" : value,
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar empresa (opcional)" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="null-company">
                            Sin empresa
                          </SelectItem>
                          {companies.map((company) => (
                            <SelectItem key={company.id} value={company.id}>
                              {company.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Información Adicional */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Información Adicional
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="subscriptionId">ID Suscripción</Label>
                      <Input
                        id="subscriptionId"
                        value={formData.subscriptionId}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            subscriptionId: e.target.value,
                          })
                        }
                        placeholder="sub_123456789"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Estado del Usuario</Label>
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="space-y-1">
                          <Label className="text-base">Usuario Activo</Label>
                          <p className="text-sm text-gray-600">
                            El usuario podrá acceder al sistema inmediatamente
                          </p>
                        </div>
                        <Switch
                          checked={formData.isActive}
                          onCheckedChange={(checked) =>
                            setFormData({ ...formData, isActive: checked })
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Botones de Acción */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancelar
                  </Button>
                  <Button type="submit">
                    <Save className="w-4 h-4 mr-2" />
                    Crear Usuario
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filtros y búsqueda */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Buscar usuarios..."
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={filters.role}
              onValueChange={(value) => handleFilterChange("role", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-roles">Todos los roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="company">Company</SelectItem>
                <SelectItem value="student">Student</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filters.status}
              onValueChange={(value) => handleFilterChange("status", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-status">Todos los estados</SelectItem>
                <SelectItem value="active">Activo</SelectItem>
                <SelectItem value="inactive">Inactivo</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filters.sortBy}
              onValueChange={(value) => handleFilterChange("sortBy", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt">Fecha de creación</SelectItem>
                <SelectItem value="name">Nombre</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="lastLoginAt">Último login</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Button onClick={applyFilters} className="flex-1">
                <Filter className="w-4 h-4 mr-2" />
                Aplicar
              </Button>
              <Button variant="outline" onClick={clearFilters}>
                Limpiar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mensaje de error */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800">{error}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={clearError}
            className="mt-2"
          >
            Cerrar
          </Button>
        </div>
      )}

      {/* Tabla de usuarios */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Usuarios</CardTitle>
          <CardDescription>
            {loading
              ? "Cargando usuarios..."
              : `${pagination.total} usuarios encontrados`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Usuario</th>
                    <th className="text-left py-3 px-4 font-medium">Email</th>
                    <th className="text-left py-3 px-4 font-medium">
                      Rol Principal
                    </th>
                    <th className="text-left py-3 px-4 font-medium">Empresa</th>
                    <th className="text-left py-3 px-4 font-medium">Estado</th>
                    <th className="text-left py-3 px-4 font-medium">
                      Último Login
                    </th>
                    <th className="text-left py-3 px-4 font-medium">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                            {user.avatar ? (
                              <img
                                src={user.avatar}
                                alt={user.name}
                                className="w-8 h-8 rounded-full"
                              />
                            ) : (
                              <span className="text-gray-600 text-sm font-medium">
                                {user.name.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div>
                            <span className="font-medium">{user.name}</span>
                            {user.age && (
                              <p className="text-sm text-gray-500">
                                {user.age} años
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <span>{user.email}</span>
                          {user.emailVerified && (
                            <Badge variant="secondary" className="ml-2 text-xs">
                              Verificado
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={getRoleBadgeColor(user.primaryRole)}>
                          {user.primaryRole}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        {user.roles.length > 0 ? (
                          <div>
                            {user.roles.map((role, index) => (
                              <div key={index} className="text-sm">
                                {role.company}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-500">Individual</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={getStatusBadgeColor(user.isActive)}>
                          {user.isActive ? "Activo" : "Inactivo"}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        {user.lastLoginAt ? (
                          <span className="text-sm text-gray-600">
                            {new Date(user.lastLoginAt).toLocaleDateString()}
                          </span>
                        ) : (
                          <span className="text-gray-400">Nunca</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <Link href={`/workspace/admin/users/${user.id}`}>
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(user)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  ¿Eliminar usuario?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta acción no se puede deshacer. Se eliminará
                                  permanentemente el usuario "{user.name}".
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteUser(user.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Eliminar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Paginación */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-between items-center mt-6">
              <div className="text-sm text-gray-600">
                Mostrando {(pagination.page - 1) * pagination.limit + 1} a{" "}
                {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
                de {pagination.total} usuarios
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchUsers({ page: pagination.page - 1 })}
                  disabled={pagination.page <= 1}
                >
                  Anterior
                </Button>
                <span className="px-3 py-2 text-sm">
                  Página {pagination.page} de {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchUsers({ page: pagination.page + 1 })}
                  disabled={pagination.page >= pagination.totalPages}
                >
                  Siguiente
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Diálogo de edición */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Editar Usuario
            </DialogTitle>
            <DialogDescription>
              Modifica la información personal del usuario. Los cambios se
              aplicarán inmediatamente.
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleEditUser();
            }}
            className="space-y-6"
          >
            {/* Información Personal */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Información Personal
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Nombre *</Label>
                  <Input
                    id="edit-name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Nombre completo"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-email">Email *</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="correo@ejemplo.com"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-age">Edad</Label>
                  <Input
                    id="edit-age"
                    type="number"
                    value={formData.age}
                    onChange={(e) =>
                      setFormData({ ...formData, age: e.target.value })
                    }
                    placeholder="25"
                    min="0"
                    max="120"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-subscriptionId">ID Suscripción</Label>
                  <Input
                    id="edit-subscriptionId"
                    value={formData.subscriptionId}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        subscriptionId: e.target.value,
                      })
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
                    setFormData({ ...formData, isActive: checked })
                  }
                />
              </div>
            </div>

            {/* Botones de Acción */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
              <Button type="submit">
                <Save className="w-4 h-4 mr-2" />
                Guardar Cambios
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
