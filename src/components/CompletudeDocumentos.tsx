"use client";

import { useState } from "react";
import { PHASES_CONFIG } from "@/lib/core/data/gestao-alunos/phases";
import type { DocEmissao, Phase, PhaseStatus } from "@/lib/core/data/gestao-alunos/phases.types";
import type {
  CampoFaltante,
  ResumoCompletudeEmissao,
} from "@/lib/core/data/gestao-alunos/documentos/calcularCompletude";
import { Button } from "@/components/ui/Button";

type CompletudeDocumentosProps = {
  completude: ResumoCompletudeEmissao;
  onNavigateToAba?: (abaId: string) => void;
};

const ORDEM_DOCUMENTOS: DocEmissao[] = [
  "Certidão",
  "Histórico Escolar",
  "Certificado",
  "Diploma",
];

export function CompletudeDocumentos({
  completude,
  onNavigateToAba,
}: CompletudeDocumentosProps) {
  const [detalhesAbertos, setDetalhesAbertos] = useState<Record<DocEmissao, boolean>>(
    () => ({
      "Certidão": false,
      "Histórico Escolar": false,
      "Certificado": false,
      "Diploma": false,
    })
  );

  const statusGeralLabel = labelPorStatus(completude.statusGeral);
  const statusGeralClass = badgePorStatus(completude.statusGeral);

  return (
    <div className="border rounded-sm bg-white p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-neutral-800">
            Completude dos documentos
          </div>
          <div className="text-xs text-neutral-500">
            {completude.documentosProntos}/{completude.totalDocumentos} documentos prontos
          </div>
        </div>
        <span className={`text-[10px] font-semibold px-2 py-1 rounded-full ${statusGeralClass}`}>
          {statusGeralLabel}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {ORDEM_DOCUMENTOS.map((documento) => {
          const info = completude.porDocumento[documento];
          const statusLabel = labelPorStatus(info.status);
          const statusClass = badgePorStatus(info.status);
          const detalhesAberto = detalhesAbertos[documento];

          const grupos = agruparCamposFaltantes(info.camposFaltantes);

          return (
            <div key={documento} className="border rounded-sm p-3 bg-neutral-50">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-sm font-semibold text-neutral-800">
                    {documento}
                  </div>
                  <div className="text-xs text-neutral-500">
                    {info.percentual}% · {info.camposPreenchidos}/{info.totalCampos} campos
                  </div>
                </div>
                <span className={`text-[10px] font-semibold px-2 py-1 rounded-full ${statusClass}`}>
                  {statusLabel}
                </span>
              </div>

              <div className="mt-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setDetalhesAbertos((prev) => ({
                      ...prev,
                      [documento]: !prev[documento],
                    }))
                  }
                >
                  {detalhesAberto ? "Ocultar detalhes" : "Ver detalhes"}
                </Button>
              </div>

              {detalhesAberto && (
                <div className="mt-3 space-y-2">
                  {info.camposFaltantes.length === 0 ? (
                    <div className="text-xs text-green-700">
                      Nenhum campo faltante para este documento.
                    </div>
                  ) : (
                    grupos.map((grupo) => {
                      const faseConfig = PHASES_CONFIG[grupo.fase];
                      return (
                        <div key={grupo.fase} className="space-y-1">
                          <div className="text-[11px] font-semibold text-neutral-600">
                            {faseConfig.titulo}
                          </div>
                          <div className="flex flex-col gap-1">
                            {grupo.campos.map((campo) => (
                              <button
                                key={`${grupo.fase}-${campo.tabela}-${campo.campo}`}
                                type="button"
                                className="text-left text-xs text-blue-700 hover:underline"
                                onClick={() => onNavigateToAba?.(faseConfig.abaId)}
                              >
                                {campo.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

type GrupoCamposFaltantes = {
  fase: Phase;
  campos: CampoFaltante[];
};

function agruparCamposFaltantes(campos: CampoFaltante[]): GrupoCamposFaltantes[] {
  const agrupado = new Map<Phase, CampoFaltante[]>();

  for (const campo of campos) {
    const grupo = agrupado.get(campo.fase) ?? [];
    grupo.push(campo);
    agrupado.set(campo.fase, grupo);
  }

  return [...agrupado.entries()]
    .sort(([faseA], [faseB]) => PHASES_CONFIG[faseA].ordem - PHASES_CONFIG[faseB].ordem)
    .map(([fase, lista]) => ({ fase, campos: lista }));
}

function labelPorStatus(status: PhaseStatus): string {
  if (status === "completo") return "Completo";
  if (status === "ausente") return "Ausente";
  return "Incompleto";
}

function badgePorStatus(status: PhaseStatus): string {
  if (status === "completo") return "bg-green-100 text-green-700";
  if (status === "ausente") return "bg-red-100 text-red-700";
  return "bg-yellow-100 text-yellow-700";
}
