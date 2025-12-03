import { serializarFichaDisciplina } from "@/lib/parsers/profiles/fichaIndividualHistorico/serializer";

const xlsxLineSerializers = {
  fichaIndividualHistorico: serializarFichaDisciplina,
};

export function resolveXlsxSerializer(tipoArquivo: string) {
  return xlsxLineSerializers[tipoArquivo];
}
