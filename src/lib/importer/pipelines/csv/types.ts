import type { ArquivoImportado, LinhaImportada } from "@prisma/client";
import type { CampoConfig, KeyBuilderId } from "@/lib/parsers/tipos";

export type ImportField = {
  column: string;
  prefixes?: string[];
};

export type FieldRole = "key" | "display" | "context";

export type FieldSource = {
  header?: string;
  headers?: string[];
  prefixes?: string[];
};

export type FieldPersist =
  | { tipo: "vinculacao"; modelo: string; campo: string }
  | { tipo: "gravacao"; modelo: string; campo: string }
  | { tipo: "composicao" };

export type FieldNormalize =
  | { type: "string"; transform?: "uppercase" | "lowercase" | "trim" }
  | { type: "number"; format: "int" | "float" }
  | { type: "date"; inputFormat: "DD/MM/YYYY"; outputFormat: "YYYY-MM-DD" }
  | { type: "none" };

export type ImportFieldDef = {
  name: string;
  source: FieldSource;
  required?: boolean;
  roles: FieldRole[];
  persist: FieldPersist;
  normalize?: FieldNormalize;
};

export type ImportProfile = {
  formato: "CSV" | "XLSX" | "TXT";
  tipoArquivo: string;
  tipoEntidade: string;
  fields?: ImportFieldDef[];
  summaryDeleteKeysSource?: "enturmacoes-por-turma" | "none";
  cleanupStrategy?: "markFonteAusenteAluno" | "none";
  persistorId?: string;
  chavesDisponiveis?: KeyBuilderId[];
  campos?: Record<string, CampoConfig>;
  importAdapterId?: string;
  summaryAdapterId?: string;
  deleteAdapterId?: string;
};

export type ImportOutcome<DomainResult> = {
  arquivo: ArquivoImportado;
  linhasImportadas: number;
  dataHash: string;
  domain: DomainResult;
};

export class DuplicateFileError extends Error {
  fileId?: string;

  constructor(message = "Arquivo com conteúdo idêntico já existe", fileId?: string) {
    super(message);
    this.name = "DuplicateFileError";
    this.fileId = fileId;
  }
}

export type CsvResumoGrupo = {
  nome: string;
  totalCsv: number;
  totalBanco: number;
  pendentes: number;
  status: "ok" | "pendente";
  pendentesDetalhe?: { chave: string; nome: string }[];
};

export type CsvResumoPeriodo = {
  periodo: string;
  grupos: CsvResumoGrupo[];
  resumo: {
    totalGrupos: number;
    totalCsv: number;
    totalBanco: number;
    pendentes: number;
    status: "ok" | "pendente";
  };
};
