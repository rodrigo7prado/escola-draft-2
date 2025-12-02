import type { PrismaClient } from "@prisma/client";
import { extractContext } from "@/lib/importer/pipelines/csv/extract";
import { ImportProfile } from "./types";

export async function deleteArquivoPorId(prisma: PrismaClient, id: string, profile: ImportProfile) {
  const linhas = await prisma.linhaImportada.findMany({
    where: { arquivoId: id },
    select: { id: true },
  });
  const linhasIds = linhas.map((l) => l.id);

  await prisma.$transaction(async (tx) => {
    // Remover enturmações e alunos originados destas linhas
    await tx.enturmacao.deleteMany({
      where: { linhaOrigemId: { in: linhasIds }, origemTipo: "csv" },
    });
    await tx.aluno.deleteMany({
      where: { linhaOrigemId: { in: linhasIds }, origemTipo: "csv" },
    });

    // Remover linhas e arquivo
    await tx.linhaImportada.deleteMany({ where: { id: { in: linhasIds } } });
    await tx.arquivoImportado.delete({ where: { id } });
  });

  return { alunosMarcados: linhasIds.length };
}

export async function deleteArquivosPorPeriodo(
  prisma: PrismaClient,
  periodo: string,
  profile: ImportProfile
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

  const result = await prisma.$transaction(async (tx) => {
    await tx.enturmacao.deleteMany({
      where: { linhaOrigemId: { in: linhasIdsDoPeriodo }, origemTipo: "csv" },
    });
    await tx.aluno.deleteMany({
      where: { linhaOrigemId: { in: linhasIdsDoPeriodo }, origemTipo: "csv" },
    });
    await tx.linhaImportada.deleteMany({
      where: { id: { in: linhasIdsDoPeriodo } },
    });
    const deleted = await tx.arquivoImportado.deleteMany({
      where: { id: { in: Array.from(arquivoIds) } },
    });
    return deleted;
  });

  return {
    arquivosDeletados: result.count,
    linhasDeletadas: linhasIdsDoPeriodo.length,
  };
}
