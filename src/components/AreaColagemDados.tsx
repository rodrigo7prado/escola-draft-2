"use client";

import { useEffect, useRef } from "react";

type AreaColagemDadosProps = {
  isAtivo: boolean;
  matricula: string;
  alunoId: string;
  isProcessando: boolean;
  erro: string | null;
  onPaste: (texto: string, matricula: string, alunoId: string) => void;
};

/**
 * Área invisível que captura eventos de colagem (Ctrl+V)
 *
 * Funcionalidades:
 * - Escuta evento global de paste quando modo colagem está ativo
 * - Envia texto colado para processamento via hook
 * - Mostra feedback visual durante processamento
 * - Exibe erros se houver
 */
export function AreaColagemDados({
  isAtivo,
  matricula,
  alunoId,
  isProcessando,
  erro,
  onPaste,
}: AreaColagemDadosProps) {
  const divRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isAtivo) return;

    /**
     * Handler de evento paste
     */
    const handlePaste = (e: ClipboardEvent) => {
      // Prevenir comportamento padrão
      e.preventDefault();

      // Extrair texto do clipboard
      const texto = e.clipboardData?.getData("text");
      if (!texto) {
        console.warn("Nenhum texto encontrado no clipboard");
        return;
      }

      // Enviar para processamento
      onPaste(texto, matricula, alunoId);
    };

    // Registrar listener global
    document.addEventListener("paste", handlePaste);

    // Focar o div invisível para garantir que paste funcione
    divRef.current?.focus();

    // Cleanup
    return () => {
      document.removeEventListener("paste", handlePaste);
    };
  }, [isAtivo, matricula, alunoId, onPaste]);

  // Não renderizar nada se não estiver ativo
  if (!isAtivo) return null;

  return (
    <>
      {/* Div invisível focável para capturar paste */}
      <div
        ref={divRef}
        tabIndex={-1}
        className="absolute top-0 left-0 w-0 h-0 opacity-0 pointer-events-none"
        aria-hidden="true"
      />

      {/* Overlay visual indicando modo colagem ativo */}
      <div className="fixed inset-0 pointer-events-none z-50">
        <div className="absolute top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-sm shadow-lg text-sm font-medium flex items-center gap-2">
          {isProcessando ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              <span>Processando...</span>
            </>
          ) : (
            <>
              <span className="text-base">📋</span>
              <span>Modo colagem ativo - Cole o texto (Ctrl+V)</span>
            </>
          )}
        </div>

        {/* Exibir erro se houver */}
        {erro && (
          <div className="absolute top-20 right-4 bg-red-600 text-white px-4 py-2 rounded-sm shadow-lg text-sm max-w-md">
            <div className="font-semibold mb-1">Erro ao processar dados:</div>
            <div>{erro}</div>
          </div>
        )}
      </div>
    </>
  );
}