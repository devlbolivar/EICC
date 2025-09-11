# Módulo CRUD de Usuarios

## Descripción General

Este módulo proporciona una gestión completa de usuarios para administradores de la plataforma de aprendizaje online. Incluye funcionalidades de creación, lectura, actualización y eliminación (CRUD) de usuarios, con soporte para roles, empresas y permisos.

## Características Principales

### ✅ Funcionalidades Implementadas

1. **Gestión Completa de Usuarios**

   - Listado con paginación y filtros
   - Creación de nuevos usuarios
   - Edición de información de usuarios
   - Eliminación de usuarios
   - Vista detallada de usuario

2. **Sistema de Roles y Permisos**

   - Asignación de roles (admin, company, student)
   - Gestión de permisos por rol
   - Relaciones usuario-empresa
   - Validación de permisos de administrador

3. **Filtros y Búsqueda**

   - Búsqueda por nombre y email
   - Filtros por rol y estado
   - Ordenamiento por diferentes campos
   - Paginación avanzada

4. **Interfaz de Usuario**
   - Diseño responsive y moderno
   - Diálogos modales para formularios
   - Confirmaciones para acciones destructivas
   - Notificaciones con toast
   - Estados de carga y error

## Estructura de Archivos

```
app/
├── api/
│   └── admin/
│       ├── users/
│       │   ├── route.ts                    # Listar usuarios
│       │   ├── create/
│       │   │   └── route.ts               # Crear usuario
│       │   └── [id]/
│       │       └── route.ts               # Obtener/Actualizar/Eliminar usuario
│       ├── roles/
│       │   └── route.ts                   # Obtener roles
│       └── companies/
│           └── route.ts                   # Obtener empresas
├── workspace/
│   └── admin/
│       └── users/
│           ├── page.tsx                   # Lista de usuarios
│           └── [id]/
│               └── page.tsx               # Detalle de usuario
hooks/
└── use-admin-users.ts                    # Hook para gestión de usuarios
components/
└── ui/
    └── alert-dialog.tsx                  # Componente de confirmación
```

## APIs Implementadas

### 1. Listar Usuarios

- **Endpoint**: `GET /api/admin/users`
- **Parámetros**: `page`, `limit`, `search`, `role`, `status`, `sortBy`, `sortOrder`
- **Respuesta**: Lista de usuarios con paginación

### 2. Crear Usuario

- **Endpoint**: `POST /api/admin/users/create`
- **Body**: `name`, `email`, `password`, `roleId`, `companyId`, `age`, `subscriptionId`, `isActive`
- **Respuesta**: Usuario creado con relaciones

### 3. Obtener Usuario

- **Endpoint**: `GET /api/admin/users/[id]`
- **Respuesta**: Detalle completo del usuario con relaciones

### 4. Actualizar Usuario

- **Endpoint**: `PUT /api/admin/users/[id]`
- **Body**: `name`, `email`, `isActive`, `age`, `subscriptionId`
- **Respuesta**: Usuario actualizado

### 5. Eliminar Usuario

- **Endpoint**: `DELETE /api/admin/users/[id]`
- **Respuesta**: Confirmación de eliminación

### 6. Obtener Roles

- **Endpoint**: `GET /api/admin/roles`
- **Respuesta**: Lista de roles disponibles

### 7. Obtener Empresas

- **Endpoint**: `GET /api/admin/companies`
- **Respuesta**: Lista de empresas activas

## Hook: useAdminUsers

### Funcionalidades del Hook

```typescript
interface UseAdminUsersReturn {
  // Estado
  users: User[];
  loading: boolean;
  error: string | null;
  pagination: PaginationInfo;
  filters: FilterState;

  // Acciones
  fetchUsers: (params?) => Promise<void>;
  createUser: (userData) => Promise<UserDetail>;
  updateUser: (userId, userData) => Promise<void>;
  deleteUser: (userId) => Promise<void>;
  getUser: (userId) => Promise<UserDetail>;
  getRoles: () => Promise<Role[]>;
  getCompanies: () => Promise<Company[]>;

  // Utilidades
  setFilters: (filters) => void;
  clearError: () => void;
}
```

### Uso del Hook

```typescript
const {
  users,
  loading,
  error,
  pagination,
  fetchUsers,
  createUser,
  updateUser,
  deleteUser,
  setFilters,
  clearError,
} = useAdminUsers();

// Cargar usuarios
useEffect(() => {
  fetchUsers();
}, []);

// Crear usuario
const handleCreate = async () => {
  try {
    await createUser({
      name: "Juan Pérez",
      email: "juan@ejemplo.com",
      password: "123456",
      roleId: "role-id",
      companyId: "company-id",
    });
  } catch (error) {
    console.error(error);
  }
};
```

## Validaciones y Seguridad

### 1. Autenticación

- Verificación de token de acceso
- Validación de permisos de administrador
- Protección de rutas

### 2. Validaciones de Datos

- Email único en el sistema
- Contraseña mínima de 6 caracteres
- Campos requeridos validados
- Formato de email válido

### 3. Permisos

- Solo administradores pueden acceder
- Verificación de roles activos
- Protección contra auto-eliminación

## Interfaz de Usuario

### 1. Lista de Usuarios

- Tabla responsive con información clave
- Filtros avanzados
- Paginación
- Acciones por usuario (ver, editar, eliminar)

### 2. Formulario de Creación

- Modal con validaciones
- Selección de rol y empresa
- Campos opcionales (edad, suscripción)

### 3. Formulario de Edición

- Modal con datos precargados
- Actualización de información básica
- Cambio de estado activo/inactivo

### 4. Vista de Detalle

- Información completa del usuario
- Relaciones con empresas y roles
- Historial de actividad
- Permisos del rol

## Estados y Notificaciones

### 1. Estados de Carga

- Spinner durante operaciones
- Deshabilitación de botones
- Indicadores visuales

### 2. Manejo de Errores

- Mensajes de error específicos
- Toast notifications
- Estados de error en formularios

### 3. Confirmaciones

- Diálogos de confirmación para eliminación
- Validación antes de acciones destructivas

## Integración con el Sistema

### 1. Base de Datos

- Uso del schema unificado
- Relaciones con empresas y roles
- Transacciones seguras

### 2. Autenticación

- Integración con AuthContext
- Verificación de tokens
- Manejo de sesiones

### 3. Permisos

- Sistema de roles jerárquico
- Validación de permisos
- Control de acceso granular

## Dependencias

### NPM Packages

```json
{
  "@radix-ui/react-alert-dialog": "^1.0.0",
  "bcryptjs": "^2.4.3",
  "sonner": "^1.0.0"
}
```

### Componentes UI

- Card, Button, Input, Label
- Select, Dialog, AlertDialog
- Badge, Separator
- Iconos de Lucide React

## Configuración

### 1. Variables de Entorno

```env
DATABASE_URL=your_database_url
JWT_SECRET=your_jwt_secret
```

### 2. Base de Datos

- Tablas: `users`, `roles`, `companies`, `user_companies`
- Relaciones configuradas
- Índices optimizados

## Uso del Módulo

### 1. Acceso

- Navegar a `/workspace/admin/users`
- Requiere permisos de administrador
- Redirección automática si no autorizado

### 2. Crear Usuario

1. Hacer clic en "Crear Usuario"
2. Completar formulario
3. Seleccionar rol y empresa (opcional)
4. Guardar

### 3. Editar Usuario

1. Hacer clic en botón "Editar"
2. Modificar información
3. Guardar cambios

### 4. Ver Detalle

1. Hacer clic en botón "Ver"
2. Revisar información completa
3. Ver relaciones y permisos

### 5. Eliminar Usuario

1. Hacer clic en botón "Eliminar"
2. Confirmar acción
3. Usuario eliminado permanentemente

## Consideraciones Técnicas

### 1. Performance

- Paginación para listas grandes
- Filtros optimizados
- Carga lazy de datos

### 2. Seguridad

- Validación de entrada
- Sanitización de datos
- Protección CSRF

### 3. UX/UI

- Diseño responsive
- Estados de carga
- Feedback visual
- Accesibilidad

## Próximas Mejoras

### 1. Funcionalidades Adicionales

- [ ] Importación masiva de usuarios
- [ ] Exportación de datos
- [ ] Historial de cambios
- [ ] Notificaciones por email

### 2. Optimizaciones

- [ ] Cache de datos
- [ ] Búsqueda avanzada
- [ ] Filtros personalizados
- [ ] Dashboard de estadísticas

### 3. Seguridad

- [ ] Auditoría de acciones
- [ ] Logs de seguridad
- [ ] Autenticación de dos factores
- [ ] Políticas de contraseñas

## Soporte y Mantenimiento

### 1. Logs

- Errores registrados en consola
- Trazabilidad de operaciones
- Debugging facilitado

### 2. Testing

- Pruebas unitarias recomendadas
- Pruebas de integración
- Pruebas de UI

### 3. Documentación

- Código comentado
- Tipos TypeScript
- Ejemplos de uso

---

**Nota**: Este módulo está diseñado para ser escalable y mantenible, siguiendo las mejores prácticas de desarrollo web moderno.
