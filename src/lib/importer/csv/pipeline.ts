import type { PrismaClient, Prisma } from "@prisma/client";
import { hashData, type ParsedCsv } from "@/lib/hash";
import {
  DuplicateFileError,
  type CsvProfile,
  type ImportOutcome,
} from "@/lib/importer/csv/types";
import { extractContext, extractField, extractName } from "@/lib/importer/csv/extract";
import { persistAlunosDomain } from "@/lib/importer/persistors/alunos";

type TransactionOptions = Parameters<PrismaClient["$transaction"]>[1];

type RunCsvImportParams = {
  prisma: PrismaClient;
  data: ParsedCsv;
  fileName: string;
  profile: CsvProfile;
  transactionOptions?: TransactionOptions;
};

async function ensureHashUnique(prisma: PrismaClient, dataHash: string) {
  const existing = await prisma.arquivoImportado.findFirst({
    where: { hashArquivo: dataHash, status: "ativo" },
  });
  if (existing) {
    throw new DuplicateFileError("Arquivo com conteúdo idêntico já existe", existing.id);
  }
}

async function createArquivoELinhas(
  tx: Prisma.TransactionClient,
  params: { data: ParsedCsv; fileName: string; profile: CsvProfile; dataHash: string }
) {
  const { data, fileName, profile, dataHash } = params;
  const arquivo = await tx.arquivoImportado.create({
    data: {
      nomeArquivo: fileName,
      hashArquivo: dataHash,
      tipo: profile.tipoArquivo,
      status: "ativo",
    },
  });

  await tx.linhaImportada.createMany({
    data: data.rows.map((row, i) => ({
      arquivoId: arquivo.id,
      numeroLinha: i,
      dadosOriginais: row,
      identificadorChave: extractField(row, profile.duplicateKey),
      tipoEntidade: profile.tipoEntidade,
    })),
  });

  const linhas = await tx.linhaImportada.findMany({
    where: { arquivoId: arquivo.id },
    orderBy: { numeroLinha: "asc" },
  });

  return { arquivo, linhas };
}

function resolveDomain(profile: CsvProfile) {
  if (profile.tipoEntidade === "aluno") {
    return persistAlunosDomain;
  }
  return async () => ({});
}

export async function runCsvImport({
  prisma,
  data,
  fileName,
  profile,
  transactionOptions,
}: RunCsvImportParams): Promise<ImportOutcome<any>> {
  const dataHash = await hashData(data);
  await ensureHashUnique(prisma, dataHash);

  const domainHandler = resolveDomain(profile);

  const resultado = await prisma.$transaction(async (tx) => {
    const { arquivo, linhas } = await createArquivoELinhas(tx, {
      data,
      fileName,
      profile,
      dataHash,
    });

    const domain = await domainHandler(tx, {
      rows: data.rows,
      linhas,
      arquivo,
      dataHash,
      fileName,
      profile,
      extractField,
      extractName,
      extractContext,
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
