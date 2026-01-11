# Detecção de Duplicidade (candidatos a DRY)

Ferramenta para apontar blocos de código repetidos que podem virar componentes/trechos DRY.

## Como usar

```bash
pnpm dry:dup
```

Opções:
- `--root src,tests` (default: `src`)
- `--min-lines 6` (tamanho mínimo do bloco)
- `--top 20` (quantidade de resultados exibidos)

Exemplo:
```bash
pnpm dry:dup --root src --min-lines 5 --top 10
```

## Saída
- Lista os blocos duplicados, preview das primeiras linhas e locais (`arquivo:linha`).
- Não retorna código de erro; é diagnóstico.

## Workflow IDD
1. Rodar `pnpm dry:dup` na preparação da sessão (ou antes de refatorar).
2. Para duplicações relevantes, criar checkpoint:
   - `[ ] CPx: Converter bloco duplicado em [DRY.UI:...]`
   - Registrar decisão em `TECNICO.md`.
3. Ao criar novo DRY, documentar com `docs/dry/templates/ui-component.md` e atualizar `pnpm summary:dry`.
