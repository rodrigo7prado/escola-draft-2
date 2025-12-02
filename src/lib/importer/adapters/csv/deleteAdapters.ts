import { NextResponse, type NextRequest } from "next/server";
import type { PrismaClient } from "@prisma/client";
import type { ImportProfile } from "@/lib/importer/pipelines/csv/types";
import { deleteArquivoPorId, deleteArquivosPorPeriodo } from "@/lib/importer/pipelines/csv/delete";

type DeleteAdapterContext = {
  prisma: PrismaClient;
  profile: ImportProfile;
  request: NextRequest;
  deleteScopes?: {
    byId?: boolean;
    byPeriod?: boolean;
    periodParam?: string;
  };
};

export async function deleteCsvAdapter({
  prisma,
  profile,
  request,
  deleteScopes,
}: DeleteAdapterContext) {
  const deleteById = deleteScopes?.byId ?? true;
  const deleteByPeriod = deleteScopes?.byPeriod ?? false;
  const periodParam = deleteScopes?.periodParam ?? "periodo";

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
}

export async function deleteNone() {
  return NextResponse.json({ error: "DELETE não suportado" }, { status: 405 });
}
