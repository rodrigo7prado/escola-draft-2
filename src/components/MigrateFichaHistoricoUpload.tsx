"use client";

import { useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";

type ArquivoSelecionado = {
  name: string;
  size: number;
};

export default function MigrateFichaHistoricoUpload() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [arquivos, setArquivos] = useState<ArquivoSelecionado[]>([]);

  const handleSelectFiles = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    setArquivos(files.map((file) => ({ name: file.name, size: file.size })));
  };

  const resumo = useMemo(() => {
    if (arquivos.length === 0) return "Nenhum arquivo selecionado ainda (mock).";
    const totalMb = arquivos.reduce((acc, file) => acc + file.size, 0) / (1024 * 1024);
    return `${arquivos.length} arquivo(s) selecionado(s) • ~${totalMb.toFixed(2)} MB`;
  }, [arquivos]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <div className="text-xs text-neutral-600">
          Upload mockado até o CP2. A visualização detalhada ficará no painel de Gestão de Alunos.
        </div>
        <div className="shrink-0">
          <Button variant="outline" size="sm" onClick={() => inputRef.current?.click()}>
            Selecionar arquivos
          </Button>
          <input
            ref={inputRef}
            type="file"
            accept=".csv,text/csv"
            multiple
            className="hidden"
            onChange={handleSelectFiles}
          />
        </div>
      </div>

      <div className="border rounded-sm p-3 bg-neutral-50 text-sm text-neutral-800">
        <div className="font-medium mb-1">Resumo rápido</div>
        <div>{resumo}</div>
        {arquivos.length > 0 && (
          <ul className="mt-2 list-disc list-inside text-xs text-neutral-700 space-y-1">
            {arquivos.map((file) => (
              <li key={file.name}>{file.name}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
