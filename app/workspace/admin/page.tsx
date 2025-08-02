"use client";

import { useAuth } from "@/context/AuthContext";
import { useAdminDashboard } from "@/hooks/use-admin-dashboard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertCircle,
  Users,
  Building2,
  BookOpen,
  GraduationCap,
  TrendingUp,
} from "lucide-react";
import { UI_TEXT } from "@/lib/constants";

export default function AdminDashboard() {
  const { session } = useAuth();
  const { data, loading, error, refetch } = useAdminDashboard();

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-24 mb-2" />
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-4 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {UI_TEXT.COMMON.DASHBOARD_ERROR}: {error}
            <button
              onClick={refetch}
              className="ml-2 text-sm underline hover:no-underline"
            >
              {UI_TEXT.COMMON.RETRY}
            </button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {UI_TEXT.ADMIN.TITLE}
        </h1>
        <p className="text-gray-600 mt-2">
          {UI_TEXT.ADMIN.WELCOME},{" "}
          {session?.user?.name || UI_TEXT.ADMIN.DEFAULT_ADMIN}
        </p>
      </div>

      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {UI_TEXT.ADMIN.STATISTICS.ACTIVE_USERS}
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {data?.statistics.activeUsers || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {UI_TEXT.ADMIN.STATISTICS.ACTIVE_USERS_DESCRIPTION}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {UI_TEXT.ADMIN.STATISTICS.ACTIVE_COMPANIES}
            </CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {data?.statistics.activeCompanies || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {UI_TEXT.ADMIN.STATISTICS.ACTIVE_COMPANIES_DESCRIPTION}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {UI_TEXT.ADMIN.STATISTICS.PUBLISHED_COURSES}
            </CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {data?.statistics.publishedCourses || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {UI_TEXT.ADMIN.STATISTICS.PUBLISHED_COURSES_DESCRIPTION}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {UI_TEXT.ADMIN.STATISTICS.TOTAL_ENROLLMENTS}
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {data?.statistics.totalEnrollments || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {UI_TEXT.ADMIN.STATISTICS.TOTAL_ENROLLMENTS_DESCRIPTION}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {UI_TEXT.ADMIN.STATISTICS.COMPLETED_COURSES}
            </CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              {data?.statistics.completedCourses || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {UI_TEXT.ADMIN.STATISTICS.COMPLETED_COURSES_DESCRIPTION}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Cursos más populares */}
      {data?.popularCourses && data.popularCourses.length > 0 && (
        <div className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle>{UI_TEXT.ADMIN.SECTIONS.POPULAR_COURSES}</CardTitle>
              <CardDescription>
                {UI_TEXT.ADMIN.SECTIONS.POPULAR_COURSES_DESCRIPTION}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.popularCourses.map((course) => (
                  <div
                    key={course.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <h4 className="font-medium">{course.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {course.category} • {course.level}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-blue-600">
                        {course.enrollmentCount}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {UI_TEXT.ADMIN.LABELS.ENROLLMENTS}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Empresas con más usuarios */}
      {data?.topCompanies && data.topCompanies.length > 0 && (
        <div className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle>{UI_TEXT.ADMIN.SECTIONS.TOP_COMPANIES}</CardTitle>
              <CardDescription>
                {UI_TEXT.ADMIN.SECTIONS.TOP_COMPANIES_DESCRIPTION}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.topCompanies.map((company) => (
                  <div
                    key={company.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <h4 className="font-medium">{company.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {company.industry}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600">
                        {company.userCount}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {UI_TEXT.ADMIN.LABELS.USERS}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Permisos del usuario */}
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>{UI_TEXT.ADMIN.SECTIONS.USER_PERMISSIONS}</CardTitle>
            <CardDescription>
              {UI_TEXT.ADMIN.SECTIONS.USER_PERMISSIONS_DESCRIPTION}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {session?.permissions?.map((permission) => (
                <span
                  key={permission}
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                >
                  {permission}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
