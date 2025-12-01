import type { ParserProfile } from "@/lib/parsers/tipos";
import fichaIndividualHistoricoMap from "@/lib/parsers/fichaIndividualHistorico/mapeamento";

export const importacaoFichaIndividualProfile: ParserProfile = {
  nome: fichaIndividualHistoricoMap.parserNome,
  formato: "XLSX",
  tipoArquivo: "fichaIndividualHistorico",
  tipoEntidade: "fichaIndividualHistorico",
  hashPolicyId: "default",
  extratorId: "xlsxDeclarativo",
  serializadorId: "fichaDisciplinaFlatten",
  persistorId: "seriesHistorico",
  chavesDisponiveis: ["nomeDataNascimento", "nome"],
  campos: fichaIndividualHistoricoMap.campos,
};
