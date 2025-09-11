// ===== RUTAS DE API =====
export const API_ROUTES = {
  // Auth routes
  AUTH: {
    LOGIN: "/api/auth/login",
    REGISTER: "/api/auth/register",
    LOGOUT: "/api/auth/logout",
    REFRESH: "/api/auth/refresh",
    VALIDATE: "/api/auth/validate",
    ACCEPT_INVITE: "/api/auth/accept-invite",
    FORGOT_PASSWORD: "/api/auth/forgot-password",
    RESET_PASSWORD: "/api/auth/reset-password",
    VERIFY_EMAIL: "/api/auth/verify-email",
    SWITCH_COMPANY: "/api/auth/switch-company",
  },
  // User routes
  USER: "/api/user",
  // Company routes
  COMPANIES: "/api/companies",
  // Course routes
  COURSES: "/api/courses",
  // Admin routes
  ADMIN: "/api/admin",
  // Company API routes
  COMPANY: "/api/company",
  // Invitations
  INVITATIONS: "/api/invitations",
} as const;

// ===== RUTAS DE PÁGINAS =====
export const PAGE_ROUTES = {
  // Auth pages
  AUTH: {
    SIGN_IN: "/sign-in",
    SIGN_UP: "/sign-up",
  },
  // Workspace routes
  WORKSPACE: {
    ADMIN: "/workspace/admin",
    COMPANY: "/workspace/company",
    STUDENT: "/workspace/student",
  },
  // Admin specific routes
  ADMIN: {
    DASHBOARD: "/workspace/admin",
    USERS: "/workspace/admin/users",
    USERS_CREATE: "/workspace/admin/users",
    COMPANIES: "/workspace/admin/companies",
    COMPANIES_CREATE: "/workspace/admin/companies/create",
    COURSES: "/workspace/admin/courses",
    COURSES_CREATE: "/workspace/admin/courses/create",
    ENROLLMENTS: "/workspace/admin/enrollments",
    CERTIFICATES: "/workspace/admin/certificates",
    REPORTS: "/workspace/admin/reports",
    SETTINGS: "/workspace/admin/settings",
    SUPPORT: "/workspace/admin/support",
  },
  // Company specific routes
  COMPANY: {
    DASHBOARD: "/workspace/company/dashboard",
    PROFILE: "/workspace/company/profile",
    EMPLOYEES: "/workspace/company/employees",
    EMPLOYEES_INVITE: "/workspace/company/employees/invite",
    COURSES: "/workspace/company/courses",
    PROGRESS: "/workspace/company/progress",
    CERTIFICATES: "/workspace/company/certificates",
    BILLING: "/workspace/company/billing",
    SUPPORT: "/workspace/company/support",
  },
  // Student specific routes
  STUDENT: {
    DASHBOARD: "/workspace/student",
    COURSES: "/workspace/student/courses",
    COURSES_CONTINUE: "/workspace/student/courses/continue",
    CATALOG: "/workspace/student/catalog",
    CERTIFICATES: "/workspace/student/certificates",
    PROFILE: "/workspace/student/profile",
    SUPPORT: "/workspace/student/support",
  },
} as const;

// ===== MENSAJES DE ERROR COMUNES =====
export const ERROR_MESSAGES = {
  UNKNOWN_ERROR: "Error desconocido",
  FETCH_ERROR: "Error al obtener los datos",
  COURSES_FETCH_ERROR: "Error al obtener los cursos",
  NETWORK_ERROR: "Error de conexión",
  VALIDATION_ERROR: "Error de validación",
  UNAUTHORIZED: "No autorizado",
  FORBIDDEN: "Acceso denegado",
  NOT_FOUND: "Recurso no encontrado",
  SERVER_ERROR: "Error del servidor",
} as const;

// ===== MENSAJES DE ÉXITO COMUNES =====
export const SUCCESS_MESSAGES = {
  COURSE_CREATED: "Curso creado exitosamente",
  COURSE_UPDATED: "Curso actualizado exitosamente",
  COURSE_DELETED: "Curso eliminado exitosamente",
  USER_CREATED: "Usuario creado exitosamente",
  USER_UPDATED: "Usuario actualizado exitosamente",
  COMPANY_CREATED: "Empresa creada exitosamente",
  COMPANY_UPDATED: "Empresa actualizada exitosamente",
  LOGIN_SUCCESS: "Inicio de sesión exitoso",
  LOGOUT_SUCCESS: "Sesión cerrada exitosamente",
  REGISTER_SUCCESS: "Registro exitoso",
} as const;

// ===== TEXTO DE LA INTERFAZ DE USUARIO =====
export const UI_TEXT = {
  // Admin Dashboard
  ADMIN: {
    TITLE: "Panel de Administración",
    WELCOME: "Bienvenido",
    DEFAULT_ADMIN: "Administrador",
    STATISTICS: {
      ACTIVE_USERS: "Usuarios Activos",
      ACTIVE_COMPANIES: "Empresas Activas",
      PUBLISHED_COURSES: "Cursos Publicados",
      TOTAL_ENROLLMENTS: "Inscripciones Totales",
      COMPLETED_COURSES: "Cursos Completados",
      ACTIVE_USERS_DESCRIPTION: "Usuarios registrados en la plataforma",
      ACTIVE_COMPANIES_DESCRIPTION: "Empresas registradas en la plataforma",
      PUBLISHED_COURSES_DESCRIPTION: "Cursos disponibles para estudiantes",
      TOTAL_ENROLLMENTS_DESCRIPTION: "Total de inscripciones a cursos",
      COMPLETED_COURSES_DESCRIPTION: "Cursos finalizados por estudiantes",
    },
    SECTIONS: {
      POPULAR_COURSES: "Cursos Más Populares",
      POPULAR_COURSES_DESCRIPTION:
        "Cursos con más inscripciones en la plataforma",
      TOP_COMPANIES: "Empresas con Más Usuarios",
      TOP_COMPANIES_DESCRIPTION:
        "Empresas con mayor número de empleados registrados",
      USER_PERMISSIONS: "Permisos del Usuario",
      USER_PERMISSIONS_DESCRIPTION: "Permisos asignados a tu cuenta",
    },
    LABELS: {
      ENROLLMENTS: "inscripciones",
      USERS: "usuarios",
    },
  },
  // Student Dashboard
  STUDENT: {
    WELCOME: "Bienvenido",
    DEFAULT_STUDENT: "Estudiante",
    WELCOME_MESSAGE:
      "Bienvenido a tu panel de aprendizaje. Aquí puedes ver tu progreso y",
    COMPLETED_COURSES: "Cursos completados",
  },
  // Company Dashboard
  COMPANY: {
    WELCOME: "Bienvenido",
    DEFAULT_COMPANY_ADMIN: "Administrador de Empresa",
    TOTAL_ENROLLMENTS: "Inscripciones totales",
  },
  // Common UI
  COMMON: {
    LOADING: "Cargando...",
    ERROR: "Error",
    RETRY: "Reintentar",
    UNKNOWN_ERROR: "Error desconocido",
    DASHBOARD_ERROR: "Error al cargar los datos",
    USER_PERMISSIONS: "Permisos del Usuario",
    USER_PERMISSIONS_DESCRIPTION: "Permisos asignados a tu cuenta",
  },
  // Error Messages
  ERRORS: {
    AUTH_CONTEXT_ERROR: "useAuth debe ser usado dentro de un AuthProvider",
    AUTH_INIT_ERROR: "Error inicializando autenticación",
    AUTH_VALIDATION_ERROR: "Error validando sesión",
    REFRESH_IN_PROGRESS: "Refresh ya en progreso, esperando...",
    TOKEN_EXPIRED: "Token expirado, intentando refresh...",
    REFRESH_TOKEN_ERROR: "Error en refresh token",
    FETCH_DASHBOARD_ERROR: "Error al obtener datos del dashboard",
  },
  // Log Messages
  LOGS: {
    AUTH_INIT: "❌ AuthContext: Error inicializando autenticación:",
    AUTH_VALIDATION: "❌ AuthContext: Error validando sesión:",
    REFRESH_PROGRESS: "🔄 Refresh ya en progreso, esperando...",
    TOKEN_REFRESH: "🔄 Token expirado, intentando refresh...",
    REFRESH_ERROR: "❌ Error en refresh token:",
    FETCH_DASHBOARD: "Error fetching dashboard data:",
    MIDDLEWARE_DEBUG: "🔍 Middleware Debug:",
    MIDDLEWARE_REDIRECT: "🚫 Middleware: Usuario sin acceso a",
    MIDDLEWARE_REDIRECTING: "redirigiendo a",
  },
  // Middleware Messages
  MIDDLEWARE: {
    TOKEN_REQUIRED: "Token de acceso requerido",
    TOKEN_INVALID: "Token de acceso inválido",
    ACCOUNT_DISABLED: "account-disabled",
    UNAUTHORIZED_ACCESS: "Acceso no autorizado",
    ROLE_REDIRECT: "Redirección por rol",
    USER_DISABLED: "Usuario desactivado",
  },
} as const;

// ===== ROLES DEL SISTEMA =====
export const SYSTEM_ROLES = {
  ADMIN: "admin",
  COMPANY: "company",
  STUDENT: "student",
} as const;

// ===== PERMISOS =====
export const PERMISSIONS = {
  // Platform permissions
  PLATFORM_ADMIN: "platform:admin",
  // Company permissions
  COMPANY_ADMIN: "company:admin",
  // Course permissions
  COURSES_READ: "courses:read",
  COURSES_ENROLL: "courses:enroll",
  COURSES_CREATE: "courses:create",
  COURSES_UPDATE: "courses:update",
  COURSES_DELETE: "courses:delete",
  // Content permissions
  CONTENT_READ: "content:read",
  CONTENT_CREATE: "content:create",
  CONTENT_UPDATE: "content:update",
  CONTENT_DELETE: "content:delete",
} as const;

// ===== ESTADOS DE CURSOS =====
export const COURSE_STATUS = {
  DRAFT: "draft",
  PUBLISHED: "published",
  ARCHIVED: "archived",
} as const;

// ===== NIVELES DE CURSOS =====
export const COURSE_LEVELS = {
  BEGINNER: "Básico",
  INTERMEDIATE: "Intermedio",
  ADVANCED: "Avanzado",
} as const;

// ===== VISIBILIDAD DE CURSOS =====
export const COURSE_VISIBILITY = {
  PUBLIC: "Público",
  PRIVATE: "Privado",
  COMPANY_SPECIFIC: "Empresas específicas",
} as const;

// ===== CATEGORÍAS DE CURSOS =====
export const COURSE_CATEGORIES = [
  "Tecnología",
  "Negocios",
  "Marketing",
  "Desarrollo Personal",
  "Finanzas",
  "Salud",
  "Educación",
  "Otros",
] as const;

// ===== CONFIGURACIÓN DE PAGINACIÓN =====
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
} as const;

// ===== CONFIGURACIÓN DE ARCHIVOS =====
export const FILE_CONFIG = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ["image/jpeg", "image/png", "image/webp"],
  ALLOWED_DOCUMENT_TYPES: [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
} as const;

// ===== CONFIGURACIÓN DE TOKENS =====
export const TOKEN_CONFIG = {
  ACCESS_TOKEN_EXPIRY: "15m",
  REFRESH_TOKEN_EXPIRY: "7d",
} as const;

// ===== CONFIGURACIÓN DE VALIDACIÓN =====
export const VALIDATION = {
  MIN_PASSWORD_LENGTH: 8,
  MAX_NAME_LENGTH: 100,
  MAX_DESCRIPTION_LENGTH: 500,
  MAX_TITLE_LENGTH: 200,
} as const;

// ===== CONFIGURACIÓN DE UI =====
export const UI_CONFIG = {
  DEBOUNCE_DELAY: 300,
  TOAST_DURATION: 5000,
  LOADING_TIMEOUT: 10000,
} as const;

// ===== CONFIGURACIÓN DE BASE DE DATOS =====
export const DB_CONFIG = {
  MAX_CONNECTIONS: 10,
  CONNECTION_TIMEOUT: 30000,
} as const;
