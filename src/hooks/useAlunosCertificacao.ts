import { useMemo } from "react";
import useSWR from "swr";
import {
  calcularResumoDadosPessoais,
  ResumoDadosPessoais,
  ValoresDadosPessoais,
} from "@/lib/importacao/dadosPessoaisMetadata";
import type { PhaseStatus } from "@/lib/core/data/gestao-alunos/phases.types";

type EnturmacaoResumo = {
  anoLetivo: string;
  regime: number;
  modalidade: string;
  turma: string;
  serie: string;
};

type AlunoApiResponse = ValoresDadosPessoais & {
  id: string;
  matricula: string;
  nome: string | null;
  cpf: string | null;
  origemTipo: string;
  fonteAusente: boolean;
  enturmacoes?: EnturmacaoResumo[];
  situacaoEscolar?: string | null;
  motivoEncerramento?: string | null;
  seriesCursadas?: SerieCursadaResumo[];
};

export type AlunoCertificacao = AlunoApiResponse & {
  progressoDadosPessoais: ResumoDadosPessoais;
  progressoDadosEscolares: ResumoDadosEscolares;
  progressoHistoricoEscolar: ResumoHistoricoEscolar;
};

type FiltrosParams = {
  anoLetivo: string;
  turma: string;
};

export type ResumoDadosPessoaisTurma = {
  total: number;
  completos: number;
  pendentes: number;
  percentualGeral: number;
};

export type ResumoDadosEscolares = {
  totalSlots: number;
  slotsPreenchidos: number;
  percentual: number;
  completo: boolean;
  status: PhaseStatus;
};

export type ResumoHistoricoEscolar = {
  totalRegistros: number;
  totalSeries: number;
  status: PhaseStatus;
  completo: boolean;
};

type SerieCursadaResumo = {
  segmento?: string | null;
  anoLetivo?: string | null;
  historicos?: { id: string }[];
  _count?: { historicos: number };
};

export function useAlunosCertificacao(filtros: FiltrosParams) {
  const chave = filtros.anoLetivo
    ? ([
        "alunos-certificacao",
        filtros.anoLetivo,
        filtros.turma || "",
      ] as const)
    : null;

  const {
    data,
    error,
    isLoading,
    isValidating,
    mutate,
  } = useSWR(
    chave,
    async () => obterAlunosCertificacao(filtros),
    {
      keepPreviousData: true,
      revalidateOnFocus: false,
    }
  );

  const alunos = data ?? [];

  const resumoDadosPessoais: ResumoDadosPessoaisTurma = useMemo(() => {
    if (alunos.length === 0) {
      return { total: 0, completos: 0, pendentes: 0, percentualGeral: 0 };
    }

    const completos = alunos.filter(
      (aluno) => aluno.progressoDadosPessoais.completo
    ).length;
    const pendentes = alunos.length - completos;
    const percentualGeral = Math.round((completos / alunos.length) * 100);

    return {
      total: alunos.length,
      completos,
      pendentes,
      percentualGeral,
    };
  }, [alunos]);

  return {
    alunos,
    isLoading: Boolean(chave && isLoading && !data),
    isAtualizando: Boolean(chave && isValidating && !!data),
    error: error
      ? error instanceof Error
        ? error.message
        : "Erro ao buscar alunos"
      : null,
    totalAlunos: alunos.length,
    resumoDadosPessoais,
    refreshAlunos: () => (chave ? mutate() : Promise.resolve(undefined)),
  };
}

async function obterAlunosCertificacao(filtros: FiltrosParams) {
  const params = new URLSearchParams();
  params.append("anoLetivo", filtros.anoLetivo);
  params.append("regime", "0");
  params.append("modalidade", "REGULAR");
  params.append("serie", "3");

  if (filtros.turma) {
    params.append("turma", filtros.turma);
  }

  const response = await fetch(`/api/alunos?${params.toString()}`);

  if (!response.ok) {
    throw new Error("Erro ao buscar alunos");
  }

  const data = await response.json();
  const alunosResposta: AlunoApiResponse[] = data.alunos || [];

  return alunosResposta.map<AlunoCertificacao>((aluno) => ({
    ...aluno,
    progressoDadosPessoais: calcularResumoDadosPessoais(aluno),
    progressoDadosEscolares: calcularResumoDadosEscolares(aluno),
    progressoHistoricoEscolar: calcularResumoHistoricoEscolar(aluno.seriesCursadas),
  }));
}

function calcularResumoDadosEscolares(aluno: AlunoApiResponse): ResumoDadosEscolares {
  const totalSlots = 3;
  const slotsPreenchidos = [
    Boolean(aluno.situacaoEscolar?.trim()),
    Boolean(aluno.motivoEncerramento?.trim()),
    possuiTriplaSerieMedio(aluno.seriesCursadas),
  ].filter(Boolean).length;

  let status: ResumoDadosEscolares["status"] = "incompleto";
  if (slotsPreenchidos === 0) {
    status = "ausente";
  } else if (slotsPreenchidos === totalSlots) {
    status = "completo";
  }

  const percentual = Math.round((slotsPreenchidos / totalSlots) * 100);

  return {
    totalSlots,
    slotsPreenchidos,
    percentual,
    completo: status === "completo",
    status,
  };
}

function calcularResumoHistoricoEscolar(
  series?: SerieCursadaResumo[]
): ResumoHistoricoEscolar {
  const totalRegistros =
    series?.reduce((total, serie) => {
      const count = serie._count?.historicos ?? serie.historicos?.length ?? 0;
      return total + count;
    }, 0) ?? 0;
  const totalSeries =
    series?.filter((serie) => {
      const count = serie._count?.historicos ?? serie.historicos?.length ?? 0;
      return count > 0;
    }).length ?? 0;

  const status: PhaseStatus = totalSeries === 3 ? "completo" : "ausente";

  return {
    totalRegistros,
    totalSeries,
    status,
    completo: status === "completo",
  };
}

function possuiTriplaSerieMedio(series?: SerieCursadaResumo[]): boolean {
  if (!series || series.length < 3) return false;

  const seriesOrdenadas = [...series].sort((a, b) =>
    compararAnoLetivoAsc(a.anoLetivo, b.anoLetivo)
  );

  const [maisAntiga, ...restantes] = seriesOrdenadas;
  const segmentoAntiga = normalizarSegmento(maisAntiga.segmento) || "-";
  if (segmentoAntiga !== "-") return false;

  const medioRestantes = restantes.filter(
    (serie) => normalizarSegmento(serie.segmento) === "MÉDIO"
  ).length;

  return medioRestantes >= 2;
}

function normalizarSegmento(seg?: string | null): string {
  return (seg ?? "").trim().toUpperCase();
}

function compararAnoLetivoAsc(a?: string | null, b?: string | null): number {
  const anoA = Number.parseInt((a ?? "").trim(), 10);
  const anoB = Number.parseInt((b ?? "").trim(), 10);

  const validoA = Number.isFinite(anoA);
  const validoB = Number.isFinite(anoB);

  if (validoA && validoB) return anoA - anoB;
  if (validoA) return -1;
  if (validoB) return 1;
  return (a ?? "").localeCompare(b ?? "");
}
