"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  Search,
  Filter,
  Users,
  BookOpen,
  Award,
  Calendar,
  Download,
  Loader2,
  X,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  joinedAt: string;
  coursesCompleted: number;
  certificates: number;
  avatar: string;
  lastLoginAt: string | null;
}

interface CompanyStats {
  totalEmployees: number;
  activeEmployees: number;
  totalCoursesCompleted: number;
  totalCertificates: number;
}

const CompanyProgress = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [stats, setStats] = useState<CompanyStats>({
    totalEmployees: 0,
    activeEmployees: 0,
    totalCoursesCompleted: 0,
    totalCertificates: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [progressFilter, setProgressFilter] = useState("");
  const [exportLoading, setExportLoading] = useState(false);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/company/employees?limit=100");

      if (!response.ok) {
        throw new Error("Error al obtener empleados");
      }

      const result = await response.json();

      if (result.success) {
        setEmployees(result.data.employees);
        setStats(result.data.stats);
      } else {
        throw new Error(result.error || "Error al obtener empleados");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al cargar los datos de empleados");
    } finally {
      setLoading(false);
    }
  };

  const filteredEmployees = employees.filter((employee) => {
    const matchesSearch =
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.role.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = !roleFilter || employee.role.toLowerCase().includes(roleFilter.toLowerCase());

    let matchesProgress = true;
    if (progressFilter === "high") {
      matchesProgress = employee.coursesCompleted >= 5;
    } else if (progressFilter === "medium") {
      matchesProgress = employee.coursesCompleted >= 2 && employee.coursesCompleted < 5;
    } else if (progressFilter === "low") {
      matchesProgress = employee.coursesCompleted < 2;
    }

    return matchesSearch && matchesRole && matchesProgress;
  });

  const getProgressPercentage = (completed: number, total: number) => {
    if (total === 0) return 0;
    return (completed / total) * 100;
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 80) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBadge = (score: number) => {
    if (score >= 90)
      return <Badge className="bg-green-100 text-green-800">Excelente</Badge>;
    if (score >= 80)
      return <Badge className="bg-yellow-100 text-yellow-800">Bueno</Badge>;
    return <Badge className="bg-red-100 text-red-800">Necesita mejorar</Badge>;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Nunca";
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Hoy";
    if (diffDays === 1) return "Hace 1 día";
    if (diffDays < 7) return `Hace ${diffDays} días`;
    if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} semanas`;

    return date.toLocaleDateString();
  };

  const handleExportReport = async () => {
    try {
      setExportLoading(true);

      // Crear CSV con los datos filtrados
      const headers = ["Nombre", "Email", "Rol", "Estado", "Cursos Completados", "Certificados", "Última Actividad"];
      const csvData = filteredEmployees.map(emp => [
        emp.name,
        emp.email,
        emp.role,
        emp.status === "active" ? "Activo" : "Inactivo",
        emp.coursesCompleted.toString(),
        emp.certificates.toString(),
        formatDate(emp.lastLoginAt)
      ]);

      const csvContent = [
        headers.join(","),
        ...csvData.map(row => row.map(cell => `"${cell}"`).join(","))
      ].join("\n");

      // Crear y descargar el archivo
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `reporte-progreso-${new Date().toISOString().split("T")[0]}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Reporte exportado exitosamente");
    } catch (error) {
      console.error("Error exporting report:", error);
      toast.error("Error al exportar el reporte");
    } finally {
      setExportLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <TrendingUp className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold">Progreso de Empleados</h1>
        </div>
        <Button
          className="flex items-center gap-2"
          onClick={handleExportReport}
          disabled={exportLoading}
        >
          {exportLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Exportando...
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              Exportar Reporte
            </>
          )}
        </Button>
      </div>

      {/* Estadísticas generales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Empleados
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEmployees}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeEmployees} activos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Cursos Completados
            </CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCoursesCompleted}</div>
            <p className="text-xs text-muted-foreground">Total acumulado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Promedio por Empleado
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalEmployees > 0
                ? (stats.totalCoursesCompleted / stats.totalEmployees).toFixed(1)
                : "0"}
            </div>
            <p className="text-xs text-muted-foreground">
              Cursos por empleado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Certificados Emitidos
            </CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCertificates}</div>
            <p className="text-xs text-muted-foreground">Total acumulado</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros y búsqueda */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar empleados..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filtrar por Rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los roles</SelectItem>
                  <SelectItem value="desarrollador">Desarrollador</SelectItem>
                  <SelectItem value="gerente">Gerente</SelectItem>
                  <SelectItem value="analista">Analista</SelectItem>
                  <SelectItem value="diseñador">Diseñador</SelectItem>
                </SelectContent>
              </Select>
              <Select value={progressFilter} onValueChange={setProgressFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filtrar por Progreso" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="high">Alto (5+ cursos)</SelectItem>
                  <SelectItem value="medium">Medio (2-4 cursos)</SelectItem>
                  <SelectItem value="low">Bajo (&lt;2 cursos)</SelectItem>
                </SelectContent>
              </Select>
              {(roleFilter || progressFilter) && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setRoleFilter("");
                    setProgressFilter("");
                  }}
                  title="Limpiar filtros"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de empleados con progreso */}
      <Card>
        <CardHeader>
          <CardTitle>Progreso Individual ({filteredEmployees.length} empleados)</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredEmployees.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                No se encontraron empleados
              </h3>
              <p className="text-muted-foreground">
                {searchTerm ? "Intenta con otro término de búsqueda" : "No hay empleados registrados"}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredEmployees.map((employee) => {
                // Estimamos un promedio de cursos totales basado en los completados
                const estimatedTotalCourses = Math.max(employee.coursesCompleted, 1);
                const progressPercentage = employee.coursesCompleted > 0 ? 100 : 0;

                return (
                  <div
                    key={employee.id}
                    className="border rounded-lg p-6 space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold">
                          {employee.avatar}
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{employee.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {employee.role}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {employee.email}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge
                          className={
                            employee.status === "active"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }
                        >
                          {employee.status === "active" ? "Activo" : "Inactivo"}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {employee.coursesCompleted}
                        </div>
                        <p className="text-sm text-muted-foreground">Cursos Completados</p>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {employee.certificates}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Certificados
                        </p>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {employee.phone || "N/A"}
                        </div>
                        <p className="text-sm text-muted-foreground">Teléfono</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progreso General</span>
                        <span>
                          {employee.coursesCompleted > 0 ? "100" : "0"}%
                        </span>
                      </div>
                      <Progress
                        value={progressPercentage}
                        className="h-3"
                      />
                    </div>

                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>
                          Última actividad: {formatDate(employee.lastLoginAt)}
                        </span>
                      </div>
                      <Button variant="outline" size="sm">
                        Ver Detalles
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CompanyProgress;
