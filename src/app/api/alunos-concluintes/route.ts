import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const SITUACAO_FINAL_APROVADO = "APROVADO";
const CANCELAMENTO_MATCH = /cancel/i;

type EnturmacaoFiltro = {
  anoLetivo?: string;
  modalidade?: string;
  turma?: string;
  serie?: string;
};

type AlunoResumo = {
  id: string;
  matricula: string;
  nome: string | null;
  enturmacoes: Array<{
    anoLetivo: string;
    modalidade: string | null;
    turma: string;
    serie: string;
  }>;
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const anoLetivo = searchParams.get("anoLetivo") ?? undefined;
    const modalidade = searchParams.get("modalidade") ?? undefined;
    const turma = searchParams.get("turma") ?? undefined;
    const serie = searchParams.get("serie") ?? undefined;
    const busca = searchParams.get("busca") ?? undefined;

    const filtroEnturmacao: EnturmacaoFiltro = {};
    if (anoLetivo) filtroEnturmacao.anoLetivo = anoLetivo;
    if (modalidade) filtroEnturmacao.modalidade = modalidade;
    if (turma) filtroEnturmacao.turma = turma;
    if (serie) filtroEnturmacao.serie = serie;

    const whereClause: any = {};

    if (Object.keys(filtroEnturmacao).length > 0) {
      whereClause.enturmacoes = { some: filtroEnturmacao };
    }

    const termoBusca = busca?.trim();
    if (termoBusca) {
      const termoSemCoringa = termoBusca.replace(/\*/g, "");
      if (termoSemCoringa) {
        whereClause.OR = [
          { nome: { contains: termoSemCoringa, mode: "insensitive" } },
          { matricula: { contains: termoSemCoringa } },
        ];
      }
    }

    const alunos = await prisma.aluno.findMany({
      where: whereClause,
      orderBy: [{ nome: "asc" }],
      select: {
        id: true,
        matricula: true,
        nome: true,
        situacaoEscolar: true,
        motivoEncerramento: true,
        causaEncerramentoEscolar: true,
        enturmacoes: {
          where:
            Object.keys(filtroEnturmacao).length > 0
              ? filtroEnturmacao
              : undefined,
          orderBy: [{ anoLetivo: "desc" }],
          select: {
            anoLetivo: true,
            modalidade: true,
            turma: true,
            serie: true,
          },
        },
        seriesCursadas: {
          select: {
            anoLetivo: true,
            serie: true,
            situacaoFinal: true,
          },
        },
      },
    });

    const maxSeriePorModalidadeAno = new Map<string, string>();
    alunos.forEach((aluno) => {
      aluno.enturmacoes.forEach((enturmacao) => {
        const chave = montarChaveSerie(enturmacao.anoLetivo, enturmacao.modalidade);
        const serieAtual = maxSeriePorModalidadeAno.get(chave);
        if (!serieAtual || compararSerie(enturmacao.serie, serieAtual) > 0) {
          maxSeriePorModalidadeAno.set(chave, enturmacao.serie);
        }
      });
    });

    const concluintes: AlunoResumo[] = [];
    const pendentes: AlunoResumo[] = [];

    alunos.forEach((aluno) => {
      const enturmacoesUltimaSerie = aluno.enturmacoes.filter((enturmacao) => {
        const chave = montarChaveSerie(enturmacao.anoLetivo, enturmacao.modalidade);
        const serieFinal = maxSeriePorModalidadeAno.get(chave);
        return serieFinal ? compararSerie(enturmacao.serie, serieFinal) === 0 : false;
      });

      if (enturmacoesUltimaSerie.length === 0) {
        return;
      }

      const isCancelado = [
        aluno.situacaoEscolar,
        aluno.motivoEncerramento,
        aluno.causaEncerramentoEscolar,
      ].some((valor) => (valor ? CANCELAMENTO_MATCH.test(valor) : false));

      const isConcluinte = aluno.seriesCursadas.some((serie) =>
        serie.situacaoFinal === SITUACAO_FINAL_APROVADO &&
        enturmacoesUltimaSerie.some(
          (enturmacao) =>
            enturmacao.anoLetivo === serie.anoLetivo &&
            enturmacao.serie === serie.serie
        )
      );

      const payload = {
        id: aluno.id,
        matricula: aluno.matricula,
        nome: aluno.nome,
        enturmacoes: enturmacoesUltimaSerie,
      };

      if (isCancelado) {
        return;
      }

      if (isConcluinte) {
        concluintes.push(payload);
        return;
      }

      pendentes.push(payload);
    });

    concluintes.sort((a, b) =>
      (a.nome ?? "").localeCompare(b.nome ?? "", undefined, {
        sensitivity: "base",
      })
    );
    pendentes.sort((a, b) =>
      (a.nome ?? "").localeCompare(b.nome ?? "", undefined, {
        sensitivity: "base",
      })
    );

    return NextResponse.json({ concluintes, pendentes });
  } catch (error) {
    console.error("Erro ao buscar alunos concluintes:", error);
    return NextResponse.json(
      { error: "Erro ao buscar alunos concluintes" },
      { status: 500 }
    );
  }
}

function montarChaveSerie(anoLetivo: string, modalidade: string | null) {
  const modalidadeKey = modalidade ?? "SEM_MODALIDADE";
  return `${anoLetivo}::${modalidadeKey}`;
}

function compararSerie(serieA: string, serieB: string) {
  const numeroA = extrairNumeroSerie(serieA);
  const numeroB = extrairNumeroSerie(serieB);

  if (numeroA !== null && numeroB !== null) {
    return numeroA - numeroB;
  }

  if (numeroA !== null) return 1;
  if (numeroB !== null) return -1;

  return serieA.localeCompare(serieB, undefined, { numeric: true });
}

function extrairNumeroSerie(serie: string) {
  const match = serie.match(/\d+/);
  if (!match) return null;
  const valor = Number(match[0]);
  return Number.isNaN(valor) ? null : valor;
}
