**IDD - Incremental Documentation Development**
Este arquivo contém a concepção e o workflow para a implementação de features através da metodologia IDD (Incremental Documentation Development).

Conteúdo:
- Sumário de features (*com feature atual destacada*);
- Workflow geral para uso do Claude AI / ChatGPT Codex;
- Regras gerais (camadas), *relações entre camadas*;
- **Workflow e formato** *dos fluxos, dos checkpoints da camada técnica*.

# SOBRE O FUNCIONAMENTO DE UMA SESSÃO DE TRABALHO
Cada sessão de trabalho terá como foco a implementação de uma feature específica, seguindo o workflow detalhado abaixo.

## OPCIONALIDADES
- A sessão pode ser dividida em múltiplas etapas, cada qual com seus próprios checkpoints.

# SUMÁRIO DE FEATURES
- [Importação por colagem](features/importacao-por-colagem/FLUXO.md);
- [Importação de Ficha Individual - Histórico](features/importacao-ficha-individual-historico/FLUXO.md);  <---

**FEATURE ATUAL**: `Importação de Ficha Individual - Histórico`

# WORKFLOW GERAL PARA IMPLEMENTAÇÃO DE FEATURES
- IDENTIFICAR a feature a ser implementada em FEATURE ATUAL acima;
- VERIFICAR arquivo de FLUXO
  - A regra para a localização do arquivo é: docs/[NOME_DA_FEATURE]/FLUXO.md
- VERIFICAR arquivo de CHECKPOINTS
  - A regra para a localização do arquivo é: docs/[NOME_DA_FEATURE]/CHECKPOINT.md
- INICIAR a sessão de trabalho a partir do primeiro checkpoint não concluído no arquivo de CHECKPOINTS

# OBJETIVO
Arquivo de especificação de MAPEAMENTO, CHECKPOINT e TÉCNICO para todas as features

## Relações entre camadas (arquivos)
- Todo checkpoint terá origem na camada de fluxo, devendo ser observado se não houver correspondência direta ou indireta.
- Todo checkpoint terá bifurcações técnicas, que serão organizadas de forma resumida no arquivo TECNICO.md.

# FORMATO DOS ARQUIVOS

## Formato de FLUXO
F1. [Título do item de fluxo]
F1.1. [Descrição do subitem de fluxo]
F1.2. [Descrição do subitem de fluxo]
F2. [Título do item de fluxo]
...

# Formato de CHECKPOINTS
Sessão 1 (implemetanção de Fluxos F1, F2) - Feature: [NOME_DA_FEATURE]

## Componentes DRY Usados
- [DRY.UI:COMPONENTE_1] - Breve descrição do uso
- [DRY.OBJECT:TIPO_1] - Breve descrição do uso
- [DRY.BACKEND:SERVICO_1] - Breve descrição do uso

## Checkpoints
[ ] CP1: Implementação do recurso X
  [ ] CPP1.1: Subtarefa A do recurso X
    [ ] TEC1.1.1: Eventual detalhe técnico contextual 1 da Subtarefa A
    [ ] TEC1.1.2: Eventual detalhe técnico contextual 2 da Subtarefa A
  [ ] CP1.2: Subtarefa B do recurso X
    [ ] CP1.2.1: Bifurcação 1 da Subtarefa B
    [ ] CP1.2.2: Bifurcação 2 da Subtarefa B
      [ ] TEC1.2.2.1: Eventual detalhe técnico contextual da Bifurcação 2
[ ] CP2: Implementação do recurso Y
...

# Formato de modelo TECNICO
T1. Resumo da motivação técnica por trás da decisão 1
  T1.1 Resumo em subitem
  ...
T2. Resumo da motivação técnica por trás da decisão 2
...

# WORKFLOW

## WORKFLOW DE CHECKPOINTS
1 - Uma vez identificada (em `docs/IDD.md`) a feature a ser implementada, o foco será na implementação gradual da feature, dividida em sessões de trabalho, através de checkpoints.
2 - Cada sessão de trabalho terá checkpoints a serem atingidos, cada qual tendo um identificador único.
3 - A fim de economizar recursos (tokens), a leitura do arquivo de CHECKPOINT da feature se dará a partir do primeiro checkpoint não marcado como concluído. Se for necessário um contexto maior, o arquivo completo poderá ser lido.
4 - Um checkpoint terá um caráter resumido, indicando uma etapa para o deve ser implementado na sessão de trabalho.
5 - Qualquer detalhamento técnico necessário para a implementação do checkpoint se encontrará como ramo bifurcado do checkpoint, com identificadores únicos próprios, iniciando com "TEC", indicando que se trata de um detalhe técnico.
6 - Conforme os checkpoints forem tendo vez, pode haver a necessidade de bifurcação do fluxo de trabalho, criando novos checkpoints aninhados. Estas bifurcações serão aninhadas, criando uma árvore de checkpoints.

Ao final de cada sessão de trabalho:
1 - Tudo o que foi implementado receberá um check de conclusão no próprio arquivo de CHECKPOINT da feature, permitindo a rápida leitura da IA.
2 - Também ao final de cada sessão de trabalho, o arquivo TECNICO da feature será atualizado com um resumo das decisões técnicas tomadas durante a sessão de trabalho.
3 - Também será o momento de se discutir as próximas etapas da feature, criando novos checkpoints para a próxima sessão de trabalho.

## WORKFLOW TÉCNICO
1 - O arquivo TECNICO da feature terá por objetivo **resumir** as *motivações* das decisões técnicas tomadas para a implementação dos checkpoints.
2 - O principal objetivo do arquivo TECNICO é permitir que a IA compreenda a MOTIVAÇÃO técnica por trás das decisões tomadas, para que possa auxiliar em futuras refatorações.
3 - Na finalização de uma sessão de trabalho que será continuada posteriormente, o arquivo TECNICO deve ser atualizado com um resumo enxuto das tais motivações técnicas.
4 - O arquivo TECNICO não deve ser um manual de implementação detalhado, mas sim um resumo das decisões técnicas tomadas.

# TEMPLATE DOS ARQUIVOS
## Template de arquivo de CHECKPOINT
  ```
  *Para uso das IAs*

  # CHECKPOINTS DE SESSÕES DE TRABALHO

  Sessão 1 (implementação de Fluxos F1, F2) - Feature: [NOME_DA_FEATURE]

  ## Componentes DRY Usados
  - [DRY.UI:COMPONENTE_1] - Breve descrição do uso
  - [DRY.OBJECT:TIPO_1] - Breve descrição do uso
  - (adicionar conforme necessário)

  ## Checkpoints
  [ ] CP1: Implementação do recurso X
    [ ] CP1.1: Subtarefa A do recurso X
  [ ] CP2: Implementação do recurso Y
  ...
  ```
## Template de arquivo de TECNICO
  ```
  # DECISÕES TÉCNICAS

  [Conteúdo conforme o formato do arquivo de TECNICO acima]
  ```
## Template de arquivo de MAPEAMENTO
  ```
  <!-- Arquivo segue o template de /docs/templates/MAPEAMENTO.md -->
  ## Estrutura dos Dados
  [Descrição da estrutura dos dados da feature]
  
  -> tipos de dados e o mapeamento em si, etc.
  ```