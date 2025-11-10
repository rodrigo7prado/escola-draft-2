#!/usr/bin/env bash

# Script para aplicar migrations em TODOS os bancos de dados
# Uso:
#   ./scripts/migrate-all.sh dev "nome_da_migration"  # Cria nova migration e aplica em ambos
#   ./scripts/migrate-all.sh deploy                    # Aplica migrations pendentes em ambos

set -e  # Parar em caso de erro

MODE=$1
MIGRATION_NAME=$2

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo ""
echo -e "${BLUE}🔄 Aplicando migrations em TODOS os bancos de dados${NC}"
echo ""

# Ler URLs do .env
if [ ! -f .env ]; then
  echo -e "${RED}❌ Arquivo .env não encontrado!${NC}"
  exit 1
fi

source .env

if [ -z "$DATABASE_URL" ]; then
  echo -e "${RED}❌ DATABASE_URL não definida no .env${NC}"
  exit 1
fi

if [ -z "$DATABASE_URL_TEST" ]; then
  echo -e "${RED}❌ DATABASE_URL_TEST não definida no .env${NC}"
  exit 1
fi

echo -e "${YELLOW}📊 Bancos de dados detectados:${NC}"
echo "  1. Banco principal: $(echo $DATABASE_URL | grep -oP 'localhost:\d+/\K[^?]+')"
echo "  2. Banco de testes: $(echo $DATABASE_URL_TEST | grep -oP 'localhost:\d+/\K[^?]+')"
echo ""

# Função para aplicar migrations
apply_migrations() {
  local mode=$1
  local db_name=$2
  local db_url=$3
  local migration_name=$4

  echo -e "${BLUE}🔹 Aplicando em: ${db_name}${NC}"

  if [ "$mode" = "dev" ]; then
    if [ -z "$migration_name" ]; then
      echo -e "${RED}❌ Nome da migration não fornecido!${NC}"
      echo "Uso: ./scripts/migrate-all.sh dev \"nome_da_migration\""
      exit 1
    fi

    # migrate dev: cria nova migration
    if [ "$db_name" = "principal" ]; then
      # Só cria a migration uma vez (no banco principal)
      DATABASE_URL=$db_url pnpm prisma migrate dev --name "$migration_name"
    else
      # No banco de testes, só aplica (não cria novamente)
      DATABASE_URL=$db_url pnpm prisma migrate deploy
    fi
  else
    # migrate deploy: aplica migrations pendentes
    DATABASE_URL=$db_url pnpm prisma migrate deploy
  fi

  echo -e "${GREEN}✅ Concluído: ${db_name}${NC}"
  echo ""
}

# Aplicar migrations conforme o modo
if [ "$MODE" = "dev" ]; then
  echo -e "${YELLOW}📝 Modo: Desenvolvimento (criar nova migration)${NC}"
  echo ""

  apply_migrations "dev" "principal" "$DATABASE_URL" "$MIGRATION_NAME"
  apply_migrations "dev" "teste" "$DATABASE_URL_TEST" "$MIGRATION_NAME"

elif [ "$MODE" = "deploy" ]; then
  echo -e "${YELLOW}📦 Modo: Deploy (aplicar migrations pendentes)${NC}"
  echo ""

  apply_migrations "deploy" "principal" "$DATABASE_URL"
  apply_migrations "deploy" "teste" "$DATABASE_URL_TEST"

else
  echo -e "${RED}❌ Modo inválido: $MODE${NC}"
  echo ""
  echo "Uso:"
  echo "  ${GREEN}./scripts/migrate-all.sh dev \"nome_da_migration\"${NC}  # Criar nova migration"
  echo "  ${GREEN}./scripts/migrate-all.sh deploy${NC}                      # Aplicar migrations pendentes"
  exit 1
fi

echo ""
echo -e "${GREEN}✅ Migrations aplicadas em todos os bancos!${NC}"
echo ""

# Verificar status final
echo -e "${BLUE}📊 Status final:${NC}"
echo ""
echo "Banco principal:"
DATABASE_URL=$DATABASE_URL pnpm prisma migrate status | tail -5
echo ""
echo "Banco de testes:"
DATABASE_URL=$DATABASE_URL_TEST pnpm prisma migrate status | tail -5