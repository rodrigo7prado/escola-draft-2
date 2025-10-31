"use client";

import { ButtonGroup } from '@/components/ui/ButtonGroup';

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
    <div className="space-y-4 border rounded-md p-4 bg-neutral-50">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-neutral-700">Filtros de Certificação</h3>
        {hasFiltrosAtivos && (
          <button
            onClick={onLimparFiltros}
            className="text-xs text-red-600 hover:underline"
            type="button"
          >
            Limpar filtros
          </button>
        )}
      </div>

      {/* Período Letivo */}
      <div>
        <label className="text-xs font-medium text-neutral-600 block mb-2">
          Período Letivo
        </label>
        {isLoadingAnos ? (
          <div className="text-xs text-neutral-500">Carregando anos...</div>
        ) : (
          <ButtonGroup
            options={[...anosDisponiveis].sort((a, b) => b.localeCompare(a))} // Ordem decrescente
            value={anoLetivo}
            onChange={onAnoChange}
            buttonClassName="min-w-[80px]"
          />
        )}
      </div>

      {/* Série (fixo em 3ª série) */}
      <div>
        <label className="text-xs font-medium text-neutral-600 block mb-2">
          Série
        </label>
        <div className="inline-block px-4 py-2 text-sm bg-blue-100 text-blue-700 rounded-md font-medium">
          3ª Série
        </div>
        <p className="text-[10px] text-neutral-500 mt-1">
          Certificação disponível apenas para concluintes (3ª série)
        </p>
      </div>

      {/* Turmas */}
      {anoLetivo && (
        <div>
          <label className="text-xs font-medium text-neutral-600 block mb-2">
            Turmas
          </label>
          {isLoadingTurmas ? (
            <div className="text-xs text-neutral-500">Carregando turmas...</div>
          ) : turmasDisponiveis.length > 0 ? (
            <div className="overflow-x-auto">
              <ButtonGroup
                options={turmasDisponiveis}
                value={turma}
                onChange={onTurmaChange}
                buttonClassName="min-w-[100px]"
              />
            </div>
          ) : (
            <div className="text-xs text-neutral-500">
              Nenhuma turma de 3ª série encontrada para este ano
            </div>
          )}
        </div>
      )}

      {/* Resumo dos filtros ativos */}
      {hasFiltrosAtivos && (
        <div className="pt-3 border-t text-xs text-neutral-600">
          <strong>Filtros ativos:</strong>
          {anoLetivo && <span className="ml-2">Ano: {anoLetivo}</span>}
          {turma && <span className="ml-2">| Turma: {turma}</span>}
        </div>
      )}
    </div>
  );
}
