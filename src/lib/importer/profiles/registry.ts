import type { ResolverFn } from "@/lib/parsers/engine/types";
import type { LogicalLine, Persistor } from "@/lib/importer/pipelines/xlsx/types";
import type { KeyBuilderId, ParseResult } from "@/lib/parsers/tipos";
import type { ParsedCsv } from "@/lib/parsers/csv/hash";

export type ProfileResolver = ResolverFn;

// Serializer para XLSX (recebe ParseResult)
export type XlsxProfileSerializer = (
  parsed: ParseResult,
  opts: { selectedKeyId?: KeyBuilderId; rawSheets?: any[] }
) => LogicalLine[];

// Serializer para CSV (recebe ParsedCsv)
export type CsvProfileSerializer = (
  parsed: ParsedCsv,
  opts: { selectedKeyId?: KeyBuilderId }
) => LogicalLine[];

export type ProfileComponents = {
  resolvers?: Record<string, ProfileResolver>;
  serializer?: XlsxProfileSerializer | CsvProfileSerializer;
  persistor?: Persistor;
};

const profileRegistry: Record<string, ProfileComponents> = {};

export function registerProfile(tipoArquivo: string, components: ProfileComponents) {
  if (profileRegistry[tipoArquivo]) {
    console.warn(`Profile "${tipoArquivo}" já registrado. Sobrescrevendo.`);
  }
  profileRegistry[tipoArquivo] = components;
}

export function getProfileComponents(tipoArquivo: string): ProfileComponents | undefined {
  return profileRegistry[tipoArquivo];
}

export function isProfileRegistered(tipoArquivo: string): boolean {
  return tipoArquivo in profileRegistry;
}

export function listRegisteredProfiles(): string[] {
  return Object.keys(profileRegistry);
}