import type { Prisma, PrismaClient } from "@prisma/client";
import { DuplicateFileError } from "@/lib/importer/pipelines/csv/types";
import { executarExtratorXlsx } from "@/lib/parsers/engine/xlsx/executors";
import { computeHash } from "@/lib/importer/pipelines/xlsx/hashPolicies";
import { getProfileComponents } from "@/lib/importer/profiles/registry";
import type {
  ImportRunParams,
  ImportRunResult,
  LogicalLine,
  RawSheetCells,
} from "@/lib/importer/pipelines/xlsx/types";
import { loadWorkbookSheets } from "@/lib/parsers/xlsx/utils";

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

  // Busca componentes do perfil no registry
  const components = getProfileComponents(profile.tipoArquivo);
  if (!components) {
    throw new Error(`Perfil não registrado: ${profile.tipoArquivo}`);
  }

  if (!components.serializer) {
    throw new Error(`Serializador não encontrado para perfil: ${profile.tipoArquivo}`);
  }

  const parsed = await executarExtratorXlsx(profile, buffer);

  const rawSheets: RawSheetCells[] = [];
  const sheets = await loadWorkbookSheets(buffer);
  for (const sheet of sheets) {
    const cells: Record<string, string> = {};
    for (const [rowNumber, cols] of Object.entries(sheet.rows)) {
      for (const [col, val] of Object.entries(cols)) {
        if (val === undefined || val === null) continue;
        cells[`${col}${rowNumber}`] = typeof val === "string" ? val : String(val);
      }
    }
    rawSheets.push({ name: sheet.name, cells });
  }

  // Type assertion: no pipeline XLSX, serializer é sempre XlsxProfileSerializer
  const xlsxSerializer = components.serializer as import("@/lib/importer/profiles/registry").XlsxProfileSerializer;
  const lines = xlsxSerializer(parsed, { selectedKeyId, rawSheets });
  const dataHash = await computeHash(lines);

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
    if (components.xlsxPersistor) {
      domain = await components.xlsxPersistor(tx, { parsed, lines, profile, alunoId });
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
