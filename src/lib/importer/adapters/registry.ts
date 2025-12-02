import { importCsvMultipart } from "@/lib/importer/adapters/csv/importAdapter";
import { summaryCsvEnturmacoes, summaryChavesDefault } from "@/lib/importer/adapters/csv/summaryAdapters";
import { deleteCsvAdapter, deleteNone } from "@/lib/importer/adapters/csv/deleteAdapters";
import { importXlsxMultipart } from "@/lib/importer/adapters/xlsx/importAdapter";
import { summaryXlsxDefault } from "@/lib/importer/adapters/xlsx/summaryAdapters";
import { deleteXlsxNone } from "@/lib/importer/adapters/xlsx/deleteAdapters";
import type { PrismaClient } from "@prisma/client";
import type { ImportProfile } from "@/lib/importer/pipelines/csv/types";
import type { NextRequest } from "next/server";

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
      csv: importCsvMultipart,
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
      xlsx: importXlsxMultipart,
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
