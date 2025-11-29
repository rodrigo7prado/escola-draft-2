#!/usr/bin/env bash
set -euo pipefail

# Escolhe docker compose ou docker-compose
if command -v docker-compose >/dev/null 2>&1; then
  COMPOSE_CMD="docker-compose"
else
  COMPOSE_CMD="docker compose"
fi

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "${ROOT_DIR}"

BACKUP_DIR="${ROOT_DIR}/backups"
SERVICE="${SERVICE:-db}"
DB_NAME="${DB_NAME:-certificados}"
DB_USER="${DB_USER:-postgres}"
DB_PASSWORD="${DB_PASSWORD:-postgres}"
TIMESTAMP="$(date +%F-%H%M%S)"
FILENAME="${1:-backup-${DB_NAME}-${TIMESTAMP}.dump}"
CONTAINER_PATH="/backups/${FILENAME}"

mkdir -p "${BACKUP_DIR}"

if ! ${COMPOSE_CMD} ps --services | grep -qx "${SERVICE}"; then
  echo "Serviço '${SERVICE}' não existe no docker-compose.yml" >&2
  exit 1
fi

if ! ${COMPOSE_CMD} ps --services --filter status=running | grep -qx "${SERVICE}"; then
  echo "Subindo serviço '${SERVICE}'..." >&2
  ${COMPOSE_CMD} up -d "${SERVICE}"
fi

echo "Gerando backup em ${CONTAINER_PATH}..."
${COMPOSE_CMD} exec -T "${SERVICE}" env PGPASSWORD="${DB_PASSWORD}" \
  pg_dump -U "${DB_USER}" -d "${DB_NAME}" -F c -f "${CONTAINER_PATH}"

echo "Backup criado: ${BACKUP_DIR}/${FILENAME}"
