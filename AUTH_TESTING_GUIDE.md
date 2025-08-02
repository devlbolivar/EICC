# 🔐 Guía Completa de Tests de Autenticación

Esta guía proporciona una visión completa del sistema de tests de integración para el módulo de autenticación de la plataforma de aprendizaje online.

## 📋 Tabla de Contenidos

1. [Visión General](#visión-general)
2. [Arquitectura de Tests](#arquitectura-de-tests)
3. [Flujos Cubiertos](#flujos-cubiertos)
4. [Casos de Borde](#casos-de-borde)
5. [Tests de Seguridad](#tests-de-seguridad)
6. [Tests de Rendimiento](#tests-de-rendimiento)
7. [Ejecución de Tests](#ejecución-de-tests)
8. [CI/CD Integration](#cicd-integration)
9. [Mantenimiento](#mantenimiento)
10. [Troubleshooting](#troubleshooting)

## 🎯 Visión General

El sistema de tests de autenticación está diseñado para garantizar la **estabilidad**, **seguridad** y **funcionalidad** del módulo de autenticación. Los tests cubren todos los flujos posibles y casos de borde para prevenir regresiones y asegurar la calidad del código.

### Objetivos Principales

- ✅ **Validar flujos completos** de autenticación
- ✅ **Probar casos de borde** y manejo de errores
- ✅ **Verificar seguridad** contra ataques comunes
- ✅ **Evaluar rendimiento** bajo carga
- ✅ **Garantizar estabilidad** después de cambios

## 🏗️ Arquitectura de Tests

### Estructura de Archivos

```
__tests__/integration/
├── auth.integration.test.ts    # Tests principales
└── README.md                   # Documentación específica

scripts/
└── run-auth-tests.js          # Script de ejecución

.github/workflows/
└── auth-tests.yml             # CI/CD pipeline

env.test.example               # Configuración de ejemplo
```

### Patrón de Test

```typescript
describe("Auth Module Integration Tests", () => {
  beforeEach(() => {
    // Setup de mocks y datos
  });

  describe("Login Flow", () => {
    it("should successfully authenticate valid user credentials", async () => {
      // Arrange - Preparar datos y mocks
      const mockRequest = {
        /* ... */
      };

      // Act - Ejecutar la acción
      const response = await POST(mockRequest);
      const data = await response.json();

      // Assert - Verificar resultados
      expect(data.success).toBe(true);
      expect(response.status).toBe(200);
    });
  });
});
```

## 🔄 Flujos Cubiertos

### 1. Login Flow

**Tests incluidos:**

- ✅ Autenticación exitosa con credenciales válidas
- ✅ Rechazo de email inválido
- ✅ Rechazo de credenciales faltantes
- ✅ Rechazo de usuario inexistente
- ✅ Rechazo de usuario inactivo
- ✅ Rechazo de contraseña incorrecta
- ✅ Rechazo de usuario sin roles asignados

**Código de ejemplo:**

```typescript
it("should successfully authenticate valid user credentials", async () => {
  const mockRequest = {
    json: jest.fn().mockResolvedValue({
      email: "test@example.com",
      password: "ValidPassword123",
    }),
  } as unknown as NextRequest;

  const response = await POST(mockRequest);
  const data = await response.json();

  expect(data.success).toBe(true);
  expect(data.message).toBe("Inicio de sesión exitoso");
  expect(data.data.user).toBeDefined();
});
```

### 2. Register Flow

**Tests incluidos:**

- ✅ Registro exitoso de nuevo usuario
- ✅ Rechazo de email ya registrado
- ✅ Rechazo de contraseñas que no coinciden
- ✅ Rechazo de contraseña inválida
- ✅ Registro exitoso con datos de empresa

### 3. Token Validation Flow

**Tests incluidos:**

- ✅ Validación exitosa de token válido
- ✅ Rechazo de request sin token
- ✅ Rechazo de token inválido
- ✅ Rechazo de usuario inactivo
- ✅ Manejo de usuario sin empresas

### 4. Logout Flow

**Tests incluidos:**

- ✅ Logout exitoso
- ✅ Limpieza correcta de cookies

### 5. Token Refresh Flow

**Tests incluidos:**

- ✅ Refresh exitoso con token válido
- ✅ Rechazo sin refresh token
- ✅ Rechazo de refresh token inválido
- ✅ Rechazo de usuario inactivo
- ✅ Rechazo de token sin roleId
- ✅ Rechazo de relación usuario-empresa no encontrada

## 🎯 Casos de Borde

### Manejo de Errores

```typescript
it("should handle database connection errors gracefully", async () => {
  (db.execute as jest.Mock).mockRejectedValue(
    new Error("Database connection failed")
  );

  const response = await POST(mockRequest);
  const data = await response.json();

  expect(data.error).toBe("Error interno del servidor");
  expect(response.status).toBe(500);
});
```

### Concurrencia

```typescript
it("should handle concurrent login attempts", async () => {
  const promises = Array(5)
    .fill(null)
    .map(() => POST(mockRequest));
  const responses = await Promise.all(promises);

  responses.forEach((response) => {
    expect(response.status).toBe(200);
  });
});
```

### Variables de Entorno

```typescript
it("should handle missing environment variables", async () => {
  const originalEnv = process.env.JWT_SECRET;
  delete process.env.JWT_SECRET;

  const response = await POST(mockRequest);
  const data = await response.json();

  expect(data.error).toBe("Error interno del servidor");
  expect(response.status).toBe(500);

  process.env.JWT_SECRET = originalEnv;
});
```

## 🛡️ Tests de Seguridad

### Prevención de SQL Injection

```typescript
it("should prevent SQL injection attempts", async () => {
  const mockRequest = {
    json: jest.fn().mockResolvedValue({
      email: "'; DROP TABLE users; --",
      password: "ValidPassword123",
    }),
  } as unknown as NextRequest;

  const response = await POST(mockRequest);
  const data = await response.json();

  expect(data.error).toBe("Credenciales inválidas");
  expect(response.status).toBe(401);
});
```

### Sanitización de XSS

```typescript
it("should prevent XSS attacks in user input", async () => {
  const mockRequest = {
    json: jest.fn().mockResolvedValue({
      email: "test@example.com",
      name: "<script>alert('xss')</script>",
      password: "ValidPassword123",
      confirmPassword: "ValidPassword123",
    }),
  } as unknown as NextRequest;

  const response = await POST(mockRequest);
  const data = await response.json();

  expect(data.success).toBe(true);
  expect(sanitizeString).toHaveBeenCalledWith("<script>alert('xss')</script>");
});
```

### Validación de Input

```typescript
it("should sanitize user input properly", async () => {
  const mockRequest = {
    json: jest.fn().mockResolvedValue({
      email: "  TEST@EXAMPLE.COM  ",
      name: "  Test   User  ",
      password: "ValidPassword123",
      confirmPassword: "ValidPassword123",
    }),
  } as unknown as NextRequest;

  const response = await POST(mockRequest);
  const data = await response.json();

  expect(data.success).toBe(true);
  expect(validateAndSanitizeEmail).toHaveBeenCalledWith("  TEST@EXAMPLE.COM  ");
  expect(sanitizeName).toHaveBeenCalledWith("  Test   User  ");
});
```

## ⚡ Tests de Rendimiento

### Alta Carga

```typescript
it("should handle high load login requests", async () => {
  const startTime = Date.now();
  const promises = Array(100)
    .fill(null)
    .map(() => POST(mockRequest));
  const responses = await Promise.all(promises);
  const endTime = Date.now();

  const successCount = responses.filter((r) => r.status === 200).length;
  const averageResponseTime = (endTime - startTime) / responses.length;

  expect(successCount).toBe(100);
  expect(averageResponseTime).toBeLessThan(100); // Menos de 100ms por request
});
```

### Validación Concurrente

```typescript
it("should handle concurrent token validations efficiently", async () => {
  const startTime = Date.now();
  const promises = Array(50)
    .fill(null)
    .map(() => GET());
  const responses = await Promise.all(promises);
  const endTime = Date.now();

  const successCount = responses.filter((r) => r.status === 200).length;
  const averageResponseTime = (endTime - startTime) / responses.length;

  expect(successCount).toBe(50);
  expect(averageResponseTime).toBeLessThan(50); // Menos de 50ms por request
});
```

## 🚀 Ejecución de Tests

### Comandos Básicos

```bash
# Ejecutar todos los tests de integración
npm run test:integration

# Ejecutar con cobertura
npm run test:integration:coverage

# Ejecutar tests específicos
npm run test:auth
npm run test:security
npm run test:performance

# Ejecutar en modo watch
npm run test:watch -- --testPathPattern=integration
```

### Script Personalizado

```bash
# Usar el script personalizado
node scripts/run-auth-tests.js

# Con opciones
node scripts/run-auth-tests.js --coverage --verbose
node scripts/run-auth-tests.js --test "Login Flow" --watch
node scripts/run-auth-tests.js --output results.json
```

### Variables de Entorno

```bash
# Configurar entorno de testing
cp env.test.example .env.test

# Ajustar variables según tu entorno
JWT_SECRET=your-test-secret
DATABASE_URL=your-test-database-url
NODE_ENV=test
```

## 🔄 CI/CD Integration

### GitHub Actions

El workflow `auth-tests.yml` se ejecuta automáticamente en:

- **Push** a `main` o `develop`
- **Pull Request** que afecten archivos de auth
- **Manual trigger** con opciones específicas

### Configuración del Workflow

```yaml
name: Auth Module Integration Tests

on:
  push:
    branches: [main, develop]
    paths:
      - "app/api/auth/**"
      - "lib/auth.ts"
      - "__tests__/integration/**"
  pull_request:
    branches: [main, develop]
    paths:
      - "app/api/auth/**"
      - "lib/auth.ts"
      - "__tests__/integration/**"
```

### Jobs del Workflow

1. **test-auth**: Tests principales con múltiples versiones de Node.js
2. **test-matrix**: Tests específicos por flujo
3. **notify**: Notificaciones de resultados

### Configuración de Base de Datos

```yaml
services:
  postgres:
    image: postgres:15
    env:
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: test_auth_db
    options: >-
      --health-cmd pg_isready
      --health-interval 10s
      --health-timeout 5s
      --health-retries 5
    ports:
      - 5432:5432
```

## 🛠️ Mantenimiento

### Agregar Nuevos Tests

1. **Identificar el flujo** a testear
2. **Crear test case** siguiendo el patrón existente
3. **Agregar mocks** necesarios
4. **Verificar cobertura** con `npm run test:coverage`

### Patrón para Nuevos Tests

```typescript
it("should [expected behavior]", async () => {
  // Arrange - Preparar datos y mocks
  const mockRequest = {
    /* ... */
  };

  // Act - Ejecutar la acción
  const response = await POST(mockRequest);
  const data = await response.json();

  // Assert - Verificar resultados
  expect(data.success).toBe(true);
  expect(response.status).toBe(200);
});
```

### Actualizar Mocks

```typescript
// Agregar nuevos mocks según sea necesario
jest.mock("@/lib/auth", () => ({
  ...jest.requireActual("@/lib/auth"),
  newFunction: jest.fn(),
}));
```

### Verificar Cobertura

```bash
# Verificar cobertura actual
npm run test:coverage

# Verificar cobertura específica
npm run test:integration:coverage
```

## 🔧 Troubleshooting

### Problemas Comunes

#### 1. Tests Fallando por Variables de Entorno

```bash
# Verificar variables de entorno
echo $JWT_SECRET
echo $DATABASE_URL
echo $NODE_ENV

# Configurar variables
export JWT_SECRET=test-secret
export DATABASE_URL=your-test-db-url
export NODE_ENV=test
```

#### 2. Problemas con Mocks

```typescript
// Verificar que los mocks estén configurados correctamente
beforeEach(() => {
  jest.clearAllMocks();
  // Configurar mocks específicos
});
```

#### 3. Problemas de Base de Datos

```bash
# Verificar conexión a base de datos
npm run db:test

# Configurar base de datos de testing
npm run db:setup
```

#### 4. Problemas de Timeout

```typescript
// Aumentar timeout para tests complejos
jest.setTimeout(30000);

it("should handle complex operation", async () => {
  // Test con timeout extendido
}, 30000);
```

### Debug de Tests

```bash
# Ejecutar test específico con logs verbosos
npm test -- --testNamePattern="should successfully authenticate" --verbose

# Ejecutar con debug
NODE_ENV=test DEBUG=* npm test -- --testNamePattern="Auth Module"
```

### Logs Detallados

```typescript
// Agregar logs para debug
console.log("Request data:", mockRequest);
console.log("Response:", response);
console.log("Response data:", data);
```

## 📊 Métricas y Monitoreo

### Cobertura Objetivo

- **Código**: >90%
- **Ramas**: >85%
- **Funciones**: >95%
- **Líneas**: >90%

### Métricas de Rendimiento

- **Tiempo de respuesta**: <100ms por request
- **Tasa de éxito**: >95%
- **Errores**: <5%

### Alertas Recomendadas

- Tiempo de respuesta > 500ms
- Tasa de éxito < 95%
- Errores de autenticación > 5%

## 🤝 Contribución

### Guías para Contribuir

1. **Seguir el patrón** de tests existentes
2. **Agregar tests** para nuevos flujos
3. **Actualizar documentación** cuando sea necesario
4. **Verificar cobertura** antes de hacer commit

### Checklist de Review

- [ ] Tests cubren todos los casos de uso
- [ ] Mocks están correctamente configurados
- [ ] Assertions son específicos y claros
- [ ] Documentación está actualizada
- [ ] Cobertura se mantiene >90%

## 📞 Soporte

Para preguntas o problemas con los tests:

1. Revisar esta documentación
2. Verificar logs de ejecución
3. Consultar el código fuente de los endpoints
4. Crear issue en el repositorio

---

**Nota**: Estos tests son críticos para la estabilidad del sistema. Ejecutarlos regularmente ayuda a detectar problemas temprano y mantener la calidad del código.
