import type { ArquivoImportado, LinhaImportada } from "@prisma/client";
import type { ParsedCsv } from "@/lib/hash";

export type CsvField = {
  column: string;
  prefixes?: string[];
};

export type CsvProfile = {
  tipoArquivo: string;
  tipoEntidade: "aluno";
  requiredHeaders: string[];
  duplicateKey: CsvField;
  displayName: CsvField[];
  context: {
    periodo: CsvField;
    grupo: CsvField;
    modalidade?: CsvField;
    serie?: CsvField;
    turno?: CsvField;
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
