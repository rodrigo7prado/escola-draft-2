import { registerProfile } from "@/lib/importer/profiles/registry";
import { serializarCsvLinhasSimples } from "@/lib/parsers/engine/csv/serializers";
import { persistAlunosDomain } from "@/lib/importer/profiles/ataResultadosFinais/persist";
import type { ParsedCsv } from "@/lib/parsers/csv/hash";

// Auto-registro: perfil declara seus componentes no registry
registerProfile("ata-resultados-finais", {
  serializer: serializarCsvLinhasSimples,
  persistor: async (tx, params) => {
    const parsed = params.parsed as ParsedCsv;
    return persistAlunosDomain(tx, {
      rows: parsed.rows || [],
      linhas: params.lines as any,
      arquivo: { id: "" },
      dataHash: "",
      fileName: "",
      profile: params.profile,
    });
  },
});

export { ataResultadosFinaisProfile } from "./profile";