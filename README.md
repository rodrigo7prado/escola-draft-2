# Sistema de Emissão de Certificados

Sistema interno para emissão de certificados e certidões de alunos concluintes do Ensino Médio.

---

## 🎯 CONTEXTO RÁPIDO (para Claude)

**Sistema:** Emissão de Certificados, Certidões e Histórico Escolar para escolas do Ensino Médio
**Usuários:** Secretárias escolares e funcionários de secretaria (leigos em TI)
**Dados:** Importados via CSV + texto estruturado do sistema oficial

---

## 🏗️ STACK TECNOLÓGICA

- **Frontend:** Next.js 15 + React 19 + TypeScript + Tailwind CSS
- **Backend:** Next.js API Routes
- **Banco de Dados:** PostgreSQL (DOIS bancos: `certificados` + `certificados_test`)
- **ORM:** Prisma 6.18
- **Testes:** Vitest (54 unitários + 88 integração = 142 testes)
- **Package Manager:** pnpm (NUNCA usar npm)

---

## ⚙️ CONFIGURAÇÃO

### Banco de Dados (CRÍTICO)

**⚠️ SEMPRE usar DOIS bancos:**

**Migrations (OBRIGATÓRIO aplicar em AMBOS):**

```bash
pnpm migrate:all         # Aplica migrations em ambos os bancos
pnpm migrate:dev "nome"  # Cria nova migration e aplica em ambos
```

### Comandos de Desenvolvimento

```bash
# Desenvolvimento
pnpm dev              # Inicia servidor (http://localhost:3000)

# Testes
pnpm test             # Todos os testes (142 testes)
pnpm test:unit        # Apenas unitários (54 testes)
pnpm test:integration # Apenas integração (88 testes)
pnpm test:watch       # Modo watch

# Banco de dados
pnpm prisma studio    # Visualizar banco principal
DATABASE_URL=$DATABASE_URL_TEST pnpm prisma studio  # Banco de testes

# Linting
pnpm lint
pnpm format
```

---

## 📁 ESTRUTURA DO PROJETO

```
src/
  app/
    page.tsx                    # Página inicial (tudo integrado via abas)
    api/
      files/route.ts            # POST/GET/DELETE - Upload e migração de CSVs
      filtros/route.ts          # GET - Opções hierárquicas (ano, turma, etc)
      alunos/route.ts           # GET - Busca de alunos com filtros
  components/
    ui/                         # Componentes genéricos reutilizáveis
      Tabs.tsx, Modal.tsx, ButtonGroup.tsx, FormField.tsx, Input.tsx, etc.
    FluxoCertificacao.tsx       # Container principal do fluxo
    FiltrosCertificacao.tsx     # Filtros de período/turma
    DadosAlunoEditavel.tsx      # Painel de dados do aluno (7 seções)
    MigrateUploads.tsx          # Upload e migração de CSVs
  hooks/
    useFiltrosCertificacao.ts   # Lógica de filtros
    useAlunosCertificacao.ts    # Busca de alunos
  lib/
    prisma.ts                   # Cliente Prisma
    csv.ts                      # Utilidades CSV (limparValor, limparCamposContexto)
  tests/
    unit/                       # 54 testes unitários
    integration/                # 88 testes de integração
    helpers/                    # db-setup.ts, csv-fixtures.ts

prisma/
  schema.prisma               # Modelos: Aluno, Enturmacao, ArquivoImportado, etc.
  migrations/                 # Migrations (7 arquivos)

docs/
  METODOLOGIA_CIF.md          # Metodologia de desenvolvimento (~580 linhas)
  CHECKPOINT_METODOLOGIA_CIF.md  # Estado atual do projeto
  ciclos/                     # Documentação de funcionalidades (CIF)
    MIGRACAO_*                # Painel de Migração (CONCEITO, ESPECIFICACAO, TECNICO, CICLO)
    IMPORTACAO_ESTRUTURADA_*  # Importação por texto (CONCEITO, DESCOBERTA, ESPECIFICACAO, TECNICO, CICLO, CHECKPOINT)
  templates/                  # Templates CIF (CONCEITO, DESCOBERTA, ESPECIFICACAO, TECNICO, CICLO)

scripts/
  migrate-all.sh              # Aplica migrations em ambos os bancos
  reset-database.ts           # Reset completo do banco
  check-data.ts               # Verificar dados no banco
```

---

## 🗂️ ARQUITETURA DE BANCO DE DADOS

### 3 Camadas (Ver detalhes: [docs/ciclos/MIGRACAO_TECNICO.md](./docs/ciclos/MIGRACAO_TECNICO.md))

**CAMADA 1: Origem (Imutável)**

- `ArquivoImportado` - Metadados de CSVs (hash SHA-256, nome, status)
- `LinhaImportada` - Dados brutos em JSONB

**CAMADA 2: Estruturada (Editável)**

- `Aluno` - Dados pessoais, documentos, naturalidade, filiação, ensino médio/fundamental
- `Enturmacao` - Relaciona Aluno → Turma → Período letivo (1-N, múltiplas enturmações por aluno)

**CAMADA 3: Auditoria**

- `Auditoria` - Registro de alterações nas entidades

### Princípios Importantes

- **Enturmações Múltiplas:** Aluno pode ter N enturmações (2022/1ª série, 2023/2ª série, 2024/3ª série)
- **Parsing de CSV:** Valores vêm com prefixos ("Ano Letivo: 2024") → usar `limparValor()` de `src/lib/csv.ts`
- **Reset/Reimportação:** Hard delete da Camada 1 + SetNull na Camada 2 + flag `fonteAusente`

---

## 🎯 FUNCIONALIDADES IMPLEMENTADAS

### ✅ 1. Painel de Migração

- Upload drag-and-drop de múltiplos CSVs
- Detecção de duplicatas (hash SHA-256)
- Parsing com remoção de prefixos
- Visualização hierárquica: Período → Modalidade → Turma → Alunos
- Sistema de reset/reimportação
- Transação completa (operações atômicas)
- **Docs:** [docs/ciclos/MIGRACAO\_\*](./docs/ciclos/)
- **Status:** ✅ Produção (88/88 testes passando)

### ✅ 2. Importação Estruturada por Texto

- Entrada de texto formatado (múltiplas seções)
- Validação automática de estrutura
- Parsing inteligente para extrair dados
- Popular banco com rastreabilidade
- **Docs:** [docs/ciclos/IMPORTACAO*ESTRUTURADA*\*](./docs/ciclos/)
- **Status:** ✅ Produção

### ✅ 3. Fluxo de Certificação

- Visualização de alunos concluintes (3ª série)
- Filtros por período/turma com auto-seleção
- Painel de dados (7 seções)
- **Pendente:** Edição, salvamento, histórico escolar
- **Status:** ⚠️ Interface pronta, funcionalidade parcial

---

## 📚 DOCUMENTAÇÃO IMPORTANTE

### Para Claude (LEIA ANTES DE IMPLEMENTAR)

1. **[CLAUDE.md](./CLAUDE.md)** - Guia de arquitetura e padrões (~800 linhas)

   - Metodologia CIF (resumo executivo)
   - Padrões de código e componentização
   - Decisões técnicas críticas (migrations, parsing CSV)
   - Convenções de nomenclatura
   - Regras de negócio do domínio educacional

2. **[docs/METODOLOGIA_CIF.md](./docs/METODOLOGIA_CIF.md)** - Metodologia completa (~580 linhas)

   - 5 níveis: CONCEITO, DESCOBERTA, ESPECIFICAÇÃO, TÉCNICO, CICLO
   - Workflows (funcionalidade nova, existente, refatoração)
   - Sistema de numeração de validações
   - Integração com testes

3. **[docs/CHECKPOINT_METODOLOGIA_CIF.md](./docs/CHECKPOINT_METODOLOGIA_CIF.md)** - Estado atual
   - Progresso das funcionalidades
   - Tarefas concluídas e pendentes
   - Bloqueadores e próximos passos

### Funcionalidades Documentadas (CIF Completo)

**Painel de Migração:**

- [CONCEITO](./docs/ciclos/MIGRACAO_CONCEITO.md)
- [ESPECIFICAÇÃO](./docs/ciclos/MIGRACAO_ESPECIFICACAO.md) - 80 validações, 88 testes
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

## ⚙️ DECISÕES TÉCNICAS CRÍTICAS

### 1. Package Manager

**SEMPRE usar `pnpm` (nunca npm)**

### 2. Gestão de Migrations

**SEMPRE aplicar em AMBOS os bancos** (`pnpm migrate:all`)

### 3. Parsing de CSV

**Usar `limparValor()` de `src/lib/csv.ts`** para remover prefixos

### 4. Componentização

- **Separação:** Hooks (lógica) + Componentes (UI) + Containers (composição)
- **Reutilização:** Componentes genéricos em `src/components/ui/`
- **Campos de formulário:** SEMPRE usar FormField, Input, DateInput, etc. (nunca criar inline)

### 5. Auto-inicialização de Filtros

**Filtros iniciam com valores padrão** (ano mais recente, primeira turma)

---

## 🎨 PADRÕES DE UI

### Cores Semânticas

- 🔴 Vermelho: PENDENTE
- 🟠 Laranja: RESOLVENDO
- 🔵 Azul: OK (não alterado)
- 🟢 Verde: CORRIGIDO
- 🟡 Amarelo: Avisos (fonte ausente)

### Tamanhos

- Títulos: `text-lg` ou `text-xl`
- Labels: `text-xs`
- Campos: `text-sm`
- Hints: `text-[10px]`

---

## 📋 REGRAS DE NEGÓCIO

### Estrutura Curricular (SEEDUC-RJ)

- **Modalidades:** REGULAR, EJA, NOVO ENSINO MÉDIO
- **Regimes:** Anual (0), Semestral (1, 2)
- **Séries:** 1ª, 2ª, 3ª
- **Períodos avaliativos:** Anual = 4 bimestres, Semestral = 2 bimestres

### Critérios de Aprovação

- **Nota:** 0-10 por bimestre, média 5
- **Anual:** 20 pontos totais (média 5 em 4 bimestres)
- **Semestral:** 10 pontos totais (média 5 em 2 bimestres)
- **Frequência:** Mínimo 75%

---

## 🎯 PRINCÍPIOS DE TRABALHO

### Antes de Implementar

1. Verificar se deve usar CIF (funcionalidade complexa?)
2. Perguntar ao usuário sobre os passos
3. Compreensão hierárquica (geral → local → código)
4. Não gerar estruturas sem compreensão conceitual

### Durante Implementação

1. **CIF (complexo):** CONCEITO → DESCOBERTA (se necessário) → experimentar → ESPECIFICACAO + testes → TECNICO → CICLO
2. **TDD (simples):** teste → implementação → refatoração
3. **SEMPRE atualizar CHECKPOINT ao final da sessão**

### Filosofia

- Componentizar sempre (DRY)
- Testar sistematicamente
- Documentar decisões
- Manter rastreabilidade

---

**Este arquivo é otimizado para Claude. Para documentação humana, ver futura versão expandida.**
