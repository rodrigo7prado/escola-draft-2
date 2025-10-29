import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/edits?matricula=12345
// GET /api/edits?matricula=12345&campo=NOME_COMPL (histórico de um campo)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const matricula = searchParams.get('matricula');
    const campo = searchParams.get('campo');

    if (!matricula) {
      return NextResponse.json(
        { error: 'Parâmetro matricula é obrigatório' },
        { status: 400 }
      );
    }

    const where: any = { matricula };
    if (campo) {
      where.campo = campo;
    }

    const edits = await prisma.alunoEdit.findMany({
      where,
      orderBy: { editadoEm: 'desc' }
    });

    return NextResponse.json({ edits });

  } catch (error) {
    console.error('Erro ao buscar edições:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar edições' },
      { status: 500 }
    );
  }
}

// POST /api/edits - Criar nova edição
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { matricula, campo, valorOriginal, valorEditado, motivo, editadoPor } = body;

    // Validações
    if (!matricula || !campo || valorEditado === undefined) {
      return NextResponse.json(
        { error: 'matricula, campo e valorEditado são obrigatórios' },
        { status: 400 }
      );
    }

    // Verificar se já existe edição recente para este campo
    // Se sim, estamos fazendo uma nova edição (histórico)
    const edit = await prisma.alunoEdit.create({
      data: {
        matricula,
        campo,
        valorOriginal: valorOriginal || null,
        valorEditado,
        motivo: motivo || null,
        editadoPor: editadoPor || null
      }
    });

    return NextResponse.json({ edit }, { status: 201 });

  } catch (error) {
    console.error('Erro ao criar edição:', error);
    return NextResponse.json(
      { error: 'Erro ao criar edição' },
      { status: 500 }
    );
  }
}

// DELETE /api/edits?id=xxx - Deletar edição específica
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Parâmetro id é obrigatório' },
        { status: 400 }
      );
    }

    await prisma.alunoEdit.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Edição deletada com sucesso' });

  } catch (error) {
    console.error('Erro ao deletar edição:', error);
    return NextResponse.json(
      { error: 'Erro ao deletar edição' },
      { status: 500 }
    );
  }
}
