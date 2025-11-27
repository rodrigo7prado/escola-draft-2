import { prisma } from "@/lib/prisma";
import { createCsvRouteHandlers } from "@/lib/importer/csv/handlers";
import { alunosCsvProfile } from "@/lib/importer/profiles/alunosCsvProfile";

const { GET, POST, DELETE } = createCsvRouteHandlers({
  prisma,
  profile: alunosCsvProfile,
  transactionOptions: {
    maxWait: 10000,
    timeout: 60000,
  },
  deleteScopes: {
    byId: true,
    byPeriod: true,
  },
});

export { GET, POST, DELETE };
