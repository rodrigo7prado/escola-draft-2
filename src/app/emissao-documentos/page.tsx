export default function EmissaoDocumentosPage() {
  return (
    <div className="flex flex-col gap-2 h-full min-h-0">
      <div className="flex items-center gap-2 border rounded-sm px-2 py-1 text-xs">
        {/* [FEAT:pagina-emissao-documentos_TEC2] Campo de pesquisa com autocompletar e coringa */}
        <label htmlFor="busca-aluno" className="text-neutral-600">
          Buscar
        </label>
        <input
          id="busca-aluno"
          type="text"
          placeholder="Pesquisar por nome ou matrícula (use * como coringa)"
          className="flex-1 min-w-0 bg-white border border-neutral-200 rounded-sm px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex gap-2 flex-1 min-h-0">
        <aside className="w-80 shrink-0 border rounded-sm overflow-hidden flex flex-col">
          {/* [FEAT:pagina-emissao-documentos_TEC3] Lista de alunos concluintes por modalidade */}
          <div className="px-2 py-1 border-b bg-neutral-50 text-[11px] font-semibold text-neutral-700">
            Alunos Concluintes · Ensino Médio Regular
          </div>
          <div className="flex-1 overflow-y-auto px-2 py-1 text-[11px] text-neutral-500">
            Lista por Turma (modo abreviado) e Aluno será exibida aqui.
          </div>
        </aside>

        <section className="flex-1 border rounded-sm overflow-hidden flex flex-col">
          <div className="px-2 py-1 border-b bg-neutral-50 text-[11px] font-semibold text-neutral-700">
            Emissão de Documentos
          </div>
          <div className="flex-1 px-2 py-1 text-[11px] text-neutral-500">
            Bloco de conteúdo principal a definir.
          </div>
        </section>
      </div>
    </div>
  );
}

