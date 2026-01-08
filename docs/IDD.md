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
- [Importação de Ficha Individual - Histórico](features/importacao-ficha-individual-historico/FLUXO.md);
- [Sistema de Fases de Gestão de Alunos](features/sistema-fases-gestao-alunos/FLUXO.md);  
- [Emissão de Documentos](features/emissao-documentos/CHECKPOINT.md); <---

**FEATURE ATUAL**: `Emissão de Documentos`

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
  [ ] CP1.1: Subtarefa A do recurso X
    [ ] T1.1.1: Eventual detalhe técnico de implementação 1 da Subtarefa A
    [ ] T1.1.2: Eventual detalhe técnico de implementação 2 da Subtarefa A
  [ ] CP1.2: Subtarefa B do recurso X
    [ ] CP1.2.1: Bifurcação 1 da Subtarefa B
    [ ] CP1.2.2: Bifurcação 2 da Subtarefa B
      [ ] T1.2.2.1: Eventual detalhe técnico de implementação da Bifurcação 2
      [ ] → TEC1.2: Referência a decisão técnica documentada (ver TECNICO.md)
[ ] CP2: Implementação do recurso Y
...

**IMPORTANTE - Convenção de Nomenclatura:**
- **T*** (em CHECKPOINT.md) = detalhes técnicos de **implementação** (o que/como fazer)
- **TEC*** (em TECNICO.md + código) = **decisões técnicas** documentadas com rastreabilidade
- Use `→ TEC1.2` em checkpoints para indicar que há decisão técnica documentada

# Formato de modelo TECNICO

## TEC1: Título da decisão técnica 1

**Motivação:**
Por que esta decisão foi tomada (contexto de negócio, requisitos, limitações)

**Alternativas Consideradas:**
- ❌ Alternativa A: Por que não foi escolhida
- ❌ Alternativa B: Por que não foi escolhida
- ✅ Solução escolhida: Por que foi a melhor opção

**Referências no Código:**
- `caminho/arquivo.ts:linha` - Descrição breve da implementação
- `caminho/outro.tsx:linha` - Descrição breve da implementação

### TEC1.1: Subitem da decisão técnica (se necessário)
Detalhamento específico de aspecto da decisão principal

## TEC2: Título da decisão técnica 2
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

### Propósito do TECNICO.md
1 - O arquivo TECNICO.md documenta **decisões técnicas não-óbvias** com suas motivações, alternativas consideradas e referências ao código implementado.
2 - Cada decisão técnica recebe um identificador **TEC*** que será referenciado diretamente no código através de comentários.
3 - O objetivo é criar **rastreabilidade bidirecional**: do código para a documentação e vice-versa.

### Sistema de Referências Cruzadas
1 - No código, decisões técnicas são marcadas com comentários no formato:
   ```typescript
   // [FEAT:nome-feature_TEC1.2] Resumo breve (1 linha) da decisão
   ```

2 - No TECNICO.md, cada entrada TEC*** inclui:
   - **Motivação**: Por que esta decisão foi tomada
   - **Alternativas Consideradas**: O que não foi feito e por quê
   - **Referências no Código**: Onde está implementado (arquivo:linha)

3 - No CHECKPOINT.md, use `→ TEC1.2` para indicar que checkpoint tem decisão técnica documentada

### Quando Criar uma Entrada TEC
**SIM** - Criar entrada TEC para:
- Escolhas arquiteturais (padrões, bibliotecas, estruturas)
- Trade-offs significativos (performance vs legibilidade, etc)
- Soluções não-óbvias para problemas complexos
- Decisões que precisarão ser revisitadas ou explicadas no futuro

**NÃO** - Não criar TEC para:
- Convenções padrão da linguagem/framework
- Código autoexplicativo
- Decisões triviais ou óbvias

### Workflow de Atualização
Ao final de cada sessão de trabalho:
1 - Identificar decisões técnicas não-óbvias implementadas
2 - Para cada decisão, adicionar entrada TEC*** no TECNICO.md com formato completo
3 - Adicionar comentários `[FEAT:*_TEC*]` no código implementado
4 - Garantir referências cruzadas (código → doc e doc → código)

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