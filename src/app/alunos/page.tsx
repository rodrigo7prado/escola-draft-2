"use client";

import CentralAlunosSimplified from "@/components/CentralAlunosSimplified";
import { FiltrosCertificacao } from "@/components/FiltrosCertificacao";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs";

export default function AlunosPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-lg font-medium">Gestão de Alunos</h1>

      <Tabs defaultValue="certificacao">
        <TabsList>
          <TabsTrigger value="certificacao">Fluxo de Certificação</TabsTrigger>
          <TabsTrigger value="central">Central de Alunos</TabsTrigger>
        </TabsList>

        <TabsContent value="certificacao">
          <div className="space-y-4">
            <FiltrosCertificacao />
            {/* Aqui virá a lista de alunos filtrados para certificação */}
            <div className="text-sm text-neutral-500 text-center py-8">
              Selecione um período letivo para visualizar os alunos
            </div>
          </div>
        </TabsContent>

        <TabsContent value="central">
          <CentralAlunosSimplified />
        </TabsContent>
      </Tabs>
    </div>
  );
}
