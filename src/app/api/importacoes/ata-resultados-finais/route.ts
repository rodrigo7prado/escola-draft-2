import { prisma } from "@/lib/prisma";
import { createCsvRouteHandlers } from "@/lib/importer/handlers";
import { csvProfiles, PROFILE_ATA_RESULTADOS_FINAIS } from "@/lib/importer/profiles";

const { GET, POST, DELETE } = createCsvRouteHandlers({
  prisma,
  profile: csvProfiles[PROFILE_ATA_RESULTADOS_FINAIS],
  transactionOptions: {
    maxWait: 10000,
    timeout: 60000,
  },
  deleteScopes: {
    byId: true,
    byPeriod: true,
    periodParam: "periodo",
  },
});

export { GET, POST, DELETE };
