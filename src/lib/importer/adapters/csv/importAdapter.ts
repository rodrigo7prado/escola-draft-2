import { NextResponse, type NextRequest } from "next/server";
import type { PrismaClient } from "@prisma/client";
import type { ImportProfile } from "@/lib/importer/pipelines/csv/types";
import type { KeyBuilderId } from "@/lib/parsers/tipos";
import { runCsvImport } from "@/lib/importer/pipelines/csv/pipeline";
import { parseCsvLoose } from "@/lib/parsers/csv/parse";
import { DuplicateFileError } from "@/lib/importer/pipelines/csv/types";

type ImportAdapterContext = {
  prisma: PrismaClient;
  profile: ImportProfile;
  request: NextRequest;
  transactionOptions?: Parameters<PrismaClient["$transaction"]>[1];
};

export async function importCsvMultipart({
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
    const hasFormData = typeof (request as any).formData === "function";

    if (!contentType.includes("multipart/form-data") || !hasFormData) {
      return NextResponse.json(
        { error: "Content-Type inválido, esperado multipart/form-data" },
        { status: 400 }
      );
    }

    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Arquivo ausente" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const texto = buffer.toString("utf8");
    const parsed = parseCsvLoose(texto, profile.requiredHeaders);

    const resultado = await runCsvImport({
      prisma,
      data: parsed,
      fileName: file.name,
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
