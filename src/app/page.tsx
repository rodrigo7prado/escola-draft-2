import MigrateUploads from "@/components/MigrateUploads";
import CentralAlunos from "@/components/CentralAlunos";

export default function Home() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-medium">Tela Integrada</h1>
      <p className="text-sm text-neutral-600">Seções integradas: Migração, Inconsistências, Alunos e Impressão.</p>

      <section id="migracao" className="scroll-mt-16">
        <details open className="border rounded-md">
          <summary className="cursor-pointer select-none px-4 py-3 font-medium">Painel de Migração</summary>
          <div className="px-4 pb-4 text-sm text-neutral-700 space-y-4">
            <div>Importe arquivos CSV/XML do Conexão Educação.</div>
            <MigrateUploads />
          </div>
        </details>
      </section>

      <section id="inconsistencias" className="scroll-mt-16">
        <details className="border rounded-md">
          <summary className="cursor-pointer select-none px-4 py-3 font-medium">Painel de Inconsistências</summary>
          <div className="px-4 pb-4 grid grid-cols-1 gap-3 text-sm">
            <div className="border rounded-md p-4">
              <div className="font-medium mb-1">Nível 1: Banco de dados e migração</div>
              <div className="text-neutral-600">Checagens estruturais de presença e referências.</div>
            </div>
            <div className="border rounded-md p-4">
              <div className="font-medium mb-1">Nível 2: Entrega de documentos</div>
              <div className="text-neutral-600">Checklist de documentos.</div>
            </div>
            <div className="border rounded-md p-4">
              <div className="font-medium mb-1">Nível 3: Consistência de dados</div>
              <div className="text-neutral-600">Dados necessários a documentos.</div>
            </div>
            <div className="border rounded-md p-4">
              <div className="font-medium mb-1">Nível 4: Consistência de histórico escolar</div>
              <div className="text-neutral-600">Pontuações e aprovações.</div>
            </div>
            <div className="border rounded-md p-4">
              <div className="font-medium mb-1">Nível 5: Pendências de tarefas</div>
              <div className="text-neutral-600">Impressões pendentes.</div>
            </div>
            <div className="border rounded-md p-4">
              <div className="font-medium mb-1">Nível 6: Fluxo de ações</div>
              <div className="text-neutral-600">Sequência de resolução e impressão.</div>
            </div>
          </div>
        </details>
      </section>

      <section id="alunos" className="scroll-mt-16">
        <details className="border rounded-md">
          <summary className="cursor-pointer select-none px-4 py-3 font-medium">Central de Alunos</summary>
          <div className="px-4 pb-4 text-sm text-neutral-700">
            <CentralAlunos />
          </div>
        </details>
      </section>

      <section id="impressao" className="scroll-mt-16">
        <details className="border rounded-md">
          <summary className="cursor-pointer select-none px-4 py-3 font-medium">Painel de Impressão</summary>
          <div className="px-4 pb-4 text-sm text-neutral-700">
            Visualização de lista e impressão (mock).
          </div>
        </details>
      </section>
    </div>
  );
}
