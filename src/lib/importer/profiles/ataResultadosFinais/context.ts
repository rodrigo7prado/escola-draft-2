import type { ImportField, ImportProfile } from "@/lib/importer/pipelines/csv/types";

function stripPrefix(valor: string, prefixes?: string[]) {
  if (!prefixes || prefixes.length === 0) return valor;
  const trimmed = valor.trim();
  for (const prefix of prefixes) {
    if (trimmed.startsWith(prefix)) {
      return trimmed.substring(prefix.length).trim();
    }
  }
  return trimmed;
}

export function extractField(row: Record<string, string>, field?: ImportField) {
  if (!field) return "";
  const raw = row[field.column] ?? "";
  if (typeof raw !== "string") return "";
  return stripPrefix(raw, field.prefixes);
}

export function extractName(row: Record<string, string>, fields: ImportField[] = []) {
  for (const field of fields) {
    const value = extractField(row, field);
    if (value) return value;
  }
  return "";
}

export function extractContext(row: Record<string, string>, profile: ImportProfile) {
  const ctx = profile.context ?? {};
  return {
    periodo: ctx.periodo ? extractField(row, ctx.periodo) : "",
    grupo: ctx.grupo ? extractField(row, ctx.grupo) : "",
    modalidade: ctx.modalidade ? extractField(row, ctx.modalidade) : "",
    serie: ctx.serie ? extractField(row, ctx.serie) : "",
    turno: ctx.turno ? extractField(row, ctx.turno) : "",
  };
}
