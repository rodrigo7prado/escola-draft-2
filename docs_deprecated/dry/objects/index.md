# DRY - Objetos e Tipos TypeScript

Índice de objetos, tipos e estruturas de dados reutilizáveis do sistema.

## Índice

### Objetos Principais
1. [DRY.OBJECT:PHASES](#dryobjectphases) - Sistema de fases de gestão de alunos

### Tipos de Dados
2. [DRY.TYPE:Phase](#drytypephase) - Literal types das fases
3. [DRY.TYPE:PhaseSchema](#drytypephaseschema) - Schema genérico de fase
4. [DRY.TYPE:ModelosPrismaFluxo](#drytypemodelosprismafluxo) - Modelos do fluxo
5. [DRY.TYPE:DocEmissao](#drytypedocemissao) - Tipos de documentos
6. [DRY.TYPE:CompletudeItem](#drytypecompletudeitem) - Resultado de análise de completude por item
7. [DRY.TYPE:ResumoCompletude](#drytyperesumocompletude) - Consolidação de completude de múltiplos itens
8. [DRY.TYPE:CampoFaltante](#drytypecampofaltante) - Campo obrigatório não preenchido

---

## Objetos Principais

### DRY.OBJECT:PHASES

**Localização:** [phases.md](phases.md)

**Descrição:** Sistema completo de fases para gestão de alunos, incluindo definição de campos obrigatórios, modelos Prisma associados e ícones de interface.

**Uso:** Organiza o fluxo de trabalho em 4 etapas sequenciais.

**Referência de código:**
- [src/lib/core/data/gestao-alunos/def-objects/abstract.ts](../../../src/lib/core/data/gestao-alunos/def-objects/abstract.ts) - Definição principal
- [src/lib/core/data/gestao-alunos/phases.ts](../../../src/lib/core/data/gestao-alunos/phases.ts) - Configuração

---

## Tipos de Dados

### DRY.TYPE:Phase

**Tipo:** Union type literal

```typescript
export type Phase =
  | "FASE:DADOS_PESSOAIS"
  | "FASE:DADOS_ESCOLARES"
  | "FASE:HISTORICO_ESCOLAR"
  | "FASE:EMISSAO_DOCUMENTOS";
```

**Uso:** Tipagem de variáveis que representam fases do sistema.

**Localização:** [src/lib/core/data/gestao-alunos/def-objects/abstract.ts](../../../src/lib/core/data/gestao-alunos/def-objects/abstract.ts) (linha 43)

---

### DRY.TYPE:PhaseSchema

**Tipo:** Genérico mapeado

```typescript
export type PhaseSchema<T extends Phase> = {
  [L in (typeof phaseSchema)[T]["modelosEnvolvidos"][number]]: {
    [M in (typeof modelosPrismaSchema)[L]["scalarFields"][number]]: DocEmissao[];
  };
}
```

**Descrição:** Tipo genérico que mapeia os campos de cada modelo Prisma para os documentos que os requerem.

**Uso:** Definir schemas de validação por fase.

**Exemplo:**
```typescript
const dadosPessoais: PhaseSchema<"FASE:DADOS_PESSOAIS"> = {
  Aluno: {
    matricula: [],
    nome: [],
    // ...
  }
}
```

**Localização:** [src/lib/core/data/gestao-alunos/def-objects/abstract.ts](../../../src/lib/core/data/gestao-alunos/def-objects/abstract.ts) (linha 57)

---

### DRY.TYPE:ModelosPrismaFluxo

**Tipo:** Union type literal

```typescript
export type ModelosPrismaFluxo =
  | "Aluno"
  | "Enturmacao"
  | "SerieCursada"
  | "HistoricoEscolar";
```

**Descrição:** Modelos do Prisma que fazem parte do fluxo de gestão de alunos.

**Uso:** Filtrar modelos que participam do workflow principal.

**Localização:** [src/lib/core/data/gestao-alunos/def-objects/abstract.ts](../../../src/lib/core/data/gestao-alunos/def-objects/abstract.ts) (linha 33)

---

### DRY.TYPE:DocEmissao

**Tipo:** Union type literal

```typescript
type DocEmissao =
  | "Certidão"
  | "Certificado"
  | "Diploma"
  | "Histórico Escolar";
```

**Descrição:** Tipos de documentos que podem ser emitidos pelo sistema.

**Uso:** Especificar quais documentos requerem determinados campos.

**Localização:** [src/lib/core/data/gestao-alunos/def-objects/abstract.ts](../../../src/lib/core/data/gestao-alunos/def-objects/abstract.ts) (linha 55)

---

## Schemas de Campos por Fase

### dadosPessoais

**Tipo:** `PhaseSchema<"FASE:DADOS_PESSOAIS">`

**Arquivo:** [src/lib/core/data/gestao-alunos/def-objects/dadosPessoais.ts](../../../src/lib/core/data/gestao-alunos/def-objects/dadosPessoais.ts)

**Modelo:** `Aluno`

**Campos principais:**
- Identificação: id, matricula, nome, sexo, dataNascimento
- Documentação: rg, cpf, certidões
- Filiação: nomeMae, nomePai, cpfMae, cpfPai
- Naturalidade: nacionalidade, naturalidade, uf, paisNascimento
- Contato: email, nomeSocial
- Especiais: necessidadeEspecial

---

### dadosEscolares

**Tipo:** `PhaseSchema<"FASE:DADOS_ESCOLARES">`

**Arquivo:** [src/lib/core/data/gestao-alunos/def-objects/dadosEscolares.ts](../../../src/lib/core/data/gestao-alunos/def-objects/dadosEscolares.ts)

**Modelos:** `Aluno`, `SerieCursada`

**Campos principais:**

**Aluno:**
- matricula: ["Certidão", "Certificado"]
- nome: ["Certidão", "Certificado", "Diploma", "Histórico Escolar"]
- sexo: ["Certidão", "Certificado", "Diploma", "Histórico Escolar"]
- dataNascimento: ["Certidão", "Certificado", "Diploma", "Histórico Escolar"]
- nacionalidade: ["Certidão", "Certificado", "Diploma"]
- naturalidade: ["Certidão", "Certificado", "Diploma"]

**SerieCursada:**
- anoLetivo, modalidade, serie, turno, periodoLetivo
- unidadeEnsino, codigoEscola
- segmento, curso, situacao
- cargaHorariaTotal, frequenciaGlobal, totalPontos, situacaoFinal

---

### historicoEscolar

**Tipo:** `PhaseSchema<"FASE:HISTORICO_ESCOLAR">`

**Arquivo:** [src/lib/core/data/gestao-alunos/def-objects/historicoEscolar.ts](../../../src/lib/core/data/gestao-alunos/def-objects/historicoEscolar.ts)

**Modelos:** `SerieCursada`, `HistoricoEscolar`

**Campos principais:**

**HistoricoEscolar:**
- componenteCurricular: nome da disciplina
- cargaHoraria: carga horária da disciplina
- totalPontos: nota/pontos obtidos
- frequencia: percentual de frequência
- faltasTotais: número de faltas
- serieCursadaId: referência à série cursada

---

## Convenções de Nomenclatura

### IDs DRY para Objetos

Formato: `DRY.OBJECT:NOME_DO_OBJETO`

**Exemplos:**
```
DRY.OBJECT:PHASES
DRY.OBJECT:MODELOS_PRISMA
```

### IDs DRY para Tipos

Formato: `DRY.TYPE:NomeDoTipo`

**Exemplos:**
```
DRY.TYPE:Phase
DRY.TYPE:PhaseSchema
DRY.TYPE:DocEmissao
```

### Referências em Código

Ao documentar tipos, sempre incluir:
1. **Localização exata** (arquivo e linha)
2. **Definição do tipo** (código TypeScript)
3. **Descrição** (o que representa)
4. **Uso** (como e quando usar)
5. **Exemplo** (código demonstrativo)

---

## Como Usar Este Índice

### Para Desenvolvedores

1. **Procure o tipo/objeto** que precisa usar
2. **Leia a descrição** para entender o propósito
3. **Veja o exemplo** de uso
4. **Navegue até o código** usando os links de localização

### Para Documentação

1. **Referencie objetos** usando `[DRY.OBJECT:NOME]`
2. **Referencie tipos** usando `[DRY.TYPE:Nome]`
3. **Mantenha links atualizados** quando mover arquivos

### Para Validação

Execute regularmente:
```bash
pnpm validate:dry
```

Ou use a skill:
```
/validate-dry
```

---

---

## Tipos de Completude

### DRY.TYPE:CampoFaltante

**Tipo:** Interface

```typescript
export type CampoFaltante = {
  campo: string;    // Nome técnico do campo (ex: "dataNascimento")
  label: string;    // Nome legível (ex: "Data de nascimento")
  tabela: string;   // Tabela de origem (ex: "Aluno", "SerieCursada")
  fase: Phase;      // Fase a que pertence (ex: "FASE:DADOS_PESSOAIS")
};
```

**Descrição:** Representa um campo obrigatório que não está preenchido durante análise de completude.

**Uso:** Identificar e exibir campos que precisam ser preenchidos para completar um documento, fase ou processo.

**Localização:** [src/lib/core/data/gestao-alunos/documentos/calcularCompletude.ts](../../../src/lib/core/data/gestao-alunos/documentos/calcularCompletude.ts) (linha 19)

**Exemplo:**
```typescript
const campoFaltante: CampoFaltante = {
  campo: "dataNascimento",
  label: "Data de nascimento",
  tabela: "Aluno",
  fase: "FASE:DADOS_PESSOAIS"
};
```

**Referências:**
- Usado em [DRY.TYPE:CompletudeItem]
- Consumido por [DRY.UI:CARD_COMPLETUDE_COM_DETALHAMENTO]
- Gerado por [DRY.BACKEND:CALCULAR_COMPLETUDE_DOCUMENTOS]

---

### DRY.TYPE:CompletudeItem

**Tipo:** Genérico

```typescript
export type CompletudeItem<TItem extends string> = {
  item: TItem;                    // Identificador do item analisado
  status: PhaseStatus;            // "completo" | "incompleto" | "ausente"
  percentual: number;             // 0-100
  camposPreenchidos: number;      // Quantidade de campos preenchidos
  totalCampos: number;            // Quantidade total de campos obrigatórios
  camposFaltantes: CampoFaltante[]; // Lista de campos não preenchidos
};

// Uso específico para documentos
export type CompletudeDocumento = CompletudeItem<DocEmissao>;
```

**Descrição:** Resultado genérico de análise de completude para um item específico (documento, fase, etapa, seção).

**Uso:** Armazenar resultado detalhado da análise de completude de um único item.

**Localização:** [src/lib/core/data/gestao-alunos/documentos/calcularCompletude.ts](../../../src/lib/core/data/gestao-alunos/documentos/calcularCompletude.ts) (linha 26)

**Exemplo:**
```typescript
const completudeCertidao: CompletudeDocumento = {
  documento: "Certidão",
  status: "incompleto",
  percentual: 85,
  camposPreenchidos: 17,
  totalCampos: 20,
  camposFaltantes: [
    { campo: "cpf", label: "CPF", tabela: "Aluno", fase: "FASE:DADOS_PESSOAIS" },
    { campo: "rg", label: "RG", tabela: "Aluno", fase: "FASE:DADOS_PESSOAIS" },
    { campo: "nomePai", label: "Nome do pai", tabela: "Aluno", fase: "FASE:DADOS_PESSOAIS" }
  ]
};
```

**Generalização:**
```typescript
// Para outros contextos
type CompletudeImportacao = CompletudeItem<TipoImportacao>;
type CompletudeFase = CompletudeItem<Phase>;
type CompletudeSecao = CompletudeItem<SecaoFormulario>;
```

**Referências:**
- Usado em [DRY.TYPE:ResumoCompletude]
- Retornado por [DRY.BACKEND:CALCULAR_COMPLETUDE_DOCUMENTOS]
- Consumido por [DRY.UI:CARD_COMPLETUDE_COM_DETALHAMENTO]

---

### DRY.TYPE:ResumoCompletude

**Tipo:** Genérico

```typescript
export type ResumoCompletude<TItem extends string> = {
  statusGeral: PhaseStatus;        // Status consolidado de todos os itens
  itensProntos: number;            // Quantidade de itens com status "completo"
  totalItens: number;              // Total de itens analisados
  porItem: Record<TItem, CompletudeItem<TItem>>; // Detalhes por item
};

// Uso específico para emissão de documentos
export type ResumoCompletudeEmissao = ResumoCompletude<DocEmissao>;
```

**Descrição:** Consolidação genérica de análise de completude para múltiplos itens relacionados.

**Uso:** Armazenar resultado agregado da análise de completude de um conjunto de itens.

**Localização:** [src/lib/core/data/gestao-alunos/documentos/calcularCompletude.ts](../../../src/lib/core/data/gestao-alunos/documentos/calcularCompletude.ts) (linha 35)

**Exemplo:**
```typescript
const resumo: ResumoCompletudeEmissao = {
  statusGeral: "incompleto",
  documentosProntos: 2,
  totalDocumentos: 4,
  porDocumento: {
    "Certidão": { /* CompletudeDocumento */ },
    "Certificado": { /* CompletudeDocumento */ },
    "Diploma": { /* CompletudeDocumento */ },
    "Histórico Escolar": { /* CompletudeDocumento */ }
  }
};

// Acessar documento específico
const certidao = resumo.porDocumento["Certidão"];
console.log(`Certidão: ${certidao.percentual}% completa`);
```

**Lógica de Status Geral:**
```typescript
// Determinar statusGeral baseado nos itens:
if (todos os itens completos) → statusGeral = "completo"
else if (todos os itens ausentes) → statusGeral = "ausente"
else → statusGeral = "incompleto"
```

**Generalização:**
```typescript
// Para outros contextos
type ResumoImportacao = ResumoCompletude<TipoImportacao>;
type ResumoFases = ResumoCompletude<Phase>;
type ResumoFormulario = ResumoCompletude<SecaoFormulario>;
```

**Referências:**
- Contém múltiplos [DRY.TYPE:CompletudeItem]
- Retornado por [DRY.BACKEND:CALCULAR_COMPLETUDE_DOCUMENTOS]
- Prop principal de [DRY.UI:CARD_COMPLETUDE_COM_DETALHAMENTO]

---

## Próximas Documentações

Tipos e objetos a serem documentados:

- [ ] `DRY.OBJECT:MODELOS_PRISMA` - Schema completo do Prisma
- [ ] `DRY.TYPE:GestaoAlunos` - Interface de configuração de fases
- [ ] `DRY.TYPE:ModelosPrismaSchema` - Schema de metadados dos modelos
- [ ] Enums do Prisma (se houver)
- [ ] Tipos de importação (ProfileImport, etc.)
