#!/usr/bin/env node

/**
 * Script para ejecutar tests de autenticación con diferentes configuraciones
 * Uso: node scripts/run-auth-tests.js [options]
 */

const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

// Configuración por defecto
const config = {
  environment: process.env.NODE_ENV || "test",
  coverage: false,
  watch: false,
  verbose: false,
  specificTest: null,
  outputFile: null,
};

// Parsear argumentos de línea de comandos
function parseArgs() {
  const args = process.argv.slice(2);

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    switch (arg) {
      case "--coverage":
      case "-c":
        config.coverage = true;
        break;
      case "--watch":
      case "-w":
        config.watch = true;
        break;
      case "--verbose":
      case "-v":
        config.verbose = true;
        break;
      case "--test":
      case "-t":
        config.specificTest = args[++i];
        break;
      case "--output":
      case "-o":
        config.outputFile = args[++i];
        break;
      case "--help":
      case "-h":
        showHelp();
        process.exit(0);
        break;
      default:
        console.error(`❌ Argumento desconocido: ${arg}`);
        showHelp();
        process.exit(1);
    }
  }
}

function showHelp() {
  console.log(`
🔐 Script de Tests de Autenticación

Uso: node scripts/run-auth-tests.js [options]

Opciones:
  --coverage, -c          Ejecutar con cobertura de código
  --watch, -w            Ejecutar en modo watch
  --verbose, -v          Mostrar logs detallados
  --test <pattern>, -t   Ejecutar test específico
  --output <file>, -o    Guardar output en archivo
  --help, -h             Mostrar esta ayuda

Ejemplos:
  node scripts/run-auth-tests.js
  node scripts/run-auth-tests.js --coverage --verbose
  node scripts/run-auth-tests.js --test "Login Flow" --watch
  node scripts/run-auth-tests.js --output results.json
`);
}

function validateEnvironment() {
  const requiredEnvVars = ["JWT_SECRET", "DATABASE_URL"];

  const missing = requiredEnvVars.filter((env) => !process.env[env]);

  if (missing.length > 0) {
    console.error("❌ Variables de entorno faltantes:");
    missing.forEach((env) => console.error(`   - ${env}`));
    console.error("\n💡 Asegúrate de tener un archivo .env configurado");
    process.exit(1);
  }

  console.log("✅ Variables de entorno validadas");
}

function buildJestCommand() {
  const args = ["jest"];

  // Patrón de test
  if (config.specificTest) {
    args.push("--testNamePattern", config.specificTest);
  } else {
    args.push("--testPathPattern", "integration");
  }

  // Opciones
  if (config.coverage) {
    args.push("--coverage");
  }

  if (config.watch) {
    args.push("--watch");
  }

  if (config.verbose) {
    args.push("--verbose");
  }

  // Configuración de cobertura
  if (config.coverage) {
    args.push(
      "--coverageReporters=text",
      "--coverageReporters=lcov",
      "--coverageReporters=html"
    );
  }

  return args;
}

function runTests() {
  console.log("🚀 Iniciando tests de autenticación...\n");

  const args = buildJestCommand();
  console.log(`📋 Comando: npx ${args.join(" ")}\n`);

  const jestProcess = spawn("npx", args, {
    stdio: "pipe",
    env: {
      ...process.env,
      NODE_ENV: config.environment,
    },
  });

  let output = "";

  jestProcess.stdout.on("data", (data) => {
    const text = data.toString();
    output += text;
    process.stdout.write(text);
  });

  jestProcess.stderr.on("data", (data) => {
    const text = data.toString();
    output += text;
    process.stderr.write(text);
  });

  jestProcess.on("close", (code) => {
    console.log(`\n🏁 Tests completados con código: ${code}`);

    // Guardar output si se especificó
    if (config.outputFile) {
      try {
        fs.writeFileSync(config.outputFile, output);
        console.log(`📄 Output guardado en: ${config.outputFile}`);
      } catch (error) {
        console.error(`❌ Error guardando output: ${error.message}`);
      }
    }

    // Mostrar resumen
    if (code === 0) {
      console.log("✅ Todos los tests pasaron exitosamente");
    } else {
      console.log("❌ Algunos tests fallaron");
      process.exit(code);
    }
  });

  jestProcess.on("error", (error) => {
    console.error(`❌ Error ejecutando tests: ${error.message}`);
    process.exit(1);
  });
}

function showTestSummary() {
  console.log(`
📊 Resumen de Tests de Autenticación

Los tests cubren los siguientes flujos:

🔐 Login Flow
  - Autenticación exitosa
  - Validación de credenciales
  - Manejo de usuarios inactivos
  - Prevención de ataques

📝 Register Flow
  - Registro de nuevos usuarios
  - Validación de datos
  - Registro con empresa
  - Sanitización de inputs

🔍 Token Validation
  - Validación de tokens
  - Manejo de expiración
  - Verificación de permisos
  - Gestión de sesiones

🚪 Logout Flow
  - Cierre de sesión
  - Limpieza de cookies
  - Invalidación de tokens

🔄 Token Refresh
  - Renovación de tokens
  - Validación de refresh tokens
  - Manejo de errores

🛡️ Security Tests
  - Prevención de SQL injection
  - Sanitización de XSS
  - Validación de inputs
  - Manejo seguro de datos

⚡ Performance Tests
  - Tests de carga
  - Validación de rendimiento
  - Manejo de concurrencia

📈 Coverage Targets
  - Código: >90%
  - Ramas: >85%
  - Funciones: >95%
  - Líneas: >90%
`);
}

// Función principal
function main() {
  console.log("🔐 Tests de Integración - Módulo de Autenticación\n");

  parseArgs();
  validateEnvironment();

  if (config.verbose) {
    showTestSummary();
  }

  runTests();
}

// Ejecutar si es el archivo principal
if (require.main === module) {
  main();
}

module.exports = {
  parseArgs,
  validateEnvironment,
  buildJestCommand,
  runTests,
  showTestSummary,
};
