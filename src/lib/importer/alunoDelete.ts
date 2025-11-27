import type { PrismaClient } from "@prisma/client";
import { limparValor } from "@/lib/csv";

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

export async function deleteArquivosPorPeriodo(prisma: PrismaClient, periodo: string) {
  const linhas = await prisma.linhaImportada.findMany({
    where: { tipoEntidade: "aluno", arquivo: { status: "ativo" } },
    select: { id: true, arquivoId: true, dadosOriginais: true },
  });

  const arquivoIds = new Set<string>();
  const linhasIdsDoPeriodo: string[] = [];

  for (const linha of linhas) {
    const dados = linha.dadosOriginais as any;
    const anoLetivo =
      limparValor(dados.Ano, "Ano Letivo:") || limparValor(dados.Ano, "Ano:");
    if (anoLetivo === periodo) {
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

  const arquivosDeletados = await prisma.arquivoImportado.deleteMany({
    where: { id: { in: Array.from(arquivoIds) } },
  });

  return {
    arquivosDeletados: arquivosDeletados.count,
    linhasDeletadas: linhasIdsDoPeriodo.length,
  };
}
