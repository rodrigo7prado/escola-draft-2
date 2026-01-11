# Skill: /validate-tec

Skill de validação de rastreabilidade técnica entre código e documentação TECNICO.md.

## Uso

### Via Claude Code

```
/validate-tec
```

### Via Linha de Comando

```bash
# Validar todas as features
pnpm validate:tec

# Validar feature específica
bash scripts/validate-tec.sh emissao-documentos
```

## O Que Valida

O skill verifica a consistência do sistema de rastreabilidade técnica:

1. **Comentários → Documentação**
   - Todo comentário `[FEAT:*_TEC*]` no código tem entrada correspondente no TECNICO.md

2. **Documentação → Código**
   - Toda entrada `## TEC*` no TECNICO.md tem ao menos uma referência no código

3. **Referências de Arquivos**
   - Arquivos mencionados na seção "Referências no Código" existem

## Formato do Relatório

### Por Feature

```
=== Feature: emissao-documentos ===

Comentários TEC no código: 9
  - TEC1 (src/components/DadosAlunoEmissao.tsx:47)
  - TEC1.1 (src/components/DadosAlunoEmissao.tsx:122)
  - TEC1.2 (src/components/DadosAlunoEmissao.tsx:166)
  ...

Entradas TEC no TECNICO.md: 9
  - TEC1 (linha 7)
  - TEC1.1 (linha 26)
  - TEC1.2 (linha 47)
  ...
```

### Erros Detectados

```
❌ ERRO: TEC1.1 documentado mas sem referências no código
  docs/features/emissao-documentos/TECNICO.md:26

❌ ERRO: TEC3 comentado no código mas não existe no TECNICO.md
  Arquivo: src/components/Foo.tsx:42
```

### Avisos

```
⚠️  AVISO: TEC4 não possui seção 'Referências no Código'
  Localização: docs/features/emissao-documentos/TECNICO.md:139
```

### Resumo Final

```
=== RESUMO FINAL ===

Features validadas: 4
Total de comentários TEC no código: 15
Total de entradas TEC documentadas: 14

Erros críticos: 2
Avisos: 1

❌ VALIDAÇÃO FALHOU
```

## Exit Codes

- **0** - Validação OK (sem erros ou apenas avisos)
- **1** - Validação falhou (erros críticos encontrados)

## Como Corrigir Erros

### Erro: TEC comentado no código mas não documentado

**Opção 1:** Adicionar entrada no TECNICO.md

```markdown
## TECX: Título da decisão técnica

**Motivação:**
- Por que esta decisão foi tomada

**Alternativas Consideradas:**
- ❌ Alternativa A: Por que não foi escolhida
- ✅ Solução escolhida: Por que foi a melhor opção

**Referências no Código:**
- `caminho/arquivo.ts:linha` - Descrição
```

**Opção 2:** Remover comentário do código (se não for decisão técnica relevante)

### Erro: TEC documentado mas sem referências no código

**Opção 1:** Adicionar comentário no código

```typescript
// [FEAT:nome-feature_TECX] Resumo da decisão
```

**Opção 2:** Remover entrada do TECNICO.md (se não foi implementada)

### Aviso: TEC sem seção "Referências no Código"

Adicionar seção ao final da entrada TEC:

```markdown
**Referências no Código:**
- `src/components/Foo.tsx:42` - Implementação principal
```

## Integração com Workflow

### Quando Executar

✅ **Recomendado:**
- Ao final de cada sessão de implementação com decisões técnicas
- Antes de fazer commit de mudanças em features
- Durante code review
- Periodicamente para manter rastreabilidade

❌ **Não necessário:**
- Durante desenvolvimento iterativo (executar só ao final)
- Em features sem TECNICO.md

### Git Hook (Opcional)

Adicione ao `.husky/pre-commit`:

```bash
#!/bin/bash
# Validar rastreabilidade técnica antes de commit

if git diff --cached --name-only | grep -q "src/"; then
  echo "Validando rastreabilidade técnica..."
  pnpm validate:tec
fi
```

## Exemplo de Uso Completo

### 1. Implementar Feature com Decisões Técnicas

```typescript
// src/components/EmissaoDocumentos.tsx

// [FEAT:emissao-documentos_TEC1] Modal com PDFViewer para prévia
export function EmissaoDocumentos() {
  // implementação...
}
```

### 2. Documentar no TECNICO.md

```markdown
## TEC1: UI de emissão usa Modal genérico com PDFViewer

**Motivação:**
- Usuário precisa revisar antes de imprimir
- Reutilizar componente existente (DRY)

**Alternativas Consideradas:**
- ❌ Abrir em nova aba: Perde contexto
- ✅ Modal: Mantém contexto, melhor UX

**Referências no Código:**
- `src/components/EmissaoDocumentos.tsx:5` - Implementação do modal
```

### 3. Validar Rastreabilidade

```bash
pnpm validate:tec

# Saída:
# ✅ VALIDAÇÃO OK
# Rastreabilidade técnica está consistente!
```

### 4. Corrigir Inconsistências (se houver)

```bash
# Se houver erros, corrigir conforme orientações do relatório
# Exemplo: adicionar comentário TEC3 faltante

# Validar novamente
pnpm validate:tec
```

## Arquivos Envolvidos

- **Skill:** `.claude/commands/validate-tec.md`
- **Script:** `scripts/validate-tec.sh`
- **Package.json:** `"validate:tec": "bash scripts/validate-tec.sh"`

## Limitações

- Não valida se resumo do comentário está correto (apenas presença)
- Não valida se números de linha no TECNICO.md estão atualizados
- Não valida se motivação/alternativas estão bem escritas
- Validação é baseada em padrões de texto (grep)

## Melhorias Futuras

- [ ] Validar se números de linha nas referências estão corretos
- [ ] Sugerir auto-correção de inconsistências simples
- [ ] Integrar com CI/CD para bloquear PRs inconsistentes
- [ ] Gerar relatório HTML visual
- [ ] Validar qualidade das entradas TEC (mínimo de caracteres, etc)

## Referências

- [docs/IDD.md](./IDD.md) - Metodologia IDD
- [docs/RASTREABILIDADE_TECNICA.md](./RASTREABILIDADE_TECNICA.md) - Guia de rastreabilidade
- [docs/features/emissao-documentos/TECNICO.md](./features/emissao-documentos/TECNICO.md) - Exemplo de TECNICO.md validado

---

**Última atualização:** 2026-01-08
**Versão:** 1.0
**Status:** ✅ Funcional e testado
