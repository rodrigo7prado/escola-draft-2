export default function InconsistenciasPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-lg font-medium">Painel de Inconsistências</h1>
      <div className="grid grid-cols-1 gap-3">
        <div className="border rounded-sm p-4 text-sm">
          <div className="font-medium mb-1">Nível 1: Banco de dados e migração</div>
          <div className="text-neutral-600">Checagens estruturais de presença e referências.</div>
        </div>
        <div className="border rounded-sm p-4 text-sm">
          <div className="font-medium mb-1">Nível 2: Entrega de documentos</div>
          <div className="text-neutral-600">Checklist de documentos.</div>
        </div>
        <div className="border rounded-sm p-4 text-sm">
          <div className="font-medium mb-1">Nível 3: Consistência de dados</div>
          <div className="text-neutral-600">Dados necessários a documentos.</div>
        </div>
        <div className="border rounded-sm p-4 text-sm">
          <div className="font-medium mb-1">Nível 4: Consistência de histórico escolar</div>
          <div className="text-neutral-600">Pontuações e aprovações.</div>
        </div>
        <div className="border rounded-sm p-4 text-sm">
          <div className="font-medium mb-1">Nível 5: Pendências de tarefas</div>
          <div className="text-neutral-600">Impressões pendentes.</div>
        </div>
        <div className="border rounded-sm p-4 text-sm">
          <div className="font-medium mb-1">Nível 6: Fluxo de ações</div>
          <div className="text-neutral-600">Sequência de resolução e impressão.</div>
        </div>
      </div>
    </div>
  );
}


