"use client";

import { useRef } from "react";
import type {
  AlunoCertificacao,
  ResumoDadosEscolares,
  ResumoDadosPessoaisTurma,
} from "@/hooks/useAlunosCertificacao";
import type { FiltrosCertificacaoState } from "@/hooks/useFiltrosCertificacao";
import { Button } from "@/components/ui/Button";
import { BotaoColagemAluno } from "./BotaoColagemAluno";
import { OverflowMenu } from "@/components/ui/OverflowMenu";
import { ModalInfoUpload } from "@/components/ui/ModalInfoUpload";
import { useImportacaoHistoricoEscolar } from "@/hooks/useImportacaoHistoricoEscolar";
import { GraduationCap, UserCheck } from "lucide-react";

type ListaAlunosCertificacaoProps = {
  filtros: FiltrosCertificacaoState;
  alunoSelecionadoId: string | null;
  onSelecionarAluno: (aluno: AlunoCertificacao) => void;
  alunoIdModoColagemAtivo: string | null;
  onToggleModoColagem: (alunoId: string, ativo: boolean) => void;
  alunos: AlunoCertificacao[];
  isLoading: boolean;
  isAtualizando: boolean;
  error: string | null;
  totalAlunos: number;
  resumoDadosPessoais: ResumoDadosPessoaisTurma;
  onImportacaoCompleta?: () => void;
};

export function ListaAlunosCertificacao({
  filtros,
  alunoSelecionadoId,
  onSelecionarAluno,
  alunoIdModoColagemAtivo,
  onToggleModoColagem,
  alunos,
  isLoading,
  isAtualizando,
  error,
  totalAlunos,
  resumoDadosPessoais,
  onImportacaoCompleta,
}: ListaAlunosCertificacaoProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { progresso, modalAberto, fecharModal, importarArquivos } =
    useImportacaoHistoricoEscolar();

  const handleImportarHistorico = () => {
    if (!alunoSelecionadoId) {
      alert("Selecione um aluno para importar o histórico escolar");
      return;
    }
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !alunoSelecionadoId) return;

    const aluno = alunos.find((a) => a.id === alunoSelecionadoId);
    if (!aluno) return;

    await importarArquivos(files, aluno.matricula);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    onImportacaoCompleta?.();
  };
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
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx"
        multiple
        onChange={handleFileChange}
        className="hidden"
      />

      <ModalInfoUpload
        isOpen={modalAberto}
        totalFiles={progresso.totalFiles}
        processedFiles={progresso.processedFiles}
        errorFiles={progresso.errorFiles}
        onClose={fecharModal}
      />

      <div className="border rounded-sm flex flex-col min-h-0 h-full">
        {/* Header - Fixed Container */}
        <div className="bg-neutral-100 px-3 py-2 border-b shrink-0 space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold text-neutral-700">
            <h3>Alunos ({totalAlunos})</h3>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 text-[11px] font-medium text-neutral-500">
                <span>Dados pessoais</span>
                {isAtualizando && (
                  <span className="text-[10px] text-neutral-400 animate-pulse">
                    Atualizando...
                  </span>
                )}
              </div>
              <OverflowMenu
                options={[
                  {
                    label: "Importar Histórico Escolar (XLSX)",
                    onClick: handleImportarHistorico,
                    disabled: !alunoSelecionadoId,
                  },
                ]}
                icon="kebab"
              />
            </div>
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
                    </div>
                    <div className="text-[10px] text-neutral-500 font-mono">
                      {aluno.matricula}
                    </div>
                    <div className="flex items-center gap-2 w-full mt-1">
                      <div className="flex-1">
                        <BarraProgressoDadosPessoais
                          resumoPessoais={aluno.progressoDadosPessoais}
                          resumoEscolares={aluno.progressoDadosEscolares}
                        />
                      </div>
                      <IndicadoresDadosAluno
                        resumoPessoais={aluno.progressoDadosPessoais}
                        resumoEscolares={aluno.progressoDadosEscolares}
                      />
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
                  <div className="px-3 py-0 bg-gray-600 text-white text-sm">
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
    </>
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

function BarraProgressoDadosPessoais({
  resumoPessoais,
  resumoEscolares,
}: {
  resumoPessoais: AlunoCertificacao["progressoDadosPessoais"];
  resumoEscolares: ResumoDadosEscolares;
}) {
  const percentualMedio = Math.round(
    (resumoPessoais.percentual + resumoEscolares.percentual) / 2
  );
  const largura = `${percentualMedio}%`;
  const completo = resumoPessoais.completo && resumoEscolares.completo;
  const preenchidoClass = completo ? "bg-green-600" : "bg-blue-500";
  const title = `Progresso médio (pessoais + escolares): ${percentualMedio}%`;

  return (
    <div className="w-full" title={title}>
      <div className="h-1.5 w-full rounded-full bg-neutral-200 overflow-hidden">
        <div
          className={`h-full ${preenchidoClass} transition-all`}
          style={{ width: largura }}
        />
      </div>
    </div>
  );
}

function IndicadoresDadosAluno({
  resumoPessoais,
  resumoEscolares,
}: {
  resumoPessoais: AlunoCertificacao["progressoDadosPessoais"];
  resumoEscolares: ResumoDadosEscolares;
}) {
  return (
    <div className="flex items-center gap-2">
      <StatusIcone
        icon={UserCheck}
        status={mapearStatusPessoais(resumoPessoais)}
        label={`${resumoPessoais.camposPreenchidos}/${resumoPessoais.totalCampos}`}
        title={`Dados pessoais: ${resumoPessoais.camposPreenchidos}/${resumoPessoais.totalCampos}`}
      />
      <StatusIcone
        icon={GraduationCap}
        status={resumoEscolares.status}
        label={`${resumoEscolares.percentual}%`}
        title={`Dados escolares: ${resumoEscolares.percentual}% (${resumoEscolares.slotsPreenchidos}/${resumoEscolares.totalSlots})`}
      />
    </div>
  );
}

type Status = "completo" | "incompleto" | "ausente";

function mapearStatusPessoais(
  resumo: AlunoCertificacao["progressoDadosPessoais"]
): Status {
  if (resumo.completo) return "completo";
  if (resumo.camposPreenchidos === 0) return "ausente";
  return "incompleto";
}

function StatusIcone({
  icon: Icon,
  status,
  label,
  title,
}: {
  icon: typeof UserCheck;
  status: Status;
  label: string;
  title: string;
}) {
  const cor = corPorStatus(status);
  return (
    <div className="flex flex-col items-center text-[10px] font-semibold leading-tight min-w-[42px]">
      <Icon className={`h-4 w-4 ${cor}`} />
      <span className={`${cor}`}>{label}</span>
    </div>
  );
}

function corPorStatus(status: Status): string {
  if (status === "completo") return "text-green-700";
  if (status === "ausente") return "text-red-600";
  return "text-yellow-600";
}
