import { extractField } from "@/lib/importer/profiles/ataResultadosFinais/context";
import type { ImportField, ImportFieldDef, ImportProfile } from "@/lib/importer/pipelines/csv/types";

type ResolvedContext = {
  periodo?: ImportField;
  grupo?: ImportField;
  modalidade?: ImportField;
  serie?: ImportField;
  turno?: ImportField;
};

function pickHeader(field?: ImportFieldDef) {
  const header = field?.source.header || field?.source.headers?.[0];
  return header ? { column: header, prefixes: field?.source.prefixes } : undefined;
}

export function resolveDuplicateKey(profile: ImportProfile): ImportField {
  const keyField = profile.fields?.find((f) => f.roles.includes("key"));
  const resolved = pickHeader(keyField);
  if (!resolved) {
    throw new Error(`ImportProfile ${profile.tipoArquivo}: campo de chave (role=key) não definido`);
  }
  return resolved;
}

export function resolveDisplayName(profile: ImportProfile): ImportField[] {
  const displays = profile.fields?.filter((f) => f.roles.includes("display")) ?? [];
  const mapped = displays.map(pickHeader).filter(Boolean) as ImportField[];
  return mapped;
}

export function resolveContext(profile: ImportProfile): ResolvedContext {
  const findByName = (name: string): ImportField | undefined => {
    const match = profile.fields?.find((f) => f.roles.includes("context") && f.name === name);
    return pickHeader(match);
  };

  const resolved: ResolvedContext = {
    periodo: findByName("anoLetivo"),
    grupo: findByName("turma"),
    modalidade: findByName("modalidade"),
    serie: findByName("serie"),
    turno: findByName("turno"),
  };

  if (!resolved.periodo || !resolved.grupo || !resolved.modalidade || !resolved.serie) {
    throw new Error(`ImportProfile ${profile.tipoArquivo}: campos de contexto incompletos`);
  }

  return resolved;
}

export function extractFieldByName(
  row: Record<string, string>,
  profile: ImportProfile,
  name: string
): string | undefined {
  const ctx = resolveContext(profile);
  switch (name) {
    case "anoLetivo":
      return ctx?.periodo ? extractField(row, ctx.periodo) : undefined;
    case "turma":
      return ctx?.grupo ? extractField(row, ctx.grupo) : undefined;
    case "modalidade":
      return ctx?.modalidade ? extractField(row, ctx.modalidade) : undefined;
    case "serie":
      return ctx?.serie ? extractField(row, ctx.serie) : undefined;
    case "turno":
      return ctx?.turno ? extractField(row, ctx.turno) : undefined;
    default:
      return undefined;
  }
}
