---
description: Valida rastreabilidade técnica entre código e documentação
---

Você deve executar a validação completa do sistema de rastreabilidade técnica (TEC) do IDD.

## Objetivo

Verificar a integridade do sistema de rastreabilidade técnica, garantindo que:
- Todos os comentários `[FEAT:*_TEC*]` no código têm entrada correspondente no TECNICO.md
- Todas as entradas TEC no TECNICO.md têm ao menos uma referência no código
- Referências de arquivos no TECNICO.md apontam para arquivos existentes
- Não há inconsistências entre código e documentação

## Processo de Validação

### 1. Identificar Features com TECNICO.md

```bash
find docs/features -name "TECNICO.md" -type f
```

Para cada feature encontrada (ex: `emissao-documentos`):

### 2. Buscar Comentários TEC no Código

```bash
# Buscar todos os comentários [FEAT:nome-feature_TEC*] no código
grep -rn "\[FEAT:nome-feature_TEC" src/
```

Extrair lista de referências TEC do código (ex: TEC1, TEC1.2, TEC2, etc.)

### 3. Buscar Entradas TEC no TECNICO.md

```bash
# Buscar todas as entradas ## TEC* ou ### TEC* no TECNICO.md
grep -n "^##\+ TEC" docs/features/nome-feature/TECNICO.md
```

Extrair lista de entradas TEC documentadas (ex: TEC1, TEC1.1, TEC1.2, TEC2, etc.)

### 4. Validar Referências de Arquivos

Para cada entrada TEC no TECNICO.md:
- Verificar seção "**Referências no Código:**"
- Extrair caminhos de arquivos mencionados (ex: `src/components/Foo.tsx:42`)
- Verificar se arquivos existem

### 5. Identificar Problemas

Compare as listas e identifique:

**Erros Críticos:**
- ❌ Comentário `[FEAT:*_TECX]` no código mas TEC X não existe no TECNICO.md
- ❌ Entrada TEC X no TECNICO.md mas nenhuma referência no código
- ❌ Arquivo referenciado no TECNICO.md não existe

**Avisos:**
- ⚠️ Entrada TEC sem seção "Referências no Código"
- ⚠️ Comentário TEC sem resumo (apenas `[FEAT:*_TEC*]` sem texto após)
- ⚠️ Número de linha no TECNICO.md pode estar desatualizado

## Formato de Relatório

### Para Cada Feature Validada

```
=== Feature: emissao-documentos ===

Comentários TEC no código: 6
  - TEC1 (src/components/DadosAlunoEmissao.tsx:47)
  - TEC1.2 (src/components/DadosAlunoEmissao.tsx:165)
  - TEC1.3 (src/components/DadosAlunoEmissao.tsx:82)
  - TEC2 (src/components/pdf/templates/TemplateCertidao.tsx:1)
  - TEC4 (src/components/pdf/templates/TemplateCertidao.tsx:4)
  - TEC5 (src/components/pdf/templates/TemplateCertidao.tsx:6)

Entradas TEC no TECNICO.md: 6
  - TEC1 (linha 7)
  - TEC1.1 (linha 26)
  - TEC1.2 (linha 47)
  - TEC1.3 (linha 72)
  - TEC2 (linha 92)
  - TEC3 (linha 113)

❌ ERRO: TEC6 comentado em código mas não existe no TECNICO.md
  Arquivo: src/components/pdf/templates/TemplateCertidao.tsx:11
  Comentário: // [FEAT:emissao-documentos_TEC6] Formatters centralizados

❌ ERRO: TEC3 documentado mas sem referências no código
  Localização: docs/features/emissao-documentos/TECNICO.md:113

⚠️ AVISO: TEC4 não lista referências de código
  Localização: docs/features/emissao-documentos/TECNICO.md:139
```

### Resumo Final

```
=== RESUMO GERAL ===

Features validadas: 4
  ✓ importacao-por-colagem (0 erros)
  ✗ emissao-documentos (2 erros, 1 aviso)
  ✓ sistema-fases-gestao-alunos (0 erros)
  ✓ importacao-ficha-individual-historico (0 erros)

Total de comentários TEC no código: 15
Total de entradas TEC documentadas: 14

Erros críticos: 2
Avisos: 1

❌ VALIDAÇÃO FALHOU
```

## Script de Validação Bash

Use este script como base para automatizar:

```bash
#!/bin/bash
# Script de validação de rastreabilidade TEC

ERRO_COUNT=0
AVISO_COUNT=0

echo "=== VALIDAÇÃO DE RASTREABILIDADE TÉCNICA ==="
echo ""

# Para cada feature com TECNICO.md
for tecnico_path in docs/features/*/TECNICO.md; do
  feature_name=$(basename $(dirname "$tecnico_path"))

  echo "=== Feature: $feature_name ==="

  # Buscar comentários TEC no código
  grep -rn "\[FEAT:${feature_name}_TEC" src/ > /tmp/tec_codigo.txt 2>/dev/null || true

  # Buscar entradas TEC no TECNICO.md
  grep -n "^##\+ TEC" "$tecnico_path" > /tmp/tec_doc.txt 2>/dev/null || true

  # Extrair IDs TEC do código
  if [ -s /tmp/tec_codigo.txt ]; then
    sed -E 's/.*\[FEAT:[^_]+_TEC([0-9.]+)\].*/TEC\1/' /tmp/tec_codigo.txt | sort -u > /tmp/tec_codigo_ids.txt
    echo "Comentários TEC no código: $(wc -l < /tmp/tec_codigo_ids.txt)"
    cat /tmp/tec_codigo_ids.txt | sed 's/^/  - /'
  else
    echo "Comentários TEC no código: 0"
  fi

  echo ""

  # Extrair IDs TEC da documentação
  if [ -s /tmp/tec_doc.txt ]; then
    sed -E 's/^[0-9]+:##+ (TEC[0-9.]+):.*/\1/' /tmp/tec_doc.txt | sort -u > /tmp/tec_doc_ids.txt
    echo "Entradas TEC no TECNICO.md: $(wc -l < /tmp/tec_doc_ids.txt)"
    cat /tmp/tec_doc_ids.txt | sed 's/^/  - /'
  else
    echo "Entradas TEC no TECNICO.md: 0"
  fi

  echo ""

  # Verificar inconsistências
  if [ -s /tmp/tec_codigo_ids.txt ] && [ -s /tmp/tec_doc_ids.txt ]; then
    # TEC no código mas não na doc
    comm -23 /tmp/tec_codigo_ids.txt /tmp/tec_doc_ids.txt > /tmp/tec_missing_doc.txt
    if [ -s /tmp/tec_missing_doc.txt ]; then
      while read tec_id; do
        echo "❌ ERRO: $tec_id comentado no código mas não existe no TECNICO.md"
        grep -n "\[FEAT:${feature_name}_${tec_id}\]" src/ -r | head -1 | sed 's/^/  /'
        ERRO_COUNT=$((ERRO_COUNT + 1))
      done < /tmp/tec_missing_doc.txt
      echo ""
    fi

    # TEC na doc mas não no código
    comm -13 /tmp/tec_codigo_ids.txt /tmp/tec_doc_ids.txt > /tmp/tec_missing_code.txt
    if [ -s /tmp/tec_missing_code.txt ]; then
      while read tec_id; do
        echo "❌ ERRO: $tec_id documentado mas sem referências no código"
        grep -n "^##\+ ${tec_id}:" "$tecnico_path" | sed "s|^|  ${tecnico_path}:|"
        ERRO_COUNT=$((ERRO_COUNT + 1))
      done < /tmp/tec_missing_code.txt
      echo ""
    fi
  fi

  echo "---"
  echo ""
done

# Limpar arquivos temporários
rm -f /tmp/tec_*.txt

# Resumo final
echo "=== RESUMO FINAL ==="
echo "Erros críticos: $ERRO_COUNT"
echo "Avisos: $AVISO_COUNT"
echo ""

if [ $ERRO_COUNT -gt 0 ]; then
  echo "❌ VALIDAÇÃO FALHOU"
  exit 1
else
  echo "✅ VALIDAÇÃO OK"
  exit 0
fi
```

## Após Validação

### Se houver erros críticos:

1. **TEC comentado mas não documentado:**
   - Ofereça criar entrada no TECNICO.md com template básico
   - Peça ao usuário para preencher Motivação e Alternativas

2. **TEC documentado mas não referenciado:**
   - Pergunte se TEC deve ser removido
   - Ou se comentário deve ser adicionado ao código

3. **Arquivo referenciado não existe:**
   - Atualize referências no TECNICO.md com caminhos corretos

### Se houver apenas avisos:

- Informe o usuário
- Sugira melhorias opcionais
- Não bloqueie workflow

### Se validação OK:

```
✅ Rastreabilidade técnica validada com sucesso!

3 features verificadas
12 decisões técnicas rastreadas
Todas as referências consistentes
```

## Executando Manualmente

O usuário pode executar este comando:

```bash
# Validar todas as features
bash scripts/validate-tec.sh

# Validar feature específica
bash scripts/validate-tec.sh emissao-documentos
```

## Integração com Workflow

Este skill deve ser usado:
- ✅ Ao final de cada sessão de implementação com decisões técnicas
- ✅ Antes de fazer commit de mudanças em features com TECNICO.md
- ✅ Durante code review para verificar consistência
- ✅ Periodicamente para manter rastreabilidade atualizada

## Notas Importantes

- **NÃO** execute correções automáticas sem confirmar com o usuário
- **SEMPRE** mostre o relatório completo antes de propor mudanças
- **PRIORIZE** erros críticos sobre avisos
- **MANTENHA** tom colaborativo ao reportar inconsistências

## Referências

- [docs/IDD.md](../../docs/IDD.md) - Metodologia IDD
- [docs/RASTREABILIDADE_TECNICA.md](../../docs/RASTREABILIDADE_TECNICA.md) - Guia de rastreabilidade