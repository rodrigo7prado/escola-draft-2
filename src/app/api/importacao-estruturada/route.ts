import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { detectarTipoPagina } from '@/lib/parsing/detectarTipoPagina';
import { parseDadosPessoais } from '@/lib/parsing/parseDadosPessoais';
import { parseDadosEscolares } from '@/lib/parsing/parseDadosEscolares';
import { salvarDadosEscolares } from '@/lib/importacao/salvarDadosEscolares';

/**
 * Schema de validação do request
 */
const schemaRequest = z.object({
  texto: z.string().min(10, 'Texto muito curto'),
  matricula: z.string().length(15, 'Matrícula deve ter 15 dígitos'),
  alunoId: z.string().uuid('ID do aluno inválido'),
});

/**
 * POST /api/importacao-estruturada
 *
 * Recebe texto colado pelo usuário e processa conforme o tipo detectado
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Validar request body
    const body = await request.json();
    const { texto, matricula, alunoId } = schemaRequest.parse(body);

    // 2. Validar que aluno existe
    const aluno = await prisma.aluno.findUnique({
      where: { id: alunoId, matricula },
    });

    if (!aluno) {
      return NextResponse.json(
        {
          sucesso: false,
          erro: `Matrícula ${matricula} não encontrada. Cadastre o aluno primeiro.`,
        },
        { status: 404 }
      );
    }

    // 3. Detectar tipo de página
    let tipoPagina;
    try {
      tipoPagina = detectarTipoPagina(texto);
    } catch (error) {
      // Erro de ambiguidade (contém marcadores de ambos os tipos)
      return NextResponse.json(
        {
          sucesso: false,
          erro: error instanceof Error ? error.message : 'Erro ao detectar tipo de página',
        },
        { status: 400 }
      );
    }

    if (!tipoPagina) {
      return NextResponse.json(
        {
          sucesso: false,
          erro: 'Formato não reconhecido. Cole o texto de dados pessoais ou dados escolares.',
        },
        { status: 400 }
      );
    }

    // 4. Processar conforme tipo detectado
    if (tipoPagina === 'dadosPessoais') {
      // Parsear dados pessoais
      const dadosParsed = parseDadosPessoais(texto);

      // Verificar se sexo foi encontrado
      const precisaConfirmarSexo = !dadosParsed.sexo;

      return NextResponse.json({
        sucesso: true,
        tipoPagina: 'dadosPessoais',
        precisaConfirmarSexo,
        dados: dadosParsed,
      });
    }

    if (tipoPagina === 'dadosEscolares') {
      // Parsear dados escolares
      const dadosParsed = parseDadosEscolares(texto, matricula);

      await salvarDadosEscolares({
        alunoId: aluno.id,
        textoBruto: texto,
        dados: dadosParsed,
      });

      return NextResponse.json({
        sucesso: true,
        tipoPagina: 'dadosEscolares',
        dados: dadosParsed,
        mensagem: `Dados escolares salvos com sucesso. ${dadosParsed.series.length} série(s) cadastrada(s).`,
      });
    }

    // Nunca deve chegar aqui
    return NextResponse.json(
      { sucesso: false, erro: 'Erro inesperado' },
      { status: 500 }
    );
  } catch (error) {
    console.error('Erro na importação estruturada:', error);

    // Erro de validação do Zod
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          sucesso: false,
          erro: error.issues[0].message,
        },
        { status: 400 }
      );
    }

    // Erro genérico
    return NextResponse.json(
      { sucesso: false, erro: 'Erro interno ao processar importação' },
      { status: 500 }
    );
  }
}
