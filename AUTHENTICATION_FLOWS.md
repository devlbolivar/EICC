# Sistema de Autenticación - Plataforma E-Learning Institucional

## 📋 Resumen Ejecutivo

Este documento describe el sistema de autenticación implementado para una plataforma de e-learning institucional/académica, similar a cyberchain.usal.es, eicyc.es o latca.us. El sistema soporta usuarios independientes, empresas con empleados y administradores.

## 🎯 Roles del Sistema

### 1. **admin**

- **Descripción**: Administrador del sistema con acceso completo
- **Permisos**: Todos los permisos de la plataforma
- **Acceso**: Dashboard de gestión global
- **Funcionalidades**: Gestión de empresas, usuarios, cursos, contenido

### 2. **company**

- **Descripción**: Administrador de empresa que gestiona empleados y cursos
- **Permisos**: Gestión de empresa, usuarios, cursos, contenido
- **Acceso**: Panel de empresa
- **Funcionalidades**: Invitar empleados, gestionar cursos, ver reportes

### 3. **student**

- **Descripción**: Estudiante que puede acceder a cursos y contenido
- **Permisos**: Leer cursos, inscribirse, acceder a contenido
- **Acceso**: Cursos activos y mi aprendizaje
- **Funcionalidades**: Tomar cursos, ver progreso, completar contenido

## 🔄 Flujos de Registro

### 1. **Registro de Usuario Independiente**

**Flujo:**

1. Usuario accede a `/sign-up`
2. Completa formulario con:
   - Email
   - Nombre
   - Contraseña
   - Confirmar contraseña
3. Sistema valida datos
4. Se crea usuario con rol `student`
5. Usuario no se asocia a empresa (companyId = null)
6. Se generan tokens de acceso
7. Usuario es redirigido a `/workspace/my-learning`

**Endpoint:** `POST /api/auth/register`

```json
{
  "email": "usuario@example.com",
  "name": "Juan Pérez",
  "password": "Contraseña123",
  "confirmPassword": "Contraseña123"
}
```

### 2. **Registro de Empresa**

**Flujo:**

1. Admin accede a panel de gestión
2. Crea empresa con:
   - Nombre
   - RUT (único)
   - Descripción (opcional)
   - Website (opcional)
   - Industria (opcional)
   - Tamaño (opcional)
3. Se crea empresa en estado activo
4. Admin puede crear usuarios con rol `company`
5. Usuarios company pueden invitar empleados

**Endpoint:** `POST /api/auth/register`

```json
{
  "email": "gerente@empresa.com",
  "name": "María García",
  "password": "Contraseña123",
  "confirmPassword": "Contraseña123",
  "companyData": {
    "companyName": "Empresa Ejemplo SPA",
    "rut": "12345678-9",
    "description": "Empresa de tecnología",
    "website": "https://empresa.com",
    "industry": "Tecnología",
    "size": "medium"
  }
}
```

### 3. **Invitación y Registro de Empleado**

**Flujo de Invitación:**

1. Usuario con rol `company` accede a panel de empresa
2. Hace clic en "Invitar Empleado"
3. Completa formulario con:
   - Email del empleado
   - Rol (student)
4. Sistema genera token de invitación único
5. Se envía email con link de invitación
6. Token expira en 7 días

**Endpoint:** `POST /api/auth/invite`

```json
{
  "email": "empleado@empresa.com",
  "roleName": "student",
  "companyId": "company-uuid"
}
```

**Flujo de Aceptación:**

1. Empleado recibe email con link
2. Hace clic en link: `/accept-invite?token=abc123`
3. Sistema verifica token y muestra formulario
4. Empleado completa:
   - Nombre
   - Contraseña
   - Confirmar contraseña
5. Se crea usuario vinculado automáticamente a la empresa
6. Se asigna rol `student`
7. Se marca invitación como usada
8. Usuario es redirigido a `/workspace/my-learning`

**Endpoint:** `POST /api/auth/accept-invite`

```json
{
  "token": "abc123",
  "name": "Carlos López",
  "password": "Contraseña123",
  "confirmPassword": "Contraseña123"
}
```

## 🔐 Flujo de Inicio de Sesión

### **Proceso de Login**

1. Usuario accede a `/sign-in`
2. Completa formulario con:
   - Email
   - Contraseña
3. Sistema valida credenciales
4. Se determina rol principal (prioridad: admin > company > student)
5. Se generan tokens de acceso y refresh
6. Se actualiza último login
7. Usuario es redirigido según su rol:
   - **admin** → `/workspace/admin`
   - **company** → `/workspace/company`
   - **student** → `/workspace/my-learning`

**Endpoint:** `POST /api/auth/login`

```json
{
  "email": "usuario@example.com",
  "password": "Contraseña123"
}
```

**Respuesta:**

```json
{
  "success": true,
  "message": "Inicio de sesión exitoso",
  "data": {
    "user": {
      "id": "user-uuid",
      "email": "usuario@example.com",
      "name": "Juan Pérez",
      "avatar": null
    },
    "currentCompany": {
      "id": "company-uuid",
      "name": "Empresa Ejemplo SPA",
      "rut": "12345678-9"
    },
    "currentRole": {
      "id": "role-uuid",
      "name": "student",
      "permissions": ["courses:read", "courses:enroll", "content:read"]
    },
    "userCompanies": [...]
  }
}
```

## 🛡️ Protección de Rutas

### **Middleware de Roles**

El middleware verifica:

1. **Autenticación**: Token válido en cookies
2. **Autorización**: Permisos para acceder a rutas específicas
3. **Redirección**: Usuarios son redirigidos a su dashboard correspondiente

**Rutas por Rol:**

- **admin**: `/workspace/admin`, `/api/admin`
- **company**: `/workspace/company`, `/api/company`
- **student**: `/workspace/student`, `/workspace/my-learning`

**Comportamiento:**

- Si usuario no autenticado → redirigir a `/sign-in`
- Si usuario intenta acceder a ruta no permitida → redirigir a su dashboard
- Si usuario tiene múltiples empresas → puede cambiar entre ellas

## 🔄 Cambio de Empresa

### **Proceso de Switch**

1. Usuario con múltiples empresas accede a selector
2. Selecciona empresa diferente
3. Sistema verifica que usuario pertenece a esa empresa
4. Se generan nuevos tokens con nueva empresa
5. Se actualizan cookies
6. Usuario es redirigido a dashboard de la nueva empresa

**Endpoint:** `POST /api/auth/switch-company`

```json
{
  "companyId": "new-company-uuid"
}
```

## 📊 Estructura de Base de Datos

### **Tablas Principales**

```sql
-- Usuarios
users (
  id, email, name, passwordHash, emailVerified,
  isActive, lastLoginAt, createdAt, updatedAt
)

-- Empresas
companies (
  id, name, rut, description, website, industry,
  size, isActive, subscriptionPlan, createdAt, updatedAt
)

-- Roles
roles (
  id, name, description, permissions, isSystemRole,
  createdAt, updatedAt
)

-- Relación Usuario-Empresa
user_companies (
  id, userId, companyId, roleId, isActive,
  joinedAt, invitedBy, acceptedAt
)

-- Tokens de Invitación
invitation_tokens (
  id, email, companyId, roleId, token, invitedBy,
  expiresAt, isUsed, usedAt, createdAt
)
```

## 🔧 Endpoints Disponibles

### **Autenticación**

- `POST /api/auth/register` - Registro de usuarios
- `POST /api/auth/login` - Inicio de sesión
- `POST /api/auth/logout` - Cerrar sesión
- `POST /api/auth/refresh` - Renovar tokens
- `POST /api/auth/invite` - Enviar invitación
- `POST /api/auth/accept-invite` - Aceptar invitación
- `GET /api/auth/accept-invite` - Verificar invitación
- `POST /api/auth/switch-company` - Cambiar empresa

### **Usuario**

- `GET /api/user` - Obtener información del usuario
- `PUT /api/user` - Actualizar perfil

## 🔐 Seguridad

### **Tokens JWT**

- **Access Token**: 7 días, para autenticación
- **Refresh Token**: 30 días, para renovar access token
- **Invitación Token**: 7 días, para registro por invitación

### **Cookies**

- HttpOnly: true
- Secure: true (en producción)
- SameSite: lax
- MaxAge: según tipo de token

### **Validaciones**

- Email único por usuario
- RUT único por empresa
- Contraseñas con requisitos mínimos
- Tokens de invitación únicos y con expiración

## 🚀 Implementación

### **Scripts de Inicialización**

```bash
# Ejecutar migraciones
npm run db:migrate

# Ejecutar seed para crear roles y usuarios de ejemplo
npm run db:seed
```

### **Variables de Entorno**

```env
DATABASE_URL=postgresql://user:password@localhost:5432/database
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=7d
REFRESH_TOKEN_EXPIRES_IN=30d
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### **Usuarios de Prueba**

Después de ejecutar el seed:

- **Admin**: admin@example.com / admin123
- **Company**: company@example.com / company123
- **Student**: student@example.com / student123

## 📝 Notas de Implementación

### **MVP Features**

- ✅ Registro de usuarios independientes
- ✅ Registro de empresas
- ✅ Sistema de invitaciones
- ✅ Autenticación con JWT
- ✅ Middleware de roles
- ✅ Cambio de empresa
- ✅ Protección de rutas

### **Futuras Mejoras**

- 🔄 Verificación de email
- 🔄 Recuperación de contraseña
- 🔄 Autenticación social (Google, Microsoft)
- 🔄 Auditoría de acciones
- 🔄 Rate limiting
- 🔄 2FA (Two-Factor Authentication)

### **Consideraciones de Producción**

- Cambiar JWT_SECRET en producción
- Configurar HTTPS
- Implementar rate limiting
- Configurar logs de auditoría
- Implementar monitoreo de sesiones
- Configurar backup de base de datos
