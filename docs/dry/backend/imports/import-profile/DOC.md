## Separação de LÓGICA DE FORMATO e LÓGICA DE PERFIL
1. Registry centralizado em: profiles/registry.ts
Funções: registerProfile(), getProfileComponents(), isProfileRegistered(), listRegisteredProfiles();
Simplificado: engine/xlsx/resolvers.ts (apenas exporta tipos)
2. xlsxDeclarativo recebe resolvers como parâmetro
Linha 164 de xlsxDeclarativo.ts
Engine não conhece mais resolvers específicos de perfis
3. Criado auto-registro para fichaIndividualHistorico
Arquivo novo: profiles/fichaIndividualHistorico/index.ts
Perfil se auto-registra com resolvers, serializer e persistor
4. Pipeline XLSX usa registry
pipeline.ts busca componentes do registry
Não mais dependências diretas de profiles específicos
5. Tipos corrigidos
executarExtratorXlsx retorna apenas ParseResult (não mais union com ParsedCsv)
ProfileSerializer tipado corretamente
ESTRUTURA FINAL
engine/ (GENÉRICO - lógica de formato)
├── xlsx/
│   ├── xlsxDeclarativo.ts  ← recebe resolvers via parâmetro
│   └── executors.ts         ← busca resolvers do registry
│
profiles/ (ESPECÍFICO - lógica de perfil)
├── registry.ts              ← ✨ NOVO: registry centralizado
├── fichaIndividualHistorico/
│   ├── index.ts             ← ✨ NOVO: auto-registro
│   ├── resolvers.ts         ← resolvers do perfil
│   ├── serializer.ts        ← serializer do perfil
│   └── persist.ts           ← persistor do perfil

## COMO ADICIONAR NOVO PERFIL
// profiles/novoPerfil/index.ts
import { registerProfile } from "@/lib/importer/profiles/registry";

registerProfile("novoPerfil", {
  resolvers: { meuResolver: (ctx) => /* ... */ },
  serializer: (parsed, opts) => /* ... */,
  persistor: async (tx, params) => /* ... */,
});

export { novoPerfilProfile } from "./profile";
✅ SEM tocar na engine!

---------------------------------------------------------------------

✅ IMPLEMENTAÇÃO CONCLUÍDA
O que foi implementado:
Parser XLSX Genérico (fieldsParser.ts)
✅ Extrai rótulos (padrão LABEL: value)
✅ Detecta e extrai tabelas (headers + rows)
✅ 100% agnóstico de domínio
✅ Retorna ParsedXlsx (estrutura genérica)
Interpretador Genérico (fieldsInterpreter.ts)
✅ Usa apenas metadata declarativa (roles, persist.tipo, persist.modelo)
✅ Converte ParsedXlsx → ParseResult
✅ Não conhece domínio específico
Executor Atualizado (executors.ts)
✅ Usa fields ao invés de campos
✅ Fluxo: buffer → parseXlsxGeneric → interpretarXlsxComFields → ParseResult
Profile Corrigido (profile.ts)
✅ Removida importação do mapeamento.ts
✅ Usa apenas fields (simétrico com CSV)
Auto-registro Garantido (index.ts)
✅ Side-effect imports para executar registerProfile()
Arquitetura Final:
CSV:  profile.fields → parseCsvLoose → ParsedCsv → csvPersistor
XLSX: profile.fields → parseXlsxGeneric → ParsedXlsx → interpretarXlsxComFields → ParseResult → xlsxPersistor
Separação rigorosa:
✅ Formato (XLSX) = genérico, não conhece domínio
✅ Perfil = declarativo via fields
✅ Lógica específica = no persistor do perfil
Próximos passos sugeridos:
Testar importação XLSX com arquivo real
Validar se os dados estão sendo persistidos corretamente
Ajustar normalização se necessário (atualmente por heurística de nome)