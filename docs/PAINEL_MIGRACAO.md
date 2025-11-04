# PAINEL DE MIGRAÇÃO - DOCUMENTAÇÃO TÉCNICA

Documentação completa do ciclo de vida e arquitetura do Painel de Migração de dados CSV.

---

## VISÃO GERAL

O Painel de Migração permite importar arquivos CSV do sistema Conexão Educação (SEEDUC-RJ), armazenando os dados originais (camada imutável) e criando registros estruturados (camada editável) no banco de dados.

**Componentes principais:**
- `MigrateUploads.tsx` - Interface de upload e visualização
- `DropCsv.tsx` - Componente de drag-and-drop
- `/api/files` - API de processamento e persistência

---

## ARQUITETURA DE DADOS (3 CAMADAS)

### CAMADA 1: ORIGEM (Imutável)
**Models:** `ArquivoImportado`, `LinhaImportada`

- Dados preservados exatamente como vieram do CSV
- Nunca são alterados ou deletados (soft delete)
- JSONB com todos os campos originais

### CAMADA 2: ESTRUTURADA (Editável)
**Models:** `Aluno`, `Enturmacao`

- Dados normalizados e estruturados
- Podem ser editados pelo usuário
- Mantêm referência à origem via `linhaOrigemId`

### CAMADA 3: AUDITORIA
**Model:** `Auditoria`

- Registra todas as alterações
- Histórico completo de mudanças

---

## FLUXO COMPLETO DO UPLOAD

```
┌─────────────────────────────────────────────────────────────┐
│ 1. USUÁRIO INTERAGE COM A INTERFACE                        │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ DropCsv.tsx                                                  │
│ - Aceita drag-and-drop ou seleção de arquivo(s)            │
│ - Valida headers obrigatórios                               │
│ - Parser: parseCsvLoose()                                   │
│ - Callback: onParsed(data, fileName)                        │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ MigrateUploads.tsx - handleNewFiles()                       │
│ - Recebe ParsedCsv do DropCsv                               │
│ - Envia para API via POST /api/files                        │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ API POST /api/files (route.ts)                              │
│                                                              │
│ ETAPA 1: Validação e Hash                                   │
│ ├─ Calcula SHA-256 dos dados (ordenados)                   │
│ ├─ Verifica duplicatas no banco                            │
│ └─ Se duplicado: retorna 409 Conflict                       │
│                                                              │
│ ETAPA 2: Criar ArquivoImportado                             │
│ └─ Registra metadados do arquivo                            │
│                                                              │
│ ETAPA 3: Processar cada linha                               │
│ ├─ Criar LinhaImportada (JSONB original)                   │
│ ├─ Agrupar por matrícula (Map)                             │
│ └─ Identificar alunos únicos                               │
│                                                              │
│ ETAPA 4: Criar/Atualizar Alunos                             │
│ ├─ Buscar aluno existente por matrícula                    │
│ ├─ Se novo: criar Aluno                                     │
│ └─ Se existe: atualizar linhaOrigemId                       │
│                                                              │
│ ETAPA 5: Criar Enturmações                                  │
│ ├─ Aplicar limparValor() nos campos                        │
│ │  (remove "Ano Letivo: 2024" → "2024")                    │
│ ├─ Verificar se enturmação já existe                       │
│ └─ Criar nova enturmação se necessário                     │
│                                                              │
│ RETORNO: {                                                   │
│   arquivo,                                                   │
│   linhasImportadas,                                         │
│   alunosNovos,                                              │
│   alunosAtualizados,                                        │
│   enturmacoesNovas                                          │
│ }                                                            │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ MigrateUploads.tsx - Atualiza estado                        │
│ └─ Adiciona arquivo à lista local (ataFiles)                │
└─────────────────────────────────────────────────────────────┘
```

---

## FUNÇÃO CRÍTICA: limparValor()

**Localização:** [route.ts:122-129](../src/app/api/files/route.ts#L122-L129)

**Propósito:** Arquivos CSV do Conexão Educação vêm com prefixos nos valores.

**Exemplos de dados originais:**
```
Ano: "Ano Letivo: 2024"
MODALIDADE: "Modalidade: REGULAR"
TURMA: "Turma: 3001"
SERIE: "Série: 3"
```

**Função:**
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

**Uso:**
```typescript
const anoLetivo = limparValor(info.dados.Ano, 'Ano Letivo:');
// "Ano Letivo: 2024" → "2024"

const modalidade = limparValor(info.dados.MODALIDADE, 'Modalidade:');
// "Modalidade: REGULAR" → "REGULAR"
```

**⚠️ IMPORTANTE:** Sem essa limpeza, dados vão pro banco com prefixos e causam erros de "value too long for column".

---

## VISUALIZAÇÃO DE DADOS CARREGADOS

### Carregamento Inicial

```
┌─────────────────────────────────────────────────────────────┐
│ MigrateUploads.tsx - useEffect()                            │
│ └─ GET /api/files ao montar componente                      │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ API GET /api/files                                           │
│                                                              │
│ Busca:                                                       │
│ ├─ arquivos com status='ativo'                             │
│ ├─ include: linhas (com dadosOriginais)                    │
│ └─ include: _count.linhas                                   │
│                                                              │
│ Processa:                                                    │
│ ├─ Extrai anos únicos das linhas                           │
│ ├─ Extrai modalidades únicas                               │
│ └─ Extrai turmas únicas                                     │
│                                                              │
│ Retorna: { arquivos: [...] }                                │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ MigrateUploads.tsx - Adaptação de dados                     │
│                                                              │
│ ⚠️ PROBLEMA ATUAL:                                          │
│ - Recebe dados completos da API                             │
│ - Mas descarta e cria arrays vazios:                        │
│   anos: []                                                   │
│   modalidades: []                                           │
│   turmas: []                                                 │
│   data: { headers: [], rows: [] }                           │
│                                                              │
│ - Depois tenta processar file.data.rows (vazio)            │
│ - Resultado: visualização quebrada                          │
└─────────────────────────────────────────────────────────────┘
```

### Estrutura de Visualização (ATUAL - COM BUGS)

**useMemo `estrutura`** - [MigrateUploads.tsx:239-309](../src/components/MigrateUploads.tsx#L239-L309)

```typescript
// Tenta construir hierarquia:
Map<anoLetivo, Map<modalidade, Map<turma, TurmaInfo>>>

// Mas file.data.rows está vazio, então estrutura fica vazia
```

**Renderização em Tabs aninhadas:**
```tsx
<Tabs> {/* Nível 1: Períodos Letivos */}
  <TabsContent>
    <Tabs> {/* Nível 2: Modalidades */}
      <TabsContent>
        <ul> {/* Lista de Turmas */}
      </TabsContent>
    </Tabs>
  </TabsContent>
</Tabs>
```

---

## OPERAÇÕES DE DELETE

### Delete Individual (arquivo)
```
Frontend: removeFile(fileId)
  ↓
DELETE /api/files?id={id}
  ↓
Soft delete: status='excluido', excluidoEm=now()
  ↓
Trigger PostgreSQL: fn_marcar_fonte_ausente
  └─ Marca alunos com fonteAusente=true
```

### Delete por Período (⚠️ QUEBRADO)
```
Frontend: removeByPeriodo(periodo)
  ↓
DELETE /api/files?periodo={periodo}
  ↓
Backend: Soft delete de arquivos do período
  ↓
Frontend: Filtra por file.anos (VAZIO!)
  └─ Não remove nada do estado local
```

### Delete por Modalidade (⚠️ QUEBRADO)
```
Frontend: removeByModalidade(modalidade, periodo)
  ↓
DELETE /api/files?periodo={periodo}&modalidade={modalidade}
  ↓
Backend: Soft delete de arquivos da modalidade
  ↓
Frontend: Filtra por file.modalidades (VAZIO!)
  └─ Não remove nada do estado local
```

---

## COMPONENTES E RESPONSABILIDADES

### MigrateUploads.tsx
**Responsabilidade:** Container principal do painel de migração

**Estado:**
- `ataFiles`: Lista de arquivos carregados
- `showFilesModal`: Controle de modal
- `isLoading`: Estado de carregamento
- `sortBy`: Ordenação da lista

**Funções principais:**
- `handleNewFiles()` - Envia CSV para API
- `removeFile()` - Delete individual
- `removeByPeriodo()` - Delete por ano letivo
- `removeByModalidade()` - Delete por modalidade
- `clearAllFiles()` - Limpa tudo

**Computed:**
- `sortedFiles` - Lista ordenada
- `estrutura` - Hierarquia Período → Modalidade → Turmas

### DropCsv.tsx
**Responsabilidade:** Upload e parsing de CSV

**Props:**
- `title` - Título do componente
- `requiredHeaders` - Headers obrigatórios
- `duplicateKey` - Campo para detectar duplicatas
- `onParsed` - Callback com dados parseados
- `showPreview` - Mostrar preview da tabela
- `multiple` - Aceitar múltiplos arquivos

**Funções principais:**
- `parseCsvLoose()` - Parser CSV tolerante
- `splitCsvLine()` - Split com suporte a aspas

---

## TIPOS DE DADOS

### ParsedCsv
```typescript
type ParsedCsv = {
  headers: string[];
  rows: Record<string, string>[];
};
```

### UploadedFile
```typescript
type UploadedFile = {
  id: string;
  fileName: string;
  uploadDate: string;
  data: ParsedCsv;
  dataHash: string;
  rowCount: number;
  anos: string[];
  modalidades: string[];
  turmas: string[];
};
```

### TurmaInfo
```typescript
type TurmaInfo = {
  turma: string;
  prefixo: string;
  parteNumerica: string;
  serie?: string;
  turno?: string;
};
```

---

## HEADERS OBRIGATÓRIOS DO CSV

```typescript
const ATA_HEADERS = [
  "Ano",
  "CENSO",
  "MODALIDADE",
  "CURSO",
  "SERIE",
  "TURNO",
  "TURMA",
  "ALUNO",
  "NOME_COMPL",
  "DISCIPLINA1",
  "TOTAL_PONTOS",
  "FALTAS",
  "Textbox148",
  "SITUACAO_FINAL",
];
```

---

## FLUXO DE DETECÇÃO DE DUPLICATAS

1. **Cálculo de Hash:**
   - Ordena headers alfabeticamente
   - Ordena rows por concatenação de chaves
   - Gera SHA-256 do JSON resultante

2. **Verificação:**
   - Busca no banco por `hashArquivo`
   - Se encontrar: retorna 409 Conflict
   - Se novo: prossegue com importação

3. **Benefício:**
   - Mesmo arquivo com nome diferente é detectado
   - Evita duplicação de dados no banco

---

## EXEMPLO DE USO

```tsx
// Em page.tsx
<Accordion trigger="Painel de Migração">
  <MigrateUploads />
</Accordion>

// MigrateUploads renderiza:
<DropCsv
  title="Ata de Resultados Finais"
  requiredHeaders={ATA_HEADERS}
  duplicateKey="ALUNO"
  onParsed={handleNewFiles}
  multiple={true}
/>
```

---

## DEPENDÊNCIAS

**Bibliotecas:**
- React (useState, useEffect, useMemo, useCallback)
- Next.js (API Routes)
- Prisma (ORM)
- crypto (hash SHA-256)

**Componentes UI:**
- `Button`
- `Modal`
- `Tabs` (aninhadas)

---

## NOTAS TÉCNICAS

### Parser CSV (parseCsvLoose)
- Suporta aspas duplas com escape (`""`)
- Ignora BOM (Byte Order Mark: `\uFEFF`)
- Procura headers em qualquer linha (não só primeira)
- Ignora linhas completamente vazias

### Soft Delete
- Arquivos nunca são deletados fisicamente
- `status` muda de 'ativo' para 'excluido'
- `excluidoEm` registra quando foi removido
- Trigger do banco marca `fonteAusente=true` nos alunos

### Performance
- useEffect roda apenas no mount
- useMemo para cálculos pesados (estrutura, sorted)
- startTransition para setState não bloqueante

---

## REFERÊNCIAS

**Arquivos principais:**
- [src/app/page.tsx](../src/app/page.tsx) - Página principal
- [src/components/MigrateUploads.tsx](../src/components/MigrateUploads.tsx)
- [src/components/DropCsv.tsx](../src/components/DropCsv.tsx)
- [src/app/api/files/route.ts](../src/app/api/files/route.ts)

**Documentação relacionada:**
- [CLAUDE.md](../CLAUDE.md) - Instruções gerais do projeto
- [ISSUES.md](../ISSUES.md) - Problemas conhecidos
- [prisma/schema.prisma](../prisma/schema.prisma) - Modelos de dados
