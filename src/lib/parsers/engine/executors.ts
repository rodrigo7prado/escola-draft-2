import { executarExtratorCsv } from "@/lib/parsers/engine/csv/executors";
import { executarExtratorXlsx } from "@/lib/parsers/engine/xlsx/executors";
import type { ImportProfile } from "@/lib/importer/pipelines/csv/types";

export async function executarExtrator(profile: ImportProfile, buffer: Buffer) {
  const formato = (profile.formato ?? "").toUpperCase();
  if (formato === "CSV") return executarExtratorCsv(profile, buffer);
  if (formato === "XLSX") return executarExtratorXlsx(profile, buffer);
  throw new Error(`Extrator não suportado para formato: ${formato || "desconhecido"}`);
}
