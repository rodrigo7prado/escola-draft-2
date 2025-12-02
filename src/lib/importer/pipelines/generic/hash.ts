import crypto from "crypto";
import type { LogicalLine } from "@/lib/importer/pipelines/generic/types";

function canonicalString(value: unknown): string {
  if (value === null) return "null";
  if (value === undefined) return "undefined";
  if (typeof value === "number" || typeof value === "boolean") return JSON.stringify(value);
  if (typeof value === "string") return JSON.stringify(value);

  if (Array.isArray(value)) {
    const items = value.map((item) => canonicalString(item)).join(",");
    return `[${items}]`;
  }

  if (typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${JSON.stringify(k)}:${canonicalString(v)}`)
      .join(",");
    return `{${entries}}`;
  }

  return JSON.stringify(value);
}

export async function hashLogicalLines(lines: LogicalLine[]): Promise<string> {
  const sortedLines = [...lines].sort((a, b) =>
    canonicalString(a).localeCompare(canonicalString(b))
  );

  const str = canonicalString(sortedLines);
  return crypto.createHash("sha256").update(str).digest("hex");
}
