import type { Prisma, PrismaClient } from "@prisma/client";
import { DuplicateFileError } from "@/lib/importer/pipelines/csv/types";
import { executarExtrator } from "@/lib/parsers/engine/index";
import { xlsxLineSerializers } from "@/lib/parsers/engine/index";
import { computeHash } from "@/lib/importer/pipelines/xlsx/hashPolicies";
import { persistors } from "@/lib/importer/pipelines/xlsx/persistors";
import type { ImportRunParams, ImportRunResult, LogicalLine } from "@/lib/importer/pipelines/xlsx/types";

async function ensureHashUnique(prisma: PrismaClient, hash: string, tipoArquivo: string) {
  const existing = await prisma.arquivoImportado.findFirst({
    where: { hashArquivo: hash, status: "ativo", tipo: tipoArquivo },
  });
  if (existing) {
    throw new DuplicateFileError("Arquivo com conteúdo idêntico já existe", existing.id);
  }
}

function buildLinhasPayload(
  arquivoId: string,
  lines: LogicalLine[],
  tipoEntidade: string
): Prisma.LinhaImportadaCreateManyInput[] {
  return lines.map((line, idx) => ({
    arquivoId,
    numeroLinha: idx,
    dadosOriginais: JSON.parse(JSON.stringify(line.dadosOriginais)) as Prisma.InputJsonValue,
    identificadorChave: line.identificadorChave,
    tipoEntidade,
  }));
}

export async function runXlsxImport(params: ImportRunParams): Promise<ImportRunResult> {
  const { prisma, buffer, fileName, profile, selectedKeyId, alunoId, transactionOptions } = params;

  if (!profile.serializadorId || !profile.extratorId) {
    throw new Error("Profile declarativo inválido: extratorId ou serializadorId ausente");
  }

  const parsed = await executarExtrator(profile, buffer);
  const serializer = xlsxLineSerializers[profile.serializadorId as keyof typeof xlsxLineSerializers];
  if (!serializer) {
    throw new Error(`Serializador não encontrado: ${profile.serializadorId}`);
  }

  const lines = serializer(parsed as any, { selectedKeyId });
  const dataHash = await computeHash(profile.hashPolicyId, lines);

  await ensureHashUnique(prisma, dataHash, profile.tipoArquivo);

  const resultado = await prisma.$transaction(async (tx) => {
    const arquivo = await tx.arquivoImportado.create({
      data: {
        nomeArquivo: fileName,
        hashArquivo: dataHash,
        tipo: profile.tipoArquivo,
        status: "ativo",
      },
    });

    const linhasPayload = buildLinhasPayload(arquivo.id, lines, profile.tipoEntidade);
    if (linhasPayload.length) {
      await tx.linhaImportada.createMany({ data: linhasPayload });
    }

    let domain: unknown;
    const persistor = persistors[profile.persistorId ?? ""];
    if (persistor) {
      domain = await persistor(tx, { parsed, lines, profile, alunoId });
    }

    return { arquivo, domain };
  }, transactionOptions);

  return {
    arquivo: resultado.arquivo,
    linhasImportadas: lines.length,
    dataHash,
    domain: resultado.domain,
  };
}

// Compat: alias antigo
export const runGenericImport = runXlsxImport;
