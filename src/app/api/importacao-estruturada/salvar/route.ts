import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import type { DadosPessoais } from '@/lib/parsing/parseDadosPessoais';

/**
 * Schema de validação do request
 */
const schemaRequest = z.object({
  alunoId: z.string().uuid('ID do aluno inválido'),
  textoBruto: z.string().min(10, 'Texto bruto obrigatório'),
  dados: z.object({
    nomeCompleto: z.string().optional(),
    matricula: z.string().optional(),
    dataNascimento: z.string().optional(),
    sexo: z.enum(['M', 'F']).optional(),
    cpf: z.string().optional(),
    rg: z.string().optional(),
    orgaoEmissor: z.string().optional(),
    dataEmissaoRG: z.string().optional(),
    naturalidade: z.string().optional(),
    nacionalidade: z.string().optional(),
    nomeMae: z.string().optional(),
    nomePai: z.string().optional(),
  }),
});

/**
 * POST /api/importacao-estruturada/salvar
 *
 * Salva dados pessoais parseados no banco de dados
 *
 * Estratégia:
 * 1. Salva em dadosOriginais (JSONB) - preserva dados parseados
 * 2. Salva em campos normais do banco - para compatibilidade e merge visual
 * 3. Salva texto bruto original - para auditoria e reprocessamento
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Validar request body
    const body = await request.json();
    const { alunoId, textoBruto, dados } = schemaRequest.parse(body);

    // 2. Validar que aluno existe
    const aluno = await prisma.aluno.findUnique({
      where: { id: alunoId },
    });

    if (!aluno) {
      return NextResponse.json(
        { sucesso: false, erro: 'Aluno não encontrado' },
        { status: 404 }
      );
    }

    // 3. Atualizar aluno
    await prisma.aluno.update({
      where: { id: alunoId },
      data: {
        // Dados estruturados (JSONB)
        dadosOriginais: {
          ...dados,
          importadoEm: new Date().toISOString(),
          tipoImportacao: 'dadosPessoais',
        },

        // Texto bruto (para auditoria)
        textoBrutoDadosPessoais: textoBruto,
        dataImportacaoTextoDadosPessoais: new Date(),

        // Preencher campos normais do banco (para merge visual)
        nome: dados.nomeCompleto || aluno.nome,
        sexo: dados.sexo || aluno.sexo,
        dataNascimento: dados.dataNascimento
          ? new Date(dados.dataNascimento.split('/').reverse().join('-'))
          : aluno.dataNascimento,
        cpf: dados.cpf || aluno.cpf,
        rg: dados.rg || aluno.rg,
        rgOrgaoEmissor: dados.orgaoEmissor || aluno.rgOrgaoEmissor,
        rgDataEmissao: dados.dataEmissaoRG
          ? new Date(dados.dataEmissaoRG.split('/').reverse().join('-'))
          : aluno.rgDataEmissao,
        naturalidade: dados.naturalidade || aluno.naturalidade,
        nacionalidade: dados.nacionalidade || aluno.nacionalidade,
        nomeMae: dados.nomeMae || aluno.nomeMae,
        nomePai: dados.nomePai || aluno.nomePai,
      },
    });

    return NextResponse.json({
      sucesso: true,
      mensagem: 'Dados pessoais importados com sucesso',
    });
  } catch (error) {
    console.error('Erro ao salvar dados pessoais:', error);

    // Erro de validação do Zod
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          sucesso: false,
          erro: error.errors[0].message,
        },
        { status: 400 }
      );
    }

    // Erro genérico
    return NextResponse.json(
      { sucesso: false, erro: 'Erro interno ao salvar dados' },
      { status: 500 }
    );
  }
}
