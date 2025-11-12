"use client";

import { useFiltrosCertificacao } from "@/hooks/useFiltrosCertificacao";
import { useAlunoSelecionado } from "@/hooks/useAlunoSelecionado";
import { useModoColagem } from "@/hooks/useModoColagem";
import { FiltrosCertificacao } from "./FiltrosCertificacao";
import { ListaAlunosCertificacao } from "./ListaAlunosCertificacao";
import { DadosAlunoEditavel } from "./DadosAlunoEditavel";
import { AreaColagemDados } from "./AreaColagemDados";
import { ModalConfirmacaoDados } from "./ModalConfirmacaoDados";

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
    hasFiltrosAtivos,
  } = useFiltrosCertificacao();

  const { alunoSelecionado, selecionarAluno } = useAlunoSelecionado();

  const {
    alunoIdAtivo,
    dadosParsed,
    precisaConfirmarSexo,
    isProcessando,
    isSalvando,
    modalAberto,
    erro,
    ativarModoColagem,
    desativarModoColagem,
    handlePaste,
    fecharModal,
    confirmarDados,
    isModoColagemAtivo,
  } = useModoColagem();

  return (
    <>
      <div className="grid grid-cols-[300px_1fr] gap-4 min-h-0 overflow-hidden h-full">
        {/* Sidebar Esquerda - Lista de Alunos */}
        <div className="h-full overflow-hidden">
          <ListaAlunosCertificacao
            filtros={filtros}
            alunoSelecionadoId={alunoSelecionado?.id || null}
            onSelecionarAluno={selecionarAluno}
            alunoIdModoColagemAtivo={alunoIdAtivo}
            onToggleModoColagem={(alunoId: string, ativo: boolean) => {
              if (ativo) {
                ativarModoColagem(alunoId);
              } else {
                desativarModoColagem();
              }
            }}
          />
        </div>

        {/* Painel Direito - Filtros + Dados */}
        <div className="flex flex-col gap-3 h-full min-w-0 min-h-0">
          {/* Fixed Container - Seleção de Turma */}
          <div className="shrink-0">
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

          {/* Content Wrapper */}
          <div className="flex-1 min-h-0">
            {/* Overflow Container */}
            <div className="border rounded-sm overflow-y-auto h-full">
              <DadosAlunoEditavel aluno={alunoSelecionado} />
            </div>
          </div>
        </div>
      </div>

      {/* Área de Colagem (overlay global quando ativo) */}
      {alunoIdAtivo && alunoSelecionado && (
        <AreaColagemDados
          isAtivo={true}
          matricula={alunoSelecionado.matricula}
          alunoId={alunoSelecionado.id}
          isProcessando={isProcessando}
          erro={erro}
          onPaste={handlePaste}
        />
      )}

      {/* Modal de Confirmação */}
      <ModalConfirmacaoDados
        open={modalAberto}
        dados={dadosParsed}
        precisaConfirmarSexo={precisaConfirmarSexo}
        isSalvando={isSalvando}
        onConfirmar={confirmarDados}
        onCancelar={fecharModal}
      />
    </>
  );
}
