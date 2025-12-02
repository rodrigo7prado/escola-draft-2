import type { PrismaClient } from "@prisma/client";
import type { ImportProfile, CsvResumoPeriodo } from "@/lib/importer/pipelines/csv/types";
import { loadExistingKeys, buildPeriodoResumo } from "@/lib/importer/profiles/ataResultadosFinais/summary";

type SummaryAdapterContext = {
  prisma: PrismaClient;
  profile: ImportProfile;
};

export async function summaryCsvEnturmacoes({ prisma, profile }: SummaryAdapterContext) {
  const [linhas, existingKeys] = await Promise.all([
    prisma.linhaImportada.findMany({
      where: { tipoEntidade: profile.tipoEntidade, arquivo: { status: "ativo" } },
    }),
    loadExistingKeys(prisma, profile),
  ]);

  const summary = buildPeriodoResumo(linhas, existingKeys, profile);
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
}

export function summaryChavesDefault(profile: ImportProfile) {
  return {
    periodos: [],
    chavesDisponiveis: profile.chavesDisponiveis ?? [],
    pendencias: [],
  };
}
