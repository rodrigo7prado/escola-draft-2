import type { PrismaClient } from "@prisma/client";
import type { CsvProfile } from "@/lib/importer/csv/types";
import { extractContext } from "@/lib/importer/csv/extract";

export async function deleteArquivoPorId(prisma: PrismaClient, id: string) {
  const linhas = await prisma.linhaImportada.findMany({
    where: { arquivoId: id },
    select: { id: true },
  });
  const linhasIds = linhas.map((l) => l.id);

  await prisma.$transaction([
    prisma.aluno.updateMany({
      where: { linhaOrigemId: { in: linhasIds }, origemTipo: "csv" },
      data: { fonteAusente: true },
    }),
    prisma.enturmacao.updateMany({
      where: { linhaOrigemId: { in: linhasIds }, origemTipo: "csv" },
      data: { fonteAusente: true },
    }),
  ]);

  await prisma.arquivoImportado.delete({ where: { id } });

  return { alunosMarcados: linhasIds.length };
}

export async function deleteArquivosPorPeriodo(
  prisma: PrismaClient,
  periodo: string,
  profile: CsvProfile
) {
  const linhas = await prisma.linhaImportada.findMany({
    where: { tipoEntidade: profile.tipoEntidade, arquivo: { status: "ativo" } },
    select: { id: true, arquivoId: true, dadosOriginais: true },
  });

  const arquivoIds = new Set<string>();
  const linhasIdsDoPeriodo: string[] = [];

  for (const linha of linhas) {
    const dados = linha.dadosOriginais as Record<string, string>;
    const ctx = extractContext(dados, profile);
    if (ctx.periodo === periodo) {
      arquivoIds.add(linha.arquivoId);
      linhasIdsDoPeriodo.push(linha.id);
    }
  }

  if (arquivoIds.size === 0) {
    return { arquivosDeletados: 0, linhasDeletadas: 0 };
  }

  await prisma.$transaction([
    prisma.aluno.updateMany({
      where: { linhaOrigemId: { in: linhasIdsDoPeriodo }, origemTipo: "csv" },
      data: { fonteAusente: true },
    }),
    prisma.enturmacao.updateMany({
      where: { linhaOrigemId: { in: linhasIdsDoPeriodo }, origemTipo: "csv" },
      data: { fonteAusente: true },
    }),
  ]);

  const result = await prisma.arquivoImportado.deleteMany({
    where: { id: { in: Array.from(arquivoIds) } },
  });

  return {
    arquivosDeletados: result.count,
    linhasDeletadas: linhasIdsDoPeriodo.length,
  };
}
