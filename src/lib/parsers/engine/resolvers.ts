import type { SheetRows } from "@/lib/parsers/xlsxUtils";

export type ResolverContext = {
  sheets: { rows: SheetRows }[];
};

type ResolverFn = (ctx: ResolverContext) => unknown;

function resolverSituacaoFinal(ctx: ResolverContext) {
  for (const sheet of ctx.sheets) {
    for (const row of Object.values(sheet.rows)) {
      for (const val of Object.values(row)) {
        if (!val || typeof val !== "string") continue;
        if (/CONSIDERADO\(A\)/i.test(val) && val.includes(":")) {
          const parts = val.split(":");
          return parts.slice(1).join(":").trim();
        }
      }
    }
  }
  return undefined;
}

export const resolvers: Record<string, ResolverFn> = {
  situacaoFinal: resolverSituacaoFinal,
};
