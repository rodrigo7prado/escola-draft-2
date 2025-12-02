import { prisma } from "@/lib/prisma";
import { createImportRouteHandlers } from "@/lib/importer/handlers";
import {
  parserProfiles,
  PROFILE_FICHA_INDIVIDUAL_HISTORICO,
} from "@/lib/importer/profiles";

const { GET, POST, DELETE } = createImportRouteHandlers({
  prisma,
  profile: parserProfiles[PROFILE_FICHA_INDIVIDUAL_HISTORICO],
  transactionOptions: {
    maxWait: 10000,
    timeout: 60000,
  },
  deleteScopes: {
    byId: false,
    byPeriod: false,
  },
});

export { GET, POST, DELETE };
