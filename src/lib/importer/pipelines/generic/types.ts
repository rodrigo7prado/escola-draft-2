import type { PrismaClient, Prisma } from "@prisma/client";
import type { KeyBuilderId, ParseResult } from "@/lib/parsers/tipos";
import type { ImportProfile } from "@/lib/importer/pipelines/csv/types";

export type LogicalLine = {
  dadosOriginais: Record<string, unknown>;
  identificadorChave?: string;
};

export type ImportRunParams = {
  prisma: PrismaClient;
  buffer: Buffer;
  fileName: string;
  profile: ImportProfile;
  selectedKeyId?: KeyBuilderId;
  alunoId?: string;
  transactionOptions?: Parameters<PrismaClient["$transaction"]>[1];
};

export type ImportRunResult = {
  arquivo: Awaited<ReturnType<PrismaClient["arquivoImportado"]["create"]>>;
  linhasImportadas: number;
  dataHash: string;
  domain?: unknown;
};

export type ParserExecutor = (
  profile: ImportProfile,
  buffer: Buffer
) => Promise<ParseResult | Record<string, unknown>>;

export type LineSerializer = (
  parsed: ParseResult | Record<string, unknown>,
  opts: { selectedKeyId?: KeyBuilderId }
) => LogicalLine[];

export type Persistor = (
  tx: Prisma.TransactionClient,
  params: {
    parsed: ParseResult | Record<string, unknown>;
    lines: LogicalLine[];
    profile: ImportProfile;
    alunoId?: string;
  }
) => Promise<unknown>;
