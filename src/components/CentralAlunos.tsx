"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { Modal } from "@/components/ui/Modal";

type Aluno = {
  matricula: string;
  nome: string;
  ano: string;
  modalidade: string;
  curso: string;
  serie: string;
  turno: string;
  turma: string;
  historico: {
    disciplina: string;
    totalPontos: string;
    faltas: string;
    situacao: string;
  }[];
};

type AlunoRaw = {
  ALUNO: string;
  NOME_COMPL: string;
  Ano: string;
  MODALIDADE: string;
  CURSO: string;
  SERIE: string;
  TURNO: string;
  TURMA: string;
  DISCIPLINA1: string;
  TOTAL_PONTOS: string;
  FALTAS: string;
  SITUACAO_FINAL: string;
};

type AlunoEdit = {
  id: string;
  matricula: string;
  campo: string;
  valorOriginal: string | null;
  valorEditado: string;
  motivo: string | null;
  editadoPor: string | null;
  editadoEm: string;
};

export default function CentralAlunos() {
  // COMPONENTE OBSOLETO - Use CentralAlunosSimplified
  return (
    <div className="border rounded-sm p-4 text-sm text-red-600">
      Este componente está obsoleto. Use CentralAlunosSimplified ao invés.
    </div>
  );
}

function CentralAlunosOLD() {
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [edits, setEdits] = useState<AlunoEdit[]>([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingField, setEditingField] = useState<{campo: string; valor: string; valorOriginal: string | null} | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Carregar dados do PostgreSQL
  useEffect(() => {
    const fetchAlunos = async () => {
      try {
        const response = await fetch('/api/importacoes/ata-resultados-finais');
        if (!response.ok) throw new Error('Erro ao carregar dados');

        const { arquivos } = await response.json();

        // Processar todos os arquivos e extrair alunos
        const alunosMap = new Map<string, Aluno>();

        for (const file of (arquivos || [])) {
          const rows = file.data.rows as AlunoRaw[];

          for (const row of rows) {
            const matricula = row.ALUNO || "";
            const nome = row.NOME_COMPL || "";

            if (!matricula) continue;

            // Se aluno já existe, adicionar disciplina ao histórico
            if (alunosMap.has(matricula)) {
              const aluno = alunosMap.get(matricula)!;
              aluno.historico.push({
                disciplina: row.DISCIPLINA1 || "",
                totalPontos: row.TOTAL_PONTOS || "",
                faltas: row.FALTAS || "",
                situacao: row.SITUACAO_FINAL || ""
              });
            } else {
              // Criar novo aluno
              alunosMap.set(matricula, {
                matricula,
                nome,
                ano: row.Ano || "",
                modalidade: row.MODALIDADE || "",
                curso: row.CURSO || "",
                serie: row.SERIE || "",
                turno: row.TURNO || "",
                turma: row.TURMA || "",
                historico: [{
                  disciplina: row.DISCIPLINA1 || "",
                  totalPontos: row.TOTAL_PONTOS || "",
                  faltas: row.FALTAS || "",
                  situacao: row.SITUACAO_FINAL || ""
                }]
              });
            }
          }
        }

        const alunosArray = Array.from(alunosMap.values());
        setAlunos(alunosArray);
      } catch (error) {
        console.error('Erro ao carregar alunos:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAlunos();
  }, []);

  // Normalizar texto (remover acentos)
  const normalize = (text: string): string => {
    return text
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
  };

  // Filtrar alunos pela pesquisa
  const filteredAlunos = useMemo(() => {
    if (!searchTerm.trim()) return alunos;

    const normalizedSearch = normalize(searchTerm);

    // Converter * em regex
    const regexPattern = normalizedSearch
      .split('*')
      .map(part => part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
      .join('.*');

    const regex = new RegExp(regexPattern, 'i');

    return alunos.filter(aluno => {
      const normalizedNome = normalize(aluno.nome);
      const normalizedMatricula = normalize(aluno.matricula);

      return regex.test(normalizedNome) || regex.test(normalizedMatricula);
    });
  }, [alunos, searchTerm]);

  // Aplicar edições ao aluno atual
  const currentAluno = useMemo(() => {
    const alunoOriginal = filteredAlunos[currentIndex];
    if (!alunoOriginal || edits.length === 0) return alunoOriginal;

    // Clonar aluno para aplicar edições
    const alunoEditado = { ...alunoOriginal };

    // Aplicar cada edição (usa a mais recente de cada campo)
    const editsMap = new Map<string, string>();
    for (const edit of edits) {
      // Se já tem uma edição para este campo, ignora (pois está ordenado por data desc)
      if (!editsMap.has(edit.campo)) {
        editsMap.set(edit.campo, edit.valorEditado);
      }
    }

    // Aplicar edições aos campos correspondentes
    if (editsMap.has('NOME_COMPL')) alunoEditado.nome = editsMap.get('NOME_COMPL')!;
    // Adicionar mais campos conforme necessário

    return alunoEditado;
  }, [filteredAlunos, currentIndex, edits]);

  // Buscar edições do aluno atual
  useEffect(() => {
    const fetchEdits = async () => {
      const alunoAtual = filteredAlunos[currentIndex];
      if (!alunoAtual) {
        setEdits([]);
        return;
      }

      try {
        const response = await fetch(`/api/edits?matricula=${alunoAtual.matricula}`);
        if (!response.ok) {
          const errorData = await response.json();
          console.error('Erro ao buscar edições:', response.status, errorData);
          throw new Error(`Erro ao buscar edições: ${response.status}`);
        }

        const { edits } = await response.json();
        setEdits(edits);
      } catch (error) {
        console.error('Erro ao buscar edições:', error);
        setEdits([]);
      }
    };

    fetchEdits();
  }, [currentIndex, filteredAlunos]);

  // Handlers de navegação
  const handlePrevious = () => {
    setCurrentIndex(prev => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex(prev => Math.min(filteredAlunos.length - 1, prev + 1));
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => Math.min(filteredAlunos.length - 1, prev + 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => Math.max(0, prev - 1));
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredAlunos[highlightedIndex]) {
          setCurrentIndex(highlightedIndex);
          setShowDropdown(false);
          setSearchTerm('');
        }
        break;
      case 'Escape':
        setShowDropdown(false);
        break;
    }
  };

  // Handler para abrir modal de edição
  const handleEditField = (campo: string, valorAtual: string) => {
    if (!currentAluno) return;

    // Buscar valor original do aluno (antes das edições)
    const alunoOriginal = filteredAlunos[currentIndex];
    let valorOriginal: string | null = null;

    // Mapear campo para propriedade do aluno
    if (campo === 'NOME_COMPL' && alunoOriginal) {
      valorOriginal = alunoOriginal.nome;
    }

    setEditingField({ campo, valor: valorAtual, valorOriginal });
    setShowEditModal(true);
  };

  // Handler para salvar edição
  const handleSaveEdit = async (novoValor: string, motivo?: string) => {
    if (!editingField || !currentAluno) return;

    try {
      const response = await fetch('/api/edits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matricula: currentAluno.matricula,
          campo: editingField.campo,
          valorOriginal: editingField.valorOriginal,
          valorEditado: novoValor,
          motivo
        })
      });

      if (!response.ok) throw new Error('Erro ao salvar edição');

      const { edit } = await response.json();

      // Adicionar nova edição ao estado
      setEdits(prev => [edit, ...prev]);

      // Fechar modal
      setShowEditModal(false);
      setEditingField(null);
    } catch (error) {
      console.error('Erro ao salvar edição:', error);
      alert('Erro ao salvar edição. Verifique o console para mais detalhes.');
    }
  };

  if (isLoading) {
    return <div className="text-center py-8 text-neutral-500">Carregando alunos...</div>;
  }

  if (alunos.length === 0) {
    return (
      <div className="text-center py-8 text-neutral-500">
        Nenhum aluno encontrado. Faça o upload de arquivos CSV na seção de migração.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Campo de Pesquisa */}
      <div className="relative">
        <input
          ref={searchInputRef}
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setShowDropdown(true);
            setHighlightedIndex(0);
          }}
          onFocus={() => setShowDropdown(true)}
          onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
          onKeyDown={handleSearchKeyDown}
          placeholder="Pesquisar por nome ou matrícula (use * como coringa)"
          className="w-full border rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* Dropdown de resultados */}
        {showDropdown && searchTerm && filteredAlunos.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border rounded-sm shadow-lg max-h-60 overflow-auto">
            {filteredAlunos.slice(0, 20).map((aluno, index) => (
              <button
                key={aluno.matricula}
                type="button"
                onClick={() => {
                  setCurrentIndex(index);
                  setShowDropdown(false);
                  setSearchTerm('');
                }}
                className={`w-full text-left px-3 py-2 text-xs hover:bg-blue-50 ${
                  index === highlightedIndex ? 'bg-blue-100' : ''
                }`}
              >
                <div className="font-medium">{aluno.nome}</div>
                <div className="text-neutral-500">
                  Mat: {aluno.matricula} • {aluno.ano} • {aluno.turma} • {aluno.modalidade}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Controles de Navegação */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="px-3 py-1 text-xs border rounded-smdisabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-50"
            type="button"
          >
            ← Anterior
          </button>
          <button
            onClick={handleNext}
            disabled={currentIndex === filteredAlunos.length - 1}
            className="px-3 py-1 text-xs border rounded-smdisabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-50"
            type="button"
          >
            Próximo →
          </button>
        </div>

        <div className="text-xs text-neutral-600">
          Aluno {currentIndex + 1} de {filteredAlunos.length}
        </div>
      </div>

      {/* Dados do Aluno */}
      {currentAluno && (
        <div className="border rounded-sm p-4 space-y-4">
          {/* Identificação */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] text-neutral-500 block">Matrícula</label>
              <div className="text-xs font-medium">{currentAluno.matricula}</div>
            </div>
            <div className="col-span-2">
              <label className="text-[10px] text-neutral-500 block">Nome Completo</label>
              <div className="flex items-center gap-2">
                <div className="text-xs font-medium flex-1">{currentAluno.nome}</div>
                <button
                  onClick={() => handleEditField('NOME_COMPL', currentAluno.nome)}
                  className="text-[10px] text-blue-600 hover:underline"
                  type="button"
                  title="Editar nome"
                >
                  ✏️ Editar
                </button>
                {edits.some(e => e.campo === 'NOME_COMPL') && (
                  <span className="text-[9px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded">Editado</span>
                )}
              </div>
            </div>
          </div>

          {/* Informações Escolares */}
          <div className="grid grid-cols-4 gap-3">
            <div>
              <label className="text-[10px] text-neutral-500 block">Ano</label>
              <div className="text-xs">{currentAluno.ano}</div>
            </div>
            <div>
              <label className="text-[10px] text-neutral-500 block">Série</label>
              <div className="text-xs">{currentAluno.serie}</div>
            </div>
            <div>
              <label className="text-[10px] text-neutral-500 block">Turma</label>
              <div className="text-xs">{currentAluno.turma}</div>
            </div>
            <div>
              <label className="text-[10px] text-neutral-500 block">Turno</label>
              <div className="text-xs">{currentAluno.turno}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-neutral-500 block">Modalidade</label>
              <div className="text-xs">{currentAluno.modalidade}</div>
            </div>
            <div>
              <label className="text-[10px] text-neutral-500 block">Curso</label>
              <div className="text-xs">{currentAluno.curso}</div>
            </div>
          </div>

          {/* Histórico Escolar */}
          <div>
            <h3 className="text-xs font-medium mb-2">Histórico Escolar</h3>
            <div className="border rounded-smoverflow-hidden">
              <table className="w-full text-[10px]">
                <thead className="bg-neutral-50">
                  <tr>
                    <th className="text-left px-2 py-1 font-medium">Disciplina</th>
                    <th className="text-center px-2 py-1 font-medium">Pontos</th>
                    <th className="text-center px-2 py-1 font-medium">Faltas</th>
                    <th className="text-center px-2 py-1 font-medium">Situação</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {currentAluno.historico.map((item, index) => (
                    <tr key={index} className="hover:bg-neutral-50">
                      <td className="px-2 py-1">{item.disciplina}</td>
                      <td className="px-2 py-1 text-center">{item.totalPontos}</td>
                      <td className="px-2 py-1 text-center">{item.faltas}</td>
                      <td className="px-2 py-1 text-center">{item.situacao}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Histórico de Edições */}
          {edits.length > 0 && (
            <div className="border-t pt-4">
              <h3 className="text-xs font-medium mb-2">Histórico de Edições</h3>
              <div className="space-y-2">
                {edits.map((edit) => (
                  <div key={edit.id} className="bg-neutral-50 border rounded-smp-2 text-[10px]">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="font-medium text-neutral-900">{edit.campo}</div>
                        <div className="flex items-center gap-2 mt-1">
                          {edit.valorOriginal && (
                            <>
                              <span className="text-neutral-500 line-through">{edit.valorOriginal}</span>
                              <span className="text-neutral-400">→</span>
                            </>
                          )}
                          <span className="text-green-700 font-medium">{edit.valorEditado}</span>
                        </div>
                        {edit.motivo && (
                          <div className="text-neutral-600 italic mt-1">"{edit.motivo}"</div>
                        )}
                      </div>
                      <div className="text-right text-neutral-500 shrink-0">
                        <div>{new Date(edit.editadoEm).toLocaleDateString('pt-BR')}</div>
                        <div>{new Date(edit.editadoEm).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</div>
                        {edit.editadoPor && <div className="text-[9px]">por {edit.editadoPor}</div>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal de Edição */}
      {showEditModal && editingField && (
        <Modal
          open={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setEditingField(null);
          }}
          title={`Editar ${editingField.campo}`}
          size="md"
        >
          <EditFieldForm
            campo={editingField.campo}
            valorAtual={editingField.valor}
            valorOriginal={editingField.valorOriginal}
            onSave={handleSaveEdit}
            onCancel={() => {
              setShowEditModal(false);
              setEditingField(null);
            }}
          />
        </Modal>
      )}
    </div>
  );
}

// Componente interno para o formulário de edição
function EditFieldForm({
  campo,
  valorAtual,
  valorOriginal,
  onSave,
  onCancel
}: {
  campo: string;
  valorAtual: string;
  valorOriginal: string | null;
  onSave: (valor: string, motivo?: string) => void;
  onCancel: () => void;
}) {
  const [valor, setValor] = useState(valorAtual);
  const [motivo, setMotivo] = useState("");

  return (
    <div className="space-y-4">
      {/* Comparação Original vs Editado */}
      {valorOriginal && valorOriginal !== valorAtual && (
        <div className="bg-blue-50 border border-blue-200 rounded-smp-3 text-xs">
          <div className="font-medium text-blue-900 mb-1">Valor Original (do CSV)</div>
          <div className="text-blue-700">{valorOriginal}</div>
        </div>
      )}

      {/* Novo Valor */}
      <div>
        <label className="text-xs font-medium block mb-1">Novo Valor</label>
        <input
          type="text"
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          className="w-full border rounded-smpx-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          autoFocus
        />
      </div>

      {/* Motivo */}
      <div>
        <label className="text-xs font-medium block mb-1">Motivo da Edição (opcional)</label>
        <textarea
          value={motivo}
          onChange={(e) => setMotivo(e.target.value)}
          className="w-full border rounded-smpx-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
          placeholder="Ex: Correção de sobrenome incompleto"
        />
      </div>

      {/* Botões */}
      <div className="flex justify-end gap-2">
        <button
          onClick={onCancel}
          className="px-3 py-1.5 text-xs border rounded-smhover:bg-neutral-50"
          type="button"
        >
          Cancelar
        </button>
        <button
          onClick={() => onSave(valor, motivo || undefined)}
          className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded-smhover:bg-blue-700"
          type="button"
          disabled={valor === valorAtual}
        >
          Salvar
        </button>
      </div>
    </div>
  );
}
