import type { ParserProfile, ParseResult } from "@/lib/parsers/tipos";
import type { ParsedCsv } from "@/lib/hash";
import { parseCsvLoose } from "@/lib/parsers/csv/parse";
import { executarParserXlsxDeclarativo } from "@/lib/parsers/engine/xlsxDeclarativo";

export async function executarExtrator(profile: ParserProfile, buffer: Buffer): Promise<ParseResult | ParsedCsv> {
  switch (profile.extratorId) {
    case "csvDeclarativo": {
      const text = buffer.toString("utf8");
      return parseCsvLoose(text, profile.requiredHeaders ?? []);
    }
    case "xlsxDeclarativo": {
      return executarParserXlsxDeclarativo(
        {
          parserNome: profile.nome,
          formatosSuportados: [profile.formato],
          campos: profile.campos,
        },
        buffer
      );
    }
    default:
      throw new Error(`Extrator não suportado: ${profile.extratorId}`);
  }
}
