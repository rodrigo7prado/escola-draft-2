import type { LogicalLine } from "@/lib/importer/pipelines/xlsx/types";
import { hashLogicalLines } from "@/lib/importer/pipelines/xlsx/hash";

type HashPolicyFn = (lines: LogicalLine[]) => Promise<string>;

export const hashPolicies: Record<string, HashPolicyFn> = {
  default: hashLogicalLines,
};

export async function computeHash(lines: LogicalLine[], policyId?: string) {
  const fn = (policyId && hashPolicies[policyId]) || hashPolicies.default;
  return fn(lines);
}
