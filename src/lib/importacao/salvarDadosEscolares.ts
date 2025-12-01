import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  type DadosEscolaresParseResult,
  type SerieCursadaDTO,
} from "@/lib/parsing/parseDadosEscolares";

interface SalvarDadosEscolaresParams {
  alunoId: string;
  textoBruto: string;
  dados: DadosEscolaresParseResult;
}

/**
 * Persiste dados escolares parseados para um aluno.
 *
 * - Atualiza campos do modelo Aluno
 * - Substitui séries cursadas pelo novo lote parseado
 * - Armazena texto bruto e snapshot dos dados parseados em dadosOriginais
 */
export async function salvarDadosEscolares({
  alunoId,
  textoBruto,
  dados,
}: SalvarDadosEscolaresParams) {
  const aluno = await prisma.aluno.findUnique({
    where: { id: alunoId },
    select: { id: true, matricula: true },
  });

  if (!aluno) {
    throw new Error("Aluno não encontrado");
  }

  await prisma.$transaction(async (tx) => {
    const snapshotDados = {
      ...dados,
      avisos: dados.avisos ?? [],
      importadoEm: new Date().toISOString(),
      tipoImportacao: "dadosEscolares",
    } as unknown as Prisma.InputJsonValue;

    await tx.aluno.update({
      where: { id: aluno.id },
      data: {
        textoBrutoDadosEscolares: textoBruto,
        dataImportacaoTextoDadosEscolares: new Date(),
        situacaoEscolar: dados.alunoInfo.situacao,
        causaEncerramentoEscolar: dados.alunoInfo.causaEncerramento,
        motivoEncerramento: dados.alunoInfo.motivoEncerramento,
        recebeOutroEspacoEscolar: dados.alunoInfo.recebeOutroEspaco,
        anoIngressoEscolar: dados.alunoInfo.anoIngresso,
        periodoIngressoEscolar: dados.alunoInfo.periodoIngresso,
        dataInclusaoIngressoEscolar: dados.alunoInfo.dataInclusao
          ? new Date(dados.alunoInfo.dataInclusao)
          : null,
        tipoIngressoEscolar: dados.alunoInfo.tipoIngresso,
        redeOrigemIngressoEscolar: dados.alunoInfo.redeOrigem,
        matrizCurricularEscolar: dados.alunoInfo.matrizCurricular,
        dadosOriginais: snapshotDados,
      },
    });

    await tx.serieCursada.deleteMany({
      where: { alunoMatricula: aluno.matricula },
    });

    const series: SerieCursadaDTO[] = dados.series ?? [];
    for (const serie of series) {
      await tx.serieCursada.create({
        data: {
          alunoMatricula: aluno.matricula,
          anoLetivo: serie.anoLetivo,
          periodoLetivo: serie.periodoLetivo,
          unidadeEnsino: serie.unidadeEnsino,
          codigoEscola: serie.codigoEscola,
          modalidade: serie.modalidade,
          segmento: serie.segmento,
          curso: serie.curso,
          serie: serie.serie,
          turno: serie.turno,
          situacao: serie.situacao,
          tipoVaga: serie.tipoVaga,
          ensinoReligioso: serie.ensinoReligioso,
          linguaEstrangeira: serie.linguaEstrangeira,
          textoBrutoOrigemId: aluno.id,
        },
      });
    }
  });

  return {
    seriesCriadas: dados.series.length,
  };
}
