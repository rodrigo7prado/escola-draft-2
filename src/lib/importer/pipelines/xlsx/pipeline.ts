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

async function getArquivoByHash(prisma: PrismaClient, hash: string) {
  return prisma.arquivoImportado.findUnique({
    where: { hashArquivo: hash },
  });
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
  const debugImport = process.env.DEBUG_IMPORT === "true";

  // Busca componentes do perfil no registry
  const components = getProfileComponents(profile.tipoArquivo);
  if (!components) {
    throw new Error(`Perfil não registrado: ${profile.tipoArquivo}`);
  }

  if (!components.serializer) {
    throw new Error(`Serializador não encontrado para perfil: ${profile.tipoArquivo}`);
  }

  if (debugImport) {
    console.info("[import:xlsx] iniciar", {
      profile: profile.tipoArquivo,
      fileName,
      alunoId,
      selectedKeyId,
    });
  }

  const parsed = await executarExtratorXlsx(profile, buffer);
  if (debugImport) {
    const totalSeries = parsed.series?.length ?? 0;
    const totalDisciplinas =
      parsed.series?.reduce((acc, serie) => acc + (serie.disciplinas?.length ?? 0), 0) ?? 0;
    console.info("[import:xlsx] parsed", {
      profile: profile.tipoArquivo,
      fileName,
      alunoId,
      series: totalSeries,
      disciplinas: totalDisciplinas,
    });
  }

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
  if (debugImport) {
    console.info("[import:xlsx] planilhas", {
      profile: profile.tipoArquivo,
      fileName,
      sheets: rawSheets.map((s) => s.name),
    });
  }

  // Type assertion: no pipeline XLSX, serializer é sempre XlsxProfileSerializer
  const xlsxSerializer = components.serializer as import("@/lib/importer/profiles/registry").XlsxProfileSerializer;
  const lines = xlsxSerializer(parsed, { selectedKeyId, rawSheets });
  if (debugImport) {
    const keySamples = Array.from(new Set(lines.map((l) => l.identificadorChave))).slice(0, 3);
    console.info("[import:xlsx] serializer", {
      profile: profile.tipoArquivo,
      fileName,
      lines: lines.length,
      keySamples,
    });
  }
  const dataHash = await computeHash(lines);
  if (debugImport) {
    console.info("[import:xlsx] hash", {
      profile: profile.tipoArquivo,
      fileName,
      hashPrefix: dataHash.slice(0, 12),
      lines: lines.length,
    });
  }

  const existingArquivo = await getArquivoByHash(prisma, dataHash);
  if (existingArquivo && existingArquivo.tipo !== profile.tipoArquivo) {
    throw new DuplicateFileError(
      "Arquivo com conteúdo idêntico já existe em outro tipo de importacao",
      existingArquivo.id
    );
  }
  if (debugImport && existingArquivo) {
    console.info("[import:xlsx] hash duplicado, reutilizando arquivo", {
      profile: profile.tipoArquivo,
      fileName,
      arquivoId: existingArquivo.id,
    });
  }

  const resultado = await prisma.$transaction(async (tx) => {
    if (debugImport) {
      console.info("[import:xlsx] transaction.begin", {
        profile: profile.tipoArquivo,
        fileName,
        alunoId,
        lines: lines.length,
      });
    }
    const arquivo = existingArquivo
      ? await tx.arquivoImportado.update({
          where: { id: existingArquivo.id },
          data: {
            nomeArquivo: fileName,
            status: "ativo",
            dataUpload: new Date(),
            excluidoEm: null,
            excluidoPor: null,
          },
        })
      : await tx.arquivoImportado.create({
          data: {
            nomeArquivo: fileName,
            hashArquivo: dataHash,
            tipo: profile.tipoArquivo,
            status: "ativo",
          },
        });

    const linhasPayload = buildLinhasPayload(arquivo.id, lines, profile.tipoEntidade);
    if (!existingArquivo && linhasPayload.length) {
      await tx.linhaImportada.createMany({ data: linhasPayload });
    }

    let domain: unknown;
    if (components.xlsxPersistor) {
      domain = await components.xlsxPersistor(tx, { parsed, lines, profile, alunoId });
    }

    if (debugImport) {
      console.info("[import:xlsx] transaction.commit", {
        profile: profile.tipoArquivo,
        fileName,
        alunoId,
        arquivoId: arquivo.id,
        linhasImportadas: lines.length,
      });
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
