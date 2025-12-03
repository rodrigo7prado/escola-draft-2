import type { ImportProfile } from "@/lib/importer/pipelines/csv/types";

export function summaryXlsxDefault(profile: ImportProfile) {
  return {
    periodos: [],
    chavesDisponiveis: profile.chavesDisponiveis ?? [],
    pendencias: [],
  };
}
