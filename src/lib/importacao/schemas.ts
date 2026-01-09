import { z } from "zod";

export const schemaSalvarDadosPessoais = z.object({
  alunoId: z.string().uuid("ID do aluno inválido"),
  textoBruto: z.string().min(10, "Texto bruto obrigatório"),
  dados: z.object({
    // Dados Cadastrais (10 campos)
    nome: z.string().optional(),
    nomeSocial: z.string().optional(),
    dataNascimento: z.string().optional(),
    sexo: z.enum(["M", "F"]).optional(),
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

export const schemaSalvarDadosEscolares = z.object({
  alunoId: z.string().uuid("ID do aluno inválido"),
  textoBruto: z.string().min(10, "Texto bruto obrigatório"),
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
      .min(1, "Nenhuma série encontrada para salvar"),
    textoLimpo: z.string(),
    avisos: z.array(z.string()).optional(),
  }),
});
