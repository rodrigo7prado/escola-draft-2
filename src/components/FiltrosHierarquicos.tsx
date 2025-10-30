"use client";

import { useState, useEffect } from "react";

type FiltrosState = {
  anoLetivo: string;
  regime: string;
  modalidade: string;
  serie: string;
  turma: string;
};

type FiltrosHierarquicosProps = {
  filtros: FiltrosState;
  onFiltrosChange: (filtros: FiltrosState) => void;
};

const REGIME_LABELS: Record<number, string> = {
  0: 'Anual',
  1: '1º Semestre',
  2: '2º Semestre'
};

export default function FiltrosHierarquicos({ filtros, onFiltrosChange }: FiltrosHierarquicosProps) {
  // Opções dos filtros
  const [anosDisponiveis, setAnosDisponiveis] = useState<string[]>([]);
  const [regimesDisponiveis, setRegimesDisponiveis] = useState<number[]>([]);
  const [modalidadesDisponiveis, setModalidadesDisponiveis] = useState<string[]>([]);
  const [seriesDisponiveis, setSeriesDisponiveis] = useState<string[]>([]);
  const [turmasDisponiveis, setTurmasDisponiveis] = useState<string[]>([]);

  // Carregar anos letivos disponíveis
  useEffect(() => {
    const fetchAnos = async () => {
      try {
        const response = await fetch('/api/filtros');
        const data = await response.json();
        if (data.tipo === 'anos') {
          setAnosDisponiveis(data.dados);
        }
      } catch (error) {
        console.error('Erro ao carregar anos:', error);
      }
    };
    fetchAnos();
  }, []);

  // Carregar regimes quando ano é selecionado
  useEffect(() => {
    if (!filtros.anoLetivo) {
      setRegimesDisponiveis([]);
      return;
    }

    const fetchRegimes = async () => {
      try {
        const response = await fetch(`/api/filtros?anoLetivo=${filtros.anoLetivo}`);
        const data = await response.json();
        if (data.tipo === 'regimes') {
          setRegimesDisponiveis(data.dados);
        }
      } catch (error) {
        console.error('Erro ao carregar regimes:', error);
      }
    };
    fetchRegimes();
  }, [filtros.anoLetivo]);

  // Carregar modalidades quando regime é selecionado
  useEffect(() => {
    if (!filtros.anoLetivo || !filtros.regime) {
      setModalidadesDisponiveis([]);
      return;
    }

    const fetchModalidades = async () => {
      try {
        const response = await fetch(`/api/filtros?anoLetivo=${filtros.anoLetivo}&regime=${filtros.regime}`);
        const data = await response.json();
        if (data.tipo === 'modalidades') {
          setModalidadesDisponiveis(data.dados);
        }
      } catch (error) {
        console.error('Erro ao carregar modalidades:', error);
      }
    };
    fetchModalidades();
  }, [filtros.anoLetivo, filtros.regime]);

  // Carregar séries quando modalidade é selecionada
  useEffect(() => {
    if (!filtros.anoLetivo || !filtros.regime || !filtros.modalidade) {
      setSeriesDisponiveis([]);
      return;
    }

    const fetchSeries = async () => {
      try {
        const response = await fetch(`/api/filtros?anoLetivo=${filtros.anoLetivo}&regime=${filtros.regime}&modalidade=${encodeURIComponent(filtros.modalidade)}`);
        const data = await response.json();
        if (data.tipo === 'series') {
          setSeriesDisponiveis(data.dados);
        }
      } catch (error) {
        console.error('Erro ao carregar séries:', error);
      }
    };
    fetchSeries();
  }, [filtros.anoLetivo, filtros.regime, filtros.modalidade]);

  // Carregar turmas quando série é selecionada
  useEffect(() => {
    if (!filtros.anoLetivo || !filtros.regime || !filtros.modalidade || !filtros.serie) {
      setTurmasDisponiveis([]);
      return;
    }

    const fetchTurmas = async () => {
      try {
        const response = await fetch(`/api/filtros?anoLetivo=${filtros.anoLetivo}&regime=${filtros.regime}&modalidade=${encodeURIComponent(filtros.modalidade)}&serie=${filtros.serie}`);
        const data = await response.json();
        if (data.tipo === 'turmas') {
          setTurmasDisponiveis(data.dados);
        }
      } catch (error) {
        console.error('Erro ao carregar turmas:', error);
      }
    };
    fetchTurmas();
  }, [filtros.anoLetivo, filtros.regime, filtros.modalidade, filtros.serie]);

  // Handler para mudança de filtro
  const handleFiltroChange = (campo: keyof FiltrosState, valor: string) => {
    // Quando muda um filtro, limpar os filtros dependentes
    const novosFiltros: FiltrosState = { ...filtros };

    if (campo === 'anoLetivo') {
      novosFiltros.anoLetivo = valor;
      novosFiltros.regime = '';
      novosFiltros.modalidade = '';
      novosFiltros.serie = '';
      novosFiltros.turma = '';
    } else if (campo === 'regime') {
      novosFiltros.regime = valor;
      novosFiltros.modalidade = '';
      novosFiltros.serie = '';
      novosFiltros.turma = '';
    } else if (campo === 'modalidade') {
      novosFiltros.modalidade = valor;
      novosFiltros.serie = '';
      novosFiltros.turma = '';
    } else if (campo === 'serie') {
      novosFiltros.serie = valor;
      novosFiltros.turma = '';
    } else if (campo === 'turma') {
      novosFiltros.turma = valor;
    }

    onFiltrosChange(novosFiltros);
  };

  // Limpar todos os filtros
  const handleLimparFiltros = () => {
    onFiltrosChange({
      anoLetivo: '',
      regime: '',
      modalidade: '',
      serie: '',
      turma: ''
    });
  };

  const hasFiltrosAtivos = filtros.anoLetivo || filtros.regime || filtros.modalidade || filtros.serie || filtros.turma;

  return (
    <div className="border rounded-md p-4 bg-neutral-50">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold text-neutral-700">Filtros</h3>
        {hasFiltrosAtivos && (
          <button
            onClick={handleLimparFiltros}
            className="text-[10px] text-red-600 hover:underline"
            type="button"
          >
            Limpar filtros
          </button>
        )}
      </div>

      <div className="grid grid-cols-5 gap-3">
        {/* Período Letivo */}
        <div>
          <label className="text-[10px] text-neutral-600 block mb-1">Período Letivo</label>
          <select
            value={filtros.anoLetivo}
            onChange={(e) => handleFiltroChange('anoLetivo', e.target.value)}
            className="w-full text-xs border rounded px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos</option>
            {anosDisponiveis.map(ano => (
              <option key={ano} value={ano}>{ano}</option>
            ))}
          </select>
        </div>

        {/* Regime */}
        <div>
          <label className="text-[10px] text-neutral-600 block mb-1">Regime</label>
          <select
            value={filtros.regime}
            onChange={(e) => handleFiltroChange('regime', e.target.value)}
            disabled={!filtros.anoLetivo}
            className="w-full text-xs border rounded px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-neutral-100 disabled:cursor-not-allowed"
          >
            <option value="">Todos</option>
            {regimesDisponiveis.map(regime => (
              <option key={regime} value={regime}>
                {REGIME_LABELS[regime] || `Regime ${regime}`}
              </option>
            ))}
          </select>
        </div>

        {/* Modalidade */}
        <div>
          <label className="text-[10px] text-neutral-600 block mb-1">Modalidade</label>
          <select
            value={filtros.modalidade}
            onChange={(e) => handleFiltroChange('modalidade', e.target.value)}
            disabled={!filtros.regime}
            className="w-full text-xs border rounded px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-neutral-100 disabled:cursor-not-allowed"
          >
            <option value="">Todas</option>
            {modalidadesDisponiveis.map(modalidade => (
              <option key={modalidade} value={modalidade}>{modalidade}</option>
            ))}
          </select>
        </div>

        {/* Série */}
        <div>
          <label className="text-[10px] text-neutral-600 block mb-1">Série</label>
          <select
            value={filtros.serie}
            onChange={(e) => handleFiltroChange('serie', e.target.value)}
            disabled={!filtros.modalidade}
            className="w-full text-xs border rounded px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-neutral-100 disabled:cursor-not-allowed"
          >
            <option value="">Todas</option>
            {seriesDisponiveis.map(serie => (
              <option key={serie} value={serie}>{serie}ª série</option>
            ))}
          </select>
        </div>

        {/* Turma */}
        <div>
          <label className="text-[10px] text-neutral-600 block mb-1">Turma</label>
          <select
            value={filtros.turma}
            onChange={(e) => handleFiltroChange('turma', e.target.value)}
            disabled={!filtros.serie}
            className="w-full text-xs border rounded px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-neutral-100 disabled:cursor-not-allowed"
          >
            <option value="">Todas</option>
            {turmasDisponiveis.map(turma => (
              <option key={turma} value={turma}>{turma}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
