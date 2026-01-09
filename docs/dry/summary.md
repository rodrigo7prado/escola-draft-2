# DRY - Sumário de Documentação

Sumário organizado das documentações de DRY e IDD para refletir o estado atual dos componentes e processos. A estrutura obedece à organização vigente no diretório docs/dry/.

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

### Validação e Completude
2. [DRY.BACKEND:CALCULAR_COMPLETUDE_DOCUMENTOS](backend/validacao/calcular-completude.md#drybackendcalcular_completude_documentos) - Sistema de análise de completude baseado em def-objects

## UI

### Componentes Base
1. [DRY.UI:OVERFLOW_MENU](ui/ui-components.dry.md#1-overflow-menu) - Menu de opções (kebab/meatball/hamburger)
2. [DRY.UI:MODAL_INFO_UPLOAD](ui/ui-components.dry.md#2-modal-info-upload) - Modal de progresso de upload
3. [DRY.UI:ICONE_PERSONALIZADO_STATUS](ui/ui-components.dry.md#3-icone-personalizado-status) - Ícone de status com tooltip
4. [DRY.UI:AGREGADOR_ICONES_STATUS](ui/ui-components.dry.md#4-agregador-icones-status) - Coleção de ícones de status
5. [DRY.BASE-UI:TABS](ui/ui-components.dry.md#5-tabs-base) - Sistema de abas genérico
6. [DRY.BASE-UI:BARRA_PROGRESSO_ASINCRONA](ui/ui-components.dry.md#6-barra-progresso-assincrona) - Barra de progresso assíncrona
7. [DRY.UI:ICONE_STATUS_FASE](ui/ui-components.dry.md#7-icone-status-fase) - Ícone de status por fase (dados do aluno)
8. [DRY.UI:AGREGADOR_ICONES_FASES](ui/ui-components.dry.md#8-agregador-icones-fases) - Coleção de ícones das fases do aluno

### Componentes Especializados
9. [DRY.UI:CONFIRMACAO_POR_DIGITACAO](ui/ui-components.dry.md#9-confirmacao-por-digitacao) - Confirmação com digitação
10. [DRY.UI:ANALISE_COMPLETUDE_DE_DADOS](ui/ui-components.dry.md#10-analise-completude-de-dados) - Análise de completude
11. [DRY.UI:CARD_COMPLETUDE_COM_DETALHAMENTO](ui/ui-components.dry.md#11-card-completude-com-detalhamento) - Card de completude com expansão de detalhes

## Objetos e Tipos

### Objetos Principais
1. [DRY.OBJECT:PHASES](objects/phases.md#dryobjectphases) - Sistema de fases de gestão de alunos

### Tipos de Dados
2. [DRY.TYPE:Phase](objects/index.md#drytypephase) - Literal types das fases
3. [DRY.TYPE:PhaseSchema](objects/index.md#drytypephaseschema) - Schema genérico de fase
4. [DRY.TYPE:ModelosPrismaFluxo](objects/index.md#drytypemodelosprismafluxo) - Modelos do fluxo
5. [DRY.TYPE:DocEmissao](objects/index.md#drytypedocemissao) - Tipos de documentos
6. [DRY.TYPE:CompletudeItem](objects/index.md#drytypecompletudeitem) - Resultado de análise de completude por item
7. [DRY.TYPE:ResumoCompletude](objects/index.md#drytyperesumocompletude) - Consolidação de completude de múltiplos itens
8. [DRY.TYPE:CampoFaltante](objects/index.md#drytypecampofaltante) - Campo obrigatório não preenchido
