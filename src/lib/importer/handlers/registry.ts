import {
  summaryCsvEnturmacoes,
  summaryChavesDefault,
} from "@/lib/importer/profiles/ataResultadosFinais/adapters/summaryAdapter";
import { deleteCsvAdapter, deleteNone } from "@/lib/importer/profiles/ataResultadosFinais/adapters/deleteAdapter";
import { summaryXlsxDefault } from "@/lib/importer/profiles/fichaIndividualHistorico/adapters/summaryAdapters";
import { deleteXlsxNone } from "@/lib/importer/profiles/fichaIndividualHistorico/adapters/deleteAdapters";
import type { PrismaClient } from "@prisma/client";
import type { ImportProfile } from "@/lib/importer/pipelines/csv/types";
import type { NextRequest } from "next/server";
import { importCsvJson } from "./importCsvAdapter";
import { importXlsxJson } from "./importXlsxAdapter";

type ImportAdapter = (ctx: {
  prisma: PrismaClient;
  profile: ImportProfile;
  request: NextRequest;
  transactionOptions?: Parameters<PrismaClient["$transaction"]>[1];
}) => Promise<Response>;

type SummaryAdapter = (ctx: { prisma: PrismaClient; profile: ImportProfile }) => Promise<unknown> | unknown;
type DeleteAdapter = (ctx: {
  prisma: PrismaClient;
  profile: ImportProfile;
  request: NextRequest;
  deleteScopes?: {
    byId?: boolean;
    byPeriod?: boolean;
    periodParam?: string;
  };
}) => Promise<Response>;

type FormatAdapters = {
  importAdapters: Record<string, ImportAdapter>;
  summaryAdapters: Record<string, SummaryAdapter>;
  deleteAdapters: Record<string, DeleteAdapter>;
  defaults: {
    importAdapterId: string;
    summaryAdapterId: string;
    deleteAdapterId: string;
  };
};

export const adaptersByFormat: Record<string, FormatAdapters> = {
  CSV: {
    importAdapters: {
      csv: importCsvJson,
    },
    summaryAdapters: {
      "csv-enturmacoes": summaryCsvEnturmacoes,
      "chaves-default": ({ profile }) => summaryChavesDefault(profile),
    },
    deleteAdapters: {
      "csv-delete": deleteCsvAdapter,
      none: deleteNone,
    },
    defaults: {
      importAdapterId: "csv",
      summaryAdapterId: "csv-enturmacoes",
      deleteAdapterId: "csv-delete",
    },
  },
  XLSX: {
    importAdapters: {
      xlsx: importXlsxJson,
    },
    summaryAdapters: {
      "chaves-default": ({ profile }) => summaryXlsxDefault(profile),
    },
    deleteAdapters: {
      none: deleteXlsxNone,
    },
    defaults: {
      importAdapterId: "xlsx",
      summaryAdapterId: "chaves-default",
      deleteAdapterId: "none",
    },
  },
};
