# TÉCNICO: Colagem de Dados Escolares

**Status:** 🟡 Em planejamento
**Metodologia:** CIF (Ciclo de Integridade de Funcionalidades)
**Fase:** TÉCNICO
**Criado em:** 2025-11-14
**Última atualização:** 2025-11-14

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

- Reutiliza o stack existente: Next.js (App Router) + SWR + Prisma + Vitest.
- `useModoColagem` passa a trabalhar com múltiplas categorias (`pessoais`, `escolares`) compartilhando mesmos eventos de colagem e confirmação.
- Modal `ModalConfirmacaoDados` renderiza seções em tabs; a de dados escolares é somente leitura.

### 1.2 Sequência de Eventos

1. Usuário ativa modo colagem para um aluno.
2. Evento global `paste` dispara `handlePaste` com o texto bruto.
3. Frontend chama `POST /api/importacao-estruturada` enviando `{ categoria: 'dadosEscolares', texto, alunoId }`.
4. API valida matrícula, executa parser `parseDadosEscolares` e devolve `dadosNormalizados`.
5. Modal exibe dados; ao confirmar, frontend chama `POST /api/importacao-estruturada/salvar`.
6. API persiste JSON + texto, atualiza timestamps e retorna o aluno atualizado.
7. Hooks SWR (`useAlunoSelecionado`, `useAlunosCertificacao`) chamam `mutate` para refletir indicador verde.

---

## 2. MODELAGEM DE BANCO DE DADOS

### 2.1 Estrutura JSON

Será criado um campo JSON dedicado:

```ts
type DadosEscolares = {
  meta: {
    importadoEm: string;
    fonte: 'colagem-texto';
    usuarioId: string;
  };
  aluno: {
    inscricaoMatriculaFacil: string | null;
    matricula: string;
    situacao: string | null;
    causaEncerramento: string | null;
    motivo: string | null;
  };
  ingresso: {
    ano: string;
    periodo: string;
    dataInclusao: string | null;
    tipo: string | null;
    redeOrigem: string | null;
  };
  escolaridadeAtual: {
    unidadeCodigo: string | null;
    unidadeDescricao: string | null;
    nivelSegmento: string | null;
    modalidade: string | null;
    cursoCodigo: string | null;
    cursoDescricao: string | null;
    turno: string | null;
    matrizCurricular: string | null;
    serieAno: string | null;
    recebeOutroEspaco: boolean | null;
  };
  renovacao: Array<{
    anoLetivo: string;
    periodoLetivo: string;
    unidade: { codigo: string | null; descricao: string };
    modalidadeSegmentoCurso: string | null;
    serieAno: string | null;
    turno: string | null;
    ensinoReligioso: string | null;
    linguaEstrangeira: string | null;
    situacao: string | null;
    tipoVaga: string | null;
  }>;
  historicoConfirmacao: Array<{
    codigo: string;
    anoLetivo: string;
    periodoLetivo: string;
    unidade: { codigo: string | null; descricao: string };
    modalidadeSegmentoCurso: string | null;
    serieAno: string | null;
    turno: string | null;
    dataSugerida: string | null;
    situacao: string | null;
    dataSituacao: string | null;
  }>;
};
```

### 2.2 Prisma

Adicionar ao modelo `Aluno`:

```prisma
dadosEscolares Json?
```

Além de manter `textoBrutoDadosEscolares` e timestamps já existentes. Migration deve incluir índice parcial:

```prisma
@@index([dataImportacaoTextoDadosEscolares])
```

para facilitar auditorias.

### 2.3 Armazenamento de Texto Bruto

`textoBrutoDadosEscolares` continuará salvando o payload bruto. Precisamos garantir `@db.Text` para não truncar entradas longas.

---

## 3. COMPONENTES FRONTEND

| Componente / Hook                  | Atualização                                                                 |
|-----------------------------------|-----------------------------------------------------------------------------|
| `useModoColagem`                  | Adicionar `categoriaAtiva`, `dadosPorCategoria`, `statusPorCategoria`.     |
| `ModalConfirmacaoDados`           | Receber `dadosEscolares` e renderizar seção em acordeão somente leitura.   |
| `ListaAlunosCertificacao`         | Renderizar dois indicadores lado a lado antes da matrícula.                |
| `StatusIndicadorColagem` (novo)   | Abstração que desenha badge + cores (pessoal = `X/Y`, escolar = check).    |
| `AreaColagemDados`                | Mensagem deve mencionar categoria alvo (para evitar erro de usuário).      |

---

## 4. APIS BACKEND

### 4.1 `POST /api/importacao-estruturada`

Payload base:

```json
{
  "alunoId": "uuid",
  "categoria": "dadosEscolares",
  "texto": "<conteudo colado>"
}
```

Passos:
1. Verificar se aluno existe.
2. Validar categoria suportada.
3. Limpar menus/breadcrumbs (regex `^\s*(Alunos|Gestão Escolar|EditarNovoAlunos)` etc até chegar em `Aluno`).
4. Chamar `parseDadosEscolares(textoLimpo, matriculaSelecionada)`.
5. Retornar `{ dadosNormalizados, textoLimpo }`.

### 4.2 `POST /api/importacao-estruturada/salvar`

Payload:

```json
{
  "alunoId": "uuid",
  "categoria": "dadosEscolares",
  "dados": { ...estrutura normalizada... },
  "textoBruto": "<original>"
}
```

Ações:
- Persistir `dadosEscolares = dados`.
- Atualizar `textoBrutoDadosEscolares` e `dataImportacaoTextoDadosEscolares = now()`.
- Acionar auditoria com diff entre JSON antigo e novo.
- Retornar aluno atualizado (para SWR `mutate`).

---

## 5. MÓDULO DE PARSING

Arquivo novo: `src/lib/parsing/parseDadosEscolares.ts`.

### 5.1 Pipeline

1. `sanitizeDadosEscolares(texto)` → remove menus, collapse espaços duplicados, converte tabs para `	`.
2. `splitSections` → identifica blocos (`Aluno`, `Dados de Ingresso`, etc) usando regex `^([A-ZÁ-Ú/ ]+)$`.
3. `parseAlunoSection` → extrai inscrição, matrícula, situação, causa, motivo.
4. `parseIngressoSection` → extrai ano/período (removendo `<` `>`), data e rede.
5. `parseEscolaridadeSection` → trata linhas com código + descrição (split por tab).
6. `parseTabelaRenovacao` e `parseHistoricoConfirmacao` → mapeiam cabeçalhos para índices.
7. `buildHistoricoUnificado` → injeta ano/período de ingresso se não encontrado.

### 5.2 Helpers

- `normalizeBoolean(value)` → converte “SIM”, “NÃO”, “NÃO RECEBE” para boolean/null.
- `splitCodigoDescricao(value)` → retorna `{ codigo, descricao }` quando texto segue `12345 - Texto`.
- `parseDateTimeFlex` → aceita `DD/MM/YYYY HH:MM:SS` ou apenas data.

### 5.3 Testes

Adicionar `tests/lib/parsing/parseDadosEscolares.test.ts` com fixtures reais (exemplo fornecido + casos limite: linha vazia, tabela sem dados, campos com `<2022>` etc).

---

## 6. FLUXO DE DADOS

1. Usuário ativa modo colagem escolar.
2. `useModoColagem` registra categoria e aguarda evento `paste`.
3. Texto é enviado à API e retorna JSON + texto limpo.
4. Estado local `dadosPorCategoria.escolares` é preenchido; modal abre automaticamente.
5. Usuário confirma → `confirmarDados('dadosEscolares')` chama endpoint de salvamento.
6. Backend grava dados, atualiza timestamps e retorna aluno.
7. Hooks SWR revalidam; `ListaAlunosCertificacao` recebe `dataImportacaoTextoDadosEscolares` atualizado e desenha check verde.

---

## 7. DECISÕES TÉCNICAS

1. **JSON único para o bloco escolar:** facilita versionamento e evita criar dezenas de campos novos em `Aluno`.
2. **Texto bruto preservado:** garante auditoria e permite reprocessamento caso parser seja ajustado.
3. **Sem edição no modal:** reduz risco de divergência com fonte oficial; qualquer ajuste exige nova colagem.
4. **Indicadores desacoplados:** componente de status recebe `variant` (`pessoais`/`escolares`) e decide apresentação.
5. **Parser tolerante a ruído:** regexes removem breadcrumb antes de tentar identificar seções, evitando falsos negativos.
6. **Reimportação idempotente:** cada importação substitui o JSON inteiro (sem merge parcial), reduzindo complexidade.
7. **Logs estruturados:** APIs devem registrar `alunoId`, `categoria`, `hash(texto)` e resultado para auditoria (detalhar no CICLO).

