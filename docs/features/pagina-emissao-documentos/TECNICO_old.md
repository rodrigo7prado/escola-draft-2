# Decisões Técnicas - Página de Emissão de Documentos

*Este arquivo é criado e mantido pelo Codex durante a implementação.*

---

## Separação entre `Alunos Concluintes` e `Alunos Pedentes`

A API classifica os alunos retornando duas listas separadas, excluindo `Alunos Cancelados` e garantindo que apenas alunos na última série sejam considerados.

**Motivação:**
Manter a distinção de negócio entre alunos aprovados e alunos pendentes, evitando emissão para alunos cancelados.

**Implementação:**
- `src/app/api/alunos-concluintes/route.ts:91` - Calcula a última série por ano/modalidade para identificar enturmações finais.
- `src/app/api/alunos-concluintes/route.ts:116` - Exclui `Alunos Cancelados` com base em campos de encerramento.
- `src/app/api/alunos-concluintes/route.ts:122` - Marca `Alunos Concluintes` pela situação final "APROVADO" na última série.
- `src/app/api/alunos-concluintes/route.ts:142` - Separa concluintes e pendentes no payload final.

**Termos relacionados:**
- `Alunos Concluintes` - [principal.md](../../../.ai/glossario/principal.md#alunos-concluintes)
- `Alunos Pedentes` - [principal.md](../../../.ai/glossario/principal.md#alunos-elegiveis-para-emissao-de-documentos)
- `Alunos Cancelados` - [principal.md](../../../.ai/glossario/principal.md#alunos-cancelados)

**Alternativas consideradas:**
- ❌ Listar todos os alunos da série final sem separar: reduziria clareza operacional.
- ✅ Separar em duas listas: permite decisão de emissão coerente com o domínio.

---

## Busca com `Campo de Pesquisa com Autocompletar com Coringa`

A busca é feita no client com suporte a `*` e sugestões rápidas para acelerar seleção.

**Motivação:**
Operação em lote exige localizar alunos rapidamente mesmo sem nome completo.

**Implementação:**
- `src/app/emissao-documentos/page.tsx:261` - Campo de busca com placeholder e eventos de foco/blur.
- `src/app/emissao-documentos/page.tsx:209` - Limita sugestões para manter a lista enxuta.
- `src/app/emissao-documentos/page.tsx:281` - Dropdown de sugestões com seleção direta.
- `src/app/emissao-documentos/page.tsx:472` - Converte `*` em regex case-insensitive.

**Termos relacionados:**
- `Campo de Pesquisa com Autocompletar com Coringa` - [campo-de-pesquisa.md](../../../.ai/glossario/campo-de-pesquisa.md#campo-de-pesquisa-com-autocompletar-com-coringa)

**Alternativas consideradas:**
- ❌ Busca exata sem coringa: menos flexível para nomes parciais.
- ✅ Coringa com regex: simples, familiar e suficiente para o volume esperado.

---

## Filtro por `Modalidade de Curso` e `Turma (Modo Abreviado)`

O filtro prioriza legibilidade em listas compactas, exibindo `Turma (Modo Abreviado)` e ordenação numérica.

**Motivação:**
Nomes completos de turma são verbosos e a ordenação alfabética gera sequência incorreta.

**Implementação:**
- `src/app/emissao-documentos/page.tsx:100` - Deriva modalidades com normalização de rótulos.
- `src/app/emissao-documentos/page.tsx:131` - Calcula turmas disponíveis e aplica ordenação numérica.
- `src/app/emissao-documentos/page.tsx:430` - Abrevia turmas mantendo prefixo e número principal.
- `src/app/emissao-documentos/page.tsx:439` - Compara turmas por partes numéricas e textuais.

**Termos relacionados:**
- `Modalidade de Curso` - [hierarquias.md](../../../.ai/glossario/hierarquias.md#modalidade-de-curso)
- `Turma (Modo Abreviado)` - [principal.md](../../../.ai/glossario/principal.md#turma-modo-abreviado)
- `Turmas Ordenadas Numericamente` - [principal.md](../../../.ai/glossario/principal.md#turmas-ordenadas-numericamente)

**Alternativas consideradas:**
- ❌ Exibir turma completa: prejudica a leitura em listas densas.
- ❌ Ordenação alfabética simples: gera sequência incorreta (ex.: IFB-10 antes de IFB-2).
- ✅ Abreviação + ordenação numérica: compacta e consistente.

---

## Seleção Persistente de Alunos

A seleção é mantida mesmo quando filtros mudam, preservando o trabalho do usuário.

**Motivação:**
Usuário precisa combinar alunos de filtros diferentes sem perder seleções já feitas.

**Implementação:**
- `src/app/emissao-documentos/page.tsx:36` - Estado de seleção via `Set`.
- `src/app/emissao-documentos/page.tsx:177` - Limpeza de IDs que não existem mais após refresh.
- `src/app/emissao-documentos/page.tsx:216` - Toggle adiciona/remove IDs do conjunto.

**Termos relacionados:**
- `Alunos Concluintes` - [principal.md](../../../.ai/glossario/principal.md#alunos-concluintes)
- `Alunos Pedentes` - [principal.md](../../../.ai/glossario/principal.md#alunos-elegiveis-para-emissao-de-documentos)

**Alternativas consideradas:**
- ❌ Array de IDs: verificação menos eficiente e maior risco de duplicação.
- ✅ `Set` de IDs: garante unicidade e performance.

---

## `Estilo de UI Ultra-Compacto` na Listagem

A interface prioriza densidade de informação com fontes e espaçamentos reduzidos.

**Motivação:**
A emissão em lote requer visualizar muitos alunos simultaneamente.

**Implementação:**
- `src/app/emissao-documentos/page.tsx:261` - Barra de busca com tipografia reduzida.
- `src/app/emissao-documentos/page.tsx:309` - Cabeçalhos de seção com texto pequeno.
- `src/app/emissao-documentos/page.tsx:250` - Linhas de aluno com `text-[11px]` e padding mínimo.

**Termos relacionados:**
- `Estilo de UI Ultra-Compacto` - [estilos-ui.md](../../../.ai/glossario/estilos-ui.md#estilo-de-ui-ultra-compacto)

**Alternativas consideradas:**
- ❌ Layout espaçado: reduz capacidade de revisão em lote.
- ✅ UI compacta: maximiza a densidade de informação.
