import type { LinhaImportada, PrismaClient } from "@prisma/client";
import { extractContext, extractField, extractName } from "@/lib/importer/profiles/ataResultadosFinais/context";
import type { CsvResumoGrupo, CsvResumoPeriodo, ImportProfile } from "@/lib/importer/pipelines/csv/types";

type AlunosNoBanco = Map<string, Map<string, Set<string>>>;

export function buildPeriodoResumo(
  linhas: LinhaImportada[],
  alunosBanco: AlunosNoBanco,
  profile: ImportProfile
): CsvResumoPeriodo[] {
  const periodos = new Map<string, Map<string, CsvResumoGrupo>>();

  for (const linha of linhas) {
    const dados = linha.dadosOriginais as Record<string, string>;
    const ctx = extractContext(dados, profile);
    const chave = extractField(dados, profile.duplicateKey);
    if (!chave) continue;
    const nome = extractName(dados, profile.displayName);
    const periodo = ctx.periodo || "(sem período)";
    const grupo = ctx.grupo || "(sem grupo)";

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
    if (!alunosDoGrupo.has(chave)) {
      grupoData.pendentes += 1;
      grupoData.pendentesDetalhe?.push({ chave, nome });
    }
  }

  for (const [periodo, grupos] of periodos.entries()) {
    for (const grupo of grupos.values()) {
      grupo.totalBanco = alunosBanco.get(periodo)?.get(grupo.nome)?.size ?? 0;
      grupo.status = grupo.pendentes > 0 ? "pendente" : "ok";
      if (grupo.pendentes === 0) grupo.pendentesDetalhe = undefined;
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
      const status: CsvResumoPeriodo["resumo"]["status"] =
        pendentes > 0 ? "pendente" : "ok";

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
    .sort((a, b) =>
      b.periodo.localeCompare(a.periodo, undefined, { numeric: true })
    );
}

export function mapearAlunosBanco(
  enturmacoes: { anoLetivo: string; turma: string; aluno: { matricula: string } }[]
): AlunosNoBanco {
  const mapa = new Map<string, Map<string, Set<string>>>();

  for (const ent of enturmacoes) {
    if (!mapa.has(ent.anoLetivo)) mapa.set(ent.anoLetivo, new Map());
    const turmas = mapa.get(ent.anoLetivo)!;
    if (!turmas.has(ent.turma)) turmas.set(ent.turma, new Set());
    turmas.get(ent.turma)!.add(ent.aluno.matricula);
  }

  return mapa;
}

export async function loadExistingKeys(
  prisma: PrismaClient,
  profile: ImportProfile
): Promise<AlunosNoBanco> {
  // Perfil-ata: sempre compara com enturmações
  const enturmacoes = await prisma.enturmacao.findMany({
    select: {
      anoLetivo: true,
      turma: true,
      aluno: { select: { matricula: true } },
    },
  });
  return mapearAlunosBanco(enturmacoes);
}
