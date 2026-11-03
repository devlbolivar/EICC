# Validación de la primera entrega

Fecha: 2026-11-03. Entorno local: Node 24; CI configurada con Node 22 para coincidir con Vercel.

- Pruebas nuevas de acceso antes del cambio: 5 fallos / 3 aprobadas.
- Pruebas dirigidas después del cambio: 62 aprobadas, 4 suites (incluyen 10 casos nuevos de acceso/aislamiento).
- SQL real en PGlite: 2 escenarios aprobados; migraciones desde cero y reejecución, actualización con rename manual, unicidad, rollback y filtro de empresa.
- Suite Jest completa antes de agregar los últimos 2 casos de aislamiento: 409 aprobadas / 72 fallidas; mismas 5 suites fallidas que la auditoría inicial.
- Build de producción: aprobado con valores ficticios de DATABASE_URL, JWT_SECRET y NEXT_PUBLIC_APP_URL.
- Lint del build: 0 errores, 8 advertencias preexistentes.
- TypeScript completo: 161 errores preexistentes en pruebas; ningún error nuevo en código de aplicación ni en las nuevas pruebas.
- git diff --check: aprobado.

## Límites de esta evidencia

No se aplicaron migraciones ni se modificaron datos en staging. PGlite valida PostgreSQL y rollback local, pero no la conectividad, TLS ni límites del pool de Neon. Las pruebas de handlers usan mocks de autenticación y persistencia. Falta verificar el recorrido de navegador, correo, aislamiento de las demás APIs, progreso y certificados con datos de staging. Esta entrega no habilita producción.
