import type { CsvProfile } from "@/lib/importer/csv/types";

export const ataResultadosFinaisProfile: CsvProfile = {
  tipoArquivo: "ata-resultados-finais",
  tipoEntidade: "aluno",
  requiredHeaders: [
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
  ],
  duplicateKey: {
    column: "ALUNO",
  },
  existingKeysSource: "enturmacoes",
  displayName: [
    { column: "NOME_COMPL" },
    { column: "NOME" },
  ],
  context: {
    periodo: { column: "Ano", prefixes: ["Ano Letivo:", "Ano:"] },
    grupo: { column: "TURMA", prefixes: ["Turma:"] },
    modalidade: { column: "MODALIDADE", prefixes: ["Modalidade:"] },
    serie: { column: "SERIE", prefixes: ["Série:"] },
    turno: { column: "TURNO", prefixes: ["Turno:"] },
  },
};
