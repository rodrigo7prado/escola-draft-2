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
      <div className="space-y-2">
        {/* Período Letivo */}
        <div className="flex items-center gap-2">
          <label className="text-[10px] font-medium text-neutral-600 w-20 flex-shrink-0">
            Período:
          </label>
          {isLoadingAnos ? (
            <div className="text-[10px] text-neutral-500">Carregando...</div>
          ) : (
            <div className="flex-1 min-w-0">
              <ScrollableButtonGroup
                options={[...anosDisponiveis].sort((a, b) => b.localeCompare(a))}
                value={anoLetivo}
                onChange={onAnoChange}
                buttonClassName="min-w-[60px]"
                maxVisibleItems={2}
              />
            </div>
          )}
        </div>

        {/* Turmas */}
        {anoLetivo && (
          <div className="flex items-start gap-2">
            <label className="text-[10px] font-medium text-neutral-600 w-20 flex-shrink-0 pt-1">
              Turmas:
            </label>
            {isLoadingTurmas ? (
              <div className="text-[10px] text-neutral-500">Carregando...</div>
            ) : turmasDisponiveis.length > 0 ? (
              <div className="flex-1 min-w-0">
                <ScrollableButtonGroup
                  options={turmasDisponiveis}
                  value={turma}
                  onChange={onTurmaChange}
                  buttonClassName="min-w-[70px]"
                  maxVisibleItems={3}
                />
              </div>
            ) : (
              <div className="text-[10px] text-neutral-500">
                Nenhuma turma encontrada
              </div>
            )}
          </div>
        )}
      </div>

      {/* Resumo compacto */}
      {hasFiltrosAtivos && (
        <div className="pt-2 border-t text-[10px] text-neutral-600">
          {anoLetivo && <span>Ano: {anoLetivo}</span>}
          {turma && <span className="ml-2">| Turma: {turma}</span>}
        </div>
      )}
    </div>
  );
}
