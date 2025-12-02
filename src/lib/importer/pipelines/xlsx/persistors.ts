import type { Persistor } from "@/lib/importer/pipelines/xlsx/types";
import type { ParseResult } from "@/lib/parsers/tipos";
import { persistSeriesHistorico } from "@/lib/importer/profiles/fichaIndividualHistorico/persist";

export const persistors: Record<string, Persistor> = {
  seriesHistorico: async (tx, params) =>
    persistSeriesHistorico(tx, { parsed: params.parsed as ParseResult, alunoId: params.alunoId }),
};
