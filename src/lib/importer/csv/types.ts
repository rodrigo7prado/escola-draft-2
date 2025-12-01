import type { ArquivoImportado, LinhaImportada } from "@prisma/client";
import type { ParsedCsv } from "@/lib/hash";

export type ImportField = {
  column: string;
  prefixes?: string[];
};

export type ImportProfile = {
  formato: "csv" | "xlsx" | "txt" | string;
  tipoArquivo: string;
  tipoEntidade: "aluno";
  requiredHeaders: string[];
  duplicateKey: ImportField;
  displayName: ImportField[];
  existingKeysSource?: "enturmacoes" | "none";
  cleanupStrategy?: "markFonteAusenteAluno" | "none";
  context: {
    periodo: ImportField;
    grupo: ImportField;
    modalidade?: ImportField;
    serie?: ImportField;
    turno?: ImportField;
  };
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
