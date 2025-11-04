"use client";

import { useState } from "react";
import { ListaAlunosPendentes } from "@/components/ListaAlunosPendentes";

type TurmaData = {
  nome: string;
  totalAlunosCSV: number;
  totalAlunosBanco: number;
  pendentes: number;
  status: 'ok' | 'pendente';
  alunosPendentes?: { matricula: string; nome: string }[];
};

type TurmaItemProps = {
  turma: TurmaData;
};

export function TurmaItem({ turma }: TurmaItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const statusIcon = turma.status === 'ok' ? '✅' : '⚠️';
  const statusColor = turma.status === 'ok' ? 'text-green-700' : 'text-orange-600';

  return (
    <div className="border rounded-sm">
      {/* Header da turma */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-3 py-2 flex items-center justify-between hover:bg-neutral-50 transition-colors text-left"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm">📋</span>
          <div>
            <div className="text-sm font-medium flex items-center gap-2">
              Turma {turma.nome}
              <span className={statusColor}>{statusIcon}</span>
            </div>
            <div className="text-xs text-neutral-500 mt-0.5">
              {turma.totalAlunosCSV} no CSV ·
              {' '}{turma.totalAlunosBanco} no banco
              {turma.pendentes > 0 && (
                <span className="text-orange-600 font-medium">
                  {' '}· {turma.pendentes} pendentes
                </span>
              )}
            </div>
          </div>
        </div>

        {turma.status === 'pendente' && (
          <span className="text-neutral-400 text-xs">
            {isExpanded ? '▼' : '▶'}
          </span>
        )}
      </button>

      {/* Lista de alunos pendentes (só se houver) */}
      {isExpanded && turma.status === 'pendente' && turma.alunosPendentes && (
        <div className="px-3 pb-2 border-t">
          <ListaAlunosPendentes alunos={turma.alunosPendentes} />
        </div>
      )}
    </div>
  );
}
