import { ataResultadosFinaisProfile } from "@/lib/importer/profiles/ataResultadosFinaisProfile";
import type { ImportProfile } from "@/lib/importer/csv/types";

export const PROFILE_ATA_RESULTADOS_FINAIS = "ata-resultados-finais";

export const csvProfiles: Record<string, ImportProfile> = {
  [PROFILE_ATA_RESULTADOS_FINAIS]: ataResultadosFinaisProfile,
};

export type ProfileKey = typeof PROFILE_ATA_RESULTADOS_FINAIS;

export { ataResultadosFinaisProfile };
