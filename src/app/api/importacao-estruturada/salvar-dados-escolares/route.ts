import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { salvarDadosEscolares } from '@/lib/importacao/salvarDadosEscolares';

const schemaRequest = z.object({
  alunoId: z.string().uuid('ID do aluno inválido'),
  textoBruto: z.string().min(10, 'Texto bruto obrigatório'),
  dados: z.object({
    alunoInfo: z.object({
      situacao: z.string().optional(),
      causaEncerramento: z.string().optional(),
      motivoEncerramento: z.string().optional(),
      recebeOutroEspaco: z.string().optional(),
      anoIngresso: z.number().optional(),
      periodoIngresso: z.number().optional(),
      dataInclusao: z.string().optional(),
      tipoIngresso: z.string().optional(),
      redeOrigem: z.string().optional(),
      matrizCurricular: z.string().optional(),
    }),
    series: z
      .array(
        z.object({
          anoLetivo: z.string(),
          periodoLetivo: z.string(),
          unidadeEnsino: z.string().optional(),
          codigoEscola: z.string().optional(),
          modalidade: z.string().optional(),
          segmento: z.string().optional(),
          curso: z.string().optional(),
          serie: z.string().optional(),
          turno: z.string().optional(),
          situacao: z.string().optional(),
          tipoVaga: z.string().optional(),
          ensinoReligioso: z.boolean().nullable().optional(),
          linguaEstrangeira: z.boolean().nullable().optional(),
        })
      )
      .min(1, 'Nenhuma série encontrada para salvar'),
    textoLimpo: z.string(),
    avisos: z.array(z.string()).optional(),
  }),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { alunoId, textoBruto, dados } = schemaRequest.parse(body);

    const resultado = await salvarDadosEscolares({ alunoId, textoBruto, dados });

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
