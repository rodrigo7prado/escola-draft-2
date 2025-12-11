"use client";

import { IconePersonalizadoStatus } from "./IconePersonalizadoStatus";
import type { StatusType } from "./IconePersonalizadoStatus";
import type { LucideIcon } from "lucide-react";

export type StatusItem = {
  status: StatusType;
  tooltip?: string;
  icon?: LucideIcon;
};

type AgregadorIconesStatusProps = {
  statuses: StatusItem[];
  orientation?: "horizontal" | "vertical";
  spacing?: "ultracompact" | "compact" | "normal" | "relaxed";
  size?: "sm" | "md" | "lg";
};

const spacingConfig = {
  ultracompact: "gap-0.5",
  compact: "gap-1",
  normal: "gap-2",
  relaxed: "gap-3",
};

/**
 * DRY.UI:AGREGADOR_ICONES_STATUS
 * Componente que agrega múltiplos ícones de status personalizados
 */
export function AgregadorIconesStatus({
  statuses,
  orientation = "horizontal",
  spacing = "ultracompact",
  size = "md",
}: AgregadorIconesStatusProps) {
  const spacingClass = spacingConfig[spacing];
  const orientationClass = orientation === "vertical" ? "flex-col" : "flex-row";

  return (
    <div className={`flex items-center ${orientationClass} ${spacingClass}`}>
      {statuses.map((item, index) => (
        <IconePersonalizadoStatus
          key={index}
          status={item.status}
          tooltip={item.tooltip}
          icon={item.icon}
          size={size}
        />
      ))}
    </div>
  );
}