import { registerProfile } from "@/lib/importer/profiles/registry";
import { serializarCsvLinhasSimples } from "@/lib/parsers/engine/csv/serializers";
import { persistAlunosDomain } from "@/lib/importer/profiles/ataResultadosFinais/persist";

// Auto-registro: perfil declara seus componentes no registry
registerProfile("ata-resultados-finais", {
  serializer: serializarCsvLinhasSimples,
  csvPersistor: persistAlunosDomain,
});

export { ataResultadosFinaisProfile } from "./profile";