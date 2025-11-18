# Comando: Carregar Contexto da Sessão

Restaura contexto completo de `docs/.session-context.json` para continuar trabalho de sessão anterior de forma determinística.

## Objetivo

Restaurar COMPLETAMENTE o estado mental e contexto da sessão anterior:
- Todas as decisões tomadas e seus motivos
- Arquivos que foram explorados
- Conhecimento sobre o codebase
- Bloqueios e suas resoluções
- TODOs pendentes
- Próximos passos planejados

## Passos

### 1. Verificar existência do arquivo

- Checar se `docs/.session-context.json` existe
- Se não existir: informar usuário que não há contexto salvo
- Sugerir usar `/context-save` ao final da sessão

### 2. Ler e validar JSON

- Ler arquivo completo
- Validar estrutura (verificar campos obrigatórios)
- Verificar versão do schema
- Se JSON inválido: reportar erro e pedir correção

### 3. Apresentar resumo do contexto

**Informações gerais:**
```
📂 Contexto da Sessão Anterior
Última atualização: [data/hora]
Feature: [nome]
Checkpoint: [CP.X.Y]
Branch: [nome]
```

**Decisões tomadas:**
- Listar TODAS as decisões com: what, why, alternative, tradeoff
- Mostrar categoria de cada decisão
- Ordenar por timestamp (mais recentes primeiro)

**Conhecimento do codebase:**
- Listar insights descobertos
- Listar padrões identificados
- Mostrar onde se aplicam

**Arquivos relevantes:**
- Arquivos explorados (com motivo)
- Arquivos modificados
- Arquivos que precisam review

**Bloqueios:**
- Listar blockers ativos
- Mostrar blockers resolvidos e suas soluções
- Destacar workarounds temporários

**TODOs:**
- Listar pendentes, em progresso, concluídos
- Mostrar hierarquia (subtasks)

**Próximos passos:**
- Prioridade definida
- Onde começar (arquivo/linha)
- Pontos que precisam revisão

**Status técnico:**
- Versões de ambiente
- Status de testes
- Estado do git

### 4. Restaurar TODOs ativamente

- Usar ferramenta TodoWrite
- Recriar EXATAMENTE os TODOs salvos
- Preservar status (pending/in_progress/completed)
- Manter hierarquia

### 5. Internalizar contexto

**Importante:** Não apenas "ler", mas **absorver** o contexto:
- Entender as decisões e seus motivos
- Reconhecer padrões do projeto
- Estar ciente dos bloqueios
- Saber onde estávamos e para onde vamos

### 6. Confirmar com usuário

Perguntar:
- "Quer continuar de onde paramos?"
- "Alguma decisão anterior precisa ser revisitada?"
- "Devemos seguir a prioridade definida: [X]?"
- "Há algo novo que devemos considerar?"

### 7. Preparar para continuação

- Destacar arquivo/localização onde começar
- Relembrar contexto imediato da última tarefa
- Estar pronto para continuar sem "warmup"

## Formato de Saída

```
📂 Contexto Restaurado de docs/.session-context.json

🕒 Última atualização: 2025-11-18 15:30
🎯 Feature: Importação por colagem
📍 Checkpoint: CP3.2
🌿 Branch: feature/import-paste

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 Decisões Tomadas (X no total):

1. [architecture] Usar regex para validação CPF
   • Por que: Evitar dependência externa
   • Alternativa: Biblioteca validate-cpf
   • Trade-off: Manutenção manual
   • Quando: 2025-11-18 14:20

2. [...]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💡 Conhecimento do Codebase (Y insights):

• Validações ficam em src/utils/
  (Descoberto ao explorar estrutura)

• Usar Zod para schemas de validação
  (Padrão: src/schemas/*.ts)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📁 Arquivos Relevantes:

Explorados:
• src/utils/cpf.ts (validação)
• src/components/Form.tsx (integração)

Modificados:
• src/utils/cpf.ts

Precisam review:
• src/utils/cpf.ts:42-58

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🚧 Bloqueios:

Resolvidos:
✓ Tipo User não tinha campo CPF
  Solução: Adicionado migration

Ativos:
[nenhum]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ TODOs Restaurados:

⏳ Pendentes: A
🔄 Em progresso: B
✅ Concluídos: C

[lista detalhada...]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 Próximos Passos:

Prioridade: Implementar validação servidor
Começar em: src/api/validate-cpf.ts
Precisa revisão: Decisão sobre rate limiting

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔧 Status Técnico:

Node: v20.x | pnpm
Testes: ✓ Passing
Git: 3 uncommitted changes

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💬 Quer continuar de onde paramos ou há algo que devemos ajustar primeiro?
```

## Importante

- Apresentação COMPLETA mas organizada
- Tom acolhedor e claro
- Usar formatação visual (unicode box drawing)
- Destacar informações críticas
- Permitir ajustes antes de continuar
- Absorver contexto, não apenas ler