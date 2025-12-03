import type { ParsedCsv } from "@/lib/parsers/csv/hash";
import { parseCsvLoose } from "@/lib/parsers/csv/parse";
import type { ImportProfile } from "@/lib/importer/pipelines/csv/types";

export function resolveRequiredHeaders(profile: ImportProfile): string[] {
  const fromFields =
    profile.fields
      ?.map((field) => field.source.header || field.source.headers?.[0])
      .filter((h): h is string => Boolean(h)) ?? [];
  if (fromFields.length) return fromFields;
  throw new Error(`ImportProfile ${profile.tipoArquivo}: headers obrigatórios ausentes em fields`);
}

export async function executarExtratorCsv(
  profile: ImportProfile,
  buffer: Buffer
): Promise<ParsedCsv> {
  const text = buffer.toString("utf8");
  const requiredHeaders = resolveRequiredHeaders(profile);
  return parseCsvLoose(text, requiredHeaders);
}
