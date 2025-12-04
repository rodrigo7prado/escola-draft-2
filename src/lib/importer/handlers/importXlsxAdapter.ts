import { NextResponse, type NextRequest } from "next/server";
import type { PrismaClient } from "@prisma/client";
import type { ImportProfile } from "@/lib/importer/pipelines/csv/types";
import type { KeyBuilderId } from "@/lib/parsers/tipos";
import { runXlsxImport } from "@/lib/importer/pipelines/xlsx/pipeline";
import { DuplicateFileError } from "@/lib/importer/pipelines/csv/types";

type ImportAdapterContext = {
  prisma: PrismaClient;
  profile: ImportProfile;
  request: NextRequest;
  transactionOptions?: Parameters<PrismaClient["$transaction"]>[1];
};

export async function importXlsxJson({
  prisma,
  profile,
  request,
  transactionOptions,
}: ImportAdapterContext) {
  try {
    const contentType =
      typeof (request as any).headers?.get === "function"
        ? request.headers.get("content-type") ?? ""
        : "";
    const isJson =
      contentType.includes("application/json") && typeof (request as any).json === "function";

    if (!isJson) {
      return NextResponse.json(
        { error: "Content-Type inválido, esperado application/json" },
        { status: 400 }
      );
    }

    const body = await (request as any).json();
    const fileName = body?.fileName;
    const fileData = body?.fileData;
    const selectedKeyId = body?.selectedKeyId as KeyBuilderId | undefined;
    const alunoId = body?.alunoId as string | undefined;

    if (!fileName) {
      return NextResponse.json({ error: "fileName ausente" }, { status: 400 });
    }

    if (!fileData) {
      return NextResponse.json({ error: "fileData ausente" }, { status: 400 });
    }

    if (!alunoId) {
      return NextResponse.json({ error: "alunoId ausente" }, { status: 400 });
    }

    let buffer: Buffer;
    try {
      if (typeof fileData === "string") {
        buffer = Buffer.from(fileData, "base64");
      } else if (Array.isArray(fileData)) {
        buffer = Buffer.from(fileData);
      } else {
        return NextResponse.json({ error: "formato de fileData inválido" }, { status: 400 });
      }
    } catch (err) {
      console.error("Erro ao decodificar fileData:", err);
      return NextResponse.json({ error: "Erro ao ler arquivo" }, { status: 400 });
    }

    const resultado = await runXlsxImport({
      prisma,
      buffer,
      fileName,
      profile,
      selectedKeyId,
      alunoId,
      transactionOptions,
    });

    return NextResponse.json(
      {
        arquivo: resultado.arquivo,
        linhasImportadas: resultado.linhasImportadas,
        hash: resultado.dataHash,
        domain: resultado.domain,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof DuplicateFileError) {
      return NextResponse.json({ error: error.message, fileId: error.fileId }, { status: 409 });
    }
    console.error("Erro ao fazer upload:", error);
    return NextResponse.json({ error: "Erro ao processar arquivo" }, { status: 500 });
  }
}
