# Comando: Salvar Contexto da Sessão

Salva snapshot completo do contexto atual em `docs/.session-context.json` para restauração determinística em sessões futuras.

## Objetivo

Capturar TODO o estado da sessão de forma estruturada e determinística:
- Decisões tomadas (TODAS, sem filtro)
- Arquivos explorados/modificados
- Conhecimento adquirido sobre o codebase
- Bloqueios encontrados e resoluções
- TODOs atuais
- Próximos passos

## Passos

### 1. Coletar informações do contexto atual

**Context básico:**
- Feature atual (ler de docs/IDD.md se possível)
- Checkpoint relacionado (se houver)
- Branch git atual (`git branch --show-current`)

**Arquivos:**
- Listar arquivos que foram lidos/explorados nesta sessão
- Arquivos modificados (`git status`)
- Arquivos que precisam review

**Git Status:**
- Uncommitted changes (`git status --porcelain`)
- Staged/unstaged/untracked files

**Test Status:**
- Se testes foram rodados, capturar resultado
- Testes falhando (se houver)

**Environment:**
- Node version
- Package manager (pnpm neste projeto)
- Dependências relevantes mencionadas na sessão

### 2. Perguntar ao usuário

**Contexto que só o usuário sabe:**
- "Qual a prioridade para a próxima sessão?"
- "Há algum ponto que precisa de revisão ou decisão?"
- "Algum contexto adicional importante para próxima sessão?"

### 3. Consolidar com contexto existente

- Ler `docs/.session-context.json` (se existir)
- Mesclar com dados novos da sessão atual
- Preservar histórico de decisões/insights
- Atualizar status de blockers
- Atualizar TODOs

### 4. Gerar JSON estruturado

Seguir exatamente o schema de `docs/CONTEXT_SCHEMA.md`:
- Todos os campos obrigatórios
- Arrays vazios quando não houver dados
- Timestamps em ISO 8601
- IDs únicos para decisions/blockers

### 5. Salvar arquivo

- Gravar em `docs/.session-context.json`
- Formatar JSON com indentação (2 espaços)
- Confirmar salvamento com usuário

### 6. Resumo para o usuário

Mostrar:
- Quantas decisões foram salvas
- Quantos arquivos rastreados
- Quantos insights capturados
- Status dos TODOs
- Próxima prioridade definida

## Formato de Saída

```
✅ Contexto salvo em docs/.session-context.json

📊 Resumo:
- Decisões capturadas: X
- Arquivos rastreados: Y
- Insights do codebase: Z
- TODOs: A pendentes, B concluídos
- Próxima prioridade: [descrição]

🔄 Use /context-load na próxima sessão para restaurar este contexto.
```

## Importante

- Salvar TODAS as decisões, sem filtro de importância
- Manter histórico (não sobrescrever, mesclar)
- Tom acolhedor mas conciso
- Garantir JSON válido sempre
- Referenciar schema para consistência