# 🎓 Plataforma de E-Learning

Una plataforma moderna de aprendizaje en línea construida con Next.js, TypeScript y PostgreSQL.

## 🚀 Características

- **Autenticación Segura**: JWT con refresh tokens y validación robusta
- **Gestión de Roles**: Sistema de permisos granular (Admin, Company, Student)
- **Cursos Interactivos**: Generación de contenido con IA y videos de YouTube
- **Gestión de Empresas**: Sistema multi-tenant para organizaciones
- **UI Moderna**: Interfaz responsive con Tailwind CSS y Radix UI

## 🛡️ Seguridad

### ✅ Medidas Implementadas

- **Autenticación JWT**: Tokens seguros con expiración configurable
- **Rate Limiting**: Protección contra ataques de fuerza bruta
- **Validación de Entrada**: Sanitización y validación de todos los datos
- **Headers de Seguridad**: CSP, XSS Protection, HSTS, etc.
- **Cookies Seguras**: HttpOnly, Secure, SameSite configurado
- **Hashing de Contraseñas**: bcrypt con salt rounds de 12
- **Validación de UUIDs**: Prevención de inyección de IDs
- **Logs Seguros**: Sin información sensible en logs de producción

### 🔧 Configuración de Seguridad

```bash
# Variables de entorno críticas
JWT_SECRET="clave-super-segura-de-al-menos-32-caracteres"
COOKIE_SECRET="otra-clave-secreta-para-cookies"
DATABASE_URL="postgresql://user:password@host:port/database"
```

## 📋 Requisitos

- Node.js 18+
- PostgreSQL 14+
- npm o yarn

## 📦 Versiones de Drizzle

Este proyecto utiliza Drizzle ORM para la gestión de base de datos. Es importante mantener las versiones compatibles:

| Paquete | Versión | Propósito |
|---------|---------|-----------|
| `drizzle-orm` | ^0.43.1 | ORM principal |
| `drizzle-kit` | ^0.31.7 | CLI para migraciones |

**IMPORTANTE**: `drizzle-orm` y `drizzle-kit` tienen versionado **independiente**. La compatibilidad correcta es:
- drizzle-orm 0.43.x-0.44.x con drizzle-kit 0.31.x

Para verificar la compatibilidad:
```bash
npm list drizzle-orm drizzle-kit
```

Para actualizar ambos paquetes:
```bash
# Verificar últimas versiones compatibles
npm view drizzle-orm version
npm view drizzle-kit version

# Actualizar
npm install drizzle-orm@latest
npm install --save-dev drizzle-kit@latest
```

## 🚀 Instalación

1. **Clonar el repositorio**

```bash
git clone <repository-url>
cd online-learning-platform
```

2. **Instalar dependencias**

```bash
npm install
```

3. **Configurar variables de entorno**

Opción A - Setup Automático (RECOMENDADO):
```bash
node scripts/setup-env.js
```

Opción B - Setup Manual:
```bash
cp .env.example .env.local
# Editar .env.local con tus configuraciones
```

**IMPORTANTE:** El script de setup genera automáticamente un JWT_SECRET seguro.

4. **Configurar base de datos**

```bash
# Generar migraciones
npm run db:generate

# Ejecutar migraciones
npm run db:migrate

# Configurar datos iniciales
npm run db:setup
```

5. **Ejecutar en desarrollo**

```bash
npm run dev
```

## 🔐 Configuración de Seguridad

### Variables de Entorno Críticas

```env
# JWT Configuration
JWT_SECRET="tu-clave-super-segura-de-al-menos-32-caracteres"
JWT_EXPIRES_IN="7d"
REFRESH_TOKEN_EXPIRES_IN="30d"

# Database
DATABASE_URL="postgresql://user:password@host:port/database"

# Security
COOKIE_SECRET="otra-clave-secreta-para-cookies"
RATE_LIMIT_MAX_REQUESTS="100"
RATE_LIMIT_WINDOW_MS="900000"
```

### ⚠️ IMPORTANTE PARA PRODUCCIÓN

1. **Cambiar todas las claves secretas** por defecto
2. **Configurar HTTPS** en producción
3. **Usar variables de entorno** para todas las configuraciones sensibles
4. **Revisar logs** regularmente
5. **Actualizar dependencias** frecuentemente

## 📁 Estructura del Proyecto

```
├── app/                    # App Router de Next.js
│   ├── api/               # API Routes
│   ├── (auth)/            # Páginas de autenticación
│   ├── workspace/         # Dashboard principal
│   └── course/            # Páginas de cursos
├── components/            # Componentes UI reutilizables
├── config/               # Configuración de base de datos
├── lib/                  # Utilidades y funciones de autenticación
├── context/              # Contextos de React
└── scripts/              # Scripts de configuración
```

## 🔧 Scripts Disponibles

```bash
# Desarrollo
npm run dev              # Servidor de desarrollo
npm run build            # Build de producción
npm run start            # Servidor de producción

# Base de datos
npm run db:generate      # Generar migraciones
npm run db:migrate       # Ejecutar migraciones
npm run db:push          # Push de esquema
npm run db:studio        # Abrir Drizzle Studio
npm run db:setup         # Configurar datos iniciales

# Utilidades
npm run lint             # Linting
```

## 🛡️ Mejores Prácticas de Seguridad

### Para Desarrolladores

1. **Nunca committear** archivos `.env` o claves secretas
2. **Validar siempre** la entrada del usuario
3. **Usar HTTPS** en producción
4. **Implementar rate limiting** en endpoints críticos
5. **Logging seguro** sin información sensible

### Para Administradores

1. **Rotar claves** regularmente
2. **Monitorear logs** de acceso
3. **Backups regulares** de la base de datos
4. **Actualizar dependencias** de seguridad
5. **Configurar firewall** apropiadamente

## 🐛 Troubleshooting

### Problemas Comunes

1. **Error de JWT_SECRET**: Asegúrate de configurar la variable de entorno
2. **Error de base de datos**: Verifica la conexión y credenciales
3. **Errores de CORS**: Configura CORS_ORIGIN correctamente

## 📝 Licencia

Este proyecto está bajo la Licencia MIT.

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

## 📞 Soporte

Para soporte técnico o preguntas de seguridad, contacta al equipo de desarrollo.
