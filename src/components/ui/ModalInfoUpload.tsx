"use client";

import { Modal, ModalFooter } from "./Modal";
import { AsyncProgressBar } from "./AsyncProgressBar";
import { Button } from "./Button";

type ModalInfoUploadProps = {
  isOpen: boolean;
  totalFiles: number;
  processedFiles: number;
  errorFiles?: number;
  onClose: () => void;
};

/**
 * DRY.UI:MODAL_INFO_UPLOAD
 * Modal para exibir informações de progresso durante upload/importação de arquivos
 */
export function ModalInfoUpload({
  isOpen,
  totalFiles,
  processedFiles,
  errorFiles = 0,
  onClose,
}: ModalInfoUploadProps) {
  const isComplete = processedFiles >= totalFiles;
  const hasErrors = errorFiles > 0;

  return (
    <Modal open={isOpen} onClose={onClose} title="Importação de Arquivos" size="md">
      <div className="space-y-4">
        {/* Barra de progresso */}
        <AsyncProgressBar
          totalItems={totalFiles}
          processedItems={processedFiles}
          errorItems={errorFiles}
        />

        {/* Mensagem de status */}
        {isComplete && (
          <div className="mt-4 p-4 rounded-lg bg-gray-50">
            {hasErrors ? (
              <div className="text-yellow-800">
                <p className="font-semibold">Importação concluída com ressalvas</p>
                <p className="text-sm mt-1">
                  {processedFiles - errorFiles} arquivo(s) importado(s) com sucesso e{" "}
                  {errorFiles} arquivo(s) com erro.
                </p>
              </div>
            ) : (
              <div className="text-green-800">
                <p className="font-semibold">Importação concluída com sucesso!</p>
                <p className="text-sm mt-1">
                  Todos os {processedFiles} arquivo(s) foram processados.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer com botão de fechar */}
      {isComplete && (
        <ModalFooter>
          <Button onClick={onClose} variant="primary">
            Fechar
          </Button>
        </ModalFooter>
      )}
    </Modal>
  );
}