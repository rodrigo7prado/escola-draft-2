import { NextResponse, type NextRequest } from "next/server";
import type { PrismaClient } from "@prisma/client";
import type { ImportProfile } from "@/lib/importer/pipelines/csv/types";
import type { KeyBuilderId } from "@/lib/parsers/tipos";
import { runCsvImport } from "@/lib/importer/pipelines/csv/pipeline";
import { parseCsvLoose } from "@/lib/parsers/csv/parse";
import { DuplicateFileError } from "@/lib/importer/pipelines/csv/types";
import { resolveRequiredHeaders } from "@/lib/parsers/engine/csv/executors";

type ImportAdapterContext = {
  prisma: PrismaClient;
  profile: ImportProfile;
  request: NextRequest;
  transactionOptions?: Parameters<PrismaClient["$transaction"]>[1];
};

export async function importCsvJson({
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
    if (!body?.fileName) {
      return NextResponse.json({ error: "fileName ausente" }, { status: 400 });
    }

    let parsed = body.data;
    if (!parsed && typeof body.csvText === "string") {
      const requiredHeaders = resolveRequiredHeaders(profile);
      parsed = parseCsvLoose(body.csvText, requiredHeaders);
    }

    if (!parsed || !parsed.rows) {
      return NextResponse.json({ error: "Payload inválido" }, { status: 400 });
    }

    const resultado = await runCsvImport({
      prisma,
      data: parsed,
      fileName: body.fileName,
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
      return NextResponse.json({ error: error.message, fileId: error.fileId }, { status: 409 });
    }
    console.error("Erro ao fazer upload:", error);
    return NextResponse.json({ error: "Erro ao processar arquivo" }, { status: 500 });
  }
}
