import type { SheetRows } from "@/lib/parsers/xlsxUtils";
import { fichaIndividualResolvers } from "@/lib/parsers/profiles/fichaIndividualHistorico/resolvers";

export type ResolverContext = {
  sheets: { rows: SheetRows }[];
};

export type ResolverFn = (ctx: ResolverContext) => unknown;

const baseResolvers: Record<string, ResolverFn> = {};

export const resolvers: Record<string, ResolverFn> = {
  ...baseResolvers,
  ...fichaIndividualResolvers,
};
