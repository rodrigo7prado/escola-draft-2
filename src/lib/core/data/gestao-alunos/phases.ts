import dadosEscolares from "./def-objects/dadosEscolares"
import dadosPessoais from "./def-objects/dadosPessoais"
import historicoEscolar from "./def-objects/historicoEscolar"
import { type Phase, type PhaseSchema, type Schema } from "./phases.types"

export const PHASES_CONFIG = {
  "FASE:DADOS_PESSOAIS": {
    titulo: "Dados Pessoais",
    camposExigidos: dadosPessoais,
    icone: {
      name: "UserCheck",
      lib: "Lucide",
    },
    abaId: "pessoais",
    ordem: 1,
  },
  "FASE:DADOS_ESCOLARES": {
    titulo: "Dados Escolares",
    camposExigidos: dadosEscolares,
    icone: {
      name: "School2",
      lib: "Lucide",
    },
    abaId: "escolares",
    ordem: 2,
  },
  "FASE:HISTORICO_ESCOLAR": {
    titulo: "Histórico Escolar",
    camposExigidos: historicoEscolar,
    icone: {
      name: "FileText",
      lib: "Lucide",
    },
    abaId: "historico",
    ordem: 3,
  },
  "FASE:EMISSAO_DOCUMENTOS": {
    titulo: "Emissão de Documentos",
    camposExigidos: {} as PhaseSchema<"FASE:EMISSAO_DOCUMENTOS">,
    icone: {
      name: "FileCheck",
      lib: "Lucide",
    },
    abaId: "emissao",
    ordem: 4,
  },
} as const satisfies { [K in Phase]: Schema<K> }

export type AbaId = (typeof PHASES_CONFIG)[Phase]["abaId"]
