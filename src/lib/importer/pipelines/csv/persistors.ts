import type { Prisma } from "@prisma/client";
import type { ImportProfile } from "@/lib/importer/pipelines/csv/types";
import { persistAlunosDomain } from "@/lib/importer/profiles/ataResultadosFinais/persist";

export type CsvPersistor = (
  tx: Prisma.TransactionClient,
  params: {
    rows: Record<string, string>[];
    linhas: Awaited<ReturnType<Prisma.TransactionClient["linhaImportada"]["findMany"]>>;
    arquivo: { id: string };
    dataHash: string;
    fileName: string;
    profile: ImportProfile;
  }
) => Promise<unknown>;

export const csvPersistors: Record<string, CsvPersistor> = {
  alunosEnturmacoes: persistAlunosDomain,
};
