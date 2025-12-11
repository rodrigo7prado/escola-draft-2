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
  const debugImport = process.env.DEBUG_IMPORT === "true";
  const { parsed, alunoId } = params;
  if (!alunoId) return { persistido: false, motivo: "alunoId ausente" };

  const aluno = await tx.aluno.findUnique({ where: { id: alunoId } });
  if (!aluno) return { persistido: false, motivo: "aluno não encontrado" };

  const seriesNaoEncontradas: Array<{
    anoLetivo?: string;
    periodoLetivo?: string;
    curso?: string;
    serie?: string;
  }> = [];

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

    if (!resumo.anoLetivo || !resumo.periodoLetivo || !resumo.curso || !resumo.serie) {
      throw new Error("Contexto incompleto para localizar série (ano/periodo/curso/serie)");
    }

    const segmentoPlanilha = resumo.curso as string;
    const chave = {
      alunoMatricula: aluno.matricula,
      anoLetivo: resumo.anoLetivo as string,
      periodoLetivo: resumo.periodoLetivo as string,
      segmento: segmentoPlanilha,
    };

    if (debugImport) {
      console.info("[persist:fichaHistorico] matching serie", {
        alunoMatricula: aluno.matricula,
        anoLetivo: chave.anoLetivo,
        periodoLetivo: chave.periodoLetivo,
        segmento: chave.segmento,
        serieArquivo: resumo.serie,
        turno: resumo.turno,
        escola: resumo.unidadeEnsino,
      });
    }

    // Tentar busca exata primeiro
    let existente = await tx.serieCursada.findFirst({
      where: {
        alunoMatricula: chave.alunoMatricula,
        anoLetivo: chave.anoLetivo,
        periodoLetivo: chave.periodoLetivo,
        segmento: chave.segmento,
      },
    });

    // Se não encontrar, tentar busca por ano/periodo com segmento NULL
    if (!existente) {
      const candidatos = await tx.serieCursada.findMany({
        where: {
          alunoMatricula: aluno.matricula,
          anoLetivo: chave.anoLetivo,
          periodoLetivo: chave.periodoLetivo,
          OR: [
            { segmento: null },
            { segmento: "" },
          ],
        },
      });

      if (candidatos.length === 1) {
        existente = candidatos[0];
        console.log(
          `Série encontrada com segmento NULL, atualizando para: ${chave.segmento}`
        );
      } else if (candidatos.length > 1) {
        console.warn(
          `Múltiplas séries com segmento NULL encontradas para ${chave.anoLetivo}/${chave.periodoLetivo}. Usando a primeira.`
        );
        existente = candidatos[0];
      }
    }

    if (!existente) {
      console.warn("Série não encontrada. Buscando:", {
        ...chave,
        cursoArquivo: resumo.curso,
        serieArquivo: resumo.serie,
      });
      const seriesDoAluno = await tx.serieCursada.findMany({
        where: { alunoMatricula: chave.alunoMatricula },
        select: {
          alunoMatricula: true,
          segmento: true,
          anoLetivo: true,
          periodoLetivo: true,
          curso: true,
          serie: true,
        },
      });
      console.warn(
        `Séries existentes no banco para o aluno ${chave.alunoMatricula}:`,
        seriesDoAluno
      );
      seriesNaoEncontradas.push(chave);
      continue;
    }

    if (debugImport) {
      console.info("[persist:fichaHistorico] serie encontrada", {
        alunoMatricula: aluno.matricula,
        id: existente.id,
        segmentoAtual: existente.segmento,
        cursoAtual: existente.curso,
        serieAtual: existente.serie,
        atualizarParaSegmento: segmentoPlanilha,
      });
    }

    const serieRecord = await tx.serieCursada.update({
      where: { id: existente.id },
      data: {
        segmento: segmentoPlanilha ?? undefined,
        turno: resumo.turno ?? undefined,
        cargaHorariaTotal: resumo.cargaHorariaTotal ?? undefined,
        frequenciaGlobal: resumo.frequenciaGlobal ?? undefined,
        situacaoFinal: resumo.situacaoFinal ?? undefined,
        unidadeEnsino: resumo.unidadeEnsino ?? undefined,
      },
    });

    // Regrava disciplinas: remove existentes e insere as novas
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

  if (seriesNaoEncontradas.length) {
    console.warn("Séries não encontradas para atualização:", seriesNaoEncontradas);
    throw new Error(`Séries não encontradas para atualização (${seriesNaoEncontradas.length})`);
  }

  return { persistido: true };
}
