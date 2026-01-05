# *`DRY.OBJECT:PHASES`*

Sistema de fases para gestão de alunos e emissão de documentos.

## Localização

- **Definição principal:** [src/lib/core/data/gestao-alunos/def-objects/abstract.ts](../../../src/lib/core/data/gestao-alunos/def-objects/abstract.ts)
- **Configuração de fases:** [src/lib/core/data/gestao-alunos/phases.ts](../../../src/lib/core/data/gestao-alunos/phases.ts)
- **Definições de campos por fase:**
  - [dadosPessoais.ts](../../../src/lib/core/data/gestao-alunos/def-objects/dadosPessoais.ts)
  - [dadosEscolares.ts](../../../src/lib/core/data/gestao-alunos/def-objects/dadosEscolares.ts)
  - [historicoEscolar.ts](../../../src/lib/core/data/gestao-alunos/def-objects/historicoEscolar.ts)

## Visão Geral

O sistema de fases organiza o fluxo de trabalho de gestão de alunos em 4 etapas sequenciais, cada uma com seus campos obrigatórios e modelos Prisma associados.

## Fases Definidas

### Constante PHASES

```typescript
export const PHASES = [
  "FASE:DADOS_PESSOAIS",
  "FASE:DADOS_ESCOLARES",
  "FASE:HISTORICO_ESCOLAR",
  "FASE:EMISSAO_DOCUMENTOS",
] as const;

export type Phase = (typeof PHASES)[number];
```

### 1. FASE:DADOS_PESSOAIS

- **Título:** "Dados Pessoais"
- **Ícone:** `UserCheck` (Lucide)
- **Modelos envolvidos:** `Aluno`
- **Definição de campos:** [dadosPessoais.ts](../../../src/lib/core/data/gestao-alunos/def-objects/dadosPessoais.ts)

**Campos principais:**
- Identificação: matricula, nome, sexo, dataNascimento
- Documentação: rg, cpf, certidão civil
- Filiação: nomeMae, nomePai, cpfMae, cpfPai
- Naturalidade: nacionalidade, naturalidade, uf
- Outros: email, nomeSocial, necessidadeEspecial

### 2. FASE:DADOS_ESCOLARES

- **Título:** "Dados Escolares"
- **Ícone:** `School2` (Lucide)
- **Modelos envolvidos:** `Aluno`, `SerieCursada`
- **Definição de campos:** [dadosEscolares.ts](../../../src/lib/core/data/gestao-alunos/def-objects/dadosEscolares.ts)

**Campos do Aluno:**
- Dados para documentos: matricula, nome, sexo, dataNascimento, nacional idade, naturalidade

**Campos da SerieCursada:**
- Período: anoLetivo, modalidade, serie, turno, periodoLetivo
- Unidade: unidadeEnsino, codigoEscola
- Curso: segmento, curso, situacao
- Resultados: cargaHorariaTotal, frequenciaGlobal, totalPontos, situacaoFinal

### 3. FASE:HISTORICO_ESCOLAR

- **Título:** "Histórico Escolar"
- **Ícone:** `FileText` (Lucide)
- **Modelos envolvidos:** `SerieCursada`, `HistoricoEscolar`
- **Definição de campos:** [historicoEscolar.ts](../../../src/lib/core/data/gestao-alunos/def-objects/historicoEscolar.ts)

**Campos do HistoricoEscolar:**
- Disciplina: componenteCurricular
- Desempenho: totalPontos, frequencia
- Carga: cargaHoraria, faltasTotais
- Referência: serieCursadaId

### 4. FASE:EMISSAO_DOCUMENTOS

- **Título:** "Emissão de Documentos"
- **Ícone:** `FileCheck` (Lucide)
- **Modelos envolvidos:** (nenhum - fase de processamento)

**Modos de emissão:**
1. Certificado/Certidão
2. Apenas Certificado
3. Apenas Certidão
4. Histórico Escolar

## Estrutura de Dados

### phaseSchema

Mapeia cada fase para os modelos Prisma envolvidos:

```typescript
export const phaseSchema = {
  "FASE:DADOS_PESSOAIS": {
    modelosEnvolvidos: ["Aluno"]
  },
  "FASE:DADOS_ESCOLARES": {
    modelosEnvolvidos: ["Aluno", "SerieCursada"]
  },
  "FASE:HISTORICO_ESCOLAR": {
    modelosEnvolvidos: ["SerieCursada", "HistoricoEscolar"]
  },
  "FASE:EMISSAO_DOCUMENTOS": {
    modelosEnvolvidos: []
  },
} as const;
```

### PhaseSchema<T>

Tipo genérico que mapeia os campos de cada modelo para os documentos que os requerem:

```typescript
export type PhaseSchema<T extends Phase> = {
  [L in (typeof phaseSchema)[T]["modelosEnvolvidos"][number]]: {
    [M in (typeof modelosPrismaSchema)[L]["scalarFields"][number]]: DocEmissao[];
  };
}
```

**Exemplo de uso:**
```typescript
const dadosEscolares: PhaseSchema<"FASE:DADOS_ESCOLARES"> = {
  Aluno: {
    nome: ["Certificado/Certidão", "Histórico Escolar"],
    sexo: ["Certificado/Certidão", "Histórico Escolar"],
    dataNascimento: ["Certificado/Certidão", "Histórico Escolar"],
    // ...
  },
  SerieCursada: {
    // ...
  }
}
```

## Tipos Auxiliares

### ModelosPrismaFluxo

Modelos que fazem parte do fluxo de gestão de alunos:

```typescript
export type ModelosPrismaFluxo = "Aluno" | "Enturmacao" | "SerieCursada" | "HistoricoEscolar";
```

### DocEmissao

Tipos de documentos que podem ser emitidos:

```typescript
type DocEmissao =
  | "Certificado/Certidão"
  | "Apenas Certificado"
  | "Apenas Certidão"
  | "Histórico Escolar";
```

## Uso na Interface

### Exibição de Status

Cada [DRY.CONCEPT:ITEM_ALUNO](../ui/ui-macro.md#212-dryconceptitem_aluno) exibe ícones de status para cada fase usando [DRY.UI:AGREGADOR_ICONES_STATUS](../ui/ui-components.dry.md#4-agregador-ícones-status).

### Validação de Completude

O sistema valida se todos os campos obrigatórios de uma fase estão preenchidos antes de permitir avançar para a próxima fase usando [DRY.UI:ANALISE_COMPLETUDE_DE_DADOS](../ui/ui-components.dry.md#7-análise-completude-de-dados).

## Referências Relacionadas

- [DRY.CONCEPT:PAINEL_GESTAO_ALUNOS](../ui/ui-macro.md#2-dryconceptpainel_gestao_alunos)
- [DRY.UI:ANALISE_COMPLETUDE_DE_DADOS](../ui/ui-components.dry.md#7-análise-completude-de-dados)
- [DRY.BACKEND:IMPORT_PROFILE](../backend/imports/import-profile/backend.dry.md#importação-de-perfil)