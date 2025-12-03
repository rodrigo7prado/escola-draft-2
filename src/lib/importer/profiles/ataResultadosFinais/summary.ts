import type { LinhaImportada, PrismaClient } from "@prisma/client";
import { extractContext, extractField, extractName } from "@/lib/importer/profiles/ataResultadosFinais/context";
import type { CsvResumoGrupo, CsvResumoPeriodo, ImportProfile } from "@/lib/importer/pipelines/csv/types";
import { resolveDuplicateKey, resolveDisplayName } from "@/lib/importer/utils/fieldResolvers";

type AlunosNoBanco = Map<string, Map<string, Set<string>>>;
type ReferenceKeysLoader = (prisma: PrismaClient, profile: ImportProfile) => Promise<AlunosNoBanco>;

export function buildPeriodoResumo(
  linhas: LinhaImportada[],
  alunosBanco: AlunosNoBanco,
  profile: ImportProfile
): CsvResumoPeriodo[] {
  const duplicateKey = resolveDuplicateKey(profile);
  const displayName = resolveDisplayName(profile);
  const periodos = new Map<string, Map<string, CsvResumoGrupo>>();

  for (const linha of linhas) {
    const dados = linha.dadosOriginais as Record<string, string>;
    const ctx = extractContext(dados, profile);
    const chave = extractField(dados, duplicateKey);
    if (!chave) continue;
    const nome = extractName(dados, displayName);
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

const referenceKeyLoaders: Record<string, ReferenceKeysLoader> = {
  "enturmacoes-por-turma": async (prisma) => {
    const enturmacoes = await prisma.enturmacao.findMany({
      select: {
        anoLetivo: true,
        turma: true,
        aluno: { select: { matricula: true } },
      },
    });
    return mapearAlunosBanco(enturmacoes);
  },
  none: async () => new Map(),
};

export async function loadExistingKeys(prisma: PrismaClient, profile: ImportProfile): Promise<AlunosNoBanco> {
  const source = profile.summaryDeleteKeysSource ?? "enturmacoes-por-turma";
  const loader = referenceKeyLoaders[source];
  if (!loader) {
    throw new Error(`Fonte de chaves de resumo/delete não suportada: ${source}`);
  }
  return loader(prisma, profile);
}
