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

BACKUP_FILE="${1:-}"
if [[ -z "${BACKUP_FILE}" ]]; then
  echo "Uso: $0 <arquivo.dump>" >&2
  echo "Procuro o arquivo em ${BACKUP_DIR} por padrão" >&2
  exit 1
fi

# Se veio só o nome, assume que está em backups/
if [[ "${BACKUP_FILE}" != /* ]]; then
  HOST_PATH="${BACKUP_DIR}/${BACKUP_FILE}"
else
  HOST_PATH="${BACKUP_FILE}"
fi

if [[ ! -f "${HOST_PATH}" ]]; then
  echo "Arquivo de backup não encontrado: ${HOST_PATH}" >&2
  exit 1
fi

FILENAME="$(basename "${HOST_PATH}")"
CONTAINER_PATH="/backups/${FILENAME}"

if ! ${COMPOSE_CMD} ps --services | grep -qx "${SERVICE}"; then
  echo "Serviço '${SERVICE}' não existe no docker-compose.yml" >&2
  exit 1
fi

if ! ${COMPOSE_CMD} ps --services --filter status=running | grep -qx "${SERVICE}"; then
  echo "Subindo serviço '${SERVICE}'..." >&2
  ${COMPOSE_CMD} up -d "${SERVICE}"
fi

# Garante que o arquivo está no volume do container
if [[ "${HOST_PATH}" != "${BACKUP_DIR}/${FILENAME}" ]]; then
  echo "Copiando ${HOST_PATH} para ${BACKUP_DIR}/${FILENAME}..." >&2
  cp "${HOST_PATH}" "${BACKUP_DIR}/${FILENAME}"
fi

# Restaura substituindo objetos existentes
cat <<MSG
Restaurando ${CONTAINER_PATH} no banco '${DB_NAME}' (serviço '${SERVICE}')...
  usuário: ${DB_USER}
  --clean --if-exists --no-owner
MSG

${COMPOSE_CMD} exec -T "${SERVICE}" env PGPASSWORD="${DB_PASSWORD}" \
  pg_restore -U "${DB_USER}" -d "${DB_NAME}" --clean --if-exists --no-owner "${CONTAINER_PATH}"

echo "Restauração concluída com sucesso."
