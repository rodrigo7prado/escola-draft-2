# Schema do Contexto de Sessão

Arquivo de referência para o formato do arquivo `docs/.session-context.json`

## Propósito

Manter contexto determinístico e completo entre sessões do Claude Code, permitindo restauração precisa do estado de trabalho.

## Localização

`docs/.session-context.json`

## Schema Completo

```json
{
  "version": "1.0",
  "lastUpdate": "ISO 8601 timestamp",
  "sessionId": "UUID da sessão (opcional)",

  "context": {
    "feature": "nome-da-feature-atual",
    "checkpoint": "identificador do checkpoint (ex: CP3.2)",
    "branch": "nome do branch git"
  },

  "files": {
    "explored": [
      {
        "path": "caminho/relativo/arquivo.ts",
        "reason": "por que explorei este arquivo",
        "timestamp": "quando foi explorado"
      }
    ],
    "modified": ["lista de arquivos modificados"],
    "toReview": ["arquivo.ts:42-58", "outro.ts:100"]
  },

  "decisions": [
    {
      "id": "auto-incrementado ou timestamp",
      "what": "descrição da decisão tomada",
      "why": "motivação/razão",
      "alternative": "o que NÃO escolhemos",
      "tradeoff": "trade-offs envolvidos",
      "timestamp": "ISO 8601",
      "category": "architecture|pattern|library|naming|refactor|other"
    }
  ],

  "knowledge": {
    "codebaseInsights": [
      {
        "insight": "descrição do aprendizado sobre o codebase",
        "location": "onde isso se aplica",
        "timestamp": "quando descobrimos"
      }
    ],
    "patterns": [
      {
        "pattern": "descrição do padrão usado no projeto",
        "example": "arquivo ou linha de exemplo",
        "timestamp": "quando identificamos"
      }
    ]
  },

  "blockers": [
    {
      "id": "auto-incrementado",
      "what": "descrição do bloqueio",
      "status": "active|resolved|workaround",
      "solution": "como resolvemos (se resolvido)",
      "workaround": "solução temporária (se aplicável)",
      "timestamp": "quando surgiu"
    }
  ],

  "todos": [
    {
      "task": "descrição da tarefa",
      "status": "pending|in_progress|completed",
      "subtasks": [
        {"task": "subtarefa", "status": "pending"}
      ]
    }
  ],

  "nextSession": {
    "priority": "o que deve ser feito primeiro",
    "startAt": "arquivo.ts ou localização específica",
    "needsReview": ["pontos que precisam decisão"],
    "context": "contexto adicional para próxima sessão"
  },

  "environment": {
    "nodeVersion": "versão do node",
    "packageManager": "pnpm|npm|yarn",
    "relevantDeps": ["dependências importantes para contexto"]
  },

  "testStatus": {
    "lastRun": "timestamp",
    "passing": true/false,
    "failingTests": ["lista de testes falhando"],
    "coverage": "informação de cobertura se relevante"
  },

  "gitStatus": {
    "uncommittedChanges": true/false,
    "stagedFiles": ["arquivos staged"],
    "unstagedFiles": ["arquivos unstaged"],
    "untrackedFiles": ["arquivos untracked"]
  }
}
```

## Notas

- Todas as decisões são salvas, independente da trivialidade
- Timestamps em formato ISO 8601
- Arrays podem estar vazios mas devem existir
- Campo `version` permite evolução futura do schema