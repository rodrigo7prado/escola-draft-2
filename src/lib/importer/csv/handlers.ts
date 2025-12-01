import { NextResponse, type NextRequest } from "next/server";
import type { ParsedCsv } from "@/lib/hash";
import type { PrismaClient } from "@prisma/client";
import { runCsvImport } from "@/lib/importer/csv/pipeline";
import { buildPeriodoResumo } from "@/lib/importer/csv/summary";
import { loadExistingKeys } from "@/lib/importer/csv/existing";
import { deleteArquivoPorId, deleteArquivosPorPeriodo } from "@/lib/importer/csv/delete";
import { DuplicateFileError, type ImportProfile, type CsvResumoPeriodo } from "@/lib/importer/csv/types";

type ImportCsvConfig = {
  prisma: PrismaClient;
  profile: ImportProfile;
  transactionOptions?: Parameters<PrismaClient["$transaction"]>[1];
  deleteScopes?: {
    byId?: boolean;
    byPeriod?: boolean;
    periodParam?: string;
  };
  summaryBuilder?: (
    linhas: Awaited<ReturnType<PrismaClient["linhaImportada"]["findMany"]>>,
    existingKeys: Map<string, Map<string, Set<string>>>,
    profile: ImportProfile
  ) => unknown;
  summarySerializer?: (summary: unknown) => unknown;
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

export function createImportRouteHandlers(config: ImportCsvConfig) {
  const { prisma, profile, transactionOptions } = config;
  const deleteById = config.deleteScopes?.byId ?? true;
  const deleteByPeriod = config.deleteScopes?.byPeriod ?? false;
  const periodParam = config.deleteScopes?.periodParam ?? "periodo";
  const summaryBuilder = config.summaryBuilder ?? buildPeriodoResumo;
  const summarySerializer =
    config.summarySerializer ??
    ((summary: unknown) => ({
      periodos: Array.isArray(summary)
        ? (summary as CsvResumoPeriodo[]).map(mapResumoParaUi)
        : summary,
    }));

  return {
    POST: async (request: NextRequest) => {
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
          profile,
          transactionOptions,
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
    },

    GET: async () => {
      try {
        const [linhas, existingKeys] = await Promise.all([
          prisma.linhaImportada.findMany({
            where: { tipoEntidade: profile.tipoEntidade, arquivo: { status: "ativo" } },
          }),
          loadExistingKeys(prisma, profile),
        ]);

        const summary = summaryBuilder(linhas, existingKeys, profile);

        return NextResponse.json(summarySerializer(summary));
      } catch (error) {
        console.error("Erro ao listar arquivos:", error);
        return NextResponse.json(
          { error: "Erro ao listar arquivos" },
          { status: 500 }
        );
      }
    },

    DELETE: async (request: NextRequest) => {
      try {
        const { searchParams } = new URL(request.url);
        const id = deleteById ? searchParams.get("id") : null;
        const periodo = deleteByPeriod ? searchParams.get(periodParam) : null;

        if (!id && !periodo) {
          return NextResponse.json(
            { error: "Parâmetro de exclusão obrigatório não informado" },
            { status: 400 }
          );
        }

        if (id && deleteById) {
          const resultado = await deleteArquivoPorId(prisma, id, profile);
          return NextResponse.json({
            message: "Arquivo deletado e entidades marcadas como fonte ausente",
            ...resultado,
          });
        }

        if (periodo && deleteByPeriod) {
          const resultado = await deleteArquivosPorPeriodo(prisma, periodo, profile);
          if (resultado.arquivosDeletados === 0) {
            return NextResponse.json({
              message: `Nenhum arquivo do período ${periodo} encontrado`,
            });
          }

          return NextResponse.json({
            message: `${resultado.arquivosDeletados} arquivo(s) do período ${periodo} deletado(s) e entidades marcadas como fonte ausente`,
            ...resultado,
          });
        }

        return NextResponse.json(
          { error: "Escopo de exclusão não permitido para este perfil" },
          { status: 400 }
        );
      } catch (error) {
        console.error("Erro ao excluir arquivo:", error);
        return NextResponse.json(
          { error: "Erro ao excluir arquivo" },
          { status: 500 }
        );
      }
    },
  };
}

// Compat: manter nome antigo para usos legados
export const createCsvRouteHandlers = createImportRouteHandlers;
