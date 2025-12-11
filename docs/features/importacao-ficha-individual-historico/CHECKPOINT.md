De acordo com o fluxo definido em FLUXO.md, verificar os seguintes checkpoints:
Cada ID de componente DRY (o que estiver entre colchetes) deve buscado e lidado conforme estiver em [summary](/docs/dry/summary.md).
Caso não ocorra correspondência, reportar erro.

## CHECKPOINTS
[ ] CP1: O menu de opções [DRY.UI:OVERFLOW_MENU] na lista de alunos por turma deve conter um ícone de "kebab" que, ao ser clicado, exibe a opção de importar CSV de Ficha Individual - Histórico.
[ ] CP2: A funcionalidade deve permitir a seleção de múltiplos arquivos CSV para importação.
[ ] CP3: Após a confirmação da importação, deve ser exibido um modal de progresso conforme definido em [DRY.UI:MODAL_INFO_UPLOAD], indicando o andamento da análise dos arquivos.
[ ] CP4: O endpoint da API deve receber a matrícula do aluno selecionado na lista de alunos por turma para associar corretamente os dados importados.
[ ] CP5: Ao término da importação, cada aluno deve ser atualizado na UI com um ícone de "check" verde, conforme especificado em [DRY.UI:AGREGADOR_ICONES_STATUS], indicando que a fase de importação do Histórico Escolar foi concluída com sucesso.  
[ ] CP6: Em caso de erros durante a importação, o modal deve exibir uma confirmação dos dados de upload, incluindo a quantidade de arquivos processados e eventuais erros encontrados, conforme definido em [DRY.UI:MODAL_INFO_UPLOAD].  
[ ] CP7: Integrar com o backend para garantir que os dados importados sejam corretamente processados e armazenados no sistema.