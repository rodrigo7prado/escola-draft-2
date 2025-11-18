# Comando: Registrar Decisão

Adiciona uma decisão ao contexto da sessão em tempo real.

## Objetivo

Capturar decisões DURANTE a sessão, não apenas ao final. Permite rastrear todas as decisões tomadas (arquiteturais, de padrão, de biblioteca, de naming, etc) sem perder contexto.

## Quando usar

- Logo após tomar uma decisão técnica
- Quando escolher entre alternativas
- Ao definir um padrão a seguir
- Ao rejeitar uma abordagem
- QUALQUER decisão, sem filtro de importância

## Passos

### 1. Perguntar ao usuário (modo interativo)

Se o comando for chamado sem argumentos, perguntar:

```
Vamos registrar uma decisão técnica.

O que foi decidido?
> [resposta do usuário]

Por que essa decisão foi tomada?
> [resposta do usuário]

Qual foi a alternativa considerada (e rejeitada)?
> [resposta do usuário]

Quais os trade-offs envolvidos?
> [resposta do usuário]

Categoria da decisão:
1. Architecture (arquitetura geral)
2. Pattern (padrão de código)
3. Library (escolha de biblioteca/dependência)
4. Naming (nomenclatura/convenção)
5. Refactor (refatoração)
6. Other (outro)
> [número escolhido]
```

### 2. Estruturar decisão

Criar objeto no formato:
```json
{
  "id": "[timestamp-milliseconds]",
  "what": "descrição do que foi decidido",
  "why": "motivação/razão",
  "alternative": "o que NÃO foi escolhido",
  "tradeoff": "trade-offs da decisão",
  "timestamp": "ISO 8601",
  "category": "architecture|pattern|library|naming|refactor|other"
}
```

### 3. Adicionar ao contexto

- Ler `docs/.session-context.json` (se existir, senão criar estrutura base)
- Adicionar decisão ao array `decisions[]`
- Manter ordem cronológica (mais antigas primeiro)
- Salvar arquivo

### 4. Confirmar com usuário

```
✅ Decisão registrada!

📝 [category] O que foi decidido
   • Por que: [why]
   • Alternativa: [alternative]
   • Trade-off: [tradeoff]

Total de decisões na sessão: X
```

## Modo Não-Interativo (futuro)

Permitir passar argumentos diretamente:
```
/context-decision "Usar React Query" "Cache automático" "Redux" "Curva de aprendizado"
```

## Importante

- TODA decisão é importante (não filtrar)
- Capturar imediatamente (não deixar para depois)
- Tom colaborativo e rápido
- Não interromper muito o fluxo de trabalho
- Se usuário não souber categorizar, sugerir