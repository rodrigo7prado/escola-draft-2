import { Prisma } from "@prisma/client";
import dadosPessoais from "./dadosPessoais";
import dadosEscolares from "./dadosEscolares";
import historicoEscolar from "./historicoEscolar";

// Modelos do Prisma para string[]
const ModelosPrisma = Prisma.ModelName;

export const keys = <T extends object>(o: T) =>
  Object.keys(o) as Array<Extract<keyof T, string>>;


// Obter chaves do enum ModelName como um array de strings em literal types
const modelosPrisma = Object.keys(Prisma.ModelName) as (keyof typeof Prisma.ModelName)[];
type ModelosPrisma = (typeof modelosPrisma)[number];
type ModelosPrismaSchema = { modeloFluxo: boolean; scalarFields: readonly string[] };

export const modelosPrismaSchema = {
  Aluno: { modeloFluxo: true, scalarFields: keys(Prisma.AlunoScalarFieldEnum) },
  Enturmacao: { modeloFluxo: true, scalarFields: keys(Prisma.EnturmacaoScalarFieldEnum) },
  SerieCursada: { modeloFluxo: true, scalarFields: keys(Prisma.SerieCursadaScalarFieldEnum) },
  HistoricoEscolar: { modeloFluxo: true, scalarFields: keys(Prisma.HistoricoEscolarScalarFieldEnum) },
  ArquivoImportado: { modeloFluxo: false, scalarFields: keys(Prisma.ArquivoImportadoScalarFieldEnum) },
  LinhaImportada: { modeloFluxo: false, scalarFields: keys(Prisma.LinhaImportadaScalarFieldEnum) },
  Auditoria: { modeloFluxo: false, scalarFields: keys(Prisma.AuditoriaScalarFieldEnum) },
} as const satisfies Record<Prisma.ModelName, ModelosPrismaSchema>;

// Filtrar modelosPrismaSchema para obter apenas os com modeloFluxo true e sevir de literal types
const modelosPrismaFluxo = Object.entries(modelosPrismaSchema)
  .filter(([, valor]) => valor.modeloFluxo)
  .map(([modelo]) => modelo) as ModelosPrisma[];

export type ModelosPrismaFluxo = (typeof modelosPrismaFluxo)[number];

// const campos2: Record<ModelosPrismaFluxo,

export const PHASES = [
  "FASE:DADOS_PESSOAIS",
  "FASE:DADOS_ESCOLARES",
  "FASE:HISTORICO_ESCOLAR",
  "FASE:EMISSAO_DOCUMENTOS",
] as const;
export type Phase = (typeof PHASES)[number];

export const phaseSchema = {
  "FASE:DADOS_PESSOAIS": { modelosEnvolvidos: ["Aluno"] },
  "FASE:DADOS_ESCOLARES": { modelosEnvolvidos: ["Aluno", "SerieCursada"] },
  "FASE:HISTORICO_ESCOLAR": { modelosEnvolvidos: ["SerieCursada", "HistoricoEscolar"] },
  "FASE:EMISSAO_DOCUMENTOS": { modelosEnvolvidos: [] },
} as const satisfies Record<
  Phase,
  { modelosEnvolvidos: readonly ModelosPrismaFluxo[] }
>;

type DocEmissao = "Certificado/Certidão" | "Apenas Certificado" | "Apenas Certidão" | "Histórico Escolar";

export type PhaseSchema<T extends Phase> = {
  [L in (typeof phaseSchema)[T]["modelosEnvolvidos"][number]]: {
    [M in (typeof modelosPrismaSchema)[L]["scalarFields"][number]]: DocEmissao[];
  };
}

export type GestaoAlunos = {
  titulo: string;
  camposExigidos: string[]
  icone: {
    name: string;
    lib: "Lucide" | "SVG";
  }
}

type Schema<T extends Phase> = {
  titulo: string,
  camposExigidos: PhaseSchema<T>,
  icone: {
    name: string,
    lib: "Lucide" | "SVG"
  }
}

const gestaoAlunos2 = {
  "FASE:DADOS_PESSOAIS": {
    titulo: "",
    camposExigidos: dadosPessoais,
    icone: {
      name: "UserCheck",
      lib: "Lucide"
    }
  },
  "FASE:DADOS_ESCOLARES": {
    titulo: "",
    camposExigidos: dadosEscolares,
    icone: {
      name: "School2",
      lib: "Lucide"
    }
  },
  "FASE:HISTORICO_ESCOLAR": {
    titulo: "",
    camposExigidos: historicoEscolar,
    icone: {
      name: "FileText",
      lib: "Lucide"
    }
  },
  "FASE:EMISSAO_DOCUMENTOS": {
    titulo: "Emissão de Documentos",
    camposExigidos: {} as PhaseSchema<"FASE:EMISSAO_DOCUMENTOS">,
    icone: {
      name: "FileCheck",
      lib: "Lucide"
    }
  },
} as const satisfies { [K in Phase]: Schema<K> };