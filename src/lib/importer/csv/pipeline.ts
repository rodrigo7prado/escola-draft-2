import type { PrismaClient } from "@prisma/client";
import { hashData, type ParsedCsv } from "@/lib/hash";
import {
  DuplicateFileError,
  type CsvImportAdapter,
  type ImportOutcome,
} from "@/lib/importer/csv/types";

type TransactionOptions = Parameters<PrismaClient["$transaction"]>[1];

type RunCsvImportParams<Row extends Record<string, string>, DomainResult> = {
  prisma: PrismaClient;
  data: ParsedCsv;
  fileName: string;
  adapter: CsvImportAdapter<Row, DomainResult>;
  transactionOptions?: TransactionOptions;
};

export async function runCsvImport<Row extends Record<string, string>, DomainResult>({
  prisma,
  data,
  fileName,
  adapter,
  transactionOptions,
}: RunCsvImportParams<Row, DomainResult>): Promise<ImportOutcome<DomainResult>> {
  const dataHash = await hashData(data);
  const existing = await prisma.arquivoImportado.findFirst({
    where: { hashArquivo: dataHash, status: "ativo" },
  });
  if (existing) {
    throw new DuplicateFileError("Arquivo com conteúdo idêntico já existe", existing.id);
  }

  const resultado = await prisma.$transaction(async (tx) => {
    const arquivo = await tx.arquivoImportado.create({
      data: {
        nomeArquivo: fileName,
        hashArquivo: dataHash,
        tipo: adapter.tipoArquivo,
        status: "ativo",
      },
    });

    await tx.linhaImportada.createMany({
      data: data.rows.map((row, i) =>
        adapter.buildLinha(row as Row, i, arquivo.id)
      ),
    });

    const linhas = await tx.linhaImportada.findMany({
      where: { arquivoId: arquivo.id },
      orderBy: { numeroLinha: "asc" },
    });

    const domain = await adapter.persistDomain(tx, {
      rows: data.rows as Row[],
      linhas,
      arquivo,
      dataHash,
      fileName,
    });

    return { arquivo, domain };
  }, transactionOptions);

  return {
    arquivo: resultado.arquivo,
    linhasImportadas: data.rows.length,
    dataHash,
    domain: resultado.domain,
  };
}
