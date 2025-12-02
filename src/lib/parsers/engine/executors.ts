import type { ParseResult } from "@/lib/parsers/tipos";
import type { ParsedCsv } from "@/lib/hash";
import { parseCsvLoose } from "@/lib/parsers/csv/parse";
import { executarParserXlsxDeclarativo } from "@/lib/parsers/engine/xlsxDeclarativo";
import type { ImportProfile } from "@/lib/importer/pipelines/csv/types";

export async function executarExtrator(profile: ImportProfile, buffer: Buffer): Promise<ParseResult | ParsedCsv> {
  if (!profile.extratorId) {
    throw new Error("Extrator não definido no profile");
  }

  switch (profile.extratorId) {
    case "csvDeclarativo": {
      const text = buffer.toString("utf8");
      return parseCsvLoose(text, profile.requiredHeaders ?? []);
    }
    case "xlsxDeclarativo": {
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
    default:
      throw new Error(`Extrator não suportado: ${profile.extratorId}`);
  }
}
