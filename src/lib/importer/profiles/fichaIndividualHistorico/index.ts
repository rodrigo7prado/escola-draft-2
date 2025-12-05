import { registerProfile } from "@/lib/importer/profiles/registry";
import { fichaIndividualResolvers } from "@/lib/parsers/profiles/fichaIndividualHistorico/resolvers";
import { serializarFichaDisciplina } from "@/lib/parsers/profiles/fichaIndividualHistorico/serializer";
import { persistSeriesHistorico } from "@/lib/importer/profiles/fichaIndividualHistorico/persist";

// Auto-registro: perfil declara seus componentes no registry
registerProfile("fichaIndividualHistorico", {
  resolvers: fichaIndividualResolvers,
  serializer: serializarFichaDisciplina,
  persistor: async (tx, params) => persistSeriesHistorico(tx, {
    parsed: params.parsed as any,
    alunoId: params.alunoId
  }),
});

export { fichaIndividualHistoricoProfile } from "./profile";