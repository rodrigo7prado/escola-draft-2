import type { ArquivoImportado, LinhaImportada, Prisma } from "@prisma/client";
import type { ParsedCsv } from "@/lib/hash";

export type CsvPersistContext<Row extends Record<string, string>> = {
  rows: Row[];
  linhas: LinhaImportada[];
  arquivo: ArquivoImportado;
  dataHash: string;
  fileName: string;
};

export type CsvImportAdapter<Row extends Record<string, string>, DomainResult> = {
  tipoArquivo: string;
  tipoEntidade: string;
  duplicateKey: (row: Row) => string;
  buildLinha: (
    row: Row,
    numeroLinha: number,
    arquivoId: string
  ) => Prisma.LinhaImportadaCreateManyInput;
  persistDomain: (
    tx: Prisma.TransactionClient,
    ctx: CsvPersistContext<Row>
  ) => Promise<DomainResult>;
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

export type CsvSummaryGrouping = {
  periodo: (dados: Record<string, string>) => string;
  grupo: (dados: Record<string, string>) => string;
  chave: (dados: Record<string, string>) => string;
  nome: (dados: Record<string, string>) => string;
};

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
