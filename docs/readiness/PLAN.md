# EICC: preparación del MVP para producción

Base auditada: `581703e6bd4fc12ad4574bc7987116e519f55ca1` (master).
El propietario confirmó el 3 de noviembre de 2026 que `eicc.vercel.app` puede tratarse como staging.
Vercel identifica ese dominio como target `production`; eso no convierte una preview en un entorno de datos aislado. Antes de conectar una preview, verificar su DATABASE_URL sin imprimir secretos.

## Alcance y criterio de salida

Recorrido principal: administrador crea curso → empresa invita estudiante → estudiante accede, se inscribe, guarda progreso y obtiene certificado según su plan.
Preparar dos empresas, usuarios con los tres roles, cursos públicos/privados/compartidos y planes free/starter/pro.
No se autoriza producción hasta tener evidencia completa en staging, sin bloqueantes de acceso o persistencia, con backup y recuperación ensayados.

## Entrega 1: aislamiento de cursos y base de persistencia

- [x] Reproducir lectura, edición y eliminación entre empresas con pruebas que fallen antes del arreglo.
- [x] Compartir política de acceso entre listado, detalle e inscripción; incluir empresas destinatarias por ID.
- [x] Ignorar x-company-id enviado por el cliente al inscribirse.
- [x] Usar cliente Node PostgreSQL para las transacciones interactivas, conservando HTTP en middleware.
- [x] Registrar las migraciones pendientes y agregar passwordChangedAt y unicidad de inscripción.
- [x] Probar migraciones desde cero, reejecución, tabla renombrada manualmente y rechazo de duplicados sin eliminarlos.
- [x] Corregir URL/CSRF de inscripción desde vista de empresa y JOIN del conteo de certificados.
- [ ] Inspeccionar esquema e historial de migraciones de staging; exportar backup antes de aplicar cambios.
- [ ] Reconciliar snapshots de Drizzle para futuras generaciones: no ejecutar db:generate o db:push a ciegas contra staging.
- [ ] Validar conexión TLS, pool y transacciones del cliente Node contra Neon en staging.

## Entrega 2: autorización y reglas de negocio restantes

- Verificar todas las APIs de empresa, invitaciones y certificados con la matriz de roles.
- Comprobar revocación al desactivar usuario/cambiar contraseña y selección de empresa al renovar sesión.
- Validar progreso en servidor; definir si completar lecciones basta o existe evaluación.
- Serializar comprobación de cuotas y altas concurrentes; comprobar reintentos de progreso y certificado.
- Alinear estados/visibilidad en español y enums, y reglas de acceso a borradores.
- Confirmar si responsables de empresa pueden inscribirse (actualmente su rol no incluye courses:enroll).

## Entrega 3: checks y alcance del producto

- Resolver los 161 diagnósticos TypeScript iniciales y 72 pruebas fallidas; no ocultarlos con exclusiones.
- Reparar E2E: rutas reales, datos independientes por prueba y build de producción.
- Actualizar dependencias reportadas por npm audit y revisar exposición de cada aviso.
- Decidir si soporte/facturación entran en el MVP; completar o retirar explícitamente pantallas simuladas.
- Verificar reproducción de videos y CSP, recuperación de contraseña y entrega de invitaciones.

## Entrega 4: ensayo y salida

- Configurar CI para master y PRs, y conectar un despliegue real.
- La CI inicial de regresiones solo verifica este paquete; no certifica el MVP completo.
- Probar recorrido completo en navegador con dos empresas y registros de prueba identificables.
- Verificar errores y trazabilidad, backup/restauración, migraciones y rollback de aplicación.
- Registrar commit, resultados, limitaciones aceptadas y decisión de salida antes de producción.

## Verificación local

- `npm run test:database`: SQL real sobre PostgreSQL embebido (PGlite), sin credenciales externas. No valida conexión/TLS a Neon.
- `npm test -- --runInBand __tests__/api/course-access.test.ts __tests__/api/enrollment-isolation.test.ts __tests__/integration/plan-limits.integration.test.ts __tests__/integration/courses.integration.test.ts`: pruebas de API y reglas con mocks.
- `npm run lint`, `npx tsc --noEmit`, `npm run build` y suite Jest completa: registrar resultados, distinguiendo deuda preexistente.

## Migraciones sobre bases existentes

Las migraciones 0002 y 0003 no figuraban en el journal original. 0002 ahora tolera que su renombrado se haya hecho manualmente; si encuentra ambas tablas, se detiene. 0004 no deduplica ni elimina datos: si existen pares course_id/user_id repetidos, exige reconciliación manual. Si la base fue creada mediante push o SQL manual y carece de historial, no ejecutar el baseline sin comparar primero el esquema.
