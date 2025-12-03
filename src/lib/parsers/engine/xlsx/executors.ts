import type { ParseResult } from "@/lib/parsers/tipos";
import type { ParsedCsv } from "@/lib/parsers/csv/hash";
import { executarParserXlsxDeclarativo } from "@/lib/parsers/engine/xlsx/xlsxDeclarativo";
import type { ImportProfile } from "@/lib/importer/pipelines/csv/types";

export async function executarExtratorXlsx(
  profile: ImportProfile,
  buffer: Buffer
): Promise<ParseResult | ParsedCsv> {
  if (!profile.campos) throw new Error("Campos não definidos para extrator XLSX");
  return executarParserXlsxDeclarativo(
    {
      parserNome: profile.tipoArquivo,
      formatosSuportados: [profile.formato as any],
      campos: profile.campos,
    },
    buffer
  );
}
