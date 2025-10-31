import { useState, useEffect } from 'react';

type Aluno = {
  id: string;
  matricula: string;
  nome: string | null;
  cpf: string | null;
  origemTipo: string;
  fonteAusente: boolean;
  enturmacoes?: Array<{
    anoLetivo: string;
    regime: number;
    modalidade: string;
    turma: string;
    serie: string;
  }>;
};

type FiltrosParams = {
  anoLetivo: string;
  turma: string;
};

export function useAlunosCertificacao(filtros: FiltrosParams) {
  const [alunos, setAlunos] = useState<Aluno[]>([]);
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
        setAlunos(data.alunos || []);
      } catch (err) {
        console.error('Erro ao buscar alunos:', err);
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
        setAlunos([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAlunos();
  }, [filtros.anoLetivo, filtros.turma]);

  return {
    alunos,
    isLoading,
    error,
    totalAlunos: alunos.length
  };
}
