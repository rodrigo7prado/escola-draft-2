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
5. [DRY.BASE-UI:TABS] - Sistema de abas genérico
6. [DRY.BASE-UI:BARRA_PROGRESSO_ASINCRONA] - Barra de progresso assíncrona
7. [DRY.UI:ICONE_STATUS_FASE] - Ícone de status por fase (dados do aluno)
8. [DRY.UI:AGREGADOR_ICONES_FASES] - Coleção de ícones das fases do aluno

### Componentes Especializados
9. [DRY.UI:CONFIRMACAO_POR_DIGITACAO] - Confirmação com digitação
10. [DRY.UI:ANALISE_COMPLETUDE_DE_DADOS] - Análise de completude
11. [DRY.UI:CARD_COMPLETUDE_COM_DETALHAMENTO] - Card de completude com expansão de detalhes

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

### 5. Tabs (Base)

#### [x] 5. *`DRY.BASE-UI:TABS`*
  - **Localização:** `/src/components/ui/Tabs.tsx`
  - **Descrição:** Sistema de abas controladas via contexto interno, com triggers e conteúdos associados.

  **API:**
  - `Tabs`:
    - Props: `defaultValue` (string, obrigatório), `variant` (`"default" | "secondary" | "tertiary"`, opcional, padrão `"default"`), `children`.
    - Mantém `activeTab` em estado interno e provê contexto para triggers e contents.
  - `TabsList`:
    - Props: `children`, `className?`, `variant?` (mesmas opções).
    - Layout horizontal com espaçamento e borda inferior; variantes ajustam espaçamento vertical.
  - `TabsTrigger`:
    - Props: `value` (string), `children`, `variant?`, `onClick?`.
    - Renderiza botão ghost com borda inferior indicando aba ativa; dispara `setActiveTab(value)` e `onClick`.
  - `TabsContent`:
    - Props: `value` (string), `children`, `className?`.
    - Exibe conteúdo apenas quando `value === activeTab`; usa layout flex preenchendo altura.

  **Comportamento:**
  - Contexto interno garante sincronização entre triggers e conteúdos.
  - Suporta três variantes de densidade pré-configuradas.
  - Componentes lançam erro se usados fora de `<Tabs>`.

  **Referências Cruzadas:**
  - Uso atual: `src/components/FluxoCertificacao.tsx` (abas do painel do aluno).

---

### 6. Barra Progresso Assíncrona

#### [ ] 6. *`DRY.BASE-UI:BARRA_PROGRESSO_ASINCRONA`*
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

### 7. Ícone Status Fase

#### [x] 7. *`DRY.UI:ICONE_STATUS_FASE`*
  - **Localização:** `/src/components/ui/IconeStatusFase.tsx`
  - **Descrição:** Ícone individual para exibir o status de uma fase do painel de dados do aluno.
  - **Dependências:** [DRY.OBJECT:PHASES] (usa `PHASES_CONFIG` para ícone e título)

  **Propriedades:**
  - `phase` (`Phase`): identificador da fase (ex.: `FASE:DADOS_PESSOAIS`).
  - `status` (`PhaseStatus`): estado da fase (`completo` | `incompleto` | `ausente`).
  - `label` (string): texto curto exibido abaixo do ícone (ex.: `12/20` ou `65%`).
  - `title` (string): tooltip com resumo do status.

  **Comportamento:**
  - Seleciona dinamicamente o ícone Lucide definido em `PHASES_CONFIG[phase].icone`.
  - Aplica cores conforme o status: verde (completo), amarelo (incompleto), vermelho (ausente).
  - Mantém largura mínima para alinhamento consistente em agregadores.

  **Referências Cruzadas:**
  - Usado por [DRY.UI:AGREGADOR_ICONES_FASES].
  - Usa configuração única de fases em `src/lib/core/data/gestao-alunos/phases.ts`.

---

### 8. Agregador Ícones Fases

#### [x] 8. *`DRY.UI:AGREGADOR_ICONES_FASES`*
  - **Localização:** `/src/components/ui/AgregadorIconesFases.tsx`
  - **Descrição:** Agrega os quatro ícones de fase (pessoais, escolares, histórico, emissão) respeitando a ordem definida em `PHASES_CONFIG`.
  - **Dependências:** [DRY.UI:ICONE_STATUS_FASE], [DRY.OBJECT:PHASES]

  **Propriedades:**
  - `statusPorFase` (`Record<Phase, { status: PhaseStatus; label: string; title: string }>`): mapa completo de status para cada fase.

  **Comportamento:**
  - Ordena as fases por `PHASES_CONFIG[fase].ordem` e renderiza um `IconeStatusFase` para cada uma.
  - Usa rótulos/títulos recebidos para exibir tooltips e valores consolidados por fase.
  - Aplica layout horizontal compacto (`flex` + `gap-2`) para uso em listas de alunos.

  **Referências Cruzadas:**
  - Consumido em `src/components/ListaAlunosCertificacao.tsx`.
  - Fonte única de configuração: `PHASES_CONFIG` em `phases.ts`.

---

## Componentes Especializados

### 9. Confirmação por Digitação

#### [ ] 9. *`DRY.UI:CONFIRMACAO_POR_DIGITACAO`*
  - **Descrição:** Componente de confirmação que exige digitação de texto específico para confirmar ações críticas.

  **Procedimento:** ABSTRAIR DRY.UI.1.1 e o restante utilizando este modelo.

  **Ocorrências:**
  - DRY.UI.1.1: Painel de Migração - Ata de Resultados Finais - Confirmação de exclusão de arquivo importado
  - DRY.UI.1.2: Painel de Migração - Ficha Individual (Histórico) - Confirmação de vínculo de arquivo importado ao aluno

---

### 10. Análise Completude de Dados

#### [ ] 10. *`DRY.UI:ANALISE_COMPLETUDE_DE_DADOS`*
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

---

### 11. Card Completude com Detalhamento

#### [x] 11. *`DRY.UI:CARD_COMPLETUDE_COM_DETALHAMENTO`*
  - **Localização:** `/src/components/CompletudeDocumentos.tsx`
  - **Descrição:** Componente genérico de card para exibir análise de completude de múltiplos itens (documentos, fases, etapas), com expansão de detalhes e navegação para campos faltantes.
  - **Dependências:** [DRY.BACKEND:CALCULAR_COMPLETUDE_DOCUMENTOS], [DRY.OBJECT:PHASES]

## API

**Propriedades:**
- `completude` (`ResumoCompletudeEmissao`): Objeto com análise consolidada de completude
  - `statusGeral`: Status consolidado (completo/incompleto/ausente)
  - `documentosProntos`: Quantidade de itens com status completo
  - `totalDocumentos`: Total de itens analisados
  - `porDocumento`: Detalhes por item individual
- `onNavigateToAba?: (abaId: string) => void`: Callback para navegar para aba com campo faltante

**Eventos:**
- `onNavigateToAba(abaId)`: Disparado ao clicar em campo faltante para navegar à aba correspondente

**Estado Interno:**
- `detalhesAbertos`: Record controlando expansão de cada card de item

## Comportamento

**Resumo Geral:**
- Badge de status geral com cor dinâmica (verde/amarelo/vermelho)
- Contador "X/Y documentos prontos"

**Cards por Item:**
- Grid responsivo (1 coluna mobile, 2 colunas desktop)
- Cada card exibe:
  - Título do item (ex: "Certidão", "Certificado")
  - Percentual e contadores (ex: "85% · 17/20 campos")
  - Badge de status individual
  - Botão "Ver detalhes" expansível

**Detalhes Expandidos:**
- Lista de campos faltantes agrupados por fase
- Ordem respeita `PHASES_CONFIG[fase].ordem`
- Campos clicáveis que chamam `onNavigateToAba()`
- Feedback visual: texto azul com hover underline

**Cores por Status:**
- `completo`: verde (bg-green-100 text-green-700)
- `incompleto`: amarelo (bg-yellow-100 text-yellow-700)
- `ausente`: vermelho (bg-red-100 text-red-700)

## Fluxo de Uso

1. Componente recebe objeto `completude` do backend
2. Renderiza resumo geral no topo
3. Itera sobre itens na ordem definida (`ORDEM_DOCUMENTOS`)
4. Usuário clica "Ver detalhes" para expandir card
5. Lista de campos faltantes é exibida, agrupada por fase
6. Usuário clica em campo faltante → `onNavigateToAba()` é chamado
7. Aba correspondente é focada para preenchimento

## Agrupamento de Campos Faltantes

Função interna `agruparCamposFaltantes()`:
- Agrupa campos por `fase`
- Ordena grupos por `PHASES_CONFIG[fase].ordem`
- Retorna array de `GrupoCamposFaltantes`

```typescript
type GrupoCamposFaltantes = {
  fase: Phase;
  campos: CampoFaltante[];
};
```

## Reutilização

Este componente pode ser generalizado para outros contextos de completude:

**Uso Atual:**
- Análise de documentos de emissão (Certidão, Certificado, Diploma, Histórico)

**Usos Futuros:**
- Dashboard de completude de turma (exibir completude por aluno)
- Validação de importação (mostrar campos importados vs faltantes)
- Checklist de processos (ex: matrícula, formatura)
- Análise de qualidade de dados (campos críticos faltantes)

**Adaptações Necessárias para Generalização:**
```typescript
// Props genéricas
interface CardCompletudeProps<T extends string> {
  titulo: string;
  itens: ItemCompletude<T>[];
  resumo?: {
    status: PhaseStatus;
    itensProntos: number;
    totalItens: number;
  };
  onNavigate?: (destino: string) => void;
  labelPlural?: string;  // "documentos", "etapas", "seções"
}
```

## Checklist de Implementação

- [x] Cards expansíveis com estado controlado
- [x] Badges de status com cores dinâmicas
- [x] Agrupamento de campos por fase
- [x] Navegação via callback `onNavigateToAba`
- [x] Grid responsivo (mobile/desktop)
- [x] Feedback visual em campos clicáveis
- [x] Respeito à ordem de fases definida em PHASES_CONFIG
- [x] Estado vazio tratado ("Nenhum campo faltante")

## Exemplos de Uso

### Uso Básico (Emissão de Documentos)

```typescript
import { CompletudeDocumentos } from '@/components/CompletudeDocumentos';
import { calcularCompletudeEmissao } from '@/lib/core/data/gestao-alunos/documentos/calcularCompletude';

function AbaEmissao({ aluno, onNavigate }) {
  const completude = calcularCompletudeEmissao(aluno);

  return (
    <div>
      <CompletudeDocumentos
        completude={completude}
        onNavigateToAba={onNavigate}
      />
      {/* Resto da UI de emissão */}
    </div>
  );
}
```

### Integração com Sistema de Abas

```typescript
function DadosAluno({ aluno }) {
  const [abaAtiva, setAbaAtiva] = useState("dados-pessoais");

  const completude = calcularCompletudeEmissao(aluno);

  return (
    <Tabs value={abaAtiva} onValueChange={setAbaAtiva}>
      <TabsList>
        <TabsTrigger value="dados-pessoais">Dados Pessoais</TabsTrigger>
        <TabsTrigger value="dados-escolares">Dados Escolares</TabsTrigger>
        <TabsTrigger value="historico">Histórico</TabsTrigger>
        <TabsTrigger value="emissao">Emissão</TabsTrigger>
      </TabsList>

      <TabsContent value="emissao">
        <CompletudeDocumentos
          completude={completude}
          onNavigateToAba={setAbaAtiva}
        />
      </TabsContent>
    </Tabs>
  );
}
```

### Desabilitar Botões Baseado em Completude

```typescript
function BotoesEmissao({ aluno }) {
  const completude = calcularCompletudeEmissao(aluno);
  const certidao = completude.porDocumento["Certidão"];

  return (
    <div>
      <CompletudeDocumentos completude={completude} />

      <Button
        disabled={certidao.status !== "completo"}
        onClick={() => imprimirCertidao(aluno)}
      >
        Imprimir Certidão
      </Button>

      {certidao.status !== "completo" && (
        <Tooltip>
          Preencha os {certidao.camposFaltantes.length} campos faltantes
        </Tooltip>
      )}
    </div>
  );
}
```

## Referências Cruzadas

**Componentes Relacionados:**
- [DRY.UI:ICONE_STATUS_FASE](#7-icone-status-fase) - Usado internamente para exibir ícones de fase
- [DRY.UI:AGREGADOR_ICONES_FASES](#8-agregador-icones-fases) - Padrão similar de agregação de status
- [DRY.BASE-UI:TABS](#5-tabs-base) - Frequentemente usado em conjunto para navegação

**Backend Relacionado:**
- [DRY.BACKEND:CALCULAR_COMPLETUDE_DOCUMENTOS](../backend/validacao/calcular-completude.md#drybackendcalcular_completude_documentos) - Fonte de dados de completude

**Objetos Relacionados:**
- [DRY.OBJECT:PHASES](../objects/phases.md#dryobjectphases) - Configuração de fases para agrupamento
- [DRY.TYPE:PhaseStatus](../objects/index.md#drytypephase) - Tipos de status utilizados
- [DRY.TYPE:DocEmissao](../objects/index.md#drytypedocemissao) - Tipos de documentos
- [DRY.TYPE:CompletudeItem](../objects/index.md#drytypecompletudeitem) - Tipo de resultado por item
- [DRY.TYPE:ResumoCompletude](../objects/index.md#drytyperesumocompletude) - Tipo de resumo consolidado
- [DRY.TYPE:CampoFaltante](../objects/index.md#drytypecampofaltante) - Tipo de campo faltante

**Origem da Implementação:**
- Feature: Emissão de Documentos
- Sessão: 3 (Análise de Completude)
- Checkpoint: C15
- Documentação: `/docs/features/emissao-documentos/CHECKPOINT.md`
