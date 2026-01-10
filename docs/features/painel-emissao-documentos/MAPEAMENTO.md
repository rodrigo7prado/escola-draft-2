# MAPEAMENTO ARQUITETURAL: Painel de Gestão de Alunos

> **Documento de Referência**: Este mapeamento serve como base para a construção do Painel de Emissão de Documentos, identificando componentes, padrões e lógicas reutilizáveis do Painel de Gestão de Alunos.

---

## 1. VISÃO GERAL

O **Painel de Gestão de Alunos** é um sistema completo de gerenciamento de dados escolares construído em Next.js, que permite visualizar, editar e validar informações de alunos organizadas em 4 fases distintas: Dados Pessoais, Dados Escolares, Histórico Escolar e Emissão de Documentos.

### Principais Funcionalidades

1. **Filtragem Inteligente**: Seleção por ano letivo e turma com pré-seleção automática
2. **Gestão de Dados por Fases**: Sistema de abas dinâmicas baseadas em configuração única
3. **Visualização de Status**: Indicadores visuais de completude para cada fase
4. **Modo de Colagem**: Importação estruturada de dados via copy/paste com validação
5. **Comparação de Dados**: Visualização lado a lado de valores originais vs atuais
6. **Emissão de Documentos**: Geração de PDF para Certidão, Certificado, Diploma e Histórico

### Características Arquiteturais Chave

- **Fonte Única de Verdade**: Configuração centralizada (`PHASES_CONFIG`) para todas as fases
- **Componentização Extrema**: Separação clara entre UI genérica e lógica específica
- **Hooks Customizados**: Encapsulamento de lógica de estado e efeitos colaterais
- **Server State Management**: SWR para cache e sincronização com backend
- **Validação por Schema**: def-objects como fonte de regras de completude
- **Metodologia IDD**: Documentação incremental com checkpoints entre sessões

---

## 2. ESTRUTURA DE ARQUIVOS

```
/src
├── app/
│   ├── gestao-alunos/
│   │   └── page.tsx                          # [PLACEHOLDER] Página principal (ainda não implementada)
│   └── api/
│       ├── alunos/
│       │   └── route.ts                      # [API] Busca alunos por filtros ou matrícula
│       ├── filtros/
│       │   └── route.ts                      # [API] Anos letivos e turmas disponíveis
│       └── importacao-estruturada/
│           ├── route.ts                      # [API] Parser de dados colados
│           ├── salvar/route.ts               # [API] Salvar dados pessoais
│           └── salvar-dados-escolares/route.ts # [API] Salvar dados escolares
│
├── components/
│   ├── FluxoCertificacao.tsx                 # [ORQUESTRADOR] Componente principal do fluxo
│   ├── ListaAlunosCertificacao.tsx          # [LISTA] Lista de alunos com indicadores
│   ├── FiltrosCertificacao.tsx              # [FILTROS] Seleção de ano/turma
│   ├── DadosAlunoEditavel.tsx               # [ABA] Fase: Dados Pessoais (editável)
│   ├── DadosAlunoEscolares.tsx              # [ABA] Fase: Dados Escolares (somente leitura)
│   ├── DadosAlunoHistorico.tsx              # [ABA] Fase: Histórico Escolar (tabela)
│   ├── DadosAlunoEmissao.tsx                # [ABA] Fase: Emissão de Documentos
│   ├── CompletudeDocumentos.tsx             # [VISUALIZAÇÃO] Card de completude por documento
│   ├── BotaoColagemAluno.tsx                # [AÇÃO] Toggle de modo colagem
│   ├── AreaColagemDados.tsx                 # [OVERLAY] Área de colagem ativa
│   ├── ModalConfirmacaoDados.tsx            # [MODAL] Confirmação de dados pessoais
│   └── ModalConfirmacaoDadosEscolares.tsx   # [MODAL] Confirmação de dados escolares
│
├── components/ui/                            # [GENÉRICOS] Biblioteca de componentes reutilizáveis
│   ├── AgregadorIconesFases.tsx             # [ESPECÍFICO] Agregador de ícones de fases
│   ├── IconeStatusFase.tsx                  # [ESPECÍFICO] Ícone individual de fase
│   ├── Button.tsx                           # [GENÉRICO] Botão com variants
│   ├── Tabs.tsx                             # [GENÉRICO] Sistema de abas com contexto
│   ├── ScrollableButtonGroup.tsx            # [GENÉRICO] Grupo de botões scrollável
│   ├── Input.tsx                            # [GENÉRICO] Input de texto
│   ├── DateInput.tsx                        # [GENÉRICO] Input de data
│   ├── Select.tsx                           # [GENÉRICO] Select dropdown
│   ├── Textarea.tsx                         # [GENÉRICO] Textarea
│   ├── Modal.tsx                            # [GENÉRICO] Modal/Dialog
│   └── OverflowMenu.tsx                     # [GENÉRICO] Menu kebab/overflow
│
├── hooks/
│   ├── useFiltrosCertificacao.ts            # [ESTADO] Gestão de filtros (ano/turma)
│   ├── useAlunosCertificacao.ts             # [DADOS] Lista de alunos + progresso
│   ├── useAlunoSelecionado.ts               # [ESTADO+DADOS] Aluno ativo + detalhes
│   ├── useModoColagem.ts                    # [ESTADO+AÇÃO] Modo colagem + parsing
│   └── useImportacaoHistoricoEscolar.ts     # [AÇÃO] Upload XLSX histórico
│
├── lib/
│   ├── core/data/gestao-alunos/
│   │   ├── phases.ts                        # [CONFIG] PHASES_CONFIG - fonte única de verdade
│   │   ├── phases.types.ts                  # [TIPOS] Phase, PhaseStatus, DocEmissao
│   │   ├── def-objects/
│   │   │   ├── dadosPessoais.ts             # [SCHEMA] Campos para documentos (Fase 1)
│   │   │   ├── dadosEscolares.ts            # [SCHEMA] Campos para documentos (Fase 2)
│   │   │   └── historicoEscolar.ts          # [SCHEMA] Campos para documentos (Fase 3)
│   │   └── documentos/
│   │       ├── calcularCompletude.ts        # [LÓGICA] Cálculo de completude por def-objects
│   │       ├── types.ts                     # [TIPOS] DadosCertidao, DadosCertificado, etc
│   │       └── layout.ts                    # [CONFIG] Layout visual de documentos
│   │
│   ├── importacao/
│   │   └── dadosPessoaisMetadata.ts         # [METADATA] Config de campos pessoais + validação
│   │
│   └── parsing/                              # [PARSING] Extração de dados de texto colado
│       ├── parseDadosPessoais.ts
│       ├── parseDadosEscolares.ts
│       ├── detectarTipoPagina.ts
│       └── extrairMatriculaDoTexto.ts
│
└── docs/
    ├── features/sistema-fases-gestao-alunos/
    │   ├── CHECKPOINT.md                     # [IDD] Checkpoints de implementação
    │   └── FLUXO.md                          # [IDD] Fluxos de usuário
    └── dry/
        ├── objects/phases.md                 # [DRY] Documentação PHASES_CONFIG
        ├── ui/ui-components.dry.md           # [DRY] Documentação componentes UI
        └── backend/validacao/calcular-completude.md  # [DRY] Documentação lógica
```

---

## 3. CAMADA UI - COMPONENTES

### 3.1 Componente Orquestrador

#### **FluxoCertificacao** ([src/components/FluxoCertificacao.tsx](src/components/FluxoCertificacao.tsx))

**Propósito**: Componente raiz que orquestra todo o fluxo de gestão de alunos.

**Responsabilidades**:
- Integração de todos os hooks customizados
- Renderização dinâmica de abas baseada em `PHASES_CONFIG`
- Gerenciamento de estado global do fluxo (aluno selecionado, aba ativa, modo colagem)
- Coordenação de callbacks entre componentes

**Props**: Nenhuma (componente autônomo)

**Hooks Utilizados**:
- `useFiltrosCertificacao()` - Filtros de ano/turma
- `useAlunosCertificacao(filtros)` - Lista de alunos
- `useAlunoSelecionado()` - Aluno ativo + detalhes
- `useModoColagem({ onDadosConfirmados })` - Modo colagem

**Padrões Aplicados**:
- **Compound Component Pattern**: Usa `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`
- **Render Props via Mapeamento**: `renderConteudoFase()` mapeia cada fase ao componente correto
- **Configuração Dinâmica**: Itera sobre `PHASES` ordenadas para criar UI

**Componentes Filhos Diretos**:
```tsx
<FluxoCertificacao>
  ├── <ListaAlunosCertificacao />      # Esquerda: lista de alunos
  └── <FiltrosCertificacao />          # Direita: filtros
      └── <Tabs variant="secondary">
            ├── TabsList (dinâmica)
            └── TabsContent (dinâmica)
                  ├── <DadosAlunoEditavel />   # Fase 1
                  ├── <DadosAlunoEscolares />  # Fase 2
                  ├── <DadosAlunoHistorico />  # Fase 3
                  └── <DadosAlunoEmissao />    # Fase 4
```

**Mapeamento Fase → Componente**:
```typescript
const renderConteudoFase = (fase: Phase) => {
  if (fase === "FASE:DADOS_PESSOAIS") return <DadosAlunoEditavel />
  if (fase === "FASE:DADOS_ESCOLARES") return <DadosAlunoEscolares />
  if (fase === "FASE:HISTORICO_ESCOLAR") return <DadosAlunoHistorico />
  return <DadosAlunoEmissao />
}
```

**Reutilizável para Emissão de Documentos**: 🔄 **ADAPTAR**
- Estrutura é genérica e reutilizável
- Necessário criar novo conjunto de componentes de aba específicos
- Pode compartilhar FiltrosCertificacao adaptado

---

### 3.2 Componente de Lista

#### **ListaAlunosCertificacao** ([src/components/ListaAlunosCertificacao.tsx](src/components/ListaAlunosCertificacao.tsx))

**Propósito**: Exibe lista de alunos com indicadores de progresso e ações.

**Props**:
```typescript
{
  filtros: FiltrosCertificacaoState;
  alunoSelecionadoId: string | null;
  onSelecionarAluno: (aluno: AlunoCertificacao) => void;
  alunoIdModoColagemAtivo: string | null;
  onToggleModoColagem: (alunoId: string, ativo: boolean) => void;
  alunos: AlunoCertificacao[];
  isLoading: boolean;
  isAtualizando: boolean;
  error: string | null;
  totalAlunos: number;
  resumoDadosPessoais: ResumoDadosPessoaisTurma;
  onImportacaoCompleta?: () => void;
}
```

**Sub-componentes Internos**:
```typescript
function PainelResumoTurma({ resumo }: { resumo: ResumoDadosPessoaisTurma })
function BarraProgressoDadosPessoais({ resumoPessoais, resumoEscolares })
function IndicadoresDadosAluno({ aluno }: { aluno: AlunoCertificacao })
function montarStatusPorFase(aluno: AlunoCertificacao): StatusPorFase
```

**Padrões Identificados**:
- **Estados de Loading**: Exibe mensagens diferentes para loading, erro, vazio
- **Highlight de Seleção**: CSS condicional para aluno selecionado
- **Overflow Menu**: Menu de ações (importar histórico XLSX)
- **Barra de Progresso Composta**: Média de progresso pessoais + escolares

**Componentes UI Utilizados**:
- `Button` (variant="ghost") - Item de aluno clicável
- `AgregadorIconesFases` - 4 ícones de status
- `OverflowMenu` - Menu kebab
- `ModalInfoUpload` - Feedback de importação XLSX
- `BotaoColagemAluno` - Ativar modo colagem

**Função `montarStatusPorFase()`**:
```typescript
// Transforma dados do aluno em estrutura esperada pelo AgregadorIconesFases
// IMPORTANTE: Lógica de mapeamento de status está aqui!
{
  "FASE:DADOS_PESSOAIS": {
    status: mapearStatusPessoais(aluno.progressoDadosPessoais),
    label: "15/20",
    title: "Dados Pessoais: 15/20"
  },
  "FASE:DADOS_ESCOLARES": { ... },
  // ...
}
```

**Reutilizável para Emissão de Documentos**: 🔄 **ADAPTAR**
- Estrutura de lista é genérica
- `montarStatusPorFase()` precisa ser adaptado para contexto de emissão
- Barra de progresso pode ser parametrizada

---

### 3.3 Componente de Filtros

#### **FiltrosCertificacao** ([src/components/FiltrosCertificacao.tsx](src/components/FiltrosCertificacao.tsx))

**Propósito**: Filtros de seleção de turma (ano letivo + turma).

**Props**:
```typescript
{
  anoLetivo: string;
  turma: string;
  anosDisponiveis: string[];
  turmasDisponiveis: string[];
  isLoadingAnos: boolean;
  isLoadingTurmas: boolean;
  onAnoChange: (ano: string) => void;
  onTurmaChange: (turma: string) => void;
  onLimparFiltros: () => void;
  hasFiltrosAtivos: boolean;
}
```

**Componentes UI Utilizados**:
- `ScrollableButtonGroup` - Seleção visual de ano/turma
- `Button` (variant="ghost") - Botão "Limpar"

**Padrões**:
- **Apresentação Pura**: Não mantém estado próprio
- **Formatação de Labels**: `formatTurmaLabel()` remove sufixo após "-"
- **Loading States**: Exibe "Carregando..." enquanto busca dados

**Reutilizável para Emissão de Documentos**: ✅ **SIM**
- Totalmente genérico e reutilizável
- Pode ser renomeado para `FiltrosTurma` ou similar

---

### 3.4 Componentes de Abas (Fases)

#### **DadosAlunoEditavel** ([src/components/DadosAlunoEditavel.tsx](src/components/DadosAlunoEditavel.tsx))

**Propósito**: Exibe e permite edição de dados pessoais do aluno com comparação original.

**Props**:
```typescript
{
  aluno: AlunoDetalhado | null;
  dadosOriginais: DadosOriginaisAluno;
  isLoading: boolean;
  isAtualizando?: boolean;
  erro?: string | null;
}
```

**Funcionalidades**:
- **Edição Local**: Estado `formState` gerenciado localmente (sem salvar automático)
- **Comparação Visual**: Badge "Atualizado"/"Pendente" para cada campo
- **Categorização**: Campos agrupados por categoria (cadastro, documentos, filiação, contato, certidão)
- **Inputs Dinâmicos**: Escolhe componente (Input, DateInput, Textarea, Select) baseado em metadata

**Metadata Utilizada**: `CAMPOS_DADOS_PESSOAIS_CONFIG`, `CATEGORIA_LABELS`

**Sub-componentes**:
```typescript
function CampoComparado({ config, value, valorBanco, valorOriginal, onChange })
function BadgeComparacao({ status }: { status: StatusComparacao })
function escolherInput(tipo: TipoInputCampo)
function extrairValoresDoAluno(aluno: AlunoDetalhado | null): ValoresFormulario
```

**Reutilizável para Emissão de Documentos**: ❌ **NÃO**
- Específico para edição de dados pessoais
- Conceito de "comparação de dados" não se aplica

---

#### **DadosAlunoEscolares** ([src/components/DadosAlunoEscolares.tsx](src/components/DadosAlunoEscolares.tsx))

**Propósito**: Exibe dados escolares do aluno (somente leitura).

**Props**:
```typescript
{
  aluno: AlunoDetalhado | null;
  series: SerieCursadaResumo[];
  isLoading: boolean;
  erro?: string | null;
}
```

**Funcionalidades**:
- **Resumo de Séries**: Card com totais (séries cadastradas, ingresso, último registro, série atual)
- **Dados Escolares Gerais**: Grid com campos (situação, tipo ingresso, rede origem, etc)
- **Tabela de Renovações**: Lista todas as séries cursadas com detalhes

**Sub-componentes**:
```typescript
function ResumoItem({ label, valor }: { label: string; valor: string })
```

**Reutilizável para Emissão de Documentos**: 🔄 **INSPIRAR**
- Padrão de "resumo + tabela de séries" pode ser reutilizado
- Específico para dados escolares, mas estrutura é genérica

---

#### **DadosAlunoHistorico** ([src/components/DadosAlunoHistorico.tsx](src/components/DadosAlunoHistorico.tsx))

**Propósito**: Exibe histórico escolar em formato tabular (disciplinas × séries).

**Props**:
```typescript
{
  aluno: AlunoDetalhado | null;
  series: SerieCursadaResumo[];
  isLoading: boolean;
  erro?: string | null;
}
```

**Funcionalidades**:
- **Tabela Pivotada**: Disciplinas nas linhas, séries nas colunas
- **Normalização**: Disciplinas agrupadas por nome (uppercase)
- **Totais**: Carga horária total por série (tfoot)
- **Card de Dados Pessoais**: Resumo compacto do aluno

**Computação Complexa**:
```typescript
useMemo(() => {
  const seriesOrdenadas = ordenarSeries(series || []);
  const disciplinasOrdenadas = Array.from(disciplinaSet).sort();
  const mapasPorSerie = seriesOrdenadas.map((serie) => {
    const mapa = new Map<string, { totalPontos, cargaHoraria }>();
    // ... constrói mapa de disciplina → dados
    return { serie, mapa };
  });
  return { seriesOrdenadas, disciplinasOrdenadas, mapasPorSerie, disciplinaLabels };
}, [series]);
```

**Reutilizável para Emissão de Documentos**: ❌ **NÃO**
- Altamente específico para visualização de histórico escolar
- Lógica de pivotamento não se aplica

---

#### **DadosAlunoEmissao** ([src/components/DadosAlunoEmissao.tsx](src/components/DadosAlunoEmissao.tsx))

**Propósito**: Interface para pré-visualização e impressão de documentos.

**Props**:
```typescript
{
  aluno: AlunoDetalhado | null;
  series: SerieCursadaResumo[];
  isLoading: boolean;
  erro?: string | null;
  onNavigateToAba?: (abaId: string) => void;
}
```

**Funcionalidades**:
- **Grid de Documentos**: Cards para Certidão, Histórico, Certificado, Diploma
- **Completude por Documento**: Exibe % e campos faltantes
- **Modal de Preview**: PDFViewer com @react-pdf/renderer
- **Impressão em Lote**: Botão "Imprimir todos" (só ativo se todos completos)
- **Navegação entre Abas**: Callback `onNavigateToAba` para ir à aba pendente

**Documentos Configurados**:
```typescript
const documentos = [
  { tipo: "CERTIDAO", titulo: "Certidão", render: () => <TemplateCertidao /> },
  { tipo: "HISTORICO", titulo: "Histórico Escolar", render: () => <TemplateHistoricoEscolar /> },
  { tipo: "CERTIFICADO", titulo: "Certificado", render: () => <TemplateCertificado /> },
  { tipo: "DIPLOMA", titulo: "Diploma", render: () => <TemplateDiploma /> },
];
```

**Cálculo de Completude**: `calcularCompletudeEmissao()` usando def-objects

**Templates PDF Utilizados**:
- `TemplateCertidao`, `CertidaoPage`
- `TemplateCertificado`, `CertificadoPage`
- `TemplateDiploma`, `DiplomaPage`
- `TemplateHistoricoEscolar`, `HistoricoEscolarPage`

**Reutilizável para Emissão de Documentos**: ✨ **ESPECÍFICO DO DOMÍNIO**
- Este É o componente de emissão de documentos!
- Pode ser adaptado para outros tipos de documentos

---

### 3.5 Componentes Genéricos UI

#### **AgregadorIconesFases** ([src/components/ui/AgregadorIconesFases.tsx](src/components/ui/AgregadorIconesFases.tsx))

**Propósito**: Exibe ícones de status para todas as 4 fases ordenadas.

**Props**:
```typescript
{ statusPorFase: StatusPorFase }

type StatusPorFase = Record<Phase, StatusInfoFase>
type StatusInfoFase = { status: PhaseStatus; label: string; title: string }
```

**Padrões**:
- Itera sobre `PHASES` ordenadas por `PHASES_CONFIG[fase].ordem`
- Renderiza `IconeStatusFase` para cada fase
- Fallback para dados ausentes

**Reutilizável para Emissão de Documentos**: ✅ **SIM** (se usar mesmo sistema de fases)

---

#### **IconeStatusFase** ([src/components/ui/IconeStatusFase.tsx](src/components/ui/IconeStatusFase.tsx))

**Propósito**: Ícone individual de status de uma fase.

**Props**:
```typescript
{
  phase: Phase;
  status: PhaseStatus;  // "completo" | "incompleto" | "ausente"
  label: string;
  title: string;
}
```

**Padrões**:
- Importa ícone do Lucide dinamicamente baseado em `PHASES_CONFIG[phase].icone.name`
- Cores condicionais: verde (completo), amarelo (incompleto), vermelho (ausente)
- Tooltip com `title`

**Reutilizável para Emissão de Documentos**: ✅ **SIM** (se usar mesmo sistema de fases)

---

#### **Button** ([src/components/ui/Button.tsx](src/components/ui/Button.tsx))

**Propósito**: Botão genérico com variants e tamanhos.

**Props**:
```typescript
{
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  children?: ReactNode;
  // + todos os atributos nativos de <button>
}
```

**Reutilizável para Emissão de Documentos**: ✅ **SIM** (totalmente genérico)

---

#### **Tabs, TabsList, TabsTrigger, TabsContent** ([src/components/ui/Tabs.tsx](src/components/ui/Tabs.tsx))

**Propósito**: Sistema de abas com contexto React.

**Variants**: `"default"` | `"secondary"` | `"tertiary"`

**Padrões**:
- Compound Component Pattern com Context API
- Estado gerenciado internamente (aba ativa)
- Variants afetam espaçamento e tamanho de texto

**Reutilizável para Emissão de Documentos**: ✅ **SIM** (totalmente genérico)

---

#### **ScrollableButtonGroup** ([src/components/ui/ScrollableButtonGroup.tsx](src/components/ui/ScrollableButtonGroup.tsx))

**Propósito**: Grupo de botões horizontais para seleção única (tipo "pill buttons").

**Props**:
```typescript
{
  options: string[];
  value: string;
  onChange: (value: string) => void;
  getItemLabel?: (option: string) => string;
  getItemTitle?: (option: string) => string;
}
```

**Reutilizável para Emissão de Documentos**: ✅ **SIM** (totalmente genérico)

---

#### **Modal, ModalHeader, ModalFooter** ([src/components/ui/Modal.tsx](src/components/ui/Modal.tsx))

**Propósito**: Modal/Dialog genérico com overlay.

**Props**:
```typescript
{
  open: boolean;
  onClose: () => void;
  title?: string;
  size?: "sm" | "md" | "lg" | "xl";
  children: React.ReactNode;
}
```

**Funcionalidades**:
- Fechar com ESC
- Fechar clicando no overlay
- Previne scroll do body quando aberto
- Animação de entrada

**Reutilizável para Emissão de Documentos**: ✅ **SIM** (totalmente genérico)

---

#### **Input, DateInput, Textarea, Select** ([src/components/ui/](src/components/ui/))

**Propósito**: Inputs de formulário estilizados.

**Reutilizável para Emissão de Documentos**: ✅ **SIM** (totalmente genéricos)

---

### 3.6 Componentes Auxiliares

#### **CompletudeDocumentos** ([src/components/CompletudeDocumentos.tsx](src/components/CompletudeDocumentos.tsx))

**Propósito**: Card expansível mostrando completude de cada documento.

**Props**: `{ completude: ResumoCompletudeEmissao; onNavigateToAba?: (abaId: string) => void }`

**Reutilizável para Emissão de Documentos**: ✅ **SIM** (específico de emissão)

---

#### **BotaoColagemAluno** ([src/components/BotaoColagemAluno.tsx](src/components/BotaoColagemAluno.tsx))

**Propósito**: Toggle para ativar modo colagem de dados.

**Reutilizável para Emissão de Documentos**: ❌ **NÃO** (específico de gestão de alunos)

---

#### **AreaColagemDados** ([src/components/AreaColagemDados.tsx](src/components/AreaColagemDados.tsx))

**Propósito**: Overlay que captura eventos de paste.

**Reutilizável para Emissão de Documentos**: ❌ **NÃO** (específico de gestão de alunos)

---

#### **ModalConfirmacaoDados, ModalConfirmacaoDadosEscolares**

**Propósito**: Modais de confirmação de dados parseados.

**Reutilizável para Emissão de Documentos**: ❌ **NÃO** (específicos de importação)

---

## 4. CAMADA LÓGICA - HOOKS

### 4.1 Hooks Genéricos (Reutilizáveis)

#### **useFiltrosCertificacao** ([src/hooks/useFiltrosCertificacao.ts](src/hooks/useFiltrosCertificacao.ts))

**Propósito**: Gerencia estado de filtros (ano letivo, turma) com busca automática de opções.

**Estado Gerenciado**:
```typescript
{
  anoLetivo: string;
  turma: string;
  anosDisponiveis: string[];
  turmasDisponiveis: string[];
  isLoadingAnos: boolean;
  isLoadingTurmas: boolean;
}
```

**Efeitos**:
- `useEffect` inicial: Busca anos disponíveis, seleciona o mais recente
- `useEffect` quando `anoLetivo` muda: Busca turmas, seleciona a primeira

**API Utilizada**:
- `GET /api/filtros?anoLetivo=&regime=0&modalidade=REGULAR&serie=3`

**Padrões**:
- **Seleção Automática**: Pré-seleciona ano mais recente e primeira turma
- **Ordenação de Turmas**: Lógica customizada `getTurmaSortKey()`

**Reutilizável para Emissão de Documentos**: ✅ **SIM**
- Pode ser parametrizado para diferentes séries/modalidades
- Renomear para `useFiltrosTurma` genérico

---

### 4.2 Hooks Específicos (Domínio de Alunos)

#### **useAlunosCertificacao** ([src/hooks/useAlunosCertificacao.ts](src/hooks/useAlunosCertificacao.ts))

**Propósito**: Busca lista de alunos com cálculo de progresso de fases.

**Parâmetros**:
```typescript
filtros: { anoLetivo: string; turma: string }
```

**Dados Retornados**:
```typescript
{
  alunos: AlunoCertificacao[];  // Alunos + progresso calculado
  isLoading: boolean;
  isAtualizando: boolean;
  error: string | null;
  totalAlunos: number;
  resumoDadosPessoais: ResumoDadosPessoaisTurma;
  refreshAlunos: () => Promise<void>;
}
```

**Tipo `AlunoCertificacao`**:
```typescript
type AlunoCertificacao = AlunoApiResponse & {
  progressoDadosPessoais: ResumoDadosPessoaisCompletude;
  progressoDadosEscolares: ResumoDadosEscolares;
  progressoHistoricoEscolar: ResumoHistoricoEscolar;
  progressoEmissaoDocumentos: ResumoCompletudeEmissao;
}
```

**Padrões**:
- **SWR**: Cache e revalidação automática
- **Transformação de Dados**: Calcula completude client-side usando `calcularCompletude*()` helpers
- **Resumo Agregado**: `useMemo` para calcular resumo da turma

**Reutilizável para Emissão de Documentos**: 🔄 **ADAPTAR**
- Lógica de busca e cache é reutilizável
- Cálculo de progresso deve ser adaptado

---

#### **useAlunoSelecionado** ([src/hooks/useAlunoSelecionado.ts](src/hooks/useAlunoSelecionado.ts))

**Propósito**: Gerencia aluno ativo e busca detalhes completos.

**Estado Gerenciado**:
```typescript
{
  alunoSelecionado: AlunoCertificacao | null;  // Aluno da lista
  alunoDetalhes: AlunoDetalhado | null;        // Dados completos do banco
  seriesCursadas: SerieCursadaResumo[];
  dadosOriginais: DadosOriginaisAluno;
  isLoadingDetalhes: boolean;
  erroDetalhes: string | null;
  isAtualizandoDetalhes: boolean;
}
```

**Ações**:
```typescript
{
  selecionarAluno: (aluno: AlunoCertificacao | null) => void;
  limparSelecao: () => void;
  refreshAlunoSelecionado: () => Promise<void>;
}
```

**API Utilizada**:
- `GET /api/alunos?matricula={matricula}`

**Padrões**:
- **SWR**: Só busca detalhes se há aluno selecionado
- **Serialização**: Função `serializarValor()` converte datas e objetos para strings
- **Mapeamento de Aliases**: Trata aliases de campos (ex: `rgOrgaoEmissor` vs `orgaoEmissor`)

**Reutilizável para Emissão de Documentos**: ✅ **SIM**
- Totalmente genérico (busca dados de aluno)

---

#### **useModoColagem** ([src/hooks/useModoColagem.ts](src/hooks/useModoColagem.ts))

**Propósito**: Gerencia modo de colagem de dados estruturados (copy/paste).

**Estado Gerenciado**:
```typescript
{
  alunoIdAtivo: string | null;
  dadosParsed: DadosPessoais | null;
  dadosEscolaresParsed: DadosEscolaresParseResult | null;
  tipoPaginaDetectada: TipoPagina | null;
  precisaConfirmarSexo: boolean;
  isProcessando: boolean;
  isSalvando: boolean;
  modalAberto: boolean;
  erro: string | null;
  mensagemSucesso: string | null;
  textoBruto: string | null;
}
```

**Ações**:
```typescript
{
  ativarModoColagem: (alunoId: string) => void;
  desativarModoColagem: () => void;
  handlePaste: (texto: string, matricula: string, alunoId: string) => Promise<void>;
  fecharModal: () => void;
  confirmarDados: (dados: DadosPessoais, sexoConfirmado?: "M" | "F") => Promise<void>;
  confirmarDadosEscolares: (dados: DadosEscolaresParseResult) => Promise<void>;
}
```

**APIs Utilizadas**:
- `POST /api/importacao-estruturada` - Parser de dados
- `POST /api/importacao-estruturada/salvar` - Salvar dados pessoais
- `POST /api/importacao-estruturada/salvar-dados-escolares` - Salvar dados escolares

**Fluxo**:
1. Usuário cola texto → `handlePaste()`
2. Valida matrícula no texto
3. Envia para API de parsing
4. Exibe modal de confirmação
5. Usuário confirma → `confirmarDados()` ou `confirmarDadosEscolares()`
6. Salva no banco
7. Callback `onDadosConfirmados()`

**Reutilizável para Emissão de Documentos**: ❌ **NÃO**
- Específico para importação de dados estruturados

---

#### **useImportacaoHistoricoEscolar** ([src/hooks/useImportacaoHistoricoEscolar.ts](src/hooks/useImportacaoHistoricoEscolar.ts))

**Propósito**: Gerencia upload e importação de arquivos XLSX de histórico escolar.

**Reutilizável para Emissão de Documentos**: ❌ **NÃO**
- Específico para importação XLSX

---

### 4.3 Padrões de Estado

#### **Gestão de Estado por Camadas**

1. **Estado Local (useState)**:
   - Formulários não salvos (`DadosAlunoEditavel`)
   - UI transitória (modais abertos, abas ativas)

2. **Estado Server (SWR)**:
   - Lista de alunos (`useAlunosCertificacao`)
   - Detalhes de aluno (`useAlunoSelecionado`)
   - Cache automático, revalidação

3. **Estado de Ação (Custom Hooks)**:
   - Modo colagem (`useModoColagem`)
   - Importação (`useImportacaoHistoricoEscolar`)
   - Loading/erro/sucesso encapsulados

4. **Estado de Filtros (Custom Hook)**:
   - Filtros persistem durante sessão
   - Efeitos colaterais (buscar turmas quando ano muda)

---

## 5. CAMADA BACKEND

### 5.1 Server Actions / API Routes

#### **GET /api/alunos** ([src/app/api/alunos/route.ts](src/app/api/alunos/route.ts))

**Casos de Uso**:

**1. Buscar Aluno por Matrícula**:
```
GET /api/alunos?matricula=123456
```

**Retorno**:
```typescript
{
  aluno: Aluno & {
    linhaOrigem: LinhaImportada & { arquivo: ArquivoImportado };
    seriesCursadas: SerieCursada & { historicos: HistoricoEscolar[] }[];
    enturmacoes: Enturmacao[];
  };
  comparacao: { matricula: { atual, original, editado }, ... };
  fonteArquivo: string | null;
}
```

**2. Listar Alunos por Filtros**:
```
GET /api/alunos?anoLetivo=2024&regime=0&modalidade=REGULAR&serie=3&turma=31
```

**Retorno**:
```typescript
{
  alunos: Array<Aluno & {
    seriesCursadas: Array<SerieCursada & { _count: { historicos: number } }>;
  }>;
}
```

**Lógica de Negócio**:
- Filtro por enturmação (via `enturmacoes.some()`)
- Include de relacionamentos (seriesCursadas, historicos, linhaOrigem)
- Ordenação por nome

**Reutilizável para Emissão de Documentos**: ✅ **SIM**
- Mesma API, mesmos dados

---

#### **GET /api/filtros** ([src/app/api/filtros/route.ts](src/app/api/filtros/route.ts))

**Retorno**:
```typescript
{
  tipo: "anos" | "regimes" | "modalidades" | "series" | "turmas";
  dados: string[];
}
```

**Lógica**:
- Prisma `distinct` para valores únicos
- Ordenação alfabética
- Cache implícito (valores mudam pouco)

**Reutilizável para Emissão de Documentos**: ✅ **SIM**

---

#### **POST /api/importacao-estruturada** ([src/app/api/importacao-estruturada/route.ts](src/app/api/importacao-estruturada/route.ts))

**Entrada**:
```typescript
{
  texto: string;
  matricula: string;
  alunoId: string;
}
```

**Retorno**:
```typescript
{
  sucesso: boolean;
  tipoPagina: "dadosPessoais" | "dadosEscolares";
  dados: DadosPessoais | DadosEscolaresParseResult;
  precisaConfirmarSexo?: boolean;
  erro?: string;
}
```

**Lógica**:
1. Detecta tipo de página (`detectarTipoPagina()`)
2. Parseia dados (`parseDadosPessoais()` ou `parseDadosEscolares()`)
3. Valida matrícula
4. Retorna dados parseados para confirmação

**Reutilizável para Emissão de Documentos**: ❌ **NÃO**

---

#### **POST /api/importacao-estruturada/salvar**

**Entrada**:
```typescript
{
  alunoId: string;
  textoBruto: string;
  dados: DadosPessoais;
}
```

**Lógica**:
1. Valida `alunoId`
2. Transação Prisma:
   - Atualiza campos do `Aluno`
   - Salva `textoBrutoDadosPessoais` e `dataImportacaoTextoDadosPessoais`
3. Cria auditoria

**Reutilizável para Emissão de Documentos**: ❌ **NÃO**

---

#### **POST /api/importacao-estruturada/salvar-dados-escolares**

Similar ao anterior, mas para dados escolares.

**Reutilizável para Emissão de Documentos**: ❌ **NÃO**

---

### 5.2 Regras de Negócio

#### **Cálculo de Completude** ([src/lib/core/data/gestao-alunos/documentos/calcularCompletude.ts](src/lib/core/data/gestao-alunos/documentos/calcularCompletude.ts))

**Funções Principais**:

```typescript
// Calcula completude de um documento específico
calcularCompletudeDocumento(documento: DocEmissao, dadosAluno): CompletudeDocumento

// Calcula completude geral de emissão (todos os documentos)
calcularCompletudeEmissao(dadosAluno): ResumoCompletudeEmissao

// Calcula completude de uma fase
calcularCompletudeFase(fase: Phase, dadosAluno): CompletudeItem

// Funções específicas por fase
calcularCompletudeDadosPessoais(dadosAluno): ResumoDadosPessoaisCompletude
calcularCompletudeDadosEscolares(dadosAluno): ResumoDadosEscolares
calcularCompletudeHistoricoEscolar(dadosAluno): ResumoHistoricoEscolar
```

**Lógica**:
1. Itera sobre `def-objects` (schemas)
2. Para cada campo, verifica se está preenchido (`campoEstaPreenchido()`)
3. Diferencia tabelas: `Aluno`, `SerieCursada`, `HistoricoEscolar`
4. Calcula percentual e status (`completo`, `incompleto`, `ausente`)
5. Retorna lista de campos faltantes

**Padrão**: **Fonte Única de Verdade**
- Toda validação usa `def-objects` como referência
- Garante que documentos e fases avaliam os mesmos campos

**Reutilizável para Emissão de Documentos**: ✅ **SIM**
- Essencial para emissão de documentos

---

### 5.3 Schemas de Validação

#### **def-objects** ([src/lib/core/data/gestao-alunos/def-objects/](src/lib/core/data/gestao-alunos/def-objects/))

**Estrutura**:
```typescript
type PhaseSchema<T extends Phase> = {
  [Modelo in ModelosPrismaFluxo]: {
    [campo: string]: DocEmissao[];
  };
}

// Exemplo: dadosPessoais.ts
const dadosPessoais: PhaseSchema<"FASE:DADOS_PESSOAIS"> = {
  Aluno: {
    matricula: ["Histórico Escolar"],
    nome: ["Certidão", "Certificado", "Diploma", "Histórico Escolar"],
    dataNascimento: ["Certidão", "Certificado", "Diploma", "Histórico Escolar"],
    rg: ["Certidão", "Certificado", "Diploma"],
    // ...
  }
}
```

**Propósito**:
- Mapeia cada campo de cada tabela para os documentos que o utilizam
- Permite calcular completude de forma precisa
- Serve como documentação técnica

**Arquivos**:
- `dadosPessoais.ts` - Campos da tabela `Aluno` usados em documentos (Fase 1)
- `dadosEscolares.ts` - Campos de `Aluno` e `SerieCursada` (Fase 2)
- `historicoEscolar.ts` - Campos de `SerieCursada` e `HistoricoEscolar` (Fase 3)

**Reutilizável para Emissão de Documentos**: ✅ **SIM**
- Fundamental para validação de documentos

---

#### **dadosPessoaisMetadata** ([src/lib/importacao/dadosPessoaisMetadata.ts](src/lib/importacao/dadosPessoaisMetadata.ts))

**Propósito**: Configuração de campos de dados pessoais para edição.

**Estrutura**:
```typescript
type CampoDadosPessoaisConfig = {
  campo: CampoDadosPessoais;
  label: string;
  categoria: CategoriaDadosPessoais;  // "cadastro" | "documentos" | "filiacao" | etc
  input?: TipoInputCampo;             // "text" | "date" | "select" | "textarea"
  options?: Array<{ value: string; label: string }>;
}

const CAMPOS_DADOS_PESSOAIS_CONFIG: CampoDadosPessoaisConfig[] = [
  { campo: "matricula", label: "Matrícula", categoria: "cadastro", input: "text" },
  { campo: "nome", label: "Nome Completo", categoria: "cadastro", input: "text" },
  // ...
];
```

**Reutilizável para Emissão de Documentos**: 🔄 **INSPIRAR**
- Padrão de metadata pode ser aplicado a outros domínios

---

## 6. CAMADA DADOS

### 6.1 Modelos Prisma

**Modelos Principais Utilizados**:

```prisma
model Aluno {
  id                String   @id @default(cuid())
  matricula         String   @unique
  nome              String?
  sexo              String?
  dataNascimento    DateTime?
  rg                String?
  rgOrgaoEmissor    String?
  cpf               String?
  nomeMae           String?
  nomePai           String?

  // Dados escolares
  situacaoEscolar             String?
  anoIngressoEscolar          Int?
  periodoIngressoEscolar      Int?
  matrizCurricularEscolar     String?

  // Auditoria
  criadoEm          DateTime @default(now())
  atualizadoEm      DateTime @updatedAt

  // Relacionamentos
  linhaOrigemId     String?
  linhaOrigem       LinhaImportada? @relation(...)
  seriesCursadas    SerieCursada[]
  enturmacoes       Enturmacao[]
}

model SerieCursada {
  id                String   @id @default(cuid())
  alunoMatricula    String
  anoLetivo         String
  periodoLetivo     String
  serie             String?
  segmento          String?
  modalidade        String?
  unidadeEnsino     String?
  turno             String?
  cargaHorariaTotal Int?

  aluno             Aluno @relation(...)
  historicos        HistoricoEscolar[]
}

model HistoricoEscolar {
  id                    String  @id @default(cuid())
  serieCursadaId        String
  componenteCurricular  String?
  totalPontos           Decimal?
  cargaHoraria          Int?
  frequencia            Decimal?
  faltasTotais          Int?

  serieCursada          SerieCursada @relation(...)
}

model Enturmacao {
  id            String @id @default(cuid())
  matricula     String
  anoLetivo     String
  regime        Int
  modalidade    String
  serie         String
  turma         String

  aluno         Aluno @relation(...)
}

model LinhaImportada {
  id              String @id @default(cuid())
  arquivoId       String
  dadosOriginais  Json

  arquivo         ArquivoImportado @relation(...)
  alunos          Aluno[]
}
```

**Relacionamentos**:
```
Aluno (1) ─── (n) SerieCursada (1) ─── (n) HistoricoEscolar
  │
  └─── (n) Enturmacao
  │
  └─── (1) LinhaImportada ─── (1) ArquivoImportado
```

---

### 6.2 Tipos TypeScript

**Tipos Derivados de Modelos**:
```typescript
// Prisma auto-generated
Aluno, SerieCursada, HistoricoEscolar, Enturmacao

// Tipos estendidos
type AlunoDetalhado = Aluno & {
  /* campos adicionais para UI */
}

type AlunoCertificacao = AlunoApiResponse & {
  progressoDadosPessoais: ResumoDadosPessoaisCompletude;
  progressoDadosEscolares: ResumoDadosEscolares;
  progressoHistoricoEscolar: ResumoHistoricoEscolar;
  progressoEmissaoDocumentos: ResumoCompletudeEmissao;
}

type SerieCursadaResumo = {
  id: string;
  anoLetivo: string;
  periodoLetivo: string;
  // ... campos essenciais
  historicos?: Array<{ /* resumo */ }>;
}
```

**Tipos de Configuração**:
```typescript
// phases.types.ts
type Phase =
  | "FASE:DADOS_PESSOAIS"
  | "FASE:DADOS_ESCOLARES"
  | "FASE:HISTORICO_ESCOLAR"
  | "FASE:EMISSAO_DOCUMENTOS"

type PhaseStatus = "completo" | "incompleto" | "ausente"

type DocEmissao =
  | "Certidão"
  | "Certificado"
  | "Diploma"
  | "Histórico Escolar"

type PhaseSchema<T extends Phase> = {
  [Modelo in ModelosPrismaFluxo]: {
    [campo: string]: DocEmissao[];
  };
}

type Schema<T extends Phase> = {
  titulo: string;
  camposExigidos: PhaseSchema<T>;
  icone: { name: string; lib: "Lucide" | "SVG" };
  abaId: string;
  ordem: number;
}
```

---

### 6.3 Transformações

**DB → UI**:

1. **Serialização de Datas**:
```typescript
function serializarValor(valor: unknown): string | null {
  if (valor instanceof Date) return valor.toISOString();
  // ...
}
```

2. **Normalização de Datas para Input**:
```typescript
function normalizarDataParaInput(valor: string | null): string {
  if (!valor) return "";
  const data = new Date(valor);
  return data.toISOString().split("T")[0];  // "YYYY-MM-DD"
}
```

3. **Mapeamento de Aliases**:
```typescript
// rgOrgaoEmissor vs orgaoEmissor
const alias = CAMPOS_DADOS_PESSOAIS_ALIASES[campo];
const valor = raw[campo] ?? (alias ? raw[alias] : undefined);
```

**UI → DB**:

1. **Dados Parseados → Prisma Update**:
```typescript
await prisma.aluno.update({
  where: { id: alunoId },
  data: {
    nome: dados.nome,
    dataNascimento: dados.dataNascimento ? new Date(dados.dataNascimento) : null,
    // ...
  }
});
```

**Computações Derivadas**:

1. **Cálculo de Progresso**:
```typescript
// Client-side, após buscar dados
const progressoDadosPessoais = calcularCompletudeDadosPessoais(aluno);
```

2. **Agregação de Resumo**:
```typescript
const resumoDadosPessoais = useMemo(() => {
  const completos = alunos.filter(a => a.progressoDadosPessoais.completo).length;
  const percentualGeral = Math.round((completos / alunos.length) * 100);
  return { total: alunos.length, completos, pendentes, percentualGeral };
}, [alunos]);
```

---

## 7. FLUXOS PRINCIPAIS

### 7.1 Fluxo: Filtrar e Visualizar Alunos

```
[Usuário] Acessa painel
    ↓
[useFiltrosCertificacao] Busca anos letivos disponíveis
    ↓ (useEffect inicial)
[GET /api/filtros?regime=0&serie=3] Retorna anos: ["2024", "2023", ...]
    ↓
[useFiltrosCertificacao] Seleciona ano mais recente (2024)
    ↓ (useEffect quando ano muda)
[GET /api/filtros?anoLetivo=2024&regime=0&modalidade=REGULAR&serie=3] Retorna turmas: ["31", "32", ...]
    ↓
[useFiltrosCertificacao] Seleciona primeira turma (31)
    ↓
[useAlunosCertificacao] Detecta mudança em filtros
    ↓ (SWR fetch)
[GET /api/alunos?anoLetivo=2024&regime=0&modalidade=REGULAR&serie=3&turma=31]
    ↓
[Prisma] Busca alunos com enturmações correspondentes + seriesCursadas
    ↓
[useAlunosCertificacao] Calcula progresso de cada fase (client-side)
    ↓
[ListaAlunosCertificacao] Renderiza lista com ícones de status
```

---

### 7.2 Fluxo: Selecionar Aluno e Ver Detalhes

```
[Usuário] Clica em aluno na lista
    ↓
[FluxoCertificacao] handleSelecionarAluno(aluno)
    ↓
[useAlunoSelecionado] selecionarAluno(aluno)
    ↓ (setState + SWR refetch)
[GET /api/alunos?matricula={matricula}]
    ↓
[Prisma] Busca aluno com:
  - linhaOrigem (dados originais)
  - seriesCursadas (com historicos)
  - enturmacoes
    ↓
[useAlunoSelecionado] Mapeia resposta → AlunoDetalhado
    ↓
[FluxoCertificacao] Detecta alunoDetalhes preenchido
    ↓
[DadosAlunoEditavel] Renderiza campos com comparação original vs atual
```

---

### 7.3 Fluxo: Modo Colagem (Dados Pessoais)

```
[Usuário] Seleciona aluno → clica "Ativar Modo Colagem"
    ↓
[BotaoColagemAluno] onToggleModoColagem(alunoId, true)
    ↓
[useModoColagem] ativarModoColagem(alunoId)
    ↓
[FluxoCertificacao] Detecta alunoIdAtivo
    ↓
[AreaColagemDados] Renderiza overlay com listener de paste
    ↓
[Usuário] Cola texto (Ctrl+V)
    ↓
[AreaColagemDados] onPaste → handlePaste(texto, matricula, alunoId)
    ↓
[useModoColagem] Valida matrícula no texto
    ↓
[POST /api/importacao-estruturada] { texto, matricula, alunoId }
    ↓
[API] detectarTipoPagina(texto) → "dadosPessoais"
    ↓
[API] parseDadosPessoais(texto) → { nome, cpf, rg, ... }
    ↓
[useModoColagem] Recebe dados parseados → abre modal
    ↓
[ModalConfirmacaoDados] Exibe dados para revisão
    ↓
[Usuário] Confirma sexo (se necessário) → clica "Salvar"
    ↓
[useModoColagem] confirmarDados(dados, sexoConfirmado)
    ↓
[POST /api/importacao-estruturada/salvar] { alunoId, textoBruto, dados }
    ↓
[Prisma] Transaction:
  - aluno.update({ nome, cpf, rg, ... })
  - aluno.update({ textoBrutoDadosPessoais, dataImportacao })
    ↓
[useModoColagem] Callback: onDadosConfirmados(alunoId)
    ↓
[FluxoCertificacao] refreshAlunoSelecionado() + refreshAlunos()
    ↓
[UI] Atualiza lista + detalhes com novos dados
```

---

### 7.4 Fluxo: Navegar entre Abas

```
[Usuário] Clica em aba "Histórico Escolar"
    ↓
[TabsTrigger] setActiveTab("historico")
    ↓
[TabsContext] Atualiza estado interno
    ↓
[TabsContent] Renderiza conteúdo apenas se value === activeTab
    ↓
[DadosAlunoHistorico] Monta tabela pivotada:
  - seriesOrdenadas (useMemo)
  - disciplinasOrdenadas
  - mapasPorSerie (disciplina → dados por série)
    ↓
[UI] Exibe tabela com disciplinas × séries
```

---

### 7.5 Fluxo: Emitir Documento (Certidão)

```
[Usuário] Navega para aba "Emissão de Documentos"
    ↓
[DadosAlunoEmissao] Renderiza
    ↓ (useMemo)
Calcula completude: calcularCompletudeEmissao(aluno)
    ↓
[calcularCompletudeEmissao] Itera sobre def-objects:
  - Verifica campos de "Certidão"
  - Retorna: { statusGeral: "completo", porDocumento: { "Certidão": { status: "completo", ... } } }
    ↓
[DadosAlunoEmissao] Exibe grid de documentos com status
    ↓
[Usuário] Clica "Imprimir" em "Certidão"
    ↓
[DadosAlunoEmissao] setDocumentoSelecionado("CERTIDAO")
    ↓
[Modal] Abre com PDFViewer
    ↓
[TemplateCertidao] Renderiza PDF com dados do aluno
    ↓
[PDFViewer] Exibe preview
    ↓
[Usuário] Imprime via browser (Ctrl+P)
```

---

## 8. ANÁLISE DE REUTILIZAÇÃO

### ✅ REUTILIZAR DIRETAMENTE

**Componentes UI Genéricos**:
- [Button](src/components/ui/Button.tsx) - Totalmente genérico, variants e tamanhos configuráveis
- [Tabs, TabsList, TabsTrigger, TabsContent](src/components/ui/Tabs.tsx) - Sistema de abas universal
- [ScrollableButtonGroup](src/components/ui/ScrollableButtonGroup.tsx) - Seleção de opções (anos, turmas, categorias)
- [Input, DateInput, Textarea, Select](src/components/ui/) - Inputs de formulário
- [Modal, ModalHeader, ModalFooter](src/components/ui/Modal.tsx) - Modais/dialogs
- [OverflowMenu](src/components/ui/OverflowMenu.tsx) - Menu kebab/overflow

**Hooks**:
- [useFiltrosCertificacao](src/hooks/useFiltrosCertificacao.ts) → `useFiltrosTurma` (generalizar)
- [useAlunoSelecionado](src/hooks/useAlunoSelecionado.ts) - Busca detalhes de aluno

**Lógica Backend**:
- [calcularCompletudeEmissao()](src/lib/core/data/gestao-alunos/documentos/calcularCompletude.ts) - Essencial para validação de documentos
- [calcularCompletudeDocumento()](src/lib/core/data/gestao-alunos/documentos/calcularCompletude.ts) - Validação por documento
- [def-objects](src/lib/core/data/gestao-alunos/def-objects/) - Schemas de campos por documento

**APIs**:
- [GET /api/alunos](src/app/api/alunos/route.ts) - Mesmos dados
- [GET /api/filtros](src/app/api/filtros/route.ts) - Mesmas opções

---

### 🔄 ADAPTAR/INSPIRAR

**Componentes Específicos que Servem de Modelo**:

1. **[AgregadorIconesFases](src/components/ui/AgregadorIconesFases.tsx) + [IconeStatusFase](src/components/ui/IconeStatusFase.tsx)**
   - **Conceito**: Indicadores visuais de status
   - **Adaptação**: Trocar fases por etapas de emissão (ex: "Validação", "Geração PDF", "Assinatura")

2. **[ListaAlunosCertificacao](src/components/ListaAlunosCertificacao.tsx)**
   - **Conceito**: Lista com indicadores de progresso
   - **Adaptação**: Lista de documentos a emitir com status
   - **Função `montarStatusPorFase()`**: Adaptar para `montarStatusPorDocumento()`

3. **[DadosAlunoEmissao](src/components/DadosAlunoEmissao.tsx)**
   - **Conceito**: Grid de documentos com preview e validação
   - **Adaptação**: Este É o componente de emissão! Pode ser base

4. **[CompletudeDocumentos](src/components/CompletudeDocumentos.tsx)**
   - **Conceito**: Expandir detalhes de completude
   - **Adaptação**: Reutilizar diretamente para mostrar campos faltantes

5. **[FiltrosCertificacao](src/components/FiltrosCertificacao.tsx)**
   - **Conceito**: Filtros hierárquicos (ano → turma)
   - **Adaptação**: Filtros de tipo de documento, período, status

---

### ✨ ESPECÍFICO DO DOMÍNIO (Não Reutilizar)

**Componentes de Gestão de Alunos**:
- [DadosAlunoEditavel](src/components/DadosAlunoEditavel.tsx) - Edição de dados pessoais com comparação
- [DadosAlunoEscolares](src/components/DadosAlunoEscolares.tsx) - Visualização de dados escolares
- [DadosAlunoHistorico](src/components/DadosAlunoHistorico.tsx) - Tabela pivotada de histórico
- [BotaoColagemAluno](src/components/BotaoColagemAluno.tsx) - Modo colagem
- [AreaColagemDados](src/components/AreaColagemDados.tsx) - Overlay de colagem
- [ModalConfirmacaoDados](src/components/ModalConfirmacaoDados.tsx) - Confirmação de parsing

**Hooks Específicos**:
- [useModoColagem](src/hooks/useModoColagem.ts) - Parsing de dados colados
- [useImportacaoHistoricoEscolar](src/hooks/useImportacaoHistoricoEscolar.ts) - Upload XLSX

**APIs Específicas**:
- [/api/importacao-estruturada/*](src/app/api/importacao-estruturada/) - Parsing e salvamento

---

## 9. RECOMENDAÇÕES ARQUITETURAIS

### 9.1 Padrões Identificados

#### **1. Fonte Única de Verdade (Single Source of Truth)**

**Aplicação**: `PHASES_CONFIG` centraliza toda configuração de fases.

**Benefícios**:
- Mudanças em um lugar refletem em toda aplicação
- Evita duplicação e inconsistências
- Facilita manutenção

**Recomendação**: Criar configuração similar para "Painel de Emissão de Documentos":
```typescript
const DOCUMENTOS_CONFIG = {
  "CERTIDAO": {
    titulo: "Certidão",
    template: TemplateCertidao,
    icone: { name: "FileCheck", lib: "Lucide" },
    ordem: 1,
    // ...
  },
  // ...
}
```

---

#### **2. Componentização em Camadas**

**Estrutura Observada**:
```
Orquestrador (FluxoCertificacao)
    ↓
Containers (ListaAlunos, Filtros, Abas)
    ↓
Apresentação (DadosAluno*, Modais)
    ↓
UI Genéricos (Button, Tabs, Input)
```

**Recomendação**: Seguir mesma hierarquia no novo painel.

---

#### **3. Hooks para Separação de Concerns**

**Padrão**:
- **Dados**: `useAlunosCertificacao`, `useAlunoSelecionado` (SWR)
- **Estado UI**: `useFiltrosCertificacao`, `abaAtiva` (useState)
- **Ações**: `useModoColagem`, `useImportacaoHistoricoEscolar` (state machine)

**Recomendação**: Criar hooks específicos:
- `useDocumentosEmissao()` - Lista de documentos a emitir
- `useFiltrosEmissao()` - Filtros de tipo, status, período
- `useGeracaoPDF()` - Gerenciar geração de PDF

---

#### **4. Server State Management com SWR**

**Benefícios Observados**:
- Cache automático
- Revalidação em foco
- Loading/error states gerenciados
- `mutate()` para refresh manual

**Configuração Padrão**:
```typescript
useSWR(chave, fetcher, {
  keepPreviousData: true,
  revalidateOnFocus: false,
})
```

**Recomendação**: Usar mesma configuração para dados de emissão.

---

#### **5. Validação Baseada em Schema (def-objects)**

**Padrão**:
- Schemas definem campos necessários por documento
- Lógica de completude usa schemas como referência
- Convergência entre validação de fases e documentos

**Recomendação**:
- Manter def-objects como fonte de validação
- Adicionar schemas para novos documentos se necessário

---

#### **6. Compound Components Pattern**

**Exemplo**: `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent` com Context API

**Benefícios**:
- API declarativa e intuitiva
- Encapsulamento de estado
- Flexibilidade de composição

**Recomendação**: Usar para componentes complexos que requerem coordenação.

---

#### **7. Transformações Client-Side**

**Padrão Observado**:
- API retorna dados brutos
- Cálculos de progresso feitos no cliente (`useAlunosCertificacao`)
- Formatações e ordenações em `useMemo`

**Vantagens**:
- Backend simplificado (apenas CRUD)
- Lógica de apresentação no frontend
- Menor carga no servidor

**Desvantagens**:
- Pode impactar performance com muitos alunos
- Cálculos repetidos em cada cliente

**Recomendação**:
- Manter para cálculos leves (completude)
- Considerar mover para backend se performance for problema

---

#### **8. Estados de Loading/Erro Consistentes**

**Padrão**:
```typescript
if (isLoading) return <LoadingState />
if (erro) return <ErrorState erro={erro} />
if (!dados) return <EmptyState />
return <Content />
```

**Recomendação**: Criar componentes genéricos:
```typescript
<QueryState
  isLoading={isLoading}
  erro={erro}
  isEmpty={!dados}
  loadingMessage="Carregando documentos..."
  emptyMessage="Nenhum documento encontrado"
>
  <Content />
</QueryState>
```

---

#### **9. Nomenclatura Consistente**

**Padrões Observados**:
- Componentes: `PascalCase` descritivo (`DadosAlunoEditavel`)
- Hooks: `camelCase` com prefixo `use` (`useFiltrosCertificacao`)
- Props: `camelCase` (`alunoSelecionadoId`)
- Tipos: `PascalCase` com sufixo (`AlunoCertificacao`, `FiltrosCertificacaoState`)
- Enums/Constantes: `UPPER_SNAKE_CASE` ou `PHASES_CONFIG`

---

#### **10. Documentação IDD**

**Estrutura**:
```
/docs/features/{nome-feature}/
  ├── FLUXO.md - Fluxos de usuário e mecanismos internos
  ├── CHECKPOINT.md - Checkpoints de implementação
  └── TECNICO.md - Decisões técnicas
```

**Recomendação**: Criar estrutura similar para novo painel:
```
/docs/features/painel-emissao-documentos/
  ├── FLUXO.md
  ├── CHECKPOINT.md
  ├── MAPEAMENTO.md (este documento)
  └── TECNICO.md
```

---

### 9.2 Decisões Arquiteturais Críticas

1. **Renderização Dinâmica de Abas**: Usar `PHASES_CONFIG` permite adicionar/remover fases sem tocar em código

2. **Cálculo de Completude no Cliente**: Trade-off entre simplicidade e performance

3. **SWR para Cache**: Evita requisições desnecessárias, melhora UX

4. **def-objects como Schema**: Garante consistência entre validações

5. **Modo Colagem**: Funcionalidade específica, mas padrão de "estado + ação + modal" é reutilizável

---

## 10. PRÓXIMOS PASSOS SUGERIDOS

### Para Construção do "Painel de Emissão de Documentos"

1. **Decidir Escopo**:
   - Reutilizar `DadosAlunoEmissao` como base?
   - Criar painel separado com visão diferente?
   - Integrar com gestão de alunos ou standalone?

2. **Definir Entidades**:
   - Documentos a emitir (Certidão, Certificado, Diploma, Histórico)
   - Lotes de emissão
   - Assinaturas/aprovações

3. **Criar Configuração Central**:
   - `DOCUMENTOS_CONFIG` similar a `PHASES_CONFIG`
   - Definir etapas de emissão (Validação → Geração → Assinatura → Arquivo)

4. **Componentes Prioritários**:
   - `FluxoEmissaoDocumentos` (orquestrador)
   - `ListaDocumentos` (adaptado de `ListaAlunosCertificacao`)
   - `FiltrosEmissao` (reutilizar `FiltrosCertificacao`)
   - `PreviewDocumento` (modal com PDFViewer)
   - `CompletudeDocumento` (reutilizar existente)

5. **Hooks Necessários**:
   - `useDocumentosEmissao(filtros)` - Lista de documentos
   - `useFiltrosEmissao()` - Filtros
   - `useDocumentoSelecionado()` - Documento ativo
   - `useGeracaoPDF()` - Gerar/download PDF

6. **Validações**:
   - Reutilizar `calcularCompletudeEmissao()` e `def-objects`
   - Adicionar validações específicas (ex: assinaturas)

7. **Testes**:
   - Testes unitários para helpers (`calcularCompletude*`)
   - Testes de integração para hooks
   - Testes E2E para fluxo completo

---

**Este mapeamento fornece uma visão completa e profunda da arquitetura do Painel de Gestão de Alunos, identificando padrões, dependências e oportunidades de reutilização para a construção do novo Painel de Emissão de Documentos.**