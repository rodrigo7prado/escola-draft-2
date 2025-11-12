import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

/**
 * Schema de validação do request - TODOS OS 32 CAMPOS
 */
const schemaRequest = z.object({
  alunoId: z.string().uuid('ID do aluno inválido'),
  textoBruto: z.string().min(10, 'Texto bruto obrigatório'),
  dados: z.object({
    // Dados Cadastrais (10 campos)
    nome: z.string().optional(),
    nomeSocial: z.string().optional(),
    dataNascimento: z.string().optional(),
    sexo: z.enum(['M', 'F']).optional(),
    estadoCivil: z.string().optional(),
    paisNascimento: z.string().optional(),
    nacionalidade: z.string().optional(),
    uf: z.string().optional(),
    naturalidade: z.string().optional(),
    necessidadeEspecial: z.string().optional(),

    // Documentos (7 campos)
    tipoDocumento: z.string().optional(),
    rg: z.string().optional(),
    complementoIdentidade: z.string().optional(),
    estadoEmissao: z.string().optional(),
    orgaoEmissor: z.string().optional(),
    dataEmissaoRG: z.string().optional(),
    cpf: z.string().optional(),

    // Filiação (4 campos)
    nomeMae: z.string().optional(),
    cpfMae: z.string().optional(),
    nomePai: z.string().optional(),
    cpfPai: z.string().optional(),

    // Contato (1 campo)
    email: z.string().optional(),

    // Certidão Civil (10 campos)
    tipoCertidaoCivil: z.string().optional(),
    numeroCertidaoCivil: z.string().optional(),
    ufCartorio: z.string().optional(),
    municipioCartorio: z.string().optional(),
    nomeCartorio: z.string().optional(),
    numeroTermo: z.string().optional(),
    dataEmissaoCertidao: z.string().optional(),
    estadoCertidao: z.string().optional(),
    folhaCertidao: z.string().optional(),
    livroCertidao: z.string().optional(),
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

    // 3. Helper: converter data DD/MM/YYYY para Date
    const converterData = (dataStr: string | undefined): Date | undefined => {
      if (!dataStr) return undefined;
      try {
        const [dia, mes, ano] = dataStr.split('/');
        return new Date(`${ano}-${mes}-${dia}`);
      } catch {
        return undefined;
      }
    };

    // 4. Atualizar aluno com TODOS os 32 campos
    await prisma.aluno.update({
      where: { id: alunoId },
      data: {
        // Dados estruturados (JSONB) - preserva tudo parseado
        dadosOriginais: {
          ...dados,
          importadoEm: new Date().toISOString(),
          tipoImportacao: 'dadosPessoais',
        },

        // Texto bruto (para auditoria e reprocessamento)
        textoBrutoDadosPessoais: textoBruto,
        dataImportacaoTextoDadosPessoais: new Date(),

        // ===== DADOS CADASTRAIS (10 campos) =====
        nome: dados.nome || aluno.nome,
        nomeSocial: dados.nomeSocial || aluno.nomeSocial,
        sexo: dados.sexo || aluno.sexo,
        dataNascimento: converterData(dados.dataNascimento) || aluno.dataNascimento,
        estadoCivil: dados.estadoCivil || aluno.estadoCivil,
        paisNascimento: dados.paisNascimento || aluno.paisNascimento,
        nacionalidade: dados.nacionalidade || aluno.nacionalidade,
        uf: dados.uf || aluno.uf,
        naturalidade: dados.naturalidade || aluno.naturalidade,
        necessidadeEspecial: dados.necessidadeEspecial || aluno.necessidadeEspecial,

        // ===== DOCUMENTOS (7 campos) =====
        tipoDocumento: dados.tipoDocumento || aluno.tipoDocumento,
        rg: dados.rg || aluno.rg,
        complementoIdentidade: dados.complementoIdentidade || aluno.complementoIdentidade,
        estadoEmissao: dados.estadoEmissao || aluno.estadoEmissao,
        rgOrgaoEmissor: dados.orgaoEmissor || aluno.rgOrgaoEmissor,
        rgDataEmissao: converterData(dados.dataEmissaoRG) || aluno.rgDataEmissao,
        cpf: dados.cpf || aluno.cpf,

        // ===== FILIAÇÃO (4 campos) =====
        nomeMae: dados.nomeMae || aluno.nomeMae,
        cpfMae: dados.cpfMae || aluno.cpfMae,
        nomePai: dados.nomePai || aluno.nomePai,
        cpfPai: dados.cpfPai || aluno.cpfPai,

        // ===== CONTATO (1 campo) =====
        email: dados.email || aluno.email,

        // ===== CERTIDÃO CIVIL (10 campos) =====
        tipoCertidaoCivil: dados.tipoCertidaoCivil || aluno.tipoCertidaoCivil,
        numeroCertidaoCivil: dados.numeroCertidaoCivil || aluno.numeroCertidaoCivil,
        ufCartorio: dados.ufCartorio || aluno.ufCartorio,
        municipioCartorio: dados.municipioCartorio || aluno.municipioCartorio,
        nomeCartorio: dados.nomeCartorio || aluno.nomeCartorio,
        numeroTermo: dados.numeroTermo || aluno.numeroTermo,
        dataEmissaoCertidao: converterData(dados.dataEmissaoCertidao) || aluno.dataEmissaoCertidao,
        estadoCertidao: dados.estadoCertidao || aluno.estadoCertidao,
        folhaCertidao: dados.folhaCertidao || aluno.folhaCertidao,
        livroCertidao: dados.livroCertidao || aluno.livroCertidao,
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
          erro: error.issues[0].message,
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
