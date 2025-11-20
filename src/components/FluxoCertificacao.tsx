"use client";

import { useCallback } from "react";
import { useFiltrosCertificacao } from "@/hooks/useFiltrosCertificacao";
import { useAlunoSelecionado } from "@/hooks/useAlunoSelecionado";
import { useModoColagem } from "@/hooks/useModoColagem";
import { useAlunosCertificacao } from "@/hooks/useAlunosCertificacao";
import { FiltrosCertificacao } from "./FiltrosCertificacao";
import { ListaAlunosCertificacao } from "./ListaAlunosCertificacao";
import { DadosAlunoEditavel } from "./DadosAlunoEditavel";
import { AreaColagemDados } from "./AreaColagemDados";
import { ModalConfirmacaoDados } from "./ModalConfirmacaoDados";
import { ModalConfirmacaoDadosEscolares } from "./ModalConfirmacaoDadosEscolares";
import type { AlunoCertificacao } from "@/hooks/useAlunosCertificacao";

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

  const {
    alunos,
    isLoading: isLoadingAlunos,
    isAtualizando: isAtualizandoAlunos,
    error: erroAlunos,
    totalAlunos,
    resumoDadosPessoais,
    refreshAlunos,
  } = useAlunosCertificacao(filtros);

  const {
    alunoSelecionado,
    selecionarAluno,
    alunoDetalhes,
    dadosOriginais,
    isLoadingDetalhes,
    erroDetalhes,
    isAtualizandoDetalhes,
    refreshAlunoSelecionado,
  } = useAlunoSelecionado();

  const handleSelecionarAluno = (aluno: AlunoCertificacao): void => {
    selecionarAluno(aluno);
  };

  const handleDadosConfirmados = useCallback(
    async (alunoIdConfirmado: string) => {
      if (alunoSelecionado?.id === alunoIdConfirmado) {
        await refreshAlunoSelecionado();
      }
      await refreshAlunos();
    },
    [alunoSelecionado?.id, refreshAlunoSelecionado, refreshAlunos]
  );

  const {
    alunoIdAtivo,
    dadosParsed,
    dadosEscolaresParsed,
    tipoPaginaDetectada,
    precisaConfirmarSexo,
    isProcessando,
    isSalvando,
    modalAberto,
    erro,
    mensagemSucesso,
    ativarModoColagem,
    desativarModoColagem,
    handlePaste,
    fecharModal,
    confirmarDados,
    confirmarDadosEscolares,
    // isModoColagemAtivo,
  } = useModoColagem({
    onDadosConfirmados: handleDadosConfirmados,
  });

  return (
    <>
      <div className="flex gap-4 h-full">
        {/* Left - Lista de alunos */}
        <div className="w-80 shrink-0">
          <ListaAlunosCertificacao
            filtros={filtros}
            alunoSelecionadoId={alunoSelecionado?.id || null}
            onSelecionarAluno={handleSelecionarAluno}
            alunoIdModoColagemAtivo={alunoIdAtivo}
            onToggleModoColagem={(alunoId: string, ativo: boolean) => {
              if (ativo) {
                ativarModoColagem(alunoId);
              } else {
                desativarModoColagem();
              }
            }}
            alunos={alunos}
            isLoading={isLoadingAlunos}
            isAtualizando={isAtualizandoAlunos}
            error={erroAlunos}
            totalAlunos={totalAlunos}
            resumoDadosPessoais={resumoDadosPessoais}
          />
        </div>

        {/* Right - Filtros + Dados */}
        <div className="flex-1 flex flex-col gap-3 h-full min-w-0 min-h-0">
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

          <div className="flex-1 min-h-0">
            <div className="border rounded-sm overflow-y-auto h-full">
              <DadosAlunoEditavel
                aluno={alunoDetalhes}
                dadosOriginais={dadosOriginais}
                isLoading={isLoadingDetalhes}
                isAtualizando={isAtualizandoDetalhes}
                erro={erroDetalhes}
              />
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

      {/* Feedback de sucesso para colagem automática (dados escolares) */}
      {mensagemSucesso && !modalAberto && (
        <div className="fixed top-4 right-4 bg-green-700 text-white px-4 py-2 rounded-sm shadow-lg text-sm z-50">
          {mensagemSucesso}
        </div>
      )}

      {/* Modal de Confirmação */}
      {tipoPaginaDetectada === "dadosPessoais" && (
        <ModalConfirmacaoDados
          open={modalAberto}
          dados={dadosParsed}
          precisaConfirmarSexo={precisaConfirmarSexo}
          isSalvando={isSalvando}
          onConfirmar={confirmarDados}
          onCancelar={fecharModal}
        />
      )}

      {tipoPaginaDetectada === "dadosEscolares" && (
        <ModalConfirmacaoDadosEscolares
          open={modalAberto}
          dados={dadosEscolaresParsed}
          isSalvando={isSalvando}
          onConfirmar={confirmarDadosEscolares}
          onCancelar={fecharModal}
          alunoNome={alunoSelecionado?.nome}
          alunoMatricula={alunoSelecionado?.matricula}
        />
      )}
    </>
  );
}
