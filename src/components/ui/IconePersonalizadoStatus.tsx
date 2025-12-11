"use client";

import { CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type StatusType = "success" | "error" | "pending" | "warning";

type IconePersonalizadoStatusProps = {
  status: StatusType;
  tooltip?: string;
  icon?: LucideIcon;
  size?: "sm" | "md" | "lg";
};

const statusConfig: Record<StatusType, { icon: LucideIcon; color: string }> = {
  success: {
    icon: CheckCircle,
    color: "text-green-600",
  },
  error: {
    icon: XCircle,
    color: "text-red-600",
  },
  pending: {
    icon: Clock,
    color: "text-yellow-600",
  },
  warning: {
    icon: AlertCircle,
    color: "text-orange-600",
  },
};

const sizeConfig = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-6 w-6",
};

/**
 * DRY.UI:ICONE_PERSONALIZADO_STATUS
 * Ícone personalizado para representar status (sucesso, erro, pendente, aviso)
 */
export function IconePersonalizadoStatus({
  status,
  tooltip,
  icon,
  size = "md",
}: IconePersonalizadoStatusProps) {
  const config = statusConfig[status];
  const IconComponent = icon || config.icon;
  const sizeClass = sizeConfig[size];

  return (
    <div className="inline-flex items-center justify-center" title={tooltip}>
      <IconComponent className={`${config.color} ${sizeClass}`} />
    </div>
  );
}