"use client";

import type { AlunoDetalhado } from "@/hooks/useAlunoSelecionado";

type DadosAlunoHistoricoProps = {
  aluno: AlunoDetalhado | null;
  isLoading: boolean;
  erro?: string | null;
};

export function DadosAlunoHistorico({
  aluno,
  isLoading,
  erro,
}: DadosAlunoHistoricoProps) {
  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center text-sm text-neutral-500">
        Carregando histórico escolar...
      </div>
    );
  }

  if (erro) {
    return (
      <div className="h-full flex items-center justify-center text-sm text-red-600 text-center px-6">
        {erro}
      </div>
    );
  }

  if (!aluno) {
    return (
      <div className="text-center py-12 text-neutral-500 text-sm">
        Selecione um aluno para ver o histórico escolar
      </div>
    );
  }

  return (
    <div className="h-full flex items-center justify-center text-sm text-neutral-500 text-center px-6">
      Conteúdo do Histórico Escolar será implementado posteriormente.
    </div>
  );
}
