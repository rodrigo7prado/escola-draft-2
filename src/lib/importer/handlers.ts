import { NextResponse, type NextRequest } from "next/server";
import type { PrismaClient } from "@prisma/client";
import type { ImportProfile } from "@/lib/importer/pipelines/csv/types";
import { adaptersByFormat } from "@/lib/importer/handlers/registry";
import { validateFields } from "@/lib/importer/utils/profileValidation";

type ImportRouteConfig = {
  prisma: PrismaClient;
  profile: ImportProfile;
  transactionOptions?: Parameters<PrismaClient["$transaction"]>[1];
  deleteScopes?: {
    byId?: boolean;
    byPeriod?: boolean;
    periodParam?: string;
  };
  summaryBuilder?: (
    linhas: Awaited<ReturnType<PrismaClient["linhaImportada"]["findMany"]>>,
    existingKeys: Map<string, Map<string, Set<string>>>,
    profile: ImportProfile
  ) => unknown;
};

export function createImportRouteHandlers(config: ImportRouteConfig) {
  const { prisma, profile, transactionOptions } = config;
  validateFields(profile);
  const formato = (profile.formato ?? "CSV").toUpperCase();
  const registry = adaptersByFormat[formato] ?? adaptersByFormat.CSV;
  const importAdapterId = profile.importAdapterId ?? registry.defaults.importAdapterId;
  const summaryAdapterId = profile.summaryAdapterId ?? registry.defaults.summaryAdapterId;
  const deleteAdapterId = profile.deleteAdapterId ?? registry.defaults.deleteAdapterId;

  return {
    POST: async (request: NextRequest) => {
      const adapter = registry.importAdapters[importAdapterId];
      if (!adapter) {
        return NextResponse.json({ error: "Adaptador de importação não suportado" }, { status: 400 });
      }
      return adapter({ prisma, profile, request, transactionOptions });
    },

    GET: async () => {
      try {
        const adapter = registry.summaryAdapters[summaryAdapterId] ?? registry.summaryAdapters[registry.defaults.summaryAdapterId];
        const payload = await adapter({ prisma, profile });
        return NextResponse.json(payload);
      } catch (error) {
        console.error("Erro ao listar arquivos:", error);
        return NextResponse.json({ error: "Erro ao listar arquivos" }, { status: 500 });
      }
    },

    DELETE: async (request: NextRequest) => {
      const adapter = registry.deleteAdapters[deleteAdapterId] ?? registry.deleteAdapters[registry.defaults.deleteAdapterId];
      return adapter({ prisma, profile, request, deleteScopes: config.deleteScopes });
    },
  };
}

// Compat: manter nome antigo para usos legados
export const createCsvRouteHandlers = createImportRouteHandlers;
