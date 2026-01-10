import MigrateUploadWrapper from "@/components/MigrateUploadWrapper";

export default function MigracaoPage() {
  return (
    <div className="space-y-4 text-sm text-neutral-700">
      <div>Importe arquivos CSV/XML do Conexão Educação.</div>
      <MigrateUploadWrapper />
    </div>
  );
}

