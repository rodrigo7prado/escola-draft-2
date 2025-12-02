import type { LogicalLine } from "@/lib/importer/pipelines/generic/types";
import { hashLogicalLines } from "@/lib/importer/pipelines/generic/hash";

type HashPolicyFn = (lines: LogicalLine[]) => Promise<string>;

export const hashPolicies: Record<string, HashPolicyFn> = {
  default: hashLogicalLines,
};

export async function computeHash(policyId: string | undefined, lines: LogicalLine[]) {
  const fn = (policyId && hashPolicies[policyId]) || hashPolicies.default;
  return fn(lines);
}
