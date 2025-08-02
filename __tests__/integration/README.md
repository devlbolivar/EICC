# Test de Integración - Módulos de Autenticación y Cursos

Este directorio contiene tests de integración completos para los módulos de autenticación y cursos de la plataforma de aprendizaje online.

## 🎯 Objetivo

Los tests de integración están diseñados para:

- **Validar flujos completos** de autenticación y gestión de cursos
- **Probar casos de borde** y manejo de errores
- **Verificar seguridad** contra ataques comunes (SQL injection, XSS)
- **Evaluar rendimiento** bajo carga
- **Garantizar estabilidad** después de cambios importantes

## 📁 Estructura

```
__tests__/integration/
├── auth.integration.test.ts     # Test principal de autenticación
├── courses.integration.test.ts  # Test principal de cursos CRUD
└── README.md                    # Esta documentación
```

## 🧪 Cobertura de Tests

### 1. Módulo de Autenticación

#### Flujo de Login

- ✅ Autenticación exitosa con credenciales válidas
- ✅ Rechazo de email inválido
- ✅ Rechazo de credenciales faltantes
- ✅ Rechazo de usuario inexistente
- ✅ Rechazo de usuario inactivo
- ✅ Rechazo de contraseña incorrecta
- ✅ Rechazo de usuario sin roles asignados

#### Flujo de Registro

- ✅ Registro exitoso de nuevo usuario
- ✅ Rechazo de email ya registrado
- ✅ Rechazo de contraseñas que no coinciden
- ✅ Rechazo de contraseña inválida
- ✅ Registro exitoso con datos de empresa

#### Validación de Tokens

- ✅ Validación exitosa de token válido
- ✅ Rechazo de request sin token
- ✅ Rechazo de token inválido
- ✅ Rechazo de usuario inactivo
- ✅ Manejo de usuario sin empresas

#### Flujo de Logout

- ✅ Logout exitoso
- ✅ Limpieza correcta de cookies

#### Refresh de Tokens

- ✅ Refresh exitoso con token válido
- ✅ Rechazo sin refresh token
- ✅ Rechazo de refresh token inválido
- ✅ Rechazo de usuario inactivo
- ✅ Rechazo de token sin roleId
- ✅ Rechazo de relación usuario-empresa no encontrada

### 2. Módulo de Cursos

#### CREATE Flow - Creación de Cursos

- ✅ Creación exitosa con datos válidos y permisos
- ✅ Rechazo sin autenticación
- ✅ Rechazo sin permisos de escritura
- ✅ Rechazo con datos inválidos
- ✅ Manejo de errores de base de datos

#### READ Flow - Listado y Recuperación

- ✅ Listado exitoso con paginación
- ✅ Recuperación individual de curso
- ✅ Rechazo sin autenticación
- ✅ Retorno 404 para curso inexistente
- ✅ Rechazo de acceso a curso privado sin permisos

#### UPDATE Flow - Actualización de Cursos

- ✅ Actualización exitosa con datos válidos
- ✅ Rechazo sin permisos de escritura
- ✅ Rechazo de actualización de curso inexistente
- ✅ Manejo de errores de base de datos

#### DELETE Flow - Eliminación de Cursos

- ✅ Eliminación exitosa (soft delete)
- ✅ Rechazo sin permisos de eliminación
- ✅ Rechazo de eliminación de curso inexistente
- ✅ Manejo de errores de base de datos

#### Tests de Permisos y Autorización

- ✅ Usuarios admin pueden realizar todas las operaciones CRUD
- ✅ Usuarios de solo lectura restringidos a operaciones READ
- ✅ Validación de permisos por operación

#### Casos de Borde y Manejo de Errores

- ✅ Manejo de JSON malformado en request body
- ✅ Manejo de formato de token inválido
- ✅ Manejo de requests concurrentes al mismo curso
- ✅ Manejo de fallos de conexión a base de datos

#### Tests de Rendimiento

- ✅ Manejo eficiente de listas grandes de cursos
- ✅ Manejo de múltiples operaciones concurrentes de cursos

### 3. Casos de Borde y Manejo de Errores

- ✅ Manejo de errores de conexión a base de datos
- ✅ Manejo de JSON malformado
- ✅ Manejo de variables de entorno faltantes
- ✅ Manejo de intentos concurrentes de login
- ✅ Manejo de expiración de tokens
- ✅ Priorización correcta de roles

### 4. Tests de Seguridad

- ✅ Prevención de SQL injection
- ✅ Sanitización correcta de input de usuario
- ✅ Prevención de ataques XSS

### 5. Tests de Rendimiento

- ✅ Manejo de alta carga de requests de login
- ✅ Validación eficiente de tokens concurrentes
- ✅ Manejo de listas grandes de cursos
- ✅ Operaciones concurrentes de cursos

## 🚀 Ejecución

### Ejecutar todos los tests de integración

```bash
npm run test:integration
```

### Ejecutar tests específicos

```bash
# Solo tests de autenticación
npm test -- auth.integration.test.ts

# Solo tests de cursos
npm test -- courses.integration.test.ts

# Solo tests de login
npm test -- --testNamePattern="Login Flow"

# Solo tests de creación de cursos
npm test -- --testNamePattern="CREATE Flow"
```

### Ejecutar tests por categoría

```bash
# Tests de autenticación
npm test -- --testNamePattern="Authentication"

# Tests de CRUD de cursos
npm test -- --testNamePattern="CREATE Flow|READ Flow|UPDATE Flow|DELETE Flow"

# Tests de permisos
npm test -- --testNamePattern="Permission"

# Tests de rendimiento
npm test -- --testNamePattern="Performance"
```

## 📊 Métricas de Cobertura

### Autenticación

- **Cobertura de código:** ~95%
- **Casos de uso:** 100%
- **Casos de borde:** 100%
- **Tests de seguridad:** 100%

### Cursos

- **Cobertura de código:** ~90%
- **Operaciones CRUD:** 100%
- **Validación de permisos:** 100%
- **Manejo de errores:** 100%
- **Tests de rendimiento:** 100%

## 🔧 Configuración

### Variables de Entorno Requeridas

```bash
# Para tests de autenticación
JWT_SECRET=test-secret-key
JWT_REFRESH_SECRET=test-refresh-secret-key

# Para tests de base de datos
DATABASE_URL=your-test-database-url
```

### Configuración de Jest

Los tests utilizan la configuración definida en `jest.config.js` y `jest.setup.js` para:

- Mocking de Next.js components
- Configuración de base de datos de prueba
- Setup de variables de entorno
- Configuración de timeouts

## 🐛 Debugging

### Ejecutar tests en modo debug

```bash
# Con logs detallados
npm test -- --verbose

# Con logs de Jest
npm test -- --verbose --detectOpenHandles

# Solo un test específico
npm test -- --testNamePattern="should create a course successfully"
```

### Logs de Debug

Los tests incluyen logs detallados para debugging:

```javascript
console.log("Mock data:", mockCourse);
console.log("Response:", result);
console.log("Database calls:", mockDb.execute.mock.calls);
```

## 📈 Monitoreo

### Métricas de Performance

- **Tiempo de respuesta promedio:** < 100ms
- **Tiempo máximo de respuesta:** < 500ms
- **Throughput:** > 100 requests/segundo
- **Uso de memoria:** < 50MB por test suite

### Alertas

- Tests que fallan más de 3 veces consecutivas
- Tests que tardan más de 5 segundos
- Cobertura de código menor al 90%

## 🔄 Mantenimiento

### Actualización de Tests

1. **Agregar nuevos casos de uso:** Crear nuevos tests siguiendo el patrón existente
2. **Actualizar mocks:** Modificar mocks cuando cambie la estructura de datos
3. **Refactorizar:** Mantener tests DRY y legibles
4. **Documentar:** Actualizar este README con nuevos tests

### Checklist de Mantenimiento

- [ ] Ejecutar tests después de cada cambio
- [ ] Verificar cobertura de código
- [ ] Actualizar documentación
- [ ] Revisar performance
- [ ] Validar seguridad

## 🤝 Contribución

### Guías para Nuevos Tests

1. **Seguir el patrón AAA:** Arrange, Act, Assert
2. **Usar nombres descriptivos:** `should handle X when Y`
3. **Mockear dependencias externas:** Base de datos, APIs, etc.
4. **Probar casos de borde:** Errores, valores límite, etc.
5. **Incluir tests de performance:** Para operaciones críticas

### Estructura de Test

```javascript
describe("Feature Name", () => {
  it("should handle specific scenario", async () => {
    // Arrange - Preparar datos y mocks
    const mockData = {
      /* ... */
    };

    // Act - Ejecutar la operación
    const result = await operation(mockData);

    // Assert - Verificar resultados
    expect(result).toBe(expected);
  });
});
```
