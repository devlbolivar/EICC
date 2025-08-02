# Sistema de Gestión de Cursos - Documentación Completa

## 📚 Descripción General

Se ha implementado un **sistema completo de gestión de cursos** para la plataforma de e-learning, con funcionalidades CRUD completas, control de acceso basado en permisos, y gestión de inscripciones. El sistema está diseñado para ser escalable, seguro y fácil de usar.

## 🏗️ Arquitectura del Sistema

### Estructura de Archivos

```
app/api/courses/
├── route.ts                    # API principal (GET, POST)
├── [id]/route.ts              # API por ID (GET, PUT, DELETE)
└── [id]/enroll/route.ts       # API de inscripciones (POST, GET, PUT)

hooks/
└── use-courses.ts             # Hook personalizado para operaciones

components/
└── CourseManager.tsx          # Componente de gestión de cursos
```

### Base de Datos

```sql
-- Tabla de cursos
courses (
  id, cid, name, description, category, level, status,
  estimatedDuration, visibility, targetCompanies, modules,
  createdBy, companyId, isPublic, isActive, createdAt, updatedAt
)

-- Tabla de inscripciones
enrollCourse (
  id, courseId, userId, companyId, progress, isCompleted,
  completedChapters, enrolledAt, updatedAt
)
```

## 🔐 Control de Acceso y Permisos

### Permisos Requeridos

- **`courses:read`**: Ver cursos
- **`courses:create`**: Crear cursos
- **`courses:edit`**: Editar cursos
- **`courses:delete`**: Eliminar cursos
- **`courses:enroll`**: Inscribirse en cursos
- **`courses:manage`**: Gestión completa (admin)

### Lógica de Acceso

1. **Cursos Públicos**: Visibles para todos los usuarios autenticados
2. **Cursos Privados**: Solo visibles para el creador y administradores
3. **Cursos de Empresa**: Visibles para miembros de la empresa específica
4. **Inscripciones**: Solo usuarios con permisos pueden inscribirse

## 🚀 API Endpoints

### 1. Listar Cursos

```http
GET /api/courses?page=1&limit=10&category=Programación&level=Básico&status=Publicado&search=react
```

**Parámetros de consulta:**

- `page`: Número de página (default: 1)
- `limit`: Elementos por página (default: 10)
- `category`: Filtrar por categoría
- `level`: Filtrar por nivel (Básico, Intermedio, Avanzado)
- `status`: Filtrar por estado (Borrador, Publicado, Archivado)
- `search`: Búsqueda en nombre y descripción

**Respuesta:**

```json
{
  "success": true,
  "data": {
    "courses": [...],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "totalPages": 3
    }
  }
}
```

### 2. Crear Curso

```http
POST /api/courses
Content-Type: application/json

{
  "name": "Introducción a React",
  "description": "Aprende los fundamentos de React",
  "category": "Programación",
  "level": "Básico",
  "estimatedDuration": "4 horas",
  "visibility": "Público",
  "bannerImage": "https://ejemplo.com/imagen.jpg",
  "modules": []
}
```

### 3. Obtener Curso por ID

```http
GET /api/courses/{id}
```

### 4. Actualizar Curso

```http
PUT /api/courses/{id}
Content-Type: application/json

{
  "name": "React Avanzado",
  "status": "Publicado"
}
```

### 5. Eliminar Curso

```http
DELETE /api/courses/{id}
```

### 6. Inscribirse en Curso

```http
POST /api/courses/{id}/enroll
```

### 7. Obtener Progreso

```http
GET /api/courses/{id}/enroll
```

### 8. Actualizar Progreso

```http
PUT /api/courses/{id}/enroll
Content-Type: application/json

{
  "progress": 75,
  "completedChapters": {"1": true, "2": true},
  "isCompleted": false
}
```

## 🎯 Hook Personalizado: `useCourses`

### Funcionalidades Disponibles

```typescript
const {
  // Estado
  courses,
  loading,
  error,

  // Operaciones CRUD
  fetchCourses,
  createCourse,
  updateCourse,
  deleteCourse,
  getCourse,

  // Inscripciones
  enrollInCourse,
  getEnrollment,
  updateProgress,

  // Utilidades
  clearError,
  refetch,
} = useCourses();
```

### Ejemplos de Uso

#### Listar Cursos con Filtros

```typescript
// Cargar todos los cursos
await fetchCourses();

// Cargar con filtros
await fetchCourses({
  page: 1,
  limit: 20,
  category: "Programación",
  level: "Básico",
  status: "Publicado",
  search: "react",
});
```

#### Crear un Curso

```typescript
const newCourse = await createCourse({
  name: "React Fundamentals",
  description: "Aprende React desde cero",
  category: "Programación",
  level: "Básico",
  numberOfChapters: 5,
  includeVideos: true,
  difficulty: "Básico",
  estimatedDuration: "6 horas",
  visibility: "Público",
  modules: [],
});
```

#### Actualizar un Curso

```typescript
const updatedCourse = await updateCourse(courseId, {
  name: "React Avanzado",
  status: "Publicado",
  estimatedDuration: "8 horas",
});
```

#### Inscribirse en un Curso

```typescript
const success = await enrollInCourse(courseId);
if (success) {
  console.log("¡Inscripción exitosa!");
}
```

#### Actualizar Progreso

```typescript
const success = await updateProgress(courseId, {
  progress: 50,
  completedChapters: { "1": true, "2": true },
  isCompleted: false,
});
```

## 🎨 Componente: `CourseManager`

### Características

- **Interfaz Intuitiva**: Diseño moderno y responsive
- **Gestión Completa**: Crear, editar, eliminar y ver cursos
- **Filtros Avanzados**: Búsqueda y filtrado por múltiples criterios
- **Estados Visuales**: Indicadores de carga, error y éxito
- **Validaciones**: Validación en tiempo real de formularios
- **Acciones Rápidas**: Botones para acciones comunes

### Uso del Componente

```tsx
import { CourseManager } from "@/components/CourseManager";

export default function CoursesPage() {
  return (
    <div className="container mx-auto p-6">
      <CourseManager />
    </div>
  );
}
```

## 📊 Estructura de Datos

### Curso

```typescript
interface Course {
  id: string;
  cid: string;
  name: string;
  description: string;
  category: string;
  level: "Básico" | "Intermedio" | "Avanzado";
  status: "Borrador" | "Publicado" | "Archivado";
  estimatedDuration?: string;
  visibility: "Público" | "Privado" | "Empresas específicas";
  targetCompanies?: string[];
  modules: Module[];
  createdBy: string;
  companyId?: string;
  isPublic: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### Módulo

```typescript
interface Module {
  id: string;
  title: string;
  description?: string;
  lessons: Lesson[];
  order: number;
}
```

### Lección

```typescript
interface Lesson {
  id: string;
  title: string;
  text?: string;
  video?: string;
  attachments?: Array<{
    id: string;
    name: string;
    url: string;
    type: "file" | "link" | "pdf";
  }>;
  order: number;
}
```

### Inscripción

```typescript
interface EnrollCourse {
  id: string;
  courseId: string;
  userId: string;
  companyId?: string;
  progress: number;
  isCompleted: boolean;
  completedChapters: any;
  enrolledAt: Date;
  updatedAt: Date;
}
```

## 🔒 Seguridad

### Validaciones Implementadas

1. **Autenticación**: Verificación de tokens en todas las operaciones
2. **Autorización**: Control de permisos por operación
3. **Propiedad**: Verificación de propiedad de cursos
4. **Visibilidad**: Control de acceso según configuración del curso
5. **Validación de Datos**: Validación de campos obligatorios
6. **Sanitización**: Limpieza de datos de entrada

### Medidas de Seguridad

- **Soft Delete**: Los cursos se marcan como inactivos en lugar de eliminarse
- **Auditoría**: Registro de fechas de creación y modificación
- **Validación de Permisos**: Verificación en cada endpoint
- **Control de Acceso**: Filtrado por empresa y visibilidad

## 🚀 Próximos Pasos

### Funcionalidades Pendientes

1. **Editor de Contenido**: Editor enriquecido para módulos y lecciones
2. **Gestión de Archivos**: Subida y gestión de archivos adjuntos
3. **Sistema de Certificados**: Generación automática de certificados
4. **Analytics**: Métricas de progreso y engagement
5. **Notificaciones**: Sistema de notificaciones para progreso
6. **Comentarios**: Sistema de comentarios y feedback
7. **Evaluaciones**: Sistema de quizzes y evaluaciones
8. **Gamificación**: Puntos, badges y leaderboards

### Mejoras Técnicas

1. **Caché**: Implementar caché para mejorar performance
2. **Paginación**: Optimizar paginación para grandes volúmenes
3. **Búsqueda**: Implementar búsqueda full-text
4. **Filtros Avanzados**: Más opciones de filtrado
5. **Exportación**: Exportar datos en diferentes formatos
6. **Importación**: Importar cursos desde archivos
7. **Backup**: Sistema de backup automático
8. **Monitoreo**: Logs y métricas de performance

## 📝 Notas de Implementación

### Decisiones de Diseño

1. **Soft Delete**: Se implementó soft delete para mantener integridad referencial
2. **Permisos Granulares**: Sistema de permisos detallado para control preciso
3. **Hook Personalizado**: Centralización de lógica en hook reutilizable
4. **Componente Reutilizable**: CourseManager como componente independiente
5. **API RESTful**: Endpoints siguiendo convenciones REST
6. **Validación en Cliente y Servidor**: Doble validación para seguridad

### Consideraciones de Performance

1. **Paginación**: Implementada para manejar grandes volúmenes
2. **Índices**: Índices en campos de búsqueda frecuente
3. **Lazy Loading**: Carga bajo demanda de datos
4. **Optimización de Consultas**: Consultas SQL optimizadas
5. **Caché de Estado**: Estado local en el hook

### Compatibilidad

- **Next.js 14**: Compatible con App Router
- **TypeScript**: Tipado completo
- **Tailwind CSS**: Estilos con Tailwind
- **Drizzle ORM**: ORM moderno y type-safe
- **PostgreSQL**: Base de datos robusta

## 🎉 Conclusión

El sistema de gestión de cursos está completamente implementado y listo para producción. Incluye todas las funcionalidades CRUD necesarias, control de acceso robusto, y una interfaz de usuario moderna y intuitiva.

El sistema es escalable, seguro y fácil de mantener, proporcionando una base sólida para el crecimiento futuro de la plataforma de e-learning.
