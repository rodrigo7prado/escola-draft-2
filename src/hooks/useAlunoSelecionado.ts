import { useCallback, useMemo, useState } from "react";
import useSWR from "swr";
import type { AlunoCertificacao } from "./useAlunosCertificacao";
import {
  CAMPOS_DADOS_PESSOAIS,
  CAMPOS_DADOS_PESSOAIS_ALIASES,
  type CampoDadosPessoais,
} from "@/lib/importacao/dadosPessoaisMetadata";

export type AlunoDetalhado = {
  id: string;
  matricula: string;
  nome: string | null;
  fonteAusente: boolean;
  // Dados escolares (leitura)
  situacaoEscolar?: string | null;
  causaEncerramentoEscolar?: string | null;
  motivoEncerramento?: string | null;
  recebeOutroEspacoEscolar?: string | null;
  anoIngressoEscolar?: number | null;
  periodoIngressoEscolar?: number | null;
  dataInclusaoIngressoEscolar?: string | null;
  tipoIngressoEscolar?: string | null;
  redeOrigemIngressoEscolar?: string | null;
  matrizCurricularEscolar?: string | null;
} & {
  [K in CampoDadosPessoais]?: string | null;
};

export type DadosOriginaisAluno = Record<string, unknown> | null;

export type SerieCursadaResumo = {
  id: string;
  anoLetivo: string;
  periodoLetivo: string;
  unidadeEnsino?: string | null;
  codigoEscola?: string | null;
  modalidade?: string | null;
  segmento?: string | null;
  curso?: string | null;
  serie?: string | null;
  turno?: string | null;
  situacao?: string | null;
  tipoVaga?: string | null;
  ensinoReligioso?: boolean | null;
  linguaEstrangeira?: boolean | null;
};

export function useAlunoSelecionado() {
  const [alunoSelecionado, setAlunoSelecionado] =
    useState<AlunoCertificacao | null>(null);

  const chaveDetalhes = alunoSelecionado
    ? (["aluno-detalhe", alunoSelecionado.matricula] as const)
    : null;

  const {
    data,
    error,
    isLoading,
    isValidating,
    mutate,
  } = useSWR(chaveDetalhes, async ([, matricula]) => {
    return obterAlunoDetalhadoPorMatricula(matricula);
  }, {
    keepPreviousData: true,
    revalidateOnFocus: false,
  });

  const selecionarAluno = useCallback(
    (aluno: AlunoCertificacao | null) => {
      setAlunoSelecionado(aluno);
    },
    []
  );

  const limparSelecao = useCallback(() => {
    setAlunoSelecionado(null);
  }, []);

  const refreshAlunoSelecionado = useCallback(() => {
    if (!chaveDetalhes) {
      return Promise.resolve(undefined);
    }
    return mutate();
  }, [chaveDetalhes, mutate]);

  const temAlunoSelecionado = useMemo(
    () => Boolean(alunoSelecionado),
    [alunoSelecionado]
  );

  return {
    alunoSelecionado,
    selecionarAluno,
    limparSelecao,
    temAlunoSelecionado,
    alunoDetalhes: data?.detalhes ?? null,
    seriesCursadas: data?.seriesCursadas ?? [],
    dadosOriginais: data?.dadosOriginais ?? null,
    isLoadingDetalhes: Boolean(chaveDetalhes && isLoading && !data),
    erroDetalhes: error
      ? error instanceof Error
        ? error.message
        : "Erro ao carregar dados completos do aluno"
      : null,
    isAtualizandoDetalhes: Boolean(chaveDetalhes && isValidating && !!data),
    refreshAlunoSelecionado,
  };
}

function mapearAlunoDetalhado(raw: Record<string, any> | null): AlunoDetalhado | null {
  if (!raw) return null;

  const resultado: AlunoDetalhado = {
    id: raw.id,
    matricula: raw.matricula,
    nome: raw.nome ?? null,
    fonteAusente: Boolean(raw.fonteAusente),
    situacaoEscolar: raw.situacaoEscolar ?? null,
    causaEncerramentoEscolar: raw.causaEncerramentoEscolar ?? null,
    motivoEncerramento: raw.motivoEncerramento ?? null,
    recebeOutroEspacoEscolar: raw.recebeOutroEspacoEscolar ?? null,
    anoIngressoEscolar: raw.anoIngressoEscolar ?? null,
    periodoIngressoEscolar: raw.periodoIngressoEscolar ?? null,
    dataInclusaoIngressoEscolar: serializarValor(raw.dataInclusaoIngressoEscolar),
    tipoIngressoEscolar: raw.tipoIngressoEscolar ?? null,
    redeOrigemIngressoEscolar: raw.redeOrigemIngressoEscolar ?? null,
    matrizCurricularEscolar: raw.matrizCurricularEscolar ?? null,
  };

  for (const campo of CAMPOS_DADOS_PESSOAIS) {
    const alias = CAMPOS_DADOS_PESSOAIS_ALIASES[campo];
    const valorCru =
      raw[campo] ?? (alias ? raw[alias as keyof typeof raw] : undefined);
    resultado[campo] = serializarValor(valorCru);
  }

  return resultado;
}

function serializarValor(valor: unknown): string | null {
  if (valor === null || valor === undefined) {
    return null;
  }

  if (typeof valor === "string") {
    return valor;
  }

  if (valor instanceof Date) {
    return valor.toISOString();
  }

  if (typeof valor === "number" || typeof valor === "boolean") {
    return String(valor);
  }

  try {
    return JSON.stringify(valor);
  } catch {
    return String(valor);
  }
}

async function obterAlunoDetalhadoPorMatricula(matricula: string) {
  const response = await fetch(`/api/alunos?matricula=${matricula}`);

  if (!response.ok) {
    throw new Error("Erro ao carregar dados completos do aluno");
  }

  const data = await response.json();
  const aluno = data.aluno ?? null;
  const original =
    aluno?.dadosOriginais ?? aluno?.linhaOrigem?.dadosOriginais ?? null;

  return {
    detalhes: mapearAlunoDetalhado(aluno),
    dadosOriginais: original,
    seriesCursadas: (aluno?.seriesCursadas as SerieCursadaResumo[] | undefined) ?? [],
  };
}
