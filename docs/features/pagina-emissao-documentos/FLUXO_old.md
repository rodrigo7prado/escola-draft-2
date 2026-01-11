# Fluxos - Página de Emissão de Documentos

## Visão Geral

A Página de Emissão de Documentos permite selecionar alunos para emissão em lote, separando a listagem em duas categorias: `Alunos Concluintes` e `Alunos Pedentes`. A interface oferece um `Campo de Pesquisa com Autocompletar com Coringa` e filtros por `Modalidade de Curso` e `Turma (Modo Abreviado)`, com `Turmas Ordenadas Numericamente`.

As listas são exibidas em duas sublistas na lateral, com seleção por checkbox. A área principal apresenta filtros e um espaço para a emissão de documentos, que atualmente permanece como placeholder visual.

---

## F1. Carregar e Exibir Listas de Alunos

Ao acessar a página, o usuário visualiza duas listas: uma de `Alunos Concluintes` e outra de `Alunos Pedentes` (rotulada na UI como "Alunos Pendentes"). Cada aluno aparece com nome e matrícula.

### Mecanismo Interno

- A página consome o endpoint `/api/alunos-concluintes`.
- O backend separa alunos da última série por `Modalidade de Curso` e ano letivo, identificando `Alunos Concluintes` pela situação final "APROVADO".
- Alunos com status de cancelamento são excluídos, garantindo que a lista de `Alunos Pedentes` contenha apenas alunos não cancelados e não concluintes.
- O retorno inclui apenas as enturmações da última série, usadas nos filtros da interface.

---

## F2. Buscar Alunos com Autocompletar e Coringa

O usuário digita no `Campo de Pesquisa com Autocompletar com Coringa` para encontrar alunos por nome ou matrícula, com suporte ao uso de `*` como coringa. Sugestões aparecem abaixo do campo, e ao clicar em uma sugestão o texto é preenchido automaticamente.

### Mecanismo Interno

- A busca é aplicada no client, filtrando nome ou matrícula.
- O caractere `*` é convertido em regex case-insensitive para ampliar a pesquisa.
- As sugestões são limitadas para manter a lista enxuta.

---

## F3. Filtrar por Modalidade e Turma

O usuário pode filtrar a listagem por `Modalidade de Curso` e por `Turma (Modo Abreviado)`, reduzindo a lista exibida conforme os filtros selecionados.

### Mecanismo Interno

- As modalidades são derivadas da enturmação principal de cada aluno e normalizadas para rótulos legíveis.
- As turmas são exibidas em `Turma (Modo Abreviado)` e ordenadas como `Turmas Ordenadas Numericamente`.
- A opção "Todas" permite visualizar a lista completa dentro da modalidade selecionada.

---

## F4. Selecionar Alunos para Emissão

O usuário marca checkboxes para compor o conjunto de alunos a emitir. A seleção permanece ativa mesmo quando filtros são ajustados.

### Mecanismo Interno

- A seleção é mantida por um `Set` de IDs de alunos.
- Quando a lista é recarregada, IDs que não existem mais são removidos da seleção.

---

## F5. Área de Emissão de Documentos (placeholder)

A seção principal exibe o título "Emissão de Documentos" e um conteúdo de placeholder ("Mock vazio").

### Mecanismo Interno

- Ainda não há lógica de emissão implementada nesta seção.

---

## Observações

- A UI usa o rótulo "Alunos Pendentes" para a lista de `Alunos Pedentes`.
- A emissão efetiva de documentos ainda não foi implementada no conteúdo principal da página.
