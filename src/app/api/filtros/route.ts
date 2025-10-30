import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/filtros - Buscar opções de filtros hierárquicos
// Query params: anoLetivo?, regime?, modalidade?, serie?
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const anoLetivo = searchParams.get('anoLetivo');
    const regime = searchParams.get('regime');
    const modalidade = searchParams.get('modalidade');
    const serie = searchParams.get('serie');

    // Se não tem nenhum filtro, retorna anos letivos
    if (!anoLetivo) {
      const anos = await prisma.enturmacao.findMany({
        select: { anoLetivo: true },
        distinct: ['anoLetivo'],
        orderBy: { anoLetivo: 'desc' }
      });

      return NextResponse.json({
        tipo: 'anos',
        dados: anos.map(a => a.anoLetivo)
      });
    }

    // Se tem ano mas não tem regime, retorna regimes daquele ano
    if (anoLetivo && !regime) {
      const regimes = await prisma.enturmacao.findMany({
        where: { anoLetivo },
        select: { regime: true },
        distinct: ['regime'],
        orderBy: { regime: 'asc' }
      });

      return NextResponse.json({
        tipo: 'regimes',
        dados: regimes.map(r => r.regime)
      });
    }

    // Se tem ano e regime, mas não modalidade, retorna modalidades
    if (anoLetivo && regime && !modalidade) {
      const modalidades = await prisma.enturmacao.findMany({
        where: {
          anoLetivo,
          regime: parseInt(regime)
        },
        select: { modalidade: true },
        distinct: ['modalidade'],
        orderBy: { modalidade: 'asc' }
      });

      return NextResponse.json({
        tipo: 'modalidades',
        dados: modalidades.map(m => m.modalidade)
      });
    }

    // Se tem ano, regime e modalidade, mas não série, retorna séries
    if (anoLetivo && regime && modalidade && !serie) {
      const series = await prisma.enturmacao.findMany({
        where: {
          anoLetivo,
          regime: parseInt(regime),
          modalidade
        },
        select: { serie: true },
        distinct: ['serie'],
        orderBy: { serie: 'asc' }
      });

      return NextResponse.json({
        tipo: 'series',
        dados: series.map(s => s.serie)
      });
    }

    // Se tem ano, regime, modalidade e série, retorna turmas
    if (anoLetivo && regime && modalidade && serie) {
      const turmas = await prisma.enturmacao.findMany({
        where: {
          anoLetivo,
          regime: parseInt(regime),
          modalidade,
          serie
        },
        select: { turma: true },
        distinct: ['turma'],
        orderBy: { turma: 'asc' }
      });

      return NextResponse.json({
        tipo: 'turmas',
        dados: turmas.map(t => t.turma)
      });
    }

    return NextResponse.json({ error: 'Parâmetros inválidos' }, { status: 400 });

  } catch (error) {
    console.error('Erro ao buscar filtros:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar filtros' },
      { status: 500 }
    );
  }
}
