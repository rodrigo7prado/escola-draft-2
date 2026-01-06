# Template de Componente DRY (UI)

Use este template para documentar novos componentes DRY (base ou especializados). Mantenha o formato de definição com `*` para o ID principal.

## Identificação
- **ID DRY:** *`DRY.UI:SEU_COMPONENTE`* (ou `DRY.BASE-UI:` para base)
- **Localização no código:** `/src/.../Componente.tsx`
- **Categoria:** Base | Especializado | Conceito

## Descrição
- Objetivo curto do componente (1–2 frases).
- Escopo: onde pode ser usado, o que não faz.

## API
- **Props:** lista nome/tipo/descrição; defaults se houver.
- **Eventos:** callbacks e quando são disparados.
- **Estado interno:** quando relevante; relação com props.
- **Acessibilidade:** teclas, foco, aria, anúncios.

## Dependências e Composição (opcional)
- Componentes DRY utilizados: `[DRY.UI:ID]`
- Dados/serviços necessários: APIs, hooks, schemas.

## Fluxo de Uso (opcional)
- Passo a passo rápido de interação ou renderização.
- Variantes/modos suportados (se aplicável).

## Checklist de Implementação
- [ ] Cobrir estados de loading/erro/vazio (se aplicável)
- [ ] Testes (unitários ou integração) para casos principais
- [ ] Acessibilidade validada (foco, aria, teclado)
- [ ] Sem lógica de domínio (se for componente base)

## Exemplos (opcional)
- Trechos curtos de uso recomendado.

## Referências Cruzadas
- Relacionados: `[DRY.UI:OUTRO]`, `[DRY.CONCEPT:...]`, `[DRY.OBJECT:...]`
