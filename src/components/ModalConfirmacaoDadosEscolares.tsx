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
  alunoNome?: string | null;
  alunoMatricula?: string | null;
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
  alunoNome,
  alunoMatricula,
}: ModalConfirmacaoDadosEscolaresProps) {
  if (!open || !dados) return null;

  const { alunoInfo, series, avisos } = dados;

  const handleConfirmar = () => {
    onConfirmar(dados);
  };

  const twoLineClampStyle = {
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical" as const,
    overflow: "hidden",
  };

  return (
    <Modal
      open={open}
      onClose={onCancelar}
      title="Confirmar Dados Escolares Importados"
      size="xl"
    >
      <div className="space-y-4">
        {(alunoNome || alunoMatricula) && (
          <section>
            <h3 className="text-sm font-semibold text-neutral-700 mb-2 pb-1 border-b">
              Aluno
            </h3>
            <div className="space-y-0.5">
              {alunoNome && <Campo label="Nome" valor={alunoNome} />}
              {alunoMatricula && (
                <Campo label="Matrícula" valor={alunoMatricula} />
              )}
            </div>
          </section>
        )}

        <section>
          <h3 className="text-sm font-semibold text-neutral-700 mb-2 pb-1 border-b">
            Dados do aluno
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-3 gap-y-1">
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
            <table className="min-w-full text-[11px] leading-tight">
              <thead className="bg-neutral-100 text-neutral-700">
                <tr>
                  <th className="px-2 py-1 text-left">Ano Letivo</th>
                  <th className="px-2 py-1 text-left">Período Letivo</th>
                  <th className="px-2 py-1 text-left w-[140px]">Unidade de Ensino</th>
                  <th className="px-2 py-1 text-left w-[110px]">Modalidade</th>
                  <th className="px-2 py-1 text-left w-[110px]">Segmento</th>
                  <th className="px-2 py-1 text-left w-[150px]">Curso</th>
                  <th className="px-2 py-1 text-left w-[80px]">Série</th>
                  <th className="px-2 py-1 text-left w-[70px]">Turno</th>
                  <th className="px-2 py-1 text-left w-[120px]">Situação</th>
                  <th className="px-2 py-1 text-left w-[120px]">Tipo de Vaga</th>
                  <th className="px-2 py-1 text-left w-[90px]">Ens. Religioso</th>
                  <th className="px-2 py-1 text-left w-[110px]">Língua Estrangeira</th>
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
                    <td className="px-2 py-1" title={serie.unidadeEnsino || "-"}>
                      <div style={twoLineClampStyle}>{serie.unidadeEnsino || "-"}</div>
                    </td>
                    <td className="px-2 py-1" title={serie.modalidade || "-"}>
                      <div style={twoLineClampStyle}>{serie.modalidade || "-"}</div>
                    </td>
                    <td className="px-2 py-1" title={serie.segmento || "-"}>
                      <div style={twoLineClampStyle}>{serie.segmento || "-"}</div>
                    </td>
                    <td className="px-2 py-1" title={serie.curso || "-"}>
                      <div style={twoLineClampStyle}>{serie.curso || "-"}</div>
                    </td>
                    <td className="px-2 py-1">{serie.serie || "-"}</td>
                    <td className="px-2 py-1">{serie.turno || "-"}</td>
                    <td className="px-2 py-1" title={serie.situacao || "-"}>
                      <div style={twoLineClampStyle}>{serie.situacao || "-"}</div>
                    </td>
                    <td className="px-2 py-1" title={serie.tipoVaga || "-"}>
                      <div style={twoLineClampStyle}>{serie.tipoVaga || "-"}</div>
                    </td>
                    <td className="px-2 py-1">
                      {serie.ensinoReligioso === null || serie.ensinoReligioso === undefined
                        ? "-"
                        : serie.ensinoReligioso
                          ? "Sim"
                          : "Não"}
                    </td>
                    <td className="px-2 py-1" title={serie.linguaEstrangeira === null || serie.linguaEstrangeira === undefined ? "-" : serie.linguaEstrangeira ? "Sim" : "Não"}>
                      {serie.linguaEstrangeira === null || serie.linguaEstrangeira === undefined
                        ? "-"
                        : serie.linguaEstrangeira
                          ? "Sim"
                          : "Não"}
                    </td>
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
