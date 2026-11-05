# Validación de base de staging — 2026-11-05

Aplicación desplegada: merge `2034fac447e4a37b2e11a4a215ed2290a4be6a00` (PR #58). `eicc.vercel.app` sigue tratándose como staging por decisión del propietario.

## Hallazgos

- La base contiene 10 tablas públicas; la tabla de historial de Drizzle existe, pero tiene cero entradas. No ejecutar `db:migrate` ni `db:push` sobre ella hasta reconciliar el esquema.
- `passwordChangedAt` ya existe. `user_course_idx` era un índice no único; no había inscripciones duplicadas.
- No existen las tablas de soporte. Su ausencia no se resolvió aplicando a ciegas todo el journal.
- La variable de conexión de Vercel abarca development, preview y production: las previews no ofrecen aislamiento de datos por sí mismas.

## Respaldo y reparación

Se exportaron esquema, datos, restricciones e índices de las 10 tablas públicas en una transacción de lectura Repeatable Read. Se conservó una copia privada fuera del repositorio. El respaldo incluye la tabla vacía de historial de Drizzle; no incluye configuración del proveedor ni roles/grants.

Se restauró en PGlite y se compararon las 10 tablas y sus 49 registros. SHA-256 del respaldo: `2e00aba083e2a33f0ce5ba86d90928740b4644369bce63a0f61f7f5dbcd47edd`.

La reparación de `scripts/repair-staging-enrollment-index.sql` se ensayó sobre esa restauración y se aplicó mediante una única transacción HTTP de Neon. Bloquea escrituras sobre inscripciones, verifica duplicados y reemplaza el índice por uno único. El tiempo de espera del bloqueo está limitado a 5 segundos y cada sentencia a 30 segundos. Ante errores la transacción revierte; no se borran ni deduplican registros.

Verificación tras aplicar: `indisunique=true`, `indisvalid=true`, cero inscripciones y cero entradas en el historial de migraciones. No se registró artificialmente ninguna migración como ejecutada.

## Ejecución y límites

El archivo SQL debe ejecutarse completo dentro de UNA transacción; los separadores `statement-breakpoint` permiten enviarlo como un batch transaccional. No ejecutarlo sentencia por sentencia con autocommit. Antes de cualquier nueva aplicación, verificar entorno, respaldo y estado actual.

`npm run test:database`: cuatro pruebas aprobadas, incluyendo repetición de la reparación y rechazo de duplicados conservando datos e índice original. Además, el ensayo sobre el respaldo restaurado confirmó un índice único válido.

Esto verifica la reparación de esquema, no el recorrido del alumno. Sigue pendiente comprobar el cliente Node PostgreSQL desde Vercel, completar el recorrido real de inscripción/progreso/certificado, reconciliar historial y snapshots, aislar entornos y cerrar los demás bloqueantes del plan. La conectividad HTTP de Neon no demuestra conectividad TCP/TLS del pool de la aplicación. No habilita producción.
