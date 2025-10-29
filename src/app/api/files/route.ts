import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

type ParsedCsv = {
  headers: string[];
  rows: Record<string, string>[];
};

// Helper para calcular hash dos dados
async function hashData(data: ParsedCsv): Promise<string> {
  const sortedRows = [...data.rows].sort((a, b) => {
    const keyA = Object.keys(a).map(k => `${k}:${a[k]}`).join('|');
    const keyB = Object.keys(b).map(k => `${k}:${b[k]}`).join('|');
    return keyA.localeCompare(keyB);
  });
  const str = JSON.stringify({ headers: data.headers.sort(), rows: sortedRows });
  return crypto.createHash('sha256').update(str).digest('hex');
}

// Helper para extrair metadados
function extractMetadata(data: ParsedCsv) {
  const stripLabelPrefix = (s: string) => {
    const m = String(s || "").trim().match(/^\s*([\p{L}\s_]+):\s*(.*)$/u);
    return m ? m[2].trim() : String(s || "").trim();
  };

  const anosSet = new Set<string>();
  const modalidadesSet = new Set<string>();
  const turmasSet = new Set<string>();

  for (const row of data.rows) {
    const ano = stripLabelPrefix(row["Ano"] ?? "");
    const modalidade = stripLabelPrefix(row["MODALIDADE"] ?? "");
    const turma = stripLabelPrefix(row["TURMA"] ?? "");

    if (ano) anosSet.add(ano);
    if (modalidade) modalidadesSet.add(modalidade);
    if (turma) turmasSet.add(turma);
  }

  return {
    anos: Array.from(anosSet),
    modalidades: Array.from(modalidadesSet),
    turmas: Array.from(turmasSet),
    rowCount: data.rows.length
  };
}

// POST /api/files - Upload de arquivo
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { data, fileName } = body as { data: ParsedCsv; fileName: string };

    if (!data || !fileName) {
      return NextResponse.json(
        { error: 'Dados inválidos' },
        { status: 400 }
      );
    }

    // Calcular hash
    const dataHash = await hashData(data);

    // Verificar se já existe
    const existing = await prisma.uploadedFile.findUnique({
      where: { dataHash }
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Arquivo com conteúdo idêntico já existe', fileId: existing.id },
        { status: 409 }
      );
    }

    // Extrair metadados
    const metadata = extractMetadata(data);

    // Criar no banco
    const file = await prisma.uploadedFile.create({
      data: {
        fileName,
        dataHash,
        data: data as any, // Prisma armazena como Json
        rowCount: metadata.rowCount,
        anos: metadata.anos,
        modalidades: metadata.modalidades,
        turmas: metadata.turmas
      }
    });

    return NextResponse.json({ file }, { status: 201 });

  } catch (error) {
    console.error('Erro ao fazer upload:', error);
    return NextResponse.json(
      { error: 'Erro ao processar arquivo' },
      { status: 500 }
    );
  }
}

// GET /api/files - Listar arquivos
export async function GET() {
  try {
    const files = await prisma.uploadedFile.findMany({
      orderBy: { uploadDate: 'desc' },
      select: {
        id: true,
        fileName: true,
        uploadDate: true,
        dataHash: true,
        rowCount: true,
        anos: true,
        modalidades: true,
        turmas: true,
        data: true
      }
    });

    return NextResponse.json({ files });

  } catch (error) {
    console.error('Erro ao listar arquivos:', error);
    return NextResponse.json(
      { error: 'Erro ao listar arquivos' },
      { status: 500 }
    );
  }
}

// DELETE /api/files - Deletar arquivos
// Aceita query params: ?id=xxx ou ?periodo=2022 ou ?periodo=2022&modalidade=XXX
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const periodo = searchParams.get('periodo');
    const modalidade = searchParams.get('modalidade');

    if (id) {
      // Deletar arquivo específico por ID
      await prisma.uploadedFile.delete({
        where: { id }
      });
      return NextResponse.json({ message: 'Arquivo deletado com sucesso' });
    }

    if (periodo) {
      // Deletar por período (e opcionalmente modalidade)
      const where: any = {
        anos: { has: periodo }
      };

      if (modalidade) {
        where.modalidades = { has: modalidade };
      }

      const result = await prisma.uploadedFile.deleteMany({ where });

      return NextResponse.json({
        message: `${result.count} arquivo(s) deletado(s) com sucesso`
      });
    }

    return NextResponse.json(
      { error: 'Parâmetros inválidos. Use ?id=xxx ou ?periodo=2022 ou ?periodo=2022&modalidade=XXX' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Erro ao deletar arquivo(s):', error);
    return NextResponse.json(
      { error: 'Erro ao deletar arquivo(s)' },
      { status: 500 }
    );
  }
}
