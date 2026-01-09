"use client";

import { ScrollableButtonGroup } from '@/components/ui/ScrollableButtonGroup';
import { Button } from '@/components/ui/Button';

type FiltrosCertificacaoProps = {
  anoLetivo: string;
  turma: string;
  anosDisponiveis: string[];
  turmasDisponiveis: string[];
  isLoadingAnos: boolean;
  isLoadingTurmas: boolean;
  onAnoChange: (ano: string) => void;
  onTurmaChange: (turma: string) => void;
  onLimparFiltros: () => void;
  hasFiltrosAtivos: boolean;
};

export function FiltrosCertificacao({
  anoLetivo,
  turma,
  anosDisponiveis,
  turmasDisponiveis,
  isLoadingAnos,
  isLoadingTurmas,
  onAnoChange,
  onTurmaChange,
  onLimparFiltros,
  hasFiltrosAtivos
}: FiltrosCertificacaoProps) {
  const formatTurmaLabel = (turmaLabel: string) => {
    const [prefixo] = turmaLabel.split('-');
    return prefixo?.trim() || turmaLabel;
  };

  return (
    <div className="space-y-2 border rounded-sm p-3 bg-neutral-50">
      {/* Header compacto com informação de série */}
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-neutral-700">
          Seleção de Turma <span className="text-blue-600">(3ª Série)</span>
        </h3>
        {hasFiltrosAtivos && (
          <Button
            onClick={onLimparFiltros}
            variant="ghost"
            size="sm"
            className="text-[10px] text-red-600 hover:underline h-auto px-0 py-0"
          >
            Limpar
          </Button>
        )}
      </div>

      {/* Layout compacto em linha */}
      <div className="space-y-1">
        {/* Período Letivo */}
        {isLoadingAnos ? (
          <div className="text-[10px] text-neutral-500">Carregando...</div>
        ) : (
          <ScrollableButtonGroup
            options={[...anosDisponiveis].sort((a, b) => b.localeCompare(a))}
            value={anoLetivo}
            onChange={onAnoChange}
            getItemTitle={(option) => `Período: ${option}`}
          />
        )}

        {/* Turmas */}
        {anoLetivo && (
          <>
            {isLoadingTurmas ? (
              <div className="text-[10px] text-neutral-500">Carregando...</div>
            ) : turmasDisponiveis.length > 0 ? (
              <ScrollableButtonGroup
                options={turmasDisponiveis}
                value={turma}
                onChange={onTurmaChange}
                getItemLabel={formatTurmaLabel}
                getItemTitle={(option) => `Turma: ${formatTurmaLabel(option)}`}
              />
            ) : (
              <div className="text-[10px] text-neutral-500">
                Nenhuma turma encontrada
              </div>
            )}
          </>
        )}
      </div>

      {/* Resumo compacto */}
      {hasFiltrosAtivos && (
        <div className="pt-2 border-t text-[10px] text-neutral-600">
          {anoLetivo && <span>Ano: {anoLetivo}</span>}
          {turma && (
            <span className="ml-2">| Turma: {formatTurmaLabel(turma)}</span>
          )}
        </div>
      )}
    </div>
  );
}
