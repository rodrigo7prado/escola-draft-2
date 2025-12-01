import type { ParsedCsv } from "@/lib/hash";

export function splitCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

export function parseCsvLoose(text: string, requiredHeaders: string[]): ParsedCsv {
  const rawLines = text.split(/\r?\n/);
  const lines = rawLines.map((l) => l.replace(/\uFEFF/g, "")).filter((l) => l.trim().length > 0);
  if (lines.length === 0) return { headers: [], rows: [] };

  let headerIndex = -1;
  let headers: string[] = [];
  for (let i = 0; i < lines.length; i += 1) {
    const cols = splitCsvLine(lines[i]);
    const set = new Set(cols);
    const allPresent = requiredHeaders.every((h) => set.has(h));
    if (allPresent) {
      headerIndex = i;
      headers = cols;
      break;
    }
  }
  if (headerIndex === -1) {
    return { headers: [], rows: [] };
  }

  const rows: Record<string, string>[] = [];
  for (let i = headerIndex + 1; i < lines.length; i += 1) {
    const parts = splitCsvLine(lines[i]);
    if (parts.every((p) => p.trim() === "")) continue;
    const row: Record<string, string> = {};
    for (let j = 0; j < headers.length; j += 1) {
      row[headers[j]] = (parts[j] ?? "").trim();
    }
    rows.push(row);
  }

  return { headers, rows };
}
