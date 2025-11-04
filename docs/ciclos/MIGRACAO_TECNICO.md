# DOCUMENTAÇÃO TÉCNICA: Painel de Migração de Dados CSV

## VISÃO GERAL

**O que este documento cobre:**

Este documento descreve a implementação técnica completa do Painel de Migração de Dados CSV, incluindo arquitetura de 3 camadas, fluxo de dados end-to-end, componentes React, APIs Next.js, models Prisma, funções críticas e troubleshooting.

**Público-alvo:** Desenvolvedores fazendo manutenção, extensão ou debugging do sistema de importação de dados do Conexão Educação (SEEDUC-RJ).

**Contexto:** O Painel permite importar arquivos CSV de atas de resultados finais, validando e processando dados de alunos, enturmações e histórico escolar. Implementa detecção de duplicatas, rastreabilidade de origem e capacidade de re-importação.

---

## ARQUITETURA

### Diagrama de Alto Nível

```
┌─────────────────────────────────────────────────────────────┐
│ CAMADA 1: FRONTEND (React + Next.js)                       │
│ ┌─────────────┐  ┌──────────────┐  ┌──────────────┐       │
│ │MigrateUploads│  │   DropCsv    │  │ PeriodoCard  │       │
│ │   (estado)   │──│  (parsing)   │  │(visualização)│       │
│ └─────────────┘  └──────────────┘  └──────────────┘       │
└───────────────────────┬─────────────────────────────────────┘
                        │ fetch('/api/files')
                        ▼
┌─────────────────────────────────────────────────────────────┐
│ CAMADA 2: API ROUTES (Next.js)                             │
│ ┌─────────────────────────────────────────────────────┐    │
│ │ POST /api/files   GET /api/files   DELETE /api/files│    │
│ │ - Validação       - Visualização   - Hard delete    │    │
│ │ - Hash            - Hierarquia     - fonteAusente   │    │
│ │ - Persistência    - Pendentes      - Cascade        │    │
│ └────────────────────────┬────────────────────────────┘    │
└──────────────────────────┼──────────────────────────────────┘
                           │ Prisma Client
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ CAMADA 3: LÓGICA DE NEGÓCIO                                │
│ ┌─────────────┐  ┌──────────────┐  ┌──────────────┐       │
│ │  hashData() │  │limparValor() │  │groupByMatricula│      │
│ │  (SHA-256)  │  │(prefixos CSV)│  │  (dedup)      │       │
│ └─────────────┘  └──────────────┘  └──────────────┘       │
└───────────────────────┬─────────────────────────────────────┘
                        │ Prisma Queries
                        ▼
┌─────────────────────────────────────────────────────────────┐
│ CAMADA 4: BANCO DE DADOS (PostgreSQL + Prisma)            │
│                                                             │
│ ┌─────────────┐ ┌──────────────┐ ┌──────────────┐         │
│ │   CAMADA 1  │ │   CAMADA 2   │ │   CAMADA 3   │         │
│ │  (Origem)   │ │ (Estruturada)│ │  (Auditoria) │         │
│ │─────────────│ │──────────────│ │──────────────│         │
│ │ArquivoImpor-│ │    Aluno     │ │  Auditoria   │         │
│ │    tado     │ │  Enturmacao  │ │              │         │
│ │LinhaImporta-│ │              │ │              │         │
│ │     da      │ │              │ │              │         │
│ │  (IMUTÁVEL) │ │  (EDITÁVEL)  │ │  (HISTÓRICO) │         │
│ └─────────────┘ └──────────────┘ └──────────────┘         │
└─────────────────────────────────────────────────────────────┘
```

### Stack Tecnológica

| Camada | Tecnologias | Versão |
|--------|-------------|--------|
| Frontend | React, TypeScript, Tailwind CSS | React 19.2.0 |
| Backend | Next.js API Routes, Node.js | Next.js 16.0.0 |
| Banco de Dados | PostgreSQL, Prisma ORM | Prisma 6.18.0 |
| Parsing | JavaScript manual (parseCsvLoose) | N/A |
| Hash | crypto (Node.js nativo) | SHA-256 |
| UI Components | Componentes customizados (Button, Modal, Tabs) | N/A |

**Nota:** Não usa bibliotecas externas para CSV (Papa Parse) para ter controle total sobre parsing tolerante.

---

## FLUXO DE DADOS COMPLETO

### Fluxo Principal (Happy Path)

```
1. Usuário faz drag-and-drop de arquivo CSV
   └─> DropCsv.tsx - onChange() ou onDrop()
       └─> FileReader.readAsText(file)
           └─> parseCsvLoose(text)
               ├─ Remove BOM (\uFEFF)
               ├─ Busca headers obrigatórios
               ├─ Processa cada linha
               └─> { headers: [...], rows: [...] }
                   └─> onParsed(data, fileName) - callback
                       └─> MigrateUploads.handleNewFiles()
                           └─> POST /api/files
                               ├─ Body: { data: ParsedCsv, fileName: string }
                               │
                               └─> API Route Handler (route.ts)
                                   │
                                   ├─ ETAPA 1: Calcular Hash
                                   │   └─> hashData(data)
                                   │       ├─ Ordena headers alfabeticamente
                                   │       ├─ Ordena rows por concatenação de chaves
                                   │       └─> SHA-256 do JSON
                                   │
                                   ├─ ETAPA 2: Verificar Duplicatas
                                   │   └─> prisma.arquivoImportado.findFirst({ hashArquivo, status: 'ativo' })
                                   │       ├─ Se existe: retorna 409 Conflict
                                   │       └─ Se não: prossegue
                                   │
                                   ├─ ETAPA 3: Criar ArquivoImportado
                                   │   └─> prisma.arquivoImportado.create({ nomeArquivo, hashArquivo, tipo: 'alunos' })
                                   │
                                   ├─ ETAPA 4: Processar Linhas
                                   │   └─> for (row of data.rows)
                                   │       ├─ Extrair matricula
                                   │       ├─ Criar LinhaImportada (JSONB original)
                                   │       └─> Agrupar por chave: `${matricula}|${anoLetivo}|${turma}`
                                   │
                                   ├─ ETAPA 5: Criar/Atualizar Alunos
                                   │   └─> for (matricula of alunosUnicos)
                                   │       ├─> prisma.aluno.findUnique({ matricula })
                                   │       ├─ Se não existe: create()
                                   │       └─ Se existe: update(linhaOrigemId, fonteAusente=false)
                                   │
                                   ├─ ETAPA 6: Criar Enturmações
                                   │   └─> for (enturmacao of enturmacoesMap)
                                   │       ├─> limparValor() para remover prefixos
                                   │       │   "Ano Letivo: 2024" → "2024"
                                   │       │   "Turma: 3001" → "3001"
                                   │       ├─> prisma.enturmacao.findFirst({ alunoId, anoLetivo, turma, serie })
                                   │       ├─ Se não existe: create()
                                   │       └─ Se existe: update(linhaOrigemId, fonteAusente=false)
                                   │
                                   └─> Retorna JSON:
                                       {
                                         arquivo: { id, nomeArquivo, hashArquivo },
                                         linhasImportadas: number,
                                         alunosNovos: number,
                                         alunosAtualizados: number,
                                         enturmacoesNovas: number
                                       }

2. Frontend recebe resposta
   └─> MigrateUploads.handleNewFiles()
       └─> fetchData() - Recarrega GET /api/files
           └─> setPeriodos(periodos) - Atualiza UI
```

### Fluxo de Delete (Hard Delete + fonteAusente)

```
1. Usuário clica "Resetar Período" (ex: 2024)
   └─> PeriodoCard.handleReset()
       └─> MigrateUploads.handleResetPeriodo(anoLetivo)
           └─> DELETE /api/files?periodo=2024
               │
               └─> API Route Handler
                   │
                   ├─ ETAPA 1: Buscar Linhas do Período
                   │   └─> prisma.linhaImportada.findMany({ tipoEntidade: 'aluno' })
                   │       └─> Filtrar por anoLetivo em dadosOriginais (JSONB)
                   │
                   ├─ ETAPA 2: Coletar IDs
                   │   ├─ linhasIdsDoPeriodo: string[]
                   │   └─ arquivosIds: Set<string>
                   │
                   ├─ ETAPA 3: Marcar Entidades como fonteAusente
                   │   └─> prisma.$transaction([
                   │       prisma.aluno.updateMany({ linhaOrigemId: { in: linhasIds }, fonteAusente: true }),
                   │       prisma.enturmacao.updateMany({ linhaOrigemId: { in: linhasIds }, fonteAusente: true })
                   │     ])
                   │
                   ├─ ETAPA 4: Hard Delete dos Arquivos
                   │   └─> prisma.arquivoImportado.deleteMany({ id: { in: arquivosIds } })
                   │       └─> Cascade deleta LinhaImportada (onDelete: Cascade)
                   │
                   └─> Retorna:
                       {
                         message: "X arquivo(s) deletado(s)",
                         arquivosDeletados: number,
                         linhasDeletadas: number
                       }

2. Frontend recarrega dados
   └─> fetchData()
       └─> setPeriodos(periodos) - Remove período da UI
```

---

## COMPONENTES (Frontend)

### Estrutura de Pastas

```
src/
  components/
    MigrateUploads.tsx       # Container principal
    DropCsv.tsx              # Upload + parsing
    PeriodoCard.tsx          # Card de período com turmas
    ui/
      Button.tsx             # Botão genérico
      Modal.tsx              # Modal genérico
      Tabs.tsx               # Tabs (não usadas ainda)
```

---

### Componente Principal: MigrateUploads.tsx

**Localização:** `src/components/MigrateUploads.tsx`

**Responsabilidade:** Container principal do Painel de Migração. Gerencia estado global, carregamento de dados, upload e delete.

**Estado interno:**

```typescript
const [periodos, setPeriodos] = useState<PeriodoData[]>([]);
const [isLoading, setIsLoading] = useState(true);
const [isUploading, setIsUploading] = useState(false);
```

**Tipos:**

```typescript
type PeriodoData = {
  anoLetivo: string;
  resumo: {
    totalTurmas: number;
    totalAlunosCSV: number;
    totalAlunosBanco: number;
    pendentes: number;
    status: 'ok' | 'pendente';
  };
  turmas: TurmaData[];
};

type TurmaData = {
  nome: string;
  totalAlunosCSV: number;
  totalAlunosBanco: number;
  pendentes: number;
  status: 'ok' | 'pendente';
  alunosPendentes?: { matricula: string; nome: string }[];
};
```

**Funções principais:**

- **`fetchData()`** - Busca GET /api/files ao montar e após modificações
  - Atualiza `periodos` state
  - Controla loading

- **`handleNewFiles(data: ParsedCsv, fileName: string)`** - Callback de DropCsv
  - POST /api/files
  - Trata 409 (duplicata)
  - Recarrega dados após sucesso
  - Validação: V8.1.1 (sincronização upload)

- **`handleResetPeriodo(anoLetivo: string)`** - Delete de período
  - DELETE /api/files?periodo={anoLetivo}
  - Recarrega dados
  - Validação: V6.2.1 (hard delete de arquivos)

**Renderização:**

```tsx
<div className="space-y-3">
  <DropCsv
    title="Ata de Resultados Finais"
    requiredHeaders={ATA_HEADERS}
    duplicateKey="ALUNO"
    onParsed={handleNewFiles}
    showPreview={false}
    multiple={true}
  />

  {isLoading && <div>Carregando dados...</div>}

  {periodos.map(periodo => (
    <PeriodoCard
      key={periodo.anoLetivo}
      periodo={periodo}
      onReset={handleResetPeriodo}
    />
  ))}
</div>
```

**Validações correspondentes:**
- V8.1.1: Sincronizar upload (POST)
- V8.1.2: Exibir dados corretos após upload ⚠️ **(BUGADO - Ver Troubleshooting)**

---

### Componente: DropCsv.tsx

**Localização:** `src/components/DropCsv.tsx`

**Responsabilidade:** Upload de arquivo CSV com drag-and-drop, validação de headers, parsing tolerante e detecção de duplicatas locais.

**Props:**

```typescript
interface DropCsvProps {
  title: string;                       // Título do componente
  requiredHeaders: string[];           // Headers obrigatórios
  duplicateKey: string;                // Campo para detectar duplicatas (ex: "ALUNO")
  onParsed: (data: ParsedCsv, fileName: string) => void;  // Callback com dados parseados
  showPreview?: boolean;               // Mostrar preview da tabela (default: true)
  multiple?: boolean;                  // Aceitar múltiplos arquivos (default: false)
}
```

**Funções internas críticas:**

- **`parseCsvLoose(text: string, requiredHeaders: string[])`**
  - Parser CSV customizado, tolerante a variações
  - Remove BOM (`\uFEFF`)
  - Procura headers em qualquer linha (não só primeira)
  - Suporta aspas duplas com escape (`""`)
  - Ignora linhas completamente vazias
  - Validações: V1.1.3 (BOM), V1.1.4 (aspas), V1.2.1 (linhas vazias)

- **`splitCsvLine(line: string)`**
  - Split de linha CSV com suporte a aspas
  - Trata escape de aspas duplas (`""`)
  - Validação: V1.1.4

**Exemplo de uso:**

```typescript
<DropCsv
  title="Ata de Resultados Finais"
  requiredHeaders={["ALUNO", "NOME_COMPL", "TURMA"]}
  duplicateKey="ALUNO"
  onParsed={(data, fileName) => console.log(data)}
  multiple={true}
/>
```

**Validações correspondentes:**
- V1.1.1: Arquivo não vazio
- V1.1.2: Headers obrigatórios presentes
- V1.1.3: Parsing tolerante de BOM
- V1.1.4: Parsing de aspas duplas
- V1.2.1: Ignora linhas vazias
- V1.3.1: Detecção de duplicatas locais (múltiplos arquivos)

---

### Componente: PeriodoCard.tsx

**Localização:** `src/components/PeriodoCard.tsx`

**Responsabilidade:** Exibe informações de um período letivo com resumo de turmas e botão de reset.

**Props:**

```typescript
interface PeriodoCardProps {
  periodo: PeriodoData;
  onReset: (anoLetivo: string) => void;
}
```

**Funcionalidades:**
- Exibe resumo do período (total de turmas, alunos CSV, alunos no banco, pendentes)
- Lista turmas com status (ok/pendente)
- Botão "Resetar Período" com confirmação
- Indicador visual de status (verde/vermelho)

**Validações correspondentes:**
- V5.1.1: Exibir hierarquia (Período → Turmas)
- V5.2.1: Exibir resumo do período
- V5.3.1: Contar alunos no CSV
- V5.3.2: Contar alunos no banco

---

## APIs (Backend)

### Estrutura de Rotas

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/files` | Upload e processamento de CSV |
| GET | `/api/files` | Visualização hierárquica (Período → Turmas → Alunos) |
| DELETE | `/api/files?id={id}` | Hard delete de arquivo individual |
| DELETE | `/api/files?periodo={ano}` | Hard delete de todos os arquivos do período |

---

### API: POST /api/files

**Localização:** `src/app/api/files/route.ts` (linha 22-232)

**Responsabilidade:** Processar upload de CSV, validar duplicatas, criar registros nas 3 camadas do banco de dados.

**Request:**

```typescript
// Body
{
  data: {
    headers: string[];
    rows: Record<string, string>[];
  };
  fileName: string;
}

// Headers
{
  "Content-Type": "application/json"
}
```

**Response (Sucesso - 201):**

```typescript
{
  arquivo: {
    id: string;
    nomeArquivo: string;
    hashArquivo: string;
    tipo: string;
    status: string;
    createdAt: Date;
  };
  linhasImportadas: number;
  alunosNovos: number;
  alunosAtualizados: number;
  enturmacoesNovas: number;
}
```

**Response (Erro - 409 Conflict):**

```typescript
{
  error: "Arquivo com conteúdo idêntico já existe";
  fileId: string;
}
```

**Response (Erro - 400):**

```typescript
{
  error: "Dados inválidos";
}
```

**Response (Erro - 500):**

```typescript
{
  error: "Erro ao processar arquivo";
}
```

**Validações implementadas:**

1. ✅ **V2.1.1:** Validar presença de `data` e `fileName`
2. ✅ **V2.2.1:** Calcular hash SHA-256 dos dados (ordenados)
3. ✅ **V2.2.2:** Buscar duplicata por hash (apenas arquivos ativos)
4. ✅ **V2.2.3:** Retornar 409 se duplicado
5. ✅ **V4.1.1:** Criar `ArquivoImportado`
6. ✅ **V4.2.1:** Criar `LinhaImportada` para cada row
7. ✅ **V4.3.1:** Criar ou atualizar `Aluno` por matrícula
8. ✅ **V4.3.2:** Resetar `fonteAusente=false` se estava true
9. ✅ **V4.4.1:** Criar `Enturmacao` única por (alunoId, anoLetivo, turma, serie)
10. ✅ **V3.1.1 a V3.2.2:** Aplicar `limparValor()` em todos os campos de enturmação

**Gaps críticos:**

- ❌ **V2.4.1:** Transação completa não implementada
  - **Problema:** Se criar ArquivoImportado mas falhar em Aluno, fica estado inconsistente
  - **Solução futura:** Envolver tudo em `prisma.$transaction()`

**Exemplo de uso:**

```typescript
const response = await fetch('/api/files', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    data: {
      headers: ["Ano", "ALUNO", "NOME_COMPL", ...],
      rows: [
        { "Ano": "Ano Letivo: 2024", "ALUNO": "123456", ... },
        ...
      ]
    },
    fileName: "ata_2024_turma_3001.csv"
  })
});

const result = await response.json();
console.log(`${result.alunosNovos} alunos criados, ${result.enturmacoesNovas} enturmações criadas`);
```

---

### API: GET /api/files

**Localização:** `src/app/api/files/route.ts` (linha 244-410)

**Responsabilidade:** Retornar visualização hierárquica de períodos, turmas e alunos com identificação de pendentes.

**Request:**

```
GET /api/files
(sem parâmetros)
```

**Response (Sucesso - 200):**

```typescript
{
  periodos: [
    {
      anoLetivo: string;  // Ex: "2024"
      resumo: {
        totalTurmas: number;
        totalAlunosCSV: number;
        totalAlunosBanco: number;
        pendentes: number;
        status: 'ok' | 'pendente';
      };
      turmas: [
        {
          nome: string;  // Ex: "3001"
          totalAlunosCSV: number;
          totalAlunosBanco: number;
          pendentes: number;
          status: 'ok' | 'pendente';
          alunosPendentes?: [  // Apenas se status='pendente'
            { matricula: string; nome: string; }
          ];
        }
      ];
    }
  ];
}
```

**Algoritmo de identificação de pendentes:**

```typescript
// 1. Buscar linhas do CSV
linhasImportadas → alunosCSV (por período e turma)

// 2. Buscar alunos no banco
enturmacoes → alunosNoBanco (por período e turma)

// 3. Diferença set
alunosPendentes = alunosCSV.filter(aluno =>
  !alunosNoBanco.has(aluno.matricula)
)

// ⚠️ PROBLEMA ATUAL: Arrays vazios sendo retornados
// Ver seção Troubleshooting → Problema 2
```

**Validações implementadas:**

1. ✅ **V5.1.1:** Agrupar por hierarquia (Período → Turma)
2. ✅ **V5.2.1:** Calcular resumo do período
3. ✅ **V5.3.1:** Contar alunos no CSV
4. ✅ **V5.3.2:** Contar alunos no banco
5. ⚠️ **V5.3.3:** Identificar alunos pendentes **(BUGADO - arrays vazios)**
6. ✅ **V5.4.1:** Ordenar períodos (decrescente)
7. ✅ **V5.4.2:** Ordenar turmas (numérico)

**Gaps críticos:**

- ❌ **V5.3.3:** Alunos pendentes retornam arrays vazios
  - **Causa:** Lógica de comparação entre CSV e banco com bug
  - **Impacto:** Não identifica quais alunos faltam criar no banco
  - **Ver:** Troubleshooting → Problema 2

**Exemplo de uso:**

```typescript
const response = await fetch('/api/files');
const { periodos } = await response.json();

periodos.forEach(periodo => {
  console.log(`Período: ${periodo.anoLetivo}`);
  console.log(`  Total de turmas: ${periodo.resumo.totalTurmas}`);
  console.log(`  Alunos no CSV: ${periodo.resumo.totalAlunosCSV}`);
  console.log(`  Alunos no banco: ${periodo.resumo.totalAlunosBanco}`);
  console.log(`  Pendentes: ${periodo.resumo.pendentes}`);
});
```

---

### API: DELETE /api/files

**Localização:** `src/app/api/files/route.ts` (linha 413-548)

**Responsabilidade:** Hard delete de arquivos (individual ou por período) e marcação de `fonteAusente=true` nas entidades derivadas.

**Request:**

```
DELETE /api/files?id={arquivoId}
OU
DELETE /api/files?periodo={anoLetivo}
```

**Response (Sucesso - 200):**

```typescript
// Delete individual
{
  message: "Arquivo deletado e entidades marcadas como fonte ausente";
  alunosMarcados: number;
}

// Delete por período
{
  message: "X arquivo(s) do período {periodo} deletado(s) e entidades marcadas como fonte ausente";
  arquivosDeletados: number;
  linhasDeletadas: number;
}
```

**Response (Erro - 400):**

```typescript
{
  error: "Parâmetro id ou periodo é obrigatório";
}
```

**Comportamento:**

1. **Buscar IDs das LinhaImportada** do arquivo ou período
2. **Marcar entidades como `fonteAusente=true`:**
   - `Aluno.fonteAusente = true` (onde `linhaOrigemId` in linhasIds)
   - `Enturmacao.fonteAusente = true` (onde `linhaOrigemId` in linhasIds)
3. **Hard delete de `ArquivoImportado`:**
   - Cascade deleta `LinhaImportada` automaticamente (onDelete: Cascade no schema)
   - Remove JSONB da Camada 1, liberando espaço

**Validações implementadas:**

1. ✅ **V6.1.1:** Validar parâmetro `id` ou `periodo`
2. ✅ **V6.2.1:** Hard delete de `ArquivoImportado`
3. ✅ **V6.2.2:** Cascade delete de `LinhaImportada`
4. ✅ **V6.3.1:** Marcar `Aluno.fonteAusente = true`
5. ✅ **V6.3.2:** Marcar `Enturmacao.fonteAusente = true`
6. ✅ **V6.4.1:** Usar transaction para marcar entidades

**Gaps não-críticos:**

- ⚠️ **V6.5.1:** Permitir re-importação do mesmo arquivo (hash removido)
  - **Status:** Funciona, mas não testado explicitamente

**Exemplo de uso:**

```typescript
// Delete individual
await fetch('/api/files?id=abc123', { method: 'DELETE' });

// Delete por período (todos os arquivos de 2024)
await fetch('/api/files?periodo=2024', { method: 'DELETE' });
```

---

## FUNÇÕES CRÍTICAS

### Função: hashData()

**Localização:** `src/app/api/files/route.ts:11-19`

**Responsabilidade:** Calcular hash SHA-256 dos dados parseados do CSV para detecção de duplicatas.

**Assinatura:**

```typescript
async function hashData(data: ParsedCsv): Promise<string>
```

**Parâmetros:**

- `data`: Objeto com `headers` (string[]) e `rows` (Record<string, string>[])

**Retorno:**

- Hash SHA-256 em hexadecimal (string de 64 caracteres)

**Algoritmo:**

```typescript
// 1. Ordenar headers alfabeticamente
const sortedHeaders = data.headers.sort();

// 2. Ordenar rows por concatenação de chaves
const sortedRows = [...data.rows].sort((a, b) => {
  const keyA = Object.keys(a).map(k => `${k}:${a[k]}`).join('|');
  const keyB = Object.keys(b).map(k => `${k}:${b[k]}`).join('|');
  return keyA.localeCompare(keyB);
});

// 3. Gerar JSON e calcular hash
const str = JSON.stringify({ headers: sortedHeaders, rows: sortedRows });
return crypto.createHash('sha256').update(str).digest('hex');
```

**Por que ordenar?**

- Garantir que arquivos com mesmos dados mas ordem diferente tenham mesmo hash
- Evita duplicação quando CSV vem com linhas embaralhadas

**Exemplo:**

```typescript
const data = {
  headers: ["ALUNO", "NOME_COMPL"],
  rows: [
    { "ALUNO": "123", "NOME_COMPL": "João" },
    { "ALUNO": "456", "NOME_COMPL": "Maria" }
  ]
};

const hash = await hashData(data);
// hash = "a1b2c3d4..." (64 chars)
```

**Casos extremos tratados:**

1. Rows vazias → hash válido (JSON de array vazio)
2. Headers em ordem diferente → mesmo hash
3. Rows em ordem diferente → mesmo hash

**Validações correspondentes:**
- V2.2.1: Calcular hash dos dados
- V2.2.2: Buscar duplicata por hash

**Testes:**
- `tests/unit/lib/hash.test.ts` - V2.2.1 (a criar)

---

### Função: limparValor()

**Localização:** `src/app/api/files/route.ts:63-70` (POST) e `route.ts:235-242` (GET)

**Responsabilidade:** ⭐ **FUNÇÃO CRÍTICA** - Remover prefixos dos campos do CSV do Conexão Educação.

**Contexto:** Arquivos CSV do sistema Conexão vêm com valores prefixados:
- `"Ano Letivo: 2024"` ao invés de `"2024"`
- `"Modalidade: REGULAR"` ao invés de `"REGULAR"`
- `"Turma: 3001"` ao invés de `"3001"`
- `"Série: 3"` ao invés de `"3"`

**Sem essa limpeza:** Dados vão pro banco com prefixos → erro "value too long for column" → crash.

**Assinatura:**

```typescript
const limparValor = (valor: string | undefined, prefixo: string): string
```

**Parâmetros:**

- `valor`: Valor do campo CSV (pode ser undefined)
- `prefixo`: Prefixo esperado (ex: `"Ano Letivo:"`, `"Turma:"`)

**Retorno:**

- String limpa (sem prefixo) ou string vazia se undefined

**Implementação:**

```typescript
const limparValor = (valor: string | undefined, prefixo: string): string => {
  if (!valor) return '';
  const str = valor.toString().trim();
  if (str.startsWith(prefixo)) {
    return str.substring(prefixo.length).trim();
  }
  return str;
};
```

**Exemplo de uso:**

```typescript
// Limpeza de dados de enturmação
const anoLetivo = limparValor(row.Ano, 'Ano Letivo:');
// "Ano Letivo: 2024" → "2024"

const modalidade = limparValor(row.MODALIDADE, 'Modalidade:');
// "Modalidade: REGULAR" → "REGULAR"

const turma = limparValor(row.TURMA, 'Turma:');
// "Turma: 3001" → "3001"

const serie = limparValor(row.SERIE, 'Série:');
// "Série: 3" → "3"

const turno = limparValor(row.TURNO, 'Turno:') || null;
// "Turno: MANHÃ" → "MANHÃ"
// undefined → null
```

**Casos extremos tratados:**

1. `valor = undefined` → retorna `""`
2. `valor = ""` → retorna `""`
3. `valor = "  "` (apenas espaços) → retorna `""`
4. Valor sem prefixo → retorna valor original

**⚠️ IMPORTANTE:** Sempre usar `limparValor()` ao processar dados de CSV para criar enturmações ou qualquer registro estruturado.

**Onde usar:**

- ✅ POST /api/files - criação de Enturmacao (linha 170-174)
- ✅ GET /api/files - leitura de dadosOriginais (linha 286-289)
- ✅ DELETE /api/files - filtrar por período (linha 492-493)
- ✅ Qualquer script de migração ou processamento de CSV

**Validações correspondentes:**
- V3.1.1: Remover "Ano Letivo: " de anoLetivo
- V3.1.2: Remover "Modalidade: " de modalidade
- V3.1.3: Remover "Turma: " de turma
- V3.1.4: Remover "Série: " de serie
- V3.2.1: Remover "Turno: " de turno
- V3.2.2: Converter turno vazio para null

**Testes:**
- `tests/unit/lib/limparValor.test.ts` - V3.1.1 a V3.2.2 (a criar)

---

### Função: parseCsvLoose()

**Localização:** `src/components/DropCsv.tsx` (função interna)

**Responsabilidade:** Parser CSV customizado e tolerante a variações do formato CSV exportado pelo sistema Conexão Educação.

**Assinatura:**

```typescript
function parseCsvLoose(
  text: string,
  requiredHeaders: string[]
): { headers: string[]; rows: Record<string, string>[] }
```

**Características:**

- ✅ Remove BOM (Byte Order Mark: `\uFEFF`)
- ✅ Procura headers em qualquer linha (não só primeira)
- ✅ Suporta aspas duplas com escape (`""`)
- ✅ Ignora linhas completamente vazias
- ✅ Tolerante a espaços extras

**Algoritmo:**

```typescript
// 1. Remover BOM
lines = lines.map(l => l.replace(/\uFEFF/g, ""));

// 2. Procurar headers em qualquer linha
for (const line of lines) {
  const cols = splitCsvLine(line);
  const headerSet = new Set(cols.map(c => c.trim()));
  const missing = requiredHeaders.filter(h => !headerSet.has(h));

  if (missing.length === 0) {
    headers = cols;
    break;
  }
}

// 3. Processar rows
for (const line of lines.slice(headerLineIndex + 1)) {
  if (isBlank(line)) continue;  // Ignora vazias

  const cols = splitCsvLine(line);
  const row: Record<string, string> = {};

  headers.forEach((header, i) => {
    row[header] = cols[i] || "";
  });

  rows.push(row);
}
```

**Exemplo:**

```typescript
const csvText = `
Ano,ALUNO,NOME_COMPL
"Ano Letivo: 2024","123456","João Silva"
"Ano Letivo: 2024","789012","Maria ""A"" Santos"
`;

const result = parseCsvLoose(csvText, ["Ano", "ALUNO", "NOME_COMPL"]);

// result = {
//   headers: ["Ano", "ALUNO", "NOME_COMPL"],
//   rows: [
//     { "Ano": "Ano Letivo: 2024", "ALUNO": "123456", "NOME_COMPL": "João Silva" },
//     { "Ano": "Ano Letivo: 2024", "ALUNO": "789012", "NOME_COMPL": "Maria \"A\" Santos" }
//   ]
// }
```

**Validações correspondentes:**
- V1.1.3: Parsing tolerante de BOM
- V1.1.4: Parsing de aspas duplas
- V1.2.1: Ignora linhas vazias

**Testes:**
- `tests/unit/components/parseCsv.test.ts` - V1.1.3, V1.1.4, V1.2.1 (a criar)

---

## BANCO DE DADOS

### Models Prisma

**Localização:** `prisma/schema.prisma`

---

#### Model: ArquivoImportado (Camada 1 - Origem)

```prisma
model ArquivoImportado {
  id           String   @id @default(cuid())
  nomeArquivo  String   // Nome original do arquivo (ex: "ata_2024_3001.csv")
  hashArquivo  String   // SHA-256 dos dados parseados (para detectar duplicatas)
  tipo         String   // Tipo de arquivo (ex: "alunos", "historico")
  status       String   @default("ativo")  // "ativo" ou "excluido" (soft delete)
  excluidoEm   DateTime?  // Data de exclusão (soft delete)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  // Relações
  linhas       LinhaImportada[]  // 1:N - Cascade delete

  @@index([hashArquivo])
  @@index([status])
}
```

**Descrição dos campos:**

- `id`: Identificador único (CUID)
- `nomeArquivo`: Nome do arquivo enviado pelo usuário
- `hashArquivo`: Hash SHA-256 dos dados para detectar duplicatas
- `tipo`: Categoria do arquivo (sempre "alunos" atualmente)
- `status`: "ativo" (visível) ou "excluido" (soft delete) - ⚠️ **NÃO USADO MAIS** (hard delete)
- `excluidoEm`: Timestamp de exclusão (soft delete) - ⚠️ **NÃO USADO MAIS**

**Relações:**

- `linhas` → `LinhaImportada[]` (1:N, onDelete: Cascade)

**Índices:**

```prisma
@@index([hashArquivo])  // Busca rápida de duplicatas
@@index([status])       // Filtro de arquivos ativos
```

**Queries comuns:**

```typescript
// Buscar duplicata
const duplicata = await prisma.arquivoImportado.findFirst({
  where: { hashArquivo: hash, status: 'ativo' }
});

// Criar arquivo
const arquivo = await prisma.arquivoImportado.create({
  data: {
    nomeArquivo: 'ata_2024_3001.csv',
    hashArquivo: 'a1b2c3...',
    tipo: 'alunos'
  }
});

// Hard delete (remove também as linhas via cascade)
await prisma.arquivoImportado.delete({
  where: { id: 'abc123' }
});
```

---

#### Model: LinhaImportada (Camada 1 - Origem)

```prisma
model LinhaImportada {
  id                 String   @id @default(cuid())
  arquivoId          String   // FK → ArquivoImportado
  numeroLinha        Int      // Número da linha no CSV (0-indexed)
  dadosOriginais     Json     // JSONB com todos os campos da linha (imutável)
  identificadorChave String?  // Matrícula do aluno (para queries rápidas)
  tipoEntidade       String   // "aluno" (para futura expansão)
  createdAt          DateTime @default(now())

  // Relações
  arquivo            ArquivoImportado @relation(fields: [arquivoId], references: [id], onDelete: Cascade)

  @@index([arquivoId])
  @@index([identificadorChave])
}
```

**Descrição dos campos:**

- `id`: Identificador único (CUID)
- `arquivoId`: Referência ao arquivo de origem (FK)
- `numeroLinha`: Índice da linha no array `data.rows` (0-indexed)
- `dadosOriginais`: **JSONB** com todos os campos da linha exatamente como vieram do CSV
  - Inclui prefixos: `"Ano Letivo: 2024"`, `"Turma: 3001"`, etc
  - Imutável - nunca modificado após criação
- `identificadorChave`: Matrícula do aluno (duplicado para performance em queries)
- `tipoEntidade`: Sempre "aluno" (preparação para futuros tipos)

**Relações:**

- `arquivo` → `ArquivoImportado` (N:1, onDelete: Cascade)

**Índices:**

```prisma
@@index([arquivoId])           // Busca por arquivo
@@index([identificadorChave])  // Busca por matrícula
```

**Queries comuns:**

```typescript
// Buscar linhas de um arquivo
const linhas = await prisma.linhaImportada.findMany({
  where: { arquivoId: 'abc123' },
  select: { id: true, dadosOriginais: true }
});

// Criar linha
const linha = await prisma.linhaImportada.create({
  data: {
    arquivoId: 'abc123',
    numeroLinha: 0,
    dadosOriginais: { "Ano": "Ano Letivo: 2024", ... },
    identificadorChave: '123456',
    tipoEntidade: 'aluno'
  }
});

// Buscar linhas de alunos ativos
const linhas = await prisma.linhaImportada.findMany({
  where: {
    tipoEntidade: 'aluno',
    arquivo: { status: 'ativo' }
  },
  select: {
    identificadorChave: true,
    dadosOriginais: true
  }
});
```

---

#### Model: Aluno (Camada 2 - Estruturada)

```prisma
model Aluno {
  id              String   @id @default(cuid())
  matricula       String   @unique  // Matrícula de 15 dígitos (CENSO)
  nome            String?
  sexo            String?
  dataNascimento  DateTime?
  // ... (muitos outros campos)

  // Metadados de origem
  origemTipo      String   @default("manual")  // "csv" ou "manual"
  linhaOrigemId   String?  // FK → LinhaImportada (pode ser null)
  fonteAusente    Boolean  @default(false)  // true se CSV foi deletado

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  // Relações
  enturmacoes     Enturmacao[]
  linhaOrigem     LinhaImportada? @relation(fields: [linhaOrigemId], references: [id], onDelete: SetNull)

  @@index([matricula])
  @@index([nome])
}
```

**Descrição dos campos de metadados:**

- `origemTipo`: "csv" (importado) ou "manual" (criado manualmente)
- `linhaOrigemId`: Referência à linha do CSV de origem (pode ser null)
- `fonteAusente`: Indica se o CSV de origem foi deletado (true) ou ainda existe (false)

**Comportamento de `fonteAusente`:**

1. **Upload:** `fonteAusente = false` (origem presente)
2. **Delete de arquivo:** `fonteAusente = true` (origem ausente)
3. **Re-upload do mesmo CSV:** `fonteAusente = false` (origem restaurada)

**Relações:**

- `enturmacoes` → `Enturmacao[]` (1:N) - um aluno pode ter múltiplas enturmações
- `linhaOrigem` → `LinhaImportada` (N:1, onDelete: SetNull) - preserva aluno se CSV deletado

**Queries comuns:**

```typescript
// Buscar aluno por matrícula
const aluno = await prisma.aluno.findUnique({
  where: { matricula: '123456' },
  include: { enturmacoes: true }
});

// Criar aluno
const aluno = await prisma.aluno.create({
  data: {
    matricula: '123456',
    nome: 'João Silva',
    origemTipo: 'csv',
    linhaOrigemId: 'linha-id',
    fonteAusente: false
  }
});

// Marcar aluno como fonte ausente
await prisma.aluno.update({
  where: { id: 'aluno-id' },
  data: { fonteAusente: true }
});

// Resetar fonte ausente (re-importação)
await prisma.aluno.update({
  where: { id: 'aluno-id' },
  data: {
    linhaOrigemId: 'nova-linha-id',
    fonteAusente: false
  }
});
```

---

#### Model: Enturmacao (Camada 2 - Estruturada)

```prisma
model Enturmacao {
  id            String   @id @default(cuid())
  alunoId       String   // FK → Aluno
  anoLetivo     String   // Ex: "2024" (SEM prefixo)
  regime        Int      // 0 (anual), 1 (1º sem), 2 (2º sem)
  modalidade    String   // Ex: "REGULAR" (SEM prefixo)
  turma         String   // Ex: "3001" (SEM prefixo)
  serie         String   // Ex: "3" (SEM prefixo)
  turno         String?  // Ex: "MANHÃ" (SEM prefixo, pode ser null)

  // Metadados de origem
  origemTipo    String   @default("manual")  // "csv" ou "manual"
  linhaOrigemId String?  // FK → LinhaImportada (pode ser null)
  fonteAusente  Boolean  @default(false)  // true se CSV foi deletado

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  // Relações
  aluno         Aluno    @relation(fields: [alunoId], references: [id], onDelete: Cascade)
  linhaOrigem   LinhaImportada? @relation(fields: [linhaOrigemId], references: [id], onDelete: SetNull)

  @@unique([alunoId, anoLetivo, turma, serie])  // Uma enturmação única por aluno/ano/turma/série
  @@index([anoLetivo])
  @@index([turma])
}
```

**⚠️ IMPORTANTE:** Todos os campos (anoLetivo, modalidade, turma, serie, turno) são armazenados **SEM prefixos** graças à função `limparValor()`.

**Descrição dos campos:**

- `alunoId`: FK → Aluno (cascade delete se aluno deletado)
- `anoLetivo`: Ano letivo limpo (ex: "2024", não "Ano Letivo: 2024")
- `regime`: 0 (anual), 1 (1º semestre), 2 (2º semestre)
- `modalidade`: Limpa (ex: "REGULAR", não "Modalidade: REGULAR")
- `turma`: Limpa (ex: "3001", não "Turma: 3001")
- `serie`: Limpa (ex: "3", não "Série: 3")
- `turno`: Limpa (ex: "MANHÃ" ou null)

**Constraint de unicidade:**

```prisma
@@unique([alunoId, anoLetivo, turma, serie])
```

- Um aluno só pode ter UMA enturmação por ano/turma/série
- Evita duplicação ao re-importar CSV

**Queries comuns:**

```typescript
// Buscar enturmações de um aluno
const enturmacoes = await prisma.enturmacao.findMany({
  where: { alunoId: 'aluno-id' },
  orderBy: { anoLetivo: 'desc' }
});

// Criar enturmação
const ent = await prisma.enturmacao.create({
  data: {
    alunoId: 'aluno-id',
    anoLetivo: '2024',  // LIMPO
    regime: 0,
    modalidade: 'REGULAR',  // LIMPO
    turma: '3001',  // LIMPO
    serie: '3',  // LIMPO
    turno: 'MANHÃ',  // LIMPO
    origemTipo: 'csv',
    linhaOrigemId: 'linha-id'
  }
});

// Verificar se enturmação já existe
const existente = await prisma.enturmacao.findFirst({
  where: {
    alunoId: 'aluno-id',
    anoLetivo: '2024',
    turma: '3001',
    serie: '3'
  }
});
```

---

## DECISÕES TÉCNICAS

### Decisão 1: Arquitetura de 3 Camadas no Banco de Dados

**Contexto:** Precisávamos importar CSVs e permitir edição de dados, mas também rastrear origem e permitir re-importação.

**Opções consideradas:**

1. **Opção A: Camada Única (apenas Aluno/Enturmacao)**
   - Prós: Simples, rápido de implementar
   - Contras: Perde dados originais, não detecta duplicatas, não permite re-importação

2. **Opção B: 2 Camadas (Origem imutável + Estruturada editável)**
   - Prós: Preserva original, permite edição
   - Contras: Sem histórico de mudanças

3. **Opção C: 3 Camadas (Origem + Estruturada + Auditoria)** ✅
   - Prós: Rastreabilidade completa, permite re-importação, histórico de edições
   - Contras: Mais complexo, mais storage

**Decisão:** Escolhemos **Opção C (3 Camadas)**

**Justificativa:**

- Dados educacionais são críticos - precisam de rastreabilidade
- Usuários vão corrigir erros manualmente - preciso de histórico
- Sistema Conexão pode ter bugs - preciso comparar original vs editado
- Re-importação é essencial para correção de dados em lote

**Trade-offs aceitos:**

- Maior uso de storage (JSONB em LinhaImportada)
- Queries mais complexas (joins entre camadas)
- Migrations mais difíceis (3 models interdependentes)

**Impacto:**

- POST /api/files cria registros em 3 models (ArquivoImportado, LinhaImportada, Aluno)
- DELETE precisa marcar `fonteAusente=true` antes de deletar Origem
- UI precisa mostrar indicador de fonte ausente

---

### Decisão 2: Hard Delete ao invés de Soft Delete

**Contexto:** Inicialmente implementamos soft delete (status='excluido'), mas descobrimos que impedia re-importação do mesmo arquivo.

**Opções consideradas:**

1. **Opção A: Soft Delete (status='excluido')** ❌
   - Prós: Recuperável, histórico permanente
   - Contras: Hash permanece no banco → bloqueia re-importação

2. **Opção B: Hard Delete de ArquivoImportado + Cascade para LinhaImportada** ✅
   - Prós: Libera hash → permite re-importação, libera storage (JSONB)
   - Contras: Não recuperável

3. **Opção C: Hard Delete + Backup em tabela separada**
   - Prós: Recuperável, permite re-importação
   - Contras: Complexidade extra, storage duplicado

**Decisão:** Escolhemos **Opção B (Hard Delete)**

**Justificativa:**

- Re-importação é caso de uso crítico (correção de bugs do Conexão)
- Storage de JSONB cresce rápido - liberar espaço é importante
- Entidades estruturadas (Aluno/Enturmacao) são preservadas com `fonteAusente=true`
- Dados realmente importantes (editados) estão na Camada 2 (não deletados)

**Trade-offs aceitos:**

- Não é possível recuperar arquivo deletado (usuário precisa fazer novo upload)
- Histórico de importação não é permanente (apenas registros ativos)

**Impacto:**

- DELETE /api/files remove ArquivoImportado (cascade LinhaImportada)
- `linhaOrigemId` vira NULL (onDelete: SetNull)
- `fonteAusente=true` indica origem perdida
- Re-upload do mesmo arquivo é permitido (hash foi removido)

**Código:**

```typescript
// Hard delete
await prisma.arquivoImportado.delete({
  where: { id: 'abc123' }
});
// Cascade deleta LinhaImportada automaticamente
// Aluno/Enturmacao preservados com fonteAusente=true
```

---

### Decisão 3: Parser CSV Customizado (parseCsvLoose) ao invés de Biblioteca

**Contexto:** Arquivos do Conexão Educação têm variações (BOM, headers em linha aleatória, linhas vazias).

**Opções consideradas:**

1. **Opção A: Papa Parse (biblioteca popular)**
   - Prós: Testado, rápido, bem documentado
   - Contras: Rígido, não busca headers em linha aleatória, 44KB minified

2. **Opção B: csv-parse (Node.js)**
   - Prós: Nativo do Node, rápido
   - Contras: Apenas backend (não funciona no browser), não busca headers

3. **Opção C: Parser customizado (parseCsvLoose)** ✅
   - Prós: Controle total, tolerante, sem dependências, ~200 linhas
   - Contras: Precisa de testes próprios, pode ter bugs desconhecidos

**Decisão:** Escolhemos **Opção C (Parser customizado)**

**Justificativa:**

- CSVs do Conexão têm formato não-padrão (headers não na linha 1)
- Precisamos de parsing no cliente (DropCsv é client-side)
- Queremos evitar dependências externas (bundle size)
- Controle total permite adicionar lógica customizada (ex: validação inline)

**Trade-offs aceitos:**

- Responsabilidade de manter código de parsing
- Possíveis bugs em casos extremos (precisam ser testados)
- Performance pode ser inferior a bibliotecas otimizadas

**Impacto:**

- `parseCsvLoose()` em DropCsv.tsx (client-side)
- `splitCsvLine()` para processar linhas com aspas
- Precisa de testes unitários abrangentes

---

### Decisão 4: Função limparValor() Duplicada em POST e GET

**Contexto:** Função `limparValor()` aparece em 2 lugares no código: POST (linha 63-70) e GET (linha 235-242).

**Opções consideradas:**

1. **Opção A: Manter duplicado** (status atual)
   - Prós: Zero refatoração, funciona
   - Contras: DRY violation, risco de divergência

2. **Opção B: Extrair para src/lib/csv.ts** ✅ (recomendado)
   - Prós: DRY, testável, reutilizável
   - Contras: Precisa de refatoração

3. **Opção C: Extrair para Prisma middleware**
   - Prós: Automático em toda query
   - Contras: Overhead de performance, complexidade

**Decisão:** **Opção A (temporária) → migrar para Opção B**

**Justificativa:**

- Inicialmente duplicado por velocidade de desenvolvimento
- Precisa ser refatorado para `src/lib/csv.ts`
- Função crítica - merece arquivo próprio + testes

**Plano de refatoração:**

```typescript
// src/lib/csv.ts
export function limparValor(valor: string | undefined, prefixo: string): string {
  if (!valor) return '';
  const str = valor.toString().trim();
  if (str.startsWith(prefixo)) {
    return str.substring(prefixo.length).trim();
  }
  return str;
}

export function limparCamposEnturmacao(dados: Record<string, string>) {
  return {
    anoLetivo: limparValor(dados.Ano, 'Ano Letivo:') || limparValor(dados.Ano, 'Ano:'),
    modalidade: limparValor(dados.MODALIDADE, 'Modalidade:'),
    turma: limparValor(dados.TURMA, 'Turma:'),
    serie: limparValor(dados.SERIE, 'Série:'),
    turno: limparValor(dados.TURNO, 'Turno:') || null
  };
}
```

**Impacto:**

- Reduz duplicação
- Facilita testes (um lugar só)
- Permite adicionar mais lógica de limpeza no futuro

---

## DEPENDÊNCIAS

### Dependências de Produção

```json
{
  "@prisma/client": "^6.18.0",   // ORM para PostgreSQL
  "next": "16.0.0",               // Framework React + API Routes
  "react": "19.2.0",              // UI library
  "react-dom": "19.2.0",          // React DOM renderer
  "lucide-react": "^0.552.0"      // Ícones SVG
}
```

**Nota:** Não usa bibliotecas de CSV (parsing customizado)

### Dependências de Desenvolvimento

```json
{
  "prisma": "^6.18.0",           // CLI do Prisma (migrations)
  "typescript": "^5",            // TypeScript compiler
  "@types/node": "^20",          // Types do Node.js
  "@types/react": "^19",         // Types do React
  "@types/react-dom": "^19",     // Types do React DOM
  "tailwindcss": "^4",           // CSS utility-first
  "@tailwindcss/postcss": "^4",  // PostCSS plugin
  "eslint": "^9",                // Linter
  "eslint-config-next": "16.0.0" // ESLint config do Next.js
}
```

**Nota:** Não tem framework de testes ainda (Vitest/Playwright pendentes)

---

## CONFIGURAÇÕES

### Variáveis de Ambiente

**Localização:** `.env.local` (não commitado)

```bash
# Banco de Dados
DATABASE_URL=postgresql://user:password@localhost:5432/dbname

# Next.js
PORT=3006  # Porta do dev server (opcional)
```

**Nota:** `DATABASE_URL` é usado pelo Prisma Client

---

## PERFORMANCE

### Otimizações Implementadas

1. **Índices de Banco de Dados:**
   - **Onde:** Models Prisma (ArquivoImportado, LinhaImportada, Aluno, Enturmacao)
   - **Técnica:** Índices em campos de busca frequente
   - **Impacto:** Queries 10-100x mais rápidas
   - **Exemplos:**
     ```prisma
     @@index([hashArquivo])           // ArquivoImportado - busca duplicatas
     @@index([identificadorChave])    // LinhaImportada - busca por matrícula
     @@index([matricula])             // Aluno - busca por matrícula
     @@index([anoLetivo])             // Enturmacao - filtro por período
     ```

2. **Ordenação no Hash (hashData):**
   - **Onde:** `route.ts:11-19`
   - **Técnica:** Ordenar headers e rows antes de calcular hash
   - **Impacto:** Detecção de duplicatas funciona independente da ordem
   - **Trade-off:** +10-20ms no cálculo do hash (aceitável)

3. **JSONB para Dados Originais:**
   - **Onde:** `LinhaImportada.dadosOriginais`
   - **Técnica:** JSONB ao invés de colunas separadas
   - **Impacto:** Flexibilidade total + queries JSON (GIN index futuro)
   - **Trade-off:** Queries JSONB são mais lentas que colunas normais

### Gargalos Conhecidos

1. **Criação Individual de LinhaImportada:**
   - **Onde:** POST /api/files (linha 83-91)
   - **Problema:** Loop com `prisma.linhaImportada.create()` individual
   - **Impacto:** ~500ms para 100 linhas (aceitável), mas poderia ser <50ms
   - **Solução futura:** Usar `prisma.linhaImportada.createMany()` - Gap V4.2.2

2. **Busca de Aluno por Matrícula (N queries):**
   - **Onde:** POST /api/files (linha 128-130)
   - **Problema:** Loop com `prisma.aluno.findUnique()` individual
   - **Impacto:** ~300ms para 100 alunos
   - **Solução futura:** Buscar todos de uma vez (`findMany({ where: { matricula: { in: [...] } } })`)

3. **Verificação de Enturmação Existente (N queries):**
   - **Onde:** POST /api/files (linha 178-186)
   - **Problema:** Loop com `prisma.enturmacao.findFirst()` individual
   - **Impacto:** ~400ms para 100 enturmações
   - **Solução futura:** Usar `upsert` ou buscar todas de uma vez

**Total de overhead atual:** ~1.2s para importar CSV de 100 alunos (aceitável para uso local)

---

## SEGURANÇA

### Medidas Implementadas

1. **Validação de Payload (Backend):**
   - **Onde:** POST /api/files (linha 27-32)
   - **Protege contra:** Payloads malformados, SQL injection via campos vazios
   - **Implementação:**
     ```typescript
     if (!data || !fileName) {
       return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 });
     }
     ```

2. **Detecção de Duplicatas por Hash:**
   - **Onde:** POST /api/files (linha 34-50)
   - **Protege contra:** Importação acidental de dados duplicados
   - **Implementação:** Hash SHA-256 dos dados parseados

3. **JSONB Storage (Sem Execução de Código):**
   - **Onde:** LinhaImportada.dadosOriginais
   - **Protege contra:** Injeção de código JavaScript (JSONB não executa código)
   - **Implementação:** Prisma armazena como JSON puro no PostgreSQL

### Vulnerabilidades Conhecidas

1. **Falta de Autenticação/Autorização:**
   - **Risco:** Alto
   - **Descrição:** API Routes não verificam usuário logado - qualquer um pode fazer upload/delete
   - **Mitigação planejada:** Implementar NextAuth.js ou similar

2. **Falta de Rate Limiting:**
   - **Risco:** Médio
   - **Descrição:** Atacante pode fazer upload infinito de CSVs grandes
   - **Mitigação planejada:** Middleware de rate limiting (ex: `next-rate-limit`)

3. **Falta de Validação de Schema CSV:**
   - **Risco:** Baixo
   - **Descrição:** Backend aceita qualquer JSON como `data.rows` (poderia ter campos extras maliciosos)
   - **Mitigação planejada:** Validar com Zod schema antes de processar

---

## DEBUGGING

### Logs Importantes

**Localização:** Console do browser (frontend) e terminal do servidor (backend)

**Logs do Frontend (MigrateUploads.tsx):**

```typescript
console.log('Upload concluído:', result);  // Linha 96
// Output: { arquivo: {...}, linhasImportadas: 100, alunosNovos: 50, ... }

console.log(result.message);  // Linha 121 (delete período)
// Output: "3 arquivo(s) do período 2024 deletado(s)..."
```

**Logs do Backend (route.ts):**

```typescript
console.error('Erro ao fazer upload:', error);  // Linha 226
console.error('Erro ao listar arquivos:', error);  // Linha 405
console.error('Erro ao excluir arquivo:', error);  // Linha 542
```

**Como ativar logs detalhados:**

```typescript
// Adicionar no início de route.ts
const DEBUG = process.env.DEBUG === 'true';

if (DEBUG) {
  console.log('[POST /api/files] Recebido:', { fileName, rowCount: data.rows.length });
  console.log('[POST /api/files] Hash calculado:', dataHash);
  console.log('[POST /api/files] Alunos criados:', alunosNovos);
}
```

### Ferramentas de Debug

1. **Prisma Studio:**
   - **Comando:** `pnpx prisma studio`
   - **Uso:** Visualizar e editar dados do banco via interface web (http://localhost:5555)
   - **Útil para:** Verificar se dados foram importados corretamente, inspecionar JSONB

2. **Next.js DevTools:**
   - **Como acessar:** Automático no modo dev (`pnpm dev`)
   - **Uso:** Ver requests/responses de API Routes, erros de compilação

3. **PostgreSQL Logs:**
   - **Onde:** Configurar `log_statement = 'all'` no `postgresql.conf`
   - **Uso:** Ver todas as queries SQL executadas pelo Prisma

4. **React DevTools (Browser Extension):**
   - **Uso:** Inspecionar estado de `MigrateUploads` (periodos, isLoading, isUploading)

---

## TESTES

### Estrutura de Testes (Planejada)

```
tests/
  unit/
    lib/
      hash.test.ts              # hashData() - V2.2.1
      limparValor.test.ts       # limparValor() - V3.1.1 a V3.2.2
    components/
      DropCsv.test.ts           # parseCsvLoose() - V1.1.x
      MigrateUploads.test.ts    # Lógica de estado
    utils/
      parseCsv.test.ts          # Parser CSV - V1.1.3, V1.1.4, V1.2.1

  integration/
    api/
      files.post.test.ts        # POST /api/files - V2.x, V4.x
      files.get.test.test.ts    # GET /api/files - V5.x
      files.delete.test.ts      # DELETE /api/files - V6.x

  e2e/
    migracao/
      upload-fluxo-completo.spec.ts  # Fluxo end-to-end: upload → visualizar → delete

  helpers/
    prisma-mock.ts            # Mock do Prisma Client para testes
    csv-fixtures.ts           # CSVs de teste (válidos e inválidos)

  fixtures/
    ata-2024-3001-valido.csv       # CSV válido (100 linhas)
    ata-2024-com-prefixos.csv      # CSV com "Ano Letivo:", etc
    ata-com-bom.csv                # CSV com BOM (\uFEFF)
    ata-headers-linha-5.csv        # Headers não na linha 1
    ata-duplicatas.csv             # Alunos duplicados
```

### Comandos de Teste (Planejados)

```bash
# Rodar todos os testes
pnpm test

# Rodar testes específicos
pnpm test hash          # Apenas hash.test.ts
pnpm test limparValor   # Apenas limparValor.test.ts

# Coverage
pnpm test:coverage

# Watch mode
pnpm test:watch

# E2E (Playwright)
pnpm test:e2e
```

### Prioridade de Implementação de Testes

**Fase 1 - Funções Críticas (Alta prioridade):**

1. ✅ `tests/unit/lib/limparValor.test.ts` - V3.1.1 a V3.2.2
   - **Por quê:** Função crítica que pode quebrar importação inteira
   - **Casos:** Prefixos, undefined, strings vazias, valores sem prefixo

2. ✅ `tests/unit/lib/hash.test.ts` - V2.2.1
   - **Por quê:** Detecção de duplicatas depende disso
   - **Casos:** Ordem diferente de rows/headers, dados idênticos, dados diferentes

3. ✅ `tests/unit/components/parseCsv.test.ts` - V1.1.3, V1.1.4, V1.2.1
   - **Por quê:** Parser customizado precisa ser robusto
   - **Casos:** BOM, aspas duplas, linhas vazias, headers em linha 5

**Fase 2 - APIs (Média prioridade):**

4. ✅ `tests/integration/api/files.post.test.ts` - V2.x, V4.x
   - **Por quê:** Validar fluxo completo de upload
   - **Casos:** CSV válido, duplicata, dados inválidos, transação rollback

5. ✅ `tests/integration/api/files.get.test.ts` - V5.x
   - **Por quê:** Validar hierarquia e identificação de pendentes
   - **Casos:** Múltiplos períodos, turmas vazias, alunos pendentes

**Fase 3 - E2E (Baixa prioridade):**

6. ✅ `tests/e2e/migracao/upload-fluxo-completo.spec.ts`
   - **Por quê:** Garantir que UI funciona end-to-end
   - **Casos:** Upload → visualizar → resetar período → re-upload

---

## MANUTENÇÃO

### Tarefas Recorrentes

1. **Limpeza de dados antigos (manual):**
   - **Frequência:** Conforme necessário
   - **Como executar:** Via Prisma Studio ou SQL direto
   - **Comando:**
     ```sql
     -- Deletar arquivos mais antigos que 1 ano (hard delete)
     DELETE FROM "ArquivoImportado"
     WHERE "createdAt" < NOW() - INTERVAL '1 year';
     ```

2. **Verificação de integridade referencial:**
   - **Frequência:** Após migrations
   - **Como executar:**
     ```sql
     -- Verificar alunos com linhaOrigemId inválido
     SELECT * FROM "Aluno"
     WHERE "linhaOrigemId" IS NOT NULL
       AND NOT EXISTS (
         SELECT 1 FROM "LinhaImportada" WHERE id = "Aluno"."linhaOrigemId"
       );

     -- Deveria retornar 0 rows (todos com fonteAusente=true)
     ```

### Migrations de Banco

```bash
# Criar migration após alterar schema.prisma
pnpx prisma migrate dev --name adicionar-campo-observacoes

# Aplicar migrations em produção
pnpx prisma migrate deploy

# Resetar banco (DEV ONLY! - PERDE TODOS OS DADOS)
pnpx prisma migrate reset

# Ver status de migrations
pnpx prisma migrate status

# Abrir Prisma Studio
pnpx prisma studio
```

**⚠️ CUIDADO:** `prisma migrate reset` deleta TODOS os dados. Nunca usar em produção.

---

## EXTENSIBILIDADE

### Como Adicionar Novo Tipo de CSV (ex: Histórico Escolar)

1. **Adicionar constante de headers:**
   ```typescript
   // src/components/MigrateUploads.tsx
   const HISTORICO_HEADERS = [
     "ALUNO",
     "DISCIPLINA",
     "NOTA_1BIM",
     "NOTA_2BIM",
     // ...
   ];
   ```

2. **Criar novo componente DropCsv:**
   ```tsx
   <DropCsv
     title="Histórico Escolar"
     requiredHeaders={HISTORICO_HEADERS}
     duplicateKey="ALUNO"
     onParsed={handleHistoricoUpload}
     multiple={true}
   />
   ```

3. **Criar model Prisma:**
   ```prisma
   model HistoricoEscolar {
     id              String @id @default(cuid())
     alunoId         String
     disciplina      String
     nota1Bim        Float?
     // ...

     aluno           Aluno @relation(...)
     linhaOrigemId   String?
     linhaOrigem     LinhaImportada? @relation(...)
   }
   ```

4. **Atualizar POST /api/files:**
   ```typescript
   // Detectar tipo de CSV pelos headers
   const tipo = data.headers.includes('NOTA_1BIM') ? 'historico' : 'alunos';

   // Processar conforme tipo
   if (tipo === 'historico') {
     // Criar HistoricoEscolar ao invés de Enturmacao
   }
   ```

5. **Atualizar ESPECIFICACAO.md:**
   - Adicionar validações V9.x para Histórico Escolar

### Pontos de Extensão

- **Parser CSV:** Modificar `parseCsvLoose()` para suportar mais variações
- **Hash:** Mudar algoritmo de SHA-256 para outro (ex: MD5, xxHash)
- **Visualização:** Adicionar mais níveis na hierarquia (ex: Período → Modalidade → Turma)
- **Exportação:** Adicionar API GET /api/files/export para baixar dados como CSV novamente

---

## TROUBLESHOOTING

### Problema 1: Erro "value too long for column" ao fazer upload

**Sintomas:**

```
ERROR: value too long for type character varying(10)
DETAIL: Failed to insert into column "anoLetivo" (value: "Ano Letivo: 2024")
```

**Causa:** Função `limparValor()` não foi chamada ou está bugada.

**Solução:**

```typescript
// ✅ CORRETO
const anoLetivo = limparValor(row.Ano, 'Ano Letivo:');
// "Ano Letivo: 2024" → "2024"

// ❌ ERRADO (causa o erro)
const anoLetivo = row.Ano;
// "Ano Letivo: 2024" → muito longo para coluna de 10 caracteres
```

**Verificação:**

1. Abrir `route.ts` (linha 170-174)
2. Conferir se `limparValor()` está sendo chamado para TODOS os campos:
   - anoLetivo
   - modalidade
   - turma
   - serie
   - turno

---

### Problema 2: Visualização mostra "0 pendentes" mesmo com alunos faltando no banco

**Sintomas:**

```json
{
  "periodos": [
    {
      "anoLetivo": "2024",
      "resumo": {
        "totalAlunosCSV": 100,
        "totalAlunosBanco": 50,
        "pendentes": 0,  // ❌ ERRADO - deveria ser 50
        "status": "ok"   // ❌ ERRADO - deveria ser "pendente"
      }
    }
  ]
}
```

**Causa:** Lógica de identificação de pendentes em GET /api/files (linha 359-361) tem bug.

**Gap relacionado:** V5.3.3 (identificar alunos pendentes)

**Solução (a implementar):**

```typescript
// ATUAL (BUGADO)
const alunosPendentes = alunosCSV.filter(
  aluno => !alunosNoBanco.has(aluno.matricula)
);

// CORRIGIDO (verificar implementação real em route.ts:359-361)
// 1. Confirmar que alunosNoBanco é Set<string> com matrículas
// 2. Conferir se alunosCSV tem campo 'matricula' populado
// 3. Adicionar log para debug:
console.log('alunosCSV:', alunosCSV.map(a => a.matricula));
console.log('alunosNoBanco:', Array.from(alunosNoBanco));
```

**Verificação:**

1. Abrir Prisma Studio: `pnpx prisma studio`
2. Conferir quantos alunos tem na tabela `Aluno`
3. Conferir quantas `LinhaImportada` existem
4. Comparar: se LinhaImportada > Aluno, há pendentes

---

### Problema 3: Upload de arquivo duplicado não mostra erro (aceita silenciosamente)

**Sintomas:**

- Upload do mesmo CSV novamente não mostra erro
- Dados são duplicados no banco

**Causa:** Hash não está sendo calculado corretamente ou verificação de duplicata não funciona.

**Solução:**

1. Verificar se `hashData()` está sendo chamado (linha 35)
2. Verificar query de duplicata (linha 38-43):
   ```typescript
   const existing = await prisma.arquivoImportado.findFirst({
     where: {
       hashArquivo: dataHash,
       status: 'ativo'  // ⚠️ Se mudar para hard delete, remover este filtro
     }
   });
   ```

3. Se hard delete implementado, query deve ser:
   ```typescript
   const existing = await prisma.arquivoImportado.findFirst({
     where: { hashArquivo: dataHash }
   });
   ```

**Verificação:**

1. Fazer upload do arquivo A
2. Fazer upload do arquivo A novamente
3. Deve retornar 409 Conflict com mensagem "Arquivo com conteúdo idêntico já existe"

---

### Problema 4: Navegação de períodos travada após delete

**Sintomas:**

- Clicar em "Resetar Período 2024"
- Período desaparece da UI
- Mas recarregar página mostra período novamente

**Causa:** Frontend não está sincronizando após DELETE (V8.1.2 - gap).

**Solução:**

Verificar se `handleResetPeriodo()` está chamando `fetchData()` após delete (linha 124):

```typescript
const handleResetPeriodo = async (anoLetivo: string) => {
  try {
    await fetch(`/api/files?periodo=${encodeURIComponent(anoLetivo)}`, {
      method: 'DELETE'
    });

    // ✅ CRÍTICO: Recarregar dados
    await fetchData();

  } catch (error) {
    console.error('Erro ao deletar período:', error);
  }
};
```

---

### Problema 5: CSVs com BOM (Byte Order Mark) não processam

**Sintomas:**

```
Erro: Cabeçalho inválido. Faltando: Ano, ALUNO, NOME_COMPL
```

**Causa:** BOM (`\uFEFF`) no início do arquivo não foi removido.

**Solução:**

Verificar se `parseCsvLoose()` tem remoção de BOM:

```typescript
// DropCsv.tsx
const lines = text.split(/\r?\n/)
  .map(l => l.replace(/\uFEFF/g, ""))  // ✅ Remove BOM
  .filter(l => l.trim());
```

**Verificação:**

1. Abrir CSV em editor hexadecimal (ex: HxD)
2. Conferir se primeiros bytes são `EF BB BF` (UTF-8 BOM)
3. Upload do arquivo deve funcionar normalmente

---

## REFERÊNCIAS

- **Documentação relacionada:**
  - [Conceito](./MIGRACAO_CONCEITO.md) - Visão geral, problema, escopo
  - [Especificação](./MIGRACAO_ESPECIFICACAO.md) - 80 validações, casos de teste
  - [Ciclo de Vida](./MIGRACAO_CICLO.md) - Histórico de implementação (a criar)

- **Recursos externos:**
  - [Documentação do Prisma](https://www.prisma.io/docs)
  - [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
  - [PostgreSQL JSONB](https://www.postgresql.org/docs/current/datatype-json.html)
  - [Node.js crypto (SHA-256)](https://nodejs.org/api/crypto.html#cryptocreatehashalgorithm-options)

- **Issues relacionadas:**
  - [#V5.3.3 - Identificar alunos pendentes (BUGADO)](https://github.com/.../issues/5.3.3)
  - [#V8.1.2 - Sincronização frontend-backend (BUGADO)](https://github.com/.../issues/8.1.2)
  - [#V2.4.1 - Implementar transação completa](https://github.com/.../issues/2.4.1)

---

**Data de criação:** 2025-01-04
**Última atualização:** 2025-11-04
**Autor:** Claude (Anthropic)
**Revisado por:** Rafael Prado
**Versão da implementação:** v1.0.0
**Status:** 🟡 70% implementado (56/80 validações) - 3 gaps críticos conhecidos
