"use client";

import { useAlunosCertificacao } from "@/hooks/useAlunosCertificacao";
import type { FiltrosCertificacaoState } from "@/hooks/useFiltrosCertificacao";
import { Button } from "@/components/ui/Button";
import { BotaoColagemAluno } from "./BotaoColagemAluno";

type Aluno = {
  id: string;
  matricula: string;
  nome: string | null;
  cpf: string | null;
  origemTipo: string;
  fonteAusente: boolean;
  enturmacoes?: Array<{
    anoLetivo: string;
    regime: number;
    modalidade: string;
    turma: string;
    serie: string;
  }>;
};

type ListaAlunosCertificacaoProps = {
  filtros: FiltrosCertificacaoState;
  alunoSelecionadoId: string | null;
  onSelecionarAluno: (aluno: any) => void;
  alunoIdModoColagemAtivo: string | null;
  onToggleModoColagem: (alunoId: string, ativo: boolean) => void;
};

export function ListaAlunosCertificacao({
  filtros,
  alunoSelecionadoId,
  onSelecionarAluno,
  alunoIdModoColagemAtivo,
  onToggleModoColagem,
}: ListaAlunosCertificacaoProps) {
  const { alunos, isLoading, error, totalAlunos } =
    useAlunosCertificacao(filtros);

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
    <div className="border rounded-sm flex flex-col min-h-0 h-full">
      {/* Header - Fixed Container */}
      <div className="bg-neutral-100 px-3 py-2 border-b shrink-0">
        <h3 className="text-xs font-semibold text-neutral-700">
          Alunos ({totalAlunos})
        </h3>
      </div>

      {/* Content Wrapper */}
      <div className="min-h-0 flex-1">
        {/* Overflow Container */}
        <div className="overflow-y-auto h-full">
          {alunos.map((aluno) => {
            const isSelected = alunoSelecionadoId === aluno.id;
            const isModoColagemAtivo = alunoIdModoColagemAtivo === aluno.id;
            return (
              <div key={aluno.id} className="border-b">
                <Button
                  onClick={() => onSelecionarAluno(aluno)}
                  variant="ghost"
                  className={`w-full text-left px-3 py-2 hover:bg-blue-50 transition-colors rounded-none justify-start h-auto ${
                    isSelected ? "bg-blue-100 border-l-4 border-l-blue-600" : ""
                  }`}
                >
                  <div className="flex flex-col items-start w-full">
                    <div className="text-xs font-medium truncate w-full">
                      {aluno.nome || "Sem nome"}
                    </div>
                    <div className="text-[10px] text-neutral-500 font-mono">
                      {aluno.matricula}
                    </div>
                    {aluno.fonteAusente && (
                      <div className="text-[9px] text-yellow-600 mt-0.5">
                        ⚠️ Fonte ausente
                      </div>
                    )}
                  </div>
                </Button>

                {/* Botões de Colagem */}
                {isSelected && (
                  <div className="px-3 pb-2">
                    <BotaoColagemAluno
                      matricula={aluno.matricula}
                      alunoId={aluno.id}
                      isModoColagemAtivo={isModoColagemAtivo}
                      onToggleModoColagem={() => {
                        onToggleModoColagem(aluno.id, !isModoColagemAtivo);
                      }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
