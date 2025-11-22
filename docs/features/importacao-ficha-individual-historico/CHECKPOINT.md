[ ] **IMPORTANTE**: TODA funcionalidade própria da categoria de importação apenas será criada SOB MINHA ACEITAÇÃO. Do contrário, a funcionalidade de importação de Ficha Individual

[ ] CP1: Preparar a criação na UI do Painel de Migração a seção específica para a importação de Ficha Individual - Histórico:
  - AVISO: Sendo a primeira ação modificar a UI, toda demanda de backend será mockada por enquanto.
  CP1.1: Abstrair o componente da seção de importação, fazendo a seguinte modificação pontual:
    CP1.1.1: Se formos observar, no modelo atual, há uma caixa relativa ao drop de arquivos, com o botão "Selecionar arquivos". E abaixo há a área de visualização dos dados importados.
    [ ] CP1.1.2: O que será modificado:
      [ ] CP1.1.2.1: A área de drop de arquivos corresponderá a TODA a área do painel de migração, e não apenas a uma caixa dentro dela, havendo no topo essa informação.
      [ ] CP1.1.2.2: Cada categoria de importação (Ata de Resultados Finais, Ficha Individual - Histórico) corresponderá a uma seção distinta dentro do painel de migração, contendo:
        [ ] CP1.1.2.3: O título da seção;
        [ ] CP1.1.2.4: O botão "Selecionar arquivos" específico para essa categoria;
        [ ] CP1.1.2.5: A área de visualização resumida dos dados importados, específica para essa categoria.
          [ ] CP1.1.2.5.1: Para a categoria de Ata de Resultados Finais, essa área já existe. NENHUMA modificação será feita nela.
          [ ] CP1.1.2.5.2: Para a categoria de Ficha Individual - Histórico, no momento, apenas um aviso de quantidade de arquivos importados por turma por ano letivo, sem detalhamento por modal.
            [ ] CP1.1.2.5.2.1: Além disso, apenas um aviso textual de que a visualização dos status estará disponível no painel de Gestão do Aluno.
[ ] CP2: ESTABELECER uma ordem para a implementação do backend, SEMPRE OBSERVANDO que toda implementação será baseada em DRY (Don't Repeat Yourself), ou seja, reaproveitando o máximo possível do que já existe para a categoria de Ata de Resultados Finais.

*A partir de CP3, os checpoints se darão com base na análise provinda do que está em CP2*