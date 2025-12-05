import type { PrismaClient, Prisma } from "@prisma/client";
import { hashData, type ParsedCsv } from "@/lib/parsers/csv/hash";

import { DuplicateFileError, ImportOutcome, ImportProfile } from "./types";
import { resolveDuplicateKey } from "@/lib/importer/utils/fieldResolvers";
import { getProfileComponents } from "@/lib/importer/profiles/registry";

type TransactionOptions = Parameters<PrismaClient["$transaction"]>[1];

type RunCsvImportParams = {
  prisma: PrismaClient;
  data: ParsedCsv;
  fileName: string;
  profile: ImportProfile;
  transactionOptions?: TransactionOptions;
};

async function ensureHashUnique(prisma: PrismaClient, dataHash: string, tipoArquivo: string) {
  const existing = await prisma.arquivoImportado.findFirst({
    where: { hashArquivo: dataHash, status: "ativo", tipo: tipoArquivo },
  });
  if (existing) {
    throw new DuplicateFileError("Arquivo com conteúdo idêntico já existe", existing.id);
  }
}

function readField(row: Record<string, string>, field?: { column: string }) {
  if (!field) return undefined;
  const raw = row[field.column];
  return typeof raw === "string" ? raw : undefined;
}

async function createArquivoELinhas(
  tx: Prisma.TransactionClient,
  params: { data: ParsedCsv; fileName: string; profile: ImportProfile; dataHash: string }
) {
  const { data, fileName, profile, dataHash } = params;
  const duplicateKey = resolveDuplicateKey(profile);
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
      identificadorChave: readField(row, duplicateKey),
      tipoEntidade: profile.tipoEntidade,
    })),
  });

  const linhas = await tx.linhaImportada.findMany({
    where: { arquivoId: arquivo.id },
    orderBy: { numeroLinha: "asc" },
  });

  return { arquivo, linhas };
}

export async function runCsvImport({
  prisma,
  data,
  fileName,
  profile,
  transactionOptions,
}: RunCsvImportParams): Promise<ImportOutcome<any>> {
  const dataHash = await hashData(data);
  await ensureHashUnique(prisma, dataHash, profile.tipoArquivo);

  // Busca componentes do perfil no registry
  const components = getProfileComponents(profile.tipoArquivo);
  if (!components) {
    throw new Error(`Perfil não registrado: ${profile.tipoArquivo}`);
  }

  const resultado = await prisma.$transaction(async (tx) => {
    const { arquivo, linhas } = await createArquivoELinhas(tx, {
      data,
      fileName,
      profile,
      dataHash,
    });

    let domain: unknown;
    if (components.csvPersistor) {
      domain = await components.csvPersistor(tx, {
        rows: data.rows,
        linhas,
        arquivo,
        dataHash,
        fileName,
        profile,
      });
    }

    return { arquivo, domain };
  }, transactionOptions);

  return {
    arquivo: resultado.arquivo,
    linhasImportadas: data.rows.length,
    dataHash,
    domain: resultado.domain,
  };
}

// Compat: alias genérico
export const runImport = runCsvImport;
