import React from "react";

type TurmaInfo = {
  turma: string;
  modalidade?: string;
  ano?: string;
  serie?: string;
  turno?: string;
};

type ModalidadeNode = {
  nome: string;
  turmas: TurmaInfo[];
  registros: number;
};

type CursoNode = {
  nome: string;
  modalidades: Record<string, ModalidadeNode>;
  registros: number;
};

type AnoNode = {
  nome: string;
  cursos: Record<string, CursoNode>;
  registros: number;
};

type Hierarquia = Record<string, AnoNode>;

interface HierarchyTurmasProps {
  hierarquia: Hierarquia;
  turmasLabel?: (count: number) => string;
}

const defaultTurmasLabel = (count: number) =>
  `${count} ${count === 1 ? "turma" : "turmas"}`;

const HierarchyTurmas: React.FC<HierarchyTurmasProps> = ({
  hierarquia,
  turmasLabel = defaultTurmasLabel,
}) => {
  return (
    <div className="text-xs text-neutral-700 border rounded-md p-3">
      {Object.keys(hierarquia).length === 0 ? (
        <div>Nenhum upload válido de Ata_resultados_finais.csv realizado ainda.</div>
      ) : (
        <div className="space-y-2">
          {Object.keys(hierarquia)
            .sort()
            .map((ano) => {
              const nAno = hierarquia[ano];
              const totalTurmasAno = Object.values(nAno.cursos).reduce(
                (acc, c) =>
                  acc +
                  Object.values(c.modalidades).reduce(
                    (a, m) => a + m.turmas.length,
                    0
                  ),
                0
              );
              return (
                <details key={ano} className="border rounded-md">
                  <summary className="px-3 py-2 cursor-pointer select-none font-medium flex items-center justify-between">
                    <span>Ano letivo: {ano}</span>
                    <span className="flex items-center gap-2 text-xs text-neutral-600">
                      <span className="inline-flex items-center gap-1 border rounded px-1.5 py-0.5">
                        {turmasLabel(totalTurmasAno)}
                      </span>
                    </span>
                  </summary>
                  <div className="px-3 pb-2 space-y-2">
                    {Object.keys(nAno.cursos)
                      .sort()
                      .map((curso) => {
                        const nCurso = nAno.cursos[curso];
                        const totalTurmasCurso = Object.values(
                          nCurso.modalidades
                        ).reduce((a, m) => a + m.turmas.length, 0);
                        return (
                          <details key={curso} className="border rounded-md">
                            <summary className="px-3 py-2 cursor-pointer select-none flex items-center justify-between">
                              <span>Curso: {curso}</span>
                              <span className="flex items-center gap-2 text-xs text-neutral-600">
                                <span className="inline-flex items-center gap-1 border rounded px-1.5 py-0.5">
                                  {nCurso.registros}
                                  <span className="text-[10px]">registros</span>
                                </span>
                                <span className="inline-flex items-center gap-1 border rounded px-1.5 py-0.5">
                                  {turmasLabel(totalTurmasCurso)}
                                </span>
                              </span>
                            </summary>
                            <div className="px-3 pb-2 space-y-2">
                              {Object.keys(nCurso.modalidades)
                                .sort()
                                .map((mod) => {
                                  const nMod = nCurso.modalidades[mod];
                                  return (
                                    <details
                                      key={mod}
                                      className="border rounded-md"
                                    >
                                      <summary className="px-3 py-2 cursor-pointer select-none flex items-center justify-between">
                                        <span>Modalidade: {mod}</span>
                                        <span className="flex items-center gap-2 text-xs text-neutral-600">
                                          <span className="inline-flex items-center gap-1 border rounded px-1.5 py-0.5">
                                            {nMod.registros}
                                            <span className="text-[10px]">
                                              registros
                                            </span>
                                          </span>
                                          <span className="inline-flex items-center gap-1 border rounded px-1.5 py-0.5">
                                            {turmasLabel(nMod.turmas.length)}
                                          </span>
                                        </span>
                                      </summary>
                                      <div className="px-3 pb-2">
                                        <ul className="text-sm grid grid-cols-1 sm:grid-cols-2 gap-1">
                                          {nMod.turmas.map((t) => (
                                            <li
                                              key={t.turma}
                                              className="border rounded px-2 py-1 flex items-center justify-between"
                                            >
                                              <span className="font-medium">
                                                {t.turma}
                                              </span>
                                              <span className="text-xs text-neutral-600">
                                                {t.serie || ""}
                                                {t.serie && t.turno
                                                  ? " • "
                                                  : ""}
                                                {t.turno || ""}
                                              </span>
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    </details>
                                  );
                                })}
                            </div>
                          </details>
                        );
                      })}
                  </div>
                </details>
              );
            })}
        </div>
      )}
    </div>
  );
};

export default HierarchyTurmas;