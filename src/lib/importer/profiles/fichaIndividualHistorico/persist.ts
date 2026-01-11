import type { Prisma } from "@prisma/client";
import type { ParseResult } from "@/lib/parsers/tipos";
import { ImportValidationError } from "@/lib/importer/errors";

function toStringSafe(v: unknown) {
  if (v === undefined || v === null) return undefined;
  return typeof v === "string" ? v : String(v);
}

function isLinhaSituacaoFinal(texto?: string | null) {
  if (!texto) return false;
  const normalized = texto
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toUpperCase();
  return normalized.includes("A VISTA DOS RESULTADOS OBTIDOS O(A) ALUNO(A) FOI CONSIDERADO(A)");
}

function normalizarNome(nome?: string | null) {
  return (nome ?? "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^A-Za-z0-9 ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toUpperCase();
}

function nomesConferem(a?: string | null, b?: string | null) {
  return normalizarNome(a) === normalizarNome(b);
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

  const nomeArquivo = toStringSafe((parsed as any)?.aluno?.nome);
  const nomeAluno = toStringSafe(aluno.nome);
  if (!nomeArquivo || !nomeAluno) {
    throw new ImportValidationError(
      "Não foi possível validar o nome do aluno. Verifique se o arquivo e o cadastro possuem o nome preenchido."
    );
  }

  if (!nomesConferem(nomeArquivo, nomeAluno)) {
    throw new ImportValidationError(
      `O nome no arquivo (${nomeArquivo}) não corresponde ao aluno de matrícula ${aluno.matricula} (${nomeAluno}).`
    );
  }

  const historicosPorSerieId = new Map<
    string,
    { disciplinas: Array<Prisma.HistoricoEscolarCreateManyInput>; sheets: number[] }
  >();

  for (const [idx, serie] of parsed.series.entries()) {
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

    if (debugImport) {
      console.info("[persist:fichaHistorico] resumo situacaoFinal", {
        sheetIndex: idx,
        situacaoFinalRaw: serie.resumo.situacaoFinal,
        situacaoFinalNormalized: resumo.situacaoFinal,
      });
      if (!resumo.situacaoFinal) {
        console.warn("[persist:fichaHistorico] situacaoFinal ausente no resumo", { sheetIndex: idx });
      }
    }

    if (!resumo.anoLetivo || !resumo.periodoLetivo || !resumo.curso || !resumo.serie) {
      throw new Error("Contexto incompleto para localizar série (ano/periodo/curso/serie)");
    }

    const segmentoPlanilha = resumo.curso as string;
    const chave = {
      alunoMatricula: aluno.matricula,
      anoLetivo: resumo.anoLetivo as string,
      periodoLetivo: resumo.periodoLetivo as string,
    };

    if (debugImport) {
      console.info("[persist:fichaHistorico] matching sheet", {
        alunoMatricula: aluno.matricula,
        sheetIndex: idx,
        anoLetivo: chave.anoLetivo,
        periodoLetivo: chave.periodoLetivo,
        segmento: segmentoPlanilha,
        serieArquivo: resumo.serie,
        turno: resumo.turno,
        escola: resumo.unidadeEnsino,
      });
    }

    // Busca somente por matricula + ano + periodo
    const candidatos = await tx.serieCursada.findMany({
      where: {
        alunoMatricula: chave.alunoMatricula,
        anoLetivo: chave.anoLetivo,
        periodoLetivo: chave.periodoLetivo,
      },
      orderBy: { atualizadoEm: "desc" },
    });
    let existente = candidatos[0];
    if (candidatos.length > 1) {
      console.warn(
        `Múltiplas séries encontradas para ${chave.anoLetivo}/${chave.periodoLetivo} (matrícula ${chave.alunoMatricula}). Usando a primeira.`
      );
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
      if (debugImport) {
        console.info("[persist:fichaHistorico] criando nova serieCursada", {
          alunoMatricula: aluno.matricula,
          anoLetivo: resumo.anoLetivo,
          periodoLetivo: resumo.periodoLetivo,
          curso: resumo.curso,
          serie: resumo.serie,
        });
      }
      const novaSerie = await tx.serieCursada.create({
        data: {
          alunoMatricula: aluno.matricula,
          anoLetivo: resumo.anoLetivo as string,
          periodoLetivo: resumo.periodoLetivo as string,
          curso: resumo.curso ?? undefined,
          serie: resumo.serie ?? undefined,
          segmento: segmentoPlanilha ?? undefined,
          turno: resumo.turno ?? undefined,
          unidadeEnsino: resumo.unidadeEnsino ?? undefined,
          cargaHorariaTotal: resumo.cargaHorariaTotal ?? undefined,
          frequenciaGlobal: resumo.frequenciaGlobal ?? undefined,
          situacaoFinal: resumo.situacaoFinal ?? undefined,
        },
      });
      existente = novaSerie;
    }

    if (debugImport) {
      console.info("[persist:fichaHistorico] serie encontrada", {
        alunoMatricula: aluno.matricula,
        id: existente.id,
        segmentoAtual: existente.segmento,
        cursoAtual: existente.curso,
        serieAtual: existente.serie,
        atualizarParaSegmento: segmentoPlanilha,
        sheetIndex: idx,
      });
      console.info("[persist:fichaHistorico] update situacaoFinal", {
        serieId: existente.id,
        situacaoFinalAtual: existente.situacaoFinal,
        situacaoFinalNova: resumo.situacaoFinal,
      });
    }

    const serieRecord = await tx.serieCursada.update({
      where: { id: existente.id },
      data: {
        anoLetivo: resumo.anoLetivo as string,
        periodoLetivo: resumo.periodoLetivo as string,
        curso: resumo.curso ?? undefined,
        serie: resumo.serie ?? undefined,
        segmento: segmentoPlanilha ?? undefined,
        turno: resumo.turno ?? undefined,
        cargaHorariaTotal: resumo.cargaHorariaTotal ?? undefined,
        frequenciaGlobal: resumo.frequenciaGlobal ?? undefined,
        situacaoFinal: resumo.situacaoFinal ?? undefined,
        unidadeEnsino: resumo.unidadeEnsino ?? undefined,
      },
    });

    const disciplinasSheet = serie.disciplinas
      .filter((d) => d.componenteCurricular && !isLinhaSituacaoFinal(d.componenteCurricular))
      .map((d) => ({
        serieCursadaId: serieRecord.id,
        componenteCurricular: d.componenteCurricular ?? "DESCONHECIDO",
        cargaHoraria: d.cargaHoraria ?? null,
        frequencia: d.frequencia ?? null,
        totalPontos: d.totalPontos ?? null,
        faltasTotais: d.faltasTotais ?? null,
      }));

    if (!historicosPorSerieId.has(serieRecord.id)) {
      historicosPorSerieId.set(serieRecord.id, { disciplinas: [], sheets: [] });
    }
    const agregado = historicosPorSerieId.get(serieRecord.id)!;
    agregado.disciplinas.push(...disciplinasSheet);
    agregado.sheets.push(idx);
  }

  // Persistir disciplinas acumuladas por série (não sobrepor entre sheets)
  for (const [serieId, payload] of historicosPorSerieId.entries()) {
    await tx.historicoEscolar.deleteMany({ where: { serieCursadaId: serieId } });
    if (payload.disciplinas.length) {
      await tx.historicoEscolar.createMany({ data: payload.disciplinas });
    }
    if (debugImport) {
      console.info("[persist:fichaHistorico] disciplinas acumuladas", {
        serieCursadaId: serieId,
        totalDisciplinas: payload.disciplinas.length,
        sheetsOrigem: payload.sheets,
      });
    }
  }

  return { persistido: true };
}
