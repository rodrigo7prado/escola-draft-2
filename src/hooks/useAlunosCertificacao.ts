import { useMemo } from "react";
import useSWR from "swr";
import {
  calcularResumoDadosPessoais,
  ResumoDadosPessoais,
  ValoresDadosPessoais,
} from "@/lib/importacao/dadosPessoaisMetadata";
import type { PhaseStatus } from "@/lib/core/data/gestao-alunos/phases.types";
// [FEAT:emissao-documentos_TEC8] Usa DRY.BACKEND:CALCULAR_COMPLETUDE para fases.
import {
  calcularCompletudeDadosEscolares,
  calcularCompletudeEmissao,
  calcularCompletudeHistoricoEscolar,
  type ResumoCompletudeEmissao,
  type ResumoDadosEscolares,
  type ResumoHistoricoEscolar,
} from "@/lib/core/data/gestao-alunos/documentos/calcularCompletude";

export type { ResumoDadosEscolares, ResumoHistoricoEscolar };

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
  progressoEmissaoDocumentos: ResumoCompletudeEmissao;
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

type SerieCursadaResumo = {
  segmento?: string | null;
  anoLetivo?: string | null;
  periodoLetivo?: string | null;
  serie?: string | null;
  cargaHorariaTotal?: number | null;
  historicos?: Array<{
    id: string;
    componenteCurricular?: string | null;
    totalPontos?: number | null;
    cargaHoraria?: number | null;
    frequencia?: number | null;
    faltasTotais?: number | null;
  }>;
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
    progressoDadosEscolares: calcularCompletudeDadosEscolares(aluno),
    progressoHistoricoEscolar: calcularCompletudeHistoricoEscolar(aluno),
    // [FEAT:emissao-documentos_TEC7] Calcula completude da emissao usando def-objects.
    progressoEmissaoDocumentos: calcularCompletudeEmissao({
      ...aluno,
      seriesCursadas: aluno.seriesCursadas ?? [],
    }),
  }));
}
