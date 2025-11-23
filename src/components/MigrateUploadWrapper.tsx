"use client";

import MigrateCategoryUpload from "@/components/MigrateCategoryUpload";

const CATEGORIES = [
  "ata-resultados-finais",
  "ficha-individual-historico",
] as const;

export default function MigrateUploadWrapper() {
  return (
    <div className="space-y-4">
      {CATEGORIES.map((category) => (
        <MigrateCategoryUpload key={category} category={category} />
      ))}
    </div>
  );
}
