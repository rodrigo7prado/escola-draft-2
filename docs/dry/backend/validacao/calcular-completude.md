#### *`DRY.BACKEND:CALCULAR_COMPLETUDE_DOCUMENTOS`*

Sistema de análise de completude de dados baseado em def-objects, permitindo validar dinamicamente se campos obrigatórios estão preenchidos para diferentes contextos (documentos, importações, validações).

---

## Identificação

- **ID DRY:** *`DRY.BACKEND:CALCULAR_COMPLETUDE_DOCUMENTOS`*
- **Localização no código:** `/src/lib/core/data/gestao-alunos/documentos/calcularCompletude.ts`
- **Categoria:** Backend / Utilitário de Validação

---

## Descrição

Sistema de funções puras que analisa a completude de dados de alunos em relação aos campos obrigatórios definidos nos def-objects. Calcula percentuais, identifica campos faltantes e gera status consolidados por item (ex: documento, fase, seção).

**Escopo:**
- ✅ Validação de completude baseada em def-objects
- ✅ Cálculo de percentuais e status (completo/incompleto/ausente)
- ✅ Identificação de campos faltantes com metadados
- ✅ Consolidação de status para múltiplos itens
- ❌ Não inclui lógica de UI ou navegação
- ❌ Não faz queries ao banco de dados

---

## API

### Funções Principais

#### `calcularCompletudeDocumento()`

Calcula a completude de dados para um documento específico.

**Assinatura:**
```typescript
function calcularCompletudeDocumento(
  documento: DocEmissao,
  dadosAluno: DadosAlunoCompleto
): CompletudeDocumento
```

**Parâmetros:**
- `documento`: Tipo de documento a validar ("Certidão", "Certificado", "Diploma", "Histórico Escolar")
- `dadosAluno`: Objeto com dados completos do aluno (incluindo `seriesCursadas[]`)

**Retorna:**
```typescript
{
  documento: DocEmissao;
  status: PhaseStatus;           // "completo" | "incompleto" | "ausente"
  percentual: number;            // 0-100
  camposPreenchidos: number;
  totalCampos: number;
  camposFaltantes: CampoFaltante[];
}
```

**Lógica:**
1. Itera sobre todos os def-objects (dadosPessoais, dadosEscolares, historicoEscolar)
2. Para cada campo, verifica se o documento solicitado está no array de documentos
3. Se sim, verifica se o valor está preenchido nos dados do aluno
4. Acumula contadores e monta lista de campos faltantes
5. Calcula percentual e determina status:
   - `completo`: 100% dos campos preenchidos
   - `ausente`: 0% dos campos preenchidos
   - `incompleto`: entre 0% e 100%

---

#### `calcularCompletudeEmissao()`

Consolida a completude de todos os 4 documentos de emissão.

**Assinatura:**
```typescript
function calcularCompletudeEmissao(
  dadosAluno: DadosAlunoCompleto
): ResumoCompletudeEmissao
```

**Parâmetros:**
- `dadosAluno`: Objeto com dados completos do aluno

**Retorna:**
```typescript
{
  statusGeral: PhaseStatus;           // Status consolidado
  documentosProntos: number;          // Quantidade com status "completo"
  totalDocumentos: number;            // Sempre 4
  porDocumento: Record<DocEmissao, CompletudeDocumento>;
}
```

**Lógica:**
1. Chama `calcularCompletudeDocumento()` para cada um dos 4 documentos
2. Conta quantos têm status "completo"
3. Determina status geral:
   - `completo`: todos os 4 documentos completos
   - `ausente`: todos os 4 documentos ausentes
   - `incompleto`: casos intermediários

---

### Tipos TypeScript

#### `DadosAlunoCompleto`

```typescript
export type DadosAlunoCompleto = Record<string, unknown> & {
  seriesCursadas?: SerieCursadaCompleta[];
};

type SerieCursadaCompleta = Record<string, unknown> & {
  historicos?: Record<string, unknown>[];
  _count?: { historicos?: number };
};
```

Representa dados completos do aluno necessários para análise de completude.

---

#### `CampoFaltante`

```typescript
export type CampoFaltante = {
  campo: string;    // Nome técnico do campo (ex: "dataNascimento")
  label: string;    // Nome legível (ex: "Data de nascimento")
  tabela: string;   // Tabela de origem (ex: "Aluno", "SerieCursada")
  fase: Phase;      // Fase a que pertence (ex: "FASE:DADOS_PESSOAIS")
};
```

Representa um campo obrigatório que não está preenchido.

---

#### `CompletudeDocumento`

```typescript
export type CompletudeDocumento = {
  documento: DocEmissao;
  status: PhaseStatus;
  percentual: number;
  camposPreenchidos: number;
  totalCampos: number;
  camposFaltantes: CampoFaltante[];
};
```

Resultado da análise de completude para um documento específico.

---

#### `ResumoCompletudeEmissao`

```typescript
export type ResumoCompletudeEmissao = {
  statusGeral: PhaseStatus;
  documentosProntos: number;
  totalDocumentos: number;
  porDocumento: Record<DocEmissao, CompletudeDocumento>;
};
```

Consolidação de completude para todos os documentos.

---

## Dependências

### Objetos DRY Utilizados

- [DRY.OBJECT:PHASES] - Configuração de fases e tipos `Phase`, `PhaseStatus`
- [DRY.TYPE:DocEmissao] - Tipos de documentos de emissão

### Def-objects

O sistema importa e utiliza os três def-objects:
- `dadosPessoais` (FASE:DADOS_PESSOAIS)
- `dadosEscolares` (FASE:DADOS_ESCOLARES)
- `historicoEscolar` (FASE:HISTORICO_ESCOLAR)

Estes objetos são a **fonte única da verdade** para determinar quais campos são obrigatórios para cada documento.

---

## Comportamento

### Validação de Campos Preenchidos

A função `valorPreenchido()` determina se um valor está preenchido:

```typescript
function valorPreenchido(valor: unknown): boolean {
  if (valor === null || valor === undefined) return false;
  if (typeof valor === "string") return valor.trim().length > 0;
  if (typeof valor === "number") return Number.isFinite(valor);
  if (typeof valor === "boolean") return true;
  if (Array.isArray(valor)) return valor.length > 0;
  if (valor instanceof Date) return !Number.isNaN(valor.getTime());
  return true;
}
```

**Critérios:**
- `null`/`undefined`: não preenchido
- Strings: deve ter conteúdo após trim
- Numbers: deve ser finito (não NaN, não Infinity)
- Booleans: sempre preenchido
- Arrays: deve ter ao menos 1 elemento
- Dates: deve ser data válida

---

### Tratamento de Campos de Relações

**Para campos de `SerieCursada`:**
- Verifica se existe ao menos 1 registro em `seriesCursadas[]`
- Campo considerado preenchido se alguma série tiver o valor

**Para campos de `HistoricoEscolar`:**
- Verifica se existem históricos vinculados às séries
- Campo considerado preenchido se algum histórico tiver o valor

---

### Sistema de Aliases

O sistema suporta aliases de campos (ex: diferentes nomes entre def-objects e schema Prisma):

```typescript
const ALUNO_ALIASES = new Map<string, string>(
  Object.entries(CAMPOS_DADOS_PESSOAIS_ALIASES).map(([campo, alias]) => [
    alias,
    campo,
  ])
);
```

Ao buscar valor de um campo no aluno, tenta primeiro pelo nome direto, depois pelo alias.

---

## Fluxo de Uso

### Caso de Uso 1: Validar documentos de um aluno

```typescript
import { calcularCompletudeEmissao } from '@/lib/core/data/gestao-alunos/documentos/calcularCompletude';

// Buscar dados do aluno (incluir seriesCursadas com historicos)
const aluno = await prisma.aluno.findUnique({
  where: { id: alunoId },
  include: {
    seriesCursadas: {
      include: { historicos: true }
    }
  }
});

// Calcular completude
const resumo = calcularCompletudeEmissao(aluno);

// Usar resultado
console.log(`Status geral: ${resumo.statusGeral}`);
console.log(`Documentos prontos: ${resumo.documentosProntos}/${resumo.totalDocumentos}`);

// Verificar documento específico
const certidao = resumo.porDocumento["Certidão"];
console.log(`Certidão ${certidao.percentual}% completa`);
console.log(`Campos faltantes:`, certidao.camposFaltantes);
```

---

### Caso de Uso 2: Validar documento específico

```typescript
import { calcularCompletudeDocumento } from '@/lib/core/data/gestao-alunos/documentos/calcularCompletude';

const aluno = await obterDadosAluno(alunoId);

// Validar apenas Certificado
const certificado = calcularCompletudeDocumento("Certificado", aluno);

if (certificado.status === "completo") {
  await gerarCertificadoPDF(aluno);
} else {
  console.log("Campos faltantes:", certificado.camposFaltantes);
}
```

---

## Reutilização Futura

Este sistema pode ser adaptado para outros contextos de validação de completude:

### 1. Validação de Importação

```typescript
// Verificar se arquivo importado tem todos os campos necessários
const completudeImportacao = calcularCompletudeImportacao(
  dadosImportados,
  camposObrigatorios
);
```

### 2. Dashboard de Qualidade

```typescript
// Analisar completude de todos os alunos de uma turma
const alunosTurma = await obterAlunosTurma(turmaId);
const relatorio = alunosTurma.map(aluno => ({
  aluno: aluno.nome,
  completude: calcularCompletudeEmissao(aluno)
}));
```

### 3. Sistema de Notificações

```typescript
// Notificar secretaria quando aluno atingir X% de completude
const resumo = calcularCompletudeEmissao(aluno);
const percentualGeral = calcularPercentualGeral(resumo);

if (percentualGeral >= 80 && percentualGeral < 100) {
  await notificar("Aluno quase pronto para emissão de documentos");
}
```

### 4. Filtros de Busca

```typescript
// Filtrar alunos com documentos prontos
const alunosComDocumentosProntos = alunos.filter(aluno => {
  const resumo = calcularCompletudeEmissao(aluno);
  return resumo.statusGeral === "completo";
});
```

---

## Considerações de Performance

### Otimizações Implementadas

1. **Memoização de Labels:** Cache de labels de campos usando `Map` para evitar recálculos
2. **Interrupção Antecipada:** Loop `some()` para verificar se ao menos 1 registro tem o campo preenchido
3. **Dados Pré-carregados:** Recebe dados já carregados, não faz queries adicionais

### Recomendações

- ✅ Carregar dados necessários em uma única query Prisma (use `include`)
- ✅ Executar cálculo apenas quando necessário (não em loops de renderização)
- ⚠️ Para listas grandes (>100 alunos), considerar:
  - Cálculo em background job
  - Cache de resultados
  - Paginação com cálculo sob demanda

---

## Testes

### Localização

`/tests/lib/calcularCompletude.test.ts`

### Casos de Teste Implementados

1. ✅ Aluno sem nenhum dado → percentual 0, status "ausente"
2. ✅ Aluno com dados completos → percentual 100, status "completo"
3. ✅ Aluno com dados parciais → percentual intermediário, status "incompleto"
4. ✅ Array de campos faltantes correto
5. ✅ Validação para cada tipo de documento

### Executar Testes

```bash
pnpm test calcularCompletude
```

---

## Referências Cruzadas

### Componentes Relacionados

- [DRY.UI:CARD_COMPLETUDE_COM_DETALHAMENTO](../../ui/ui-components.dry.md#11-card-completude-com-detalhamento) - Componente UI que consome este sistema
- [DRY.OBJECT:PHASES](../../objects/phases.md#dryobjectphases) - Configuração de fases utilizada
- [DRY.TYPE:DocEmissao](../../objects/index.md#drytypedocemissao) - Tipos de documentos
- [DRY.TYPE:CompletudeItem](../../objects/index.md#drytypecompletudeitem) - Tipo genérico de resultado de completude
- [DRY.TYPE:ResumoCompletude](../../objects/index.md#drytyperesumocompletude) - Tipo genérico de resumo consolidado
- [DRY.TYPE:CampoFaltante](../../objects/index.md#drytypecampofaltante) - Tipo de campo faltante

### Features que Utilizam

- **Emissão de Documentos** (feature atual)
  - Hook: `useAlunosCertificacao` calcula completude para cada aluno
  - Componente: `CompletudeDocumentos` exibe resultado
  - Lista: `ListaAlunosCertificacao` mostra status dinâmico

### Origem da Implementação

- **Feature:** Emissão de Documentos
- **Sessão:** 3 (Análise de Completude)
- **Checkpoints:** C13-C18
- **Documentação:** `/docs/features/emissao-documentos/CHECKPOINT.md`

---

## Checklist de Implementação

- [x] Funções puras sem efeitos colaterais
- [x] Tipos TypeScript completos e exportados
- [x] Validação de todos os tipos de campo (string, number, boolean, array, date)
- [x] Suporte a aliases de campos
- [x] Tratamento de relações (seriesCursadas, historicos)
- [x] Testes unitários abrangentes
- [x] Performance otimizada (memoização de labels)
- [x] Documentação inline com comentários [FEAT:emissao-documentos_TEC7]

---

## Exemplos Práticos

### Exemplo 1: Integração em Hook

```typescript
// /src/hooks/useAlunosCertificacao.ts
import { calcularCompletudeEmissao } from '@/lib/core/data/gestao-alunos/documentos/calcularCompletude';

export function useAlunosCertificacao() {
  const alunos = await prisma.aluno.findMany({
    include: {
      seriesCursadas: {
        include: { historicos: true }
      }
    }
  });

  const alunosComCompletude = alunos.map(aluno => ({
    ...aluno,
    progressoEmissaoDocumentos: calcularCompletudeEmissao(aluno)
  }));

  return alunosComCompletude;
}
```

---

### Exemplo 2: Exibir Status na UI

```typescript
// /src/components/StatusAluno.tsx
const resumo = calcularCompletudeEmissao(aluno);

return (
  <div>
    <Badge status={resumo.statusGeral}>
      {resumo.documentosProntos}/{resumo.totalDocumentos} prontos
    </Badge>

    {resumo.statusGeral !== "completo" && (
      <Button onClick={() => navegarParaCamposFaltantes(resumo)}>
        Completar dados
      </Button>
    )}
  </div>
);
```

---

### Exemplo 3: Relatório de Campos Faltantes

```typescript
function gerarRelatorioFaltantes(aluno: DadosAlunoCompleto) {
  const resumo = calcularCompletudeEmissao(aluno);

  const relatorio = Object.entries(resumo.porDocumento)
    .filter(([_, info]) => info.status !== "completo")
    .map(([documento, info]) => ({
      documento,
      percentual: info.percentual,
      faltantes: info.camposFaltantes.map(c => c.label)
    }));

  return relatorio;
}
```

---

## Fonte Única da Verdade

Os **def-objects são a fonte única da verdade** para validação de completude:

- Qualquer mudança nos campos obrigatórios deve ser feita nos def-objects
- O sistema de completude reflete automaticamente as mudanças
- Não há duplicação de regras de validação

**Exemplo:**
```typescript
// Se adicionar "Certidão" a um campo em dadosPessoais.ts:
export const dadosPessoais = {
  Aluno: {
    email: ["Certidão"],  // ← Adicionado aqui
    // ...
  }
};

// O sistema automaticamente passará a exigir este campo para Certidão
// Sem necessidade de alterar código de validação
```

---

## Evolução Futura

Possíveis melhorias sem quebrar compatibilidade:

1. **Campos Críticos vs Opcionais**
   ```typescript
   interface CampoConfig {
     critico: boolean;  // Se false, não bloqueia emissão
     peso: number;      // Para cálculo ponderado de percentual
   }
   ```

2. **Validação Condicional**
   ```typescript
   interface ValidacaoCondicional {
     campo: string;
     obrigatorioSe: (dados: DadosAlunoCompleto) => boolean;
   }
   // Ex: CPF obrigatório apenas se brasileiro
   ```

3. **Cache de Resultados**
   ```typescript
   const cache = new Map<string, ResumoCompletudeEmissao>();
   // Invalidar quando dados mudarem
   ```

4. **Percentual Configurável**
   ```typescript
   const config = {
     percentualMinimo: 85,  // Liberar emissão com 85%
   };
   ```
