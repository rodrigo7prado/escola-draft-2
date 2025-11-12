"use client";

import { Button } from "@/components/ui/Button";

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
  alunoId,
  isModoColagemAtivo,
  onToggleModoColagem,
  disabled = false,
}: BotaoColagemAlunoProps) {
  /**
   * Copia matrícula para clipboard
   */
  const handleCopiarMatricula = async () => {
    try {
      await navigator.clipboard.writeText(matricula);
      // TODO: Mostrar toast de sucesso
    } catch (error) {
      console.error("Erro ao copiar matrícula:", error);
      // TODO: Mostrar toast de erro
    }
  };

  return (
    <div className="flex gap-1 mt-1">
      {/* Botão Copiar Matrícula */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleCopiarMatricula}
        disabled={disabled}
        title="Copiar matrícula para área de transferência"
        className="text-[9px] px-1.5 py-0.5 h-5"
      >
        📋
      </Button>

      {/* Botão Toggle Modo Colagem */}
      <Button
        variant={isModoColagemAtivo ? "primary" : "ghost"}
        size="sm"
        onClick={onToggleModoColagem}
        disabled={disabled}
        title={
          isModoColagemAtivo
            ? "Modo colagem ATIVO - Clique para desativar"
            : "Habilitar modo colagem"
        }
        className={`text-[9px] px-1.5 py-0.5 h-5 transition-all ${
          isModoColagemAtivo
            ? "bg-green-600 hover:bg-green-700"
            : "hover:bg-neutral-200"
        }`}
      >
        {isModoColagemAtivo ? "✓ Colagem" : "🔓 Colar"}
      </Button>
    </div>
  );
}