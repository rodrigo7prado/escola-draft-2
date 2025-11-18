import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { detectarTipoPagina } from '@/lib/parsing/detectarTipoPagina';
import { parseDadosPessoais } from '@/lib/parsing/parseDadosPessoais';
import { parseDadosEscolares } from '@/lib/parsing/parseDadosEscolares';

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

      // Salvar dados do aluno em transação
      await prisma.$transaction(async (tx) => {
        // Atualizar campos do aluno
        await tx.aluno.update({
          where: { id: aluno.id },
          data: {
            textoBrutoDadosEscolares: texto,
            dataImportacaoTextoDadosEscolares: new Date(),
            situacaoEscolar: dadosParsed.alunoInfo.situacao,
            causaEncerramentoEscolar: dadosParsed.alunoInfo.causaEncerramento,
            motivoEncerramento: dadosParsed.alunoInfo.motivoEncerramento,
            recebeOutroEspacoEscolar: dadosParsed.alunoInfo.recebeOutroEspaco,
            anoIngressoEscolar: dadosParsed.alunoInfo.anoIngresso,
            periodoIngressoEscolar: dadosParsed.alunoInfo.periodoIngresso,
            dataInclusaoIngressoEscolar: dadosParsed.alunoInfo.dataInclusao
              ? new Date(dadosParsed.alunoInfo.dataInclusao)
              : null,
            tipoIngressoEscolar: dadosParsed.alunoInfo.tipoIngresso,
            redeOrigemIngressoEscolar: dadosParsed.alunoInfo.redeOrigem,
            matrizCurricularEscolar: dadosParsed.alunoInfo.matrizCurricular,
          },
        });

        // Deletar séries existentes para esse aluno (para evitar duplicação)
        await tx.serieCursada.deleteMany({
          where: { alunoMatricula: matricula },
        });

        // Criar registros de séries cursadas
        for (const serie of dadosParsed.series) {
          await tx.serieCursada.create({
            data: {
              alunoMatricula: matricula,
              anoLetivo: serie.anoLetivo,
              periodoLetivo: serie.periodoLetivo,
              unidadeEnsino: serie.unidadeEnsino,
              codigoEscola: serie.codigoEscola,
              modalidade: serie.modalidade,
              segmento: serie.segmento,
              curso: serie.curso,
              serie: serie.serie,
              turno: serie.turno,
              situacao: serie.situacao,
              tipoVaga: serie.tipoVaga,
              matrizCurricular: serie.matrizCurricular,
              dataInclusaoAluno: serie.dataInclusaoAluno
                ? new Date(serie.dataInclusaoAluno)
                : null,
              redeEnsinoOrigem: serie.redeEnsinoOrigem,
              ensinoReligioso: serie.ensinoReligioso,
              linguaEstrangeira: serie.linguaEstrangeira,
              textoBrutoOrigemId: aluno.id,
            },
          });
        }
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
