# Comando: Registrar Insight do Codebase

Adiciona um insight/aprendizado sobre o codebase ao contexto da sessão.

## Objetivo

Capturar conhecimento adquirido sobre como o projeto está estruturado, padrões usados, convenções, e qualquer descoberta que ajude a trabalhar mais eficientemente no futuro.

## Quando usar

- Ao descobrir onde ficam certos tipos de arquivo
- Ao identificar um padrão usado no projeto
- Ao entender uma convenção de nomenclatura
- Ao descobrir como algo funciona internamente
- Qualquer "aha moment" sobre o codebase

## Tipos de Insights

### 1. Codebase Insights
Aprendizados gerais sobre estrutura/organização:
- "Validações ficam em src/utils/"
- "Tipos compartilhados em src/types/shared/"
- "Componentes de UI genéricos em src/components/ui/"

### 2. Patterns
Padrões de código identificados:
- "Custom hooks para lógica de formulários"
- "Usar Zod para schemas de validação"
- "Componentes seguem pattern de composição"

## Passos

### 1. Identificar tipo de insight

Perguntar ao usuário:
```
Que tipo de insight você quer registrar?

1. Codebase Insight (estrutura, organização, onde ficam as coisas)
2. Pattern (padrão de código, convenção, best practice)

> [escolha]
```

### 2. Coletar informações

**Para Codebase Insight:**
```
Qual o insight sobre o codebase?
> [resposta]

Onde isso se aplica? (pasta, arquivo, módulo)
> [resposta]
```

**Para Pattern:**
```
Qual o padrão identificado?
> [resposta]

Tem algum exemplo específico? (arquivo ou linha)
> [resposta]
```

### 3. Estruturar insight

**Codebase Insight:**
```json
{
  "insight": "descrição do aprendizado",
  "location": "onde se aplica",
  "timestamp": "ISO 8601"
}
```

**Pattern:**
```json
{
  "pattern": "descrição do padrão",
  "example": "arquivo:linha ou descrição",
  "timestamp": "ISO 8601"
}
```

### 4. Adicionar ao contexto

- Ler `docs/.session-context.json`
- Adicionar ao array apropriado:
  - `knowledge.codebaseInsights[]` ou
  - `knowledge.patterns[]`
- Salvar arquivo

### 5. Confirmar com usuário

**Para Codebase Insight:**
```
✅ Insight registrado!

💡 [insight]
   Localização: [location]

Total de insights: X
```

**Para Pattern:**
```
✅ Pattern registrado!

🎯 [pattern]
   Exemplo: [example]

Total de patterns: Y
```

## Modo Não-Interativo (futuro)

```
/context-insight codebase "Validações em src/utils/" "src/utils/"
/context-insight pattern "Custom hooks para forms" "src/hooks/useForm.ts"
```

## Importante

- Capturar assim que descobrir
- Ser específico sobre localização
- Pode parecer óbvio agora, mas será útil depois
- Ajuda próximas sessões a "lembrar" do projeto
- Constrói conhecimento cumulativo