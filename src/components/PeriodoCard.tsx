"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { TurmaItem } from "@/components/TurmaItem";

type TurmaData = {
  nome: string;
  totalAlunosCSV: number;
  totalAlunosBanco: number;
  pendentes: number;
  status: 'ok' | 'pendente';
  alunosPendentes?: { matricula: string; nome: string }[];
};

type PeriodoData = {
  anoLetivo: string;
  resumo: {
    totalTurmas: number;
    totalAlunosCSV: number;
    totalAlunosBanco: number;
    pendentes: number;
    status: 'ok' | 'pendente';
  };
  turmas: TurmaData[];
};

type PeriodoCardProps = {
  periodo: PeriodoData;
  onResetPeriodo: (anoLetivo: string) => Promise<void>;
};

export function PeriodoCard({ periodo, onResetPeriodo }: PeriodoCardProps) {
  const [showTurmasModal, setShowTurmasModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [isResetting, setIsResetting] = useState(false);

  const { anoLetivo, resumo, turmas } = periodo;
  const statusIcon = resumo.status === 'ok' ? '✅' : '⚠️';
  const statusColor = resumo.status === 'ok' ? 'text-green-700' : 'text-orange-600';

  const handleReset = async () => {
    if (confirmText !== anoLetivo) {
      alert(`Você precisa digitar "${anoLetivo}" para confirmar.`);
      return;
    }

    setIsResetting(true);
    try {
      await onResetPeriodo(anoLetivo);
      setShowResetModal(false);
      setConfirmText("");
    } catch (error) {
      console.error('Erro ao resetar período:', error);
      alert('Erro ao resetar período. Verifique o console.');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <>
      {/* Card do período */}
      <div className="border rounded-sm p-4 hover:bg-neutral-50 transition-colors">
        <div className="flex items-center justify-between">
          {/* Info do período */}
          <div className="flex items-center gap-3">
            <span className="text-lg">📅</span>
            <div>
              <div className="font-medium text-sm flex items-center gap-2">
                {anoLetivo}
                <span className={statusColor}>{statusIcon}</span>
                <span className={`text-xs ${statusColor}`}>
                  {resumo.status === 'ok' ? 'OK' : 'PENDENTE'}
                </span>
              </div>
              <div className="text-xs text-neutral-500 mt-0.5">
                {resumo.totalTurmas} {resumo.totalTurmas === 1 ? 'turma' : 'turmas'} ·
                {' '}{resumo.totalAlunosCSV} no CSV ·
                {' '}{resumo.totalAlunosBanco} no banco
                {resumo.pendentes > 0 && (
                  <span className="text-orange-600 font-medium">
                    {' '}· {resumo.pendentes} pendentes
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Ações */}
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setShowTurmasModal(true)}
              variant="outline"
              size="sm"
              className="text-xs"
            >
              Ver turmas →
            </Button>
            <Button
              onClick={() => setShowResetModal(true)}
              variant="ghost"
              size="sm"
              className="text-red-600 hover:bg-red-50 text-xs"
            >
              Resetar
            </Button>
          </div>
        </div>
      </div>

      {/* Modal: Lista de Turmas */}
      <Modal
        open={showTurmasModal}
        onClose={() => setShowTurmasModal(false)}
        title={`Turmas - ${anoLetivo}`}
        size="lg"
      >
        <div className="space-y-3">
          <div className="text-sm text-neutral-600 pb-2 border-b">
            {resumo.totalTurmas} {resumo.totalTurmas === 1 ? 'turma' : 'turmas'} ·
            {' '}{resumo.totalAlunosCSV} alunos no CSV ·
            {' '}{resumo.totalAlunosBanco} no banco
            {resumo.pendentes > 0 && (
              <span className="text-orange-600 font-medium">
                {' '}· {resumo.pendentes} pendentes
              </span>
            )}
          </div>

          {turmas.length === 0 ? (
            <div className="text-xs text-neutral-400 py-8 text-center">
              Nenhuma turma encontrada
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {turmas.map((turma) => (
                <TurmaItem key={turma.nome} turma={turma} />
              ))}
            </div>
          )}
        </div>
      </Modal>

      {/* Modal: Confirmação de Reset */}
      <Modal
        open={showResetModal}
        onClose={() => {
          setShowResetModal(false);
          setConfirmText("");
        }}
        title={`Resetar Período ${anoLetivo}`}
        size="md"
      >
        <div className="space-y-4">
          <div className="text-sm text-neutral-700">
            Esta ação irá <strong>excluir todos os dados</strong> importados do período letivo <strong>{anoLetivo}</strong>.
          </div>

          <div className="bg-orange-50 border border-orange-200 rounded-sm p-3 text-sm text-orange-800">
            ⚠️ <strong>Atenção:</strong> Isso marcará {resumo.totalAlunosBanco} alunos como "fonte ausente".
            Esta ação não pode ser desfeita.
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Para confirmar, digite <code className="bg-neutral-100 px-1 py-0.5 rounded">{anoLetivo}</code> no campo abaixo:
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm"
              placeholder={`Digite "${anoLetivo}" para confirmar`}
              autoFocus
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              onClick={() => {
                setShowResetModal(false);
                setConfirmText("");
              }}
              variant="ghost"
              disabled={isResetting}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleReset}
              variant="primary"
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={confirmText !== anoLetivo || isResetting}
            >
              {isResetting ? 'Resetando...' : 'Confirmar Exclusão'}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}