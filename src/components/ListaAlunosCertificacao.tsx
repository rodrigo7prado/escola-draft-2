"use client";

import {
  useAlunosCertificacao,
  type AlunoCertificacao,
  type ResumoDadosPessoaisTurma,
} from "@/hooks/useAlunosCertificacao";
import type { FiltrosCertificacaoState } from "@/hooks/useFiltrosCertificacao";
import { Button } from "@/components/ui/Button";
import { BotaoColagemAluno } from "./BotaoColagemAluno";

type ListaAlunosCertificacaoProps = {
  filtros: FiltrosCertificacaoState;
  alunoSelecionadoId: string | null;
  onSelecionarAluno: (aluno: AlunoCertificacao) => void;
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
  const { alunos, isLoading, error, totalAlunos, resumoDadosPessoais } =
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
      <div className="bg-neutral-100 px-3 py-2 border-b shrink-0 space-y-1">
        <div className="flex items-center justify-between text-xs font-semibold text-neutral-700">
          <h3>Alunos ({totalAlunos})</h3>
          <span className="text-[11px] font-medium text-neutral-500">
            Dados pessoais
          </span>
        </div>
        <PainelResumoTurma resumo={resumoDadosPessoais} />
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
                    <div className="flex items-center justify-between w-full gap-2">
                      <div className="text-xs font-medium truncate">
                        {aluno.nome || "Sem nome"}
                      </div>
                      <IndicadorDadosPessoais
                        resumo={aluno.progressoDadosPessoais}
                      />
                    </div>
                    <div className="text-[10px] text-neutral-500 font-mono">
                      {aluno.matricula}
                    </div>
                    <BarraProgressoDadosPessoais
                      resumo={aluno.progressoDadosPessoais}
                    />
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

function PainelResumoTurma({ resumo }: { resumo: ResumoDadosPessoaisTurma }) {
  if (resumo.total === 0) {
    return (
      <div className="text-[11px] text-neutral-500">
        Nenhum aluno carregado para calcular quilômetro zero.
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between text-[11px] text-neutral-600">
      <div>
        <div className="font-semibold text-neutral-700">
          Resumo geral · {resumo.percentualGeral}% completos
        </div>
        <div>
          Dados pessoais completos:{" "}
          <span className="font-semibold text-neutral-800">
            {resumo.completos}/{resumo.total}
          </span>
        </div>
      </div>

      {resumo.pendentes > 0 && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-[10px] px-2 py-1 rounded-sm font-semibold">
          Pendentes: {resumo.pendentes}
        </div>
      )}
    </div>
  );
}

function IndicadorDadosPessoais({
  resumo,
}: {
  resumo: AlunoCertificacao["progressoDadosPessoais"];
}) {
  const completo = resumo.completo;
  const corBase = completo
    ? "bg-green-600 text-white border-transparent"
    : "bg-red-100 text-red-800 border border-red-300";

  const label = completo ? "✓" : `${resumo.percentual}%`;
  const title = `Dados pessoais: ${resumo.camposPreenchidos}/${resumo.totalCampos}`;

  return (
    <div
      title={title}
      className={`h-6 w-6 rounded-full text-[10px] font-semibold flex items-center justify-center leading-none ${corBase}`}
    >
      {label}
    </div>
  );
}

function BarraProgressoDadosPessoais({
  resumo,
}: {
  resumo: AlunoCertificacao["progressoDadosPessoais"];
}) {
  const largura = `${resumo.percentual}%`;
  const preenchidoClass = resumo.completo ? "bg-green-600" : "bg-blue-500";
  const title = `Progresso de dados pessoais: ${resumo.percentual}% (${resumo.camposPreenchidos}/${resumo.totalCampos})`;

  return (
    <div className="w-full mt-1" title={title}>
      <div className="h-1.5 w-full rounded-full bg-neutral-200 overflow-hidden">
        <div
          className={`h-full ${preenchidoClass} transition-all`}
          style={{ width: largura }}
        />
      </div>
    </div>
  );
}
