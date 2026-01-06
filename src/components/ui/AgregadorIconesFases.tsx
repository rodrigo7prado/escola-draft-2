import { IconeStatusFase } from "./IconeStatusFase"
import { PHASES_CONFIG } from "@/lib/core/data/gestao-alunos/phases"
import { PHASES, type Phase, type PhaseStatus } from "@/lib/core/data/gestao-alunos/phases.types"

export type StatusInfoFase = {
  status: PhaseStatus
  label: string
  title: string
}

export type StatusPorFase = Record<Phase, StatusInfoFase>

const fasesOrdenadas = [...PHASES].sort(
  (faseA, faseB) => PHASES_CONFIG[faseA].ordem - PHASES_CONFIG[faseB].ordem
)

export function AgregadorIconesFases({ statusPorFase }: { statusPorFase: StatusPorFase }) {
  return (
    <div className="flex items-center gap-2">
      {fasesOrdenadas.map((fase) => {
        const statusInfo = statusPorFase[fase]
        const titulo = PHASES_CONFIG[fase].titulo

        const infoSegura =
          statusInfo ??
          ({
            status: "ausente",
            label: "--",
            title: `${titulo}: sem dados`,
          } as StatusInfoFase)

        return (
          <IconeStatusFase
            key={fase}
            phase={fase}
            status={infoSegura.status}
            label={infoSegura.label}
            title={infoSegura.title}
          />
        )
      })}
    </div>
  )
}
