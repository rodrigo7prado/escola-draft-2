#!/bin/bash
# Script de validação de rastreabilidade TEC
# Verifica consistência entre comentários [FEAT:*_TEC*] no código e entradas no TECNICO.md

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

ERRO_COUNT=0
AVISO_COUNT=0
FEATURE_COUNT=0
TEC_CODIGO_TOTAL=0
TEC_DOC_TOTAL=0

echo -e "${BLUE}=== VALIDAÇÃO DE RASTREABILIDADE TÉCNICA ===${NC}"
echo ""

# Criar diretório temporário
TMP_DIR=$(mktemp -d)
trap "rm -rf $TMP_DIR" EXIT

# Se feature específica for passada como argumento
FEATURE_FILTER="$1"

# Para cada feature com TECNICO.md
for tecnico_path in docs/features/*/TECNICO.md; do
  if [ ! -f "$tecnico_path" ]; then
    continue
  fi

  feature_name=$(basename $(dirname "$tecnico_path"))

  # Se filtro foi especificado, pular outras features
  if [ -n "$FEATURE_FILTER" ] && [ "$FEATURE_FILTER" != "$feature_name" ]; then
    continue
  fi

  FEATURE_COUNT=$((FEATURE_COUNT + 1))

  echo -e "${BLUE}=== Feature: $feature_name ===${NC}"

  # Buscar comentários TEC no código
  grep -rn "\[FEAT:${feature_name}_TEC" src/ 2>/dev/null > "$TMP_DIR/tec_codigo_${feature_name}.txt" || true

  # Buscar entradas TEC no TECNICO.md
  grep -En "^##+ TEC[0-9.]+" "$tecnico_path" 2>/dev/null > "$TMP_DIR/tec_doc_${feature_name}.txt" || true

  # Extrair IDs TEC do código
  if [ -s "$TMP_DIR/tec_codigo_${feature_name}.txt" ]; then
    # Extrai IDs únicos (ex: TEC1, TEC1.2, TEC2)
    sed -E 's/.*\[FEAT:[^_]+_TEC([0-9.]+)\].*/TEC\1/' "$TMP_DIR/tec_codigo_${feature_name}.txt" | sort -u > "$TMP_DIR/tec_codigo_ids_${feature_name}.txt"

    codigo_count=$(wc -l < "$TMP_DIR/tec_codigo_ids_${feature_name}.txt")
    TEC_CODIGO_TOTAL=$((TEC_CODIGO_TOTAL + codigo_count))

    echo -e "Comentários TEC no código: ${GREEN}${codigo_count}${NC}"

    # Mostrar lista com localizações
    while read tec_id; do
      location=$(grep "\[FEAT:${feature_name}_${tec_id}\]" "$TMP_DIR/tec_codigo_${feature_name}.txt" | head -1 | cut -d':' -f1-2)
      echo "  - $tec_id ($location)"
    done < "$TMP_DIR/tec_codigo_ids_${feature_name}.txt"
  else
    echo -e "Comentários TEC no código: ${YELLOW}0${NC}"
  fi

  echo ""

  # Extrair IDs TEC da documentação
  if [ -s "$TMP_DIR/tec_doc_${feature_name}.txt" ]; then
    # Extrai IDs únicos (ex: TEC1, TEC1.2, TEC2)
    sed -E 's/^[0-9]+:##+ (TEC[0-9.]+):.*/\1/' "$TMP_DIR/tec_doc_${feature_name}.txt" | sort -u > "$TMP_DIR/tec_doc_ids_${feature_name}.txt"

    doc_count=$(wc -l < "$TMP_DIR/tec_doc_ids_${feature_name}.txt")
    TEC_DOC_TOTAL=$((TEC_DOC_TOTAL + doc_count))

    echo -e "Entradas TEC no TECNICO.md: ${GREEN}${doc_count}${NC}"

    # Mostrar lista com linhas
    while read tec_id; do
      line=$(grep -n "^##\+ ${tec_id}:" "$tecnico_path" | head -1 | cut -d':' -f1)
      echo "  - $tec_id (linha $line)"
    done < "$TMP_DIR/tec_doc_ids_${feature_name}.txt"
  else
    echo -e "Entradas TEC no TECNICO.md: ${YELLOW}0${NC}"
  fi

  echo ""

  # Verificar inconsistências
  if [ -s "$TMP_DIR/tec_codigo_ids_${feature_name}.txt" ] && [ -s "$TMP_DIR/tec_doc_ids_${feature_name}.txt" ]; then
    # TEC no código mas não na doc
    comm -23 "$TMP_DIR/tec_codigo_ids_${feature_name}.txt" "$TMP_DIR/tec_doc_ids_${feature_name}.txt" > "$TMP_DIR/tec_missing_doc_${feature_name}.txt"
    if [ -s "$TMP_DIR/tec_missing_doc_${feature_name}.txt" ]; then
      while read tec_id; do
        echo -e "${RED}❌ ERRO: $tec_id comentado no código mas não existe no TECNICO.md${NC}"
        grep -n "\[FEAT:${feature_name}_${tec_id}\]" src/ -r 2>/dev/null | head -1 | sed 's/^/  Arquivo: /'
        ERRO_COUNT=$((ERRO_COUNT + 1))
      done < "$TMP_DIR/tec_missing_doc_${feature_name}.txt"
      echo ""
    fi

    # TEC na doc mas não no código
    comm -13 "$TMP_DIR/tec_codigo_ids_${feature_name}.txt" "$TMP_DIR/tec_doc_ids_${feature_name}.txt" > "$TMP_DIR/tec_missing_code_${feature_name}.txt"
    if [ -s "$TMP_DIR/tec_missing_code_${feature_name}.txt" ]; then
      while read tec_id; do
        echo -e "${RED}❌ ERRO: $tec_id documentado mas sem referências no código${NC}"
        grep -n "^##\+ ${tec_id}:" "$tecnico_path" 2>/dev/null | sed "s|^|  ${tecnico_path}:|"
        ERRO_COUNT=$((ERRO_COUNT + 1))
      done < "$TMP_DIR/tec_missing_code_${feature_name}.txt"
      echo ""
    fi
  elif [ -s "$TMP_DIR/tec_codigo_ids_${feature_name}.txt" ] && [ ! -s "$TMP_DIR/tec_doc_ids_${feature_name}.txt" ]; then
    echo -e "${RED}❌ ERRO: Feature tem comentários TEC no código mas TECNICO.md está vazio${NC}"
    ERRO_COUNT=$((ERRO_COUNT + $(wc -l < "$TMP_DIR/tec_codigo_ids_${feature_name}.txt")))
    echo ""
  elif [ ! -s "$TMP_DIR/tec_codigo_ids_${feature_name}.txt" ] && [ -s "$TMP_DIR/tec_doc_ids_${feature_name}.txt" ]; then
    echo -e "${YELLOW}⚠️  AVISO: Feature tem TECNICO.md mas nenhum comentário no código${NC}"
    AVISO_COUNT=$((AVISO_COUNT + 1))
    echo ""
  fi

  # Verificar se TECNICO.md tem seção "Referências no Código" para cada TEC
  if [ -s "$TMP_DIR/tec_doc_ids_${feature_name}.txt" ]; then
    while read tec_id; do
      # Extrair bloco do TEC até o próximo TEC ou fim do arquivo
      tec_line=$(grep -n "^##\+ ${tec_id}:" "$tecnico_path" | head -1 | cut -d':' -f1)
      next_tec_line=$(grep -n "^## TEC[0-9]" "$tecnico_path" | grep -A1 "^${tec_line}:" | tail -1 | cut -d':' -f1)

      if [ -z "$next_tec_line" ] || [ "$next_tec_line" = "$tec_line" ]; then
        # Último TEC ou único TEC, vai até o fim
        tec_block=$(tail -n +$tec_line "$tecnico_path")
      else
        # Tem próximo TEC, extrai bloco entre eles
        tec_block=$(sed -n "${tec_line},${next_tec_line}p" "$tecnico_path")
      fi

      # Verifica se tem seção "Referências no Código"
      if ! echo "$tec_block" | grep -q "^\*\*Referências no Código"; then
        echo -e "${YELLOW}⚠️  AVISO: $tec_id não possui seção 'Referências no Código'${NC}"
        echo "  Localização: $tecnico_path:$tec_line"
        AVISO_COUNT=$((AVISO_COUNT + 1))
      fi
    done < "$TMP_DIR/tec_doc_ids_${feature_name}.txt"
  fi

  echo "---"
  echo ""
done

# Resumo final
echo -e "${BLUE}=== RESUMO FINAL ===${NC}"
echo ""
echo "Features validadas: $FEATURE_COUNT"
echo "Total de comentários TEC no código: $TEC_CODIGO_TOTAL"
echo "Total de entradas TEC documentadas: $TEC_DOC_TOTAL"
echo ""
echo -e "Erros críticos: ${RED}${ERRO_COUNT}${NC}"
echo -e "Avisos: ${YELLOW}${AVISO_COUNT}${NC}"
echo ""

if [ $ERRO_COUNT -gt 0 ]; then
  echo -e "${RED}❌ VALIDAÇÃO FALHOU${NC}"
  echo ""
  echo "Para corrigir:"
  echo "  1. Adicione entradas TEC faltantes no TECNICO.md correspondente"
  echo "  2. Ou remova comentários [FEAT:*_TEC*] que não devem estar no código"
  echo "  3. Execute novamente: pnpm validate:tec"
  exit 1
elif [ $AVISO_COUNT -gt 0 ]; then
  echo -e "${YELLOW}⚠️  VALIDAÇÃO OK COM AVISOS${NC}"
  echo ""
  echo "Avisos não bloqueiam workflow, mas recomenda-se corrigir para melhor rastreabilidade."
  exit 0
else
  echo -e "${GREEN}✅ VALIDAÇÃO OK${NC}"
  echo ""
  echo "Rastreabilidade técnica está consistente!"
  exit 0
fi
