"use client";

import { useState } from "react";
import MigrateUploadWrapper from "@/components/MigrateUploadWrapper";
import { FluxoCertificacao } from "@/components/FluxoCertificacao";
import { Accordion } from "@/components/ui/Accordion";

export default function Home() {
  const [isGestaoAlunosOpen, setIsGestaoAlunosOpen] = useState(true);

  return (
    <div className="flex h-full min-h-0 flex-col gap-2">
      <section id="migracao" className="shrink-0">
        <Accordion
          defaultOpen={false}
          triggerClassName="border rounded-sm px-4 py-2"
          trigger={
            <div className="font-medium text-sm">
              Painel de Migração
            </div>
          }
          contentClassName="border border-t-0 rounded-b-sm px-4 pb-4 text-sm text-neutral-700 space-y-4"
        >
          <div>Importe arquivos CSV/XML do Conexão Educação.</div>
          <MigrateUploadWrapper />
        </Accordion>
      </section>

      {/* <section id="inconsistencias" className="scroll-mt-16">
        <details className="border rounded-sm">
          <summary className="cursor-pointer select-none px-4 py-2 font-medium text-sm">
            Painel de Inconsistências
          </summary>
          <div className="px-4 pb-4 grid grid-cols-1 gap-3 text-sm">
            <div className="border rounded-sm p-4">
              <div className="font-medium mb-1">
                Nível 1: Banco de dados e migração
              </div>
              <div className="text-neutral-600">
                Checagens estruturais de presença e referências.
              </div>
            </div>
            <div className="border rounded-sm p-4">
              <div className="font-medium mb-1">
                Nível 2: Entrega de documentos
              </div>
              <div className="text-neutral-600">Checklist de documentos.</div>
            </div>
            <div className="border rounded-sm p-4">
              <div className="font-medium mb-1">
                Nível 3: Consistência de dados
              </div>
              <div className="text-neutral-600">
                Dados necessários a documentos.
              </div>
            </div>
            <div className="border rounded-sm p-4">
              <div className="font-medium mb-1">
                Nível 4: Consistência de histórico escolar
              </div>
              <div className="text-neutral-600">Pontuações e aprovações.</div>
            </div>
            <div className="border rounded-sm p-4">
              <div className="font-medium mb-1">
                Nível 5: Pendências de tarefas
              </div>
              <div className="text-neutral-600">Impressões pendentes.</div>
            </div>
            <div className="border rounded-sm p-4">
              <div className="font-medium mb-1">Nível 6: Fluxo de ações</div>
              <div className="text-neutral-600">
                Sequência de resolução e impressão.
              </div>
            </div>
          </div>
        </details>
      </section> */}

      <section
        id="alunos"
        className={`flex flex-col min-h-0 overflow-hidden ${
          isGestaoAlunosOpen ? "h-full" : "shrink-0"
        }`}
      >
        <Accordion
          className="min-h-0 h-full"
          defaultOpen={true}
          onOpenChange={setIsGestaoAlunosOpen}
          triggerClassName="border rounded-sm px-4 py-2"
          trigger={
            <div className="font-medium text-sm shrink-0">
              Gestão de Alunos
            </div>
          }
          contentClassName="border border-t-0 rounded-b-sm px-4 pb-4 min-h-0 overflow-hidden h-full"
        >
          <FluxoCertificacao />

          {/* <Tabs defaultValue="certificacao">
            <TabsList>
              <TabsTrigger value="certificacao">
                Fluxo de Certificação
              </TabsTrigger>
              <TabsTrigger value="central">Central de Alunos</TabsTrigger>
            </TabsList>

            <TabsContent value="certificacao">
              <FluxoCertificacao />
            </TabsContent>

            <TabsContent value="central">
              <CentralAlunosSimplified />
            </TabsContent>
          </Tabs> */}
        </Accordion>
      </section>

      <section id="impressao" className="shrink-0">
        <Accordion
          defaultOpen={false}
          triggerClassName="border rounded-sm px-4 py-2"
          trigger={
            <div className="font-medium text-sm">
              Painel de Impressão
            </div>
          }
          contentClassName="border border-t-0 rounded-b-sm px-4 pb-4 text-sm text-neutral-700"
        >
          Visualização de lista e impressão (mock).
        </Accordion>
      </section>
    </div>
  );
}
