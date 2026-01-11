- Apenas seguir TECNICO.md;

Sessão 1 (implementação do fluxo F1) - Feature: Página de Emissão de Documentos

## Checkpoints
[x] CP1: Adicionar acesso no Menu Principal para a página de Emissão de Documentos
  [x] → TEC5: Menu principal global no layout

Sessão 2 (backend e listagem de concluintes) - Feature: Página de Emissão de Documentos

## Checkpoints
[x] CP2: Criar endpoint de alunos concluintes
  [x] T2.1: Filtrar por `situacaoFinal="APROVADO"`
  [x] T2.2: Permitir filtros por enturmação (anoLetivo, modalidade, turma, serie)
  [x] → TEC6: Endpoint alunos-concluintes

[x] CP3: Exibir lista e busca de alunos concluintes
  [x] T3.1: Campo de pesquisa com autocompletar e coringa
  [x] T3.2: Agrupar por hierarquia (Ano Letivo → Modalidade → Turma → Aluno)
  [x] T3.3: Turma em modo abreviado + ordenação numérica
  [x] → TEC7: Busca com coringa no client
  [x] → TEC8: Agrupamento e ordenação de turmas
