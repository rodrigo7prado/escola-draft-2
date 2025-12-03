import type { ImportProfile } from "@/lib/importer/pipelines/csv/types";

export const ataResultadosFinaisProfile: ImportProfile = {
  // Formato do arquivo a importar
  formato: "CSV",
  // Tag armazenada em ArquivoImportado.tipo e usada no hash/dedupe
  tipoArquivo: "ata-resultados-finais",
  // Tipo persistido em LinhaImportada.tipoEntidade
  tipoEntidade: "aluno",
  // Catálogo declarativo de campos (chave/display/contexto/persistência)
  fields: [
    {
      name: "matricula",
      source: { header: "ALUNO" },
      required: true,
      roles: ["key"],
      persist: { tipo: "vinculacao", modelo: "Aluno", campo: "matricula" },
    },
    {
      name: "nome",
      source: { headers: ["NOME_COMPL", "NOME"] },
      required: false,
      roles: ["display"],
      persist: { tipo: "gravacao", modelo: "Aluno", campo: "nome" },
    },
    {
      name: "anoLetivo",
      source: { header: "Ano", prefixes: ["Ano Letivo:", "Ano:"] },
      required: true,
      roles: ["context"],
      persist: { tipo: "composicao" },
    },
    {
      name: "turma",
      source: { header: "TURMA", prefixes: ["Turma:"] },
      required: true,
      roles: ["context"],
      persist: { tipo: "composicao" },
    },
    {
      name: "modalidade",
      source: { header: "MODALIDADE", prefixes: ["Modalidade:"] },
      required: true,
      roles: ["context"],
      persist: { tipo: "composicao" },
    },
    {
      name: "serie",
      source: { header: "SERIE", prefixes: ["Série:"] },
      required: true,
      roles: ["context"],
      persist: { tipo: "composicao" },
    },
    {
      name: "turno",
      source: { header: "TURNO", prefixes: ["Turno:"] },
      required: false,
      roles: ["context"],
      persist: { tipo: "composicao" },
    },
  ],
  // 1. Fonte de chaves existentes para comparação em resumo/delete
  summaryDeleteKeysSource: "enturmacoes-por-turma",
  // 2. IDs dos adapters resolvidos pelo registry
  importAdapterId: "csv",
  summaryAdapterId: "csv-enturmacoes",
  deleteAdapterId: "csv-delete",
  // 3. Persistor de domínio a ser invocado após ingestão
  persistorId: "alunosEnturmacoes",
  // 4. Opções de chave oferecidas ao cliente para vinculação
  chavesDisponiveis: ["nomeDataNascimento", "nome"],
};
