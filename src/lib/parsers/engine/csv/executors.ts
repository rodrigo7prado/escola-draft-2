import type { ParsedCsv } from "@/lib/hash";
import { parseCsvLoose } from "@/lib/parsers/csv/parse";
import type { ImportProfile } from "@/lib/importer/pipelines/csv/types";

export async function executarExtratorCsv(
  profile: ImportProfile,
  buffer: Buffer
): Promise<ParsedCsv> {
  const text = buffer.toString("utf8");
  return parseCsvLoose(text, profile.requiredHeaders ?? []);
}
