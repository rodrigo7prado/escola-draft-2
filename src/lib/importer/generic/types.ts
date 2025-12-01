import type { PrismaClient, Prisma } from "@prisma/client";
import type { KeyBuilderId, ParserProfile, ParseResult } from "@/lib/parsers/tipos";

export type LogicalLine = {
  dadosOriginais: Record<string, unknown>;
  identificadorChave?: string;
};

export type ImportRunParams = {
  prisma: PrismaClient;
  buffer: Buffer;
  fileName: string;
  profile: ParserProfile;
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
  profile: ParserProfile,
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
    profile: ParserProfile;
    alunoId?: string;
  }
) => Promise<unknown>;
