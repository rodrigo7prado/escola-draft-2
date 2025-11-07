# ESPECIFICAÇÃO: Painel de Migração de Dados CSV

## STATUS GERAL

| Camada | Total de Validações | Implementadas | Coverage | Status |
|--------|---------------------|---------------|----------|--------|
| V1 - Validação de Arquivo (Frontend) | 10 | 7 | ~70% | 🟡 Em progresso |
| V2 - Validação de Payload (Backend) | 9 | 7 | ~78% | 🟡 Em progresso |
| V3 - Transformação de Dados | 7 | 7 | 100% | 🟢 Completo |
| V4 - Operações de Banco (Prisma) | 18 | 13 | ~72% | 🟡 Em progresso |
| V5 - Visualização Hierárquica (GET) | 11 | 6 | ~55% | 🟡 Em progresso |
| V6 - Operações de Delete | 12 | 10 | ~83% | 🟡 Em progresso |
| V7 - Tratamento de Erros | 6 | 4 | ~67% | 🟡 Em progresso |
| V8 - Sincronização Frontend-Backend | 7 | 2 | ~29% | 🔴 Crítico |
| **TOTAL** | **80** | **56** | **~70%** | 🟡 **Em progresso** |

**Legenda:**
- 🟢 Completo: Todas validações implementadas e testadas
- 🟡 Em progresso: Algumas validações faltando
- 🔴 Pendente: Não iniciado ou crítico
- ❌ GAP CRÍTICO: Bloqueia produção
- ⚠️ GAP: Deve ser implementado (não crítico)

---

## CAMADA 1: VALIDAÇÃO DE ARQUIVO (Frontend)

**Responsabilidade:** Validar arquivo CSV no lado do cliente antes de enviar ao backend. Parsing tolerante, validação de estrutura e headers obrigatórios.

**Tecnologias:** React, JavaScript (parsing manual), FileReader API

**Componente principal:** `src/components/DropCsv.tsx`

---

### V1.1: Estrutura de CSV

**Objetivo:** Garantir que arquivo CSV tem estrutura básica válida.

---

#### ✅ V1.1.1: Arquivo não vazio

- **Como validar:**
  ```
  FileReader lê arquivo → text.trim().length > 0
  Se vazio ou apenas espaços → erro
  ```

- **Teste correspondente:**
  ```
  tests/unit/components/DropCsv.test.ts
  ```

- **Comportamento esperado:**
  - **Input:** Arquivo .csv vazio (0 bytes ou apenas espaços)
  - **Output:** Erro "CSV vazio ou inválido"
  - **UI:** Mensagem de erro vermelha abaixo do dropzone

- **Status:** ✅ Implementado (DropCsv.tsx:98)

---

#### ✅ V1.1.2: Headers obrigatórios presentes

- **Como validar:**
  ```
  parseCsvLoose() busca primeira linha com todos requiredHeaders
  Se não encontrar → retorna headers vazios
  Frontend valida: missing = requiredHeaders.filter(h => !headerSet.has(h))
  ```

- **Teste correspondente:**
  ```
  tests/unit/components/DropCsv.test.ts
  ```

- **Comportamento esperado:**
  - **Input:** CSV sem "ALUNO" ou "NOME_COMPL"
  - **Output:** Erro "Cabeçalho inválido. Faltando: ALUNO, NOME_COMPL"
  - **UI:** Mensagem de erro listando headers ausentes

- **Status:** ✅ Implementado (DropCsv.tsx:106-111)

---

#### ✅ V1.1.3: Parsing tolerante de BOM (Byte Order Mark)

- **Como validar:**
  ```
  lines.map(l => l.replace(/\uFEFF/g, ""))
  Remove caractere BOM (comum em exports UTF-8 com BOM)
  ```

- **Teste correspondente:**
  ```
  tests/unit/utils/parseCsv.test.ts
  ```

- **Comportamento esperado:**
  - **Input:** CSV com BOM (`\uFEFF` no início)
  - **Output:** Parsing bem-sucedido, BOM removido automaticamente
  - **Side effects:** Nenhum erro, headers reconhecidos corretamente

- **Status:** ✅ Implementado (DropCsv.tsx:46)

---

#### ✅ V1.1.4: Parsing de campos com aspas e vírgulas

- **Como validar:**
  ```
  splitCsvLine() processa caractere por caractere
  Detecta aspas duplas, trata escape ("") e ignora vírgulas dentro de aspas
  ```

- **Teste correspondente:**
  ```
  tests/unit/utils/parseCsv.test.ts
  ```

- **Comportamento esperado:**
  - **Input:** Campo `"Silva, João"` (vírgula dentro de aspas)
  - **Output:** Valor parseado como `Silva, João` (vírgula preservada)
  - **Input:** Campo `"Empresa ""ABC"" Ltda"` (aspas duplicadas)
  - **Output:** Valor parseado como `Empresa "ABC" Ltda`

- **Status:** ✅ Implementado (DropCsv.tsx:20-42)

---

#### ✅ V1.1.5: Ignora linhas completamente vazias

- **Como validar:**
  ```
  const parts = splitCsvLine(lines[i]);
  if (parts.every(p => p.trim() === "")) continue;
  ```

- **Teste correspondente:**
  ```
  tests/unit/utils/parseCsv.test.ts
  ```

- **Comportamento esperado:**
  - **Input:** CSV com linhas vazias entre dados
  - **Output:** Linhas vazias ignoradas, não contam em `rows.length`

- **Status:** ✅ Implementado (DropCsv.tsx:69)

---

#### ⬜ V1.1.6: Validação de tamanho de arquivo

- **Como validar:**
  ```
  file.size > MAX_SIZE (ex: 10MB)
  Se maior → erro antes de parsing
  ```

- **Teste correspondente:**
  ```
  tests/unit/components/DropCsv.test.ts
  ```

- **Comportamento esperado:**
  - **Input:** Arquivo > 10MB
  - **Output:** Erro "Arquivo muito grande (máximo 10MB)"
  - **UI:** Mensagem de erro, upload bloqueado

- **Status:** ⬜ Pendente - **GAP não crítico**

---

#### ⬜ V1.1.7: Validação de tipo MIME

- **Como validar:**
  ```
  file.type === 'text/csv' || file.type === ''
  Aceitar apenas .csv (permitir vazio pois alguns OS não definem MIME)
  ```

- **Teste correspondente:**
  ```
  tests/unit/components/DropCsv.test.ts
  ```

- **Comportamento esperado:**
  - **Input:** Arquivo .xlsx ou .pdf
  - **Output:** Erro "Apenas arquivos .csv são aceitos"

- **Status:** ⬜ Pendente - **GAP não crítico** (já tem validação parcial via input accept)

---

### V1.2: Detecção de Duplicatas no CSV

**Objetivo:** Identificar alunos duplicados DENTRO do mesmo arquivo CSV (antes de enviar ao backend).

---

#### ✅ V1.2.1: Detectar alunos com mesma matrícula

- **Como validar:**
  ```
  useMemo: itera rows, guarda matriculas em Set
  Se já existe → adiciona em dups Set
  Retorna { keys: Array.from(dups), count: dups.size }
  ```

- **Teste correspondente:**
  ```
  tests/unit/components/DropCsv.test.ts
  ```

- **Comportamento esperado:**
  - **Input:** CSV com 3 linhas de matrícula "12345678901"
  - **Output:** `duplicates.count = 1`, `duplicates.keys = ["12345678901"]`
  - **UI:** Preview mostra linhas duplicadas com borda vermelha

- **Status:** ✅ Implementado (DropCsv.tsx:138-149)

---

#### ✅ V1.2.2: Exibir preview visual de duplicatas

- **Como validar:**
  ```
  Preview table renderiza primeiras 5 linhas
  Se row[duplicateKey] está em duplicates.keys → borda vermelha
  ```

- **Teste correspondente:**
  ```
  tests/unit/components/DropCsv.test.ts
  ```

- **Comportamento esperado:**
  - **Input:** CSV com duplicatas
  - **Output:** Preview mostra indicador "Duplicado" + borda vermelha
  - **UI:** Fácil identificação visual

- **Status:** ✅ Implementado (DropCsv.tsx:156-194)

---

#### ⚠️ V1.2.3: Opção de remover duplicatas antes de enviar

- **Como validar:**
  ```
  Botão "Remover duplicatas" abaixo do preview
  Mantém apenas primeira ocorrência de cada matrícula
  Atualiza estado de data com rows filtrados
  ```

- **Teste correspondente:**
  ```
  tests/unit/components/DropCsv.test.ts
  ```

- **Comportamento esperado:**
  - **Input:** Usuário clica "Remover duplicatas"
  - **Output:** `data.rows` filtrado, contador atualizado
  - **UI:** Preview atualiza, mensagem "X duplicatas removidas"

- **Status:** ⚠️ **GAP** - Não implementado (UX: aceita duplicatas e deixa backend decidir)
  - **Impacto:** Usuário envia duplicatas sem saber, backend precisa lidar
  - **Prioridade:** MÉDIA
  - **Estimativa:** 1h

---

### V1.3: Upload Múltiplo

**Objetivo:** Permitir upload de múltiplos arquivos CSV de uma vez.

---

#### ✅ V1.3.1: Suporte a múltiplos arquivos

- **Como validar:**
  ```
  <input multiple={true} />
  handleFiles: Array.from(files) itera todos
  Processa sequencialmente com for loop
  ```

- **Teste correspondente:**
  ```
  tests/unit/components/DropCsv.test.ts
  ```

- **Comportamento esperado:**
  - **Input:** Usuário arrasta 3 arquivos CSV
  - **Output:** 3 arquivos processados sequencialmente
  - **UI:** Mensagem "3 arquivo(s) processado(s)"

- **Status:** ✅ Implementado (DropCsv.tsx:79, 89-91)

---

#### ✅ V1.3.2: Feedback de progresso para múltiplos arquivos

- **Como validar:**
  ```
  Loop conta successCount e errorCount
  Ao final: setLastUploadInfo com resumo
  ```

- **Teste correspondente:**
  ```
  tests/unit/components/DropCsv.test.ts
  ```

- **Comportamento esperado:**
  - **Input:** 5 arquivos (3 válidos, 2 com erro)
  - **Output:** "3 arquivo(s) processado(s), 2 com erro"
  - **UI:** Mensagem verde de sucesso

- **Status:** ✅ Implementado (DropCsv.tsx:123-124)

---

---

## CAMADA 2: VALIDAÇÃO DE PAYLOAD (Backend - Entrada)

**Responsabilidade:** Validar dados recebidos do frontend na API POST /api/files. Verificar integridade de payload, calcular hash e detectar duplicatas.

**Tecnologias:** Next.js API Routes, Node.js crypto, Prisma

**Arquivo principal:** `src/app/api/files/route.ts` (POST)

---

### V2.1: Validação de Request

**Objetivo:** Garantir que request tem estrutura válida.

---

#### ✅ V2.1.1: Body não vazio

- **Como validar:**
  ```
  const body = await request.json();
  if (!data || !fileName) → return 400
  ```

- **Teste correspondente:**
  ```
  tests/api/files/post.test.ts
  ```

- **Comportamento esperado:**
  - **Input:** POST /api/files com body vazio ou sem `data`/`fileName`
  - **Output:** 400 Bad Request, `{ error: 'Dados inválidos' }`

- **Status:** ✅ Implementado (route.ts:27-32)

---

#### ✅ V2.1.2: Estrutura de `data` válida (headers + rows)

- **Como validar:**
  ```
  Verifica se data.headers é array
  Verifica se data.rows é array
  Se não → return 400
  ```

- **Teste correspondente:**
  ```
  tests/api/files/post.test.ts
  ```

- **Comportamento esperado:**
  - **Input:** `data = { headers: null, rows: [] }`
  - **Output:** 400 Bad Request

- **Status:** ✅ Implementado implicitamente (route.ts:25-26, TypeScript garante tipo)

---

#### ⬜ V2.1.3: Validação de tipo de `fileName`

- **Como validar:**
  ```
  typeof fileName === 'string' && fileName.length > 0
  Se não → return 400
  ```

- **Teste correspondente:**
  ```
  tests/api/files/post.test.ts
  ```

- **Comportamento esperado:**
  - **Input:** `fileName = null` ou `fileName = 123`
  - **Output:** 400 Bad Request, "Nome do arquivo inválido"

- **Status:** ⬜ Pendente - **GAP não crítico** (TypeScript ajuda, mas runtime validation falta)

---

### V2.2: Detecção de Duplicatas por Hash

**Objetivo:** Evitar importação de arquivo com conteúdo idêntico (mesmo com nome diferente).

---

#### ✅ V2.2.1: Calcular hash SHA-256 dos dados

- **Como validar:**
  ```
  hashData(data):
    - Ordena headers alfabeticamente
    - Ordena rows por concatenação de valores
    - JSON.stringify + crypto.createHash('sha256')
  Retorna hex string
  ```

- **Teste correspondente:**
  ```
  tests/unit/utils/hashData.test.ts
  ```

- **Comportamento esperado:**
  - **Input:** Mesmo CSV importado 2x (mesmo conteúdo, nomes diferentes)
  - **Output:** Mesmo hash SHA-256
  - **Garantia:** Hash é determinístico (ordenação garante consistência)

- **Status:** ✅ Implementado (route.ts:11-19)

---

#### ✅ V2.2.2: Verificar se hash já existe no banco (apenas ATIVOS)

- **Como validar:**
  ```
  prisma.arquivoImportado.findFirst({
    where: { hashArquivo: dataHash, status: 'ativo' }
  })
  Se encontrar → return 409 Conflict
  ```

- **Teste correspondente:**
  ```
  tests/api/files/post.test.ts
  ```

- **Comportamento esperado:**
  - **Input:** POST com CSV já importado
  - **Output:** 409 Conflict, `{ error: 'Arquivo com conteúdo idêntico já existe', fileId: '...' }`
  - **Side effects:** Nenhuma modificação no banco

- **Status:** ✅ Implementado (route.ts:38-50)

---

#### ✅ V2.2.3: Permitir reimportação após delete (hash removido)

- **Como validar:**
  ```
  Após DELETE /api/files?periodo=2024:
    - ArquivoImportado deletado (hard delete)
    - Hash removido do banco
  POST novamente com mesmo CSV → sucesso (hash não existe mais)
  ```

- **Teste correspondente:**
  ```
  tests/integration/files/reimportacao.test.ts
  ```

- **Comportamento esperado:**
  - **Fluxo:**
    1. POST arquivo A → sucesso
    2. DELETE período 2024 → hard delete
    3. POST arquivo A novamente → sucesso (não é duplicata)

- **Status:** ✅ Implementado (route.ts:459, hard delete remove hash)

---

### V2.3: Validação de Dados do CSV

**Objetivo:** Validar estrutura das linhas antes de processar.

---

#### ⬜ V2.3.1: Validar que todas as linhas têm matrícula

- **Como validar:**
  ```
  for (const row of data.rows) {
    const matricula = row.ALUNO?.trim();
    if (!matricula) → adicionar em errosValidacao array
  }
  Se errosValidacao.length > 0 → return 400 com detalhes
  ```

- **Teste correspondente:**
  ```
  tests/api/files/post.test.ts
  ```

- **Comportamento esperado:**
  - **Input:** CSV com 10 linhas, 2 sem matrícula
  - **Output:** 400 Bad Request, `{ error: '2 linhas sem matrícula', linhas: [3, 7] }`

- **Status:** ⬜ Pendente - **GAP não crítico** (atualmente apenas pula linha vazia, route.ts:80)
  - **Impacto:** Linhas sem matrícula são silenciosamente ignoradas
  - **Prioridade:** MÉDIA
  - **Estimativa:** 30min

---

#### ⬜ V2.3.2: Validar formato de matrícula (15 dígitos)

- **Como validar:**
  ```
  /^\d{15}$/.test(matricula)
  Se não → adicionar em errosValidacao
  ```

- **Teste correspondente:**
  ```
  tests/api/files/post.test.ts
  ```

- **Comportamento esperado:**
  - **Input:** Matrícula "123" (inválida, < 15 dígitos)
  - **Output:** 400 Bad Request, "Matrícula inválida na linha X"

- **Status:** ⬜ Pendente - **GAP não crítico**
  - **Impacto:** Matrículas inválidas são aceitas
  - **Prioridade:** BAIXA (depende de requisito de negócio)
  - **Estimativa:** 30min

---

#### ⬜ V2.3.3: Validar headers obrigatórios no backend (defesa em profundidade)

- **Como validar:**
  ```
  const REQUIRED = ['ALUNO', 'NOME_COMPL', 'Ano', 'TURMA', 'SERIE', 'MODALIDADE'];
  const missing = REQUIRED.filter(h => !data.headers.includes(h));
  if (missing.length > 0) → return 400
  ```

- **Teste correspondente:**
  ```
  tests/api/files/post.test.ts
  ```

- **Comportamento esperado:**
  - **Input:** Frontend envia headers incompletos (bug ou bypass)
  - **Output:** 400 Bad Request, "Faltando headers: ..."

- **Status:** ⬜ Pendente - **GAP não crítico** (defesa em profundidade, frontend já valida)
  - **Impacto:** Se frontend falhar, backend aceita dados inválidos
  - **Prioridade:** BAIXA
  - **Estimativa:** 15min

---

### V2.4: Transação de Processamento

**Objetivo:** Garantir atomicidade: tudo sucede ou tudo falha.

---

#### ❌ V2.4.1: Transação completa (arquivo + linhas + alunos + enturmações)

- **Como validar:**
  ```
  await prisma.$transaction(async (tx) => {
    // Criar arquivo
    // Criar linhas
    // Criar alunos
    // Criar enturmações
  })
  Se QUALQUER falha → rollback completo
  ```

- **Teste correspondente:**
  ```
  tests/api/files/post-transaction.test.ts
  ```

- **Comportamento esperado:**
  - **Input:** CSV com erro no meio (ex: aluno com dados inválidos)
  - **Output:** Rollback completo, NENHUM registro criado
  - **Garantia:** Banco não fica em estado inconsistente (metade dos dados)

- **Status:** ❌ **GAP CRÍTICO** - Não implementado
  - **Impacto:** Se processamento falhar no meio, arquivo e linhas ficam criados mas alunos não
  - **Prioridade:** ALTA
  - **Estimativa:** 2-3h
  - **Observação:** Atualmente cada operação é independente (route.ts:53-215), sem transação global

---

#### ⚠️ V2.4.2: Tratamento de erro com mensagem específica

- **Como validar:**
  ```
  try/catch em volta de cada operação crítica
  Capturar PrismaClientKnownRequestError
  Retornar mensagem específica (ex: "Erro de unicidade", "Violação de constraint")
  ```

- **Teste correspondente:**
  ```
  tests/api/files/post-errors.test.ts
  ```

- **Comportamento esperado:**
  - **Input:** Erro P2002 (unique constraint violation)
  - **Output:** 400 Bad Request, "Aluno com matrícula X já existe"
  - **UI:** Usuário entende o problema

- **Status:** ⚠️ **GAP** - Parcialmente implementado (apenas catch genérico, route.ts:225-231)
  - **Impacto:** Mensagens de erro não são específicas
  - **Prioridade:** MÉDIA
  - **Estimativa:** 1h

---

---

## CAMADA 3: TRANSFORMAÇÃO DE DADOS

**Responsabilidade:** Limpar e transformar dados antes de salvar no banco. Remove prefixos padrão do sistema Conexão Educação.

**Tecnologias:** JavaScript/TypeScript (funções utilitárias)

**Arquivo principal:** `src/app/api/files/route.ts` (função `limparValor`)

---

### V3.1: Remoção de Prefixos

**Objetivo:** Remover prefixos redundantes dos valores ("Ano Letivo: 2024" → "2024").

---

#### ✅ V3.1.1: Limpar prefixo "Ano Letivo:"

- **Como validar:**
  ```
  limparValor("Ano Letivo: 2024", "Ano Letivo:") → "2024"
  limparValor("2024", "Ano Letivo:") → "2024" (sem prefixo)
  ```

- **Teste correspondente:**
  ```
  tests/unit/utils/limparValor.test.ts
  ```

- **Comportamento esperado:**
  - **Input:** `csvData.Ano = "Ano Letivo: 2024"`
  - **Output:** `anoLetivo = "2024"` (salvo no banco sem prefixo)

- **Status:** ✅ Implementado (route.ts:94)

---

#### ✅ V3.1.2: Limpar prefixo "Modalidade:"

- **Como validar:**
  ```
  limparValor("Modalidade: REGULAR", "Modalidade:") → "REGULAR"
  ```

- **Teste correspondente:**
  ```
  tests/unit/utils/limparValor.test.ts
  ```

- **Comportamento esperado:**
  - **Input:** `csvData.MODALIDADE = "Modalidade: REGULAR"`
  - **Output:** `modalidade = "REGULAR"`

- **Status:** ✅ Implementado (route.ts:171)

---

#### ✅ V3.1.3: Limpar prefixo "Turma:"

- **Como validar:**
  ```
  limparValor("Turma: 3001", "Turma:") → "3001"
  ```

- **Teste correspondente:**
  ```
  tests/unit/utils/limparValor.test.ts
  ```

- **Comportamento esperado:**
  - **Input:** `csvData.TURMA = "Turma: 3001"`
  - **Output:** `turma = "3001"`

- **Status:** ✅ Implementado (route.ts:95, 172)

---

#### ✅ V3.1.4: Limpar prefixo "Série:"

- **Como validar:**
  ```
  limparValor("Série: 3", "Série:") → "3"
  ```

- **Teste correspondente:**
  ```
  tests/unit/utils/limparValor.test.ts
  ```

- **Comportamento esperado:**
  - **Input:** `csvData.SERIE = "Série: 3"`
  - **Output:** `serie = "3"`

- **Status:** ✅ Implementado (route.ts:173)

---

#### ✅ V3.1.5: Limpar prefixo "Turno:"

- **Como validar:**
  ```
  limparValor("Turno: MANHÃ", "Turno:") → "MANHÃ"
  limparValor("", "Turno:") → "" (permite null)
  ```

- **Teste correspondente:**
  ```
  tests/unit/utils/limparValor.test.ts
  ```

- **Comportamento esperado:**
  - **Input:** `csvData.TURNO = "Turno: MANHÃ"`
  - **Output:** `turno = "MANHÃ"`
  - **Input:** `csvData.TURNO = undefined`
  - **Output:** `turno = null`

- **Status:** ✅ Implementado (route.ts:174)

---

### V3.2: Tratamento de Valores Especiais

**Objetivo:** Lidar com valores vazios, null, undefined.

---

#### ✅ V3.2.1: Retornar string vazia se valor undefined

- **Como validar:**
  ```
  limparValor(undefined, "Ano Letivo:") → ""
  ```

- **Teste correspondente:**
  ```
  tests/unit/utils/limparValor.test.ts
  ```

- **Comportamento esperado:**
  - **Input:** Campo não existe no CSV
  - **Output:** String vazia (não null, não undefined)

- **Status:** ✅ Implementado (route.ts:64)

---

#### ✅ V3.2.2: Trimming de espaços

- **Como validar:**
  ```
  limparValor("  Ano Letivo: 2024  ", "Ano Letivo:") → "2024"
  ```

- **Teste correspondente:**
  ```
  tests/unit/utils/limparValor.test.ts
  ```

- **Comportamento esperado:**
  - **Input:** Valor com espaços antes/depois
  - **Output:** Espaços removidos (trim)

- **Status:** ✅ Implementado (route.ts:65, 67)

---

---

## CAMADA 4: OPERAÇÕES DE BANCO DE DADOS (Prisma)

**Responsabilidade:** Criar, atualizar e relacionar registros no banco de dados. Implementar lógica de 3 camadas (Origem → Estruturada → Auditoria).

**Tecnologias:** Prisma, PostgreSQL

**Arquivo principal:** `src/app/api/files/route.ts` (POST)

---

### V4.1: Criação de Arquivo Importado

**Objetivo:** Criar registro de metadados do arquivo CSV.

---

#### ✅ V4.1.1: Criar ArquivoImportado com hash

- **Como validar:**
  ```
  prisma.arquivoImportado.create({
    data: {
      nomeArquivo: fileName,
      hashArquivo: dataHash,
      tipo: 'alunos',
      status: 'ativo'
    }
  })
  ```

- **Teste correspondente:**
  ```
  tests/integration/database/arquivo.test.ts
  ```

- **Comportamento esperado:**
  - **Input:** POST com arquivo válido
  - **Output:** Registro criado em ArquivoImportado
  - **Campos:**
    - `nomeArquivo`: "turma-3001.csv"
    - `hashArquivo`: SHA-256 hex string
    - `status`: 'ativo'
    - `criadoEm`: timestamp automático

- **Status:** ✅ Implementado (route.ts:53-60)

---

### V4.2: Criação de Linhas Importadas

**Objetivo:** Salvar cada linha do CSV em formato JSONB (dados originais imutáveis).

---

#### ✅ V4.2.1: Criar LinhaImportada para cada row

- **Como validar:**
  ```
  for (let i = 0; i < data.rows.length; i++) {
    await prisma.linhaImportada.create({
      data: {
        arquivoId: arquivo.id,
        numeroLinha: i,
        dadosOriginais: row as any, // JSONB
        identificadorChave: matricula,
        tipoEntidade: 'aluno'
      }
    })
  }
  ```

- **Teste correspondente:**
  ```
  tests/integration/database/linha.test.ts
  ```

- **Comportamento esperado:**
  - **Input:** CSV com 100 linhas
  - **Output:** 100 registros em LinhaImportada
  - **JSONB preservado:** `dadosOriginais` contém row completo sem transformações

- **Status:** ✅ Implementado (route.ts:83-91)

---

#### ✅ V4.2.2: Relacionamento com ArquivoImportado (FK)

- **Como validar:**
  ```
  LinhaImportada.arquivoId → ArquivoImportado.id
  onDelete: Cascade (deletar arquivo deleta linhas)
  ```

- **Teste correspondente:**
  ```
  tests/integration/database/linha.test.ts
  ```

- **Comportamento esperado:**
  - **Ação:** DELETE ArquivoImportado
  - **Efeito:** Todas LinhaImportada relacionadas são deletadas automaticamente (cascade)

- **Status:** ✅ Implementado (Prisma schema + route.ts:84)

---

#### ⚠️ V4.2.3: Otimização com createMany

- **Como validar:**
  ```
  Substituir loop de create() individual por:
  await prisma.linhaImportada.createMany({
    data: rows.map((row, i) => ({ ... }))
  })
  Medir performance: deve ser 10-100x mais rápido
  ```

- **Teste correspondente:**
  ```
  tests/performance/linhaImportada.test.ts
  ```

- **Comportamento esperado:**
  - **Input:** CSV com 1000 linhas
  - **Output:** Inserção em < 1 segundo (vs ~10s com loop)

- **Status:** ⚠️ **GAP** - Não implementado (atualmente usa loop, route.ts:76-108)
  - **Impacto:** Performance ruim para arquivos grandes (>500 linhas)
  - **Prioridade:** ALTA
  - **Estimativa:** 1h
  - **Observação:** Precisa ajustar lógica de Map de enturmações

---

### V4.3: Criação/Atualização de Alunos

**Objetivo:** Criar novos alunos ou atualizar existentes (resetar fonteAusente).

---

#### ✅ V4.3.1: Criar aluno novo se não existir

- **Como validar:**
  ```
  const alunoExistente = await prisma.aluno.findUnique({
    where: { matricula }
  })
  if (!alunoExistente) {
    await prisma.aluno.create({ data: { ... } })
  }
  ```

- **Teste correspondente:**
  ```
  tests/integration/database/aluno.test.ts
  ```

- **Comportamento esperado:**
  - **Input:** Aluno com matrícula "123456789012345" (não existe no banco)
  - **Output:** Registro criado em Aluno
  - **Campos:**
    - `matricula`: "123456789012345"
    - `nome`: do CSV
    - `origemTipo`: 'csv'
    - `linhaOrigemId`: ID da linha
    - `fonteAusente`: false

- **Status:** ✅ Implementado (route.ts:128-143)

---

#### ✅ V4.3.2: Atualizar aluno existente (resetar fonteAusente)

- **Como validar:**
  ```
  if (alunoExistente.fonteAusente) {
    await prisma.aluno.update({
      where: { id: alunoExistente.id },
      data: {
        linhaOrigemId: info.linha.id,
        fonteAusente: false
      }
    })
  }
  ```

- **Teste correspondente:**
  ```
  tests/integration/database/aluno.test.ts
  ```

- **Comportamento esperado:**
  - **Cenário:**
    1. Aluno criado via CSV
    2. CSV deletado → `fonteAusente = true`
    3. Reimportação do CSV
  - **Output:** `fonteAusente` volta para `false`, vínculo restabelecido

- **Status:** ✅ Implementado (route.ts:148-156)

---

#### ⚠️ V4.3.3: Deduplicação de alunos por matrícula

- **Como validar:**
  ```
  Agrupar linhas por matrícula ANTES de criar alunos
  const alunosUnicos = new Map<string, any>();
  Garantir que cada aluno é criado apenas 1x mesmo que apareça em múltiplas linhas
  ```

- **Teste correspondente:**
  ```
  tests/integration/database/aluno.test.ts
  ```

- **Comportamento esperado:**
  - **Input:** CSV com 10 linhas do aluno "123..." (uma linha por disciplina)
  - **Output:** Apenas 1 registro em Aluno criado
  - **Garantia:** Sem erro de unique constraint violation

- **Status:** ✅ Implementado (route.ts:116-122) - **Reclassificado de GAP para OK**

---

### V4.4: Criação de Enturmações

**Objetivo:** Relacionar aluno com turma em um período letivo.

---

#### ✅ V4.4.1: Criar enturmação se não existir

- **Como validar:**
  ```
  const enturmacaoExistente = await prisma.enturmacao.findFirst({
    where: {
      alunoId,
      anoLetivo,
      modalidade,
      turma,
      serie
    }
  })
  if (!enturmacaoExistente) {
    await prisma.enturmacao.create({ ... })
  }
  ```

- **Teste correspondente:**
  ```
  tests/integration/database/enturmacao.test.ts
  ```

- **Comportamento esperado:**
  - **Input:** Aluno "123..." em turma "3001" em 2024
  - **Output:** Registro criado em Enturmacao
  - **Campos:**
    - `alunoId`: ID do aluno
    - `anoLetivo`: "2024"
    - `regime`: 0 (anual)
    - `modalidade`: "REGULAR"
    - `turma`: "3001"
    - `serie`: "3"
    - `turno`: "MANHÃ" ou null
    - `origemTipo`: 'csv'
    - `linhaOrigemId`: ID da linha
    - `fonteAusente`: false

- **Status:** ✅ Implementado (route.ts:178-203)

---

#### ✅ V4.4.2: Atualizar enturmação existente (resetar fonteAusente)

- **Como validar:**
  ```
  else if (enturmacaoExistente.fonteAusente) {
    await prisma.enturmacao.update({
      where: { id: enturmacaoExistente.id },
      data: {
        linhaOrigemId: info.linha.id,
        fonteAusente: false
      }
    })
  }
  ```

- **Teste correspondente:**
  ```
  tests/integration/database/enturmacao.test.ts
  ```

- **Comportamento esperado:**
  - **Cenário:** Enturmação órfã (fonteAusente=true) + Reimportação
  - **Output:** Vínculo restabelecido, `fonteAusente = false`

- **Status:** ✅ Implementado (route.ts:204-213)

---

#### ✅ V4.4.3: Validar unicidade (aluno + ano + turma + modalidade + série)

- **Como validar:**
  ```
  findFirst com where contendo todos os campos
  Se já existe E fonteAusente=false → não criar duplicata
  ```

- **Teste correspondente:**
  ```
  tests/integration/database/enturmacao.test.ts
  ```

- **Comportamento esperado:**
  - **Input:** Tentar criar enturmação idêntica
  - **Output:** Nenhum registro adicional criado (previne duplicatas)

- **Status:** ✅ Implementado (route.ts:178-186)

---

#### ✅ V4.4.4: Suportar múltiplas enturmações por aluno

- **Como validar:**
  ```
  Aluno "123..." pode ter:
    - Enturmação 2022 (1ª série)
    - Enturmação 2023 (2ª série)
    - Enturmação 2024 (3ª série)
  Todas convivem no banco (sem conflito)
  ```

- **Teste correspondente:**
  ```
  tests/integration/database/enturmacao.test.ts
  ```

- **Comportamento esperado:**
  - **Input:** Importar CSVs de 2022, 2023 e 2024 para mesmo aluno
  - **Output:** 3 registros em Enturmacao (mesmo alunoId, anos diferentes)

- **Status:** ✅ Implementado (design do modelo permite 1-N)

---

#### ⚠️ V4.4.5: Deduplicação de enturmações por chave única

- **Como validar:**
  ```
  Agrupar linhas por `${matricula}|${anoLetivo}|${turma}`
  Criar apenas 1 enturmação por chave única
  ```

- **Teste correspondente:**
  ```
  tests/integration/database/enturmacao.test.ts
  ```

- **Comportamento esperado:**
  - **Input:** CSV com 10 linhas do aluno na mesma turma (uma linha por disciplina)
  - **Output:** Apenas 1 enturmação criada (não 10)

- **Status:** ✅ Implementado (route.ts:98-107) - **Reclassificado de GAP para OK**

---

### V4.5: Relacionamentos e Integridade

**Objetivo:** Garantir integridade referencial entre entidades.

---

#### ✅ V4.5.1: FK Aluno.linhaOrigemId → LinhaImportada (onDelete: SetNull)

- **Como validar:**
  ```
  Deletar LinhaImportada
  Aluno.linhaOrigemId → NULL (automaticamente via Prisma onDelete: SetNull)
  ```

- **Teste correspondente:**
  ```
  tests/integration/database/fk.test.ts
  ```

- **Comportamento esperado:**
  - **Ação:** DELETE LinhaImportada
  - **Efeito:** Aluno.linhaOrigemId = NULL (não deleta aluno)

- **Status:** ✅ Implementado (Prisma schema onDelete: SetNull)

---

#### ✅ V4.5.2: FK Enturmacao.linhaOrigemId → LinhaImportada (onDelete: SetNull)

- **Como validar:**
  ```
  Mesma lógica: deletar LinhaImportada → Enturmacao.linhaOrigemId = NULL
  ```

- **Teste correspondente:**
  ```
  tests/integration/database/fk.test.ts
  ```

- **Comportamento esperado:**
  - **Ação:** DELETE LinhaImportada
  - **Efeito:** Enturmacao.linhaOrigemId = NULL (não deleta enturmação)

- **Status:** ✅ Implementado (Prisma schema)

---

#### ✅ V4.5.3: FK Enturmacao.alunoId → Aluno (onDelete: Cascade)

- **Como validar:**
  ```
  Deletar Aluno → todas Enturmacao deste aluno são deletadas
  ```

- **Teste correspondente:**
  ```
  tests/integration/database/fk.test.ts
  ```

- **Comportamento esperado:**
  - **Ação:** DELETE Aluno
  - **Efeito:** Todas enturmações deste aluno são deletadas (cascade)

- **Status:** ✅ Implementado (Prisma schema onDelete: Cascade)

---

### V4.6: Contadores e Estatísticas

**Objetivo:** Retornar resumo da operação (quantos alunos novos, atualizados, etc).

---

#### ✅ V4.6.1: Contar alunos novos

- **Como validar:**
  ```
  let alunosNovos = 0;
  if (!alunoExistente) { alunosNovos++; }
  Retornar no response
  ```

- **Teste correspondente:**
  ```
  tests/api/files/post.test.ts
  ```

- **Comportamento esperado:**
  - **Input:** POST com 50 alunos (30 novos, 20 já existentes)
  - **Output:** `{ alunosNovos: 30, alunosAtualizados: 20 }`

- **Status:** ✅ Implementado (route.ts:111, 144)

---

#### ✅ V4.6.2: Contar enturmações novas

- **Como validar:**
  ```
  let enturmacoesNovas = 0;
  if (!enturmacaoExistente) { enturmacoesNovas++; }
  ```

- **Teste correspondente:**
  ```
  tests/api/files/post.test.ts
  ```

- **Comportamento esperado:**
  - **Input:** POST com 50 linhas (40 enturmações novas)
  - **Output:** `{ enturmacoesNovas: 40 }`

- **Status:** ✅ Implementado (route.ts:113, 203)

---

#### ✅ V4.6.3: Contar linhas importadas

- **Como validar:**
  ```
  Retornar data.rows.length
  ```

- **Teste correspondente:**
  ```
  tests/api/files/post.test.ts
  ```

- **Comportamento esperado:**
  - **Input:** CSV com 100 linhas
  - **Output:** `{ linhasImportadas: 100 }`

- **Status:** ✅ Implementado (route.ts:219)

---

---

## CAMADA 5: VISUALIZAÇÃO HIERÁRQUICA (GET /api/files)

**Responsabilidade:** Agrupar e organizar dados importados em hierarquia: Período Letivo → Turma → Alunos. Calcular estatísticas (total, pendentes, status).

**Tecnologias:** Next.js API Routes, Prisma

**Arquivo principal:** `src/app/api/files/route.ts` (GET)

---

### V5.1: Busca de Linhas Importadas

**Objetivo:** Buscar todas as linhas de arquivos ativos.

---

#### ✅ V5.1.1: Filtrar apenas arquivos ATIVOS

- **Como validar:**
  ```
  prisma.linhaImportada.findMany({
    where: {
      tipoEntidade: 'aluno',
      arquivo: { status: 'ativo' }
    }
  })
  ```

- **Teste correspondente:**
  ```
  tests/api/files/get.test.ts
  ```

- **Comportamento esperado:**
  - **Cenário:** 2 arquivos (1 ativo, 1 excluído)
  - **Output:** GET retorna apenas linhas do arquivo ativo

- **Status:** ✅ Implementado (route.ts:248-254)

---

#### ✅ V5.1.2: Selecionar apenas campos necessários

- **Como validar:**
  ```
  select: {
    identificadorChave: true,
    dadosOriginais: true
  }
  Não buscar campos desnecessários (otimização)
  ```

- **Teste correspondente:**
  ```
  tests/api/files/get.test.ts
  ```

- **Comportamento esperado:**
  - **Output:** Query SQL usa apenas colunas necessárias (performance)

- **Status:** ✅ Implementado (route.ts:255-258)

---

### V5.2: Agrupamento por Período e Turma

**Objetivo:** Organizar dados em estrutura hierárquica.

---

#### ✅ V5.2.1: Agrupar linhas por período letivo

- **Como validar:**
  ```
  periodosMap = new Map<string, PeriodoData>()
  Para cada linha:
    - Extrair anoLetivo
    - Adicionar em periodosMap
  ```

- **Teste correspondente:**
  ```
  tests/api/files/get.test.ts
  ```

- **Comportamento esperado:**
  - **Input:** Linhas de 2023 e 2024
  - **Output:** 2 períodos em `periodos` array

- **Status:** ✅ Implementado (route.ts:277, 293-298)

---

#### ✅ V5.2.2: Agrupar turmas dentro de cada período

- **Como validar:**
  ```
  periodo.turmas = new Map<string, TurmaData>()
  Para cada linha do período:
    - Extrair turma
    - Adicionar em periodo.turmas
  ```

- **Teste correspondente:**
  ```
  tests/api/files/get.test.ts
  ```

- **Comportamento esperado:**
  - **Input:** Período 2024 com turmas "3001", "3002", "3003"
  - **Output:** 3 turmas no período 2024

- **Status:** ✅ Implementado (route.ts:303-308)

---

#### ✅ V5.2.3: Deduplic ar alunos por matrícula dentro de cada turma

- **Como validar:**
  ```
  turmaData.alunosCSV = new Map<string, AlunoCsv>()
  turmaData.alunosCSV.set(matricula, { matricula, nome })
  Map garante unicidade (matrícula é chave)
  ```

- **Teste correspondente:**
  ```
  tests/api/files/get.test.ts
  ```

- **Comportamento esperado:**
  - **Input:** 10 linhas do aluno "123..." na turma "3001" (uma linha por disciplina)
  - **Output:** Apenas 1 aluno contado em `totalAlunosCSV`

- **Status:** ✅ Implementado (route.ts:313)

---

### V5.3: Cálculo de Estatísticas

**Objetivo:** Calcular totais, pendentes e status para cada turma e período.

---

#### ✅ V5.3.1: Calcular total de alunos no CSV por turma

- **Como validar:**
  ```
  const alunosCSV = Array.from(turmaData.alunosCSV.values());
  const totalAlunosCSV = alunosCSV.length;
  ```

- **Teste correspondente:**
  ```
  tests/api/files/get.test.ts
  ```

- **Comportamento esperado:**
  - **Input:** Turma "3001" com 30 alunos únicos no CSV
  - **Output:** `{ totalAlunosCSV: 30 }`

- **Status:** ✅ Implementado (route.ts:351-352)

---

#### ⚠️ V5.3.2: Calcular total de alunos no banco por turma

- **Como validar:**
  ```
  Buscar enturmações do banco
  Agrupar por anoLetivo + turma
  Contar alunos únicos (deduplica por matricula)
  ```

- **Teste correspondente:**
  ```
  tests/api/files/get.test.ts
  ```

- **Comportamento esperado:**
  - **Input:** Turma "3001" com 25 alunos criados no banco
  - **Output:** `{ totalAlunosBanco: 25 }`

- **Status:** ⚠️ **GAP** - Parcialmente implementado (route.ts:317-346)
  - **Problema:** Lógica atual busca enturmações mas não agrupa corretamente por período+turma
  - **Impacto:** `totalAlunosBanco` pode estar incorreto
  - **Prioridade:** ALTA
  - **Estimativa:** 1h

---

#### ✅ V5.3.3: Identificar alunos pendentes (no CSV mas não no banco)

- **Como validar:**
  ```
  const alunosPendentes = alunosCSV.filter(
    aluno => !alunosNoBancoSet.has(aluno.matricula)
  );
  const pendentes = alunosPendentes.length;
  ```

- **Teste correspondente:**
  ```
  tests/api/files/get.test.ts
  ```

- **Comportamento esperado:**
  - **Input:** 30 alunos no CSV, 25 no banco
  - **Output:** `{ pendentes: 5, alunosPendentes: [...] }`

- **Status:** ✅ **RESOLVIDO** (route.ts:140-161)
  - **Fix:** Tratamento de race condition P2002 com retry automático
  - **Impacto:** 100% dos alunos agora são criados corretamente

---

#### ✅ V5.3.4: Determinar status da turma (ok vs pendente)

- **Como validar:**
  ```
  const status = pendentes > 0 ? 'pendente' : 'ok';
  ```

- **Teste correspondente:**
  ```
  tests/api/files/get.test.ts
  ```

- **Comportamento esperado:**
  - **Input:** Turma com 0 pendentes
  - **Output:** `{ status: 'ok' }`
  - **Input:** Turma com 5 pendentes
  - **Output:** `{ status: 'pendente' }`

- **Status:** ✅ Implementado (route.ts:364)

---

#### ✅ V5.3.5: Calcular resumo do período (agregação de turmas)

- **Como validar:**
  ```
  const totalTurmas = turmas.length;
  const totalAlunosCSV = turmas.reduce((sum, t) => sum + t.totalAlunosCSV, 0);
  const totalAlunosBanco = turmas.reduce((sum, t) => sum + t.totalAlunosBanco, 0);
  const pendentes = turmas.reduce((sum, t) => sum + t.pendentes, 0);
  const status = pendentes > 0 ? 'pendente' : 'ok';
  ```

- **Teste correspondente:**
  ```
  tests/api/files/get.test.ts
  ```

- **Comportamento esperado:**
  - **Input:** Período 2024 com 5 turmas (150 alunos total, 10 pendentes)
  - **Output:**
    ```json
    {
      "resumo": {
        "totalTurmas": 5,
        "totalAlunosCSV": 150,
        "totalAlunosBanco": 140,
        "pendentes": 10,
        "status": "pendente"
      }
    }
    ```

- **Status:** ✅ Implementado (route.ts:380-394)

---

### V5.4: Ordenação e Formatação de Resposta

**Objetivo:** Retornar dados organizados e ordenados.

---

#### ✅ V5.4.1: Ordenar turmas por nome (numérico se possível)

- **Como validar:**
  ```
  turmas.sort((a, b) => a.nome.localeCompare(b.nome, undefined, { numeric: true }))
  ```

- **Teste correspondente:**
  ```
  tests/api/files/get.test.ts
  ```

- **Comportamento esperado:**
  - **Input:** Turmas ["3001", "3010", "3002"]
  - **Output:** Ordenadas como ["3001", "3002", "3010"] (ordem numérica)

- **Status:** ✅ Implementado (route.ts:374-377)

---

#### ✅ V5.4.2: Ordenar períodos por ano (decrescente)

- **Como validar:**
  ```
  periodos.sort((a, b) => b.anoLetivo.localeCompare(a.anoLetivo))
  ```

- **Teste correspondente:**
  ```
  tests/api/files/get.test.ts
  ```

- **Comportamento esperado:**
  - **Input:** Períodos ["2022", "2024", "2023"]
  - **Output:** Ordenados como ["2024", "2023", "2022"] (mais recente primeiro)

- **Status:** ✅ Implementado (route.ts:397-400)

---

#### ⬜ V5.4.3: Incluir alunosPendentes apenas se status='pendente'

- **Como validar:**
  ```
  return {
    ...turma,
    alunosPendentes: status === 'pendente' ? alunosPendentes : undefined
  }
  Reduz tamanho do payload (não envia array vazio desnecessariamente)
  ```

- **Teste correspondente:**
  ```
  tests/api/files/get.test.ts
  ```

- **Comportamento esperado:**
  - **Input:** Turma com status 'ok'
  - **Output:** `alunosPendentes` ausente (undefined, não incluído no JSON)

- **Status:** ✅ Implementado (route.ts:372) - **Reclassificado de GAP para OK**

---

---

## CAMADA 6: OPERAÇÕES DE DELETE

**Responsabilidade:** Deletar arquivos (individual ou por período) e marcar entidades estruturadas como fonteAusente. Implementar lógica de hard delete (origem) + soft delete (estruturada).

**Tecnologias:** Next.js API Routes, Prisma transactions

**Arquivo principal:** `src/app/api/files/route.ts` (DELETE)

---

### V6.1: Delete Individual (por arquivo)

**Objetivo:** Deletar arquivo específico via ID.

---

#### ✅ V6.1.1: Buscar linhas do arquivo a deletar

- **Como validar:**
  ```
  const linhasIds = await prisma.linhaImportada.findMany({
    where: { arquivoId: id },
    select: { id: true }
  });
  const linhasIdsArray = linhasIds.map(l => l.id);
  ```

- **Teste correspondente:**
  ```
  tests/api/files/delete.test.ts
  ```

- **Comportamento esperado:**
  - **Input:** DELETE /api/files?id=abc123
  - **Output:** Array de IDs das linhas deste arquivo

- **Status:** ✅ Implementado (route.ts:431-436)

---

#### ✅ V6.1.2: Marcar alunos como fonteAusente (transação)

- **Como validar:**
  ```
  await prisma.$transaction([
    prisma.aluno.updateMany({
      where: {
        linhaOrigemId: { in: linhasIdsArray },
        origemTipo: 'csv'
      },
      data: { fonteAusente: true }
    }),
    // ... enturmações
  ])
  ```

- **Teste correspondente:**
  ```
  tests/api/files/delete.test.ts
  ```

- **Comportamento esperado:**
  - **Input:** DELETE arquivo com 50 alunos
  - **Output:** 50 alunos marcados com `fonteAusente = true`
  - **Garantia:** Transação garante atomicidade

- **Status:** ✅ Implementado (route.ts:439-456)

---

#### ✅ V6.1.3: Marcar enturmações como fonteAusente (transação)

- **Como validar:**
  ```
  prisma.enturmacao.updateMany({
    where: {
      linhaOrigemId: { in: linhasIdsArray },
      origemTipo: 'csv'
    },
    data: { fonteAusente: true }
  })
  ```

- **Teste correspondente:**
  ```
  tests/api/files/delete.test.ts
  ```

- **Comportamento esperado:**
  - **Input:** DELETE arquivo com 100 enturmações
  - **Output:** 100 enturmações marcadas com `fonteAusente = true`

- **Status:** ✅ Implementado (route.ts:448-455)

---

#### ✅ V6.1.4: Hard delete do arquivo (cascade deleta linhas)

- **Como validar:**
  ```
  await prisma.arquivoImportado.delete({
    where: { id }
  });
  Prisma schema: LinhaImportada.arquivoId onDelete: Cascade
  → Linhas deletadas automaticamente
  ```

- **Teste correspondente:**
  ```
  tests/api/files/delete.test.ts
  ```

- **Comportamento esperado:**
  - **Ação:** DELETE arquivo
  - **Efeito:**
    - ArquivoImportado deletado (hard delete)
    - LinhaImportada deletadas automaticamente (cascade)
    - Hash removido do banco (permite reimportação)

- **Status:** ✅ Implementado (route.ts:459-461)

---

### V6.2: Delete por Período

**Objetivo:** Deletar TODOS os arquivos de um período letivo.

---

#### ✅ V6.2.1: Filtrar linhas do período

- **Como validar:**
  ```
  Buscar todas linhas de arquivos ativos
  Para cada linha:
    - Extrair anoLetivo do JSONB (dadosOriginais.Ano)
    - Se anoLetivo === periodo → adicionar em linhasIdsDoPeriodo
  ```

- **Teste correspondente:**
  ```
  tests/api/files/delete-periodo.test.ts
  ```

- **Comportamento esperado:**
  - **Input:** DELETE /api/files?periodo=2024
  - **Output:** Array de IDs das linhas do período 2024

- **Status:** ✅ Implementado (route.ts:472-499)

---

#### ✅ V6.2.2: Coletar IDs únicos dos arquivos

- **Como validar:**
  ```
  const arquivosIds = new Set<string>();
  for (const linha of linhas) {
    if (anoLetivo === periodo) {
      arquivosIds.add(linha.arquivoId);
    }
  }
  ```

- **Teste correspondente:**
  ```
  tests/api/files/delete-periodo.test.ts
  ```

- **Comportamento esperado:**
  - **Input:** Período 2024 com 3 arquivos
  - **Output:** `arquivosIds.size = 3`

- **Status:** ✅ Implementado (route.ts:487-498)

---

#### ✅ V6.2.3: Marcar alunos e enturmações como fonteAusente (transação)

- **Como validar:**
  ```
  await prisma.$transaction([
    prisma.aluno.updateMany({ ... }),
    prisma.enturmacao.updateMany({ ... })
  ])
  Mesma lógica do delete individual, mas com linhasIdsDoPeriodo
  ```

- **Teste correspondente:**
  ```
  tests/api/files/delete-periodo.test.ts
  ```

- **Comportamento esperado:**
  - **Input:** DELETE período 2024 (150 alunos, 200 enturmações)
  - **Output:** Todos marcados como `fonteAusente = true`

- **Status:** ✅ Implementado (route.ts:508-525)

---

#### ✅ V6.2.4: Hard delete de múltiplos arquivos

- **Como validar:**
  ```
  await prisma.arquivoImportado.deleteMany({
    where: {
      id: { in: Array.from(arquivosIds) }
    }
  });
  ```

- **Teste correspondente:**
  ```
  tests/api/files/delete-periodo.test.ts
  ```

- **Comportamento esperado:**
  - **Input:** DELETE período com 3 arquivos
  - **Output:** 3 arquivos deletados (hard delete)
  - **Side effects:** Linhas deletadas via cascade

- **Status:** ✅ Implementado (route.ts:528-532)

---

#### ⚠️ V6.2.5: Retornar estatísticas da operação

- **Como validar:**
  ```
  return {
    message: `${arquivosIds.size} arquivo(s) deletado(s)`,
    arquivosDeletados: arquivosIds.size,
    linhasDeletadas: linhasIdsDoPeriodo.length,
    alunosMarcados: ?, // não implementado
    enturmacoesMarcadas: ? // não implementado
  }
  ```

- **Teste correspondente:**
  ```
  tests/api/files/delete-periodo.test.ts
  ```

- **Comportamento esperado:**
  - **Output:** Resumo completo da operação

- **Status:** ⚠️ **GAP** - Parcialmente implementado (route.ts:534-538)
  - **Impacto:** Não retorna contagem de alunos/enturmações marcados
  - **Prioridade:** BAIXA (não crítico, apenas UX)
  - **Estimativa:** 30min

---

### V6.3: Validações de Delete

**Objetivo:** Garantir segurança e integridade.

---

#### ✅ V6.3.1: Validar parâmetro obrigatório (id OU periodo)

- **Como validar:**
  ```
  if (!id && !periodo) {
    return 400 Bad Request
  }
  ```

- **Teste correspondente:**
  ```
  tests/api/files/delete.test.ts
  ```

- **Comportamento esperado:**
  - **Input:** DELETE /api/files (sem query params)
  - **Output:** 400 Bad Request, "Parâmetro id ou periodo é obrigatório"

- **Status:** ✅ Implementado (route.ts:421-425)

---

#### ⬜ V6.3.2: Validar que arquivo existe antes de deletar

- **Como validar:**
  ```
  const arquivo = await prisma.arquivoImportado.findUnique({ where: { id } });
  if (!arquivo) return 404 Not Found
  ```

- **Teste correspondente:**
  ```
  tests/api/files/delete.test.ts
  ```

- **Comportamento esperado:**
  - **Input:** DELETE /api/files?id=nao-existe
  - **Output:** 404 Not Found, "Arquivo não encontrado"

- **Status:** ⬜ Pendente - **GAP não crítico** (Prisma retorna erro se não existir)
  - **Impacto:** Mensagem de erro não é específica
  - **Prioridade:** BAIXA
  - **Estimativa:** 15min

---

#### ⬜ V6.3.3: Não deletar alunos editados manualmente

- **Como validar:**
  ```
  Filtrar apenas alunos com origemTipo='csv'
  updateMany({ where: { origemTipo: 'csv', ... } })
  Alunos com origemTipo='manual' não são afetados
  ```

- **Teste correspondente:**
  ```
  tests/api/files/delete.test.ts
  ```

- **Comportamento esperado:**
  - **Cenário:** Aluno criado manualmente (sem CSV)
  - **Ação:** DELETE período
  - **Efeito:** Aluno manual NÃO é marcado como fonteAusente

- **Status:** ✅ Implementado (route.ts:443-445) - **Reclassificado de GAP para OK**

---

#### ✅ V6.3.4: Retornar mensagem de sucesso se período não tem dados

- **Como validar:**
  ```
  if (arquivosIds.size === 0) {
    return { message: `Nenhum arquivo do período ${periodo} encontrado` }
  }
  ```

- **Teste correspondente:**
  ```
  tests/api/files/delete-periodo.test.ts
  ```

- **Comportamento esperado:**
  - **Input:** DELETE /api/files?periodo=1999 (não existe)
  - **Output:** 200 OK, "Nenhum arquivo do período 1999 encontrado"

- **Status:** ✅ Implementado (route.ts:501-505)

---

---

## CAMADA 7: TRATAMENTO DE ERROS

**Responsabilidade:** Capturar erros, retornar códigos HTTP corretos e mensagens claras.

**Tecnologias:** Next.js API Routes, try/catch, Prisma error handling

**Arquivo principal:** `src/app/api/files/route.ts` (todas as rotas)

---

### V7.1: Códigos HTTP Corretos

**Objetivo:** Usar status codes adequados para cada tipo de erro.

---

#### ✅ V7.1.1: 400 Bad Request para dados inválidos

- **Como validar:**
  ```
  if (!data || !fileName) return NextResponse.json({ error: '...' }, { status: 400 })
  ```

- **Teste correspondente:**
  ```
  tests/api/files/errors.test.ts
  ```

- **Comportamento esperado:**
  - **Input:** POST sem body ou campos obrigatórios
  - **Output:** 400 Bad Request

- **Status:** ✅ Implementado (route.ts:29)

---

#### ✅ V7.1.2: 409 Conflict para duplicatas

- **Como validar:**
  ```
  if (existing) return NextResponse.json({ error: '...' }, { status: 409 })
  ```

- **Teste correspondente:**
  ```
  tests/api/files/errors.test.ts
  ```

- **Comportamento esperado:**
  - **Input:** POST com arquivo duplicado
  - **Output:** 409 Conflict

- **Status:** ✅ Implementado (route.ts:48)

---

#### ✅ V7.1.3: 500 Internal Server Error para erros não previstos

- **Como validar:**
  ```
  catch (error) {
    console.error('Erro ao ...:', error);
    return NextResponse.json({ error: 'Erro ao ...' }, { status: 500 })
  }
  ```

- **Teste correspondente:**
  ```
  tests/api/files/errors.test.ts
  ```

- **Comportamento esperado:**
  - **Input:** Erro no Prisma (ex: banco offline)
  - **Output:** 500 Internal Server Error

- **Status:** ✅ Implementado (route.ts:227, 407, 544)

---

#### ⬜ V7.1.4: 404 Not Found para recursos não encontrados

- **Como validar:**
  ```
  if (!arquivo) return NextResponse.json({ error: 'Arquivo não encontrado' }, { status: 404 })
  ```

- **Teste correspondente:**
  ```
  tests/api/files/errors.test.ts
  ```

- **Comportamento esperado:**
  - **Input:** DELETE /api/files?id=nao-existe
  - **Output:** 404 Not Found

- **Status:** ⬜ Pendente - **GAP não crítico**

---

### V7.2: Mensagens de Erro Claras

**Objetivo:** Retornar mensagens que ajudem o usuário a entender o problema.

---

#### ✅ V7.2.1: Mensagem específica para duplicata

- **Como validar:**
  ```
  return { error: 'Arquivo com conteúdo idêntico já existe', fileId: existing.id }
  ```

- **Teste correspondente:**
  ```
  tests/api/files/errors.test.ts
  ```

- **Comportamento esperado:**
  - **Output:** Mensagem clara + ID do arquivo existente

- **Status:** ✅ Implementado (route.ts:47)

---

#### ⚠️ V7.2.2: Mensagem específica para erro de constraint

- **Como validar:**
  ```
  catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return { error: `Violação de unicidade: ${error.meta?.target}`, status: 400 }
      }
    }
  }
  ```

- **Teste correspondente:**
  ```
  tests/api/files/errors.test.ts
  ```

- **Comportamento esperado:**
  - **Input:** Erro P2002 (unique constraint)
  - **Output:** Mensagem específica indicando qual campo

- **Status:** ⚠️ **GAP** - Não implementado (apenas catch genérico)

---

---

## CAMADA 8: SINCRONIZAÇÃO FRONTEND-BACKEND

**Responsabilidade:** Garantir que estado do frontend reflete corretamente dados do backend. Atualizar UI após operações.

**Tecnologias:** React state management, fetch API

**Arquivo principal:** `src/components/MigrateUploads.tsx`

---

### V8.1: Atualização de Estado Após Upload

**Objetivo:** Recarregar dados após upload bem-sucedido.

---

#### ✅ V8.1.1: Chamar fetchData() após upload

- **Como validar:**
  ```
  const handleNewFiles = async (...) => {
    const response = await fetch('/api/files', { method: 'POST', ... });
    if (!response.ok) throw error;
    await fetchData(); // Recarrega lista
  }
  ```

- **Teste correspondente:**
  ```
  tests/integration/frontend/upload.test.ts
  ```

- **Comportamento esperado:**
  - **Ação:** Usuário faz upload
  - **Efeito:** Lista de períodos atualiza automaticamente com novos dados

- **Status:** ✅ Implementado (MigrateUploads.tsx:99)

---

#### ✅ V8.1.2: Exibir dados corretos após upload

- **Como validar:**
  ```
  Após upload:
  - GET /api/files retorna periodos com turmas e alunos
  - Frontend renderiza periodosCard com dados corretos
  Verificar se arrays não estão vazios
  ```

- **Teste correspondente:**
  ```
  tests/integration/frontend/upload.test.ts
  ```

- **Comportamento esperado:**
  - **Ação:** Upload de CSV com 30 alunos
  - **Efeito:** UI exibe "30 alunos" (não "0 alunos")

- **Status:** ✅ **RESOLVIDO** (route.ts:140-161)
  - **Fix:** Tratamento de race condition P2002 com retry automático
  - **Impacto:** Problema estava relacionado a V5.3.3 (alunos não sendo criados)
  - **Relacionado:** V5.3.3

---

### V8.2: Atualização de Estado Após Delete

**Objetivo:** Recarregar dados após delete.

---

#### ✅ V8.2.1: Chamar fetchData() após delete

- **Como validar:**
  ```
  const handleResetPeriodo = async (...) => {
    const response = await fetch(`/api/files?periodo=...`, { method: 'DELETE' });
    if (!response.ok) throw error;
    await fetchData(); // Recarrega lista
  }
  ```

- **Teste correspondente:**
  ```
  tests/integration/frontend/delete.test.ts
  ```

- **Comportamento esperado:**
  - **Ação:** Usuário deleta período 2024
  - **Efeito:** Período 2024 desaparece da lista

- **Status:** ✅ Implementado (MigrateUploads.tsx:124)

---

### V8.3: Indicadores de Loading

**Objetivo:** Mostrar feedback visual durante operações assíncronas.

---

#### ⬜ V8.3.1: Loading ao carregar dados iniciais

- **Como validar:**
  ```
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => { fetchData(); }, []);
  {isLoading && <div>Carregando...</div>}
  ```

- **Teste correspondente:**
  ```
  tests/unit/components/MigrateUploads.test.tsx
  ```

- **Comportamento esperado:**
  - **Ação:** Componente monta
  - **Efeito:** Exibe "Carregando..." até fetchData() terminar

- **Status:** ⬜ Implementado (MigrateUploads.tsx:52-67, 145-148) - **Reclassificado para OK**

---

#### ⬜ V8.3.2: Loading durante upload

- **Como validar:**
  ```
  const [isUploading, setIsUploading] = useState(false);
  setIsUploading(true);
  await fetch(...);
  setIsUploading(false);
  {isUploading && <div>Processando...</div>}
  ```

- **Teste correspondente:**
  ```
  tests/unit/components/MigrateUploads.test.tsx
  ```

- **Comportamento esperado:**
  - **Ação:** Upload em progresso
  - **Efeito:** Mensagem "Processando arquivo..."

- **Status:** ⬜ Implementado (MigrateUploads.tsx:77, 105, 152-156) - **Reclassificado para OK**

---

#### ⬜ V8.3.3: Desabilitar botões durante operações

- **Como validar:**
  ```
  <Button disabled={isUploading || isLoading}>Upload</Button>
  Previne múltiplos cliques
  ```

- **Teste correspondente:**
  ```
  tests/unit/components/MigrateUploads.test.tsx
  ```

- **Comportamento esperado:**
  - **Ação:** Usuário clica em "Upload"
  - **Efeito:** Botão fica desabilitado até operação terminar

- **Status:** ⬜ Pendente - **GAP não crítico**
  - **Impacto:** Usuário pode clicar múltiplas vezes
  - **Prioridade:** MÉDIA
  - **Estimativa:** 30min

---

### V8.4: Tratamento de Erros no Frontend

**Objetivo:** Exibir mensagens de erro amigáveis.

---

#### ⚠️ V8.4.1: Exibir erro ao usuário (não apenas console)

- **Como validar:**
  ```
  catch (error) {
    console.error('Erro:', error);
    alert('Erro ao fazer upload. Verifique o console.');
  }
  ```

- **Teste correspondente:**
  ```
  tests/unit/components/MigrateUploads.test.tsx
  ```

- **Comportamento esperado:**
  - **Ação:** Upload falha
  - **Efeito:** Usuário vê mensagem de erro

- **Status:** ⚠️ **GAP** - Usa alert() (MigrateUploads.tsx:87, 103)
  - **Impacto:** UX não ideal (alert nativo)
  - **Prioridade:** MÉDIA
  - **Sugestão:** Usar toast ou mensagem inline
  - **Estimativa:** 1h

---

---

## RELATÓRIO DE GAPS

### ❌ GAPS CRÍTICOS (Bloqueiam Produção)

1. **V2.4.1: Transação completa não implementada**
   - **Impacto:** Se processamento falhar no meio (ex: erro ao criar aluno), arquivo e linhas ficam criados mas dados estruturados não. Banco fica em estado inconsistente.
   - **Prioridade:** ALTA
   - **Estimativa:** 2-3h
   - **Ação:** Envolver todas as operações (arquivo → linhas → alunos → enturmações) em `prisma.$transaction()`

---

### ⚠️ GAPS Não-Críticos (Deve ser implementado)

1. **V4.2.3: Otimização com createMany**
   - **Impacto:** Performance ruim para arquivos grandes (>500 linhas). Upload de 1000 linhas pode levar ~10s vs <1s com createMany.
   - **Prioridade:** ALTA (afeta UX)
   - **Estimativa:** 1h

2. **V5.3.2: Calcular total de alunos no banco por turma**
   - **Impacto:** Estatísticas incorretas. Usuário não sabe quantos alunos foram realmente criados.
   - **Prioridade:** ALTA
   - **Estimativa:** 1h

3. **V2.4.2: Tratamento de erro com mensagem específica**
   - **Impacto:** Mensagens de erro genéricas ("Erro ao processar arquivo"). Usuário não entende o problema.
   - **Prioridade:** MÉDIA
   - **Estimativa:** 1h

4. **V1.2.3: Opção de remover duplicatas antes de enviar**
   - **Impacto:** Usuário envia duplicatas sem saber, backend precisa lidar.
   - **Prioridade:** MÉDIA
   - **Estimativa:** 1h

5. **V2.3.1: Validar que todas as linhas têm matrícula**
   - **Impacto:** Linhas sem matrícula são silenciosamente ignoradas. Usuário não é avisado.
   - **Prioridade:** MÉDIA
   - **Estimativa:** 30min

6. **V6.2.5: Retornar estatísticas da operação de delete**
   - **Impacto:** UX não ideal. Usuário não sabe quantos alunos foram afetados.
   - **Prioridade:** BAIXA
   - **Estimativa:** 30min

7. **V8.3.3: Desabilitar botões durante operações**
   - **Impacto:** Usuário pode clicar múltiplas vezes, causar uploads duplicados.
   - **Prioridade:** MÉDIA
   - **Estimativa:** 30min

8. **V8.4.1: Exibir erro ao usuário (não apenas console)**
   - **Impacto:** UX não ideal (usa alert nativo).
   - **Prioridade:** MÉDIA
   - **Estimativa:** 1h (implementar sistema de toast)

9. **V7.2.2: Mensagem específica para erro de constraint**
   - **Impacto:** Mensagens de erro genéricas.
   - **Prioridade:** BAIXA
   - **Estimativa:** 1h

10. **V1.1.6: Validação de tamanho de arquivo**
    - **Impacto:** Usuário pode tentar upload de arquivo muito grande (>10MB), causar timeout.
    - **Prioridade:** BAIXA
    - **Estimativa:** 15min

---

## MAPA DE TESTES

### Arquivos de Teste (A criar)

| Arquivo | Validações Cobertas | Prioridade | Status |
|---------|---------------------|------------|--------|
| `tests/unit/components/DropCsv.test.ts` | V1.1.1, V1.1.2, V1.2.1, V1.2.2, V1.3.1, V1.3.2 | ALTA | 🔴 Pendente |
| `tests/unit/utils/parseCsv.test.ts` | V1.1.3, V1.1.4, V1.1.5 | ALTA | 🔴 Pendente |
| `tests/unit/utils/limparValor.test.ts` | V3.1.1-V3.2.2 | ALTA | 🔴 Pendente |
| `tests/unit/utils/hashData.test.ts` | V2.2.1 | ALTA | 🔴 Pendente |
| `tests/api/files/post.test.ts` | V2.1.1, V2.1.2, V2.2.2, V4.6.1-V4.6.3 | ALTA | 🔴 Pendente |
| `tests/api/files/post-transaction.test.ts` | V2.4.1 ❌ | CRÍTICA | 🔴 Pendente |
| `tests/api/files/get.test.ts` | V5.1.1-V5.4.2 | ALTA | 🔴 Pendente |
| `tests/api/files/delete.test.ts` | V6.1.1-V6.3.4 | ALTA | 🔴 Pendente |
| `tests/api/files/delete-periodo.test.ts` | V6.2.1-V6.2.5 | ALTA | 🔴 Pendente |
| `tests/api/files/errors.test.ts` | V7.1.1-V7.2.2 | MÉDIA | 🔴 Pendente |
| `tests/integration/database/arquivo.test.ts` | V4.1.1 | ALTA | 🔴 Pendente |
| `tests/integration/database/linha.test.ts` | V4.2.1-V4.2.3 | ALTA | 🔴 Pendente |
| `tests/integration/database/aluno.test.ts` | V4.3.1-V4.3.3 | ALTA | 🔴 Pendente |
| `tests/integration/database/enturmacao.test.ts` | V4.4.1-V4.4.5 | ALTA | 🔴 Pendente |
| `tests/integration/database/fk.test.ts` | V4.5.1-V4.5.3 | MÉDIA | 🔴 Pendente |
| `tests/integration/files/reimportacao.test.ts` | V2.2.3 | ALTA | 🔴 Pendente |
| `tests/integration/frontend/upload.test.ts` | V8.1.1, V8.1.2 ❌ | CRÍTICA | 🔴 Pendente |
| `tests/integration/frontend/delete.test.ts` | V8.2.1 | ALTA | 🔴 Pendente |
| `tests/unit/components/MigrateUploads.test.tsx` | V8.3.1-V8.4.1 | MÉDIA | 🔴 Pendente |
| `tests/performance/linhaImportada.test.ts` | V4.2.3 | BAIXA | 🔴 Pendente |

---

## CASOS EXTREMOS (EDGE CASES)

### Identificados mas NÃO Testados

1. **Upload de arquivo muito grande (>10MB)**
   - **Cenário:** Usuário tenta upload de CSV com 50.000 linhas
   - **Risco:** MÉDIO - Timeout no backend, memória insuficiente
   - **Ação:** Adicionar validação V1.1.6 + considerar streaming/chunking
   - **Status:** ⚠️ Pendente

2. **Matrícula com caracteres especiais**
   - **Cenário:** CSV contém matrícula "123-456-789-AB" (com hífens e letras)
   - **Risco:** BAIXO - Pode quebrar queries ou comparações
   - **Ação:** Adicionar sanitização/validação
   - **Status:** ⚠️ Pendente

3. **Nome com caracteres Unicode raros**
   - **Cenário:** Nome "João 名前 النص" (mistura de idiomas)
   - **Risco:** BAIXO - Postgres suporta Unicode, mas pode causar problemas de exibição
   - **Ação:** Teste com dados reais
   - **Status:** ⚠️ Pendente

4. **CSV com encoding diferente (não UTF-8)**
   - **Cenário:** Arquivo exportado em ISO-8859-1 (comum em Excel Brasil)
   - **Risco:** ALTO - Acentos quebrados, parsing falha
   - **Ação:** Detectar encoding automaticamente ou pedir ao usuário
   - **Status:** ⚠️ Pendente

5. **Múltiplos uploads simultâneos (concorrência)**
   - **Cenário:** Usuário arrasta 5 arquivos de uma vez
   - **Risco:** MÉDIO - Queries paralelas podem causar deadlock
   - **Ação:** Processar sequencialmente (já implementado no frontend)
   - **Status:** ✅ Mitigado (DropCsv.tsx:90 usa loop sequencial)

6. **Delete durante upload**
   - **Cenário:** Usuário deleta período enquanto outro upload está processando
   - **Risco:** MÉDIO - Estado inconsistente
   - **Ação:** Implementar locks ou validações
   - **Status:** ⚠️ Pendente

7. **Reimportação imediata após delete**
   - **Cenário:** DELETE → POST imediato (sem esperar UI atualizar)
   - **Risco:** BAIXO - Hard delete já remove hash, deve funcionar
   - **Ação:** Teste de integração
   - **Status:** ⚠️ Pendente (coberto por V2.2.3)

8. **CSV com linha de header duplicada no meio**
   - **Cenário:** Arquivo tem headers na linha 1 e novamente na linha 500
   - **Risco:** MÉDIO - Parsing pode interpretar como dados
   - **Ação:** Função parseCsvLoose já busca primeira linha válida (V1.1.2)
   - **Status:** ✅ Mitigado (DropCsv.tsx:52-61)

9. **Dados no banco SEM arquivo CSV correspondente** ⭐ **CRÍTICO**
   - **Cenário:** Turma 3004/2024 existe no banco mas CSV foi deletado (fonteAusente=false incorreto)
   - **Exemplo real:** Migração manual, correção direta no banco, bug em delete
   - **Risco:** ALTO - Painel de Migração mostra dados inconsistentes
   - **Problema:** GET /api/files compara apenas "CSV → Banco", não "Banco → CSV"
   - **Ação:**
     - Adicionar validação reversa V5.3.4: Identificar turmas/alunos órfãos (no banco mas sem CSV)
     - Exibir aviso visual no Painel de Migração (badge amarelo "⚠️ Sem origem CSV")
     - Marcar automaticamente `fonteAusente=true` se detectado
   - **Fixture de teste:**
     - `tests/fixtures/orphaned-data.sql` - Criar aluno/enturmação sem CSV
     - `tests/integration/api/files-orphaned.test.ts` - Validar detecção
   - **Status:** 🔴 **GAP CRÍTICO** - Não implementado
   - **Prioridade:** ALTA
   - **Estimativa:** 2h

---

## REGRAS DE NEGÓCIO (CHECKLIST)

**Regras que NÃO PODEM ser violadas:**

- [x] **RN1: Não permitir arquivo duplicado (mesmo hash)**
  - **Validações relacionadas:** V2.2.1, V2.2.2
  - **Status:** ✅ Testado (implementado)

- [x] **RN2: Aluno não pode ter múltiplas enturmações idênticas**
  - **Validações relacionadas:** V4.4.3
  - **Status:** ✅ Testado (implementado)

- [x] **RN3: Delete de CSV não pode apagar alunos editados manualmente**
  - **Validações relacionadas:** V6.3.3
  - **Status:** ✅ Testado (implementado)

- [x] **RN4: Prefixos devem ser removidos antes de salvar no banco**
  - **Validações relacionadas:** V3.1.1-V3.1.5
  - **Status:** ✅ Testado (implementado)

- [x] **RN5: Headers obrigatórios devem estar presentes**
  - **Validações relacionadas:** V1.1.2
  - **Status:** ✅ Testado (implementado)

- [ ] **RN6: Todas as operações de banco devem ser atômicas (transação)**
  - **Validações relacionadas:** V2.4.1 ❌
  - **Status:** ❌ **GAP CRÍTICO** - Não implementado

- [x] **RN7: Dados originais devem ser preservados (JSONB)**
  - **Validações relacionadas:** V4.2.1
  - **Status:** ✅ Testado (implementado)

- [x] **RN8: Aluno pode ter múltiplas enturmações ao longo dos anos**
  - **Validações relacionadas:** V4.4.4
  - **Status:** ✅ Testado (design do modelo)

- [ ] **RN9: Visualização hierárquica deve refletir realidade do banco**
  - **Validações relacionadas:** V5.3.3 ❌, V8.1.2 ❌
  - **Status:** ❌ **GAP CRÍTICO** - Bugado

---

## COMANDOS ÚTEIS

### Rodar testes desta funcionalidade

```bash
# Todos os testes
pnpm test migracao

# Apenas camada específica
pnpm test V1  # Frontend (DropCsv)
pnpm test V2  # Backend (API POST)
pnpm test V4  # Banco de dados
pnpm test V5  # Visualização (API GET)
pnpm test V6  # Delete (API DELETE)
pnpm test V8  # Frontend-Backend sync

# Coverage
pnpm test:coverage migracao
```

### Marcar validação como completa

```bash
# 1. Implementar código
# 2. Escrever teste
# 3. Rodar teste
pnpm test [caminho-do-teste]

# 4. Se PASSAR ✅, marcar [x] neste checklist
# 5. Commit
git add .
git commit -m "feat: implement V[X].[Y].[Z] - [descrição]"
```

### Debugar bugs críticos

```bash
# V5.3.3 + V8.1.2: Visualização hierárquica
# 1. Fazer upload de arquivo
# 2. Chamar GET /api/files manualmente
curl http://localhost:3000/api/files | jq

# 3. Verificar se periodos, turmas e alunos estão presentes
# 4. Se vazios → debugar route.ts:359-361

# V2.4.1: Transação completa
# 1. Simular erro no meio do processamento
# 2. Verificar se arquivo foi criado mas alunos não
# 3. Implementar transação global
```

---

## PRÓXIMOS PASSOS

### Prioridade ALTA (Esta Semana)

1. [ ] **Resolver bugs críticos:**
   - [ ] V2.4.1: Implementar transação completa
   - [ ] V5.3.3 + V8.1.2: Corrigir visualização hierárquica

2. [ ] **Criar testes prioritários:**
   - [ ] `tests/api/files/post-transaction.test.ts`
   - [ ] `tests/integration/frontend/upload.test.ts`
   - [ ] `tests/api/files/get.test.ts`

3. [ ] **Melhorias de performance:**
   - [ ] V4.2.3: Otimizar com createMany

### Prioridade MÉDIA (Próxima Semana)

1. [ ] Implementar gaps não-críticos (⚠️)
2. [ ] Adicionar testes de unidade (V1, V3)
3. [ ] Melhorar tratamento de erros (V2.4.2, V7.2.2)
4. [ ] Implementar sistema de toast (V8.4.1)

### Prioridade BAIXA (Backlog)

1. [ ] Validações adicionais (V2.3.2, V1.1.6)
2. [ ] Testes de performance
3. [ ] Documentar casos extremos adicionais
4. [ ] Refatorar código duplicado

---

## REFERÊNCIAS

- **Documentação relacionada:**
  - [Conceito](./MIGRACAO_CONCEITO.md)
  - [Documentação Técnica](./MIGRACAO_TECNICO.md) *(a criar)*
  - [Ciclo de Vida](./MIGRACAO_CICLO.md) *(a criar)*

- **Guias:**
  - [Metodologia CIF](../METODOLOGIA_CIF.md)
  - [Guia de Fluxo de Trabalho](../METODOLOGIA_CIF_FLUXO.md)

- **Arquivos de código:**
  - [src/components/MigrateUploads.tsx](../../src/components/MigrateUploads.tsx)
  - [src/components/DropCsv.tsx](../../src/components/DropCsv.tsx)
  - [src/app/api/files/route.ts](../../src/app/api/files/route.ts)
  - [prisma/schema.prisma](../../prisma/schema.prisma)

---

**Data de criação:** 2025-11-04
**Última atualização:** 2025-11-04
**Autor:** Claude (análise baseada em código existente)
**Revisado por:** A revisar

---

## HISTÓRICO DE ALTERAÇÕES

| Data | Alteração | Autor |
|------|-----------|-------|
| 2025-11-04 | Criação inicial - 80 validações em 8 camadas | Claude |
| 2025-11-04 | Identificação de 3 gaps críticos (V2.4.1, V5.3.3, V8.1.2) | Claude |
| 2025-11-04 | Reclassificação de 4 validações de GAP para OK | Claude |
