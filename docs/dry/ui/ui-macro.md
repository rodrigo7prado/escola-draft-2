## SUMÁRIO

#### [ ] 1. *`DRY.CONCEPT:PAINEL_MIGRACAO`*
   Painel de Migração de Dados
   [Em construção]
#### [ ] 2. *`DRY.CONCEPT:PAINEL_GESTAO_ALUNOS`*
   Painel de Gestão de Alunos
#### [ ] 2.1 *`DRY.CONCEPT:LISTA_ALUNOS`*
   Lista de Alunos
#### [ ] 2.1.1 *`DRY.CONCEPT:BARRA_RESUMO_ALUNOS`*
   Barra de Resumo de Alunos
#### [ ] 2.1.2 *`DRY.CONCEPT:ITEM_ALUNO`*
   Item de Aluno
   Através do [DRY.UI:AGREGADOR_ICONES_STATUS], exibir múltiplos ícones de status para cada aluno na lista, indicando completude ou pendências de determinada categoria.
#### [ ] 2.2 *`DRY.CONCEPT:DADOS_DO_ALUNO`*
   Dados do Aluno
#### [ ] 3. *`DRY.CONCEPT:PAINEL_IMPRESSAO`*
   Painel de Impressão
   [A desenvolver]

## FLUXO

### [DRY.CONCEPT:PAINEL_GESTAO_ALUNOS]

A página principal do sistema (localizada em "/") é composta por três paineis: [`DRY.CONCEPT:PAINEL_MIGRACAO`], [`DRY.CONCEPT:PAINEL_GESTAO_ALUNOS`] e [`DRY.CONCEPT:PAINEL_IMPRESSAO`]. Cada painel oferece funcionalidades específicas para o usuário.

[DRY.CONCEPT:PAINEL_GESTAO_ALUNOS] permite ao usuário gerenciar os alunos cadastrados no sistema. Dentro deste painel, a seção [`DRY.CONCEPT:LISTA_ALUNOS`] exibe uma lista de todos os alunos, cada um representado por um componente [`DRY.CONCEPT:ITEM_ALUNO`].

Ainda dentro da lista, acima dos itens, em [DRY.CONCEPT:BARRA_RESUMO_ALUNOS], o usuário pode visualizar um resumo estatístico dos alunos, incluindo percentual de completude e outras métricas relevantes.

Ao lado da lista, o usuário pode acessar detalhes específicos de cada aluno através do componente [`DRY.CONCEPT:DADOS_DO_ALUNO`], que apresenta informações detalhadas e opções de edição.

Em [DRY.CONCEPT:ITEM_ALUNO], cada aluno listado exibe múltiplos ícones de status utilizando o componente [DRY.UI:AGREGADOR_ICONES_STATUS]. Esses ícones indicam diferentes aspectos do status do aluno, como completude ou pendências de dados.

## ESTRUTURA HIERÁRQUICA DE CONCEITOS
[DRY.CONCEPT:PAINEL_MIGRACAO]
[DRY.CONCEPT:PAINEL_GESTAO_ALUNOS]
   [DRY.CONCEPT:LISTA_ALUNOS]
      [DRY.CONCEPT:BARRA_RESUMO_ALUNOS]
      [DRY.CONCEPT:ITEM_ALUNO]
   [DRY.CONCEPT:DADOS_DO_ALUNO]
[DRY.CONCEPT:PAINEL_IMPRESSAO]


1. Em *`DRY.CONCEPT:PAINEL_MIGRACAO`*, o usuário pode:
   - [ ] Iniciar novos processos de migração de dados.
   - [ ] Monitorar o status das migrações em andamento.
2. No *`DRY.CONCEPT:PAINEL_GESTAO_ALUNOS`*, o usuário pode:
    