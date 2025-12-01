import type { PrismaClient } from "@prisma/client";
import type { ImportProfile, CsvResumoPeriodo } from "@/lib/importer/csv/types";
import { loadExistingKeys } from "@/lib/importer/csv/existing";
import { buildPeriodoResumo } from "@/lib/importer/csv/summary";

type SummaryAdapterContext = {
  prisma: PrismaClient;
  profile: ImportProfile;
  summaryBuilder?: (
    linhas: Awaited<ReturnType<PrismaClient["linhaImportada"]["findMany"]>>,
    existingKeys: Map<string, Map<string, Set<string>>>,
    profile: ImportProfile
  ) => unknown;
};

type SummaryAdapter = (ctx: SummaryAdapterContext) => Promise<unknown>;

const csvEnturmacoes: SummaryAdapter = async ({ prisma, profile, summaryBuilder }) => {
  const builder = summaryBuilder ?? buildPeriodoResumo;
  const [linhas, existingKeys] = await Promise.all([
    prisma.linhaImportada.findMany({
      where: { tipoEntidade: profile.tipoEntidade, arquivo: { status: "ativo" } },
    }),
    loadExistingKeys(prisma, profile),
  ]);

  const summary = builder(linhas, existingKeys, profile);

  if (!Array.isArray(summary)) return { periodos: summary };
  return {
    periodos: (summary as CsvResumoPeriodo[]).map((resumo) => ({
      anoLetivo: resumo.periodo,
      resumo: {
        totalTurmas: resumo.resumo.totalGrupos,
        totalAlunosCSV: resumo.resumo.totalCsv,
        totalAlunosBanco: resumo.resumo.totalBanco,
        pendentes: resumo.resumo.pendentes,
        status: resumo.resumo.status,
      },
      turmas: resumo.grupos.map((grupo) => ({
        nome: grupo.nome,
        totalAlunosCSV: grupo.totalCsv,
        totalAlunosBanco: grupo.totalBanco,
        pendentes: grupo.pendentes,
        status: grupo.status,
        alunosPendentes: grupo.pendentesDetalhe?.map((aluno) => ({
          matricula: aluno.chave,
          nome: aluno.nome,
        })),
      })),
    })),
  };
};

const chavesDefault: SummaryAdapter = async ({ profile }) => ({
  periodos: [],
  chavesDisponiveis: profile.chavesDisponiveis ?? [],
  pendencias: [],
});

export const summaryAdapters: Record<string, SummaryAdapter> = {
  "csv-enturmacoes": csvEnturmacoes,
  "chaves-default": chavesDefault,
};
