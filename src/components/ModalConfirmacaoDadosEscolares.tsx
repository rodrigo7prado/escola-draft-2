"use client";

import { Modal, ModalFooter } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import type { DadosEscolaresParseResult } from "@/lib/parsing/parseDadosEscolares";

type ModalConfirmacaoDadosEscolaresProps = {
  open: boolean;
  dados: DadosEscolaresParseResult | null;
  isSalvando: boolean;
  onConfirmar: (dados: DadosEscolaresParseResult) => void;
  onCancelar: () => void;
};

const Campo = ({ label, valor }: { label: string; valor?: string | number }) => {
  const temValor = valor !== undefined && valor !== null && String(valor).trim() !== "";
  return (
    <div className="grid grid-cols-[180px_1fr] gap-2 text-xs">
      <div className="font-medium text-neutral-600">{label}:</div>
      <div className={temValor ? "text-neutral-900" : "text-neutral-400 italic"}>
        {temValor ? valor : "(não informado)"}
      </div>
    </div>
  );
};

export function ModalConfirmacaoDadosEscolares({
  open,
  dados,
  isSalvando,
  onConfirmar,
  onCancelar,
}: ModalConfirmacaoDadosEscolaresProps) {
  if (!open || !dados) return null;

  const { alunoInfo, series, avisos } = dados;

  const handleConfirmar = () => {
    onConfirmar(dados);
  };

  return (
    <Modal
      open={open}
      onClose={onCancelar}
      title="Confirmar Dados Escolares Importados"
      size="xl"
    >
      <div className="space-y-4">
        <section>
          <h3 className="text-sm font-semibold text-neutral-700 mb-2 pb-1 border-b">
            Dados do aluno
          </h3>
          <div className="space-y-1">
            <Campo label="Situação" valor={alunoInfo.situacao} />
            <Campo label="Causa do Encerramento" valor={alunoInfo.causaEncerramento} />
            <Campo label="Motivo do Encerramento" valor={alunoInfo.motivoEncerramento} />
            <Campo label="Ano de Ingresso" valor={alunoInfo.anoIngresso} />
            <Campo label="Período de Ingresso" valor={alunoInfo.periodoIngresso} />
            <Campo label="Data de Inclusão" valor={alunoInfo.dataInclusao} />
            <Campo label="Tipo de Ingresso" valor={alunoInfo.tipoIngresso} />
            <Campo label="Rede de Origem" valor={alunoInfo.redeOrigem} />
            <Campo label="Matriz Curricular" valor={alunoInfo.matrizCurricular} />
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-neutral-700 pb-1 border-b flex-1">
              Renovação de Matrícula · Séries detectadas ({series.length})
            </h3>
          </div>

          <div className="overflow-auto border rounded-sm">
            <table className="min-w-full text-xs">
              <thead className="bg-neutral-100 text-neutral-700">
                <tr>
                  <th className="px-2 py-1 text-left">Ano Letivo</th>
                  <th className="px-2 py-1 text-left">Período Letivo</th>
                  <th className="px-2 py-1 text-left">Unidade de Ensino</th>
                  <th className="px-2 py-1 text-left">Código Escola</th>
                  <th className="px-2 py-1 text-left">Modalidade</th>
                  <th className="px-2 py-1 text-left">Segmento</th>
                  <th className="px-2 py-1 text-left">Curso</th>
                  <th className="px-2 py-1 text-left">Série</th>
                  <th className="px-2 py-1 text-left">Turno</th>
                  <th className="px-2 py-1 text-left">Situação</th>
                  <th className="px-2 py-1 text-left">Tipo de Vaga</th>
                  <th className="px-2 py-1 text-left">Tipo de Ingresso</th>
                  <th className="px-2 py-1 text-left">Matriz Curricular</th>
                  <th className="px-2 py-1 text-left">Ens. Religioso</th>
                  <th className="px-2 py-1 text-left">Língua Estrangeira</th>
                  <th className="px-2 py-1 text-left">Rede Ensino Origem</th>
                  <th className="px-2 py-1 text-left">Data Inclusão Aluno</th>
                </tr>
              </thead>
              <tbody>
                {series.map((serie, idx) => (
                  <tr
                    key={`${serie.anoLetivo}-${serie.periodoLetivo}-${idx}`}
                    className={idx % 2 === 0 ? "bg-white" : "bg-neutral-50"}
                  >
                    <td className="px-2 py-1">{serie.anoLetivo}</td>
                    <td className="px-2 py-1">{serie.periodoLetivo}</td>
                    <td className="px-2 py-1">{serie.unidadeEnsino || "-"}</td>
                    <td className="px-2 py-1">{serie.codigoEscola || "-"}</td>
                    <td className="px-2 py-1">{serie.modalidade || "-"}</td>
                    <td className="px-2 py-1">{serie.segmento || "-"}</td>
                    <td className="px-2 py-1">{serie.curso || "-"}</td>
                    <td className="px-2 py-1">{serie.serie || "-"}</td>
                    <td className="px-2 py-1">{serie.turno || "-"}</td>
                    <td className="px-2 py-1">{serie.situacao || "-"}</td>
                    <td className="px-2 py-1">{serie.tipoVaga || "-"}</td>
                    <td className="px-2 py-1">{serie.tipoIngresso || "-"}</td>
                    <td className="px-2 py-1">{serie.matrizCurricular || "-"}</td>
                    <td className="px-2 py-1">
                      {serie.ensinoReligioso === null || serie.ensinoReligioso === undefined
                        ? "-"
                        : serie.ensinoReligioso
                          ? "Sim"
                          : "Não"}
                    </td>
                    <td className="px-2 py-1">
                      {serie.linguaEstrangeira === null || serie.linguaEstrangeira === undefined
                        ? "-"
                        : serie.linguaEstrangeira
                          ? "Sim"
                          : "Não"}
                    </td>
                    <td className="px-2 py-1">{serie.redeEnsinoOrigem || "-"}</td>
                    <td className="px-2 py-1">{serie.dataInclusaoAluno || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {avisos && avisos.length > 0 && (
          <section>
            <h3 className="text-sm font-semibold text-neutral-700 mb-2 pb-1 border-b">
              Avisos do parser
            </h3>
            <ul className="list-disc list-inside text-xs text-neutral-700 space-y-1">
              {avisos.map((aviso) => (
                <li key={aviso}>{aviso}</li>
              ))}
            </ul>
          </section>
        )}
      </div>

      <ModalFooter>
        <Button variant="ghost" onClick={onCancelar} disabled={isSalvando}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={handleConfirmar} disabled={isSalvando}>
          {isSalvando ? "Salvando..." : "Confirmar e salvar"}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
