import type { ResolverContext, ResolverFn } from "@/lib/parsers/engine/types";

function resolverSituacaoFinal(ctx: ResolverContext) {
  for (const sheet of ctx.sheets) {
    const rows = sheet.rows as Record<string, Record<string, unknown>>;
    for (const row of Object.values(rows)) {
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

export const fichaIndividualResolvers: Record<string, ResolverFn> = {
  situacaoFinal: resolverSituacaoFinal,
};
