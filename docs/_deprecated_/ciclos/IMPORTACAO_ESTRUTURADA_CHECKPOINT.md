# CHECKPOINT - Importação Estruturada por Texto

**Data:** 2025-11-11
**Status:** ✅ Fase 1 (Backend) + Fase 2 (Frontend) COMPLETAS

---

## ✅ FASE 1: BACKEND (COMPLETO)

### 1. Database Schema (Prisma)

**Arquivo:** `prisma/schema.prisma`

**Novos campos no modelo `Aluno` (32 campos):**

```prisma
// Dados cadastrais (10)
nome, nomeSocial, sexo, dataNascimento, estadoCivil,
paisNascimento, nacionalidade, naturalidade, uf, necessidadeEspecial

// Documentos (7)
tipoDocumento, rg, complementoIdentidade, estadoEmissao,
rgOrgaoEmissor, rgDataEmissao, cpf

// Filiação (4)
nomeMae, cpfMae, nomePai, cpfPai

// Contato (1)
email

// Certidão Civil (10)
tipoCertidaoCivil, numeroCertidaoCivil, ufCartorio, municipioCartorio,
nomeCartorio, numeroTermo, dataEmissaoCertidao, estadoCertidao,
folhaCertidao, livroCertidao

// Campos de controle da importação estruturada
dadosOriginais                    Json?     @db.JsonB
textoBrutoDadosPessoais           String?   @db.Text
textoBrutoDadosEscolares          String?   @db.Text
dataImportacaoTextoDadosPessoais  DateTime?
dataImportacaoTextoDadosEscolares DateTime?
```

**Migrations executadas:**
- ✅ Migration 1: Campos básicos
- ✅ Migration 2: Campos de filiação (CPF mãe/pai)
- ✅ Migration 3: Todos os 32 campos + campos de certidão civil

---

### 2. Módulos de Parsing

#### `src/lib/parsing/detectarTipoPagina.ts`
**Propósito:** Detecta automaticamente se texto é "dadosPessoais" ou "dadosEscolares"

**Estratégia:**
- Marcadores de dados pessoais: NOME COMPLETO, MATRÍCULA, DATA DE NASCIMENTO
- Marcadores de dados escolares: COMPONENTE CURRICULAR, NOTA, FREQ, RESULTADO
- Lança erro se detectar ambos (ambiguidade)

**Testes:** ✅ 4/4 passando

---

#### `src/lib/parsing/normalizarSexo.ts`
**Propósito:** Normaliza valor de sexo para 'M' | 'F'

**Transformações:**
- "Masculino", "masculino", "MASCULINO", "M", "m" → "M"
- "Feminino", "feminino", "FEMININO", "F", "f" → "F"
- Qualquer outro valor → `undefined`

**Testes:** ✅ 5/5 passando

---

#### `src/lib/parsing/parseDadosPessoais.ts`
**Propósito:** Extrai todos os 32 campos do texto colado

**Atualização (2025-02-13): parser reescrito com descritores ordenados**

1. **`CAMPOS_DESCRITORES` como fonte da verdade**
   - Cada descritor define label, *aliases*, estratégia (`mesmaLinha`, `mesmaOuProxima`, `naturalidade`) e saneamentos específicos (CPF, naturalidade, placeholders).
   - Labels repetidos usam âncoras de seção ("OUTROS DOCUMENTOS", "CERTIDÃO CIVIL") para evitar colisões.

2. **Tratamento consistente de valores vazios**
   - Lista centralizada de placeholders ("Selecione", "Saiba Mais", "Não declarado", etc.) evita salvar instruções do formulário.
   - Recorte automático entre "Dados Pessoais" e "Próximo >>" remove menus e rodapés antes do parsing.

3. **Normalizações dedicadas**
   - `sanitizeCPF` limpa todos os CPFs (aluno, mãe, pai, documentos) e naturalidade aceita formato inline ou multiline.
   - Sexo continua opcional no parser (campo rádio não aparece na colagem); confirmação ocorre no modal conforme CIF.

**Testes:** ✅ `tests/lib/parsing/parsing.test.ts` atualizado com cenário real de colagem + casos básicos

### 3. ✅ Recarregamento automático após salvar

**Status:** Concluído em 14/11/2025

**Implementação técnica:**
- `useAlunoSelecionado` e `useAlunosCertificacao` migraram para SWR e agora expõem `refreshAlunoSelecionado`/`refreshAlunos`, permitindo `mutate()` logo após o POST.
- `useModoColagem` passou a aceitar `onDadosConfirmados` e dispara os dois refreshes assim que `/salvar` retorna sucesso.
- `DadosAlunoEditavel` observa o objeto completo no `useMemo` e exibe o aviso “Atualizando dados...” enquanto o SWR revalida, evitando flicker no painel.

**Cobertura de testes 🧪:**
- `tests/hooks/useModoColagem.test.tsx` garante que o callback pós-salvar é disparado.
- `tests/hooks/useAlunoSelecionado.test.tsx` e `tests/hooks/useAlunosCertificacao.test.tsx` simulam respostas diferentes e confirmam que os hooks aplicam os dados novos.
- `tests/integration/api/importacao-salvar-refresh.test.ts` importa diretamente os route handlers e comprova que o GET já devolve a versão atualizada após o POST.

**Resultado:** painel e lista refletem os dados confirmados imediatamente, sem recarregar a página nem trocar de aluno.

---

### 4. Testes Automatizados

**Framework:** Vitest
**Total de testes:** 21
**Status:** ✅ 21/21 passando (100%)

**Cobertura:**
- `detectarTipoPagina`: 4 testes
- `normalizarSexo`: 5 testes
- `parseDadosPessoais`: 12 testes

**Arquivo:** `tests/lib/parsing/parsing.test.ts`

**Correções aplicadas:**
- ✅ Corrigido `tests/setup.ts`: `globalThis.IS_REACT_ACT_ENVIRONMENT` → `(globalThis as any).IS_REACT_ACT_ENVIRONMENT`

---

## ✅ FASE 2: FRONTEND (COMPLETO)

### 1. Hook Principal: useModoColagem

**Arquivo:** `src/hooks/useModoColagem.ts` ✅ CRIADO

**Responsabilidades:**
- Gerencia estado de ativação de modo colagem por aluno
- Processa texto colado via API `/api/importacao-estruturada`
- Controla abertura/fechamento do modal de confirmação
- Salva dados confirmados via API `/api/importacao-estruturada/salvar`

**Estado gerenciado:**
- `alunoIdAtivo: string | null` - ID do aluno com modo colagem ativo
- `dadosParsed: DadosPessoais | null` - Dados parseados aguardando confirmação
- `precisaConfirmarSexo: boolean` - Se sexo precisa ser selecionado manualmente
- `isProcessando: boolean` - Loading durante parsing
- `isSalvando: boolean` - Loading durante salvamento
- `modalAberto: boolean` - Controle do modal
- `erro: string | null` - Mensagem de erro
- `textoBruto: string | null` - Texto original (para salvamento)

**Handlers:**
- `ativarModoColagem(alunoId)` - Ativa modo para aluno
- `desativarModoColagem()` - Desativa modo
- `handlePaste(texto, matricula, alunoId)` - Processa texto colado
- `fecharModal()` - Fecha modal sem salvar
- `confirmarDados(dados, sexoConfirmado?)` - Salva dados no banco

---

### 2. Componente: BotaoColagemAluno

**Arquivo:** `src/components/BotaoColagemAluno.tsx` ✅ CRIADO

**Funcionalidades:**
- Botão "📋" - Copia matrícula para clipboard (9px, compacto)
- Botão "🔓 Colar" / "✓ Colagem" - Toggle do modo colagem
  - Inativo: cinza, ghost variant
  - Ativo: verde (`bg-green-600 hover:bg-green-700`)

**Props:**
```typescript
{
  matricula: string;
  alunoId: string;
  isModoColagemAtivo: boolean;
  onToggleModoColagem: () => void;
  disabled?: boolean;
}
```

**Localização:** Aparece dentro do item selecionado em `ListaAlunosCertificacao`

---

### 3. Componente: AreaColagemDados

**Arquivo:** `src/components/AreaColagemDados.tsx` ✅ CRIADO

**Funcionalidades:**
- Escuta evento global `paste` quando modo colagem está ativo
- Overlay verde no topo direito com mensagem "Modo colagem ativo - Cole o texto (Ctrl+V)"
- Mostra loading durante processamento (spinner + "Processando...")
- Exibe erros em overlay vermelho se houver

**Props:**
```typescript
{
  isAtivo: boolean;
  matricula: string;
  alunoId: string;
  isProcessando: boolean;
  erro: string | null;
  onPaste: (texto: string, matricula: string, alunoId: string) => void;
}
```

**Comportamento:**
- Renderiza overlay fixo global (`position: fixed`)
- Div invisível focável para capturar paste
- Desaparece quando `isAtivo = false`

---

### 4. Componente: ModalConfirmacaoDados

**Arquivo:** `src/components/ModalConfirmacaoDados.tsx` ✅ CRIADO

**Funcionalidades:**
- Modal grande (`size="lg"`) com 5 seções organizadas
- Campo especial para seleção de sexo (quando não detectado)
- Suporte a Enter para confirmar
- Validação: bloqueia confirmação se sexo obrigatório não foi selecionado

**Props:**
```typescript
{
  open: boolean;
  dados: DadosPessoais | null;
  precisaConfirmarSexo: boolean;
  isSalvando: boolean;
  onConfirmar: (dados: DadosPessoais, sexoConfirmado?: "M" | "F") => void;
  onCancelar: () => void;
}
```

**Seções exibidas:**
1. **Dados Cadastrais** (10 campos) - nome, sexo, data nascimento, etc.
2. **Documentos** (7 campos) - RG, CPF, órgão emissor, etc.
3. **Filiação** (4 campos) - nome mãe/pai, CPF mãe/pai
4. **Contato** (1 campo) - email (só mostra se presente)
5. **Certidão Civil** (10 campos) - tipo, número, cartório, etc. (só mostra se presente)

**Layout:**
- Grid de 2 colunas: `[140px_1fr]` (label + valor)
- Campos vazios não são exibidos
- Alert amarelo quando precisa confirmar sexo

---

### 5. Componente Auxiliar: Select

**Arquivo:** `src/components/ui/Select.tsx` ✅ CRIADO

**Propósito:** Select genérico reutilizável

**Props:**
```typescript
{
  options: Array<{ value: string; label: string }>;
  className?: string;
  ...SelectHTMLAttributes
}
```

---

### 6. Integração: FluxoCertificacao

**Arquivo:** `src/components/FluxoCertificacao.tsx` ✅ ATUALIZADO

**Mudanças:**
- Importa e usa hook `useModoColagem`
- Renderiza `<AreaColagemDados>` quando modo ativo
- Renderiza `<ModalConfirmacaoDados>`
- Passa callbacks para `ListaAlunosCertificacao`

---

### 7. Integração: ListaAlunosCertificacao

**Arquivo:** `src/components/ListaAlunosCertificacao.tsx` ✅ ATUALIZADO

**Mudanças:**
- Nova prop: `alunoIdModoColagemAtivo: string | null`
- Nova prop: `onToggleModoColagem: (alunoId: string, ativo: boolean) => void`
- Renderiza `<BotaoColagemAluno>` para aluno selecionado
- Wrapper `<div>` ao redor de cada aluno para acomodar botões

---

## 🎯 FLUXO COMPLETO IMPLEMENTADO

1. ✅ Usuário seleciona aluno na lista
2. ✅ Botões de colagem aparecem abaixo do nome
3. ✅ Clica em "📋" para copiar matrícula
4. ✅ Clica em "🔓 Colar" - botão fica verde
5. ✅ Overlay verde aparece: "Modo colagem ativo"
6. ✅ Usuário cola texto (Ctrl+V) de qualquer lugar
7. ✅ Sistema processa e detecta tipo automaticamente
8. ✅ Modal abre mostrando todos os dados parseados
9. ✅ Se sexo não foi detectado, dropdown obrigatório aparece
10. ✅ Usuário confirma (Enter ou botão)
11. ✅ Dados são salvos no banco
12. ✅ Modo colagem desativa automaticamente

---

## 🔧 PROBLEMAS RESOLVIDOS (Fase 2)

### Problema 1: Erro de tipo Zod
**Sintoma:** `error.errors[0]` não existe em ZodError
**Solução:** Usar `error.issues[0]` (API correta do Zod)
**Arquivos corrigidos:**
- `src/app/api/importacao-estruturada/route.ts`
- `src/app/api/importacao-estruturada/salvar/route.ts`
**Status:** ✅ Resolvido

### Problema 2: Erro de tipo globalThis
**Sintoma:** `globalThis.IS_REACT_ACT_ENVIRONMENT` não tem index signature
**Solução:** Cast para `any`: `(globalThis as any).IS_REACT_ACT_ENVIRONMENT`
**Arquivo corrigido:** `tests/setup.ts`
**Status:** ✅ Resolvido

### Problema 3: Build error com useContext
**Sintoma:** Erro no build production - "Cannot read properties of null (reading 'useContext')"
**Status:** ⚠️ EM INVESTIGAÇÃO (dev server funciona corretamente)
**Workaround:** Usar `pnpm dev` para desenvolvimento e testes

---

## ✅ FASE 3: MELHORIAS (EM ANDAMENTO)

### 1. ✅ CONCLUÍDO: Atualizar API de salvamento

**Arquivo:** `src/app/api/importacao-estruturada/salvar/route.ts`

**Tarefa:** Mapear todos os 32 campos parseados para o banco de dados

**Status:** ✅ COMPLETO - Todos os 32 campos agora são salvos

**Mudanças implementadas:**

1. **Schema Zod atualizado** (linhas 8-54):
   - Dados Cadastrais: 10 campos
   - Documentos: 7 campos
   - Filiação: 4 campos
   - Contato: 1 campo
   - Certidão Civil: 10 campos

2. **Helper de conversão de data** (linhas 85-93):
   - Converte formato DD/MM/YYYY para Date
   - Tratamento de erro (retorna undefined se falhar)

3. **Update do Prisma completo** (linhas 96-152):
   - Todos os 32 campos mapeados
   - Estratégia: `dados.campo || aluno.campo` (preserva valor existente se novo for vazio)
   - Comentários organizados por categoria

**Campos agora salvos:** 32/32 (100%)

**Antes:** 13 campos mapeados
**Depois:** 32 campos mapeados

---

## 📋 PRÓXIMOS PASSOS (Fase 3 - Melhorias Restantes)

---

### 2. Sistema de Notificações (Toast)

**Tarefa:** Substituir `alert()` por notificações visuais

**Casos de uso:**
- ✅ Matrícula copiada
- ✅ Dados salvos com sucesso
- ❌ Erro ao processar
- ❌ Erro ao salvar

**Opções:**
- Biblioteca: `react-hot-toast` ou `sonner`
- Custom: Criar componente `Toast.tsx` + context

---

### 3. ✅ Recarregamento automático após salvar

**Status:** Concluído em 14/11/2025

**Implementação técnica:**
- `useAlunoSelecionado` e `useAlunosCertificacao` migraram para SWR e agora expõem `refreshAlunoSelecionado`/`refreshAlunos`, permitindo `mutate()` logo após o POST.
- `useModoColagem` passou a aceitar `onDadosConfirmados` e dispara os dois refreshes assim que `/salvar` retorna sucesso.
- `DadosAlunoEditavel` observa o objeto completo no `useMemo` e exibe o aviso “Atualizando dados...” enquanto o SWR revalida, evitando flicker no painel.

**Cobertura de testes 🧪:**
- `tests/hooks/useModoColagem.test.tsx` garante que o callback pós-salvar é disparado.
- `tests/hooks/useAlunoSelecionado.test.tsx` e `tests/hooks/useAlunosCertificacao.test.tsx` simulam respostas diferentes e confirmam que os hooks aplicam os dados novos.
- `tests/integration/api/importacao-salvar-refresh.test.ts` importa diretamente os route handlers e comprova que o GET já devolve a versão atualizada após o POST.

**Resultado:** painel e lista refletem os dados confirmados imediatamente, sem recarregar a página nem trocar de aluno.

---

### 4. Comparação Visual + Edição no DadosAlunoEditavel

**Status:** ✅ Refatoração concluída nesta sessão

**Atualizações realizadas:**
- `src/lib/importacao/dadosPessoaisMetadata.ts` virou a fonte única de metadados dos 32 campos (labels, categorias, tipo de input, normalização para datas/CPFs).
- `src/hooks/useAlunoSelecionado.ts` passa a buscar o aluno completo + `dadosOriginais`, usando aliases quando o nome do campo no Prisma diverge (`rgOrgaoEmissor`, `rgDataEmissao`).
- `src/components/DadosAlunoEditavel.tsx` foi reescrito como painel comparativo editável: inputs são gerados a partir do metadata, badges indicam apenas diferenças reais e há botão de reset. Datas e CPFs são normalizados antes da comparação, evitando falsos “Atualizado”.
- `src/hooks/useModoColagem.ts` bloqueia colagens com matrícula divergente (extraímos a matrícula do texto colado) e ganhou testes (`tests/lib/hooks/useModoColagem.test.tsx`).
- `prisma/schema.prisma` agora gera binário Windows além do `native`, evitando erros ao rodar o app fora do WSL.

**Próximos incrementos possíveis:**
- Implementar ação “Restaurar valor original” campo a campo.
- Conectar o formulário ao endpoint de atualização para persistir alterações.

---

### 5. Resolver erro de build production

**Problema:** Build falha com erro de `useContext`

**Investigar:**
- Verificar se todos os componentes client têm `"use client"`
- Verificar se Modal está sendo usado corretamente
- Verificar compatibilidade Next.js 16 + Turbopack

---

### 6. Testes de Integração (Frontend)

**Criar testes para:**
- Hook `useModoColagem`
- Componente `BotaoColagemAluno`
- Componente `AreaColagemDados`
- Componente `ModalConfirmacaoDados`
- Fluxo completo end-to-end

**Framework:** Vitest + Testing Library

---

## 🔗 ARQUIVOS CRIADOS/MODIFICADOS

### ✅ Backend (Fase 1 - COMPLETO)
- `prisma/schema.prisma` - Schema com 32 novos campos
- `src/lib/parsing/detectarTipoPagina.ts` - Detector de tipo
- `src/lib/parsing/normalizarSexo.ts` - Normalizador de sexo
- `src/lib/parsing/parseDadosPessoais.ts` - Parser principal
- `src/app/api/importacao-estruturada/route.ts` - API de parsing (corrigido)
- `src/app/api/importacao-estruturada/salvar/route.ts` - API de salvamento (corrigido)
- `tests/lib/parsing/parsing.test.ts` - 21 testes (100%)
- `tests/setup.ts` - Setup de testes (corrigido)

### ✅ Frontend (Fase 2 - COMPLETO)
- `src/hooks/useModoColagem.ts` - Hook principal ✅ CRIADO (agora com bloqueio por matrícula + testes)
- `src/components/BotaoColagemAluno.tsx` - Botões de ação ✅ CRIADO
- `src/components/AreaColagemDados.tsx` - Captura de paste ✅ CRIADO
- `src/components/ModalConfirmacaoDados.tsx` - Modal de confirmação ✅ CRIADO
- `src/components/ui/Select.tsx` - Select genérico ✅ CRIADO
- `src/components/FluxoCertificacao.tsx` - Container principal ✅ ATUALIZADO
- `src/components/ListaAlunosCertificacao.tsx` - Lista de alunos ✅ ATUALIZADO
- `src/components/DadosAlunoEditavel.tsx` - Painel comparativo/edição ✅ REFEITO
- `src/hooks/useAlunoSelecionado.ts` - Busca aluno completo + dados originais ✅ ATUALIZADO

### 🔜 Pendente (Fase 3 - Melhorias)
- Sistema de notificações (Toast)
- Recarregamento automático após salvar
- Persistir alterações do painel comparativo
- Testes de frontend

### 📚 Documentação
- `docs/ciclos/IMPORTACAO_ESTRUTURADA_CONCEITO.md`
- `docs/ciclos/IMPORTACAO_ESTRUTURADA_DESCOBERTA.md`
- `docs/ciclos/IMPORTACAO_ESTRUTURADA_ESPECIFICACAO.md`
- `docs/ciclos/IMPORTACAO_ESTRUTURADA_TECNICO.md` - ⚠️ PENDENTE
- `docs/ciclos/IMPORTACAO_ESTRUTURADA_CICLO.md`
- `docs/ciclos/IMPORTACAO_ESTRUTURADA_CHECKPOINT.md` - Este arquivo ✅ ATUALIZADO

### 📋 Modelos de Referência
- 📄 **[modelos/DadosPessoaisColagemModelo.md](./modelos/DadosPessoaisColagemModelo.md)** - Exemplo completo de texto colado do sistema oficial (Dados Pessoais)

---

## 🏗️ ABSTRAÇÕES IMPLEMENTADAS

### ✅ Componentes Reutilizáveis (compartilhados entre tipos de dados)

#### 1. **Hook de Estado: `useModoColagem`**
**Princípio:** Gerenciar colagem de qualquer tipo de dado com único hook

**Reutilização:**
- ✅ Dados Pessoais: detecta tipo "dadosPessoais" → abre `ModalConfirmacaoDados`
- 🔜 Dados Escolares: detectará tipo "dadosEscolares" → abrirá `ModalConfirmacaoPeriodos`

**Abstração implementada:**
- Detecção automática via `detectarTipoPagina`
- Validação de matrícula antes de processar
- Estado genérico de modais (tipo `unknown`)

---

#### 2. **Estratégia de Parsing**
**Princípio:** Descritores como fonte única da verdade

**Reutilização:**
- ✅ Dados Pessoais: `CAMPOS_DESCRITORES` em `parseDadosPessoais.ts`
- 🔜 Dados Escolares: descritores em `parsePeriodosCursados.ts` (mesma filosofia)

**Abstração implementada:**
- Metodologia: campo → label + aliases + regex + saneamento
- Não duplicar código, duplicar **padrão**

---

#### 3. **Padrão de Modal de Confirmação**
**Princípio:** Estrutura comum (lista → confirmar → salvar)

**Reutilização:**
- ✅ `ModalConfirmacaoDados` (Dados Pessoais) - 5 seções, Enter para confirmar
- 🔜 `ModalConfirmacaoPeriodos` (Dados Escolares) - tabela, Enter para confirmar

**Abstração implementada:**
- Layout padronizado (grid 2 colunas: label + valor)
- Suporte a Enter/Esc
- Loading states durante salvamento

---

#### 4. **Armazenamento Dual**
**Princípio:** Texto bruto + dados estruturados

**Reutilização:**
- ✅ Dados Pessoais: `textoBrutoDadosPessoais` + `dadosOriginais` (JSONB)
- 🔜 Dados Escolares: `textoBrutoDadosEscolares` + `PeriodoCursado[]` (relacional)

**Abstração implementada:**
- Rastreabilidade completa
- Reprocessamento possível

---

#### 5. **Componentes de UI Genéricos**
**Princípio:** UI não sabe qual tipo de dado processa

**Reutilização (mesmo componente para ambos os tipos):**
- ✅ `BotaoColagemAluno` - Botões copiar/colar
- ✅ `AreaColagemDados` - Captura global de paste
- ✅ `Tabs` - Sistema de abas em `DadosAlunoEditavel`

**Abstração implementada:**
- Props genéricas (não acopladas a tipo de dado)
- Callbacks para comunicação com hook

---

### 🔄 Onde NÃO Reutilizamos (por design)

| Componente | Por que NÃO reusar | Solução |
|------------|-------------------|---------|
| **Parsers** | Formato completamente diferente (chave-valor vs tabela) | Parsers separados com mesma **metodologia** |
| **Modais** | Estrutura de dados diferente (lista vs tabela de períodos) | Modais separados com mesmo **padrão de UX** |
| **Models Prisma** | Dados Pessoais = campos do Aluno; Dados Escolares = relacional 1-N | Models separados, mas ambos com **armazenamento dual** |

---

## 🧪 CHECKPOINTS DE TESTES

### ✅ Testes Implementados - Dados Pessoais

#### **Backend (Parsing)**
- **Arquivo:** `tests/lib/parsing/parsing.test.ts`
- **Status:** ✅ 21/21 passando (100%)
- **Cobertura:**
  - Detecção de tipo de página (4 testes)
  - Normalização de sexo (5 testes)
  - Parsing de dados pessoais (12 testes)

**Casos testados:**
- ✅ Parsing completo com todos os 32 campos
- ✅ Campos ausentes/opcionais
- ✅ Normalização de CPF (remoção de pontuação)
- ✅ Naturalidade com formato especial (código + nome)
- ✅ Detecção de placeholders ("Selecione", "Não declarado")
- ✅ Recorte automático (remove menu e rodapé)

---

#### **Frontend (Hooks)**
- **Arquivo:** `tests/hooks/useModoColagem.test.tsx`
- **Status:** ✅ Testes básicos implementados
- **Cobertura:**
  - Bloqueio de matrícula divergente
  - Callback de confirmação disparado

**Arquivo:** `tests/hooks/useAlunoSelecionado.test.tsx`
- **Status:** ✅ Testes de SWR implementados
- **Cobertura:**
  - Refresh após salvamento
  - Merge de dados originais + editáveis

**Arquivo:** `tests/hooks/useAlunosCertificacao.test.tsx`
- **Status:** ✅ Testes de refresh implementados

---

#### **API (Integração)**
- **Arquivo:** `tests/integration/api/importacao-salvar-refresh.test.ts`
- **Status:** ✅ Implementado
- **Cobertura:**
  - POST `/api/importacao-estruturada/salvar` → GET retorna dados atualizados
  - Validação de refresh automático

---

### 🔜 Testes Pendentes - Dados Escolares

#### **Backend (Parser de Períodos)**
- **Arquivo:** `tests/lib/parsing/parsePeriodosCursados.test.ts` (a criar)
- **Status:** 🔜 Pendente
- **Casos a testar:**
  - [ ] Parsing de dados de ingresso (5 campos)
  - [ ] Parsing de tabela de renovação (múltiplas linhas)
  - [ ] Primeira linha enriquecida (ingresso + tabela + matriz)
  - [ ] Split de "Modalidade / Segmento / Curso"
  - [ ] Campos não capturáveis (ensinoReligioso, linguaEstrangeira sempre NULL)
  - [ ] Cenário: 1 período (mínimo)
  - [ ] Cenário: 3 períodos (típico)
  - [ ] Cenário: sem dados de ingresso (erro ou default?)

---

#### **API (Integração - Períodos)**
- **Arquivo:** `tests/integration/api/importacao-periodos.test.ts` (a criar)
- **Status:** 🔜 Pendente
- **Casos a testar:**
  - [ ] POST `/api/importacao-estruturada` com texto de dados escolares
  - [ ] Detecção correta do tipo "dadosEscolares"
  - [ ] POST `/api/importacao-estruturada/salvar-periodos` (criação em lote)
  - [ ] Substituição de períodos existentes (delete + insert)
  - [ ] Armazenamento de `textoBrutoDadosEscolares`

---

#### **Frontend (Modo Colagem - Períodos)**
- **Arquivo:** `tests/hooks/useModoColagem-periodos.test.tsx` (a criar)
- **Status:** 🔜 Pendente
- **Casos a testar:**
  - [ ] Abertura de `ModalConfirmacaoPeriodos` ao detectar tipo "dadosEscolares"
  - [ ] Salvamento de períodos via endpoint específico
  - [ ] Refresh de `useAlunoSelecionado` após salvar períodos

---

### 📊 Cobertura de Testes por Fase

| Fase | Módulo | Testes Implementados | Testes Pendentes | Cobertura |
|------|--------|----------------------|------------------|-----------|
| **Fase 1 (Backend - Dados Pessoais)** | Parsing | 21 | 0 | 100% ✅ |
| **Fase 2 (Frontend - Dados Pessoais)** | Hooks | 3 arquivos | - | Básico ✅ |
| **Fase 2 (Frontend - Dados Pessoais)** | API | 1 arquivo | - | Básico ✅ |
| **Fase 8 (Backend - Períodos)** | Parser de Períodos | 0 | ~8-10 | 0% 🔜 |
| **Fase 8 (API - Períodos)** | Endpoints | 0 | ~5-7 | 0% 🔜 |
| **Fase 8 (Frontend - Períodos)** | Hooks + Modal | 0 | ~3-5 | 0% 🔜 |

---

### 🎯 Estratégia de Testes para Dados Escolares

**Seguir mesma metodologia de Dados Pessoais:**

1. **Testes de Parsing PRIMEIRO** (TDD)
   - Criar fixtures de texto real (exemplos de colagem)
   - Escrever testes antes de implementar parser
   - Garantir 100% de cobertura antes de avançar

2. **Testes de API** (Integração)
   - Testar detecção de tipo
   - Testar salvamento em lote
   - Testar substituição de períodos

3. **Testes de Frontend** (Hooks + UI)
   - Testar fluxo completo (colar → modal → salvar → refresh)
   - Simular respostas da API
   - Validar estados de loading/erro

**Critério de aceitação:** Mesma cobertura de Dados Pessoais (100% de testes passando antes de considerar completo)

---

## 💡 LIÇÕES APRENDIDAS

### Fase 1 (Backend)
1. **Parsing contextual é essencial** quando labels são ambíguos
2. **Word boundaries em regex** evitam casamentos indesejados
3. **Testes primeiro** aceleram desenvolvimento e garantem qualidade

### Fase 2 (Frontend)
4. **Separar UI de lógica** (hooks) facilita manutenção
5. **Componentização desde o início** evita código duplicado
6. **Props bem tipadas** previnem erros em tempo de compilação
7. **Zod API mudou**: usar `error.issues` ao invés de `error.errors`
8. **TypeScript strict mode** exige casts explícitos (globalThis)
9. **Metodologia CIF funciona** - descoberta evitou retrabalho
10. **Fonte única de metadados evita divergências** - listas de campos e labels devem morar em módulos compartilhados e alimentar parser, API e UI simultaneamente
11. **Validação antes da chamada** evita bugs silenciosos - bloquear a colagem errada no `useModoColagem` reduziu erros de importação e facilitou testes

### Fase 8 (Planejamento - Períodos)
12. **Abstrações bem definidas facilitam expansão** - reutilizar hook/componentes economiza 50%+ do tempo
13. **TDD para parsers é mandatório** - previne regressões ao adicionar campos/casos especiais

---

## 🎯 CRITÉRIOS DE SUCESSO

### Backend (Fase 1)
- ✅ Schema com 32 campos criado
- ✅ Parser completo funcionando
- ✅ APIs REST implementadas
- ✅ 21 testes passando (100%)

### Frontend (Fase 2)
- ✅ Usuário consegue copiar matrícula com 1 clique
- ✅ Usuário consegue ativar modo colagem com 1 clique
- ✅ Usuário cola texto (Ctrl+V) e vê modal imediatamente
- ✅ Modal mostra todos os campos parseados organizadamente
- ✅ Se sexo não foi detectado, modal exige seleção manual
- ✅ Ao confirmar (Enter ou botão), dados são salvos no banco
- ✅ Após salvar, modo colagem é desativado automaticamente
- ✅ Dados aparecem em `DadosAlunoEditavel` imediatamente após salvar (refresh automático)
- ⚠️ Comparação visual de campos (PENDENTE: componente ComparacaoDadosAluno)

---

## 🚀 PARA PRÓXIMA SESSÃO

**Prioridade 1 (Urgente):**
1. ✅ Recarregamento automático após salvar (hook + SWR)

**Prioridade 2 (Importante):**
2. Sistema de notificações (toast)
3. Resolver erro de build production (useContext/Turbopack)

**Prioridade 3 (Desejável):**
4. Persistir edição no `DadosAlunoEditavel` (salvar/restore campos)
5. Adicionar testes de frontend (modo colagem, UI)
6. Documentar TÉCNICO.md

---

## 🆕 FASE 8: PERÍODOS CURSADOS (NOVA FUNCIONALIDADE)

**Status:** 🔜 Planejado
**Data de início:** 2025-01-15 (estimado)
**Objetivo:** Capturar e estruturar histórico de períodos letivos cursados por cada aluno

---

### 📋 PLANEJAMENTO DE SESSÕES

#### **SESSÃO 1: Database Schema e Migration**

**Foco:** Criar modelo `PeriodoCursado` no Prisma

**Tarefas:**
1. Criar model `PeriodoCursado` com todos os campos identificados
2. Relacionamento 1-N com `Aluno`
3. Adicionar campo `textoBrutoDadosEscolares` no model `Aluno` (se ainda não existe)
4. Rodar migration em ambos os bancos (`pnpm migrate:dev`)

**Campos do model `PeriodoCursado`:**
- Identificação: `id`, `alunoMatricula` (FK)
- Período: `anoLetivo`, `periodoLetivo` (0/1/2)
- Escola: `unidadeEnsino`, `codigoEscola` (opcional)
- Curso: `modalidade`, `segmento`, `curso`, `serie`, `turno`
- Status: `situacao`, `tipoVaga`
- Matriz: `matrizCurricular` (opcional)
- Dados de Ingresso (apenas 1ª linha): `anoIngresso`, `periodoIngresso`, `dataInclusao`, `tipoIngresso`, `redeEnsinoOrigem`
- Campos não capturáveis: `ensinoReligioso`, `linguaEstrangeira` (sempre NULL)
- Rastreabilidade: `textoBrutoOrigemId`, `criadoEm`, `atualizadoEm`

**Critérios de aceite:**
- ✅ Migration executada com sucesso em ambos os bancos
- ✅ Relacionamento Aluno 1-N PeriodoCursado funciona
- ✅ Campo `textoBrutoDadosEscolares` existe em Aluno

**Duração estimada:** 1-2h

---

#### **SESSÃO 2: Parser de Períodos Cursados**

**Foco:** Implementar parsing da tabela "Renovação de Matrícula"

**Tarefas:**
1. Criar `src/lib/parsing/parsePeriodosCursados.ts`
2. Implementar detecção de seções (Dados de Ingresso + Escolaridade + Tabela)
3. Parsing de dados de ingresso (campos especiais da 1ª linha)
4. Parsing de tabela (múltiplas linhas, separadas por TAB)
5. Split de "Modalidade / Segmento / Curso" em 3 campos
6. Reunir dados de ingresso + primeira linha da tabela = primeiro período
7. Testes unitários (casos: 1 período, 3 períodos, sem dados de ingresso)

**Lógica de parsing:**
```
1. Extrair "Dados de Ingresso" (5 campos) → objeto ingressoData
2. Extrair "Escolaridade" (matrizCurricular) → adicionar ao primeiro período
3. Extrair tabela "Renovação de Matrícula" (linhas TAB-separated)
4. Primeira linha da tabela + ingressoData + matrizCurricular = primeiro período completo
5. Demais linhas da tabela = períodos adicionais (sem dados de ingresso)
6. Retornar array de PeriodoCursado[]
```

**Critérios de aceite:**
- ✅ Parser extrai dados de ingresso corretamente
- ✅ Parser extrai todas as linhas da tabela
- ✅ Primeira linha é enriquecida com dados de ingresso + matriz curricular
- ✅ Split de "Modalidade / Segmento / Curso" funciona
- ✅ Campos `ensinoReligioso` e `linguaEstrangeira` sempre NULL
- ✅ Testes cobrem cenários principais

**Duração estimada:** 3-4h

---

#### **SESSÃO 3: API de Processamento**

**Foco:** Atualizar API `/api/importacao-estruturada` para detectar e processar dados escolares

**Tarefas:**
1. Atualizar `detectarTipoPagina.ts` para reconhecer "dadosEscolares"
   - Marcadores: "Renovação de Matrícula", "Ano Letivo", "Período Letivo"
2. Atualizar `POST /api/importacao-estruturada/route.ts`
   - Se tipo = "dadosEscolares": retornar `{ tipo: 'dadosEscolares', periodos: [...] }`
3. Criar endpoint `POST /api/importacao-estruturada/salvar-periodos`
   - Recebe: `{ alunoMatricula, periodos: PeriodoCursado[], textoBruto }`
   - Salva texto bruto em `Aluno.textoBrutoDadosEscolares`
   - Deleta períodos existentes do aluno (estratégia: substituir tudo)
   - Insere novos períodos em lote
   - Retorna: `{ success: true, quantidade: N }`

**Critérios de aceite:**
- ✅ Detecção de "dadosEscolares" funciona
- ✅ API retorna array de períodos parseados
- ✅ Endpoint de salvamento funciona
- ✅ Texto bruto é armazenado em `textoBrutoDadosEscolares`
- ✅ Períodos antigos são substituídos (não duplicados)

**Duração estimada:** 2-3h

---

#### **SESSÃO 4: UI - Sistema de Abas em DadosAlunoEditavel**

**Foco:** Refatorar `DadosAlunoEditavel` para ter 2 abas: Dados Pessoais + Períodos Cursados

**Tarefas:**
1. Reutilizar componente `Tabs` existente (`src/components/ui/Tabs.tsx`)
2. Refatorar `DadosAlunoEditavel` para estrutura:
   ```tsx
   <Tabs>
     <Tab label="Dados Pessoais">{/* conteúdo atual */}</Tab>
     <Tab label="Períodos Cursados">{/* novo componente */}</Tab>
   </Tabs>
   ```
3. Criar componente `PeriodosCursadosLista.tsx` (exibição simples)
   - Recebe: `periodos: PeriodoCursado[]`
   - Exibe tabela ou lista agrupada por ano letivo
   - Colunas: Ano, Período, Escola, Série, Modalidade, Situação

**Critérios de aceite:**
- ✅ Abas funcionam corretamente (navegação)
- ✅ Aba "Dados Pessoais" mantém funcionalidade atual
- ✅ Aba "Períodos Cursados" exibe lista vazia se sem dados
- ✅ Aba "Períodos Cursados" exibe períodos quando existem

**Duração estimada:** 2h

---

#### **SESSÃO 5: Hook e Integração com Modo Colagem**

**Foco:** Atualizar `useModoColagem` para processar dados escolares

**Tarefas:**
1. Atualizar `useModoColagem.ts`:
   - Detectar tipo de resposta da API (`dadosPessoais` vs `dadosEscolares`)
   - Se `dadosEscolares`: abrir modal diferente (`ModalConfirmacaoPeriodos.tsx`)
2. Criar `ModalConfirmacaoPeriodos.tsx`:
   - Exibe tabela de períodos parseados
   - Botão "Confirmar" chama endpoint `/salvar-periodos`
   - Após salvar: refresh de dados do aluno
3. Atualizar hook `useAlunoSelecionado` para buscar períodos cursados

**Critérios de aceite:**
- ✅ Sistema detecta tipo de colagem automaticamente
- ✅ Modal correto é aberto para cada tipo
- ✅ Salvamento de períodos funciona
- ✅ Refresh automático após salvar (painel atualiza)
- ✅ Aba "Períodos Cursados" mostra dados após confirmação

**Duração estimada:** 3-4h

---

#### **SESSÃO 6: Testes e Validação**

**Foco:** Testes automatizados + teste com usuário

**Tarefas:**
1. Testes unitários:
   - `parsePeriodosCursados.test.ts` (parsing completo)
   - `detectarTipoPagina.test.ts` (detecção de dadosEscolares)
2. Testes de integração:
   - API `/importacao-estruturada` com texto de dados escolares
   - API `/importacao-estruturada/salvar-periodos` (criação em lote)
3. Teste manual com colagem real:
   - Colar dados escolares de 3 alunos diferentes
   - Verificar períodos salvos no banco
   - Validar visualização nas abas

**Critérios de aceite:**
- ✅ 100% dos testes unitários passando
- ✅ Testes de integração cobrem fluxo completo
- ✅ Teste manual bem-sucedido (sem erros)
- ✅ Dados visíveis corretamente na aba "Períodos Cursados"

**Duração estimada:** 2-3h

---

#### **SESSÃO 7: Polimento e Documentação**

**Foco:** Ajustes finais e atualização de documentação

**Tarefas:**
1. Adicionar loading states e feedback visual
2. Melhorar mensagens de erro (linguagem clara)
3. Validar comportamento quando aluno não tem períodos
4. Atualizar documentação:
   - `IMPORTACAO_ESTRUTURADA_TECNICO.md` (adicionar seção de Períodos Cursados)
   - `IMPORTACAO_ESTRUTURADA_CICLO.md` (adicionar Fase 8)
   - Este CHECKPOINT (marcar como concluído)
5. Criar entrada no `IMPORTACAO_ESTRUTURADA_CICLO.md` registrando implementação

**Critérios de aceite:**
- ✅ UX polida (loading, erros claros, estados vazios)
- ✅ Documentação atualizada
- ✅ CHECKPOINT marcado como concluído

**Duração estimada:** 1-2h

---

### 📊 RESUMO DE SESSÕES

| Sessão | Foco | Duração | Status |
|--------|------|---------|--------|
| 1 | Database Schema | 1-2h | 🔜 Pendente |
| 2 | Parser de Períodos | 3-4h | 🔜 Pendente |
| 3 | API de Processamento | 2-3h | 🔜 Pendente |
| 4 | UI - Sistema de Abas | 2h | 🔜 Pendente |
| 5 | Hook e Integração | 3-4h | 🔜 Pendente |
| 6 | Testes e Validação | 2-3h | 🔜 Pendente |
| 7 | Polimento e Documentação | 1-2h | 🔜 Pendente |
| **TOTAL** | **Fase 8 Completa** | **14-20h** | **🔜 Planejado** |

---

### 🎯 CONCEITOS-CHAVE A LEMBRAR

1. **Reunião de dados de ingresso + primeira linha da tabela**
   - Primeiro período = dados mais completos
   - Demais períodos = apenas dados da tabela

2. **Estratégia de substituição**
   - Deletar todos os períodos existentes do aluno
   - Inserir novos períodos em lote
   - Evita duplicação e inconsistências

3. **Campos não capturáveis**
   - `ensinoReligioso` e `linguaEstrangeira` sempre NULL
   - Input radio vazio na colagem (não aparece no texto)
   - Documentar claramente na UI (tooltip ou nota)

4. **Nomenclatura consistente**
   - `textoBrutoDadosPessoais` (já existe)
   - `textoBrutoDadosEscolares` (novo)
   - Seguir padrão de naming

5. **Sistema de abas**
   - Reutilizar componente `Tabs` existente
   - Manter consistência visual
   - Não duplicar lógica de abas

---

### 🚧 BLOQUEADORES CONHECIDOS

- Nenhum bloqueador identificado até o momento
- Fase 8 pode iniciar assim que Fase 3 (melhorias de dados pessoais) estiver completa

---

### 📝 NOTAS IMPORTANTES

- **Não confundir** `PeriodoCursado` com `Enturmacao`:
  - `Enturmacao` = dados da escola atual (CSV)
  - `PeriodoCursado` = histórico completo do aluno (colagem)
- **Relacionamento:** Aluno pode ter N enturmações e N períodos cursados
- **Escopo atual:** Apenas captura e visualização (sem edição de períodos por enquanto)

---

**Sessão concluída em:** 2025-11-11
**Tempo estimado para Fase 3:** 2-3 horas
**Tempo estimado para Fase 8:** 14-20 horas (7 sessões)
**Dev server:** `pnpm dev` rodando em background (processo 3fd38b)
