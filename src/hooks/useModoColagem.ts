"use client";

import { useState, useCallback } from "react";
import type { DadosPessoais } from "@/lib/parsing/parseDadosPessoais";
import type { DadosEscolaresParseResult } from "@/lib/parsing/parseDadosEscolares";
import type { TipoPagina } from "@/lib/parsing/detectarTipoPagina";

/**
 * Hook para gerenciar o modo de colagem de dados estruturados
 *
 * Funcionalidades:
 * - Ativa/desativa modo colagem por aluno
 * - Envia texto colado para API de parsing
 * - Gerencia modal de confirmação
 * - Salva dados confirmados no banco
 */

type ModoColagemState = {
  // Estado de ativação
  alunoIdAtivo: string | null;

  // Dados parseados (aguardando confirmação)
  dadosParsed: DadosPessoais | null;
  dadosEscolaresParsed: DadosEscolaresParseResult | null;
  tipoPaginaDetectada: TipoPagina | null;
  precisaConfirmarSexo: boolean;

  // Loading states
  isProcessando: boolean;
  isSalvando: boolean;

  // Modal
  modalAberto: boolean;

  // Erro
  erro: string | null;

  // Feedback de sucesso
  mensagemSucesso: string | null;

  // Texto bruto (para salvar junto)
  textoBruto: string | null;
};

type UseModoColagemOptions = {
  onDadosConfirmados?: (alunoId: string) => void | Promise<void>;
};

export function useModoColagem(options: UseModoColagemOptions = {}) {
  const { onDadosConfirmados } = options;
  const [state, setState] = useState<ModoColagemState>({
    alunoIdAtivo: null,
    dadosParsed: null,
    dadosEscolaresParsed: null,
    tipoPaginaDetectada: null,
    precisaConfirmarSexo: false,
    isProcessando: false,
    isSalvando: false,
    modalAberto: false,
    erro: null,
    mensagemSucesso: null,
    textoBruto: null,
  });

  /**
   * Ativa modo colagem para um aluno específico
   */
  const ativarModoColagem = useCallback((alunoId: string) => {
    setState((prev) => ({
      ...prev,
      alunoIdAtivo: alunoId,
      dadosParsed: null,
      dadosEscolaresParsed: null,
      tipoPaginaDetectada: null,
      precisaConfirmarSexo: false,
      modalAberto: false,
      erro: null,
      mensagemSucesso: null,
      textoBruto: null,
    }));
  }, []);

  /**
   * Desativa modo colagem
   */
  const desativarModoColagem = useCallback(() => {
    setState((prev) => ({
      ...prev,
      alunoIdAtivo: null,
      dadosParsed: null,
      dadosEscolaresParsed: null,
      tipoPaginaDetectada: null,
      precisaConfirmarSexo: false,
      modalAberto: false,
      erro: null,
      mensagemSucesso: null,
      textoBruto: null,
    }));
  }, []);

  /**
   * Processa texto colado (envia para API)
   */
  const handlePaste = useCallback(
    async (texto: string, matricula: string, alunoId: string) => {
      setState((prev) => ({ ...prev, isProcessando: true, erro: null }));

      try {
        const matriculaDetectada = extrairMatriculaDoTexto(texto);

        if (!matriculaDetectada) {
          setState((prev) => ({
            ...prev,
            isProcessando: false,
            erro:
              "Não encontramos a matrícula no texto colado. Verifique se o trecho copiado está completo.",
          }));
          return;
        }

        if (matriculaDetectada !== matricula) {
          setState((prev) => ({
            ...prev,
            isProcessando: false,
            erro: `Matrícula detectada (${matriculaDetectada}) diferente do aluno selecionado (${matricula}).`,
          }));
          return;
        }

        const response = await fetch("/api/importacao-estruturada", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            texto,
            matricula,
            alunoId,
          }),
        });

        const data = await response.json();

        if (!data.sucesso) {
          setState((prev) => ({
            ...prev,
            isProcessando: false,
            erro: data.erro || "Erro ao processar dados",
          }));
          return;
        }

        // Sucesso - abrir modal de confirmação
        if (data.tipoPagina === "dadosPessoais") {
          setState((prev) => ({
            ...prev,
            isProcessando: false,
            dadosParsed: data.dados,
            dadosEscolaresParsed: null,
            tipoPaginaDetectada: "dadosPessoais",
            precisaConfirmarSexo: data.precisaConfirmarSexo,
            modalAberto: true,
            mensagemSucesso: null,
            textoBruto: texto,
          }));
        } else if (data.tipoPagina === "dadosEscolares") {
          setState((prev) => ({
            ...prev,
            isProcessando: false,
            tipoPaginaDetectada: "dadosEscolares",
            dadosParsed: null,
            dadosEscolaresParsed: data.dados,
            mensagemSucesso: null,
            modalAberto: true,
            textoBruto: texto,
            alunoIdAtivo: alunoId,
          }));
        }
      } catch (error) {
        console.error("Erro ao processar colagem:", error);
        setState((prev) => ({
          ...prev,
          isProcessando: false,
          erro: "Erro de conexão ao processar dados",
        }));
      }
    },
    [onDadosConfirmados]
  );

  /**
   * Fecha modal sem salvar
   */
  const fecharModal = useCallback(() => {
    setState((prev) => ({
      ...prev,
      modalAberto: false,
      dadosParsed: null,
      dadosEscolaresParsed: null,
      tipoPaginaDetectada: null,
      precisaConfirmarSexo: false,
      mensagemSucesso: null,
      textoBruto: null,
    }));
  }, []);

  /**
   * Confirma e salva dados no banco
   */
  const confirmarDados = useCallback(
    async (dados: DadosPessoais, sexoConfirmado?: "M" | "F") => {
      if (!state.alunoIdAtivo || !state.textoBruto) {
        console.error("Estado inválido para confirmação");
        return;
      }

      setState((prev) => ({ ...prev, isSalvando: true, erro: null }));

      try {
        // Se sexo foi confirmado manualmente, adicionar aos dados
        const dadosFinais = sexoConfirmado
          ? { ...dados, sexo: sexoConfirmado }
          : dados;

        const response = await fetch("/api/importacao-estruturada/salvar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            alunoId: state.alunoIdAtivo,
            textoBruto: state.textoBruto,
            dados: dadosFinais,
          }),
        });

        const result = await response.json();

        if (!result.sucesso) {
          setState((prev) => ({
            ...prev,
            isSalvando: false,
            erro: result.erro || "Erro ao salvar dados",
          }));
          return;
        }

        const alunoConfirmadoId = state.alunoIdAtivo;

        // Sucesso - resetar estado e desativar modo colagem
        setState({
          alunoIdAtivo: null,
          dadosParsed: null,
          dadosEscolaresParsed: null,
          tipoPaginaDetectada: null,
          precisaConfirmarSexo: false,
          isProcessando: false,
          isSalvando: false,
          modalAberto: false,
          erro: null,
          mensagemSucesso: result.mensagem || "Dados pessoais salvos com sucesso!",
          textoBruto: null,
        });

        if (alunoConfirmadoId && onDadosConfirmados) {
          try {
            await onDadosConfirmados(alunoConfirmadoId);
          } catch (callbackError) {
            console.error(
              "Erro ao executar ação pós-confirmação:",
              callbackError
            );
          }
        }

      } catch (error) {
        console.error("Erro ao salvar dados:", error);
        setState((prev) => ({
          ...prev,
          isSalvando: false,
          erro: "Erro de conexão ao salvar dados",
        }));
      }
    },
    [state.alunoIdAtivo, state.textoBruto, onDadosConfirmados]
  );

  /**
   * Confirma e salva dados escolares no banco
   */
  const confirmarDadosEscolares = useCallback(
    async (dados: DadosEscolaresParseResult) => {
      if (!state.alunoIdAtivo || !state.textoBruto) {
        console.error("Estado inválido para confirmação de dados escolares");
        return;
      }

      setState((prev) => ({ ...prev, isSalvando: true, erro: null }));

      try {
        const response = await fetch(
          "/api/importacao-estruturada/salvar-dados-escolares",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              alunoId: state.alunoIdAtivo,
              textoBruto: state.textoBruto,
              dados,
            }),
          }
        );

        const result = await response.json();

        if (!result.sucesso) {
          setState((prev) => ({
            ...prev,
            isSalvando: false,
            erro: result.erro || "Erro ao salvar dados escolares",
          }));
          return;
        }

        const alunoConfirmadoId = state.alunoIdAtivo;

        setState({
          alunoIdAtivo: null,
          dadosParsed: null,
          dadosEscolaresParsed: null,
          tipoPaginaDetectada: null,
          precisaConfirmarSexo: false,
          isProcessando: false,
          isSalvando: false,
          modalAberto: false,
          erro: null,
          mensagemSucesso:
            result.mensagem || "Dados escolares salvos com sucesso!",
          textoBruto: null,
        });

        if (alunoConfirmadoId && onDadosConfirmados) {
          try {
            await onDadosConfirmados(alunoConfirmadoId);
          } catch (callbackError) {
            console.error(
              "Erro ao executar ação pós-confirmação (escolares):",
              callbackError
            );
          }
        }
      } catch (error) {
        console.error("Erro ao salvar dados escolares:", error);
        setState((prev) => ({
          ...prev,
          isSalvando: false,
          erro: "Erro de conexão ao salvar dados escolares",
        }));
      }
    },
    [state.alunoIdAtivo, state.textoBruto, onDadosConfirmados]
  );

  return {
    // Estado
    alunoIdAtivo: state.alunoIdAtivo,
    dadosParsed: state.dadosParsed,
    dadosEscolaresParsed: state.dadosEscolaresParsed,
    tipoPaginaDetectada: state.tipoPaginaDetectada,
    precisaConfirmarSexo: state.precisaConfirmarSexo,
    isProcessando: state.isProcessando,
    isSalvando: state.isSalvando,
    modalAberto: state.modalAberto,
    erro: state.erro,
    mensagemSucesso: state.mensagemSucesso,

    // Ações
    ativarModoColagem,
    desativarModoColagem,
    handlePaste,
    fecharModal,
    confirmarDados,
    confirmarDadosEscolares,

    // Helpers
    isModoColagemAtivo: (alunoId: string) => state.alunoIdAtivo === alunoId,
  };
}

function extrairMatriculaDoTexto(texto: string): string | null {
  const labelMatch = texto.match(/MATR[IÍ]CULA[^0-9]*([0-9]{15})/i);
  if (labelMatch) {
    return labelMatch[1];
  }

  const genericMatch = texto.match(/\b\d{15}\b/);
  return genericMatch ? genericMatch[0] : null;
}
