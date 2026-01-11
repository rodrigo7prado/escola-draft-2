"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Checkbox } from "@/components/ui/Checkbox";

type EnturmacaoResumo = {
  anoLetivo: string;
  modalidade: string | null;
  turma: string;
  serie: string;
};

type AlunoConcluinte = {
  id: string;
  matricula: string;
  nome: string | null;
  enturmacoes: EnturmacaoResumo[];
};

const MODALIDADE_LABELS: Record<string, string> = {
  REGULAR: "Ensino Médio Regular",
};

const MODALIDADE_PADRAO = "Ensino Médio Regular";
const TURMA_TODAS = "Todas";
const TOTAL_SUGESTOES = 8;

export default function EmissaoDocumentosPage() {
  const [concluintes, setConcluintes] = useState<AlunoConcluinte[]>([]);
  const [pendentes, setPendentes] = useState<AlunoConcluinte[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busca, setBusca] = useState("");
  const [modalidadeFiltro, setModalidadeFiltro] = useState(MODALIDADE_PADRAO);
  const [turmaFiltro, setTurmaFiltro] = useState(TURMA_TODAS);
  const [selecionados, setSelecionados] = useState<Set<string>>(new Set());
  const [showDropdown, setShowDropdown] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let ativo = true;

    const carregarAlunos = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/alunos-concluintes");
        if (!response.ok) {
          throw new Error("Erro ao buscar alunos concluintes.");
        }
        const data = await response.json();
        const concluintesResposta = Array.isArray(data.concluintes)
          ? data.concluintes
          : [];
        const pendentesResposta = Array.isArray(data.pendentes)
          ? data.pendentes
          : [];
        if (ativo) {
          setConcluintes(
            concluintesResposta.map((aluno: AlunoConcluinte) => ({
              ...aluno,
              enturmacoes: aluno.enturmacoes ?? [],
            }))
          );
          setPendentes(
            pendentesResposta.map((aluno: AlunoConcluinte) => ({
              ...aluno,
              enturmacoes: aluno.enturmacoes ?? [],
            }))
          );
        }
      } catch (erro) {
        if (ativo) {
          setError(
            erro instanceof Error
              ? erro.message
              : "Erro ao buscar alunos concluintes."
          );
        }
      } finally {
        if (ativo) {
          setIsLoading(false);
        }
      }
    };

    carregarAlunos();

    return () => {
      ativo = false;
    };
  }, []);

  const termoBusca = busca.trim();
  const regexBusca = useMemo(
    () => criarRegexCoringa(termoBusca),
    [termoBusca]
  );

  const modalidadesDisponiveis = useMemo(() => {
    const setModalidades = new Set<string>();
    const base = [...concluintes, ...pendentes];
    base.forEach((aluno) => {
      const enturmacao = selecionarEnturmacaoPrincipal(aluno.enturmacoes);
      setModalidades.add(formatarModalidade(enturmacao?.modalidade));
    });
    return Array.from(setModalidades).sort((a, b) =>
      a.localeCompare(b, undefined, { sensitivity: "base" })
    );
  }, [concluintes, pendentes]);

  useEffect(() => {
    if (modalidadesDisponiveis.length === 0) return;
    if (!modalidadesDisponiveis.includes(modalidadeFiltro)) {
      setModalidadeFiltro(modalidadesDisponiveis[0]);
    }
  }, [modalidadesDisponiveis, modalidadeFiltro]);

  const alunosPorModalidade = useMemo(() => {
    if (!modalidadeFiltro) {
      return [...concluintes, ...pendentes];
    }
    return [...concluintes, ...pendentes].filter((aluno) => {
      const enturmacao = selecionarEnturmacaoPrincipal(aluno.enturmacoes);
      return (
        formatarModalidade(enturmacao?.modalidade) === modalidadeFiltro
      );
    });
  }, [concluintes, pendentes, modalidadeFiltro]);

  const turmasDisponiveis = useMemo(() => {
    const setTurmas = new Set<string>();
    alunosPorModalidade.forEach((aluno) => {
      aluno.enturmacoes.forEach((enturmacao) => {
        setTurmas.add(abreviarTurma(enturmacao.turma));
      });
    });

    const turmasOrdenadas = Array.from(setTurmas).sort((a, b) =>
      compararTurmasNumericamente(a, b)
    );

    return [TURMA_TODAS, ...turmasOrdenadas];
  }, [alunosPorModalidade]);

  useEffect(() => {
    if (turmasDisponiveis.length === 0) return;
    if (!turmasDisponiveis.includes(turmaFiltro)) {
      setTurmaFiltro(TURMA_TODAS);
    }
  }, [turmasDisponiveis, turmaFiltro]);

  const alunosPorTurma = useMemo(() => {
    if (!turmaFiltro || turmaFiltro === TURMA_TODAS) {
      return alunosPorModalidade;
    }
    return alunosPorModalidade.filter((aluno) =>
      aluno.enturmacoes.some(
        (enturmacao) => abreviarTurma(enturmacao.turma) === turmaFiltro
      )
    );
  }, [alunosPorModalidade, turmaFiltro]);

  const alunosFiltrados = useMemo(() => {
    if (!termoBusca) {
      return alunosPorTurma;
    }
    return alunosPorTurma.filter((aluno) => {
      const nome = aluno.nome ?? "";
      return (
        correspondeBusca(nome, termoBusca, regexBusca) ||
        correspondeBusca(aluno.matricula, termoBusca, regexBusca)
      );
    });
  }, [alunosPorTurma, regexBusca, termoBusca]);

  useEffect(() => {
    setSelecionados((prev) => {
      if (prev.size === 0) return prev;
      const idsValidos = new Set(
        [...concluintes, ...pendentes].map((aluno) => aluno.id)
      );
      const next = new Set<string>();
      prev.forEach((id) => {
        if (idsValidos.has(id)) {
          next.add(id);
        }
      });
      return next;
    });
  }, [concluintes, pendentes]);

  const alunosConcluintes = useMemo(
    () =>
      alunosFiltrados.filter((aluno) =>
        concluintes.some((item) => item.id === aluno.id)
      ),
    [alunosFiltrados, concluintes]
  );

  const alunosPendentes = useMemo(
    () =>
      alunosFiltrados.filter((aluno) =>
        pendentes.some((item) => item.id === aluno.id)
      ),
    [alunosFiltrados, pendentes]
  );

  const sugestoes = useMemo(() => {
    if (!termoBusca) {
      return [];
    }
    return alunosFiltrados.slice(0, TOTAL_SUGESTOES);
  }, [alunosFiltrados, termoBusca]);

  const toggleAluno = (id: string) => {
    setSelecionados((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const modalidadesExibidas =
    modalidadesDisponiveis.length > 0
      ? modalidadesDisponiveis
      : [MODALIDADE_PADRAO];

  const renderListaPlana = (lista: AlunoConcluinte[]) => (
    <div className="space-y-1">
      {lista.map((aluno) => {
        const isSelected = selecionados.has(aluno.id);
        const linha = formatarAlunoLinha(aluno);
        return (
          <div
            key={aluno.id}
            className={`flex items-center gap-2 px-2 py-1 rounded-sm ${
              isSelected ? "bg-blue-50" : "bg-white"
            }`}
            title={linha}
          >
            <Checkbox
              checked={isSelected}
              onChange={() => toggleAluno(aluno.id)}
            />
            <span className="min-w-0 flex-1 truncate whitespace-nowrap text-[11px] text-neutral-800">
              {linha}
            </span>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="flex flex-col gap-2 h-full min-h-0">
      <div className="flex items-center gap-2 border rounded-sm px-2 py-1 text-xs">
        {/* [FEAT:pagina-emissao-documentos_TEC2] Campo de pesquisa com autocompletar e coringa */}
        <label htmlFor="busca-aluno" className="text-neutral-600">
          Buscar
        </label>
        <div className="relative flex-1 min-w-0">
          <input
            ref={searchInputRef}
            id="busca-aluno"
            type="text"
            value={busca}
            onChange={(event) => {
              setBusca(event.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => setShowDropdown(true)}
            onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
            placeholder="Pesquisar por nome ou matrícula (use * como coringa)"
            className="w-full bg-white border border-neutral-200 rounded-sm px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {showDropdown && sugestoes.length > 0 && (
            <div className="absolute z-10 mt-1 w-full max-h-56 overflow-auto rounded-sm border bg-white shadow">
              {sugestoes.map((aluno) => (
                <button
                  key={aluno.id}
                  type="button"
                  onMouseDown={() => {
                    setBusca(aluno.nome ?? aluno.matricula);
                    setShowDropdown(false);
                  }}
                  className="w-full text-left px-2 py-1 text-[11px] hover:bg-blue-50"
                >
                  <div className="font-medium text-neutral-800">
                    {aluno.nome ?? "Sem nome"}
                  </div>
                  <div className="text-neutral-500 font-mono">
                    {aluno.matricula}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-2 flex-1 min-h-0">
        <aside className="w-80 shrink-0 border rounded-sm overflow-hidden flex flex-col">
          {/* [FEAT:pagina-emissao-documentos_TEC3] Lista de alunos com sublistas */}
          <div className="px-2 py-1 border-b bg-neutral-50 text-[11px] font-semibold text-neutral-700">
            Lista de Alunos
          </div>
          <div className="flex-1 overflow-y-auto px-2 py-2 text-[11px] text-neutral-600 space-y-3">
            <section className="space-y-2">
              <div className="text-[10px] font-semibold uppercase tracking-wide text-neutral-500">
                Alunos Concluintes ({alunosConcluintes.length})
              </div>

              {isLoading && (
                <div className="text-center text-neutral-500">
                  Carregando alunos...
                </div>
              )}

              {error && (
                <div className="text-center text-red-600">
                  Erro ao carregar alunos: {error}
                </div>
              )}

              {!isLoading && !error && alunosConcluintes.length === 0 && (
                <div className="text-center text-neutral-500">
                  Nenhum aluno concluinte encontrado.
                </div>
              )}

              {!isLoading && !error && renderListaPlana(alunosConcluintes)}
            </section>

            <section className="space-y-2">
              <div className="text-[10px] font-semibold uppercase tracking-wide text-neutral-500">
                Alunos Pendentes ({alunosPendentes.length})
              </div>

              {!isLoading && !error && alunosPendentes.length === 0 && (
                <div className="text-center text-neutral-500">
                  Nenhum aluno pendente.
                </div>
              )}

              {!isLoading && !error && renderListaPlana(alunosPendentes)}
            </section>
          </div>
        </aside>

        <section className="flex-1 border rounded-sm overflow-hidden flex flex-col">
          {/* [FEAT:pagina-emissao-documentos_TEC4] Bloco de filtro e conteúdo */}
          <div className="px-2 py-1 border-b bg-neutral-50 text-[11px] font-semibold text-neutral-700">
            Filtro de Modalidade
          </div>
          <div className="px-2 py-1 border-b text-[11px] text-neutral-600 flex items-center gap-2">
            <label
              htmlFor="filtro-modalidade"
              className="text-neutral-600"
            >
              Modalidade
            </label>
            <select
              id="filtro-modalidade"
              value={modalidadeFiltro}
              onChange={(event) => setModalidadeFiltro(event.target.value)}
              className="border border-neutral-200 rounded-sm px-2 py-1 text-[11px] bg-white"
            >
              {modalidadesExibidas.map((modalidade) => (
                <option key={modalidade} value={modalidade}>
                  {modalidade}
                </option>
              ))}
            </select>
            <label
              htmlFor="filtro-turma"
              className="text-neutral-600"
            >
              Turma
            </label>
            <select
              id="filtro-turma"
              value={turmaFiltro}
              onChange={(event) => setTurmaFiltro(event.target.value)}
              className="border border-neutral-200 rounded-sm px-2 py-1 text-[11px] bg-white"
            >
              {turmasDisponiveis.map((turma) => (
                <option key={turma} value={turma}>
                  {turma}
                </option>
              ))}
            </select>
          </div>
          <div className="px-2 py-2 text-[11px] text-neutral-600">
            {isLoading && (
              <div className="text-center text-neutral-500">
                Carregando alunos...
              </div>
            )}

            {error && (
              <div className="text-center text-red-600">
                Erro ao carregar alunos: {error}
              </div>
            )}
          </div>
          <div className="px-2 py-1 border-b bg-neutral-50 text-[11px] font-semibold text-neutral-700">
            Emissão de Documentos
          </div>
          <div className="flex-1 px-2 py-2 text-[11px] text-neutral-500">
            Mock vazio.
          </div>
        </section>
      </div>
    </div>
  );
}

function formatarModalidade(modalidade?: string | null) {
  if (!modalidade) {
    return MODALIDADE_PADRAO;
  }
  return MODALIDADE_LABELS[modalidade] ?? modalidade;
}

function abreviarTurma(turma: string) {
  if (!turma) return "Sem turma";
  const partes = turma.split("-");
  if (partes.length <= 2) {
    return turma;
  }
  return `${partes[0]}-${partes[1]}`;
}

function compararTurmasNumericamente(turmaA: string, turmaB: string) {
  const partesA = segmentarTurma(turmaA);
  const partesB = segmentarTurma(turmaB);
  const maxLen = Math.max(partesA.length, partesB.length);

  for (let i = 0; i < maxLen; i += 1) {
    const parteA = partesA[i];
    const parteB = partesB[i];

    if (parteA === undefined) return -1;
    if (parteB === undefined) return 1;

    const numeroA = obterNumeroParte(parteA);
    const numeroB = obterNumeroParte(parteB);

    if (numeroA !== null && numeroB !== null) {
      if (numeroA !== numeroB) {
        return numeroA - numeroB;
      }
      continue;
    }

    const comparacao = parteA.localeCompare(parteB, undefined, {
      sensitivity: "base",
    });
    if (comparacao !== 0) {
      return comparacao;
    }
  }

  return 0;
}

// [FEAT:pagina-emissao-documentos_TEC2] Busca com coringa no client.
function criarRegexCoringa(termo: string) {
  if (!termo.includes("*")) {
    return null;
  }
  const escaped = termo
    .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    .replace(/\\\*/g, ".*");
  return new RegExp(escaped, "i");
}

function correspondeBusca(valor: string, termo: string, regex: RegExp | null) {
  if (!termo) return true;
  const valorNormalizado = valor.toLowerCase();
  if (regex) {
    return regex.test(valorNormalizado);
  }
  return valorNormalizado.includes(termo.toLowerCase());
}

function selecionarEnturmacaoPrincipal(enturmacoes: EnturmacaoResumo[]) {
  return enturmacoes[0] ?? null;
}

function formatarAlunoLinha(aluno: AlunoConcluinte) {
  const nome = aluno.nome ?? "Sem nome";
  return `${nome} · ${aluno.matricula}`;
}

function segmentarTurma(turma: string) {
  return turma.toUpperCase().split(/(\d+)/g).filter(Boolean);
}

function obterNumeroParte(parte: string) {
  if (!/^\d+$/.test(parte)) {
    return null;
  }
  const numero = Number(parte);
  return Number.isNaN(numero) ? null : numero;
}
