# Estructura del Proyecto - Plataforma de Aprendizaje en Línea

```
online-learning-platform/
├── 📁 app/                          # Aplicación principal (Next.js App Router)
│   ├── 📁 _components/              # Componentes compartidos de la app
│   │   ├── AddNewCourseDialog.tsx
│   │   ├── AppHeader.tsx
│   │   ├── AppSidebar.tsx
│   │   ├── CourseCard.tsx
│   │   ├── CourseList.tsx
│   │   ├── EnrollCourseCard.tsx
│   │   ├── EnrollCourseList.tsx
│   │   └── WelcomeBanner.tsx
│   │
│   ├── 📁 (auth)/                   # Rutas de autenticación (grupo de rutas)
│   │   ├── 📁 sign-in/
│   │   │   └── 📁 [[...sign-in]]/   # Catch-all route para sign-in
│   │   │       └── page.tsx
│   │   └── 📁 sign-up/
│   │       └── 📁 [[...sign-up]]/   # Catch-all route para sign-up
│   │           └── page.tsx
│   │
│   ├── 📁 api/                      # API Routes
│   │   ├── courses/route.tsx
│   │   ├── enroll-course/route.tsx
│   │   ├── generate-course-content/route.tsx
│   │   ├── generate-course-layout/route.tsx
│   │   └── user/route.tsx
│   │
│   ├── 📁 course/                   # Páginas de cursos
│   │   ├── 📁 _components/          # Componentes específicos de cursos
│   │   │   ├── ChapterContent.tsx
│   │   │   └── ChapterListSidebar.tsx
│   │   └── 📁 [courseId]/           # Ruta dinámica para curso específico
│   │       └── page.tsx
│   │
│   ├── 📁 workspace/                # Área de trabajo principal
│   │   ├── 📁 _components/          # Componentes del workspace
│   │   │   ├── AddNewCourseDialog.tsx
│   │   │   ├── AppHeader.tsx
│   │   │   ├── AppSidebar.tsx
│   │   │   ├── CourseCard.tsx
│   │   │   ├── CourseList.tsx
│   │   │   ├── EnrollCourseCard.tsx
│   │   │   ├── EnrollCourseList.tsx
│   │   │   └── WelcomeBanner.tsx
│   │   │
│   │   ├── 📁 billing/              # Página de facturación
│   │   │   └── page.tsx
│   │   │
│   │   ├── 📁 edit-course/          # Edición de cursos
│   │   │   ├── 📁 _components/
│   │   │   │   ├── ChapterTopicList.tsx
│   │   │   │   └── CourseInfo.tsx
│   │   │   └── 📁 [courseId]/
│   │   │       └── page.tsx
│   │   │
│   │   ├── 📁 explore/              # Explorar cursos
│   │   │   └── page.tsx
│   │   │
│   │   ├── 📁 my-learning/          # Mis cursos de aprendizaje
│   │   │   └── page.tsx
│   │   │
│   │   ├── 📁 profile/              # Perfil de usuario
│   │   │   └── page.tsx
│   │   │
│   │   ├── 📁 view-course/          # Ver curso específico
│   │   │   └── 📁 [courseId]/
│   │   │       └── page.tsx
│   │   │
│   │   ├── layout.tsx               # Layout del workspace
│   │   ├── page.tsx                 # Página principal del workspace
│   │   └── provider.tsx             # Provider del workspace
│   │
│   ├── favicon.ico
│   ├── globals.css                  # Estilos globales
│   ├── layout.tsx                   # Layout principal de la app
│   ├── page.tsx                     # Página principal
│   └── 📁 types/                    # Tipos TypeScript
│       └── index.ts
│
├── 📁 components/                   # Componentes UI reutilizables
│   └── 📁 ui/                       # Componentes de interfaz
│       ├── accordion.tsx
│       ├── button.tsx
│       ├── dialog.tsx
│       ├── input.tsx
│       ├── label.tsx
│       ├── progress.tsx
│       ├── select.tsx
│       ├── separator.tsx
│       ├── sheet.tsx
│       ├── sidebar.tsx
│       ├── skeleton.tsx
│       ├── sonner.tsx
│       ├── switch.tsx
│       ├── textarea.tsx
│       └── tooltip.tsx
│
├── 📁 config/                       # Configuración del proyecto
│   ├── db.tsx                       # Configuración de base de datos
│   └── schema.ts                    # Esquema de base de datos
│
├── 📁 context/                      # Contextos de React
│   ├── SelectedChapterIndexContext.tsx
│   └── UserDetailContext.tsx
│
├── 📁 hooks/                        # Custom hooks
│   └── use-mobile.ts
│
├── 📁 lib/                          # Utilidades y librerías
│   └── utils.ts
│
├── 📁 public/                       # Archivos estáticos
│   ├── file.svg
│   ├── globe.svg
│   ├── logo-minimalista.png
│   ├── logo.png
│   ├── logo.svg
│   ├── logonew.png
│   ├── next.svg
│   ├── online-education.png
│   ├── vercel.svg
│   └── window.svg
│
├── components.json                  # Configuración de componentes
├── drizzle.config.ts                # Configuración de Drizzle ORM
├── eslint.config.mjs                # Configuración de ESLint
├── middleware.ts                    # Middleware de Next.js
├── next.config.ts                   # Configuración de Next.js
├── package.json                     # Dependencias del proyecto
├── postcss.config.mjs               # Configuración de PostCSS
├── provider.tsx                     # Provider principal
├── README.md                        # Documentación del proyecto
└── tsconfig.json                    # Configuración de TypeScript
```

## Descripción de la Estructura

### 🏗️ **Arquitectura Principal**

- **App Router**: Utiliza el nuevo sistema de rutas de Next.js 13+
- **TypeScript**: Proyecto completamente tipado
- **Drizzle ORM**: Para manejo de base de datos
- **Tailwind CSS**: Para estilos

### 📁 **Carpetas Principales**

#### `app/` - Aplicación Principal

- **`_components/`**: Componentes compartidos a nivel de app
- **`(auth)/`**: Grupo de rutas para autenticación
- **`api/`**: Endpoints de la API
- **`course/`**: Páginas relacionadas con cursos
- **`workspace/`**: Área principal de trabajo del usuario

#### `components/ui/` - Sistema de Diseño

- Componentes UI reutilizables (botones, inputs, etc.)
- Basado en shadcn/ui

#### `config/` - Configuración

- Configuración de base de datos y esquemas
- Configuraciones del proyecto

#### `context/` - Estado Global

- Contextos de React para estado compartido
- Manejo de capítulos seleccionados y detalles de usuario

### 🔄 **Flujo de Datos**

1. **Autenticación** → `(auth)/`
2. **Workspace Principal** → `workspace/`
3. **Gestión de Cursos** → `edit-course/` y `view-course/`
4. **API** → `api/` para operaciones CRUD

### 🎯 **Características Destacadas**

- **Rutas Dinámicas**: `[courseId]` para cursos específicos
- **Catch-all Routes**: `[[...sign-in]]` para autenticación
- **Layouts Anidados**: Múltiples niveles de layout
- **Componentes Modulares**: Separación clara de responsabilidades
