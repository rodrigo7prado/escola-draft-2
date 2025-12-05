import type { ImportProfile } from "@/lib/importer/pipelines/csv/types";
import { ataResultadosFinaisProfile } from "@/lib/importer/profiles/ataResultadosFinais";
import { fichaIndividualHistoricoProfile } from "@/lib/importer/profiles/fichaIndividualHistorico";

export const PROFILE_ATA_RESULTADOS_FINAIS = "ata-resultados-finais";
export const PROFILE_FICHA_INDIVIDUAL_HISTORICO = "fichaIndividualHistorico";
// Compat: alias legado usado em endpoints antigos
export const PROFILE_IMPORTACAO_FICHA_INDIVIDUAL = "importacaoFichaIndividualHistorico";

export const csvProfiles: Record<string, ImportProfile> = {
  [PROFILE_ATA_RESULTADOS_FINAIS]: ataResultadosFinaisProfile,
};

export const parserProfiles: Record<string, ImportProfile> = {
  [PROFILE_FICHA_INDIVIDUAL_HISTORICO]: fichaIndividualHistoricoProfile,
  [PROFILE_IMPORTACAO_FICHA_INDIVIDUAL]: fichaIndividualHistoricoProfile,
};

export { ataResultadosFinaisProfile, fichaIndividualHistoricoProfile };
