"use client";

import { useFiltrosCertificacao } from '@/hooks/useFiltrosCertificacao';
import { useAlunoSelecionado } from '@/hooks/useAlunoSelecionado';
import { FiltrosCertificacao } from './FiltrosCertificacao';
import { ListaAlunosCertificacao } from './ListaAlunosCertificacao';
import { DadosAlunoEditavel } from './DadosAlunoEditavel';

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

  const {
    alunoSelecionado,
    selecionarAluno,
  } = useAlunoSelecionado();

  return (
    <div className="grid grid-cols-[300px_1fr] gap-4 h-[calc(100vh-280px)] overflow-hidden">
      {/* Sidebar Esquerda - Lista de Alunos */}
      <div className="h-full overflow-hidden">
        <ListaAlunosCertificacao
          filtros={filtros}
          alunoSelecionadoId={alunoSelecionado?.id || null}
          onSelecionarAluno={selecionarAluno}
        />
      </div>

      {/* Painel Direito - Filtros + Dados */}
      <div className="flex flex-col gap-3 h-full overflow-hidden">
        {/* Seleção de Turma - Altura fixa e compacta */}
        <div className="flex-shrink-0">
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
        </div>

        {/* Dados do Aluno - Ocupa o espaço restante com overflow interno */}
        <div className="flex-1 border rounded-sm overflow-hidden min-h-0">
          <DadosAlunoEditavel aluno={alunoSelecionado} />
        </div>
      </div>
    </div>
  );
}
