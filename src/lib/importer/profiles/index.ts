import { ataResultadosFinaisProfile } from "@/lib/importer/profiles/ataResultadosFinaisProfile";
import type { ImportProfile } from "@/lib/importer/csv/types";
import { importacaoFichaIndividualProfile } from "@/lib/importer/profiles/importacaoFichaIndividualProfile";
import type { ParserProfile } from "@/lib/parsers/tipos";

export const PROFILE_ATA_RESULTADOS_FINAIS = "ata-resultados-finais";

export const csvProfiles: Record<string, ImportProfile> = {
  [PROFILE_ATA_RESULTADOS_FINAIS]: ataResultadosFinaisProfile,
};

export type ProfileKey = typeof PROFILE_ATA_RESULTADOS_FINAIS;

export { ataResultadosFinaisProfile };

export const parserProfiles: Record<string, ParserProfile> = {
  importacaoFichaIndividualHistorico: importacaoFichaIndividualProfile,
};

export const PROFILE_IMPORTACAO_FICHA_INDIVIDUAL = "importacaoFichaIndividualHistorico";
