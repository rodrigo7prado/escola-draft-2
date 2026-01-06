import type { ComponentType } from "react"
import * as LucideIcons from "lucide-react"
import { PHASES_CONFIG } from "@/lib/core/data/gestao-alunos/phases"
import type { Phase, PhaseStatus } from "@/lib/core/data/gestao-alunos/phases.types"

type IconeStatusFaseProps = {
  phase: Phase
  status: PhaseStatus
  label: string
  title: string
}

export function IconeStatusFase({
  phase,
  status,
  label,
  title,
}: IconeStatusFaseProps) {
  const config = PHASES_CONFIG[phase]

  const Icon =
    config.icone.lib === "Lucide" && config.icone.name in LucideIcons
      ? (LucideIcons as Record<string, ComponentType<{ className?: string }>>)[config.icone.name]
      : LucideIcons.CircleAlert

  const cor = corPorStatus(status)

  return (
    <div
      className="flex min-w-[52px] flex-col items-center text-[10px] font-semibold leading-tight"
      title={title}
    >
      <Icon className={`h-4 w-4 ${cor}`} aria-label={config.titulo} />
      <span className={`mt-0.5 ${cor}`}>{label}</span>
    </div>
  )
}

function corPorStatus(status: PhaseStatus): string {
  if (status === "completo") return "text-green-700"
  if (status === "ausente") return "text-red-600"
  return "text-yellow-600"
}
