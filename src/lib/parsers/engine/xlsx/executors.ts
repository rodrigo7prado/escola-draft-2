import type { ParseResult } from "@/lib/parsers/tipos";
import { executarParserXlsxDeclarativo } from "@/lib/parsers/engine/xlsx/xlsxDeclarativo";
import type { ImportProfile } from "@/lib/importer/pipelines/csv/types";
import { getProfileComponents } from "@/lib/importer/profiles/registry";

export async function executarExtratorXlsx(
  profile: ImportProfile,
  buffer: Buffer
): Promise<ParseResult> {
  if (!profile.campos) throw new Error("Campos não definidos para extrator XLSX");

  // Busca resolvers do perfil no registry
  const components = getProfileComponents(profile.tipoArquivo);
  const resolvers = components?.resolvers;

  return executarParserXlsxDeclarativo(
    {
      parserNome: profile.tipoArquivo,
      formatosSuportados: [profile.formato as any],
      campos: profile.campos,
    },
    buffer,
    resolvers
  );
}
