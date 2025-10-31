export default function MigracaoPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-lg font-medium">Painel de Migração</h1>
      <p className="text-sm text-neutral-600">Mocks iniciais para importação e checagens.</p>
      <div className="rounded-sm border p-4 text-sm">
        <div>Importe arquivos CSV/XML do Conexão Educação.</div>
        <ul className="list-disc pl-5 mt-2 text-neutral-700">
          <li>Ata_resultados_finais.csv</li>
          <li>RelAcompEnturmacaoPorEscola.csv</li>
        </ul>
      </div>
    </div>
  );
}


