"use client";

import { useFiltrosCertificacao } from '@/hooks/useFiltrosCertificacao';
import { FiltrosCertificacao } from './FiltrosCertificacao';
import { ListaAlunosCertificacao } from './ListaAlunosCertificacao';

export function FluxoCertificacao() {
  const {
    filtros,
    anoLetivo,
    turma,
    anosDisponiveis,
    turmasDisponiveis,
    isLoadingAnos,
    isLoadingTurmas,
    handleAnoChange,
    handleTurmaChange,
    limparFiltros,
    hasFiltrosAtivos
  } = useFiltrosCertificacao();

  return (
    <div className="space-y-4">
      <FiltrosCertificacao
        anoLetivo={anoLetivo}
        turma={turma}
        anosDisponiveis={anosDisponiveis}
        turmasDisponiveis={turmasDisponiveis}
        isLoadingAnos={isLoadingAnos}
        isLoadingTurmas={isLoadingTurmas}
        onAnoChange={handleAnoChange}
        onTurmaChange={handleTurmaChange}
        onLimparFiltros={limparFiltros}
        hasFiltrosAtivos={hasFiltrosAtivos}
      />
      <ListaAlunosCertificacao filtros={filtros} />
    </div>
  );
}
