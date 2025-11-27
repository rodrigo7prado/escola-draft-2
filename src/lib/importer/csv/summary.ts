import type { LinhaImportada } from "@prisma/client";
import type { CsvResumoGrupo, CsvResumoPeriodo, CsvSummaryGrouping } from "@/lib/importer/csv/types";

type AlunosNoBanco = Map<string, Map<string, Set<string>>>;

export function buildPeriodoResumo(
  linhas: LinhaImportada[],
  grouping: CsvSummaryGrouping,
  alunosBanco: AlunosNoBanco
): CsvResumoPeriodo[] {
  const periodos = new Map<string, Map<string, CsvResumoGrupo>>();

  for (const linha of linhas) {
    const dados = linha.dadosOriginais as Record<string, string>;
    const periodo = grouping.periodo(dados) || "(sem período)";
    const grupo = grouping.grupo(dados) || "(sem grupo)";
    const chave = grouping.chave(dados);
    if (!chave) continue;

    if (!periodos.has(periodo)) periodos.set(periodo, new Map());
    const grupos = periodos.get(periodo)!;

    if (!grupos.has(grupo)) {
      grupos.set(grupo, {
        nome: grupo,
        totalCsv: 0,
        totalBanco: 0,
        pendentes: 0,
        status: "ok",
        pendentesDetalhe: [],
      });
    }

    const grupoData = grupos.get(grupo)!;
    grupoData.totalCsv += 1;

    const alunosDoGrupo = alunosBanco.get(periodo)?.get(grupo) ?? new Set();
    const estaNoBanco = alunosDoGrupo.has(chave);
    if (!estaNoBanco) {
      grupoData.pendentes += 1;
      grupoData.pendentesDetalhe?.push({ chave, nome: grouping.nome(dados) });
    }
  }

  for (const [periodo, grupos] of periodos.entries()) {
    for (const grupo of grupos.values()) {
      grupo.totalBanco = alunosBanco.get(periodo)?.get(grupo.nome)?.size ?? 0;
      grupo.status = grupo.pendentes > 0 ? "pendente" : "ok";
      if (grupo.pendentes === 0) {
        grupo.pendentesDetalhe = undefined;
      }
    }
  }

  return Array.from(periodos.entries())
    .map(([periodo, grupos]) => {
      const lista = Array.from(grupos.values()).sort((a, b) =>
        a.nome.localeCompare(b.nome, undefined, { numeric: true })
      );
      const totalCsv = lista.reduce((sum, g) => sum + g.totalCsv, 0);
      const totalBanco = lista.reduce((sum, g) => sum + g.totalBanco, 0);
      const pendentes = lista.reduce((sum, g) => sum + g.pendentes, 0);
      const status = pendentes > 0 ? "pendente" : "ok";

      return {
        periodo,
        grupos: lista,
        resumo: {
          totalGrupos: lista.length,
          totalCsv,
          totalBanco,
          pendentes,
          status,
        },
      };
    })
    .sort((a, b) => b.periodo.localeCompare(a.periodo, undefined, { numeric: true }));
}
