# DRY - Sumário de Documentação

Sumário organizado das documentações de DRY e IDD para refletir o estado atual dos componentes e processos. A estrutura obedece à organização vigente no diretório docs/dry/.

## Documentação e Ferramentas

- **[GUIDELINES.md](GUIDELINES.md)** - Guia de decisão: quando usar DRY vs criar novo componente
- **[WORKFLOW-INTEGRACAO-IDD.md](WORKFLOW-INTEGRACAO-IDD.md)** - Integração entre DRY e metodologia IDD
- **[templates/](templates/)** - Templates para criar novos componentes DRY
- **Ferramentas CLI:**
  - `pnpm search:dry <termo>` - Buscar componentes DRY por ID ou fragmento
  - `pnpm summary:dry` - Gerar/atualizar este arquivo automaticamente
  - `pnpm validate:dry` - Validar documentação DRY

---

## Macro
1. [DRY.CONCEPT:PAINEL_MIGRACAO](ui/ui-macro.md#1-dryconceptpainel_migracao)
2. [DRY.CONCEPT:PAINEL_GESTAO_ALUNOS](ui/ui-macro.md#2-dryconceptpainel_gestao_alunos)
2.1. [DRY.CONCEPT:LISTA_ALUNOS](ui/ui-macro.md#21-dryconceptlista_alunos)
2.1.1. [DRY.CONCEPT:BARRA_RESUMO_ALUNOS](ui/ui-macro.md#211-dryconceptbarra_resumo_alunos)
2.1.2. [DRY.CONCEPT:ITEM_ALUNO](ui/ui-macro.md#212-dryconceptitem_aluno)
2.2. [DRY.CONCEPT:DADOS_DO_ALUNO](ui/ui-macro.md#22-dryconceptdados_do_aluno)
3. [DRY.CONCEPT:PAINEL_IMPRESSAO](ui/ui-macro.md#3-dryconceptpainel_impressao)

## Backend

### Importação de Perfil
1. [DRY.BACKEND:IMPORT_PROFILE](backend/imports/import-profile/backend.dry.md#importacao-de-perfil)

## UI

### Componentes Base
1. [DRY.UI:OVERFLOW_MENU](ui/ui-components.dry.md#1-overflow-menu) - Menu de opções (kebab/meatball/hamburger)
2. [DRY.UI:MODAL_INFO_UPLOAD](ui/ui-components.dry.md#2-modal-info-upload) - Modal de progresso de upload
3. [DRY.UI:ICONE_PERSONALIZADO_STATUS](ui/ui-components.dry.md#3-icone-personalizado-status) - Ícone de status com tooltip
4. [DRY.UI:AGREGADOR_ICONES_STATUS](ui/ui-components.dry.md#4-agregador-icones-status) - Coleção de ícones de status
5. [DRY.BASE-UI:BARRA_PROGRESSO_ASINCRONA](ui/ui-components.dry.md#5-barra-progresso-assincrona) - Barra de progresso assíncrona

### Componentes Especializados
6. [DRY.UI:CONFIRMACAO_POR_DIGITACAO](ui/ui-components.dry.md#6-confirmacao-por-digitacao) - Confirmação com digitação
7. [DRY.UI:ANALISE_COMPLETUDE_DE_DADOS](ui/ui-components.dry.md#7-analise-completude-de-dados) - Análise de completude

## Objetos e Tipos

### Objetos Principais
1. [DRY.OBJECT:PHASES](objects/phases.md#dryobjectphases) - Sistema de fases de gestão de alunos

### Tipos de Dados
2. [DRY.TYPE:Phase](objects/index.md#drytypephase) - Literal types das fases
3. [DRY.TYPE:PhaseSchema](objects/index.md#drytypephaseschema) - Schema genérico de fase
4. [DRY.TYPE:ModelosPrismaFluxo](objects/index.md#drytypemodelosprismafluxo) - Modelos do fluxo
5. [DRY.TYPE:DocEmissao](objects/index.md#drytypedocemissao) - Tipos de documentos
