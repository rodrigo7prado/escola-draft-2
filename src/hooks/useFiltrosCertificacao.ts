import { useState, useEffect } from 'react';

export type FiltrosCertificacaoState = {
  anoLetivo: string;
  turma: string;
};

export function useFiltrosCertificacao() {
  // Estados dos filtros
  const [anoLetivo, setAnoLetivo] = useState<string>('');
  const [turma, setTurma] = useState<string>('');

  // Opções disponíveis
  const [anosDisponiveis, setAnosDisponiveis] = useState<string[]>([]);
  const [turmasDisponiveis, setTurmasDisponiveis] = useState<string[]>([]);
  const [isLoadingAnos, setIsLoadingAnos] = useState(true);
  const [isLoadingTurmas, setIsLoadingTurmas] = useState(false);

  // Carregar anos letivos disponíveis (apenas 3ª séries)
  useEffect(() => {
    const fetchAnos = async () => {
      setIsLoadingAnos(true);
      try {
        // Buscar anos disponíveis para regime anual e 3ª série
        const response = await fetch('/api/filtros?anoLetivo=&regime=0&modalidade=&serie=3');
        const data = await response.json();

        let anosData: string[] = [];

        // Se retornar anos, usar; senão buscar de outra forma
        if (data.tipo === 'anos') {
          anosData = data.dados;
        } else {
          // Buscar diretamente da API de enturmações
          const anosResponse = await fetch('/api/filtros');
          const anosResult = await anosResponse.json();
          if (anosResult.tipo === 'anos') {
            anosData = anosResult.dados;
          }
        }

        setAnosDisponiveis(anosData);

        // Selecionar automaticamente o ano mais recente
        if (anosData.length > 0) {
          const anoMaisRecente = [...anosData].sort((a, b) => b.localeCompare(a))[0];
          setAnoLetivo(anoMaisRecente);
        }
      } catch (error) {
        console.error('Erro ao carregar anos:', error);
      } finally {
        setIsLoadingAnos(false);
      }
    };

    fetchAnos();
  }, []);

  // Carregar turmas quando ano é selecionado
  useEffect(() => {
    if (!anoLetivo) {
      setTurmasDisponiveis([]);
      setTurma('');
      return;
    }

    const fetchTurmas = async () => {
      setIsLoadingTurmas(true);
      try {
        // Buscar turmas de regime anual (0) e 3ª série
        const response = await fetch(
          `/api/filtros?anoLetivo=${anoLetivo}&regime=0&modalidade=REGULAR&serie=3`
        );
        const data = await response.json();

        if (data.tipo === 'turmas') {
          setTurmasDisponiveis(data.dados);

          // Selecionar automaticamente a primeira turma
          if (data.dados.length > 0) {
            setTurma(data.dados[0]);
          }
        }
      } catch (error) {
        console.error('Erro ao carregar turmas:', error);
      } finally {
        setIsLoadingTurmas(false);
      }
    };

    fetchTurmas();
  }, [anoLetivo]);

  // Handler para mudar ano letivo
  const handleAnoChange = (ano: string) => {
    setAnoLetivo(ano);
    setTurma(''); // Limpar turma quando ano muda
  };

  // Handler para mudar turma
  const handleTurmaChange = (t: string) => {
    setTurma(t);
  };

  // Limpar todos os filtros
  const limparFiltros = () => {
    setAnoLetivo('');
    setTurma('');
  };

  // Estado consolidado
  const filtros: FiltrosCertificacaoState = {
    anoLetivo,
    turma
  };

  const hasFiltrosAtivos = Boolean(anoLetivo || turma);

  return {
    // Estados
    filtros,
    anoLetivo,
    turma,

    // Opções disponíveis
    anosDisponiveis,
    turmasDisponiveis,

    // Loading states
    isLoadingAnos,
    isLoadingTurmas,

    // Handlers
    handleAnoChange,
    handleTurmaChange,
    limparFiltros,

    // Helpers
    hasFiltrosAtivos
  };
}
