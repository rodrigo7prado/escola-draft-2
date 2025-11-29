"use client";

import MigrateAtaResultsUpload from "@/components/MigrateAtaResultsUpload";
import MigrateFichaHistoricoUpload from "@/components/MigrateFichaHistoricoUpload";

type CategoriaImportacao = "ata-resultados-finais" | "ficha-individual-historico";

type CategoryConfig = {
  title: string;
  description?: string;
};

const CATEGORY_CONFIG: Record<CategoriaImportacao, CategoryConfig> = {
  "ata-resultados-finais": {
    title: "Ata de Resultados Finais",
    description: "Upload e visualização da importação existente.",
  },
  "ficha-individual-historico": {
    title: "Ficha Individual - Histórico",
    description: "Mock até o CP2; fluxo real reaproveitará a base de Ata.",
  },
};

export default function MigrateCategoryUpload({ category }: { category: CategoriaImportacao }) {
  const config = CATEGORY_CONFIG[category];

  return (
    <div className="border rounded-sm p-3 space-y-2 bg-white text-sm h-full flex flex-col">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="font-medium leading-tight truncate">{config.title}</div>
          {config.description ? (
            <div className="text-[11px] text-neutral-600 leading-snug">{config.description}</div>
          ) : null}
        </div>
      </div>

      <div className="min-h-0 flex-1">
        {category === "ata-resultados-finais" ? (
          <MigrateAtaResultsUpload />
        ) : (
          <MigrateFichaHistoricoUpload />
        )}
      </div>
    </div>
  );
}
