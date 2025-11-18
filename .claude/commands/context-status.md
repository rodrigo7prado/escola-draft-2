# Comando: Ver Status do Contexto

Mostra resumo rápido do contexto atual da sessão sem precisar abrir o arquivo JSON.

## Objetivo

Dar visibilidade rápida do que já foi capturado na sessão:
- Quantas decisões foram tomadas
- Quantos insights descobertos
- Arquivos sendo rastreados
- Blockers ativos
- Status geral

Útil para:
- Checar se está capturando contexto adequadamente
- Ver se esqueceu de registrar algo
- Ter noção do progresso da sessão

## Passos

### 1. Verificar se contexto existe

- Tentar ler `docs/.session-context.json`
- Se não existir: informar e sugerir `/context-save`

### 2. Analisar e contar

Extrair estatísticas:
- Total de decisões
- Total de codebase insights
- Total de patterns identificados
- Arquivos explorados
- Arquivos modificados
- Blockers ativos vs resolvidos
- TODOs por status

### 3. Apresentar resumo visual

```
📊 Status do Contexto da Sessão

🕒 Última atualização: [tempo relativo, ex: "há 15 minutos"]
🎯 Feature: [nome]
📍 Checkpoint: [id]
🌿 Branch: [nome]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 Decisões: X total
   • Architecture: A
   • Pattern: B
   • Library: C
   • Naming: D
   • Refactor: E
   • Other: F

💡 Conhecimento: Y total
   • Codebase Insights: G
   • Patterns: H

📁 Arquivos:
   • Explorados: I
   • Modificados: J
   • Para review: K

🚧 Blockers:
   • Ativos: L
   • Resolvidos: M

✅ TODOs:
   • ⏳ Pendentes: N
   • 🔄 Em progresso: O
   • ✅ Concluídos: P

🎯 Próxima prioridade: [descrição breve]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💾 Contexto será salvo automaticamente ao final da sessão.
   Use /context-save para salvar manualmente agora.
```

### 4. Destacar avisos (se aplicável)

**Se há muito tempo sem salvar:**
```
⚠️  Última atualização foi há 2 horas.
   Considere usar /context-save para não perder progresso.
```

**Se há decisões não categorizadas:**
```
ℹ️  X decisões estão categorizadas como "other".
   Considere revisar categorização.
```

**Se não há decisões/insights ainda:**
```
ℹ️  Nenhuma decisão registrada ainda nesta sessão.
   Use /context-decision quando tomar decisões técnicas.
```

## Variações

### Modo compacto (futuro):
```
/context-status --compact
```
Apenas números, sem detalhes.

### Modo detalhado (futuro):
```
/context-status --detailed
```
Lista todas as decisões/insights (como /context-load mas só leitura).

## Importante

- Resposta rápida (não interromper fluxo)
- Visual e fácil de escanear
- Dar dicas úteis baseado no estado
- Encorajar captura de contexto
- Tom positivo e construtivo