import { useState } from "react";

type ProgressoImportacao = {
  totalFiles: number;
  processedFiles: number;
  errorFiles: number;
};

type UseImportacaoHistoricoEscolarReturn = {
  isImportando: boolean;
  progresso: ProgressoImportacao;
  modalAberto: boolean;
  abrirModal: () => void;
  fecharModal: () => void;
  importarArquivos: (arquivos: FileList, alunoId: string) => Promise<void>;
};

/**
 * Hook para gerenciar importação de Ficha Individual - Histórico Escolar
 */
export function useImportacaoHistoricoEscolar(): UseImportacaoHistoricoEscolarReturn {
  const [isImportando, setIsImportando] = useState(false);
  const [modalAberto, setModalAberto] = useState(false);
  const [progresso, setProgresso] = useState<ProgressoImportacao>({
    totalFiles: 0,
    processedFiles: 0,
    errorFiles: 0,
  });

  const abrirModal = () => setModalAberto(true);
  const fecharModal = () => {
    setModalAberto(false);
    setProgresso({ totalFiles: 0, processedFiles: 0, errorFiles: 0 });
  };

  const importarArquivos = async (arquivos: FileList, alunoId: string) => {
    setIsImportando(true);
    abrirModal();

    const totalFiles = arquivos.length;
    setProgresso({ totalFiles, processedFiles: 0, errorFiles: 0 });

    let processedFiles = 0;
    let errorFiles = 0;

    // Processar arquivos sequencialmente
    for (const arquivo of Array.from(arquivos)) {
      try {
        await importarArquivo(arquivo, alunoId);
        processedFiles++;
      } catch (error) {
        console.error(`Erro ao importar arquivo ${arquivo.name}:`, error);
        errorFiles++;
        processedFiles++;
      }

      setProgresso({ totalFiles, processedFiles, errorFiles });
    }

    setIsImportando(false);
  };

  return {
    isImportando,
    progresso,
    modalAberto,
    abrirModal,
    fecharModal,
    importarArquivos,
  };
}

/**
 * Importa um único arquivo XLSX de histórico escolar
 */
async function importarArquivo(arquivo: File, alunoId: string): Promise<void> {
  // Converter arquivo para base64
  const arrayBuffer = await arquivo.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);
  const fileData = btoa(String.fromCharCode(...uint8Array));

  const response = await fetch("/api/importacoes/ficha-individual-historico", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      fileName: arquivo.name,
      fileData,
      alunoId,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Erro desconhecido" }));
    throw new Error(error.message || `Erro HTTP: ${response.status}`);
  }

  return response.json();
}