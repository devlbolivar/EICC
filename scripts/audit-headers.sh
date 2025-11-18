#!/bin/bash

# ============================================
# Script de Auditoría de Headers de Seguridad
# ============================================
# Este script verifica que:
# 1. No se expongan headers sensibles
# 2. Los headers de seguridad estén presentes
# ============================================

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# URL base (por defecto localhost)
BASE_URL="${1:-http://localhost:3000}"

echo "==========================================="
echo "   Auditoría de Headers de Seguridad"
echo "==========================================="
echo ""
echo "URL Base: $BASE_URL"
echo ""

# Contadores
PASS=0
FAIL=0
WARN=0

# Headers sensibles que NO deben existir
SENSITIVE_HEADERS=(
  "x-user-id"
  "x-user-role"
  "x-company-id"
  "x-user-email"
  "x-role-id"
  "x-user-permissions"
  "x-powered-by"
)

# Headers de seguridad que DEBEN existir
SECURITY_HEADERS=(
  "X-Frame-Options"
  "X-Content-Type-Options"
  "X-XSS-Protection"
  "Referrer-Policy"
  "Permissions-Policy"
  "Content-Security-Policy"
)

# Endpoints a verificar
ENDPOINTS=(
  "/"
  "/api/auth/login"
  "/workspace/student"
  "/workspace/company"
  "/workspace/admin"
)

# Función para verificar headers de un endpoint
check_endpoint() {
  local endpoint=$1
  local full_url="${BASE_URL}${endpoint}"

  echo ""
  echo "----------------------------------------"
  echo "Verificando: $endpoint"
  echo "----------------------------------------"

  # Capturar headers (ignorar errores de conexión)
  headers=$(curl -sI "$full_url" 2>/dev/null)

  if [ -z "$headers" ]; then
    echo -e "${YELLOW}⚠️  No se pudo conectar a $full_url${NC}"
    ((WARN++))
    return
  fi

  # Verificar headers sensibles (NO deben existir)
  echo ""
  echo "Verificando ausencia de headers sensibles:"
  local sensitive_found=false

  for header in "${SENSITIVE_HEADERS[@]}"; do
    if echo "$headers" | grep -iq "^${header}:"; then
      echo -e "${RED}  ❌ FALLA: ${header} encontrado${NC}"
      echo "     $(echo "$headers" | grep -i "^${header}:")"
      sensitive_found=true
      ((FAIL++))
    fi
  done

  if [ "$sensitive_found" = false ]; then
    echo -e "${GREEN}  ✅ OK: Sin headers sensibles${NC}"
    ((PASS++))
  fi

  # Verificar headers de seguridad (DEBEN existir)
  echo ""
  echo "Verificando presencia de headers de seguridad:"
  local all_security_present=true

  for header in "${SECURITY_HEADERS[@]}"; do
    if echo "$headers" | grep -iq "^${header}:"; then
      echo -e "${GREEN}  ✅ ${header}${NC}"
    else
      echo -e "${RED}  ❌ FALTA: ${header}${NC}"
      all_security_present=false
      ((FAIL++))
    fi
  done

  if [ "$all_security_present" = true ]; then
    ((PASS++))
  fi
}

# Ejecutar verificación para cada endpoint
for endpoint in "${ENDPOINTS[@]}"; do
  check_endpoint "$endpoint"
done

# Resumen
echo ""
echo "==========================================="
echo "            RESUMEN"
echo "==========================================="
echo -e "${GREEN}Pasaron: $PASS${NC}"
echo -e "${RED}Fallaron: $FAIL${NC}"
echo -e "${YELLOW}Advertencias: $WARN${NC}"
echo ""

if [ $FAIL -gt 0 ]; then
  echo -e "${RED}❌ La auditoría encontró problemas de seguridad${NC}"
  exit 1
else
  echo -e "${GREEN}✅ La auditoría pasó exitosamente${NC}"
  exit 0
fi
