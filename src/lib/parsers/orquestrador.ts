import type { Formato, ParserConfig, ParseResult } from "./tipos";

export type ExtratorFn = (input: Buffer, formato: Formato) => Promise<ParseResult>;
export type PersistidorFn = (dados: ParseResult) => Promise<void>;

export async function executarParser(
  config: ParserConfig,
  input: Buffer,
  formato: Formato,
  extrairDados: ExtratorFn,
  persistirDados?: PersistidorFn
) {
  if (!config.formatosSuportados.includes(formato)) {
    throw new Error(`Formato não suportado: ${formato}`);
  }

  const extraido = await extrairDados(input, formato);

  if (persistirDados) {
    await persistirDados(extraido);
  }

  return extraido;
}
