"use client";

import type { AlunoDetalhado } from "@/hooks/useAlunoSelecionado";

type DadosAlunoEmissaoProps = {
  aluno: AlunoDetalhado | null;
  isLoading: boolean;
  erro?: string | null;
};

export function DadosAlunoEmissao({
  aluno,
  isLoading,
  erro,
}: DadosAlunoEmissaoProps) {
  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center text-sm text-neutral-500">
        Carregando dados para emissão de documentos...
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
        Selecione um aluno para ver emissão de documentos
      </div>
    );
  }

  return (
    <div className="h-full flex items-center justify-center text-sm text-neutral-500 text-center px-6">
      Conteúdo de Emissão de Documentos será implementado posteriormente.
    </div>
  );
}
