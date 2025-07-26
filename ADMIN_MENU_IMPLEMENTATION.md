# Menú de Navegación para Administradores

## Descripción

Se ha implementado un menú de navegación específico para usuarios con rol 'admin' en la plataforma de aprendizaje online. El menú se integra con el sidebar existente y solo es visible para administradores.

## Componentes Implementados

### 1. AdminNavMenu (`app/workspace/_components/AdminNavMenu.tsx`)

- Componente principal del menú de administración
- Incluye todos los ítems requeridos con submenús
- Usa los componentes de UI existentes (Sidebar, SidebarMenu, etc.)
- Maneja estados activos y navegación

### 2. useAdmin Hook (`hooks/use-admin.ts`)

- Hook personalizado para verificar si el usuario es administrador
- Verifica tanto el rol como los permisos de administrador
- Proporciona acceso a la sesión del usuario

### 3. Páginas de Administración

Todas las páginas incluyen:

- Verificación de permisos de administrador
- Redirección automática si no es admin
- Interfaz consistente con el diseño actual

#### Páginas implementadas:

- **Dashboard**: `/workspace/admin/dashboard`
- **Usuarios**:
  - Lista: `/workspace/admin/users`
  - Crear: `/workspace/admin/users/create`
- **Empresas**:
  - Lista: `/workspace/admin/companies`
  - Crear: `/workspace/admin/companies/create`
- **Cursos**:
  - Lista: `/workspace/admin/courses`
  - Crear: `/workspace/admin/courses/create`
- **Matrículas**: `/workspace/admin/enrollments`
- **Certificaciones**: `/workspace/admin/certificates`
- **Reportes & Analytics**: `/workspace/admin/reports`
- **Configuraciones**: `/workspace/admin/settings`
- **Soporte**: `/workspace/admin/support`

## Estructura del Menú

### Ítems Principales

1. **Dashboard** - Panel principal de administración
2. **Usuarios** - Gestión de usuarios del sistema
   - Lista de usuarios
   - Crear usuario
3. **Empresas** - Gestión de empresas registradas
   - Lista de empresas
   - Crear empresa
4. **Cursos** - Gestión de cursos
   - Lista de cursos
   - Crear curso
5. **Matrículas** - Gestión de inscripciones
6. **Certificaciones** - Gestión de certificados
7. **Reportes & Analytics** - Análisis y estadísticas
8. **Configuraciones** - Configuración del sistema
9. **Soporte** - Gestión de tickets de soporte

## Características Técnicas

### Seguridad

- Verificación de rol 'admin' en cada página
- Redirección automática para usuarios no autorizados
- Uso del sistema de permisos existente

### UI/UX

- Diseño consistente con el resto de la aplicación
- Uso de componentes de UI existentes
- Íconos de Lucide React para mejor UX
- Estados activos para navegación
- Submenús para organizar funcionalidades relacionadas

### Escalabilidad

- Estructura modular fácil de extender
- Componentes reutilizables
- Separación clara de responsabilidades
- Fácil adición de nuevos ítems de menú

## Integración

### AppSidebar

El menú de administración se integra en el `AppSidebar` existente:

- Solo se renderiza si `isAdmin` es `true`
- Mantiene la estructura y estilo del sidebar
- No interfiere con la navegación normal

### Rutas

Todas las rutas siguen el patrón `/workspace/admin/[sección]` para mantener consistencia.

## Uso

### Para Administradores

1. Iniciar sesión con cuenta de administrador
2. El menú de administración aparecerá automáticamente en el sidebar
3. Navegar a las diferentes secciones según necesidad

### Para Desarrolladores

1. Agregar nuevos ítems al menú en `AdminNavMenu.tsx`
2. Crear páginas correspondientes en `app/workspace/admin/`
3. Implementar verificación de permisos usando `useAdmin()`

## Mantenimiento

### Agregar Nuevos Ítems

1. Editar `adminMenuItems` en `AdminNavMenu.tsx`
2. Crear la página correspondiente
3. Implementar verificación de permisos

### Modificar Permisos

1. Actualizar `useAdmin` hook si es necesario
2. Verificar permisos en páginas específicas
3. Actualizar tipos en `app/types/index.ts` si es necesario

## Notas Técnicas

- Todas las páginas usan `"use client"` para interactividad
- Se utiliza el sistema de autenticación existente
- Los componentes siguen las convenciones de Next.js 13+
- Se mantiene la consistencia con el diseño system existente
