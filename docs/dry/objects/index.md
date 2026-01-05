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
  | "Certificado/Certidão"
  | "Apenas Certificado"
  | "Apenas Certidão"
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
- matricula: ["Certificado/Certidão"]
- nome: ["Certificado/Certidão", "Histórico Escolar"]
- sexo: ["Certificado/Certidão", "Histórico Escolar"]
- dataNascimento: ["Certificado/Certidão", "Histórico Escolar"]
- nacionalidade: ["Certificado/Certidão"]
- naturalidade: ["Certificado/Certidão"]

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

## Próximas Documentações

Tipos e objetos a serem documentados:

- [ ] `DRY.OBJECT:MODELOS_PRISMA` - Schema completo do Prisma
- [ ] `DRY.TYPE:GestaoAlunos` - Interface de configuração de fases
- [ ] `DRY.TYPE:ModelosPrismaSchema` - Schema de metadados dos modelos
- [ ] Enums do Prisma (se houver)
- [ ] Tipos de importação (ProfileImport, etc.)