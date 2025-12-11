# UI - Componentes Bases
### Descrição
Tudo que está em /src/components/ui são componentes bases de UI (botões, inputs, modais, etc) que devem ser reutilizados em toda a aplicação para manter consistência visual e de comportamento. Eles não devem conter lógica de negócio específica, apenas propriedades e eventos genéricos.

### Componentes a serem criados
#### [x] 1. *`DRY.UI:OVERFLOW_MENU`*;
  - Localização: `/src/components/ui/OverflowMenu.tsx`
  - Descrição: Componente de menu de opções acionado por um ícone (ex.: "kebab, meatball, hamburger").
  - Propriedades:
    - options (array): lista de opções a serem exibidas no menu, cada uma com label e callback.
    - icon (IconMenuOptions): tipo de ícone a ser exibido para acionar o menu (padrão é "kebab").
  - Eventos:
    - onSelect(option): evento disparado quando uma opção é selecionada.
    - outros: cancelamento com escape ou clique fora.
  - Comportamento:
    - Deve exibir o menu ao clicar no ícone.
    - Deve chamar o callback da opção selecionada e disparar o evento onSelect.

#### [x] 2. *`DRY.UI:MODAL_INFO_UPLOAD`*;
  - Localização: `/src/components/ui/ModalInfoUpload.tsx`
  - Descrição: Modal para exibir informações de progresso durante upload/importação de arquivos.
  - Propriedades:
    - isOpen (boolean): controla a visibilidade do modal.
    - totalFiles (number): número total de arquivos a serem processados.
    - processedFiles (number): número de arquivos já processados.
    - errorFiles (number): número de arquivos que resultaram em erro.
  - Eventos:
    - onClose: evento disparado quando o modal é fechado.
  - Comportamento:
    - Deve exibir uma barra de progresso baseada em totalFiles e processedFiles.
    - Deve mostrar contadores de totalFiles, processedFiles e errorFiles.
    - Deve ter um botão para fechar o modal que dispara o evento onClose.

#### [x] 3. *`DRY.UI:ICONE_PERSONALIZADO_STATUS`*;
  - Localização: [Link](/src/components/ui/IconePersonalizadoStatus.tsx)
  - Descrição: Ícone personalizado para representar status (sucesso, erro, pendente).
  - Propriedades:
    - status (string): status a ser representado ("success", "error", "pending").
    - tooltip (string): texto explicativo exibido ao passar o mouse sobre o ícone.
  - Comportamento:
    - Deve exibir o ícone correspondente ao status com a cor apropriada.
    - Deve mostrar o tooltip ao passar o mouse sobre o ícone.

#### [x] 4. *`DRY.UI:AGREGADOR_ICONES_STATUS`*;
  - Localização: [Link](/src/components/ui/AgregadorIconesStatus.tsx)
  - Descrição: Componente que agrega múltiplos ícones de status personalizados.
  - Propriedades:
    - statuses (array): lista de status a serem exibidos, cada um com status e tooltip.
    - orientation (string): orientação dos ícones

#### [ ] 5. *`DRY.BASE-UI:BARRA_PROGRESSO_ASINCRONA`*;
  - Descrição: Componente de barra de progresso que pode ser usado para indicar o andamento de operações assíncronas longas, como importação de arquivos.
  - Propriedades:
    - totalItems (number): número total de itens a serem processados.
    - processedItems (number): número de itens já processados.
    - errorItems (number): número de itens que resultaram em erro.
    - isCancellable (boolean): indica se a operação pode ser cancelada.
  - Eventos:
    - onCancel: evento disparado quando o usuário clica para cancelar a operação.
  - Comportamento:
    - Deve exibir uma barra de progresso visual, atualizando conforme processedItems aumenta.
    - Deve mostrar contadores de totalItems, processedItems e errorItems.
    - Se isCancellable for true, deve exibir um botão de cancelar que dispara o evento onCancel quando clicado.