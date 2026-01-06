import { useState } from "react";
import type { AlunoCertificacao } from "@/hooks/useAlunosCertificacao";
import {
  extrairMatriculaDoNomeArquivo,
  normalizarMatricula,
} from "@/lib/utils/matriculas";

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
  importarArquivos: (
    arquivos: FileList,
    alunos: Pick<AlunoCertificacao, "id" | "matricula" | "nome">[]
  ) => Promise<void>;
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

  const importarArquivos = async (
    arquivos: FileList,
    alunos: Pick<AlunoCertificacao, "id" | "matricula" | "nome">[]
  ) => {
    setIsImportando(true);
    abrirModal();

    const totalFiles = arquivos.length;
    setProgresso({ totalFiles, processedFiles: 0, errorFiles: 0 });

    let processedFiles = 0;
    let errorFiles = 0;
    const alunosPorMatricula = new Map(
      alunos.map((aluno) => [normalizarMatricula(aluno.matricula), aluno])
    );
    const errosPreProcessamento: string[] = [];
    const errosImportacao: string[] = [];

    try {
      // Processar arquivos sequencialmente
      for (const arquivo of Array.from(arquivos)) {
        const matriculaArquivo = extrairMatriculaDoNomeArquivo(arquivo.name);
        if (!matriculaArquivo) {
          errorFiles++;
          processedFiles++;
          errosPreProcessamento.push(
            `Arquivo "${arquivo.name}": não foi possível identificar a matrícula antes do "_" no nome do arquivo (ex: 123456_2022.xlsx).`
          );
          setProgresso({ totalFiles, processedFiles, errorFiles });
          continue;
        }

        const alunoDestino = alunosPorMatricula.get(
          normalizarMatricula(matriculaArquivo)
        );
        if (!alunoDestino) {
          errorFiles++;
          processedFiles++;
          errosPreProcessamento.push(
            `Arquivo "${arquivo.name}": matrícula ${matriculaArquivo} não corresponde a nenhum aluno carregado.`
          );
          setProgresso({ totalFiles, processedFiles, errorFiles });
          continue;
        }

        try {
          await importarArquivo(arquivo, alunoDestino);
          processedFiles++;
        } catch (error) {
          console.error(`Erro ao importar arquivo ${arquivo.name}:`, error);
          const mensagemErro =
            error instanceof Error && error.message
              ? error.message
              : "Erro ao importar arquivo";
          errosImportacao.push(`Arquivo "${arquivo.name}": ${mensagemErro}`);
          errorFiles++;
          processedFiles++;
        }

        setProgresso({ totalFiles, processedFiles, errorFiles });
      }

      if (errosPreProcessamento.length || errosImportacao.length) {
        alert([...errosPreProcessamento, ...errosImportacao].join("\n"));
      }
    } finally {
      setIsImportando(false);
    }
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
async function importarArquivo(
  arquivo: File,
  aluno: Pick<AlunoCertificacao, "id" | "matricula" | "nome">
): Promise<void> {
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
      alunoId: aluno.id,
      alunoMatricula: aluno.matricula,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({} as Record<string, unknown>));
    const message =
      (error as any).message ||
      (error as any).error ||
      `Erro HTTP: ${response.status}`;
    throw new Error(typeof message === "string" && message.trim() ? message : `Erro HTTP: ${response.status}`);
  }

  return response.json();
}
