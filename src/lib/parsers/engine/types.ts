import type { SheetRows } from "@/lib/parsers/xlsx/utils";

export type ResolverContext = {
  sheets: { rows: SheetRows }[];
};

export type ResolverFn = (ctx: ResolverContext) => unknown;
