"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

type Aluno = {
  matricula: string;
  nome: string;
};

type ListaAlunosPendentesProps = {
  alunos: Aluno[];
};

export function ListaAlunosPendentes({ alunos }: ListaAlunosPendentesProps) {
  const [showAll, setShowAll] = useState(false);
  const INITIAL_LIMIT = 10;

  const alunosExibidos = showAll ? alunos : alunos.slice(0, INITIAL_LIMIT);
  const temMais = alunos.length > INITIAL_LIMIT;

  const downloadCSV = () => {
    const csvContent = [
      ['Matrícula', 'Nome'].join(','),
      ...alunos.map(a => `${a.matricula},"${a.nome}"`).join('\n')
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `alunos_pendentes_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="mt-2 space-y-2">
      <div className="flex items-center justify-between">
        <div className="text-xs text-neutral-600">
          ⚠️ <strong>{alunos.length} alunos</strong> do CSV não foram criados no banco de dados.
        </div>
        {alunos.length > 0 && (
          <Button
            onClick={downloadCSV}
            variant="ghost"
            size="sm"
            className="text-xs"
          >
            Baixar CSV
          </Button>
        )}
      </div>

      <div className="bg-orange-50 border border-orange-200 rounded-sm p-2 text-xs text-orange-800">
        Isso pode indicar um problema na importação. Verifique os logs ou tente reimportar o arquivo.
      </div>

      <ul className="space-y-1 max-h-64 overflow-auto">
        {alunosExibidos.map((aluno) => (
          <li
            key={aluno.matricula}
            className="flex items-center gap-2 px-2 py-1.5 bg-white border rounded-sm text-xs hover:bg-neutral-50"
          >
            <span className="text-orange-500">⚠️</span>
            <span className="font-mono text-neutral-600">{aluno.matricula}</span>
            <span className="text-neutral-700">{aluno.nome}</span>
          </li>
        ))}
      </ul>

      {temMais && !showAll && (
        <Button
          onClick={() => setShowAll(true)}
          variant="ghost"
          size="sm"
          className="w-full text-xs"
        >
          Ver mais {alunos.length - INITIAL_LIMIT} alunos...
        </Button>
      )}

      {showAll && temMais && (
        <Button
          onClick={() => setShowAll(false)}
          variant="ghost"
          size="sm"
          className="w-full text-xs"
        >
          Mostrar menos
        </Button>
      )}
    </div>
  );
}
