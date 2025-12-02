import crypto from "crypto";

export type ParsedCsv = {
  headers: string[];
  rows: Record<string, string>[];
};

export async function hashData(data: ParsedCsv): Promise<string> {
  const sortedRows = [...data.rows].sort((a, b) => {
    const keyA = Object.keys(a)
      .map((k) => `${k}:${a[k]}`)
      .join("|");
    const keyB = Object.keys(b)
      .map((k) => `${k}:${b[k]}`)
      .join("|");
    return keyA.localeCompare(keyB);
  });

  const str = JSON.stringify({
    headers: data.headers.sort(),
    rows: sortedRows,
  });

  return crypto.createHash("sha256").update(str).digest("hex");
}
