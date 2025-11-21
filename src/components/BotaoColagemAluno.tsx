"use client";

import { Button } from "@/components/ui/Button";
import { Clipboard, ScanText } from "lucide-react";
import { useEffect, useState } from "react";

type BotaoColagemAlunoProps = {
  matricula: string;
  alunoId: string;
  isModoColagemAtivo: boolean;
  onToggleModoColagem: () => void;
  disabled?: boolean;
};

/**
 * Botão de colagem para um aluno
 *
 * Funcionalidades:
 * - Botão "📋 Copiar matrícula" - Copia número para clipboard
 * - Botão "🔓 Habilitar colagem" - Toggle para ativar/desativar modo colagem
 * - Estado visual: ativo (verde) / inativo (cinza)
 */
export function BotaoColagemAluno({
  matricula,
  isModoColagemAtivo,
  onToggleModoColagem,
  disabled = false,
}: BotaoColagemAlunoProps) {
  const [copiado, setCopiado] = useState(false);

  /**
   * Copia matrícula para clipboard
   */
  const handleCopiarMatricula = async () => {
    try {
      await navigator.clipboard.writeText(matricula);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 1000);
      // TODO: Mostrar toast de sucesso
    } catch (error) {
      console.error("Erro ao copiar matrícula:", error);
      // TODO: Mostrar toast de erro
    }
  };

  return (
    <div className="flex gap-1 items-center">
      {/* Botão Copiar Matrícula */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleCopiarMatricula}
        onMouseDown={(e) => e.preventDefault()}
        disabled={disabled}
        title="Copiar matrícula para área de transferência"
        className={`text-[10px] px-2 py-1 h-7 text-white transition-colors ${
          copiado ? "bg-white/20 hover:bg-white/20" : "hover:bg-white/10"
        } border-0 outline-none ring-0 shadow-none focus:border-0 active:border-0 focus:ring-0 focus:ring-offset-0 focus:outline-none active:ring-0 active:ring-offset-0 focus:shadow-none active:shadow-none [&:focus-visible]:outline-none [&:focus-visible]:ring-0 [&:focus-visible]:ring-offset-0`}
      >
        <Clipboard className="h-3 w-3" />
        <span className="sr-only">Copiar matrícula</span>
      </Button>

      {/* Botão Toggle Modo Colagem */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onToggleModoColagem}
        onMouseDown={(e) => e.preventDefault()}
        disabled={disabled}
        title={
          isModoColagemAtivo
            ? "Modo colagem ATIVO - Clique para desativar"
            : "Habilitar modo colagem"
        }
        className={`text-[10px] px-2 py-1 h-7 text-white gap-1 transition-all ${
          isModoColagemAtivo
            ? "bg-white/20 hover:bg-white/25"
            : "hover:bg-white/10"
        } border-0 outline-none ring-0 shadow-none focus:border-0 active:border-0 focus:ring-0 focus:ring-offset-0 focus:outline-none active:ring-0 active:ring-offset-0 focus:shadow-none active:shadow-none [&:focus-visible]:outline-none [&:focus-visible]:ring-0 [&:focus-visible]:ring-offset-0`}
      >
        <ScanText className="h-3 w-3" />
        {isModoColagemAtivo ? "Colagem ativa" : "Ativar colagem"}
      </Button>
    </div>
  );
}
