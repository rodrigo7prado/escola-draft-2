# TÉCNICO: Importação Estruturada por Texto

**Status:** 🟡 Em Desenvolvimento
**Metodologia:** CIF (Ciclo de Integridade de Funcionalidade)
**Fase:** TÉCNICO
**Criado em:** 2025-01-09
**Última atualização:** 2025-01-09

---

## ÍNDICE
1. [Arquitetura de Alto Nível](#1-arquitetura-de-alto-nível)
2. [Modelagem de Banco de Dados](#2-modelagem-de-banco-de-dados)
3. [Componentes Frontend](#3-componentes-frontend)
4. [APIs Backend](#4-apis-backend)
5. [Módulo de Parsing](#5-módulo-de-parsing)
6. [Fluxo de Dados](#6-fluxo-de-dados)
7. [Decisões Técnicas](#7-decisões-técnicas)

---

## 1. ARQUITETURA DE ALTO NÍVEL

### 1.1 Visão Geral

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND (React)                      │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Gestão de Alunos (página existente)                 │  │
│  │    └─ ListaAlunos.tsx                                │  │
│  │         └─ ItemAlunoAtivo.tsx                        │  │
│  │              └─ BotaoModoColagem.tsx (toggle)        │  │
│  │              └─ AreaColagem.tsx (aparece ao ativar)  │  │
│  └──────────────────────────────────────────────────────┘  │
│                          ↓ POST /api/importacao-estruturada │
├─────────────────────────────────────────────────────────────┤
│                        BACKEND (Next.js API)                 │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  /api/importacao-estruturada/route.ts                │  │
│  │    1. Recebe texto + matricula                       │  │
│  │    2. Valida matrícula existe                        │  │
│  │    3. Detecta tipo (Página 1 ou 2)                   │  │
│  │    4. Chama parser correspondente                    │  │
│  │    5. Valida dados parseados                         │  │
│  │    6. Retorna resultado (sem salvar ainda)           │  │
│  └──────────────────────────────────────────────────────┘  │
│                          ↓                                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  /api/importacao-estruturada/salvar/route.ts         │  │
│  │    - Recebe dados confirmados do frontend            │  │
│  │    - Salva em dadosOriginais (JSONB)                 │  │
│  │    - Atualiza flags (pagina1Importada, etc)          │  │
│  └──────────────────────────────────────────────────────┘  │
│                          ↓                                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Módulo de Parsing (lib/parsing/)                    │  │
│  │    - detectarTipoPagina.ts                           │  │
│  │    - parsePagina1.ts                                 │  │
│  │    - normalizarSexo.ts                               │  │
│  │    - validarCPF.ts                                   │  │
│  └──────────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│                    BANCO DE DADOS (PostgreSQL)               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Tabela: Aluno                                       │  │
│  │    - Campos atuais (nome, cpf, rg, ...) = editáveis  │  │
│  │    - dadosOriginais (JSONB) ← NOVO                   │  │
│  │    - textoHistoricoOriginal (TEXT) ← NOVO            │  │
│  │    - pagina1Importada (BOOLEAN) ← NOVO               │  │
│  │    - pagina2Importada (BOOLEAN) ← NOVO               │  │
│  │    - dataImportacaoPagina1 (TIMESTAMP) ← NOVO        │  │
│  │    - dataImportacaoPagina2 (TIMESTAMP) ← NOVO        │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Tecnologias Utilizadas

| Camada | Tecnologia | Justificativa |
|--------|------------|---------------|
| **Frontend** | React + TypeScript | Já utilizado no projeto |
| **Componentes UI** | Radix UI | Padrão do projeto (acessibilidade) |
| **Estado** | React Hooks | Simples, sem necessidade de Redux |
| **Backend** | Next.js API Routes | Framework do projeto |
| **Validação** | Zod | Type-safe, integra com TypeScript |
| **Banco de Dados** | PostgreSQL + Prisma | Já utilizado no projeto |
| **Parsing** | Regex + String manipulation | Suficiente para formato estruturado |

---

## 2. MODELAGEM DE BANCO DE DADOS

### 2.1 Schema Prisma - Alterações no Model `Aluno`

```prisma
model Aluno {
  id                      Int       @id @default(autoincrement())
  matricula               String    @unique @db.VarChar(15)

  // Campos existentes (= dadosEditaveis)
  nome                    String?   @db.VarChar(200)
  dataNascimento          DateTime? @db.Date
  sexo                    String?   @db.Char(1)
  cpf                     String?   @db.VarChar(11)
  rg                      String?   @db.VarChar(20)
  orgaoEmissor            String?   @db.VarChar(20)
  dataEmissaoRG           DateTime? @db.Date
  naturalidade            String?   @db.VarChar(100)
  nacionalidade           String?   @db.VarChar(50)
  nomeMae                 String?   @db.VarChar(200)
  nomePai                 String?   @db.VarChar(200)

  // NOVOS CAMPOS para Importação Estruturada
  dadosOriginais          Json?     @db.JsonB  // Dados da importação
  textoHistoricoOriginal  String?   @db.Text   // Página 2 (texto bruto)

  pagina1Importada        Boolean   @default(false)
  pagina2Importada        Boolean   @default(false)

  dataImportacaoPagina1   DateTime?
  dataImportacaoPagina2   DateTime?

  // Relacionamentos existentes
  enturmacoes             Enturmacao[]
  linhaOrigemId           Int?
  linhaOrigem             LinhaImportada? @relation(fields: [linhaOrigemId], references: [id], onDelete: SetNull)
  origemTipo              String          @default("csv")
  fonteAusente            Boolean         @default(false)

  createdAt               DateTime  @default(now())
  updatedAt               DateTime  @updatedAt

  @@map("alunos")
}
```

### 2.2 Estrutura do JSONB `dadosOriginais`

**Exemplo de conteúdo:**
```json
{
  "nomeCompleto": "JOÃO SILVA SANTOS",
  "matricula": "123456789012345",
  "dataNascimento": "2005-01-01",
  "sexo": "M",
  "cpf": "12345678900",
  "rg": "12.345.678-9",
  "orgaoEmissor": "DETRAN",
  "dataEmissaoRG": "2020-03-15",
  "naturalidade": "Rio de Janeiro",
  "nacionalidade": "Brasileira",
  "nomeMae": "MARIA SILVA",
  "nomePai": "JOSÉ SANTOS",
  "importadoEm": "2025-01-09T14:30:00Z",
  "tipoImportacao": "pagina1"
}
```

### 2.3 Migration SQL

```sql
-- Adicionar campos para Importação Estruturada
ALTER TABLE "alunos"
  ADD COLUMN "dadosOriginais" JSONB,
  ADD COLUMN "textoHistoricoOriginal" TEXT,
  ADD COLUMN "pagina1Importada" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "pagina2Importada" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "dataImportacaoPagina1" TIMESTAMP,
  ADD COLUMN "dataImportacaoPagina2" TIMESTAMP;

-- Índice para busca em JSONB (opcional, mas recomendado)
CREATE INDEX "alunos_dadosOriginais_idx" ON "alunos" USING GIN ("dadosOriginais");

-- Comentários para documentação
COMMENT ON COLUMN "alunos"."dadosOriginais" IS 'Dados originais da importação estruturada (Página 1)';
COMMENT ON COLUMN "alunos"."textoHistoricoOriginal" IS 'Texto bruto do histórico escolar (Página 2)';
```

---

## 3. COMPONENTES FRONTEND

### 3.1 Estrutura de Arquivos

```
src/
  components/
    gestao-alunos/
      BotaoModoColagem.tsx          # Toggle (aparece só no aluno ativo)
      AreaColagem.tsx               # Textarea + botão "Importar"
      DialogConfirmarSexo.tsx       # Dialog para perguntar sexo
      DialogResumoPagina1.tsx       # Dialog com resumo de campos parseados
      DialogConfirmacaoPagina2.tsx  # Dialog simples de confirmação
      ChecksImportacao.tsx          # ✅/❌ visual de Página 1 e 2
      BadgeCampoEditado.tsx         # ✏️ badge para campos editados
  hooks/
    useImportacaoEstruturada.ts     # Hook principal
    useMergeVisual.ts               # Hook para merge dadosOriginais + campos normais
  lib/
    parsing/
      detectarTipoPagina.ts         # Detecta Página 1 ou 2
      parsePagina1.ts               # Extrai 12 campos de Página 1
      normalizarSexo.ts             # "Masculino" → "M"
      validarCPF.ts                 # Valida CPF (dígitos verificadores)
      validarData.ts                # Valida DD/MM/YYYY
  types/
    importacao-estruturada.ts       # Types TypeScript
```

### 3.2 Componente: `BotaoModoColagem.tsx`

**Responsabilidade:** Toggle para ativar/desativar modo colagem (APENAS no aluno ativo)

**Props:**
```typescript
interface BotaoModoColagemProps {
  alunoId: number;           // ID do aluno ativo
  onToggle: (ativo: boolean) => void;
}
```

**Estado:**
```typescript
const [modoColagemAtivo, setModoColagemAtivo] = useState(false);
```

**Renderização:**
```tsx
<button
  onClick={() => {
    const novoEstado = !modoColagemAtivo;
    setModoColagemAtivo(novoEstado);
    onToggle(novoEstado);
  }}
  className={cn(
    "px-3 py-1.5 rounded text-sm font-medium transition-colors",
    modoColagemAtivo
      ? "bg-blue-500 text-white"
      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
  )}
>
  {modoColagemAtivo ? '📋 Modo Colagem Ativo' : '📋 Ativar Modo Colagem'}
</button>
```

**Localização:** Renderizado dentro do `ItemAlunoAtivo` (só aparece quando aluno está selecionado)

---

### 3.3 Componente: `AreaColagem.tsx`

**Responsabilidade:** Textarea para colar texto + botão "Importar" + lógica de chamada API

**Props:**
```typescript
interface AreaColagemProps {
  alunoId: number;
  matricula: string;
  visivel: boolean;  // Controlado pelo toggle
  onSucesso: () => void;
}
```

**Estado:**
```typescript
const [texto, setTexto] = useState('');
const [loading, setLoading] = useState(false);
const [erro, setErro] = useState<string | null>(null);
```

**Renderização:**
```tsx
{visivel && (
  <div className="mt-3 space-y-3 border-t pt-3">
    <textarea
      value={texto}
      onChange={(e) => setTexto(e.target.value)}
      placeholder="Cole aqui o texto da Página 1 ou 2"
      rows={10}
      className="w-full border rounded p-2 text-sm font-mono"
    />

    {erro && (
      <div className="text-red-600 text-sm bg-red-50 p-2 rounded">
        {erro}
      </div>
    )}

    <button
      onClick={handleImportar}
      disabled={!texto.trim() || loading}
      className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
    >
      {loading ? 'Importando...' : '📥 Importar'}
    </button>
  </div>
)}
```

**Lógica de `handleImportar`:**
```typescript
const handleImportar = async () => {
  setLoading(true);
  setErro(null);

  try {
    const response = await fetch('/api/importacao-estruturada', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ texto, matricula, alunoId })
    });

    const resultado = await response.json();

    if (!response.ok) {
      setErro(resultado.erro);
      return;
    }

    // Delegar para hook (abre dialogs conforme necessário)
    // (implementado em useImportacaoEstruturada)

  } catch (error) {
    setErro('Erro ao importar. Tente novamente.');
  } finally {
    setLoading(false);
  }
};
```

---

### 3.4 Hook: `useImportacaoEstruturada.ts`

**Responsabilidade:** Gerenciar estado e fluxo de importação (incluindo dialogs)

**Assinatura:**
```typescript
export function useImportacaoEstruturada(
  alunoId: number,
  matricula: string
): UseImportacaoEstruturadaReturn
```

**Retorno:**
```typescript
interface UseImportacaoEstruturadaReturn {
  // Estado do texto
  texto: string;
  setTexto: (texto: string) => void;
  loading: boolean;
  erro: string | null;

  // Estado dos dialogs
  dialogSexoAberto: boolean;
  dialogResumoAberto: boolean;
  dialogPagina2Aberto: boolean;
  dadosParsed: DadosPagina1 | null;

  // Funções
  importar: () => Promise<void>;
  confirmarSexo: (sexo: 'M' | 'F') => void;
  confirmarResumo: () => Promise<void>;
  fecharDialogs: () => void;
}
```

**Implementação (simplificada):**
```typescript
export function useImportacaoEstruturada(alunoId: number, matricula: string) {
  const [texto, setTexto] = useState('');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const [dialogSexoAberto, setDialogSexoAberto] = useState(false);
  const [dialogResumoAberto, setDialogResumoAberto] = useState(false);
  const [dialogPagina2Aberto, setDialogPagina2Aberto] = useState(false);
  const [dadosParsed, setDadosParsed] = useState<any>(null);

  const importar = async () => {
    setLoading(true);
    setErro(null);

    try {
      const res = await fetch('/api/importacao-estruturada', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ texto, matricula, alunoId })
      });

      const resultado = await res.json();

      if (!res.ok) {
        setErro(resultado.erro);
        return;
      }

      setDadosParsed(resultado.dados);

      // Abrir dialog apropriado
      if (resultado.precisaConfirmarSexo) {
        setDialogSexoAberto(true);
      } else if (resultado.tipoPagina === 'pagina1') {
        setDialogResumoAberto(true);
      } else if (resultado.tipoPagina === 'pagina2') {
        setDialogPagina2Aberto(true);
      }

    } catch (error) {
      setErro('Erro ao importar');
    } finally {
      setLoading(false);
    }
  };

  const confirmarSexo = (sexo: 'M' | 'F') => {
    setDialogSexoAberto(false);
    setDadosParsed({ ...dadosParsed, sexo });
    setDialogResumoAberto(true);
  };

  const confirmarResumo = async () => {
    // Chamar API para salvar
    await fetch('/api/importacao-estruturada/salvar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ alunoId, dados: dadosParsed })
    });

    setDialogResumoAberto(false);
    setTexto('');
    // Callback onSucesso (atualizar UI)
  };

  const fecharDialogs = () => {
    setDialogSexoAberto(false);
    setDialogResumoAberto(false);
    setDialogPagina2Aberto(false);
  };

  return {
    texto, setTexto, loading, erro,
    dialogSexoAberto, dialogResumoAberto, dialogPagina2Aberto, dadosParsed,
    importar, confirmarSexo, confirmarResumo, fecharDialogs
  };
}
```

---

## 4. APIS BACKEND

### 4.1 API: `/api/importacao-estruturada/route.ts`

**Método:** POST

**Request Body:**
```typescript
interface ImportacaoRequest {
  texto: string;       // Texto colado pelo usuário
  matricula: string;   // Matrícula do aluno (15 dígitos)
  alunoId: number;     // ID do aluno
}
```

**Response (sucesso - Página 1 com sexo):**
```typescript
{
  sucesso: true,
  tipoPagina: 'pagina1',
  precisaConfirmarSexo: false,
  dados: DadosPagina1
}
```

**Response (sucesso - Página 1 SEM sexo):**
```typescript
{
  sucesso: true,
  tipoPagina: 'pagina1',
  precisaConfirmarSexo: true,
  dados: Partial<DadosPagina1>
}
```

**Response (erro):**
```typescript
{
  sucesso: false,
  erro: string
}
```

**Implementação:**
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { detectarTipoPagina } from '@/lib/parsing/detectarTipoPagina';
import { parsePagina1 } from '@/lib/parsing/parsePagina1';

const schemaRequest = z.object({
  texto: z.string().min(10),
  matricula: z.string().length(15),
  alunoId: z.number()
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { texto, matricula, alunoId } = schemaRequest.parse(body);

    // Validar que matrícula existe
    const aluno = await prisma.aluno.findUnique({
      where: { matricula }
    });

    if (!aluno) {
      return NextResponse.json(
        {
          sucesso: false,
          erro: `Matrícula ${matricula} não encontrada. Cadastre o aluno primeiro.`
        },
        { status: 404 }
      );
    }

    // Detectar tipo de página
    const tipoPagina = detectarTipoPagina(texto);

    if (!tipoPagina) {
      return NextResponse.json(
        { sucesso: false, erro: 'Formato não reconhecido.' },
        { status: 400 }
      );
    }

    // Processar Página 1
    if (tipoPagina === 'pagina1') {
      const dadosParsed = parsePagina1(texto);

      return NextResponse.json({
        sucesso: true,
        tipoPagina: 'pagina1',
        precisaConfirmarSexo: !dadosParsed.sexo,
        dados: dadosParsed
      });
    }

    // Processar Página 2 (salvar direto)
    if (tipoPagina === 'pagina2') {
      await prisma.aluno.update({
        where: { id: aluno.id },
        data: {
          textoHistoricoOriginal: texto,
          pagina2Importada: true,
          dataImportacaoPagina2: new Date()
        }
      });

      return NextResponse.json({
        sucesso: true,
        tipoPagina: 'pagina2',
        mensagem: 'Página 2 recebida com sucesso'
      });
    }

  } catch (error) {
    console.error('Erro na importação:', error);
    return NextResponse.json(
      { sucesso: false, erro: 'Erro interno' },
      { status: 500 }
    );
  }
}
```

---

### 4.2 API: `/api/importacao-estruturada/salvar/route.ts`

**Método:** POST

**Request Body:**
```typescript
{
  alunoId: number,
  dados: DadosPagina1
}
```

**Implementação:**
```typescript
export async function POST(request: NextRequest) {
  try {
    const { alunoId, dados } = await request.json();

    await prisma.aluno.update({
      where: { id: alunoId },
      data: {
        dadosOriginais: {
          ...dados,
          importadoEm: new Date().toISOString()
        },
        pagina1Importada: true,
        dataImportacaoPagina1: new Date()
      }
    });

    return NextResponse.json({ sucesso: true });

  } catch (error) {
    return NextResponse.json(
      { sucesso: false, erro: 'Erro ao salvar' },
      { status: 500 }
    );
  }
}
```

---

## 5. MÓDULO DE PARSING

### 5.1 `detectarTipoPagina.ts`

```typescript
type TipoPagina = 'pagina1' | 'pagina2' | null;

export function detectarTipoPagina(texto: string): TipoPagina {
  const marcadoresPagina1 = [
    /NOME COMPLETO:/i,
    /MATRÍCULA:/i,
    /DATA DE NASCIMENTO:/i
  ];

  const marcadoresPagina2 = [
    /COMPONENTE CURRICULAR/i,
    /\bNOTA\b/i,
    /\bFREQ/i,
    /RESULTADO/i
  ];

  const ehPagina1 = marcadoresPagina1.some(regex => regex.test(texto));
  const ehPagina2 = marcadoresPagina2.some(regex => regex.test(texto));

  if (ehPagina1 && ehPagina2) {
    throw new Error('Texto contém múltiplos formatos');
  }

  if (ehPagina1) return 'pagina1';
  if (ehPagina2) return 'pagina2';
  return null;
}
```

---

### 5.2 `parsePagina1.ts`

```typescript
export interface DadosPagina1 {
  nomeCompleto?: string;
  matricula?: string;
  dataNascimento?: string;
  sexo?: 'M' | 'F';
  cpf?: string;
  rg?: string;
  orgaoEmissor?: string;
  dataEmissaoRG?: string;
  naturalidade?: string;
  nacionalidade?: string;
  nomeMae?: string;
  nomePai?: string;
}

export function parsePagina1(texto: string): DadosPagina1 {
  const extrair = (regex: RegExp): string | undefined => {
    const match = texto.match(regex);
    return match ? match[1].trim() : undefined;
  };

  const nomeCompleto = extrair(/NOME COMPLETO:\s*(.+)/i);
  const matricula = extrair(/MATRÍCULA:\s*(.+)/i);
  const dataNascimento = extrair(/DATA DE NASCIMENTO:\s*(.+)/i);
  const sexoRaw = extrair(/SEXO:\s*(.+)/i);
  const cpf = extrair(/CPF:\s*(.+)/i);
  const rg = extrair(/RG:\s*(.+)/i);
  const orgaoEmissor = extrair(/ÓRGÃO EMISSOR:\s*(.+)/i);
  const dataEmissaoRG = extrair(/EMISSÃO:\s*(.+)/i);
  const naturalidade = extrair(/NATURALIDADE:\s*(.+)/i);
  const nacionalidade = extrair(/NACIONALIDADE:\s*(.+)/i);
  const filiacaoRaw = extrair(/FILIAÇÃO:\s*(.+)/i);

  const sexo = sexoRaw ? normalizarSexo(sexoRaw) : undefined;

  let nomeMae, nomePai;
  if (filiacaoRaw) {
    const partes = filiacaoRaw.split('/').map(s => s.trim());
    nomeMae = partes[0] || undefined;
    nomePai = partes[1] || undefined;
  }

  return {
    nomeCompleto,
    matricula,
    dataNascimento,
    sexo,
    cpf: cpf?.replace(/\D/g, ''),
    rg,
    orgaoEmissor,
    dataEmissaoRG,
    naturalidade,
    nacionalidade,
    nomeMae,
    nomePai
  };
}
```

---

### 5.3 `normalizarSexo.ts`

```typescript
export function normalizarSexo(valor: string): 'M' | 'F' | undefined {
  const normalizado = valor.trim().toLowerCase();

  if (normalizado === 'm' || normalizado === 'masculino') {
    return 'M';
  }

  if (normalizado === 'f' || normalizado === 'feminino') {
    return 'F';
  }

  return undefined;
}
```

---

## 6. FLUXO DE DADOS

### 6.1 Fluxo Completo - Página 1 (com sexo)

```
[Usuário]
   ↓ Seleciona aluno na lista (aluno fica ativo)
   ↓ Clica em toggle "Modo Colagem"
   ↓ Área de colagem aparece
   ↓ Cola texto
   ↓ Clica "Importar"
[AreaColagem.tsx]
   ↓ POST /api/importacao-estruturada
[API]
   ↓ Valida matrícula existe ✓
   ↓ detectarTipoPagina() → 'pagina1'
   ↓ parsePagina1() → { sexo: 'M', ... }
   ↓ Retorna { precisaConfirmarSexo: false, dados }
[Hook]
   ↓ Abre DialogResumoPagina1
[Dialog]
   ↓ Mostra 12 campos
   ↓ Usuário clica "Confirmar"
   ↓ POST /api/importacao-estruturada/salvar
[API]
   ↓ UPDATE alunos SET dadosOriginais = {...}, pagina1Importada = true
[UI]
   ↓ Check ✅ "Página 1 importada"
   ↓ Fecha dialog, limpa textarea
```

### 6.2 Fluxo - Página 1 (SEM sexo)

```
[Usuário cola texto sem "SEXO:"]
   ↓ POST /api/importacao-estruturada
[API]
   ↓ parsePagina1() → { sexo: undefined, ... }
   ↓ Retorna { precisaConfirmarSexo: true, dados }
[Hook]
   ↓ Abre DialogConfirmarSexo
[Dialog]
   ↓ Usuário seleciona "M" ou "F"
   ↓ confirmarSexo('M')
[Hook]
   ↓ Adiciona sexo aos dados
   ↓ Abre DialogResumoPagina1
   ↓ (continua igual ao fluxo anterior)
```

---

## 7. DECISÕES TÉCNICAS

### 7.1 Por que campos normais = editáveis?

**Decisão:** Campos atuais do banco continuam sendo os "editáveis". Criar novo campo JSONB para "originais".

**Motivos:**
- ✅ Compatibilidade com código existente
- ✅ Nenhuma migration complexa
- ✅ Edição manual já funciona
- ✅ Rastreabilidade clara

### 7.2 Por que JSONB para dadosOriginais?

**Vantagens:**
- ✅ Flexibilidade (adicionar campos sem migration)
- ✅ Performance (índices GIN)
- ✅ Queries nativas PostgreSQL

### 7.3 Por que Regex ao invés de LLM?

**Motivos:**
- ✅ Formato estruturado e previsível
- ✅ Performance < 10ms
- ✅ Zero custos
- ✅ Determinístico

---

**📌 CHECKPOINT:** Documento TÉCNICO completo.

**Status:** ✅ Pronto
**Próximo:** CICLO DE VIDA
