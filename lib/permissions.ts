import { Permission } from "@/app/types";

// Jerarquía de permisos
export const PERMISSION_HIERARCHY: Record<Permission, Permission[]> = {
  // Permisos de plataforma
  "platform:read": [],
  "platform:write": ["platform:read"],
  "platform:admin": ["platform:read", "platform:write"],

  // Permisos de empresa
  "company:read": [],
  "company:write": ["company:read"],
  "company:admin": ["company:read", "company:write"],
  "company:billing": ["company:read"],

  // Permisos de usuarios
  "users:read": [],
  "users:write": ["users:read"],
  "users:invite": ["users:read"],
  "users:remove": ["users:read"],
  "users:manage": ["users:read", "users:write", "users:invite", "users:remove"],

  // Permisos de cursos
  "courses:read": [],
  "courses:write": ["courses:read"],
  "courses:create": ["courses:read"],
  "courses:delete": ["courses:read"],
  "courses:publish": ["courses:read", "courses:write"],
  "courses:enroll": ["courses:read"],
  "courses:edit": ["courses:read", "courses:write"],
  "courses:view": ["courses:read"],

  // Permisos de contenido
  "content:read": [],
  "content:write": ["content:read"],
  "content:create": ["content:read"],
  "content:delete": ["content:read"],
};

// Función para verificar permisos con jerarquía
export function hasPermissionHierarchical(
  userPermissions: Permission[],
  requiredPermission: Permission
): boolean {
  // Verificar si tiene el permiso directamente
  if (userPermissions.includes(requiredPermission)) {
    return true;
  }

  // Verificar si tiene un permiso superior que incluya el requerido
  for (const permission of userPermissions) {
    const hierarchy = PERMISSION_HIERARCHY[permission];
    if (hierarchy && hierarchy.includes(requiredPermission)) {
      return true;
    }
  }

  return false;
}

// Función para verificar un permiso específico (sin jerarquía)
export function hasPermission(
  userPermissions: Permission[],
  requiredPermission: Permission
): boolean {
  return userPermissions.includes(requiredPermission);
}

// Función para verificar si tiene al menos uno de los permisos dados
export function hasAnyPermission(
  userPermissions: Permission[],
  requiredPermissions: Permission[]
): boolean {
  return requiredPermissions.some((permission) =>
    userPermissions.includes(permission)
  );
}

// Función para obtener el rol más restrictivo
export function getMostRestrictiveRole(
  permissions: Permission[]
): string | null {
  // Verificar permisos de admin primero (más restrictivo)
  if (permissions.includes("platform:admin")) {
    return "admin";
  }

  // Verificar permisos de company
  if (
    permissions.includes("company:admin") ||
    permissions.includes("company:write")
  ) {
    return "company";
  }

  // Verificar permisos de student
  if (
    permissions.includes("courses:enroll") ||
    permissions.includes("courses:read") ||
    permissions.includes("content:read")
  ) {
    return "student";
  }

  // Si no tiene permisos específicos, verificar permisos generales
  if (
    permissions.includes("platform:read") ||
    permissions.includes("platform:write")
  ) {
    return "admin";
  }

  // Por defecto, asignar rol de student si tiene cualquier permiso
  if (permissions.length > 0) {
    return "student";
  }

  // Solo devolver null si realmente no tiene ningún permiso
  return null;
}

// Función para validar acceso a rutas específicas
export function validateRouteAccess(
  userPermissions: Permission[],
  route: string
): boolean {
  const routePermissions: Record<string, Permission[]> = {
    "/workspace/admin": ["platform:admin"],
    "/workspace/company": ["company:admin"],
    "/workspace/company/dashboard": ["company:admin"],
    "/workspace/student": ["courses:read", "courses:enroll", "content:read"],
    "/workspace/my-learning": ["courses:enroll"],
    "/api/admin": ["platform:admin"],
    "/api/company": ["company:admin"],
    "/course": ["courses:read"],
  };

  // Verificar si la ruta coincide exactamente con una ruta definida
  const requiredPermissions = routePermissions[route];
  if (requiredPermissions) {
    const hasRequiredPermissions = requiredPermissions.some((permission) =>
      hasPermissionHierarchical(userPermissions, permission)
    );

    // Para rutas específicas de rol, verificar que NO tenga permisos de otros roles
    if (route === "/workspace/admin") {
      // Para admin, verificar que tenga permisos de admin y NO tenga permisos de company
      const hasCompanyPermissions = userPermissions.some(
        (permission) =>
          permission === "company:admin" ||
          permission === "company:write" ||
          permission === "company:read" ||
          permission === "company:billing"
      );
      return hasRequiredPermissions && !hasCompanyPermissions;
    }

    if (
      route === "/workspace/company" ||
      route === "/workspace/company/dashboard"
    ) {
      // Para company, verificar que tenga permisos de company y NO tenga permisos de admin
      const hasAdminPermissions = userPermissions.some(
        (permission) =>
          permission === "platform:admin" ||
          permission === "platform:write" ||
          permission === "platform:read"
      );
      return hasRequiredPermissions && !hasAdminPermissions;
    }

    if (route === "/workspace/student") {
      // Para student, verificar que tenga permisos de student y NO tenga permisos de admin o company
      const hasAdminPermissions = userPermissions.some(
        (permission) =>
          permission === "platform:admin" ||
          permission === "platform:write" ||
          permission === "platform:read"
      );
      const hasCompanyPermissions = userPermissions.some(
        (permission) =>
          permission === "company:admin" ||
          permission === "company:write" ||
          permission === "company:read" ||
          permission === "company:billing"
      );
      return (
        hasRequiredPermissions && !hasAdminPermissions && !hasCompanyPermissions
      );
    }

    return hasRequiredPermissions;
  }

  // Verificar si la ruta empieza con algún prefijo definido
  for (const [routePrefix, permissions] of Object.entries(routePermissions)) {
    if (route.startsWith(routePrefix)) {
      const hasRequiredPermissions = permissions.some((permission) =>
        hasPermissionHierarchical(userPermissions, permission)
      );

      // Aplicar la misma lógica restrictiva para subrutas
      if (routePrefix === "/workspace/admin") {
        const hasCompanyPermissions = userPermissions.some(
          (permission) =>
            permission === "company:admin" ||
            permission === "company:write" ||
            permission === "company:read" ||
            permission === "company:billing"
        );
        return hasRequiredPermissions && !hasCompanyPermissions;
      }

      if (routePrefix === "/workspace/company") {
        const hasAdminPermissions = userPermissions.some(
          (permission) =>
            permission === "platform:admin" ||
            permission === "platform:write" ||
            permission === "platform:read"
        );
        return hasRequiredPermissions && !hasAdminPermissions;
      }

      if (routePrefix === "/workspace/student") {
        const hasAdminPermissions = userPermissions.some(
          (permission) =>
            permission === "platform:admin" ||
            permission === "platform:write" ||
            permission === "platform:read"
        );
        const hasCompanyPermissions = userPermissions.some(
          (permission) =>
            permission === "company:admin" ||
            permission === "company:write" ||
            permission === "company:read" ||
            permission === "company:billing"
        );
        return (
          hasRequiredPermissions &&
          !hasAdminPermissions &&
          !hasCompanyPermissions
        );
      }

      return hasRequiredPermissions;
    }
  }

  // Si no hay coincidencias, permitir acceso (ruta no requiere permisos específicos)
  return true;
}

// Función para verificar si un usuario tiene acceso a una funcionalidad específica
export function hasFeatureAccess(
  userPermissions: Permission[],
  feature: string
): boolean {
  const featurePermissions: Record<string, Permission[]> = {
    "admin-dashboard": ["platform:admin"],
    "company-dashboard": ["company:admin"],
    "user-management": ["users:manage", "users:read"],
    "course-creation": ["courses:create"],
    "course-publishing": ["courses:edit"],
    "billing-management": ["company:admin"],
    "platform-analytics": ["platform:admin"],
  };

  const requiredPermissions = featurePermissions[feature];
  if (!requiredPermissions) {
    return true; // Funcionalidad no requiere permisos específicos
  }

  return requiredPermissions.some((permission) =>
    hasPermissionHierarchical(userPermissions, permission)
  );
}

// Función para obtener todos los permisos que un usuario tiene (incluyendo jerarquía)
export function getAllUserPermissions(
  userPermissions: Permission[]
): Permission[] {
  const allPermissions = new Set<Permission>(userPermissions);

  // Agregar permisos de la jerarquía
  for (const permission of userPermissions) {
    const hierarchy = PERMISSION_HIERARCHY[permission];
    if (hierarchy) {
      hierarchy.forEach((hierarchicalPermission) =>
        allPermissions.add(hierarchicalPermission)
      );
    }
  }

  return Array.from(allPermissions);
}

// Función para verificar si un usuario puede realizar una acción específica
export function canPerformAction(
  userPermissions: Permission[],
  action: string
): boolean {
  const actionPermissions: Record<string, Permission[]> = {
    // Acciones de usuarios
    "create-user": ["users:manage", "users:write"],
    "edit-user": ["users:manage", "users:write"],
    "delete-user": ["users:manage", "users:remove"],
    "invite-user": ["users:manage", "users:invite"],

    // Acciones de cursos
    "create-course": ["courses:create"],
    "edit-course": ["courses:edit"],
    "delete-course": ["courses:delete"],
    "publish-course": ["courses:edit"],
    "enroll-course": ["courses:enroll"],
    "view-course": ["courses:read"],

    // Acciones de empresa
    "manage-company": ["company:admin"],
    "view-billing": ["company:admin"],
    "manage-billing": ["company:admin"],

    // Acciones de plataforma
    "manage-platform": ["platform:admin"],
    "view-analytics": ["platform:admin"],
  };

  const requiredPermissions = actionPermissions[action];
  if (!requiredPermissions) {
    return true; // Acción no requiere permisos específicos
  }

  return requiredPermissions.some((permission) =>
    hasPermissionHierarchical(userPermissions, permission)
  );
}
