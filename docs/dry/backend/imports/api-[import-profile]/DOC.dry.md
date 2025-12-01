## DRY.BE: Importação Declarativa (handlers + adapters + pipelines)
Alias global: [DRY.BE:IMPORTACAO]

### Visão geral e partes orquestradas
Abstração genérica que transforma um `ImportProfile` em endpoints plugáveis. A orquestração fixa é 100% declarada no profile por meio de IDs de adapters:
  1. `importAdapterId` → como ler o input (sempre multipart) e qual pipeline usar (CSV clássico ou genérico);
  2. `summaryAdapterId` → como serializar o resumo (ex.: `csv-enturmacoes` ou `chaves-default`);
  3. `deleteAdapterId` → como tratar DELETE (ex.: `csv-delete` ou `none`);
  4. Pipelines (`runCsvImport` ou `runGenericImport`) cuidam de hash/dedupe, persistência imutável e projeção de domínio.
Nenhum handler contém semântica de domínio; tudo é resolvido pelos adapters apontados no profile.

### 1. Adapters (entrada, resumo, exclusão)
- Localização: `src/lib/importer/adapters/*`  
- `importAdapters`: `declarative-multipart` (usa `runGenericImport` com extrator/serializador declarados) e `csv-multipart` (parseia texto com `parseCsvLoose` e usa `runCsvImport`).
- `summaryAdapters`: `csv-enturmacoes` (aplica `buildPeriodoResumo`/`loadExistingKeys` e serializa em períodos/turmas) e `chaves-default` (devolve `chavesDisponiveis`/pendências vazias).
- `deleteAdapters`: `csv-delete` (por id/período via `deleteArquivoPorId`/`deleteArquivosPorPeriodo`) e `none` (405).
- O handler (`createImportRouteHandlers`) apenas despacha para os adapters definidos pelo profile; nenhuma string de domínio fica no handler.

### 2. Pipelines (ingestão + domínio)
- `runCsvImport` (clássico): `src/lib/importer/csv/pipeline.ts`. Entrada: `ParsedCsv`; calcula hash determinístico (`hashData`), bloqueia duplicata (`DuplicateFileError`), cria `ArquivoImportado`/`LinhaImportada`, delega persistência ao persistor resolvido pelo `tipoEntidade` (ex.: `persistAlunosDomain`).
- `runGenericImport` (declarativo): `src/lib/importer/generic/pipeline.ts`. Entrada: buffer; usa `extratorId`/`serializadorId`/`persistorId` do profile para extrair/flatten/persistir.
- Deduplicação: `runCsvImport` segue hash por conteúdo normalizado; `runGenericImport` usa hash policy declarada (`hashPolicyId`).
- Persistência: adapters/persistores continuam separados do handler; nenhum comportamento específico fica no handler.

### 3. Perfis declarativos (valores)
- Localização: `src/lib/importer/profiles/*` (ex.: `ataResultadosFinaisProfile`).
- Campos principais: `formato`, `tipoArquivo`, `tipoEntidade`, `requiredHeaders`, `duplicateKey`, `displayName`, `context`, `existingKeysSource`, `extratorId`, `serializadorId`, `persistorId`, `hashPolicyId`, `chavesDisponiveis`, e os IDs de adapters (`importAdapterId`, `summaryAdapterId`, `deleteAdapterId`).
- Entrada única: multipart com campo `file` (e, se aplicável, `selectedKeyId`/`alunoId`). O adapter de importação decide se usa pipeline CSV ou genérico.
- Resumo/DELETE: controlados pelos adapters declarados; nenhuma regra fixa no handler.
