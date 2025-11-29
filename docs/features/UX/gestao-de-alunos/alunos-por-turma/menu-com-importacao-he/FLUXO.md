# FLUXO DE USUÁRIO
F1: Usuário acessa o Painel de Gestão do Aluno;
F2: Na lista de alunos por turma, haverá um menu de opções (apenas com um ícoe de "três pontinhos verticais");
F3: Exibirá a opção de importar csv de [Ficha Individual - Histórico];
F4: Múltiplos arquivos poderão ser escolhidos, e então o parser analisará após confirmação;
F5: O parser analisará os arquivos, exibindo um modal de progresso [DRY.UI:MODAL_INFO_UPLOAD].
<!-- F6 em desenvolvimento -->
F6: Após o término, cada aluno será atualizado na UI, em caso de sucesso, com um ícone de "check" verde correspondente à fase de HE concluída, de acordo com [DRY.UI:AGREGADOR_ICONES_STATUS];