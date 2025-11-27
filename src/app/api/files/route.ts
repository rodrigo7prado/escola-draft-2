import { NextRequest, NextResponse } from "next/server";
import type { ParsedCsv } from "@/lib/hash";
import { prisma } from "@/lib/prisma";
import { runCsvImport } from "@/lib/importer/csv/pipeline";
import { DuplicateFileError, type CsvResumoPeriodo } from "@/lib/importer/csv/types";
import { alunoCsvAdapter } from "@/lib/importer/adapters/alunoCsvAdapter";
import { deleteArquivoPorId, deleteArquivosPorPeriodo } from "@/lib/importer/alunoDelete";
import { mapearAlunosBanco, resumirAlunosPorPeriodo } from "@/lib/importer/alunoResumo";

const TRANSACTION_OPTIONS = {
  maxWait: 10000,
  timeout: 60000,
};

function mapResumoParaUi(resumo: CsvResumoPeriodo) {
  return {
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
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { data, fileName } = body as { data: ParsedCsv; fileName: string };

    if (!data || !fileName) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
    }

    const resultado = await runCsvImport({
      prisma,
      data,
      fileName,
      adapter: alunoCsvAdapter,
      transactionOptions: TRANSACTION_OPTIONS,
    });

    return NextResponse.json(
      {
        arquivo: resultado.arquivo,
        linhasImportadas: resultado.linhasImportadas,
        ...resultado.domain,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof DuplicateFileError) {
      return NextResponse.json(
        { error: error.message, fileId: error.fileId },
        { status: 409 }
      );
    }
    console.error("Erro ao fazer upload:", error);
    return NextResponse.json(
      { error: "Erro ao processar arquivo" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const linhas = await prisma.linhaImportada.findMany({
      where: { tipoEntidade: "aluno", arquivo: { status: "ativo" } },
    });

    const enturmacoes = await prisma.enturmacao.findMany({
      select: {
        anoLetivo: true,
        turma: true,
        aluno: { select: { matricula: true } },
      },
    });

    const alunosBanco = mapearAlunosBanco(enturmacoes);
    const periodosResumo = resumirAlunosPorPeriodo(linhas, alunosBanco);

    return NextResponse.json({
      periodos: periodosResumo.map(mapResumoParaUi),
    });
  } catch (error) {
    console.error("Erro ao listar arquivos:", error);
    return NextResponse.json(
      { error: "Erro ao listar arquivos" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const periodo = searchParams.get("periodo");

    if (!id && !periodo) {
      return NextResponse.json(
        { error: "Parâmetro id ou periodo é obrigatório" },
        { status: 400 }
      );
    }

    if (id) {
      const resultado = await deleteArquivoPorId(prisma, id);
      return NextResponse.json({
        message: "Arquivo deletado e entidades marcadas como fonte ausente",
        ...resultado,
      });
    }

    const resultado = await deleteArquivosPorPeriodo(prisma, periodo!);
    if (resultado.arquivosDeletados === 0) {
      return NextResponse.json({
        message: `Nenhum arquivo do período ${periodo} encontrado`,
      });
    }

    return NextResponse.json({
      message: `${resultado.arquivosDeletados} arquivo(s) do período ${periodo} deletado(s) e entidades marcadas como fonte ausente`,
      ...resultado,
    });
  } catch (error) {
    console.error("Erro ao excluir arquivo:", error);
    return NextResponse.json(
      { error: "Erro ao excluir arquivo" },
      { status: 500 }
    );
  }
}
