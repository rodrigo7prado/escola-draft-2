import type { ResolverContext, ResolverFn } from "@/lib/parsers/engine/types";
import { fichaIndividualResolvers } from "@/lib/parsers/profiles/fichaIndividualHistorico/resolvers";

export const xlsxResolvers: Record<string, ResolverFn> = {
  ...fichaIndividualResolvers,
};

export type { ResolverContext, ResolverFn };
