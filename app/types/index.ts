// ===== TIPOS BASE =====
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

// ===== AUTENTICACIÓN Y TOKENS =====
export interface JWTPayload {
  userId: string;
  email: string;
  name: string;
  organizationId?: string;
  companyId?: string;
  roleId?: string;
  permissions: Permission[];
  type: "access" | "refresh";
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

// ===== USUARIOS Y AUTENTICACIÓN =====
export interface User extends BaseEntity {
  email: string;
  name: string;
  passwordHash?: string;
  emailVerified: boolean;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  avatar?: string;
  isActive: boolean;
  lastLoginAt?: Date;
}

export interface UserRegistrationData {
  email: string;
  name: string;
  password: string;
  confirmPassword: string;
}

export interface UserLoginData {
  email: string;
  password: string;
}

export interface PasswordResetData {
  email: string;
}

export interface PasswordResetConfirmData {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

// ===== EMPRESAS/COMPAÑÍAS =====
export interface Company extends BaseEntity {
  name: string;
  rut: string; // RUT chileno
  description?: string;
  logo?: string;
  website?: string;
  industry?: string;
  size?: "small" | "medium" | "large";
  isActive: boolean;
  subscriptionPlan: "free" | "basic" | "premium";
  subscriptionExpiresAt?: Date;
}

export interface CompanyCreateData {
  name: string;
  rut: string;
  description?: string;
  website?: string;
  industry?: string;
  size?: "small" | "medium" | "large";
}

// ===== ROLES Y PERMISOS =====
export interface Role extends BaseEntity {
  name: string;
  description?: string;
  permissions: Permission[];
  isSystemRole: boolean;
}

export type Permission =
  // Permisos globales
  | "platform:read"
  | "platform:write"
  | "platform:admin"

  // Permisos de empresa
  | "company:read"
  | "company:write"
  | "company:admin"
  | "company:billing"

  // Permisos de usuarios
  | "users:read"
  | "users:write"
  | "users:invite"
  | "users:remove"
  | "users:manage"

  // Permisos de cursos
  | "courses:read"
  | "courses:write"
  | "courses:create"
  | "courses:delete"
  | "courses:publish"
  | "courses:enroll"
  | "courses:edit"
  | "courses:view"
  | "courses:manage"

  // Permisos de contenido
  | "content:read"
  | "content:write"
  | "content:create"
  | "content:delete";

export const SYSTEM_ROLES = {
  ADMIN: "admin",
  COMPANY: "company",
  STUDENT: "student",
} as const;

export const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  [SYSTEM_ROLES.ADMIN]: [
    "platform:admin",
    "courses:read",
    "courses:create",
    "courses:edit",
    "courses:delete",
    "users:manage",
  ],
  [SYSTEM_ROLES.COMPANY]: [
    "company:admin",
    "courses:read",
    "courses:create",
    "courses:edit",
    "users:invite",
  ],
  [SYSTEM_ROLES.STUDENT]: ["courses:read", "courses:enroll", "content:read"],
};

// ===== USUARIOS EN EMPRESAS =====
export interface UserCompany extends BaseEntity {
  userId: string;
  companyId: string;
  roleId: string;
  isActive: boolean;
  joinedAt: Date;
  invitedBy?: string;
  acceptedAt?: Date;

  // Relaciones
  user?: User;
  company?: Company;
  role?: Role;
  invitedByUser?: User;
}

// ===== TOKENS DE INVITACIÓN =====
export interface InvitationToken extends BaseEntity {
  email: string;
  companyId: string;
  roleId: string;
  token: string;
  invitedBy: string;
  expiresAt: Date;
  isUsed: boolean;
  usedAt?: Date;

  // Relaciones
  company?: Company;
  role?: Role;
  invitedByUser?: User;
}

export interface InvitationCreateData {
  email: string;
  roleId: string;
  companyId: string;
}

// ===== CURSOS =====
export interface Lesson {
  id: string;
  title: string;
  text?: string; // Contenido de texto (editor enriquecido)
  video?: string; // URL de video (YouTube, Vimeo, etc.)
  attachments?: Array<{
    id: string;
    name: string;
    url: string;
    type: "file" | "link" | "pdf";
  }>;
  order: number;
}

export interface Module {
  id: string;
  title: string;
  description?: string;
  lessons: Lesson[];
  order: number;
}

export interface Course extends BaseEntity {
  cid: string;
  name: string;
  description: string;
  numberOfChapters: number;
  includeVideos: boolean;
  difficulty: string;
  category: string;
  courseJson?: {
    course: {
      name: string;
      description: string;
      numberOfChapters: number;
      chapters: Array<{
        chapterName: string;
        duration: string;
        topic: string[];
        imagePrompt: string;
      }>;
    };
  };
  bannerImage: string;
  courseContent?: Array<{
    chapterName: string;
    topic: string;
    content: string;
    youtubeVideo?: Array<{
      videoId: string;
      title: string;
      thumbnail: string;
    }>;
  }>;
  createdBy: string;
  companyId?: string;
  isPublic: boolean;
  isActive: boolean;
  // Nuevos campos
  level: "Básico" | "Intermedio" | "Avanzado";
  status: "Borrador" | "Publicado" | "Archivado";
  estimatedDuration?: string;
  visibility: "Público" | "Privado" | "Empresas específicas";
  targetCompanies?: string[];
  modules: Module[];

  // Relaciones
  creator?: User;
  company?: Company;
}

export interface CourseCreateData {
  name: string;
  description: string;
  numberOfChapters: number;
  includeVideos: boolean;
  difficulty: string;
  category: string;
  courseJson?: unknown;
  bannerImage?: string;
  courseContent?: unknown;
  isPublic?: boolean;
  companyId?: string;
  // Nuevos campos
  level?: "Básico" | "Intermedio" | "Avanzado";
  status?: "Borrador" | "Publicado" | "Archivado";
  estimatedDuration?: string;
  visibility?: "Público" | "Privado" | "Empresas específicas";
  targetCompanies?: string[];
  modules?: Module[];
}

// ===== INSCRIPCIONES A CURSOS =====
export interface EnrollCourse extends BaseEntity {
  courseId: string;
  userId: string;
  companyId?: string;
  completedChapters: string[];
  progress: number;
  isCompleted: boolean;
  completedAt?: Date;
  enrolledAt: Date;

  // Relaciones
  course?: Course;
  user?: User;
  company?: Company;
}

// ===== CERTIFICADOS =====
export interface Certificate extends BaseEntity {
  certificateId: string;
  courseId: string;
  userId: string;
  companyId?: string;
  title: string;
  description?: string;
  grade: number; // Calificación obtenida (0-100)
  issuedDate: Date;
  completedDate: Date;
  duration?: string; // Duración del curso
  certificateUrl?: string; // URL del certificado PDF
  isActive: boolean;

  // Relaciones
  course?: Course;
  user?: User;
  company?: Company;

  // Campos adicionales de la API
  course_name?: string;
  course_description?: string;
  course_category?: string;
  course_level?: string;
  course_duration?: string;
  course_banner?: string;
  user_name?: string;
  user_email?: string;
  company_name?: string;
}

export interface CertificateCreateData {
  courseId: string;
  userId: string;
  companyId?: string;
  title: string;
  description?: string;
  grade: number;
  completedDate: Date;
  duration?: string;
  certificateUrl?: string;
}

export interface CertificateUpdateData {
  title?: string;
  description?: string;
  grade?: number;
  certificateUrl?: string;
  isActive?: boolean;
}

// ===== CURSOS CON PROGRESO (para vista de estudiante) =====
export interface CourseWithProgress extends Course {
  progress: number;
  totalChapters: number;
  completedChapters: Record<string, boolean>;
  estimatedTime: string;
  lastAccessed: string;
  image: string;
}

// ===== RESPUESTA DE CURSOS INSCRITOS (API) =====
export interface EnrolledCourseResponse {
  id: string;
  title: string;
  description: string;
  progress: number;
  totalChapters: number;
  completedChapters: number;
  isCompleted: boolean;
  completedAt?: string;
  estimatedTime: string;
  lastAccessed: string;
  image: string;
  category: string;
  level: string;
  certificateId?: string | null; // ID del certificado si el curso está completado
}

// ===== AUTENTICACIÓN Y SESIÓN =====
export interface AuthSession {
  user: User;
  userCompanies: UserCompany[];
  currentCompany?: Company;
  currentRole?: Role;
  permissions: Permission[];
}

export interface AuthContextType {
  session: AuthSession | null;
  loading: boolean;
  login: (data: UserLoginData) => Promise<AuthSession>;
  register: (data: UserRegistrationData) => Promise<void>;
  logout: () => Promise<void>;
  switchCompany: (companyId: string) => Promise<void>;
  hasPermission: (permission: Permission) => boolean;
  hasAnyPermission: (permissions: Permission[]) => boolean;
  hasAllPermissions: (permissions: Permission[]) => boolean;
}

// ===== DASHBOARD TYPES =====
export interface DashboardStatistics {
  activeUsers: number;
  activeCompanies: number;
  publishedCourses: number;
  totalEnrollments: number;
  completedCourses: number;
}

export interface PopularCourse {
  id: string;
  name: string;
  description: string;
  category: string;
  level: string;
  enrollmentCount: number;
}

export interface TopCompany {
  id: string;
  name: string;
  description: string;
  industry: string;
  userCount: number;
}

export interface DashboardData {
  statistics: DashboardStatistics;
  popularCourses: PopularCourse[];
  topCompanies: TopCompany[];
}

export interface UseAdminDashboardReturn {
  data: DashboardData | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

// ===== API RESPONSES =====
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ===== FORMULARIOS Y VALIDACIÓN =====
export interface FormErrors {
  [key: string]: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: FormErrors;
}

// ===== NOTIFICACIONES Y MENSAJES =====
export interface Notification {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message: string;
  duration?: number;
}

// ===== CONFIGURACIÓN =====
export interface AppConfig {
  auth: {
    jwtSecret: string;
    jwtExpiresIn: string;
    refreshTokenExpiresIn: string;
    emailVerificationExpiresIn: string;
    passwordResetExpiresIn: string;
    invitationTokenExpiresIn: string;
  };
  email: {
    from: string;
    replyTo: string;
  };
  app: {
    name: string;
    url: string;
    supportEmail: string;
  };
}

// ===== TIPOS PARA COMPATIBILIDAD =====
export interface EnrolledCourses {
  courses: Course;
  enrollCourse: EnrollCourse;
}

// ===== INTERFACES DE COMPONENTES =====
export interface AuthProviderProps {
  children: React.ReactNode;
}

export interface AuthGuardProps {
  children: React.ReactNode;
}

export interface WorkspaceGuardProps {
  children: React.ReactNode;
}

export interface CourseAdminGuardProps {
  children: React.ReactNode;
}

export interface UserDetailContextType {
  user: { id: number; name: string; email: string } | null;
  setUser: (user: { id: number; name: string; email: string } | null) => void;
}

export interface SelectedChapterIndexContextType {
  selectedChapterIndex: number;
  setSelectedChapterIndex: (index: number) => void;
}

// ===== INTERFACES DE FORMULARIOS DE CURSOS =====
export interface CourseFormData {
  name: string;
  description: string;
  category: string;
  level: Course["level"];
  status: Course["status"];
  estimatedDuration: string;
  bannerImage?: string;
  visibility: Course["visibility"];
  targetCompanies: string[];
  modules: Module[];
}

export interface CourseBasicInfoProps {
  formData: CourseFormData;
  updateFormData: (updates: Partial<CourseFormData>) => void;
  onNext: () => void;
}

export interface CourseModulesProps {
  formData: CourseFormData;
  updateFormData: (updates: Partial<CourseFormData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

export interface CourseVisibilityProps {
  formData: CourseFormData;
  updateFormData: (updates: Partial<CourseFormData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

export interface CourseReviewProps {
  formData: CourseFormData;
  updateFormData: (updates: Partial<CourseFormData>) => void;
  onPrev: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

// ===== INTERFACES PARA COMPAÑÍAS EN FORMULARIOS =====
export interface CompanyOption {
  id: string;
  name: string;
  rut: string;
}
