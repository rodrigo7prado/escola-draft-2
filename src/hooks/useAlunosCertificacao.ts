import { useState, useEffect, useMemo } from "react";
import {
  calcularResumoDadosPessoais,
  ResumoDadosPessoais,
  ValoresDadosPessoais,
} from "@/lib/importacao/dadosPessoaisMetadata";

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
};

export type AlunoCertificacao = AlunoApiResponse & {
  progressoDadosPessoais: ResumoDadosPessoais;
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

export function useAlunosCertificacao(filtros: FiltrosParams) {
  const [alunos, setAlunos] = useState<AlunoCertificacao[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Só buscar se tiver filtros selecionados
    if (!filtros.anoLetivo) {
      setAlunos([]);
      return;
    }

    const fetchAlunos = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Construir query string
        const params = new URLSearchParams();
        params.append('anoLetivo', filtros.anoLetivo);
        params.append('regime', '0'); // Sempre anual para certificação
        params.append('modalidade', 'REGULAR');
        params.append('serie', '3'); // Sempre 3ª série para certificação

        if (filtros.turma) {
          params.append('turma', filtros.turma);
        }

        const response = await fetch(`/api/alunos?${params.toString()}`);

        if (!response.ok) {
          throw new Error('Erro ao buscar alunos');
        }

        const data = await response.json();
        const alunosResposta: AlunoApiResponse[] = data.alunos || [];

        const alunosComResumo = alunosResposta.map<AlunoCertificacao>(
          (aluno) => ({
            ...aluno,
            progressoDadosPessoais: calcularResumoDadosPessoais(aluno),
          })
        );

        setAlunos(alunosComResumo);
      } catch (err) {
        console.error("Erro ao buscar alunos:", err);
        setError(err instanceof Error ? err.message : "Erro desconhecido");
        setAlunos([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAlunos();
  }, [filtros.anoLetivo, filtros.turma]);

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
    isLoading,
    error,
    totalAlunos: alunos.length,
    resumoDadosPessoais,
  };
}
