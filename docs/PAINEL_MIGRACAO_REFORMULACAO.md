# PAINEL DE MIGRAÇÃO - REFORMULAÇÃO

Documentação da nova estrutura do Painel de Migração após reformulação (Janeiro 2025).

---

## 🎯 OBJETIVO DA REFORMULAÇÃO

Transformar o painel de visualização **baseado em arquivos** para visualização **baseada em dados hierárquicos** (Período → Turma → Alunos), com detecção de pendências.

---

## 📋 ESTRUTURA HIERÁRQUICA

### **NÍVEL 1: PERÍODO LETIVO**

Exibe anos letivos com dados agregados:

```
📅 2024
├─ 45 turmas
├─ 1.250 alunos no CSV
├─ 1.200 criados no banco
├─ 50 pendentes (não criados)
└─ Status: ⚠️ PENDENTE
```

**Ações:**
- **Resetar Período** (com confirmação textual)
  - Usuário digita o ano (ex: "2024") para confirmar
  - Deleta (soft delete) todos os arquivos do período
  - Marca alunos como `fonteAusente=true`

---

### **NÍVEL 2: TURMA**

Exibe turmas dentro de cada período letivo:

```
📋 Turma 3001 ✅ OK
    ├─ 850 alunos no CSV
    ├─ 850 criados no banco
    └─ 0 pendentes

📋 Turma 3002 ⚠️ PENDENTE
    ├─ 320 alunos no CSV
    ├─ 315 criados no banco
    └─ 5 pendentes
        [Expandir para ver detalhes]
```

**Status da turma:**
- ✅ **OK** - Todos os alunos do CSV foram criados no banco
- ⚠️ **PENDENTE** - Alguns alunos do CSV não estão no banco

---

### **NÍVEL 3: ALUNOS (dentro da turma)**

Lista compacta mostrando alunos **pendentes** (não criados):

```
📋 Turma 3002 ⚠️ PENDENTE (5 alunos faltando)
    [Expandir ▼]

    Alunos no CSV mas não no banco:
    ├─ ⚠️ João Silva - 123456
    ├─ ⚠️ Maria Santos - 789012
    ├─ ⚠️ Pedro Costa - 456789
    ├─ ⚠️ Ana Souza - 321654
    └─ ⚠️ Carlos Lima - 987654
```

---

## 🔍 CASO DE USO REAL

### **Cenário:**
- Turma 3001 de 2024 tem 850 alunos no CSV
- Apenas 3 alunos aparecem na "Gestão de Alunos"
- **Problema:** 847 alunos não foram criados no banco

### **Como o painel deve alertar:**

```
📅 2024 ⚠️ PENDENTE

    📋 Turma 3001 ⚠️ PENDENTE
        ├─ 850 alunos no CSV
        ├─ 3 criados no banco
        └─ 847 pendentes

            [Ver alunos pendentes ▼]

            ⚠️ 847 alunos do CSV não foram criados no banco de dados.
            Isso pode indicar um problema na importação.

            Primeiros 10:
            ├─ ⚠️ Aluno A - 100001
            ├─ ⚠️ Aluno B - 100002
            ├─ ⚠️ Aluno C - 100003
            └─ ... (+ 837 alunos)

            [Baixar lista completa CSV]
```

---

## 🏗️ ARQUITETURA TÉCNICA

### **BACKEND: API /api/files**

#### **GET /api/files** (modificado)

Retorna hierarquia de períodos com dados agregados:

```typescript
Response: {
  periodos: [
    {
      anoLetivo: "2024",
      resumo: {
        totalTurmas: 45,
        totalAlunosCSV: 1250,      // Total de matrículas únicas nos CSVs
        totalAlunosBanco: 1200,     // Total de alunos criados no banco
        pendentes: 50,              // Diferença (no CSV mas não no banco)
        status: "pendente"          // "ok" | "pendente"
      },
      turmas: [
        {
          nome: "3001",
          totalAlunosCSV: 850,
          totalAlunosBanco: 3,
          pendentes: 847,
          status: "pendente",
          alunosPendentes: [         // Só se status === "pendente"
            { matricula: "123456", nome: "João Silva" },
            { matricula: "789012", nome: "Maria Santos" },
            // ... lista de alunos no CSV mas não no banco
          ]
        }
      ]
    }
  ]
}
```

#### **Lógica de cálculo:**

```sql
-- Para cada período letivo e turma:

-- 1. Contar alunos únicos no CSV (LinhaImportada)
SELECT COUNT(DISTINCT identificadorChave)
FROM linhas_importadas
WHERE tipoEntidade = 'aluno'
  AND arquivoId IN (arquivos do período/turma)

-- 2. Contar alunos criados no banco (Enturmacao)
SELECT COUNT(DISTINCT alunoId)
FROM enturmacoes
WHERE anoLetivo = '2024'
  AND turma = '3001'

-- 3. Identificar pendentes (no CSV mas não no banco)
SELECT DISTINCT li.identificadorChave, li.dadosOriginais->>'NOME_COMPL'
FROM linhas_importadas li
WHERE li.tipoEntidade = 'aluno'
  AND li.dadosOriginais->>'TURMA' = 'Turma: 3001'
  AND li.dadosOriginais->>'Ano' = 'Ano Letivo: 2024'
  AND NOT EXISTS (
    SELECT 1 FROM alunos a
    WHERE a.matricula = li.identificadorChave
  )
```

---

### **FRONTEND: MigrateUploads.tsx**

#### **Nova estrutura de componentes:**

```
MigrateUploads.tsx (container)
  └─ PeriodoLetivoAccordion.tsx
      ├─ ResumoPeriodo.tsx (estatísticas)
      ├─ BotaoResetarPeriodo.tsx (com confirmação)
      └─ ListaTurmas.tsx
          └─ TurmaItem.tsx
              ├─ ResumoTurma.tsx (estatísticas)
              └─ ListaAlunosPendentes.tsx (collapsible)
```

#### **Estado gerenciado:**

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
  alunosPendentes?: AlunoPendente[];
};

type AlunoPendente = {
  matricula: string;
  nome: string;
};
```

---

## 🎨 DESIGN VISUAL

### **Cores semânticas:**

```css
/* Status OK */
--status-ok: #10b981;        /* Verde */
--status-ok-bg: #d1fae5;     /* Verde claro */

/* Status Pendente */
--status-pendente: #f59e0b;  /* Laranja */
--status-pendente-bg: #fef3c7; /* Laranja claro */

/* Status Erro */
--status-erro: #ef4444;      /* Vermelho */
--status-erro-bg: #fee2e2;   /* Vermelho claro */
```

### **Layout proposto:**

```
┌─────────────────────────────────────────────────────────┐
│ Painel de Migração                                      │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ [DropCsv: Arraste arquivo CSV aqui]                    │
│                                                         │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                                         │
│ 📅 2024 ⚠️ PENDENTE                          [Resetar] │
│    45 turmas · 1.250 no CSV · 1.200 no banco · 50 ⚠️  │
│                                                         │
│    ▼ Turmas:                                           │
│    ┌───────────────────────────────────────────────┐   │
│    │ 📋 3001 ⚠️ · 850 CSV · 3 banco · 847 pendentes│   │
│    │    [Ver 847 alunos pendentes ▼]              │   │
│    ├───────────────────────────────────────────────┤   │
│    │ 📋 3002 ✅ · 320 CSV · 320 banco              │   │
│    └───────────────────────────────────────────────┘   │
│                                                         │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                                         │
│ 📅 2023 ✅ OK                                 [Resetar] │
│    38 turmas · 980 no CSV · 980 no banco               │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 🔄 FLUXO DE DADOS

### **1. Upload de CSV**

```
Usuário arrasta CSV
  ↓
DropCsv valida headers
  ↓
MigrateUploads.handleNewFiles()
  ↓
POST /api/files
  ├─ Criar ArquivoImportado
  ├─ Criar LinhaImportada (JSONB)
  ├─ Criar/Atualizar Aluno
  └─ Criar Enturmacao
  ↓
Response: { alunosNovos, alunosAtualizados, ... }
  ↓
Recarregar dados: GET /api/files
  ↓
Atualizar visualização hierárquica
```

### **2. Visualização (mount/reload)**

```
useEffect mount
  ↓
GET /api/files
  ↓
API processa:
  ├─ Agrupa por período letivo
  ├─ Agrupa por turma
  ├─ Conta alunos no CSV (LinhaImportada)
  ├─ Conta alunos no banco (Enturmacao)
  ├─ Identifica pendentes
  └─ Calcula status
  ↓
Response: { periodos: [...] }
  ↓
Frontend renderiza hierarquia
```

### **3. Resetar Período**

```
Usuário clica "Resetar Período 2024"
  ↓
Modal: "Digite '2024' para confirmar"
  ↓
DELETE /api/files?periodo=2024
  ↓
API:
  ├─ Soft delete arquivos (status='excluido')
  └─ Trigger marca fonteAusente=true
  ↓
Recarregar dados: GET /api/files
  ↓
Período 2024 desaparece da lista
```

---

## ⚠️ DEFINIÇÃO DE "PENDENTE"

**Um aluno é considerado PENDENTE quando:**

```
Existe em LinhaImportada (CSV)
E
NÃO existe em Aluno (banco de dados)
```

**Query de verificação:**

```sql
-- Aluno pendente
SELECT li.identificadorChave
FROM linhas_importadas li
WHERE li.tipoEntidade = 'aluno'
  AND NOT EXISTS (
    SELECT 1 FROM alunos a
    WHERE a.matricula = li.identificadorChave
  )
```

**Motivos possíveis:**
1. Erro no processamento durante upload
2. Validação de dados falhou (CPF inválido, etc)
3. Upload interrompido
4. Bug no código de criação de alunos

**Ação esperada:**
- Sistema alerta visualmente (⚠️)
- Mostra quantos e quais alunos estão pendentes
- Permite baixar lista para análise
- Possível botão "Reprocessar" no futuro

---

## 📊 ESTATÍSTICAS EXIBIDAS

### **Nível Período:**
- Total de turmas
- Total de alunos no CSV (matrículas únicas)
- Total de alunos no banco
- Total de pendentes
- Status geral (✅ OK se pendentes=0, ⚠️ PENDENTE se >0)

### **Nível Turma:**
- Total de alunos no CSV
- Total de alunos no banco
- Total de pendentes
- Status (✅ ou ⚠️)
- Lista de alunos pendentes (se houver)

---

## 🚀 PLANO DE IMPLEMENTAÇÃO

### **FASE 1: Backend - Modificar GET /api/files**
1. Adicionar query de agregação por período e turma
2. Contar alunos no CSV (LinhaImportada)
3. Contar alunos no banco (Enturmacao + Aluno)
4. Identificar pendentes (JOIN com NOT EXISTS)
5. Retornar estrutura hierárquica

### **FASE 2: Frontend - Criar componentes**
1. `PeriodoLetivoItem.tsx` - Card do período com resumo
2. `TurmaItem.tsx` - Item da turma (collapsible)
3. `ListaAlunosPendentes.tsx` - Lista de pendentes
4. Integrar em `MigrateUploads.tsx`

### **FASE 3: Resetar Período**
1. Modal de confirmação com input de texto
2. Implementar DELETE /api/files?periodo=X
3. Recarregar dados após exclusão

### **FASE 4: Refinamentos**
1. Loading states
2. Error handling
3. Animações de expand/collapse
4. Export CSV de alunos pendentes

---

## 🔗 ARQUIVOS AFETADOS

**Backend:**
- `src/app/api/files/route.ts` - Modificar GET

**Frontend:**
- `src/components/MigrateUploads.tsx` - Refatorar visualização
- `src/components/PeriodoLetivoItem.tsx` - Criar (novo)
- `src/components/TurmaItem.tsx` - Criar (novo)
- `src/components/ListaAlunosPendentes.tsx` - Criar (novo)

**Documentação:**
- `docs/PAINEL_MIGRACAO.md` - Atualizar com nova estrutura
- `ISSUES.md` - Marcar issues #1, #2, #3, #4, #5 como resolvidos

---

## 📝 NOTAS TÉCNICAS

### **Performance:**
- Queries agregadas podem ser pesadas com muitos dados
- Considerar cache ou materialização futura
- Por enquanto: aceitável para ~2000 alunos

### **Paginação:**
- Lista de alunos pendentes pode ter centenas de itens
- Mostrar primeiros 50 com botão "Ver mais"
- Ou download CSV completo

### **Responsividade:**
- Layout deve funcionar em telas menores
- Considerar collapse automático em mobile

---

## ✅ CRITÉRIOS DE SUCESSO

A reformulação será considerada bem-sucedida quando:

1. ✅ Visualização hierárquica (Período → Turma → Alunos) funciona
2. ✅ Detecta e alerta alunos pendentes corretamente
3. ✅ Caso de uso real (3001 com 3/850 alunos) é visível e alertado
4. ✅ Resetar período funciona com confirmação
5. ✅ Performance aceitável (<2s para carregar)
6. ✅ Código limpo e componentizado
7. ✅ Documentação atualizada

---

**Data da reformulação:** Janeiro 2025
**Responsável:** Claude + Rafael