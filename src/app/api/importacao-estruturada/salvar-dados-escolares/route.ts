import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { salvarDadosEscolares } from '@/lib/importacao/salvarDadosEscolares';
import { schemaSalvarDadosEscolares } from '@/lib/importacao/schemas';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { alunoId, textoBruto, dados } = schemaSalvarDadosEscolares.parse(body);

    const resultado = await salvarDadosEscolares({
      alunoId,
      textoBruto,
      dados: { ...dados, avisos: dados.avisos ?? [] },
    });

    return NextResponse.json({
      sucesso: true,
      mensagem: `Dados escolares salvos com sucesso. ${resultado.seriesCriadas} série(s) cadastrada(s).`,
    });
  } catch (error) {
    console.error('Erro ao salvar dados escolares:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { sucesso: false, erro: error.issues[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { sucesso: false, erro: 'Erro interno ao salvar dados escolares' },
      { status: 500 }
    );
  }
}
