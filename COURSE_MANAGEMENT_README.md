# Sistema de Gestión de Cursos - E-Learning Platform

## Descripción General

Se ha implementado un sistema completo de gestión de cursos para la plataforma de e-learning, con funcionalidades avanzadas de creación, edición y administración de cursos. El sistema está diseñado exclusivamente para usuarios con rol de administrador.

## Características Principales

### 🔐 Control de Acceso y Permisos

- **Acceso Restringido**: Solo usuarios con rol `admin` pueden acceder a la funcionalidad
- **Protección de Rutas**: Todas las rutas de gestión de cursos están protegidas
- **Componente Guard**: `CourseAdminGuard` asegura que solo administradores puedan ver las páginas
- **Redirección Automática**: Usuarios no autorizados son redirigidos automáticamente

### 📚 Estructura de Cursos

#### Información Básica del Curso

- **Título**: Nombre del curso (obligatorio)
- **Descripción**: Descripción detallada del contenido (obligatorio)
- **Categoría**: Clasificación del curso (Programación, Diseño, Marketing, etc.)
- **Nivel**: Básico, Intermedio, Avanzado
- **Estado**: Borrador, Publicado, Archivado
- **Duración Estimada**: Tiempo aproximado de completado
- **Imagen de Portada**: URL de la imagen (opcional)

#### Estructura Modular

- **Módulos**: Organización del contenido en secciones

  - Título del módulo (obligatorio)
  - Descripción (opcional)
  - Orden de presentación

- **Lecciones**: Contenido específico dentro de cada módulo
  - Título de la lección (obligatorio)
  - Contenido de texto (opcional, editor enriquecido)
  - URL de video (opcional, YouTube, Vimeo, etc.)
  - Adjuntos (opcional, archivos, links, PDFs)
  - Orden de presentación

#### Configuración de Visibilidad

- **Público**: Visible para todos los usuarios de la plataforma
- **Privado**: Solo visible para el creador y administradores
- **Empresas Específicas**: Visible solo para empresas seleccionadas

## 🎯 Flujo de Creación de Cursos

### Wizard de 4 Pasos

#### Paso 1: Información Básica

- Formulario con validaciones en tiempo real
- Campos obligatorios marcados claramente
- Selección de categoría y nivel
- Configuración de estado y duración

#### Paso 2: Módulos y Lecciones

- **Gestión Dinámica**: Agregar/quitar módulos y lecciones
- **Edición Inline**: Editar contenido directamente en la interfaz
- **Validaciones**: Cada lección debe tener al menos texto o video
- **Organización**: Arrastrar y soltar para reordenar (futuro)

#### Paso 3: Configuración de Visibilidad

- Selección del tipo de visibilidad
- Lista de empresas disponibles (para visibilidad específica)
- Información clara sobre cada opción

#### Paso 4: Revisión y Guardado

- **Resumen Completo**: Revisión de toda la información
- **Validaciones Finales**: Verificación de que el curso es válido
- **Opciones de Guardado**:
  - Guardar como borrador
  - Publicar inmediatamente

## 🛠️ Componentes Implementados

### Componentes Principales

- `CourseWizard`: Componente principal del wizard
- `CourseBasicInfo`: Paso 1 - Información básica
- `CourseModules`: Paso 2 - Gestión de módulos y lecciones
- `CourseVisibility`: Paso 3 - Configuración de visibilidad
- `CourseReview`: Paso 4 - Revisión y guardado
- `CourseAdminGuard`: Protección de acceso

### Características de los Componentes

- **Responsive Design**: Adaptable a diferentes tamaños de pantalla
- **Validaciones en Tiempo Real**: Feedback inmediato al usuario
- **Interfaz Intuitiva**: Navegación clara entre pasos
- **Estados de Carga**: Indicadores de progreso y guardado
- **Manejo de Errores**: Mensajes claros de error y éxito

## 📊 Página de Gestión de Cursos

### Dashboard de Administración

- **Estadísticas**: Total de cursos, publicados, borradores, lecciones
- **Filtros Avanzados**: Búsqueda y filtrado por categoría, estado, etc.
- **Tabla Detallada**: Información completa de cada curso
- **Acciones Rápidas**: Ver, editar, eliminar cursos

### Información Mostrada

- Nombre y descripción del curso
- Categoría y nivel
- Estado actual (Publicado/Borrador/Archivado)
- Estructura de contenido (módulos y lecciones)
- Configuración de visibilidad
- Fecha de creación
- Validación de lecciones

## 🗄️ Modelo de Datos

### Esquema de Base de Datos

```sql
-- Tabla courses actualizada con nuevos campos
ALTER TABLE courses ADD COLUMN level VARCHAR(50) DEFAULT 'Básico';
ALTER TABLE courses ADD COLUMN status VARCHAR(50) DEFAULT 'Borrador';
ALTER TABLE courses ADD COLUMN estimated_duration VARCHAR(100);
ALTER TABLE courses ADD COLUMN visibility VARCHAR(50) DEFAULT 'Público';
ALTER TABLE courses ADD COLUMN target_companies JSON DEFAULT '[]';
ALTER TABLE courses ADD COLUMN modules JSON DEFAULT '[]';
```

### Tipos TypeScript

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

interface Module {
  id: string;
  title: string;
  description?: string;
  lessons: Lesson[];
  order: number;
}
```

## 🔒 Validaciones Implementadas

### Validaciones de Formulario

- **Campos Obligatorios**: Nombre, descripción, categoría, duración
- **Estructura Mínima**: Al menos un módulo con una lección válida
- **Contenido de Lecciones**: Cada lección debe tener título y contenido (texto o video)
- **Configuración de Visibilidad**: Empresas seleccionadas cuando corresponde

### Validaciones de Negocio

- **Permisos de Usuario**: Solo administradores pueden crear/editar
- **Estado del Curso**: Validación de transiciones de estado
- **Integridad de Datos**: Verificación de estructura de módulos y lecciones

## 🎨 Características de UX/UI

### Diseño Moderno

- **Interfaz Limpia**: Diseño minimalista y profesional
- **Colores Consistentes**: Paleta de colores coherente
- **Iconografía Clara**: Iconos descriptivos para cada acción
- **Espaciado Adecuado**: Layout bien estructurado

### Experiencia de Usuario

- **Navegación Intuitiva**: Flujo claro entre pasos
- **Feedback Visual**: Indicadores de progreso y estado
- **Mensajes Claros**: Información de éxito y error
- **Accesibilidad**: Contraste y tamaños de fuente apropiados

### Interactividad

- **Edición Dinámica**: Agregar/quitar elementos sin recargar
- **Validación en Tiempo Real**: Feedback inmediato
- **Estados de Carga**: Indicadores de progreso
- **Confirmaciones**: Diálogos de confirmación para acciones críticas

## 🚀 Funcionalidades Futuras

### Escalabilidad

- **Editor Enriquecido**: Integración con editores WYSIWYG
- **Subida de Archivos**: Sistema de gestión de archivos
- **Videos Integrados**: Reproductor de video nativo
- **Quizzes**: Sistema de evaluaciones integrado

### Mejoras de UX

- **Drag & Drop**: Reordenamiento visual de módulos y lecciones
- **Autoguardado**: Guardado automático de progreso
- **Vista Previa**: Vista previa del curso antes de publicar
- **Templates**: Plantillas predefinidas para cursos

### Analytics y Reportes

- **Métricas de Uso**: Estadísticas de visualización y completado
- **Reportes de Progreso**: Seguimiento del avance de estudiantes
- **Análisis de Contenido**: Métricas de engagement por lección

## 📝 Instrucciones de Uso

### Para Administradores

1. **Acceso**: Navegar a `/workspace/admin/courses`
2. **Crear Curso**: Hacer clic en "Crear Curso"
3. **Completar Wizard**: Seguir los 4 pasos del wizard
4. **Validar**: Revisar toda la información en el paso final
5. **Publicar**: Elegir entre guardar como borrador o publicar

### Validaciones Importantes

- Asegurar que cada lección tenga contenido válido
- Verificar la configuración de visibilidad
- Revisar que la estructura del curso sea lógica
- Confirmar que todos los campos obligatorios estén completos

## 🔧 Configuración Técnica

### Dependencias Requeridas

- React 18+
- TypeScript
- Tailwind CSS
- Lucide React (iconos)
- Next.js 14+

### Estructura de Archivos

```
app/workspace/admin/courses/
├── page.tsx                    # Lista de cursos
├── create/
│   ├── page.tsx               # Página de creación
│   └── _components/
│       ├── CourseWizard.tsx   # Wizard principal
│       ├── CourseBasicInfo.tsx # Paso 1
│       ├── CourseModules.tsx  # Paso 2
│       ├── CourseVisibility.tsx # Paso 3
│       └── CourseReview.tsx   # Paso 4
└── _components/
    └── CourseAdminGuard.tsx   # Protección de acceso
```

### Variables de Entorno

```env
# Configuración de permisos
ADMIN_ROLE_ID=admin
COURSE_CREATION_PERMISSION=courses:create
```

## 🐛 Solución de Problemas

### Problemas Comunes

1. **Error de Permisos**: Verificar que el usuario tenga rol de administrador
2. **Validaciones Fallidas**: Revisar que todos los campos obligatorios estén completos
3. **Problemas de Navegación**: Verificar que las rutas estén correctamente configuradas

### Debugging

- Revisar la consola del navegador para errores JavaScript
- Verificar los logs del servidor para errores de backend
- Comprobar que las validaciones de permisos funcionen correctamente

## 📞 Soporte

Para reportar problemas o solicitar nuevas funcionalidades:

- Crear un issue en el repositorio
- Incluir pasos detallados para reproducir el problema
- Adjuntar capturas de pantalla si es necesario
- Especificar el navegador y versión utilizados
