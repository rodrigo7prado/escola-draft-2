import type { ImportProfile } from "@/lib/importer/csv/types";
import fichaIndividualHistoricoMap from "@/lib/parsers/fichaIndividualHistorico/mapeamento";

export const importacaoFichaIndividualProfile: ImportProfile = {
  formato: "XLSX",
  tipoArquivo: "fichaIndividualHistorico",
  tipoEntidade: "fichaIndividualHistorico",
  requiredHeaders: [],
  hashPolicyId: "default",
  extratorId: "xlsxDeclarativo",
  serializadorId: "fichaDisciplinaFlatten",
  persistorId: "seriesHistorico",
  chavesDisponiveis: ["nomeDataNascimento", "nome"],
  campos: fichaIndividualHistoricoMap.campos,
  duplicateKey: { column: "" },
  displayName: [],
  context: {
    periodo: { column: "" },
    grupo: { column: "" },
  },
};
