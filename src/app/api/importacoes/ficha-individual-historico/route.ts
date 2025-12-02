import { prisma } from "@/lib/prisma";
import { createImportRouteHandlers } from "@/lib/importer/handlers";
import {
  parserProfiles,
  PROFILE_IMPORTACAO_FICHA_INDIVIDUAL,
} from "@/lib/importer/profiles";

const { GET, POST, DELETE } = createImportRouteHandlers({
  prisma,
  profile: parserProfiles[PROFILE_IMPORTACAO_FICHA_INDIVIDUAL],
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
