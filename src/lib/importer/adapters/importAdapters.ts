import { NextResponse, type NextRequest } from "next/server";
import type { PrismaClient } from "@prisma/client";
import type { ImportProfile } from "@/lib/importer/csv/types";
import type { KeyBuilderId } from "@/lib/parsers/tipos";
import { runGenericImport } from "@/lib/importer/generic/pipeline";
import { runCsvImport } from "@/lib/importer/csv/pipeline";
import { parseCsvLoose } from "@/lib/parsers/csv/parse";
import { DuplicateFileError } from "@/lib/importer/csv/types";

type ImportAdapterContext = {
  prisma: PrismaClient;
  profile: ImportProfile;
  request: NextRequest;
  transactionOptions?: Parameters<PrismaClient["$transaction"]>[1];
};

type ImportAdapter = (ctx: ImportAdapterContext) => Promise<NextResponse>;

async function readMultipart(request: NextRequest) {
  const form = await request.formData();
  const file = form.get("file");
  const selectedKeyId = form.get("selectedKeyId")?.toString() as KeyBuilderId | undefined;
  const alunoId = form.get("alunoId")?.toString();

  if (!(file instanceof File)) {
    throw new Error("Arquivo ausente");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  return { buffer, fileName: file.name, selectedKeyId, alunoId };
}

const declarativeMultipart: ImportAdapter = async ({ prisma, profile, request, transactionOptions }) => {
  try {
    const entrada = await readMultipart(request);

    const resultado = await runGenericImport({
      prisma,
      buffer: entrada.buffer,
      fileName: entrada.fileName,
      profile,
      selectedKeyId: entrada.selectedKeyId,
      alunoId: entrada.alunoId,
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
      return NextResponse.json(
        { error: error.message, fileId: error.fileId },
        { status: 409 }
      );
    }
    console.error("Erro ao fazer upload:", error);
    return NextResponse.json({ error: "Erro ao processar arquivo" }, { status: 500 });
  }
};

const csvMultipart: ImportAdapter = async ({ prisma, profile, request, transactionOptions }) => {
  try {
    const hasFormData = typeof (request as any).formData === "function";

    if (hasFormData) {
      const entrada = await readMultipart(request);
      const texto = entrada.buffer.toString("utf8");
      const parsed = parseCsvLoose(texto, profile.requiredHeaders);

      const resultado = await runCsvImport({
        prisma,
        data: parsed,
        fileName: entrada.fileName,
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
    }

    // Fallback para JSON (compat com testes legados)
    const body = await request.json();
    const { data, fileName } = body as { data?: any; fileName?: string };
    if (!data || !fileName) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
    }

    const parsed =
      typeof data === "object" && Array.isArray((data as any).rows) && Array.isArray((data as any).headers)
        ? (data as any)
        : parseCsvLoose(JSON.stringify(data), profile.requiredHeaders);

    const resultado = await runCsvImport({
      prisma,
      data: parsed,
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
    return NextResponse.json({ error: "Erro ao processar arquivo" }, { status: 500 });
  }
};

export const importAdapters: Record<string, ImportAdapter> = {
  "declarative-multipart": declarativeMultipart,
  "csv-multipart": csvMultipart,
};
