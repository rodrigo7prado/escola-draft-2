import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseFichaIndividualHistorico } from "@/lib/parsers/fichaIndividualHistorico/parser";

type SerieResumo = {
  anoLetivo?: string;
  periodoLetivo?: string;
  curso?: string;
  serie?: string;
  turma?: string;
  turno?: string;
  cargaHorariaTotal?: number;
  frequenciaGlobal?: number;
  situacaoFinal?: string;
};

function toStringSafe(v: unknown) {
  if (v === undefined || v === null) return undefined;
  return typeof v === "string" ? v : String(v);
}

function chaveIdentificacao(aluno: Record<string, unknown>) {
  const nome = toStringSafe(aluno["NOME DO ALUNO"]);
  const data = toStringSafe(aluno["DATA DE NASCIMENTO"]);
  if (!nome) return undefined;
  return `${nome}|${data ?? "?"}`;
}

async function persistirSeries(alunoMatricula: string, parsed: Awaited<ReturnType<typeof parseFichaIndividualHistorico>>) {
  return prisma.$transaction(async (tx) => {
    for (const serie of parsed.series) {
      const resumo: SerieResumo = {
        anoLetivo: toStringSafe(serie.contexto["ANO LETIVO"]),
        periodoLetivo: toStringSafe(serie.contexto["PERÍODO LETIVO"]),
        curso: toStringSafe(serie.contexto["CURSO"]),
        serie: toStringSafe(serie.contexto["SÉRIE"]),
        turma: toStringSafe(serie.contexto["TURMA"]),
        turno: toStringSafe(serie.contexto["TURNO"]),
        cargaHorariaTotal: serie.resumo.cargaHorariaTotal,
        frequenciaGlobal: serie.resumo.frequenciaGlobal,
        situacaoFinal: serie.resumo.situacaoFinal,
      };

      const where = {
        alunoMatricula_anoLetivo_periodoLetivo_curso_serie: {
          alunoMatricula,
          anoLetivo: resumo.anoLetivo ?? "0000",
          periodoLetivo: resumo.periodoLetivo ?? "0",
          curso: resumo.curso ?? "DESCONHECIDO",
          serie: resumo.serie ?? "DESCONHECIDA",
        },
      };

      const serieRecord = await tx.serieCursada.upsert({
        where,
        create: {
          alunoMatricula,
          anoLetivo: resumo.anoLetivo ?? "0000",
          periodoLetivo: resumo.periodoLetivo ?? "0",
          curso: resumo.curso,
          serie: resumo.serie,
          turma: resumo.turma,
          turno: resumo.turno,
          cargaHorariaTotal: resumo.cargaHorariaTotal,
          frequenciaGlobal: resumo.frequenciaGlobal,
          situacaoFinal: resumo.situacaoFinal,
          modalidade: "FICHA_INDIVIDUAL",
          segmento: null,
          unidadeEnsino: toStringSafe(serie.contexto["ESCOLA"]),
        },
        update: {
          turma: resumo.turma ?? undefined,
          turno: resumo.turno ?? undefined,
          curso: resumo.curso ?? undefined,
          serie: resumo.serie ?? undefined,
          cargaHorariaTotal: resumo.cargaHorariaTotal ?? undefined,
          frequenciaGlobal: resumo.frequenciaGlobal ?? undefined,
          situacaoFinal: resumo.situacaoFinal ?? undefined,
          unidadeEnsino: toStringSafe(serie.contexto["ESCOLA"]) ?? undefined,
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
  });
}

export async function POST(request: NextRequest) {
  try {
    const form = await request.formData();
    const file = form.get("file");
    const alunoId = form.get("alunoId")?.toString();

    if (!(file instanceof File)) {
      return NextResponse.json({ sucesso: false, erro: "Arquivo ausente" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const hash = crypto.createHash("sha256").update(buffer).digest("hex");

    const duplicado = await prisma.arquivoImportado.findFirst({
      where: { hashArquivo: hash, status: "ativo", tipo: "fichaIndividualHistorico" },
    });

    if (duplicado) {
      return NextResponse.json(
        { sucesso: false, erro: "Arquivo já foi importado", arquivoId: duplicado.id },
        { status: 409 }
      );
    }

    const parsed = await parseFichaIndividualHistorico(buffer);

    let alunoMatricula: string | undefined;
    if (alunoId) {
      const aluno = await prisma.aluno.findUnique({ where: { id: alunoId } });
      if (!aluno) {
        return NextResponse.json({ sucesso: false, erro: "Aluno não encontrado" }, { status: 404 });
      }
      alunoMatricula = aluno.matricula;
    }

    const arquivo = await prisma.arquivoImportado.create({
      data: {
        nomeArquivo: file.name,
        hashArquivo: hash,
        tipo: "fichaIndividualHistorico",
        status: "ativo",
      },
    });

    await prisma.linhaImportada.create({
      data: {
        arquivoId: arquivo.id,
        numeroLinha: 0,
        dadosOriginais: parsed as any,
        identificadorChave: chaveIdentificacao(parsed.aluno),
        tipoEntidade: "fichaIndividualHistorico",
      },
    });

    if (alunoMatricula) {
      await persistirSeries(alunoMatricula, parsed);
    }

    return NextResponse.json({
      sucesso: true,
      arquivoId: arquivo.id,
      parsed,
      persistido: Boolean(alunoMatricula),
    });
  } catch (error) {
    console.error("[importacao-ficha-individual-historico] erro:", error);
    return NextResponse.json(
      { sucesso: false, erro: error instanceof Error ? error.message : "Erro interno" },
      { status: 500 }
    );
  }
}
