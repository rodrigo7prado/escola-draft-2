# UI - Componentes

Documentação de todos os componentes UI do sistema, incluindo componentes base reutilizáveis em `/src/components/ui`.

**Princípio:** Componentes base não devem conter lógica de negócio específica, apenas propriedades e eventos genéricos para garantir máxima reutilização.

---

## Índice

### Componentes Base
1. [DRY.UI:OVERFLOW_MENU] - Menu de opções (kebab/meatball/hamburger)
2. [DRY.UI:MODAL_INFO_UPLOAD] - Modal de progresso de upload
3. [DRY.UI:ICONE_PERSONALIZADO_STATUS] - Ícone de status com tooltip
4. [DRY.UI:AGREGADOR_ICONES_STATUS] - Coleção de ícones de status
5. [DRY.BASE-UI:BARRA_PROGRESSO_ASINCRONA] - Barra de progresso assíncrona

### Componentes Especializados
6. [DRY.UI:CONFIRMACAO_POR_DIGITACAO] - Confirmação com digitação
7. [DRY.UI:ANALISE_COMPLETUDE_DE_DADOS] - Análise de completude

---

## Componentes Base

### 1. Overflow Menu

#### [x] 1. *`DRY.UI:OVERFLOW_MENU`*
  - **Localização:** `/src/components/ui/OverflowMenu.tsx`
  - **Descrição:** Componente de menu de opções acionado por um ícone (ex.: "kebab, meatball, hamburger").

  **Propriedades:**
  - `options` (array): lista de opções a serem exibidas no menu, cada uma com label e callback.
  - `icon` (IconMenuOptions): tipo de ícone a ser exibido para acionar o menu (padrão é "kebab").

  **Eventos:**
  - `onSelect(option)`: evento disparado quando uma opção é selecionada.
  - Outros: cancelamento com escape ou clique fora.

  **Comportamento:**
  - Deve exibir o menu ao clicar no ícone.
  - Deve chamar o callback da opção selecionada e disparar o evento onSelect.

---

### 2. Modal Info Upload

#### [x] 2. *`DRY.UI:MODAL_INFO_UPLOAD`*
  - **Localização:** `/src/components/ui/ModalInfoUpload.tsx`
  - **Descrição:** Modal para exibir informações de progresso durante upload/importação de arquivos.
  - **Aplicar:** [DRY.BASE-UI:BARRA_PROGRESSO_ASINCRONA]

  **Propriedades:**
  - `isOpen` (boolean): controla a visibilidade do modal.
  - `totalFiles` (number): número total de arquivos a serem processados.
  - `processedFiles` (number): número de arquivos já processados.
  - `errorFiles` (number): número de arquivos que resultaram em erro.

  **Eventos:**
  - `onClose`: evento disparado quando o modal é fechado.

  **Comportamento:**
  - Deve exibir uma barra de progresso baseada em totalFiles e processedFiles.
  - Deve mostrar contadores de totalFiles, processedFiles e errorFiles.
  - Deve ter um botão para fechar o modal que dispara o evento onClose.

  **Checklist de Implementação:**
  - [x] Modal com [DRY.BASE-UI:BARRA_PROGRESSO_ASINCRONA] durante operações assíncronas longas
  - [x] Exibir confirmação dos dados de upload após conclusão
  - [x] Botão para fechar o modal após a conclusão

---

### 3. Ícone Personalizado Status

#### [x] 3. *`DRY.UI:ICONE_PERSONALIZADO_STATUS`*
  - **Localização:** `/src/components/ui/IconePersonalizadoStatus.tsx`
  - **Descrição:** Ícone personalizado para representar status (sucesso, erro, pendente).

  **Propriedades:**
  - `status` (string): status a ser representado ("success", "error", "pending").
  - `tooltip` (string): texto explicativo exibido ao passar o mouse sobre o ícone.

  **Comportamento:**
  - Deve exibir o ícone correspondente ao status com a cor apropriada.
  - Deve mostrar o tooltip ao passar o mouse sobre o ícone.

  **Checklist de Implementação:**
  - [x] Propriedade para definir qual ícone está associado ao status
  - [x] Cor do ícone reflete o status (verde=sucesso, vermelho=erro, amarelo=pendente)
  - [x] Tooltip explicativo ao passar o mouse

---

### 4. Agregador Ícones Status

#### [x] 4. *`DRY.UI:AGREGADOR_ICONES_STATUS`*
  - **Localização:** `/src/components/ui/AgregadorIconesStatus.tsx`
  - **Descrição:** Componente que agrega múltiplos ícones de status personalizados, representando visualmente o estado de múltiplos processos ou verificações.
  - **Aplicar:** [DRY.UI:ICONE_PERSONALIZADO_STATUS]

  **Propriedades:**
  - `statuses` (array): lista de status a serem exibidos, cada um com status e tooltip.
  - `orientation` (string): orientação dos ícones ("horizontal" ou "vertical", padrão: "horizontal").

  **Checklist de Implementação:**
  - [x] Opção que define orientação (vertical ou horizontal)
  - [x] Opções de espaçamento (inclusive ultracompacto como padrão)
  - [x] Exibir ícones com clareza visual

---

### 5. Barra Progresso Assíncrona

#### [ ] 5. *`DRY.BASE-UI:BARRA_PROGRESSO_ASINCRONA`*
  - **Descrição:** Componente de barra de progresso que pode ser usado para indicar o andamento de operações assíncronas longas, como importação de arquivos.

  **Propriedades:**
  - `totalItems` (number): número total de itens a serem processados.
  - `processedItems` (number): número de itens já processados.
  - `errorItems` (number): número de itens que resultaram em erro.
  - `isCancellable` (boolean): indica se a operação pode ser cancelada.

  **Eventos:**
  - `onCancel`: evento disparado quando o usuário clica para cancelar a operação.

  **Comportamento:**
  - Deve exibir uma barra de progresso visual, atualizando conforme processedItems aumenta.
  - Deve mostrar contadores de totalItems, processedItems e errorItems.
  - Se isCancellable for true, deve exibir um botão de cancelar que dispara o evento onCancel quando clicado.

---

## Componentes Especializados

### 6. Confirmação por Digitação

#### [ ] 6. *`DRY.UI:CONFIRMACAO_POR_DIGITACAO`*
  - **Descrição:** Componente de confirmação que exige digitação de texto específico para confirmar ações críticas.

  **Procedimento:** ABSTRAIR DRY.UI.1.1 e o restante utilizando este modelo.

  **Ocorrências:**
  - DRY.UI.1.1: Painel de Migração - Ata de Resultados Finais - Confirmação de exclusão de arquivo importado
  - DRY.UI.1.2: Painel de Migração - Ficha Individual (Histórico) - Confirmação de vínculo de arquivo importado ao aluno

---

### 7. Análise Completude de Dados

#### [ ] 7. *`DRY.UI:ANALISE_COMPLETUDE_DE_DADOS`*
  - **Descrição:** Componente UI que analisa e apresenta a completude dos dados importados em relação aos dados existentes no sistema, destacando discrepâncias e pendências.

  **Objetos TypeScript relacionados:**
  - (ainda a definir)

  **Propriedades:**
  - `levelAggregation`: Agregação de dados para análise de completude (Ex.: por aluno, por turma, etc.)
  - `existingData`: Array de objetos representando os dados existentes no sistema
  - `comparisonCriteria`: Objeto de configuração de critérios de comparação
  - `analyzedData`: Array de objetos que representa a análise de completude dos dados importados

  **UI:**
  - Exibir uma barra de ícones que indicam a completude de cada estágio analisado
  - Fornecer detalhes adicionais ao passar o mouse sobre cada ícone, explicando o status de completude

  **Configurações:**
  - Cores e ícones para os níveis de completude:
    - `completo`: verde
    - `parcial`: amarelo
    - `ausente`: vermelho