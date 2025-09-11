"use client";

import { useAdmin } from "@/hooks/use-admin";
import { useAdminCompanies } from "@/hooks/use-admin-companies";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Search, Filter, Building2, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default function AdminCompaniesPage() {
  const { isAdmin } = useAdmin();
  const { companies, loading, error, pagination, fetchCompanies, deleteCompany } = useAdminCompanies();

  // Redirigir si no es administrador
  if (!isAdmin) {
    redirect("/");
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Empresas</h1>
            <p className="text-gray-600 mt-2">
              Gestiona todas las empresas registradas
            </p>
          </div>
          <Link href="/workspace/admin/companies/create">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Crear Empresa
            </Button>
          </Link>
        </div>
      </div>

      {/* Filtros y búsqueda */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar empresas..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={(e) => fetchCompanies({ search: e.target.value })}
              />
            </div>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de empresas */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Empresas</CardTitle>
          <CardDescription>
            {loading ? "Cargando empresas..." : `${pagination.total} empresas encontradas`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && <p className="text-red-500">{error}</p>}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Empresa</th>
                  <th className="text-left py-3 px-4 font-medium">RUT</th>
                  <th className="text-left py-3 px-4 font-medium">Industria</th>
                  <th className="text-left py-3 px-4 font-medium">Plan</th>
                  <th className="text-left py-3 px-4 font-medium">Estado</th>
                  <th className="text-left py-3 px-4 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                    </td>
                  </tr>
                ) : (
                  companies.map((company) => (
                    <tr key={company.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                            <Building2 className="w-4 h-4 text-gray-600" />
                          </div>
                          <div>
                            <span className="font-medium">{company.name}</span>
                            <p className="text-sm text-gray-500">
                              {company.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">{company.rut}</td>
                      <td className="py-3 px-4">{company.industry}</td>
                      <td className="py-3 px-4">
                        <Badge variant="secondary">{company.plan}</Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={company.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                          {company.isActive ? "Activa" : "Inactiva"}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <Link href={`/workspace/admin/companies/${company.id}`}>
                            <Button variant="outline" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Button variant="outline" size="sm" onClick={() => deleteCompany(company.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
