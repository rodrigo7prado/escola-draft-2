"use client";

import { Fragment, useMemo } from "react";
import type {
  AlunoDetalhado,
  SerieCursadaResumo,
} from "@/hooks/useAlunoSelecionado";

type DadosAlunoHistoricoProps = {
  aluno: AlunoDetalhado | null;
  series: SerieCursadaResumo[];
  isLoading: boolean;
  erro?: string | null;
};

export function DadosAlunoHistorico({
  aluno,
  series,
  isLoading,
  erro,
}: DadosAlunoHistoricoProps) {
  const {
    seriesOrdenadas,
    disciplinasOrdenadas,
    mapasPorSerie,
    disciplinaLabels,
  } = useMemo(() => {
    const ordenarSeries = (lista: SerieCursadaResumo[]) => {
      return [...lista].sort((a, b) => {
        const anoA = parseInt(a.anoLetivo, 10);
        const anoB = parseInt(b.anoLetivo, 10);
        if (anoA !== anoB) return anoA - anoB;
        const perA = a.periodoLetivo ? parseInt(a.periodoLetivo, 10) : 0;
        const perB = b.periodoLetivo ? parseInt(b.periodoLetivo, 10) : 0;
        return perA - perB;
      });
    };

    const seriesOrdenadas = ordenarSeries(series || []);
    const disciplinaSet = new Set<string>();
    const disciplinaLabels = new Map<string, string>();
    const mapasPorSerie = seriesOrdenadas.map((serie) => {
      const mapa = new Map<
        string,
        { totalPontos?: number | null; cargaHoraria?: number | null }
      >();
      for (const hist of serie.historicos ?? []) {
        const chave = normalizarDisciplina(hist.componenteCurricular);
        if (!chave) continue;
        disciplinaSet.add(chave);
        if (!disciplinaLabels.has(chave)) {
          disciplinaLabels.set(chave, (hist.componenteCurricular ?? "").trim());
        }
        mapa.set(chave, {
          totalPontos: hist.totalPontos,
          cargaHoraria: hist.cargaHoraria,
        });
      }
      return { serie, mapa };
    });

    const disciplinasOrdenadas = Array.from(disciplinaSet).sort((a, b) =>
      a.localeCompare(b)
    );

    return { seriesOrdenadas, disciplinasOrdenadas, mapasPorSerie, disciplinaLabels };
  }, [series]);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center text-sm text-neutral-500">
        Carregando histórico escolar...
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
        Selecione um aluno para ver o histórico escolar
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col min-h-0">
      <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4">
        <CardDadosPessoais aluno={aluno} />

        <div className="border rounded-sm flex flex-col">
          <div className="px-3 py-2 border-b bg-neutral-50 text-sm font-semibold text-neutral-700 flex items-center justify-between">
            <span>Histórico Escolar · Disciplinas</span>
            <span className="text-[11px] text-neutral-500">
              Séries: {seriesOrdenadas.length} · Disciplinas: {disciplinasOrdenadas.length}
            </span>
          </div>

          <div className="overflow-auto">
            <table className="min-w-full text-[11px] leading-tight">
              <thead className="bg-neutral-100 text-neutral-700">
                <tr>
                  <th className="px-3 py-2 text-left min-w-[180px]" rowSpan={2}>
                    Disciplina
                  </th>
                  {seriesOrdenadas.map((serie) => (
                    <th key={serie.id} className="px-3 py-2 text-left min-w-[160px]" colSpan={2}>
                      <div className="font-semibold text-neutral-800 leading-tight">
                        {formatSerieLabel(serie)}
                      </div>
                      <div className="text-[10px] text-neutral-500">
                        {serie.anoLetivo}/{serie.periodoLetivo || "-"}
                      </div>
                    </th>
                  ))}
                </tr>
                <tr>
                  {seriesOrdenadas.map((serie) => (
                    <Fragment key={`${serie.id}-headers`}>
                      <th className="px-2 py-1 text-left text-[10px] uppercase tracking-wide">
                        Pontos
                      </th>
                      <th className="px-2 py-1 text-left text-[10px] uppercase tracking-wide">
                        CH
                      </th>
                    </Fragment>
                  ))}
                </tr>
              </thead>
              <tbody>
                {disciplinasOrdenadas.map((disciplina) => {
                  const label = disciplinaLabels.get(disciplina) || disciplina;
                  return (
                    <tr key={disciplina} className="border-b last:border-b-0">
                      <td className="px-3 py-2 font-medium text-neutral-800">
                        {label}
                      </td>
                    {mapasPorSerie.map(({ serie, mapa }) => {
                      const dados = mapa.get(disciplina);
                      return (
                        <Fragment key={serie.id}>
                          <td className="px-3 py-2 align-top text-neutral-800 font-semibold text-sm">
                            {formatNumero(dados?.totalPontos)}
                          </td>
                          <td className="px-3 py-2 align-top text-neutral-800 font-semibold text-sm">
                            {formatNumero(dados?.cargaHoraria)}
                          </td>
                        </Fragment>
                      );
                    })}
                    </tr>
                  );
                })}
                {disciplinasOrdenadas.length === 0 && (
                  <tr>
                    <td
                      className="px-3 py-3 text-center text-neutral-500 text-xs"
                      colSpan={1 + seriesOrdenadas.length}
                    >
                      Nenhuma disciplina importada ainda.
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot>
                <tr className="bg-neutral-50 border-t">
                  <td className="px-3 py-2 font-semibold text-neutral-800">
                    Carga horária total
                  </td>
                  {seriesOrdenadas.map((serie) => (
                    <Fragment key={`${serie.id}-footer`}>
                      <td className="px-3 py-2 text-sm text-neutral-500">-</td>
                      <td className="px-3 py-2 font-semibold text-sm text-neutral-900">
                        {formatNumero(serie.cargaHorariaTotal)}
                      </td>
                    </Fragment>
                  ))}
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function formatSerieLabel(serie: SerieCursadaResumo) {
  const serieTexto = serie.serie ? `· ${serie.serie}` : "";
  const segmento = serie.segmento ? `${serie.segmento}` : "";
  return [segmento, serieTexto].filter(Boolean).join(" ");
}

function normalizarDisciplina(nome?: string | null) {
  return (nome ?? "").trim().toUpperCase();
}

function formatNumero(v?: number | null) {
  if (v === null || v === undefined) return "-";
  const ehInt = Number.isInteger(v);
  return ehInt ? v.toString() : v.toFixed(1);
}

function formatarData(iso?: string | null) {
  if (!iso) return "-";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString("pt-BR");
}

function CardDadosPessoais({ aluno }: { aluno: AlunoDetalhado }) {
  const infoBasica = [
    { label: "Nome", valor: aluno.nome },
    { label: "Matrícula", valor: aluno.matricula },
    { label: "Nome Social", valor: aluno.nomeSocial },
    { label: "Data de Nascimento", valor: formatarData(aluno.dataNascimento) },
    { label: "Sexo", valor: aluno.sexo },
    { label: "CPF", valor: aluno.cpf },
  ];

  return (
    <div className="border rounded-sm">
      <div className="px-3 py-2 border-b bg-neutral-50 text-sm font-semibold text-neutral-700">
        Dados pessoais do aluno
      </div>
      <div className="p-3 grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
        {infoBasica.map(({ label, valor }) => {
          const hasValue = valor !== null && valor !== undefined && String(valor).trim() !== "";
          return (
            <div key={label} className="space-y-0.5">
              <div className="text-[11px] text-neutral-500">{label}</div>
              <div className={hasValue ? "text-neutral-900 font-medium" : "text-neutral-400 italic"}>
                {hasValue ? valor : "(não informado)"}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
