import { ImportField, ImportProfile } from "./types";

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

export function extractField(row: Record<string, string>, field: ImportField) {
  const raw = row[field.column] ?? "";
  if (typeof raw !== "string") return "";
  return stripPrefix(raw, field.prefixes);
}

export function extractName(row: Record<string, string>, fields: ImportField[]) {
  for (const field of fields) {
    const value = extractField(row, field);
    if (value) return value;
  }
  return "";
}

export function extractContext(row: Record<string, string>, profile: ImportProfile) {
  return {
    periodo: extractField(row, profile.context.periodo),
    grupo: extractField(row, profile.context.grupo),
    modalidade: profile.context.modalidade
      ? extractField(row, profile.context.modalidade)
      : "",
    serie: profile.context.serie ? extractField(row, profile.context.serie) : "",
    turno: profile.context.turno ? extractField(row, profile.context.turno) : "",
  };
}
