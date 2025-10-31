"use client";

import { useAlunosCertificacao } from '@/hooks/useAlunosCertificacao';
import type { FiltrosCertificacaoState } from '@/hooks/useFiltrosCertificacao';

type ListaAlunosCertificacaoProps = {
  filtros: FiltrosCertificacaoState;
};

export function ListaAlunosCertificacao({ filtros }: ListaAlunosCertificacaoProps) {
  const { alunos, isLoading, error, totalAlunos } = useAlunosCertificacao(filtros);

  if (isLoading) {
    return (
      <div className="text-center py-8 text-neutral-500">
        Carregando alunos...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-600">
        Erro ao carregar alunos: {error}
      </div>
    );
  }

  if (!filtros.anoLetivo) {
    return (
      <div className="text-center py-8 text-neutral-500">
        Selecione um período letivo
      </div>
    );
  }

  if (totalAlunos === 0) {
    return (
      <div className="text-center py-8 text-neutral-500">
        Nenhum aluno encontrado para os filtros selecionados
      </div>
    );
  }

  return (
    <div className="border rounded-md overflow-hidden">
      {/* Header */}
      <div className="bg-neutral-100 px-4 py-2 border-b">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-neutral-700">
            Alunos Concluintes - 3ª Série
          </h3>
          <span className="text-xs text-neutral-600">
            {totalAlunos} {totalAlunos === 1 ? 'aluno' : 'alunos'}
          </span>
        </div>
      </div>

      {/* Tabela */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="bg-neutral-50 border-b">
            <tr>
              <th className="px-3 py-2 text-left font-medium text-neutral-600">Matrícula</th>
              <th className="px-3 py-2 text-left font-medium text-neutral-600">Nome</th>
              <th className="px-3 py-2 text-left font-medium text-neutral-600">CPF</th>
              <th className="px-3 py-2 text-left font-medium text-neutral-600">Turma</th>
              <th className="px-3 py-2 text-left font-medium text-neutral-600">Status</th>
            </tr>
          </thead>
          <tbody>
            {alunos.map((aluno) => (
              <tr key={aluno.id} className="border-b hover:bg-neutral-50">
                <td className="px-3 py-2 font-mono">{aluno.matricula}</td>
                <td className="px-3 py-2">{aluno.nome || <span className="text-neutral-400">Não informado</span>}</td>
                <td className="px-3 py-2 font-mono">{aluno.cpf || <span className="text-neutral-400">-</span>}</td>
                <td className="px-3 py-2">
                  {aluno.enturmacoes?.[0]?.turma || <span className="text-neutral-400">-</span>}
                </td>
                <td className="px-3 py-2">
                  {aluno.fonteAusente ? (
                    <span className="text-[10px] bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded">
                      Fonte ausente
                    </span>
                  ) : (
                    <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
                      OK
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
