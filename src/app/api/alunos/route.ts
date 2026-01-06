import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/alunos - Buscar todos os alunos
// GET /api/alunos?matricula=xxx - Buscar aluno específico
// GET /api/alunos?anoLetivo=xxx&regime=x&modalidade=xxx&serie=x&turma=xxx - Filtrar por enturmação
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const matricula = searchParams.get('matricula');
    const anoLetivo = searchParams.get('anoLetivo');
    const regime = searchParams.get('regime');
    const modalidade = searchParams.get('modalidade');
    const serie = searchParams.get('serie');
    const turma = searchParams.get('turma');

    if (matricula) {
      // Buscar aluno específico com dados originais
      const aluno = await prisma.aluno.findUnique({
        where: { matricula },
        include: {
          linhaOrigem: {
            include: {
              arquivo: true
            }
          },
          seriesCursadas: {
            orderBy: [
              { anoLetivo: 'asc' },
              { periodoLetivo: 'asc' }
            ]
          },
          enturmacoes: {
            orderBy: { anoLetivo: 'desc' }
          }
        }
      });

      if (!aluno) {
        return NextResponse.json(
          { error: 'Aluno não encontrado' },
          { status: 404 }
        );
      }

      // Montar resposta com comparação original vs atual
      const dadosOriginais = aluno.linhaOrigem?.dadosOriginais as Record<string, any> || {};

      const comparacao = {
        matricula: {
          atual: aluno.matricula,
          original: dadosOriginais.ALUNO || null,
          editado: false
        },
        nome: {
          atual: aluno.nome,
          original: dadosOriginais.NOME_COMPL || null,
          editado: aluno.nome !== (dadosOriginais.NOME_COMPL || null)
        },
        cpf: {
          atual: aluno.cpf,
          original: dadosOriginais.CPF || null,
          editado: aluno.cpf !== (dadosOriginais.CPF || null)
        }
        // Adicionar outros campos conforme necessário
      };

      return NextResponse.json({
        aluno,
        comparacao,
        fonteArquivo: aluno.linhaOrigem?.arquivo?.nomeArquivo || null
      });
    }

    // Construir filtro de enturmação
    const filtroEnturmacao: any = {};
    if (anoLetivo) filtroEnturmacao.anoLetivo = anoLetivo;
    if (regime) filtroEnturmacao.regime = parseInt(regime);
    if (modalidade) filtroEnturmacao.modalidade = modalidade;
    if (serie) filtroEnturmacao.serie = serie;
    if (turma) filtroEnturmacao.turma = turma;

    // Buscar alunos (filtrados por enturmação se houver filtros)
    const whereClause: any = {};

    if (Object.keys(filtroEnturmacao).length > 0) {
      whereClause.enturmacoes = {
        some: filtroEnturmacao
      };
    }

    const alunos = await prisma.aluno.findMany({
      where: whereClause,
      orderBy: [
        { nome: 'asc' }
      ],
      include: {
        linhaOrigem: {
          select: {
            dadosOriginais: true
          }
        },
        enturmacoes: {
          where: Object.keys(filtroEnturmacao).length > 0 ? filtroEnturmacao : undefined,
          orderBy: { anoLetivo: 'desc' }
        },
        // Usamos apenas segmento para calcular completude escolar na listagem
        seriesCursadas: {
          select: {
            segmento: true,
            anoLetivo: true,
            _count: {
              select: {
                historicos: true
              }
            }
          }
        }
      }
    });

    return NextResponse.json({ alunos });

  } catch (error) {
    console.error('Erro ao buscar alunos:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar alunos' },
      { status: 500 }
    );
  }
}

// PATCH /api/alunos - Atualizar dados de um aluno
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { matricula, ...campos } = body;

    if (!matricula) {
      return NextResponse.json(
        { error: 'matricula é obrigatória' },
        { status: 400 }
      );
    }

    // Atualizar aluno
    const alunoAtualizado = await prisma.aluno.update({
      where: { matricula },
      data: {
        ...campos,
        atualizadoEm: new Date()
        // atualizadoPor poderia vir do body se houver autenticação
      }
    });

    // O trigger de auditoria registra automaticamente a mudança

    return NextResponse.json({ aluno: alunoAtualizado });

  } catch (error) {
    console.error('Erro ao atualizar aluno:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar aluno' },
      { status: 500 }
    );
  }
}

// POST /api/alunos - Criar aluno manualmente
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { matricula, nome, ...outrosCampos } = body;

    if (!matricula) {
      return NextResponse.json(
        { error: 'matricula é obrigatória' },
        { status: 400 }
      );
    }

    // Verificar se já existe
    const existe = await prisma.aluno.findUnique({
      where: { matricula }
    });

    if (existe) {
      return NextResponse.json(
        { error: 'Aluno com esta matrícula já existe' },
        { status: 409 }
      );
    }

    // Criar aluno manual
    const novoAluno = await prisma.aluno.create({
      data: {
        matricula,
        nome: nome || null,
        ...outrosCampos,
        origemTipo: 'manual',
        linhaOrigemId: null
      }
    });

    return NextResponse.json({ aluno: novoAluno }, { status: 201 });

  } catch (error) {
    console.error('Erro ao criar aluno:', error);
    return NextResponse.json(
      { error: 'Erro ao criar aluno' },
      { status: 500 }
    );
  }
}
