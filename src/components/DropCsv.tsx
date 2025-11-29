"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import type { ParsedCsv } from "@/lib/hash";
import { parseCsvLoose } from "@/lib/importer/csv/parse";

type DropCsvProps = {
  title: string;
  requiredHeaders: string[];
  duplicateKey: string; // column name to check duplicates (e.g., "ALUNO")
  onParsed?: (data: ParsedCsv, fileName: string) => void;
  showPreview?: boolean; // controls preview/stats rendering
  multiple?: boolean; // allow multiple file upload
  enableDrop?: boolean; // allow drag-and-drop; when false, only the button is available
};

export default function DropCsv({
  title,
  requiredHeaders,
  duplicateKey,
  onParsed,
  showPreview = true,
  multiple = false,
  enableDrop = true,
}: DropCsvProps) {
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ParsedCsv | null>(null);
  const [lastUploadInfo, setLastUploadInfo] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const filesToProcess = multiple ? Array.from(files) : [files[0]];
    let successCount = 0;
    let errorCount = 0;

    for (const file of filesToProcess) {
      try {
        const text = await file.text();

        const parsed = parseCsvLoose(text, requiredHeaders);
        if (parsed.headers.length === 0) {
          setError(`${file.name}: CSV vazio ou inválido.`);
          errorCount++;
          continue;
        }

        // validação de cabeçalho: todos os requiredHeaders precisam estar presentes
        const headerSet = new Set(parsed.headers);
        const missing = requiredHeaders.filter((h) => !headerSet.has(h));
        if (missing.length > 0) {
          setError(`${file.name}: Cabeçalho inválido. Faltando: ${missing.join(", ")}`);
          errorCount++;
          continue;
        }

        setError(null);
        setData(parsed);
        onParsed?.(parsed, file.name);
        successCount++;
      } catch (e) {
        console.error(`Erro ao processar ${file.name}:`, e);
        errorCount++;
      }
    }

    if (multiple) {
      setLastUploadInfo(`${successCount} arquivo(s) processado(s)${errorCount > 0 ? `, ${errorCount} com erro` : ''}`);
    }
  }, [onParsed, requiredHeaders, multiple]);

  const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    if (!enableDrop) return;
    e.preventDefault();
    setDragOver(false);
    void handleFiles(e.dataTransfer.files);
  }, [enableDrop, handleFiles]);

  const onChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    void handleFiles(e.target.files);
  }, [handleFiles]);

  const duplicates = useMemo(() => {
    if (!data) return { keys: [] as string[], count: 0 };
    const seen = new Set<string>();
    const dups = new Set<string>();
    for (const row of data.rows) {
      const key = (row[duplicateKey] ?? "").trim();
      if (!key) continue;
      if (seen.has(key)) dups.add(key);
      else seen.add(key);
    }
    return { keys: Array.from(dups), count: dups.size };
  }, [data, duplicateKey]);

  const preview = useMemo(() => {
    if (!data) return null;
    const maxRows = 5;
    const rows = data.rows.slice(0, maxRows);
    const dupSet = new Set(duplicates.keys);
    return (
      <div className="mt-3 border rounded-sm overflow-auto">
        <table className="w-full text-xs">
          <thead className="bg-neutral-50 sticky top-0">
            <tr>
              {data.headers.map((h) => (
                <th key={h} className="text-left px-2 py-1 border-b">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, idx) => {
              const key = (r[duplicateKey] ?? "").trim();
              const isDup = key && dupSet.has(key);
              return (
                <tr
                  key={idx}
                  className={`odd:bg-white even:bg-neutral-50 ${isDup ? "" : ""}`}
                  style={isDup ? { borderLeft: "3px solid var(--color-pendente)" } : undefined}
                >
                  {data.headers.map((h, i) => (
                    <td key={h} className="px-2 py-1 border-b align-top">
                      {i === 0 && isDup ? (
                        <span className="inline-flex items-center gap-1 mr-2 text-(--color-pendente)">
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "var(--color-pendente)" }} />
                          Duplicado
                        </span>
                      ) : null}
                      {r[h] ?? ""}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }, [data, duplicates.keys, duplicateKey]);

  return (
    <div>
      <div
        onDragOver={enableDrop ? (e) => { e.preventDefault(); setDragOver(true); } : undefined}
        onDragLeave={enableDrop ? () => setDragOver(false) : undefined}
        onDrop={enableDrop ? onDrop : undefined}
        className={`border rounded-sm p-4 text-sm ${enableDrop && dragOver ? "bg-neutral-50" : ""}`}
      >
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="font-medium">{title}</div>
            <div className="text-neutral-600 text-xs">
              {enableDrop
                ? `Arraste e solte ${multiple ? 'arquivos .csv' : 'um .csv'} aqui ou selecione ${multiple ? 'arquivos' : 'um arquivo'}`
                : `Selecione ${multiple ? 'arquivos .csv' : 'um arquivo .csv'} para enviar`}
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
          >
            Selecionar arquivo{multiple ? 's' : ''}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={onChange}
            multiple={multiple}
          />
        </div>
        {lastUploadInfo && (
          <div className="mt-2 text-xs text-green-700">{lastUploadInfo}</div>
        )}
        {error && (
          <div className="mt-2 text-xs text-(--color-pendente)">{error}</div>
        )}
        {data && showPreview && (
          <div className="mt-2 text-xs text-neutral-700">
            <div>Total de linhas: {data.rows.length}</div>
            <div>Duplicados por {duplicateKey}: {duplicates.count}</div>
            {duplicates.count > 0 && (
              <div className="mt-1">
                <span className="font-medium">Chaves duplicadas:</span> {duplicates.keys.slice(0, 10).join(", ")}
                {duplicates.keys.length > 10 ? "…" : ""}
              </div>
            )}
            {preview}
          </div>
        )}
      </div>
      {showPreview && (
        <div className="mt-2 text-[10px] text-neutral-500">
          Validação de cabeçalho exige as colunas: {requiredHeaders.join(", ")}
        </div>
      )}
    </div>
  );
}
