"use client";

import DropCsv from "@/components/DropCsv";
import { PeriodoCard } from "@/components/PeriodoCard";
import { useEffect, useState } from "react";

type ParsedCsv = {
  headers: string[];
  rows: Record<string, string>[];
};

type TurmaData = {
  nome: string;
  totalAlunosCSV: number;
  totalAlunosBanco: number;
  pendentes: number;
  status: 'ok' | 'pendente';
  alunosPendentes?: { matricula: string; nome: string }[];
};

type PeriodoData = {
  anoLetivo: string;
  resumo: {
    totalTurmas: number;
    totalAlunosCSV: number;
    totalAlunosBanco: number;
    pendentes: number;
    status: 'ok' | 'pendente';
  };
  turmas: TurmaData[];
};

const ATA_HEADERS = [
  "Ano",
  "CENSO",
  "MODALIDADE",
  "CURSO",
  "SERIE",
  "TURNO",
  "TURMA",
  "ALUNO",
  "NOME_COMPL",
  "DISCIPLINA1",
  "TOTAL_PONTOS",
  "FALTAS",
  "Textbox148",
  "SITUACAO_FINAL",
];

export default function MigrateAtaResultsUpload() {
  const [periodos, setPeriodos] = useState<PeriodoData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  // Carregar dados da API ao montar o componente
  const fetchData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/files');
      if (!response.ok) throw new Error('Erro ao carregar dados');
      const { periodos } = await response.json();
      setPeriodos(periodos || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handler para adicionar novos arquivos
  const handleNewFiles = async (data: ParsedCsv, fileName: string) => {
    try {
      setIsUploading(true);
      const response = await fetch('/api/files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data, fileName })
      });

      if (response.status === 409) {
        // Arquivo duplicado
        const { fileId } = await response.json();
        alert(`Arquivo "${fileName}" com conteúdo idêntico já existe. Upload ignorado.`);
        return;
      }

      if (!response.ok) {
        throw new Error('Erro ao fazer upload do arquivo');
      }

      const result = await response.json();
      console.log('Upload concluído:', result);

      // Recarregar dados
      await fetchData();

    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      alert('Erro ao fazer upload do arquivo. Verifique o console para mais detalhes.');
    } finally {
      setIsUploading(false);
    }
  };

  // Handler para resetar período
  const handleResetPeriodo = async (anoLetivo: string) => {
    try {
      const response = await fetch(`/api/files?periodo=${encodeURIComponent(anoLetivo)}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Erro ao deletar período');
      }

      const result = await response.json();
      console.log(result.message);

      // Recarregar dados
      await fetchData();

    } catch (error) {
      console.error('Erro ao deletar período:', error);
      throw error; // Propaga o erro para o componente
    }
  };

  return (
    <div className="space-y-3">
      {/* Upload de arquivo */}
      <DropCsv
        title="Ata de Resultados Finais"
        requiredHeaders={ATA_HEADERS}
        duplicateKey="ALUNO"
        onParsed={handleNewFiles}
        showPreview={false}
        multiple={true}
        enableDrop={false}
      />

      {/* Estado de loading */}
      {isLoading && (
        <div className="text-center py-6 text-neutral-500 text-sm">
          Carregando dados...
        </div>
      )}

      {/* Estado de uploading */}
      {isUploading && (
        <div className="bg-blue-50 border border-blue-200 rounded-sm p-3 text-sm text-blue-800">
          📤 Processando arquivo... Aguarde.
        </div>
      )}

      {/* Lista de períodos */}
      {!isLoading && periodos.length === 0 && (
        <div className="text-center py-6 text-neutral-500 text-sm border rounded-sm">
          Nenhum dado carregado ainda. Faça upload de um arquivo CSV acima.
        </div>
      )}

      {!isLoading && periodos.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs text-neutral-600 font-medium">
            Dados Importados:
          </div>
          {periodos.map((periodo) => (
            <PeriodoCard
              key={periodo.anoLetivo}
              periodo={periodo}
              onResetPeriodo={handleResetPeriodo}
            />
          ))}
        </div>
      )}
    </div>
  );
}
