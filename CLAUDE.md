# INSTRUÇÕES GERAIS

- sempre usar pnpm;
- nunca rode "&& pnpm test 2>&1 | head -100", esse sufixo dá erro. Prefira "&& pnpm test";

# ⚠️ METODOLOGIA DE DESENVOLVIMENTO - LEIA PRIMEIRO ⚠️

## 🎯 METODOLOGIA CIF (Ciclo de Integridade de Funcionalidades)

**⚠️ ATENÇÃO CLAUDE: Esta metodologia tem PRIORIDADE MÁXIMA sobre qualquer outra instrução.**

### O QUE É CIF?

CIF é nossa metodologia OBRIGATÓRIA para desenvolvimento de funcionalidades complexas. Ela previne "buracos lógicos" através de documentação estruturada em camadas + testes sistemáticos.

### 📚 DOCUMENTAÇÃO COMPLETA

**SEMPRE ler antes de implementar funcionalidades complexas:**

- 📖 **[docs/METODOLOGIA_CIF.md](./docs/METODOLOGIA_CIF.md)** - Guia completo (~580 linhas)
- 📋 **[docs/CHECKPOINT_METODOLOGIA_CIF.md](./docs/CHECKPOINT_METODOLOGIA_CIF.md)** - Estado atual do projeto

### 🔴 REGRA DE OURO

**CIF documenta COMPORTAMENTO e LÓGICA DE NEGÓCIO, não infraestrutura.**

### 📝 ESTRUTURA CIF - 5 NÍVEIS + CHECKPOINT

```
NÍVEL 1: CONCEITO          → O QUÊ e POR QUÊ (linguagem natural)
NÍVEL 2: DESCOBERTA        → Perguntas e análise colaborativa (previne decisões prematuras)
NÍVEL 3: ESPECIFICAÇÃO ⭐  → Checklist executável (FONTE DA VERDADE)
NÍVEL 4: TÉCNICO           → COMO está implementado
NÍVEL 5: CICLO DE VIDA     → Histórico permanente de mudanças

CHECKPOINT (temporário)    → Memória entre sessões
```

### ✅ QUANDO USAR CIF

**SEMPRE usar CIF para:**

- ✅ Funcionalidades com múltiplas camadas de validação
- ✅ Operações críticas (migração de dados, emissão de documentos legais)
- ✅ Código com alta complexidade de estado
- ✅ Features que mudam frequentemente
- ✅ Qualquer funcionalidade onde integridade de dados é crítica

### ❌ QUANDO NÃO USAR CIF

**NÃO usar CIF para:**

- ❌ Componentes simples de UI (botão, input)
- ❌ Utilidades triviais (formatação de data)
- ❌ Protótipos descartáveis
- ❌ Scripts one-off

### 🎯 WORKFLOW PRÁTICO

**Para funcionalidades NOVAS:**

1. Escrever CONCEITO.md (o que é, por que existe)
2. Se necessário: DESCOBERTA.md (análise colaborativa)
3. Experimentar código (sem testes formais ainda)
4. Quando estabilizar: escrever ESPECIFICACAO.md (checklist)
5. Criar testes para cada validação do checklist
6. Escrever TECNICO.md (como está implementado)
7. Iniciar CICLO.md (registro de mudanças)
8. **SEMPRE atualizar CHECKPOINT ao final da sessão**

**Para funcionalidades EXISTENTES estáveis:**

1. Escrever teste PRIMEIRO (TDD clássico)
2. Implementar
3. Atualizar CHECKPOINT

### 📦 RECURSOS DISPONÍVEIS

**Templates:** `docs/templates/CIF_*.template.md`

- CIF_CONCEITO.template.md
- CIF_DESCOBERTA.template.md
- CIF_ESPECIFICACAO.template.md
- CIF_TECNICO.template.md
- CIF_CICLO.template.md

**Casos de estudo completos:** Ver seção "Funcionalidades Implementadas" abaixo

### 🚨 CHECKPOINT vs CICLO

| Aspecto             | CHECKPOINT                                  | CICLO                           |
| ------------------- | ------------------------------------------- | ------------------------------- |
| **Propósito**       | Continuidade entre **sessões**              | Histórico da **funcionalidade** |
| **Duração**         | Temporário (descartado após conclusão)      | Permanente                      |
| **Conteúdo**        | Estado atual, bloqueadores, próximos passos | Mudanças na funcionalidade      |
| **Infraestrutura?** | ✅ Sim (se bloqueia sessão)                 | ❌ Nunca                        |

### 🎯 COMANDOS NATURAIS

Claude deve entender:

- "Implemente V3.7.1" → Criar teste + código para validação V3.7.1
- "V3.1 está quebrado" → Rodar testes V3.1.x, debugar
- "Adicione validação de RG" → Criar item no checklist → teste → código
- "Crie ciclo para Feature X" → Criar arquivos CIF (CONCEITO, DESCOBERTA se necessário, ESPECIFICACAO, TECNICO, CICLO)

### 📊 STATUS ATUAL DO PROJETO

**Ver:** [docs/CHECKPOINT_METODOLOGIA_CIF.md](./docs/CHECKPOINT_METODOLOGIA_CIF.md)

---

## 🖼️ PROTOCOLO DE REFATORAÇÃO DE FRONT-END

**⚠️ ANTES de refatorar UI, SEMPRE seguir:**

📖 **[docs/PROTOCOLO_FRONTEND.md](./docs/PROTOCOLO_FRONTEND.md)** - Protocolo completo (~600 linhas)

### RESUMO RÁPIDO (3 FASES)

**FASE 1: CAPTURA VISUAL** _(Usuário fornece)_

- Screenshots do estado atual
- Screenshots do resultado desejado (se aplicável)
- Contexto de uso (navegação, tamanho, interações)

**FASE 2: ANÁLISE ESTRUTURADA** _(Claude executa)_

- Leitura hierárquica completa (componente → filhos → hooks)
- Mapeamento visual → código (cada elemento da screenshot)
- ✅ Checklist obrigatório de compreensão
- ✅ Identificar oportunidades de componentização
- ✅ Buscar componentes genéricos existentes em `ui/`

**FASE 3: COMPONENTIZAÇÃO E REFATORAÇÃO** _(Claude executa)_

- ✅ **SEMPRE componentizar** (se aparece 2x, componentizar)
- ✅ **Buscar existentes PRIMEIRO** (Glob em `ui/`, evitar duplicação)
- ✅ **Decidir tipo:** Genérico (`ui/`) vs Personalizado (`components/`)
- ✅ **Refatorar incrementalmente** (1 componente por vez, validar visualmente)

### DECISÃO: GENÉRICO vs PERSONALIZADO

**Componente GENÉRICO (`ui/`):**

- ✅ Reutilizável em múltiplos contextos
- ✅ SEM lógica de negócio
- ✅ Altamente configurável (props)
- ✅ Padrão de design system
- **Exemplos:** Button, Input, Modal, FormField, Badge

**Componente PERSONALIZADO (`components/`):**

- ✅ Lógica de negócio específica
- ✅ Integração com hooks de domínio
- ✅ Combinação complexa de genéricos
- ✅ Layout específico da funcionalidade
- **Exemplos:** FiltrosCertificacao, ListaAlunosCertificacao

### HIERARQUIA DE REUTILIZAÇÃO

```
1º: Usar componente genérico existente (ui/)
2º: Estender componente genérico com props
3º: Criar novo componente genérico (se reutilizável)
4º: Criar componente personalizado (se lógica específica)
5º: Código inline (EVITAR - apenas casos únicos)
```

### PRINCÍPIO FUNDAMENTAL

> **SEMPRE componentizar. SEMPRE reutilizar. NUNCA duplicar.**
>
> **Se um padrão aparece 2 vezes, COMPONENTIZAR.** > **Se pode ser genérico, CRIAR em `ui/` para reutilização futura.**

---

## 🔗 INTEGRAÇÃO: CIF + PROTOCOLO DE FRONTEND

**⚠️ REGRA OBRIGATÓRIA: Refatorações visuais SEMPRE devem ser indexadas ao CHECKPOINT**

### 🎯 QUANDO APLICAR AMBOS OS PROTOCOLOS

| Situação                                     | CIF          | Protocolo Frontend | CHECKPOINT     |
| -------------------------------------------- | ------------ | ------------------ | -------------- |
| **Refatoração visual de funcionalidade CIF** | ✅ Sim       | ✅ Sim             | ✅ Obrigatório |
| **Nova funcionalidade complexa com UI**      | ✅ Sim       | ✅ Sim             | ✅ Obrigatório |
| **Refatoração visual isolada (sem lógica)**  | ❌ Não       | ✅ Sim             | ⚠️ Opcional\*  |
| **Bug visual em funcionalidade CIF**         | ⚠️ CICLO\*\* | ✅ Sim             | ✅ Obrigatório |

\*Opcional mas recomendado se mudança for significativa
\*\*Registrar no CICLO da funcionalidade + seguir Protocolo Frontend

### 📝 FLUXO INTEGRADO: Refatoração Visual em Funcionalidade CIF

**Exemplo:** Refatorar UI do Fluxo de Certificação (funcionalidade existente)

```
1. PROTOCOLO FRONTEND - FASE 1: Captura Visual
   └─> Usuário fornece screenshots (antes/depois, contexto)

2. PROTOCOLO FRONTEND - FASE 2: Análise Estruturada
   ├─> Ler componentes hierarquicamente
   ├─> Mapear visual → código
   ├─> ✅ Checklist de compreensão
   └─> Identificar componentização

3. PROTOCOLO FRONTEND - FASE 3: Componentização
   ├─> Buscar componentes existentes em ui/
   ├─> Decidir: genérico (ui/) vs personalizado (components/)
   ├─> Refatorar incrementalmente
   └─> Validar visualmente

4. CIF - ATUALIZAR DOCUMENTAÇÃO
   ├─> TECNICO.md: atualizar seção de componentes
   ├─> CICLO.md: registrar mudança visual
   └─> ESPECIFICACAO.md: apenas se validações visuais mudarem

5. CHECKPOINT - REGISTRAR SESSÃO (OBRIGATÓRIO)
   ├─> Seção "Refatorações Visuais" no CHECKPOINT
   ├─> Screenshots antes/depois
   ├─> Componentes criados/modificados
   ├─> Referência ao CICLO.md atualizado
   └─> Link para Protocolo Frontend aplicado
```

### 🗂️ TEMPLATE DE CHECKPOINT PARA REFATORAÇÕES VISUAIS

**Adicionar esta seção ao CHECKPOINT sempre que houver refatoração visual:**

```markdown
## 🎨 REFATORAÇÕES VISUAIS (Sessão X)

**Funcionalidade:** [Nome da funcionalidade CIF]

**Objetivo:** [Descrição breve da refatoração]

**Protocolo Frontend Aplicado:** ✅ Sim (Fases 1-3 completas)

### Captura Visual

- **Screenshots antes:** [links ou descrição]
- **Screenshots depois:** [links ou descrição]
- **Contexto:** [navegação, tamanho, interações]

### Análise Estruturada

- **Componentes analisados:** [lista de arquivos lidos]
- **Checklist de compreensão:** ✅ Completo
- **Oportunidades identificadas:**
  - [ ] Componentização de X
  - [ ] Reutilização de Y de ui/
  - [ ] Criação de novo genérico Z

### Componentização Executada

- **Componentes genéricos criados:** [ui/ComponenteNovo.tsx]
- **Componentes genéricos reutilizados:** [ui/Button, ui/Input]
- **Componentes personalizados modificados:** [components/Filtros.tsx]
- **Arquivos modificados:** [lista completa com linhas]

### Atualização CIF

- ✅ **TECNICO.md:** Seção de componentes atualizada (linhas X-Y)
- ✅ **CICLO.md:** Entrada adicionada (data, mudança, impacto)
- ⬜ **ESPECIFICACAO.md:** Não alterado (apenas visual)

### Validação Visual

- ✅ Layout preservado
- ✅ Responsividade mantida
- ✅ Interações funcionando
- ✅ Estados corretos (loading, error, empty)

**Tempo Real:** ~Xh
```

### 🚨 CHECKLIST OBRIGATÓRIO: Claude ao Fazer Refatoração Visual

**ANTES de iniciar:**

```
□ Usuário forneceu screenshots? (FASE 1 do Protocolo Frontend)
□ Identifiquei se a funcionalidade tem ciclo CIF?
   └─> Se SIM: preparar para atualizar TECNICO.md + CICLO.md
   └─> Se NÃO: apenas seguir Protocolo Frontend
□ Li hierarquia completa de componentes? (FASE 2)
□ Completei checklist de compreensão? (FASE 2)
□ Busquei componentes genéricos existentes em ui/? (FASE 3)
```

**DURANTE refatoração:**

```
□ Estou componentizando ao invés de duplicar código?
□ Estou reutilizando componentes genéricos existentes?
□ Decidi corretamente: genérico (ui/) vs personalizado (components/)?
□ Estou validando visualmente após cada mudança incremental?
```

**DEPOIS de concluir:**

```
□ Atualizei TECNICO.md da funcionalidade? (se CIF)
□ Registrei mudança no CICLO.md? (se CIF)
□ Criei/atualizei seção "Refatorações Visuais" no CHECKPOINT?
□ Incluí screenshots antes/depois no CHECKPOINT?
□ Listei componentes criados/modificados?
□ Solicitei validação visual final do usuário?
```

### 📋 EXEMPLOS DE INTEGRAÇÃO

#### Exemplo 1: Refatoração de Fluxo de Certificação (Funcionalidade CIF)

**Situação:** Refatorar DadosAlunoEditavel.tsx para componentizar campos

**Passos:**

1. ✅ **PROTOCOLO FRONTEND:**

   - FASE 1: Usuário fornece screenshot do formulário atual
   - FASE 2: Claude lê DadosAlunoEditavel.tsx + identifica campos duplicados
   - FASE 3: Claude busca FormField/Input em ui/, refatora usando genéricos

2. ✅ **CIF - ATUALIZAR:**

   - `docs/ciclos/FLUXO_CERTIFICACAO_TECNICO.md`: atualizar seção de componentes
   - `docs/ciclos/FLUXO_CERTIFICACAO_CICLO.md`: adicionar entrada "Refatoração visual: componentização de campos"

3. ✅ **CHECKPOINT:**
   - Criar seção "🎨 REFATORAÇÕES VISUAIS (Sessão X)"
   - Screenshots antes/depois
   - Lista de componentes: DadosAlunoEditavel.tsx (modificado), FormField (reutilizado)
   - Referência: `docs/ciclos/FLUXO_CERTIFICACAO_CICLO.md#entrada-2025-xx-xx`

#### Exemplo 2: Bug Visual em Painel de Migração (Funcionalidade CIF)

**Situação:** Arrays vazios na visualização hierárquica (V5.3.3)

**Passos:**

1. ✅ **CIF - CICLO.md:**

   - Registrar bug no CICLO: "Bug visual V5.3.3: arrays vazios"
   - Motivo, solução implementada, testes afetados

2. ✅ **PROTOCOLO FRONTEND (se necessário refatoração):**

   - FASE 1-3: Seguir protocolo se houver mudança visual
   - Se apenas fix de lógica: pular protocolo

3. ✅ **CHECKPOINT:**
   - Seção "🎨 REFATORAÇÕES VISUAIS" (se houve mudança visual)
   - OU seção "🐛 BUGS CORRIGIDOS" (se apenas lógica)
   - Sempre referenciar CICLO.md atualizado

### 🎯 BENEFÍCIOS DA INTEGRAÇÃO

1. **Rastreabilidade completa:**

   - CHECKPOINT registra O QUE mudou visualmente
   - CICLO registra POR QUE mudou
   - TECNICO registra COMO ficou implementado

2. **Componentização documentada:**

   - CHECKPOINT lista componentes criados/reutilizados
   - TECNICO atualizado com novos componentes
   - Fácil encontrar padrões para reutilizar

3. **Continuidade entre sessões:**

   - Próxima sessão sabe exatamente o estado da UI
   - Screenshots no CHECKPOINT facilitam contexto visual
   - Não precisa "adivinhar" como está a interface

4. **Qualidade visual garantida:**
   - Protocolo Frontend previne quebra de layout
   - Checklist obrigatório garante análise completa
   - Validação visual incremental reduz bugs

---

# 🎯 FUNCIONALIDADES IMPLEMENTADAS

## ✅ 1. PAINEL DE MIGRAÇÃO (100% documentado via CIF)

Upload de CSVs do sistema Conexão Educação → Parsing inteligente → Armazenamento em 3 camadas → Visualização hierárquica

**Documentação completa (CIF):**

- 📖 [CONCEITO](./docs/ciclos/MIGRACAO_CONCEITO.md) - O que é, por que existe (15KB)
- ⭐ [ESPECIFICAÇÃO](./docs/ciclos/MIGRACAO_ESPECIFICACAO.md) - 80 validações, 88 testes (68KB)
- 🔧 [TÉCNICO](./docs/ciclos/MIGRACAO_TECNICO.md) - Arquitetura detalhada (66KB)
- 📜 [CICLO](./docs/ciclos/MIGRACAO_CICLO.md) - Histórico de mudanças (27KB)

**Status:** ✅ Pronto para produção (88/88 testes passando, 100%)

**Principais funcionalidades:**

- Upload drag-and-drop de múltiplos CSVs
- Detecção automática de duplicatas (hash SHA-256)
- Parsing tolerante com remoção de prefixos ("Ano Letivo: 2024" → "2024")
- Criação automática de Alunos e Enturmações
- Visualização hierárquica: Período → Modalidade → Turma → Alunos
- Sistema de reset/reimportação (hard delete)
- Transação completa (operações atômicas)

---

## ✅ 2. IMPORTAÇÃO ESTRUTURADA POR TEXTO (100% documentado via CIF)

Captura de dados complementares de alunos via texto estruturado do sistema oficial

**Documentação completa (CIF):**

- 📖 [CONCEITO](./docs/ciclos/IMPORTACAO_ESTRUTURADA_CONCEITO.md) - Visão geral (5KB)
- 🔍 [DESCOBERTA](./docs/ciclos/IMPORTACAO_ESTRUTURADA_DESCOBERTA.md) - Análise colaborativa (22KB)
- ⭐ [ESPECIFICAÇÃO](./docs/ciclos/IMPORTACAO_ESTRUTURADA_ESPECIFICACAO.md) - Validações (25KB)
- 🔧 [TÉCNICO](./docs/ciclos/IMPORTACAO_ESTRUTURADA_TECNICO.md) - Implementação (24KB)
- 📜 [CICLO](./docs/ciclos/IMPORTACAO_ESTRUTURADA_CICLO.md) - Histórico (21KB)
- 📋 [CHECKPOINT](./docs/ciclos/IMPORTACAO_ESTRUTURADA_CHECKPOINT.md) - Estado atual (11KB)

**Status:** ✅ Em produção

**Principais funcionalidades:**

- Entrada de texto formatado (múltiplas seções)
- Validação automática de estrutura
- Parsing inteligente para extrair dados
- Popular banco de dados com rastreabilidade
- Feedback visual sobre completude

---

## ✅ 3. FLUXO DE CERTIFICAÇÃO

Visualização e gestão de dados de alunos concluintes (3ª série do Ensino Médio)

**Localização:** Aba "Fluxo de Certificação" na página inicial

**Status:** ✅ Interface pronta (funcionalidade de edição pendente)

**Layout:**

- **Grid 2 colunas:**
  - Esquerda: Lista de alunos (sidebar fixa 300px)
  - Direita: Filtros + Dados do aluno selecionado

**Componentes principais:**

- `FluxoCertificacao.tsx` - Container principal
- `FiltrosCertificacao.tsx` - Seleção de turma (Período Letivo → Turma)
- `ListaAlunosCertificacao.tsx` - Lista lateral com seleção
- `DadosAlunoEditavel.tsx` - Painel de dados (7 seções)

**Hooks:**

- `useFiltrosCertificacao.ts` - Gerencia filtros
- `useAlunosCertificacao.ts` - Busca alunos filtrados
- `useAlunoSelecionado.ts` - Gerencia seleção

**Regras de negócio:**

- Fixo em 3ª série (concluintes)
- Fixo em regime anual (0)
- Auto-seleção: ano mais recente + primeira turma
- Limpeza de filtros em cascata

**Pendente:**

- [ ] Tornar campos editáveis
- [ ] Implementar salvamento de edições (API + auditoria)
- [ ] Histórico Escolar (componente + dados)

**Quando implementar CIF:** Criar ciclo em `docs/ciclos/FLUXO_CERTIFICACAO_*` ao adicionar features complexas

---

# 📖 DESCRIÇÃO DO SISTEMA

Sistema de emissão de certificados e certidões para alunos concluintes de Ensino Médio da rede pública estadual (SEEDUC-RJ).

**Principais funcionalidades:**

1. Importação de dados (CSVs do sistema Conexão Educação + texto estruturado)
2. Gestão de alunos e enturmações
3. Validação de dados e histórico escolar
4. Emissão de certificados e certidões
5. Impressão em lote e individual

---

# 🗂️ ARQUITETURA DE BANCO DE DADOS

## ARQUITETURA DE 3 CAMADAS

Ver detalhes completos em: [docs/ciclos/MIGRACAO_TECNICO.md](./docs/ciclos/MIGRACAO_TECNICO.md)

### CAMADA 1: ORIGEM DOS DADOS (Imutável)

Armazena dados brutos dos arquivos CSV importados.

**ArquivoImportado**

- 1 registro = 1 arquivo CSV uploadado
- Campos: `nomeArquivo`, `hashArquivo` (SHA-256), `status` ('ativo' ou 'excluido')
- Propósito: detectar duplicatas, rastreabilidade

**LinhaImportada**

- 1 registro = 1 linha do CSV
- Campo `dadosOriginais`: JSONB com dados brutos
- Relacionamento: N-1 com ArquivoImportado (onDelete: Cascade)
- Propósito: preservação de dados originais, rastreabilidade

### CAMADA 2: ENTIDADES ESTRUTURADAS (Editáveis)

Dados modelados e normalizados, derivados da Camada 1.

**Aluno**

- Dados pessoais: matrícula (15 dígitos), nome, sexo, data de nascimento
- Documentos: RG, órgão emissor, CPF
- Naturalidade: nacionalidade, naturalidade, UF
- Filiação: nome completo da mãe, nome completo do pai
- Ensino Médio: data de conclusão, certificação, dados conferidos
- Ensino Fundamental: instituição, município/estado, ano, número página
- Campos: `linhaOrigemId` (FK → LinhaImportada), `origemTipo` ('csv' ou 'manual'), `fonteAusente` (boolean)

**Enturmacao**

- Relaciona Aluno com Turma em um período letivo
- Um aluno pode ter MÚLTIPLAS enturmações (ex: 2022/1ª série, 2023/2ª série, 2024/3ª série)
- Campos: `anoLetivo`, `regime` (0=anual, 1/2=semestral), `modalidade`, `serie`, `turma`, `turno`
- Relacionamento: `Aluno` 1-N `Enturmacao`
- Campos: `linhaOrigemId` (FK → LinhaImportada), `origemTipo` ('csv' ou 'manual')

### CAMADA 3: AUDITORIA

**Auditoria**

- Registra todas as alterações nas entidades estruturadas
- Campos: entidade, id da entidade, campo, valor anterior, valor novo, usuário, timestamp

## PRINCÍPIO DE EXCLUSÃO E REIMPORTAÇÃO

**Comportamento do Reset de Período/Turma:**

1. **Hard Delete da Camada 1:**

   - Deletar `ArquivoImportado` (remove hash do banco)
   - Deletar `LinhaImportada` (onDelete: Cascade - automático)
   - Remove todo o JSONB, liberando espaço

2. **SetNull na Camada 2:**

   - `Aluno.linhaOrigemId` → NULL (onDelete: SetNull - automático)
   - `Enturmacao.linhaOrigemId` → NULL (onDelete: SetNull - automático)

3. **Marcar Fonte Ausente:**

   - Se `linhaOrigemId = NULL` E `origemTipo = 'csv'` → `fonteAusente = true`
   - Aplica para Aluno e Enturmacao

4. **Reimportação Permitida:**
   - Com hash removido, mesmo arquivo pode ser importado novamente
   - Novas entidades criadas ou existentes atualizadas
   - `fonteAusente` volta a `false` ao vincular novo CSV

**Vantagens:**

- ✅ Permite reimportar dados após correção de problemas
- ✅ Mantém dados editados manualmente (não deleta Aluno/Enturmacao)
- ✅ Rastreabilidade: sabe-se quais entidades perderam origem
- ✅ Economia de espaço: remove JSONB desnecessário

---

# 🏗️ PADRÕES DE CÓDIGO E ARQUITETURA

## ESTRUTURA DE ARQUIVOS

```
src/
  app/
    page.tsx                    # Página inicial - funcionalidades principais integradas
    api/
      files/route.ts            # POST/GET/DELETE - Upload e migração de CSVs
      filtros/route.ts          # GET - Opções hierárquicas de filtros
      alunos/route.ts           # GET - Busca de alunos com filtros
  components/
    ui/                         # Componentes genéricos reutilizáveis
      Tabs.tsx                  # Sistema de abas (com context)
      Modal.tsx                 # Modal genérico
      ButtonGroup.tsx           # Grupo de botões (seleção única)
      FormField.tsx             # Container de campo com label
      Input.tsx                 # Input de texto genérico
      DateInput.tsx             # Input de data genérico
      Checkbox.tsx              # Checkbox genérico
      Textarea.tsx              # Textarea genérico
    FluxoCertificacao.tsx       # Container: integra filtros + lista de alunos
    FiltrosCertificacao.tsx     # UI de filtros (recebe props, não usa hooks)
    ListaAlunosCertificacao.tsx # Lista lateral de alunos
    DadosAlunoEditavel.tsx      # Painel de dados do aluno (7 seções)
    MigrateUploads.tsx          # Upload e migração de CSVs
  hooks/
    useFiltrosCertificacao.ts   # Lógica de filtros (ano, turma)
    useAlunosCertificacao.ts    # Busca de alunos filtrados
    useAlunoSelecionado.ts      # Gerencia seleção de aluno
  lib/
    prisma.ts                   # Cliente Prisma
    csv.ts                      # Utilidades CSV (limparValor, limparCamposEnturmacao)
  tests/
    unit/                       # Testes unitários (54 testes)
    integration/                # Testes de integração (88 testes)
    helpers/                    # Helpers de teste (db-setup, csv-fixtures)
```

## COMPONENTIZAÇÃO (CRÍTICO)

- **SEMPRE** componentizar ao invés de criar código hard-coded direto
- Criar componentes genéricos e reutilizáveis em `src/components/ui/`
- Componentes específicos de domínio em `src/components/`
- Evitar código repetido - se algo aparece 2x, componentizar

**IMPORTANTE - Campos de Formulário:**

- ❌ NUNCA criar campos inline (CampoTexto, CampoData, etc) dentro de componentes
- ✅ SEMPRE usar componentes genéricos de `src/components/ui/`:
  - `FormField.tsx` - Container genérico com label
  - `Input.tsx` - Input de texto genérico
  - `DateInput.tsx` - Input de data genérico
  - `Checkbox.tsx` - Checkbox genérico
  - `Textarea.tsx` - Textarea genérico
- ✅ Componentes devem aceitar `className` para customização
- ✅ Props bem tipadas com TypeScript

## CUSTOM HOOKS

- **SEMPRE** criar custom hooks para lógica reutilizável
- Hooks para gerenciamento de estado complexo
- Hooks para side effects compartilhados
- Localização: `src/hooks/`
- Nomenclatura: `use[Nome].ts` (ex: `useFiltros.ts`, `useAlunos.ts`)

## ESTRUTURA DE COMPONENTES

- Componentes devem ser pequenos e com responsabilidade única
- Máximo de 200 linhas por componente
- Se ultrapassar, dividir em sub-componentes
- Props bem tipadas com TypeScript
- Componentes genéricos devem aceitar className para customização

## SEPARAÇÃO DE CONCERNS (CRÍTICO)

✅ **Hooks** = Lógica e estado
✅ **Componentes** = UI pura (recebem props)
✅ **Containers** = Composição (usam hooks + passam props)

**Exemplo:**

```tsx
// ✅ CORRETO
function FluxoCertificacao() {
  const hookData = useFiltrosCertificacao();
  return <FiltrosCertificacao {...hookData} />;
}

// ❌ ERRADO (não fazer)
function FiltrosCertificacao() {
  const hookData = useFiltrosCertificacao(); // lógica dentro da UI
  return <div>...</div>;
}
```

## BOAS PRÁTICAS

- DRY (Don't Repeat Yourself) - nunca repetir código
- Separação de concerns (UI vs Lógica vs Dados)
- Custom hooks para lógica compartilhada
- Componentes UI genéricos e reutilizáveis
- Código legível e bem organizado

---

# ⚙️ DECISÕES TÉCNICAS CRÍTICAS

## 1. PACKAGE MANAGER

**SEMPRE usar `pnpm` ao invés de `npm`**

```bash
# ✅ CORRETO
pnpm install
pnpm dev
pnpm test

# ❌ ERRADO
npm install
npm run dev
```

## 2. GESTÃO DE MIGRATIONS (CRÍTICO)

**IMPORTANTE:** Este projeto usa DOIS bancos de dados - principal e testes.

**Configuração (.env):**

```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/certificados?schema=public"
DATABASE_URL_TEST="postgresql://postgres:postgres@localhost:5432/certificados_test?schema=public"
```

**⚠️ REGRA OBRIGATÓRIA: SEMPRE aplicar migrations em AMBOS os bancos**

**Comandos corretos a usar:**

```bash
# ✅ Aplicar migrations pendentes em AMBOS os bancos
pnpm migrate:all

# ✅ Criar nova migration e aplicar em AMBOS
pnpm migrate:dev "nome_da_migration"

# ❌ NUNCA use apenas:
# prisma migrate dev    (só aplica no banco principal)
# prisma migrate deploy (só aplica no banco especificado)
```

**Script automatizado:**

- Localização: `scripts/migrate-all.sh`
- Aplica automaticamente em ambos os bancos
- Verifica status final de ambos

**Checklist obrigatório ao trabalhar com migrations:**

1. ✅ Sempre usar `pnpm migrate:dev` ao criar novas migrations
2. ✅ Antes de rodar testes, verificar sincronização com `pnpm migrate:all`
3. ✅ NUNCA assumir que existe apenas um banco
4. ✅ NUNCA usar comandos Prisma diretos (use os scripts do package.json)

**Por que isso é crítico:**

- Testes rodam no banco `certificados_test`, não no principal
- Se migrations não forem aplicadas no banco de testes, os testes falham
- Erro comum: "column does not exist" nos testes mesmo existindo no banco principal

## 3. PARSING DE CSV - FUNÇÃO CRÍTICA

**IMPORTANTE:** Arquivos CSV do sistema Conexão Educação vêm com PREFIXOS nos valores.

**Problema:**

- Valores vêm como: "Ano Letivo: 2024", "Modalidade: REGULAR", "Turma: 3001", etc.
- Isso causava erros de "value too long for column" no banco de dados

**Solução - Função `limparValor`:**

Localização: `src/lib/csv.ts`

```typescript
/**
 * Remove prefixo de valor de CSV do Conexão Educação
 * @example
 * limparValor("Ano Letivo: 2024", "Ano Letivo:") // "2024"
 * limparValor("Modalidade: REGULAR", "Modalidade:") // "REGULAR"
 */
const limparValor = (valor: string | undefined, prefixo: string): string => {
  if (!valor) return "";
  const str = valor.toString().trim();
  if (str.startsWith(prefixo)) {
    return str.substring(prefixo.length).trim();
  }
  return str;
};

// Uso:
const anoLetivo = limparValor(csvData.Ano, "Ano Letivo:");
const modalidade = limparValor(csvData.MODALIDADE, "Modalidade:");
const turma = limparValor(csvData.TURMA, "Turma:");
const serie = limparValor(csvData.SERIE, "Série:");
```

**Onde usar:**

- ✅ API de upload (`src/app/api/files/route.ts`)
- ✅ Scripts de migração
- ✅ Qualquer código que processe dados de CSV

**Helper adicional:**

```typescript
/**
 * Limpa todos os campos de enturmação de uma vez
 */
const limparCamposEnturmacao = (csvData: any) => ({
  anoLetivo: limparValor(csvData.Ano, "Ano Letivo:"),
  modalidade: limparValor(csvData.MODALIDADE, "Modalidade:"),
  turma: limparValor(csvData.TURMA, "Turma:"),
  serie: limparValor(csvData.SERIE, "Série:"),
  turno: limparValor(csvData.TURNO, "Turno:"),
  regime: limparValor(csvData.PERIODO_CURRICULAR, "Período Curricular:"),
});
```

## 4. CONCEITO DE ENTURMAÇÕES MÚLTIPLAS

**IMPORTANTE:** Um aluno pode ter MÚLTIPLAS enturmações ao longo dos anos.

**Cenário:**

- Aluno estuda em 2022 (1ª série), 2023 (2ª série), 2024 (3ª série)
- Cada ano = uma enturmação diferente
- Relacionamento: `Aluno` 1-N `Enturmacao`

**Implicações:**

- ❌ NÃO assumir que aluno tem apenas 1 turma
- ✅ SEMPRE filtrar enturmações por `anoLetivo` quando necessário
- ✅ Ao buscar alunos, fazer JOIN com enturmações e filtrar
- ✅ Migração de dados precisa criar TODAS as enturmações de um aluno

## 5. AUTO-INICIALIZAÇÃO DE FILTROS

**PADRÃO:** Filtros devem iniciar com valores padrão, não vazios.

**Implementação em hooks:**

```typescript
// No useEffect após carregar opções
useEffect(() => {
  if (anosData.length > 0 && !anoLetivo) {
    // Selecionar ano mais recente
    const anoMaisRecente = [...anosData].sort((a, b) => b.localeCompare(a))[0];
    setAnoLetivo(anoMaisRecente);
  }
}, [anosData]);

useEffect(() => {
  if (turmasData.length > 0 && !turma) {
    // Selecionar primeira turma
    setTurma(turmasData[0]);
  }
}, [turmasData]);
```

**Benefícios:**

- UX melhor - usuário vê dados imediatamente
- Menos cliques necessários
- Estado sempre válido

---

# 🎨 PADRÕES DE UI

## CORES SEMÂNTICAS (Sistema de Status)

- 🔴 **Vermelho:** PENDENTE (erro, ação necessária)
- 🟠 **Laranja:** RESOLVENDO (em progresso)
- 🔵 **Azul:** OK (não alterado, estado normal)
- 🟢 **Verde:** CORRIGIDO (sucesso, aprovado)
- 🟡 **Amarelo:** Avisos (fonte ausente, atenção)

## TAMANHOS DE FONTE

- **Títulos:** `text-lg` ou `text-xl`
- **Labels:** `text-xs`
- **Campos:** `text-sm`
- **Hints:** `text-[10px]`

## ESPAÇAMENTO

- **Seções:** `space-y-6`
- **Elementos internos:** `space-y-4`
- **Campos de formulário:** `gap-3`

## LAYOUT

- **Página inicial:** Tudo integrado via abas (Tabs), não criar rotas separadas
- **Componentes:** Devem caber na tela (usar overflow se necessário)
- **Campos:** Lado a lado ao invés de um por linha (layout compacto)
- **Fontes:** Pequenas mas legíveis

---

# 📚 REGRAS DE NEGÓCIO DO DOMÍNIO EDUCACIONAL

## ESTRUTURA CURRICULAR

**Sistema de Ensino Médio (SEEDUC-RJ):**

- **Modalidades:** REGULAR, EJA, NOVO ENSINO MÉDIO, etc.
- **Regimes curriculares:**
  - Anual (regime 0): 1 período por ano
  - Semestral (regimes 1 e 2): 2 períodos por ano
- **Séries:** 1ª, 2ª, 3ª série
- **Períodos avaliativos:**
  - Anual: 4 bimestres
  - Semestral: 2 bimestres
- **Componentes curriculares:** Disciplinas (Matemática, Português, etc.)

## CRITÉRIOS DE APROVAÇÃO

**Nota:**

- Escala: 0 a 10 pontos por bimestre
- Média: 5 pontos
- **Regime Anual:** Aprovação com 20 pontos totais (média 5 em 4 bimestres)
- **Regime Semestral:** Aprovação com 10 pontos totais (média 5 em 2 bimestres)

**Frequência:**

- Mínimo: 75% de presença

**Observação:** O nível de detalhes atual não acessa bimestres individuais, apenas pontuação total dos componentes curriculares.

---

# 📋 CONVENÇÕES DE NOMENCLATURA

## Componentes

- **PascalCase:** `FiltrosCertificacao.tsx`
- **Sufixos descritivos:** `ListaAlunosCertificacao`, `ButtonGroup`

## Hooks

- **camelCase com prefixo `use`:** `useFiltrosCertificacao.ts`
- **Nome descritivo do domínio**

## Tipos

- **PascalCase com sufixo:** `FiltrosState`, `AlunoProps`
- **Exportar do mesmo arquivo quando possível**

## Variáveis de Estado

- **Descritivas:** `anosDisponiveis`, `isLoadingTurmas`
- **Booleanos:** prefixo `is`, `has`, `should`

---

# 🔮 FUNCIONALIDADES FUTURAS

**IMPORTANTE:** Antes de implementar, sempre perguntar ao usuário sobre os passos a tomar.

## PAINEL DE SOLUÇÃO DE INCONSISTÊNCIAS (Futuro)

**Status:** 🔜 Não iniciado

**Conceito:** UI para identificar e resolver pendências em 6 níveis:

1. **NÍVEL 1: Banco de Dados e Migração**

   - Detectar se todos os dados foram migrados corretamente
   - Suspeitar de pulos de dados (ex: turma 3001, 3002, 3004 - falta 3003)
   - Sinalizar referências órfãs (aluno referencia turma não migrada)

2. **NÍVEL 2: Entrega de Documentos**

   - (A definir posteriormente)

3. **NÍVEL 3: Consistência de Dados**

   - Avaliar presença de dados necessários para emissão de documentos

4. **NÍVEL 4: Consistência de Histórico Escolar**

   - Aprovações livres de dependência ou dependências resolvidas
   - Pontuação consistente com situação final (aprovado/reprovado)
   - Tratamento de reprovação por falta

5. **NÍVEL 5: Pendências de Tarefas**

   - Impressões completas por ano/turma/aluno
   - Certificados, certidões, folhas de registro

6. **NÍVEL 6: Fluxo de Ações**
   - Resolução de pendências → Impressão em lote → Impressões individuais

**Cores semânticas (já definidas):**

- 🔴 Vermelho: PENDENTE
- 🟠 Laranja: RESOLVENDO
- 🔵 Azul: OK (não alterado)
- 🟢 Verde: CORRIGIDO

**Quando implementar:** Criar ciclo CIF completo em `docs/ciclos/PAINEL_INCONSISTENCIAS_*`

---

## PAINEL DE IMPRESSÃO DE DOCUMENTOS (Futuro)

**Status:** 🔜 Não iniciado

**Conceito:**

- Lista por turma de alunos prontos/não prontos para impressão
- Filtros e sinalização visual
- Visualização e impressão em lote/individual
- Tipos: Certificados, Certidões

**Validação para impressão:**

- ❌ Bloquear se houver inconsistência de banco de dados (nível 1)
- ❌ Bloquear se houver inconsistência de dados (nível 3)
- ❌ Bloquear se houver pendência de tarefas (nível 5)

**Quando implementar:** Criar ciclo CIF completo em `docs/ciclos/IMPRESSAO_DOCUMENTOS_*`

---

# 🔧 COMANDOS E SCRIPTS ÚTEIS

## Desenvolvimento

```bash
# Iniciar servidor de desenvolvimento
pnpm dev

# Rodar testes
pnpm test              # Todos os testes
pnpm test:unit         # Apenas unitários
pnpm test:integration  # Apenas integração
pnpm test:watch        # Modo watch

# Linter e formatação
pnpm lint
pnpm format
```

## Banco de Dados

```bash
# Migrations (SEMPRE usar estes comandos)
pnpm migrate:dev "nome"  # Criar e aplicar em AMBOS os bancos
pnpm migrate:all         # Aplicar pendentes em AMBOS os bancos

# Prisma Studio
pnpm prisma studio       # Visualizar banco principal
DATABASE_URL=$DATABASE_URL_TEST pnpm prisma studio  # Banco de testes

# Reset (CUIDADO!)
pnpm db:reset            # Reset do banco principal
```

## Scripts Customizados

```bash
# Scripts em scripts/
pnpx tsx scripts/reset-database.ts       # Reset completo do banco
pnpx tsx scripts/migrar-enturmacoes.ts   # Migrar enturmações antigas
pnpx tsx scripts/diagnosticar-dados.ts   # Analisar tamanhos de campos
pnpx tsx scripts/check-data.ts           # Verificar dados no banco
```

---

# 📚 REFERÊNCIAS IMPORTANTES

## Documentação do Projeto

- **Metodologia:** [docs/METODOLOGIA_CIF.md](./docs/METODOLOGIA_CIF.md)
- **Estado Atual:** [docs/CHECKPOINT_METODOLOGIA_CIF.md](./docs/CHECKPOINT_METODOLOGIA_CIF.md)
- **Templates:** `docs/templates/CIF_*.template.md`

## Funcionalidades Documentadas (CIF)

**Painel de Migração:**

- [CONCEITO](./docs/ciclos/MIGRACAO_CONCEITO.md)
- [ESPECIFICAÇÃO](./docs/ciclos/MIGRACAO_ESPECIFICACAO.md)
- [TÉCNICO](./docs/ciclos/MIGRACAO_TECNICO.md)
- [CICLO](./docs/ciclos/MIGRACAO_CICLO.md)

**Importação Estruturada:**

- [CONCEITO](./docs/ciclos/IMPORTACAO_ESTRUTURADA_CONCEITO.md)
- [DESCOBERTA](./docs/ciclos/IMPORTACAO_ESTRUTURADA_DESCOBERTA.md)
- [ESPECIFICAÇÃO](./docs/ciclos/IMPORTACAO_ESTRUTURADA_ESPECIFICACAO.md)
- [TÉCNICO](./docs/ciclos/IMPORTACAO_ESTRUTURADA_TECNICO.md)
- [CICLO](./docs/ciclos/IMPORTACAO_ESTRUTURADA_CICLO.md)
- [CHECKPOINT](./docs/ciclos/IMPORTACAO_ESTRUTURADA_CHECKPOINT.md)

---

# 🎯 PRINCÍPIOS DE TRABALHO

## Antes de Gerar Código

1. **Compreensão hierárquica:**

   - Primeiro: compreensão geral integrada
   - Depois: compreensão local modularizada
   - Então: níveis de compreensão até geração de código

2. **Não gerar estruturas sem compreensão conceitual**

3. **Antes de gerar estruturas permanentes:**

   - Gerar mocks para UI
   - Gradativamente implementar estruturas

4. **SEMPRE perguntar sobre os passos a tomar**

## Durante Implementação

1. **ANTES de implementar funcionalidade complexa:**

   - Verificar se deve usar CIF (ver seção no topo)

2. **Se usar CIF:**

   - Criar CONCEITO primeiro
   - Se necessário: DESCOBERTA (análise colaborativa)
   - Experimentar código sem testes formais
   - Quando estabilizar: ESPECIFICACAO + testes
   - Documentar: TECNICO + CICLO
   - SEMPRE atualizar CHECKPOINT ao final da sessão

3. **Se NÃO usar CIF (feature simples):**
   - TDD clássico (teste → implementação → refatoração)
   - Atualizar CHECKPOINT ao final

## Filosofia

- **Deduzir possibilidades e perguntar** para aperfeiçoar este arquivo
- **Componentizar sempre** (DRY, separação de concerns)
- **Documentar decisões** (arquitetura, padrões, trade-offs)
- **Testar sistematicamente** (unitário + integração)
- **Manter rastreabilidade** (origem dos dados, auditoria)

---

**Este guia é um documento vivo. Aperfeiçoe-o conforme o projeto evolui.**
