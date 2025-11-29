"use client";

import MigrateCategoryUpload from "@/components/MigrateCategoryUpload";

const CATEGORIES = [
  "ata-resultados-finais",
  "ficha-individual-historico",
] as const;

export default function MigrateUploadWrapper() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
      {CATEGORIES.map((category) => (
        <MigrateCategoryUpload key={category} category={category} />
      ))}
    </div>
  );
}
