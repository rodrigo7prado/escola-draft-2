import type { Prisma } from "@prisma/client";
import type { ParseResult } from "@/lib/parsers/tipos";

function toStringSafe(v: unknown) {
  if (v === undefined || v === null) return undefined;
  return typeof v === "string" ? v : String(v);
}

export async function persistSeriesHistorico(
  tx: Prisma.TransactionClient,
  params: { parsed: ParseResult; alunoId?: string }
) {
  const { parsed, alunoId } = params;
  if (!alunoId) return { persistido: false, motivo: "alunoId ausente" };

  const aluno = await tx.aluno.findUnique({ where: { id: alunoId } });
  if (!aluno) return { persistido: false, motivo: "aluno não encontrado" };

  for (const serie of parsed.series) {
    const resumo = {
      anoLetivo: toStringSafe(serie.contexto["anoLetivo"] ?? serie.contexto["ANO LETIVO"]),
      periodoLetivo: toStringSafe(serie.contexto["periodoLetivo"] ?? serie.contexto["PERÍODO LETIVO"]),
      curso: toStringSafe(serie.contexto["curso"] ?? serie.contexto["CURSO"]),
      serie: toStringSafe(serie.contexto["serie"] ?? serie.contexto["SÉRIE"]),
      turno: toStringSafe(serie.contexto["turno"] ?? serie.contexto["TURNO"]),
      unidadeEnsino: toStringSafe(serie.contexto["ESCOLA"] ?? serie.contexto["escola"]),
      cargaHorariaTotal: typeof serie.resumo.cargaHorariaTotal === "number" ? serie.resumo.cargaHorariaTotal : undefined,
      frequenciaGlobal: typeof serie.resumo.frequenciaGlobal === "number" ? serie.resumo.frequenciaGlobal : undefined,
      situacaoFinal: toStringSafe(serie.resumo.situacaoFinal),
    };

    const where = {
      alunoMatricula_anoLetivo_periodoLetivo_curso_serie: {
        alunoMatricula: aluno.matricula,
        anoLetivo: resumo.anoLetivo ?? "0000",
        periodoLetivo: resumo.periodoLetivo ?? "0",
        curso: resumo.curso ?? "DESCONHECIDO",
        serie: resumo.serie ?? "DESCONHECIDA",
      },
    };

    const serieRecord = await tx.serieCursada.upsert({
      where,
      create: {
        alunoMatricula: aluno.matricula,
        anoLetivo: resumo.anoLetivo ?? "0000",
        periodoLetivo: resumo.periodoLetivo ?? "0",
        curso: resumo.curso,
        serie: resumo.serie,
        turno: resumo.turno,
        cargaHorariaTotal: resumo.cargaHorariaTotal,
        frequenciaGlobal: resumo.frequenciaGlobal,
        situacaoFinal: resumo.situacaoFinal,
        modalidade: "FICHA_INDIVIDUAL",
        segmento: null,
        unidadeEnsino: resumo.unidadeEnsino,
      },
      update: {
        turno: resumo.turno ?? undefined,
        curso: resumo.curso ?? undefined,
        serie: resumo.serie ?? undefined,
        cargaHorariaTotal: resumo.cargaHorariaTotal ?? undefined,
        frequenciaGlobal: resumo.frequenciaGlobal ?? undefined,
        situacaoFinal: resumo.situacaoFinal ?? undefined,
        unidadeEnsino: resumo.unidadeEnsino ?? undefined,
      },
    });

    await tx.historicoEscolar.deleteMany({
      where: { serieCursadaId: serieRecord.id },
    });

    if (serie.disciplinas.length) {
      await tx.historicoEscolar.createMany({
        data: serie.disciplinas
          .filter((d) => d.componenteCurricular)
          .map((d) => ({
            serieCursadaId: serieRecord.id,
            componenteCurricular: d.componenteCurricular ?? "DESCONHECIDO",
            cargaHoraria: d.cargaHoraria ?? null,
            frequencia: d.frequencia ?? null,
            totalPontos: d.totalPontos ?? null,
            faltasTotais: d.faltasTotais ?? null,
          })),
      });
    }
  }

  return { persistido: true };
}
