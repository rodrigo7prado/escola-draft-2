"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { Modal } from "@/components/ui/Modal";
import FiltrosHierarquicos from "@/components/FiltrosHierarquicos";
import { Button } from "@/components/ui/Button";

type Aluno = {
  id: string;
  matricula: string;
  nome: string | null;
  cpf: string | null;
  origemTipo: string;
  fonteAusente: boolean;
  linhaOrigem?: {
    dadosOriginais: Record<string, any>;
  };
  enturmacoes?: Array<{
    anoLetivo: string;
    regime: number;
    modalidade: string;
    turma: string;
    serie: string;
  }>;
};

type FiltrosState = {
  anoLetivo: string;
  regime: string;
  modalidade: string;
  serie: string;
  turma: string;
};

export default function CentralAlunosSimplified() {
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingField, setEditingField] = useState<{campo: string; valorAtual: string | null; valorOriginal: string | null} | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Estado dos filtros hierárquicos
  const [filtros, setFiltros] = useState<FiltrosState>({
    anoLetivo: '',
    regime: '',
    modalidade: '',
    serie: '',
    turma: ''
  });

  // Carregar alunos da API (com filtros)
  useEffect(() => {
    const fetchAlunos = async () => {
      setIsLoading(true);
      try {
        // Construir query string com filtros
        const params = new URLSearchParams();
        if (filtros.anoLetivo) params.append('anoLetivo', filtros.anoLetivo);
        if (filtros.regime) params.append('regime', filtros.regime);
        if (filtros.modalidade) params.append('modalidade', filtros.modalidade);
        if (filtros.serie) params.append('serie', filtros.serie);
        if (filtros.turma) params.append('turma', filtros.turma);

        const queryString = params.toString();
        const url = queryString ? `/api/alunos?${queryString}` : '/api/alunos';

        const response = await fetch(url);
        if (!response.ok) throw new Error('Erro ao carregar alunos');

        const { alunos } = await response.json();
        setAlunos(alunos);
        setCurrentIndex(0); // Reset para primeiro aluno quando filtrar
      } catch (error) {
        console.error('Erro ao carregar alunos:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAlunos();
  }, [filtros]);

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
      const normalizedNome = normalize(aluno.nome || '');
      const normalizedMatricula = normalize(aluno.matricula);

      return regex.test(normalizedNome) || regex.test(normalizedMatricula);
    });
  }, [alunos, searchTerm]);

  const currentAluno = filteredAlunos[currentIndex];

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
  const handleEditField = (campo: string, valorAtual: string | null) => {
    if (!currentAluno) return;

    const valorOriginal = currentAluno.linhaOrigem?.dadosOriginais?.[campo] || null;

    setEditingField({ campo, valorAtual, valorOriginal });
    setShowEditModal(true);
  };

  // Handler para salvar edição
  const handleSaveEdit = async (novoValor: string) => {
    if (!editingField || !currentAluno) return;

    try {
      // Mapear campo do CSV para campo da tabela
      const campoMapeado = editingField.campo === 'NOME_COMPL' ? 'nome' :
                            editingField.campo === 'CPF' ? 'cpf' : null;

      if (!campoMapeado) {
        alert('Campo não suportado para edição ainda');
        return;
      }

      const response = await fetch('/api/alunos', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matricula: currentAluno.matricula,
          [campoMapeado]: novoValor
        })
      });

      if (!response.ok) throw new Error('Erro ao salvar edição');

      const { aluno } = await response.json();

      // Atualizar aluno no estado
      setAlunos(prev => prev.map(a =>
        a.matricula === aluno.matricula ? aluno : a
      ));

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
      {/* Filtros Hierárquicos */}
      <FiltrosHierarquicos
        filtros={filtros}
        onFiltrosChange={setFiltros}
      />

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
              <Button
                key={aluno.matricula}
                onClick={() => {
                  setCurrentIndex(index);
                  setShowDropdown(false);
                  setSearchTerm('');
                }}
                variant="ghost"
                className={`w-full text-left px-3 py-2 text-xs hover:bg-blue-50 rounded-none justify-start h-auto ${
                  index === highlightedIndex ? 'bg-blue-100' : ''
                }`}
              >
                <div className="flex flex-col items-start w-full">
                  <div className="font-medium">{aluno.nome || 'Nome não disponível'}</div>
                  <div className="text-neutral-500">
                    Mat: {aluno.matricula}
                  </div>
                </div>
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Controles de Navegação */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            variant="outline"
            size="sm"
          >
            Anterior
          </Button>
          <Button
            onClick={handleNext}
            disabled={currentIndex === filteredAlunos.length - 1}
            variant="outline"
            size="sm"
          >
            Próximo
          </Button>
        </div>

        <div className="text-xs text-neutral-600">
          Aluno {currentIndex + 1} de {filteredAlunos.length}
        </div>
      </div>

      {/* Dados do Aluno */}
      {currentAluno && (
        <div className="border rounded-sm p-4 space-y-4">
          {/* Avisos */}
          {currentAluno.fonteAusente && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-smp-3 text-xs text-yellow-800">
              Atenção: Arquivo de origem foi excluído. Este aluno está sem fonte original.
            </div>
          )}

          {/* Identificação */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] text-neutral-500 block">Matrícula</label>
              <div className="text-xs font-medium">{currentAluno.matricula}</div>
            </div>
            <div className="col-span-2">
              <label className="text-[10px] text-neutral-500 block">Nome Completo</label>
              <div className="flex items-center gap-2">
                <div className="text-xs font-medium flex-1">{currentAluno.nome || 'Não informado'}</div>
                <Button
                  onClick={() => handleEditField('NOME_COMPL', currentAluno.nome)}
                  variant="ghost"
                  size="sm"
                  className="text-[10px] text-blue-600 hover:underline h-auto px-0 py-0"
                  title="Editar nome"
                >
                  Editar
                </Button>
                {currentAluno.nome !== currentAluno.linhaOrigem?.dadosOriginais?.NOME_COMPL && (
                  <span className="text-[9px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded">Editado</span>
                )}
              </div>
            </div>
          </div>

          {/* CPF */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] text-neutral-500 block">CPF</label>
              <div className="flex items-center gap-2">
                <div className="text-xs flex-1">{currentAluno.cpf || 'Não informado'}</div>
                <Button
                  onClick={() => handleEditField('CPF', currentAluno.cpf)}
                  variant="ghost"
                  size="sm"
                  className="text-[10px] text-blue-600 hover:underline h-auto px-0 py-0"
                  title="Editar CPF"
                >
                  Editar
                </Button>
                {currentAluno.cpf !== currentAluno.linhaOrigem?.dadosOriginais?.CPF && (
                  <span className="text-[9px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded">Editado</span>
                )}
              </div>
            </div>
          </div>

          {/* Origem */}
          <div className="border-t pt-3 text-xs text-neutral-600">
            Tipo de origem: {currentAluno.origemTipo === 'csv' ? 'CSV importado' : 'Criado manualmente'}
          </div>
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
            valorAtual={editingField.valorAtual}
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
  valorAtual: string | null;
  valorOriginal: string | null;
  onSave: (valor: string) => void;
  onCancel: () => void;
}) {
  const [valor, setValor] = useState(valorAtual || '');

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

      {/* Botões */}
      <div className="flex justify-end gap-2">
        <Button
          onClick={onCancel}
          variant="outline"
          size="sm"
        >
          Cancelar
        </Button>
        <Button
          onClick={() => onSave(valor)}
          variant="primary"
          size="sm"
          disabled={valor === valorAtual}
        >
          Salvar
        </Button>
      </div>
    </div>
  );
}
