import { NextRequest, NextResponse } from "next/server";
import type { KeyBuilderId } from "@/lib/parsers/tipos";
import { prisma } from "@/lib/prisma";
import { runGenericImport } from "@/lib/importer/generic/pipeline";
import { DuplicateFileError } from "@/lib/importer/csv/types";
import {
  parserProfiles,
  PROFILE_IMPORTACAO_FICHA_INDIVIDUAL,
} from "@/lib/importer/profiles";

const profile = parserProfiles[PROFILE_IMPORTACAO_FICHA_INDIVIDUAL];

export async function POST(request: NextRequest) {
  try {
    const form = await request.formData();
    const file = form.get("file");
    const selectedKeyId = form.get("selectedKeyId")?.toString() as KeyBuilderId | undefined;
    const alunoId = form.get("alunoId")?.toString();

    if (!(file instanceof File)) {
      return NextResponse.json({ sucesso: false, erro: "Arquivo ausente" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const resultado = await runGenericImport({
      prisma,
      buffer,
      fileName: file.name,
      profile,
      selectedKeyId,
      alunoId,
      transactionOptions: {
        maxWait: 10000,
        timeout: 60000,
      },
    });

    return NextResponse.json(
      {
        sucesso: true,
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
        { sucesso: false, erro: error.message, arquivoId: error.fileId },
        { status: 409 }
      );
    }

    console.error("[importacao-ficha-individual-historico] erro:", error);
    return NextResponse.json(
      { sucesso: false, erro: error instanceof Error ? error.message : "Erro interno" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    sucesso: true,
    pendencias: [],
    chavesDisponiveis: profile.chavesDisponiveis ?? [],
  });
}
