/**
 * @fileoverview Tipos centralizados del sistema EICC.
 *
 * ## Guía de Tipos de Usuario
 *
 * ### Cuándo usar cada tipo:
 *
 * | Tipo | Cuándo usar | Ejemplo |
 * |------|-------------|---------|
 * | `UserBasicInfo` | Campos base garantizados (id, email, name) | Props de componentes |
 * | `UserJoinedData` | JOINs donde hay FK NOT NULL (user_id, user_name, user_email) | Certificados, Inscripciones |
 * | `UserDerivedOptional` | LEFT JOINs opcionales | Relaciones donde puede no haber usuario |
 * | `UserPublicInfo` | Info pública sin datos sensibles | Perfiles públicos |
 *
 * ### Reglas para campos opcionales:
 *
 * 1. **SIEMPRE presentes** cuando hay FK NOT NULL:
 *    - `userId` en certificates → `user_name`, `user_email` NO son opcionales
 *    - `courseId` en enrollments → `course_name` NO es opcional
 *
 * 2. **OPCIONALES** cuando la FK puede ser NULL:
 *    - `companyId` en certificates → `company_name` ES opcional
 *
 * @example
 * // Correcto: user_name siempre presente en certificados
 * const cert: CertificateResponse = await getCertificate(id);
 * console.log(cert.user_name); // string, no necesita check de null
 *
 * // Incorrecto: no marcar user_name como opcional
 * interface BadCert { user_name?: string } // NO hacer esto para certificados
 */

// ===== TIPOS BASE =====
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

// ===== TIPOS DE USUARIO ESTANDARIZADOS =====

/**
 * Campos básicos de usuario que SIEMPRE están presentes.
 * Estos campos son NOT NULL en la base de datos.
 * Usar cuando el usuario es requerido (FK con cascade, etc.)
 */
export interface UserBasicInfo {
  id: string;
  email: string;
  name: string;
}

/**
 * Campos de perfil que pueden ser null/undefined.
 * Extender UserBasicInfo y agregar campos opcionales del perfil.
 */
export interface UserOptionalFields {
  phone?: string | null;
  avatar?: string | null;
  lastLoginAt?: Date | null;
  location?: string | null;
  bio?: string | null;
  age?: number | null;
}

/**
 * Usuario completo con campos básicos y opcionales.
 */
export interface UserProfile extends UserBasicInfo, UserOptionalFields {}

/**
 * Datos de usuario derivados de JOINs cuando el usuario está GARANTIZADO.
 * Usar cuando hay FK NOT NULL que garantiza la existencia del usuario.
 *
 * @example
 * // Certificados siempre tienen un usuario (FK NOT NULL)
 * interface CertificateWithUser extends Certificate, UserJoinedData {}
 */
export interface UserJoinedData {
  user_id: string;
  user_name: string;
  user_email: string;
}

/**
 * Datos de usuario derivados de LEFT JOINs donde el usuario es OPCIONAL.
 * Usar solo cuando realmente puede no haber usuario asociado.
 *
 * @example
 * // Relaciones opcionales donde el usuario podría no existir
 * interface RecordWithOptionalUser extends BaseRecord, UserDerivedOptional {}
 */
export interface UserDerivedOptional {
  user_id?: string;
  user_name?: string;
  user_email?: string;
}

/**
 * Información pública de usuario (para compartir externamente).
 * Excluye datos sensibles como email completo.
 */
export interface UserPublicInfo {
  id: string;
  name: string;
  avatar?: string | null;
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

/**
 * Usuario completo del sistema.
 * Extiende UserBasicInfo para garantizar campos base.
 */
export interface User extends BaseEntity, UserBasicInfo {
  passwordHash?: string;
  emailVerified: boolean;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  avatar?: string | null;
  isActive: boolean;
  lastLoginAt?: Date | null;
  phone?: string | null;
  location?: string | null;
  bio?: string | null;
  age?: number | null;
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
  subscriptionPlan: "free" | "starter" | "pro";
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

// ===== EMPLEADOS DE EMPRESA =====
/**
 * Resultado del SELECT de la base de datos para empleados
 */
export interface DatabaseEmployee {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  avatar: string | null;
  isActive: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
  joinedAt: Date | null;
  acceptedAt: Date | null;
  roleName: string;
  roleDescription: string | null;
  coursesCompleted: number;
  certificatesCount: number;
}

/**
 * Estado del empleado en la empresa
 */
export type EmployeeStatus = "active" | "inactive";

/**
 * Empleado formateado para respuesta de API
 */
export interface CompanyEmployee {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  status: EmployeeStatus;
  joinedAt: string;
  coursesCompleted: number;
  certificates: number;
  avatar: string;
  lastLoginAt: Date | null;
}

/**
 * Estadísticas de empleados de la empresa
 */
export interface CompanyEmployeeStats {
  totalEmployees: number;
  activeEmployees: number;
  totalCoursesCompleted: number;
  totalCertificates: number;
}

/**
 * Respuesta completa del endpoint de empleados
 */
export interface CompanyEmployeesResponse {
  success: boolean;
  data: {
    employees: CompanyEmployee[];
    stats: CompanyEmployeeStats;
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

/**
 * Transforma un empleado de la base de datos al formato de respuesta
 */
export function transformToCompanyEmployee(employee: DatabaseEmployee): CompanyEmployee {
  return {
    id: employee.id,
    name: employee.name,
    email: employee.email,
    phone: employee.phone || "",
    role: employee.roleName,
    status: employee.isActive ? "active" : "inactive",
    joinedAt: employee.joinedAt?.toISOString().split("T")[0] || "",
    coursesCompleted: employee.coursesCompleted,
    certificates: employee.certificatesCount,
    avatar:
      employee.avatar ||
      employee.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase(),
    lastLoginAt: employee.lastLoginAt,
  };
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

/**
 * Certificado base sin campos derivados de JOINs.
 * Representa la entidad como está en la base de datos.
 */
export interface CertificateBase extends BaseEntity {
  certificateId: string;
  courseId: string;
  userId: string;
  companyId?: string;
  title: string;
  description?: string;
  /** Calificación obtenida (0-100) */
  grade: number;
  issuedDate: Date;
  completedDate: Date;
  /** Duración del curso */
  duration?: string;
  /** URL del certificado PDF generado */
  certificateUrl?: string;
  isActive: boolean;
}

/**
 * Campos derivados del curso en JOINs.
 * Estos campos siempre están presentes cuando se hace JOIN con courses
 * ya que courseId es FK NOT NULL.
 */
export interface CourseJoinedData {
  course_name: string;
  course_description?: string;
  course_category: string;
  course_level: string;
  course_duration?: string;
  course_banner?: string;
}

/**
 * Campos derivados de la empresa en JOINs.
 * Opcionales porque companyId puede ser NULL.
 */
export interface CompanyJoinedData {
  company_name?: string;
}

/**
 * Certificado con relaciones opcionales (para Drizzle ORM).
 */
export interface Certificate extends CertificateBase {
  // Relaciones ORM
  course?: Course;
  user?: User;
  company?: Company;
}

/**
 * Respuesta de API de certificado con datos de usuario GARANTIZADOS.
 * Usar para endpoints que hacen JOIN con usuarios (userId es FK NOT NULL).
 *
 * @example
 * // GET /api/certificates siempre devuelve user_name y user_email
 * const certs: CertificateResponse[] = await fetchCertificates();
 */
export interface CertificateResponse extends CertificateBase, UserJoinedData, CourseJoinedData, CompanyJoinedData {}

/**
 * @deprecated Usar CertificateResponse para respuestas de API
 * Certificado con campos adicionales (mantener para compatibilidad).
 */
export interface CertificateWithJoins extends CertificateBase {
  // Campos de usuario - SIEMPRE presentes (FK NOT NULL)
  user_name: string;
  user_email: string;

  // Campos de curso - SIEMPRE presentes (FK NOT NULL)
  course_name: string;
  course_description?: string;
  course_category: string;
  course_level: string;
  course_duration?: string;
  course_banner?: string;

  // Campos de empresa - OPCIONALES (companyId puede ser NULL)
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

// ===== TIPO INTERMEDIO PARA CONSULTA DE BASE DE DATOS =====
/**
 * Representa el resultado directo de la consulta a la base de datos
 * antes de la transformación de nombres de campos.
 *
 * Este tipo documenta los nombres originales de las columnas en la BD:
 * - coursesTable.name → Se transforma a 'title'
 * - coursesTable.numberOfChapters → Se transforma a 'totalChapters'
 * - coursesTable.estimatedDuration → Se transforma a 'estimatedTime'
 * - enrollCourseTable.updatedAt → Se transforma a 'lastAccessed'
 * - coursesTable.bannerImage → Se transforma a 'image'
 */
export interface DatabaseEnrolledCourse {
  /** ID único del curso */
  id: string;
  /** Nombre del curso en la BD (se transforma a 'title') */
  name: string;
  /** Descripción del curso */
  description: string;
  /** Porcentaje de progreso del estudiante (0-100) */
  progress: number;
  /** Número total de capítulos del curso (se transforma a 'totalChapters') */
  numberOfChapters: number;
  /** Mapa de capítulos completados: { chapterId: true/false } */
  completedChapters: Record<string, boolean>;
  /** Indica si el curso fue completado al 100% */
  isCompleted: boolean;
  /** Fecha de finalización del curso (si aplica) */
  completedAt: Date | null;
  /** Duración estimada del curso (se transforma a 'estimatedTime') */
  estimatedDuration: string | null;
  /** Última vez que el estudiante accedió al curso (se transforma a 'lastAccessed') */
  updatedAt: Date;
  /** URL de la imagen del banner del curso (se transforma a 'image') */
  bannerImage: string | null;
  /** Categoría del curso */
  category: string;
  /** Nivel de dificultad del curso */
  level: string;
  /** ID del certificado si el curso fue completado */
  certificateId: string | null;
}

// ===== RESPUESTA DE CURSOS INSCRITOS (API) =====
/**
 * Representa la respuesta transformada del endpoint de cursos inscritos.
 * Los campos han sido renombrados desde sus nombres originales en la BD
 * para mayor claridad en el frontend.
 */
export interface EnrolledCourseResponse {
  /** ID único del curso */
  id: string;
  /** Título del curso (originalmente 'name' en coursesTable) */
  title: string;
  /** Descripción del curso */
  description: string;
  /** Porcentaje de progreso del estudiante (0-100) */
  progress: number;
  /** Número total de capítulos (originalmente 'numberOfChapters' en coursesTable) */
  totalChapters: number;
  /** Mapa de capítulos completados: { chapterId: true/false } */
  completedChapters: Record<string, boolean>;
  /** Indica si el curso fue completado al 100% */
  isCompleted: boolean;
  /** Fecha de finalización del curso (ISO string) */
  completedAt?: string | null;
  /** Duración estimada (originalmente 'estimatedDuration' en coursesTable) */
  estimatedTime: string | null;
  /** Último acceso al curso (originalmente 'updatedAt' en enrollCourseTable) */
  lastAccessed: string;
  /** URL de imagen del banner (originalmente 'bannerImage' en coursesTable) */
  image: string | null;
  /** Categoría del curso */
  category: string;
  /** Nivel de dificultad del curso */
  level: string;
  /** ID del certificado si el curso está completado */
  certificateId?: string | null;
}

// ===== FUNCIÓN DE TRANSFORMACIÓN =====
/**
 * Transforma un registro de curso inscrito desde el formato de base de datos
 * al formato de respuesta de la API.
 *
 * Transformaciones de campos:
 * - name → title
 * - numberOfChapters → totalChapters
 * - estimatedDuration → estimatedTime
 * - updatedAt → lastAccessed (convertido a ISO string)
 * - bannerImage → image
 * - completedAt → convertido a ISO string
 *
 * @param dbCourse - Registro del curso en formato de base de datos
 * @returns Curso transformado en formato de respuesta API
 *
 * @example
 * ```typescript
 * const dbCourse = await db.select(...).from(enrollCourseTable);
 * const response = transformToEnrolledCourse(dbCourse);
 * return NextResponse.json({ data: response });
 * ```
 */
export function transformToEnrolledCourse(
  dbCourse: DatabaseEnrolledCourse
): EnrolledCourseResponse {
  return {
    id: dbCourse.id,
    title: dbCourse.name,
    description: dbCourse.description,
    progress: dbCourse.progress,
    totalChapters: dbCourse.numberOfChapters,
    completedChapters: dbCourse.completedChapters,
    isCompleted: dbCourse.isCompleted,
    completedAt: dbCourse.completedAt?.toISOString() ?? null,
    estimatedTime: dbCourse.estimatedDuration,
    lastAccessed: dbCourse.updatedAt.toISOString(),
    image: dbCourse.bannerImage,
    category: dbCourse.category,
    level: dbCourse.level,
    certificateId: dbCourse.certificateId,
  };
}

/**
 * Transforma un array de registros de cursos inscritos desde el formato
 * de base de datos al formato de respuesta de la API.
 *
 * @param dbCourses - Array de registros de cursos en formato de base de datos
 * @returns Array de cursos transformados en formato de respuesta API
 */
export function transformToEnrolledCourses(
  dbCourses: DatabaseEnrolledCourse[]
): EnrolledCourseResponse[] {
  return dbCourses.map(transformToEnrolledCourse);
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

// ===== PAGINACIÓN =====
export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage?: boolean;
  hasPrevPage?: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationInfo;
}

// ===== TIPOS PARA PROGRESO DE CURSOS =====
export interface ProgressUpdateData {
  completedChapters?: Record<string, boolean>;
  progress?: number;
  isCompleted?: boolean;
}

export interface ProgressUpdateResult {
  success: boolean;
  certificateGenerated?: boolean;
  enrollment?: EnrollCourse;
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

// ===== TIPOS DE SOPORTE =====
export type TicketCategory = "technical" | "billing" | "general" | "feature_request";
export type TicketPriority = "low" | "medium" | "high" | "urgent";
export type TicketStatus = "open" | "in_progress" | "resolved" | "closed";

export interface SupportTicket {
  id: string;
  userId: string;
  companyId?: string;
  subject: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  attachments: string[];
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  assignedTo?: string;

  // Campos relacionados (del JOIN)
  user_name?: string;
  user_email?: string;
  company_name?: string;
  assigned_to_name?: string;
  messagesCount?: number;
  lastMessageAt?: string;
}

export interface SupportMessage {
  id: string;
  ticketId: string;
  userId: string;
  message: string;
  isStaffReply: boolean;
  attachments: string[];
  createdAt: string;

  // Campos relacionados
  user_name?: string;
  user_avatar?: string;
}

export interface CreateTicketRequest {
  subject: string;
  description: string;
  category: TicketCategory;
  priority?: TicketPriority;
  attachments?: string[];
}

export interface CreateMessageRequest {
  ticketId: string;
  message: string;
  attachments?: string[];
}

export interface TicketWithMessages {
  ticket: SupportTicket;
  messages: SupportMessage[];
}

export interface SupportTicketsResponse {
  success: boolean;
  tickets: SupportTicket[];
}
