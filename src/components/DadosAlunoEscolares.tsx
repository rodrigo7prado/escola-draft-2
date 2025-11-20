"use client";

import { useMemo } from "react";
import type {
  AlunoDetalhado,
  SerieCursadaResumo,
} from "@/hooks/useAlunoSelecionado";

type DadosAlunoEscolaresProps = {
  aluno: AlunoDetalhado | null;
  series: SerieCursadaResumo[];
  isLoading: boolean;
  erro?: string | null;
};

export function DadosAlunoEscolares({
  aluno,
  series,
  isLoading,
  erro,
}: DadosAlunoEscolaresProps) {
  const resumoSeries = useMemo(() => {
    if (!series.length) {
      return null;
    }

    const ordenadas = [...series].sort((a, b) => {
      const anoA = parseInt(a.anoLetivo, 10);
      const anoB = parseInt(b.anoLetivo, 10);
      if (anoA !== anoB) return anoA - anoB;
      const periodoA = a.periodoLetivo ? parseInt(a.periodoLetivo, 10) : 0;
      const periodoB = b.periodoLetivo ? parseInt(b.periodoLetivo, 10) : 0;
      return periodoA - periodoB;
    });

    const primeira = ordenadas[0];
    const ultima = ordenadas[ordenadas.length - 1];
    const serieAtual = ultima.serie || "-";

    return {
      total: ordenadas.length,
      primeira: `${primeira.anoLetivo}${primeira.periodoLetivo ? `/${primeira.periodoLetivo}` : ""}`,
      ultima: `${ultima.anoLetivo}${ultima.periodoLetivo ? `/${ultima.periodoLetivo}` : ""}`,
      serieAtual,
    };
  }, [series]);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center text-sm text-neutral-500">
        Carregando dados escolares...
      </div>
    );
  }

  if (erro) {
    return (
      <div className="h-full flex items-center justify-center text-sm text-red-600 text-center px-6">
        {erro}
      </div>
    );
  }

  if (!aluno) {
    return (
      <div className="text-center py-12 text-neutral-500 text-sm">
        Selecione um aluno para ver dados escolares
      </div>
    );
  }

  const info = [
    { label: "Situação", valor: aluno.situacaoEscolar },
    { label: "Causa do Encerramento", valor: aluno.causaEncerramentoEscolar },
    { label: "Motivo do Encerramento", valor: aluno.motivoEncerramento },
    { label: "Recebe em Outro Espaço", valor: aluno.recebeOutroEspacoEscolar },
    { label: "Ano de Ingresso", valor: aluno.anoIngressoEscolar },
    { label: "Período de Ingresso", valor: aluno.periodoIngressoEscolar },
    { label: "Data de Inclusão", valor: aluno.dataInclusaoIngressoEscolar },
    { label: "Tipo de Ingresso", valor: aluno.tipoIngressoEscolar },
    { label: "Rede de Origem", valor: aluno.redeOrigemIngressoEscolar },
    { label: "Matriz Curricular", valor: aluno.matrizCurricularEscolar },
  ];

  const formatBool = (val?: boolean | null) => {
    if (val === null || val === undefined) return "-";
    return val ? "Sim" : "Não";
  };

  return (
    <div className="h-full flex flex-col min-h-0">
      <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3">
        {resumoSeries && (
          <div className="border rounded-sm p-3 bg-neutral-50 text-xs text-neutral-700 grid grid-cols-2 md:grid-cols-4 gap-3">
            <ResumoItem label="Séries cadastradas" valor={String(resumoSeries.total)} />
            <ResumoItem label="Ingresso" valor={resumoSeries.primeira} />
            <ResumoItem label="Último registro" valor={resumoSeries.ultima} />
            <ResumoItem label="Série atual (máxima)" valor={resumoSeries.serieAtual} />
          </div>
        )}

        <div className="border rounded-sm">
          <div className="px-3 py-2 border-b bg-neutral-50 text-sm font-semibold text-neutral-700">
            Dados escolares do aluno
          </div>
          <div className="p-3 grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
            {info.map(({ label, valor }) => {
              const temValor =
                valor !== undefined &&
                valor !== null &&
                String(valor).trim() !== "";
              return (
                <div key={label} className="grid grid-cols-[160px_1fr] gap-2">
                  <div className="text-neutral-600 font-medium">{label}:</div>
                  <div className={temValor ? "text-neutral-900" : "text-neutral-400 italic"}>
                    {temValor ? valor : "(não informado)"}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="border rounded-sm flex flex-col">
          <div className="px-3 py-2 border-b bg-neutral-50 text-sm font-semibold text-neutral-700 flex items-center justify-between">
            <span>Renovação de Matrícula · Séries ({series.length})</span>
          </div>
          <div className="overflow-auto">
            <table className="min-w-full text-[11px] leading-tight">
              <thead className="bg-neutral-100 text-neutral-700">
                <tr>
                  <th className="px-2 py-1 text-left">Ano Letivo</th>
                  <th className="px-2 py-1 text-left">Período</th>
                  <th className="px-2 py-1 text-left">Unidade</th>
                  <th className="px-2 py-1 text-left">Modalidade</th>
                  <th className="px-2 py-1 text-left">Segmento</th>
                  <th className="px-2 py-1 text-left">Curso</th>
                  <th className="px-2 py-1 text-left">Série</th>
                  <th className="px-2 py-1 text-left">Turno</th>
                  <th className="px-2 py-1 text-left">Situação</th>
                  <th className="px-2 py-1 text-left">Tipo de Vaga</th>
                  <th className="px-2 py-1 text-left">Ens. Religioso</th>
                  <th className="px-2 py-1 text-left">Língua Estrangeira</th>
                </tr>
              </thead>
              <tbody>
                {series.map((serie) => (
                  <tr key={serie.id} className="border-b last:border-b-0">
                    <td className="px-2 py-1">{serie.anoLetivo}</td>
                    <td className="px-2 py-1">{serie.periodoLetivo}</td>
                    <td className="px-2 py-1">{serie.unidadeEnsino || "-"}</td>
                    <td className="px-2 py-1">{serie.modalidade || "-"}</td>
                    <td className="px-2 py-1">{serie.segmento || "-"}</td>
                    <td className="px-2 py-1" title={serie.curso || "-"}>
                      <div className="line-clamp-2">{serie.curso || "-"}</div>
                    </td>
                    <td className="px-2 py-1">{serie.serie || "-"}</td>
                    <td className="px-2 py-1">{serie.turno || "-"}</td>
                    <td className="px-2 py-1">{serie.situacao || "-"}</td>
                    <td className="px-2 py-1">{serie.tipoVaga || "-"}</td>
                    <td className="px-2 py-1">{formatBool(serie.ensinoReligioso)}</td>
                    <td className="px-2 py-1">{formatBool(serie.linguaEstrangeira)}</td>
                  </tr>
                ))}
                {series.length === 0 && (
                  <tr>
                    <td className="px-2 py-2 text-center text-neutral-500 text-xs" colSpan={12}>
                      Nenhuma série cadastrada
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function ResumoItem({ label, valor }: { label: string; valor: string }) {
  return (
    <div className="space-y-0.5">
      <div className="text-[11px] text-neutral-500">{label}</div>
      <div className="text-sm font-medium text-neutral-800">{valor}</div>
    </div>
  );
}
