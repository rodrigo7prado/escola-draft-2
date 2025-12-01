## REGISTROS DE DRY - UI

### Recursos de Confirmação
[ ] 1. [DRY.UI:CONFIRMACAO_POR_DIGITACAO];
    [ ] Procedimento: ABSTRAIR DRY.UI.1.1 e o restante utilizando este modelo.
  Ocorrências:
  - DRY.UI.1.1: Painel de Migração - Ata de Resultados Finais - Confirmação de exclusão de arquivo importado;
  - DRY.UI.1.2: Painel de Migração - Ficha Individual (Histórico) - Confirmação de vínculo de arquivo importado ao aluno;

### Recursos de Feedback Visual
[ ] 2. [DRY.UI:MODAL_INFO_UPLOAD];
  Aplicar:
    Base.UI1: [DRY.BASE-UI:BARRA_PROGRESSO_ASINCRONA];

  Checklist:
    [ ] Um modal com [DRY.BASE-UI:BARRA_PROGRESSO_ASINCRONA] deve ser exibido durante operações assíncronas longas (ex.: importação de múltiplos arquivos);
    [ ] Após a conclusão, o modal deve exibir uma confirmação dos dados de upload (quantidade de arquivos processados, eventuais erros, etc);
    [ ] Deve haver um botão para fechar o modal após a conclusão da operação.

[ ] 3. [DRY.UI:ICONE_PERSONALIZADO_STATUS]
  Checklist:
    [ ] Haverá uma propriedade para definir o qual ícone estará associado ao status em questão;
    [ ] A cor do ícone deve refletir o status (sucesso, erro, pendente): verde para sucesso, vermelho para erro e amarelo para pendência;
    [ ] Deve haver tooltip explicativo ao passar o mouse sobre o ícone, detalhando o status.

[ ] 4. [DRY.UI:AGREGADOR_ICONES_STATUS]
  Aplicar:
    [DRY.UI:ICONE_PERSONALIZADO_STATUS];
  Descrição:
    Componente UI responsável por exibir uma coleção de ícones de status personalizados, representando visualmente o estado de múltiplos processos ou verificações.
  Checklist:
    [ ] Deve aceitar uma uma opção que definirá a orientação (vertical ou horizontal, padrão) dos ícones exibidos;
    [ ] Deve oferecer opções com espaçamentos (inclusive ultracompacto, sendo este o padrão) para exibir os ícones com clareza visual;

### Recursos integrados
[ ] 5. [DRY.UI:ANALISE_COMPLETUDE_DE_DADOS]
  Objetos .ts implementados relacionados:
    - (ainda a definir);
  Descrição:
    Componente UI que analisa e apresenta a completude dos dados importados em relação aos dados existentes no sistema, destacando discrepâncias e pendências.
  Implementação:
    Propriedades:
      - `levelAggregation`: Agregação de dados para análise de completude (Ex.: por aluno, por turma, etc.);
      - `existingData`: Array de objetos representando os dados existentes no sistema;
      - `comparisonCriteria`: Objeto de configuração de critérios de comparação;
      - `analyzedData`: Array de objetos que representa a análise de completude dos dados importados;
    UI:
      - Exibir uma barra de ícones que indicam a completude de cada estágio analisado;
      - Fornecer detalhes adicionais ao passar o mouse sobre cada ícone, explicando o status de completude;
    Configurações:
      - Cores e ícones para os níveis de completude:
        completo: 'verde',
        parcial: 'amarelo', 
        ausente: 'vermelho'