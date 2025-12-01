## DRY.BE: Importação CSV Declarativa (handlers + pipeline + resumo)
Alias global: [DRY.BE:IMPORTACAO_CSV]

### Visão geral e partes orquestradas
Abstração genérica que transforma um `CsvProfile` em endpoints de importação CSV plug-and-play. A orquestração fixa combina: 
  1. Pipeline de ingestão com hash/dedupe, persistência imutável e projeção de domínio;
  2. Construtor de resumo agnóstico que cruza importados com chaves existentes para calcular pendências;
  3. Perfis declarativos que habilitam novos importadores apenas configurando valores. Nenhum bloco conhece a categoria; toda semântica vem do profile.

### 1. Pipeline declarativo (ingestão + domínio)
- Localização: `src/lib/importer/csv/pipeline.ts`, `handlers.ts`, `persistors/*`.  
- Entrada: dados parseados (headers/rows) e `CsvProfile` contendo `duplicateKey`, `displayName`, `context`, `tipoArquivo`/`tipoEntidade`.  
- POST (handlers): valida presença de `data`/`fileName`, chama `runCsvImport` com profile e opções de transação; responde 201 com contagens ou 409 com `fileId` em duplicata de hash.
- `runCsvImport`: calcula hash determinístico (`hashData`), bloqueia duplicata ativa (`DuplicateFileError`), cria `ArquivoImportado` e `LinhaImportada` em transação única, delega projeção de domínio ao persistidor resolvido por `tipoEntidade` (hoje apenas `persistAlunosDomain`; demais tipos são no-op).
- Persistência de domínio (alunos): cria/reativa alunos e enturmações a partir de `duplicateKey`/`context`; usa `displayName` para nome; não há lógica específica de categoria além dos valores declarados.
- Deduplicação interna: `identificadorChave` preenchido via `duplicateKey`; hash independe da ordem de linhas/headers.
- DELETE (handlers): escopos configuráveis (`id` e/ou `periodo` via `deleteScopes`); executa remoção real de enturmações, alunos, linhas e arquivos em transação.
- Limites atuais: validação de `requiredHeaders` não ocorre no backend (feito no DropCsv); persistidor disponível apenas para `aluno`; `cleanupStrategy` ainda não aplicada.
- Extensão: novo `tipoEntidade` pode ganhar persistidor sem alterar pipeline/handlers; basta resolver no dispatcher.

### 2. Resumo agnóstico (pendências vs existentes)
- Localização: `src/lib/importer/csv/summary.ts`, `existing.ts`.
- GET (handlers): busca `LinhaImportada` ativa pelo `tipoEntidade` do profile e carrega chaves existentes via `loadExistingKeys` (hoje suporta `existingKeysSource` = enturmações).
- `buildPeriodoResumo`: agrupa por `context.periodo`/`context.grupo`, extrai chave (`duplicateKey`) e nome (`displayName`), calcula `totalCsv`, `totalBanco` (tamanho do conjunto existente) e pendentes (chaves ausentes); ordena grupos/períodos de forma determinística.
- Serializer padrão: converte o resumo em payload neutro (`periodos/resumo/turmas`) sem strings de categoria; pode ser trocado via `summaryBuilder`/`summarySerializer` passados ao handler.
- Propriedades: mantém detalhes de pendentes opcionais; não depende de labels da origem; funciona para qualquer profile que declare contexto e fonte de chaves existentes.
- Limites: novas fontes de chaves existentes exigem extensão de `loadExistingKeys`; assume que `context` está preenchido corretamente no profile.

### 3. Perfis declarativos (valores)
- Localização: `src/lib/importer/profiles/*` (ex.: `ataResultadosFinaisProfile`).
- Papel: definir, via valores, como extrair chave, nome e contexto; qual fonte de chaves existentes usar; qual tipo de domínio persistir; quais headers o frontend deve exigir.
- Campos em uso no fluxo: `duplicateKey`, `displayName`, `context` (periodo/grupo/modalidade/serie/turno), `existingKeysSource` (opcional; ex.: enturmações), `tipoArquivo`/`tipoEntidade`, `requiredHeaders`; `cleanupStrategy` ainda não aplicada.
- Handlers: `createCsvRouteHandlers` injeta apenas o profile e opções (transação, deleteScopes, summaryBuilder/serializer); não há lógica específica de categoria nos handlers.
- Novo importador: criar um profile com esses campos e apontar rota/handler para ele; pipeline, handlers e resumo funcionam sem modificações de código.
