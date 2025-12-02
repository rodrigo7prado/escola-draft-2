import type { ParsedCsv } from "@/lib/hash";
import type { LogicalLine } from "@/lib/importer/pipelines/xlsx/types";
import type { KeyBuilderId } from "@/lib/parsers/tipos";
import { serializarFichaDisciplina } from "@/lib/parsers/profiles/fichaIndividualHistorico/serializer";

export function serializarCsvLinhasSimples(
  parsed: ParsedCsv,
  _opts: { selectedKeyId?: KeyBuilderId }
): LogicalLine[] {
  return parsed.rows.map((row) => ({
    dadosOriginais: row,
    identificadorChave: undefined,
  }));
}

export const lineSerializers = {
  fichaDisciplinaFlatten: serializarFichaDisciplina,
  csvLinhaSimples: serializarCsvLinhasSimples,
};
