import { NextResponse, type NextRequest } from "next/server";
import type { PrismaClient } from "@prisma/client";
import type { ImportProfile } from "@/lib/importer/csv/types";
import { importAdapters } from "@/lib/importer/adapters/importAdapters";
import { summaryAdapters } from "@/lib/importer/adapters/summaryAdapters";
import { deleteAdapters } from "@/lib/importer/adapters/deleteAdapters";

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

  const importAdapterId = profile.importAdapterId ?? (profile.extratorId && profile.serializadorId ? "declarative-multipart" : "csv-multipart");
  const summaryAdapterId = profile.summaryAdapterId ?? (profile.extratorId && profile.serializadorId ? "chaves-default" : "csv-enturmacoes");
  const deleteAdapterId = profile.deleteAdapterId ?? (profile.extratorId && profile.serializadorId ? "none" : "csv-delete");

  return {
    POST: async (request: NextRequest) => {
      const adapter = importAdapters[importAdapterId];
      if (!adapter) {
        return NextResponse.json({ error: "Adaptador de importação não suportado" }, { status: 400 });
      }
      return adapter({ prisma, profile, request, transactionOptions });
    },

    GET: async () => {
      try {
        const adapter = summaryAdapters[summaryAdapterId] ?? summaryAdapters["chaves-default"];
        const payload = await adapter({ prisma, profile, summaryBuilder: config.summaryBuilder });
        return NextResponse.json(payload);
      } catch (error) {
        console.error("Erro ao listar arquivos:", error);
        return NextResponse.json({ error: "Erro ao listar arquivos" }, { status: 500 });
      }
    },

    DELETE: async (request: NextRequest) => {
      const adapter = deleteAdapters[deleteAdapterId] ?? deleteAdapters.none;
      return adapter({ prisma, profile, request, deleteScopes: config.deleteScopes });
    },
  };
}

// Compat: manter nome antigo para usos legados
export const createCsvRouteHandlers = createImportRouteHandlers;
