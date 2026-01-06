import { Prisma } from "@prisma/client"

export const keys = <T extends object>(o: T) =>
  Object.keys(o) as Array<Extract<keyof T, string>>

const modelosPrisma = Object.keys(Prisma.ModelName) as (keyof typeof Prisma.ModelName)[]
type ModelosPrisma = (typeof modelosPrisma)[number]
type ModelosPrismaSchema = { modeloFluxo: boolean; scalarFields: readonly string[] }

export const modelosPrismaSchema = {
  Aluno: { modeloFluxo: true, scalarFields: keys(Prisma.AlunoScalarFieldEnum) },
  Enturmacao: { modeloFluxo: true, scalarFields: keys(Prisma.EnturmacaoScalarFieldEnum) },
  SerieCursada: { modeloFluxo: true, scalarFields: keys(Prisma.SerieCursadaScalarFieldEnum) },
  HistoricoEscolar: { modeloFluxo: true, scalarFields: keys(Prisma.HistoricoEscolarScalarFieldEnum) },
  ArquivoImportado: { modeloFluxo: false, scalarFields: keys(Prisma.ArquivoImportadoScalarFieldEnum) },
  LinhaImportada: { modeloFluxo: false, scalarFields: keys(Prisma.LinhaImportadaScalarFieldEnum) },
  Auditoria: { modeloFluxo: false, scalarFields: keys(Prisma.AuditoriaScalarFieldEnum) },
} as const satisfies Record<Prisma.ModelName, ModelosPrismaSchema>

const modelosPrismaFluxo = Object.entries(modelosPrismaSchema)
  .filter(([, valor]) => valor.modeloFluxo)
  .map(([modelo]) => modelo) as ModelosPrisma[]

export type ModelosPrismaFluxo = (typeof modelosPrismaFluxo)[number]

export const PHASES = [
  "FASE:DADOS_PESSOAIS",
  "FASE:DADOS_ESCOLARES",
  "FASE:HISTORICO_ESCOLAR",
  "FASE:EMISSAO_DOCUMENTOS",
] as const
export type Phase = (typeof PHASES)[number]
export type PhaseStatus = "completo" | "incompleto" | "ausente"

export const phaseSchema = {
  "FASE:DADOS_PESSOAIS": { modelosEnvolvidos: ["Aluno"] },
  "FASE:DADOS_ESCOLARES": { modelosEnvolvidos: ["Aluno", "SerieCursada"] },
  "FASE:HISTORICO_ESCOLAR": { modelosEnvolvidos: ["SerieCursada", "HistoricoEscolar"] },
  "FASE:EMISSAO_DOCUMENTOS": { modelosEnvolvidos: [] },
} as const satisfies Record<
  Phase,
  { modelosEnvolvidos: readonly ModelosPrismaFluxo[] }
>

export type DocEmissao =
  | "Certificado/Certidão"
  | "Apenas Certificado"
  | "Apenas Certidão"
  | "Histórico Escolar"

export type PhaseSchema<T extends Phase> = {
  [L in (typeof phaseSchema)[T]["modelosEnvolvidos"][number]]: {
    [M in (typeof modelosPrismaSchema)[L]["scalarFields"][number]]: DocEmissao[];
  };
}

export type Schema<T extends Phase> = {
  titulo: string
  camposExigidos: PhaseSchema<T>
  icone: {
    name: string
    lib: "Lucide" | "SVG"
  }
  abaId: string
  ordem: number
}

export type GestaoAlunos = { [K in Phase]: Schema<K> }
