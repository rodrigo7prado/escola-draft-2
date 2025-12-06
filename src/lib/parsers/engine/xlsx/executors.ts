import type { ParseResult } from "@/lib/parsers/tipos";
import type { ImportProfile } from "@/lib/importer/pipelines/csv/types";
import { parseXlsxGeneric } from "./fieldsParser";
import { interpretarXlsxComFields } from "./fieldsInterpreter";

export async function executarExtratorXlsx(
  profile: ImportProfile,
  buffer: Buffer
): Promise<ParseResult> {
  if (!profile.fields) throw new Error("Fields não definidos para extrator XLSX");

  // Extrair headers dos fields
  const headers = profile.fields
    .map((f) => f.source.header)
    .filter((h): h is string => Boolean(h));

  // 1. Parser genérico: buffer → estrutura XLSX genérica
  const parsed = await parseXlsxGeneric(buffer, headers);

  // 2. Interpretador genérico: estrutura XLSX → ParseResult (usando fields)
  const result = interpretarXlsxComFields(parsed, profile.fields);

  return result;
}
