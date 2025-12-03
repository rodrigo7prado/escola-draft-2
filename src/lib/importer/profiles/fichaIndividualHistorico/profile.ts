import type { ImportProfile } from "@/lib/importer/pipelines/csv/types";
import fichaIndividualHistoricoMap from "@/lib/parsers/profiles/fichaIndividualHistorico/mapeamento";

export const fichaIndividualHistoricoProfile: ImportProfile = {
  formato: "XLSX",
  tipoArquivo: "fichaIndividualHistorico",
  tipoEntidade: "fichaIndividualHistorico",
  persistorId: "seriesHistorico",
  chavesDisponiveis: ["nomeDataNascimento", "nome"],
  campos: fichaIndividualHistoricoMap.campos,
};
