/**
 * Parser de Dados Pessoais - COMPLETO
 *
 * Extrai todos os campos disponíveis do texto colado (32 campos):
 *
 * DADOS CADASTRAIS:
 * - Nome, Nome Social, Data Nascimento, Sexo, Estado Civil
 * - País de Nascimento, Nacionalidade, UF de Nascimento
 * - Naturalidade, Necessidade Especial
 *
 * DOCUMENTOS:
 * - Tipo de documento, RG, Complemento da identidade
 * - Estado (emissão), Órgão Emissor, Data de Expedição, CPF
 *
 * FILIAÇÃO:
 * - Nome da Mãe, CPF (mãe), Nome do Pai, CPF (pai)
 *
 * CONTATO:
 * - E-mail
 *
 * CERTIDÃO CIVIL:
 * - Tipo, Número, UF Cartório, Município Cartório, Nome Cartório
 * - Número do Termo, Data de Emissão, Estado, Folha, Livro
 */

import { normalizarSexo } from './normalizarSexo';

export interface DadosPessoais {
  // Dados Cadastrais
  nome?: string;
  nomeSocial?: string;
  dataNascimento?: string;
  sexo?: 'M' | 'F';
  estadoCivil?: string;
  paisNascimento?: string;
  nacionalidade?: string;
  uf?: string;
  naturalidade?: string;
  necessidadeEspecial?: string;

  // Documentos
  tipoDocumento?: string;
  rg?: string;
  complementoIdentidade?: string;
  estadoEmissao?: string;
  orgaoEmissor?: string;
  dataEmissaoRG?: string;
  cpf?: string;

  // Filiação
  nomeMae?: string;
  cpfMae?: string;
  nomePai?: string;
  cpfPai?: string;

  // Contato
  email?: string;

  // Certidão Civil
  tipoCertidaoCivil?: string;
  numeroCertidaoCivil?: string;
  ufCartorio?: string;
  municipioCartorio?: string;
  nomeCartorio?: string;
  numeroTermo?: string;
  dataEmissaoCertidao?: string;
  estadoCertidao?: string;
  folhaCertidao?: string;
  livroCertidao?: string;
}

/**
 * Extrai um campo do texto usando regex
 *
 * CORREÇÃO: Valores podem estar na mesma linha OU nas próximas linhas
 * Exemplo formato 1: "Nome: ADRIEL"
 * Exemplo formato 2: "Nome:*\nADRIEL"
 * Exemplo formato 3: "Complemento:\nEstado*:\nRJ"
 *
 * A função continua procurando linhas subsequentes até encontrar um valor válido
 * (que não seja label, valor inválido, ou texto entre parênteses)
 */
function extrairCampo(texto: string, regex: RegExp): string | undefined {
  const match = texto.match(regex);
  if (!match) return undefined;

  // Lista de valores inválidos que devem ser ignorados
  const valoresInvalidos = ['*', 'v', 'Saiba Mais', 'Selecione', ''];

  // Helper: verifica se string é um label (termina com ":" ou "*:")
  const ehLabel = (str: string): boolean => {
    const trimmed = str.trim();
    return trimmed.endsWith(':') || trimmed.endsWith('*:');
  };

  // Helper: verifica se string é texto de instrução entre parênteses
  const ehInstrucao = (str: string): boolean => {
    return /^\(.*\)$/.test(str.trim());
  };

  // Valor capturado na mesma linha
  let valorNaMesmaLinha = match[1].trim();

  // Se valor na mesma linha é válido e não é label, retornar
  if (valorNaMesmaLinha &&
      !valoresInvalidos.includes(valorNaMesmaLinha) &&
      !ehLabel(valorNaMesmaLinha) &&
      !ehInstrucao(valorNaMesmaLinha)) {
    return valorNaMesmaLinha;
  }

  // Valor na mesma linha é inválido, buscar nas próximas linhas
  const posicaoMatch = match.index || 0;
  const textoAposMatch = texto.substring(posicaoMatch + match[0].length);
  const linhas = textoAposMatch.split('\n');

  // Procurar nas próximas linhas (máximo 5 linhas à frente)
  for (let i = 0; i < Math.min(linhas.length, 5); i++) {
    const linha = linhas[i]?.trim();

    // Pular linhas vazias
    if (!linha) continue;

    // Pular labels (ex: "Estado*:")
    if (ehLabel(linha)) continue;

    // Pular valores inválidos
    if (valoresInvalidos.includes(linha)) continue;

    // Pular instruções entre parênteses
    if (ehInstrucao(linha)) continue;

    // Encontrou valor válido!
    return linha;
  }

  return undefined; // Valor realmente vazio
}

/**
 * Limpa CPF (remove formatação)
 */
function limparCPF(cpf: string | undefined): string | undefined {
  return cpf?.replace(/\D/g, '') || undefined;
}

/**
 * Extrai naturalidade (pega apenas o 2º valor, ignorando código)
 * Exemplo: "00001404 IPU" → "IPU"
 */
function extrairNaturalidade(texto: string): string | undefined {
  const match = texto.match(/NATURALIDADE:\s*(.+)/i);
  if (!match) return undefined;

  const valor = match[1].trim();
  const partes = valor.split(/\s+/);

  // Se tem mais de uma parte, pegar a partir da segunda
  if (partes.length > 1) {
    return partes.slice(1).join(' ');
  }

  return valor;
}

/**
 * Extrai CPFs usando contexto posicional
 *
 * Estratégia:
 * - CPF após "Nome da Mãe:" = CPF da mãe
 * - CPF após "Nome do Pai:" = CPF do pai
 * - CPF em seção de documentos (próximo a "Tipo:", "RG") = CPF do aluno
 */
function extrairCPFs(texto: string): {
  cpfAluno?: string;
  cpfMae?: string;
  cpfPai?: string;
} {
  const linhas = texto.split('\n');
  let cpfAluno: string | undefined;
  let cpfMae: string | undefined;
  let cpfPai: string | undefined;

  for (let i = 0; i < linhas.length; i++) {
    const linha = linhas[i];
    const linhaAnterior = i > 0 ? linhas[i - 1] : '';

    // Detectar se esta linha contém um CPF
    const matchCPF = linha.match(/CPF:\s*(.+)/i);
    if (!matchCPF) continue;

    const cpfRaw = matchCPF[1].trim();

    // Contexto 1: CPF logo após "Nome da Mãe:"
    if (linhaAnterior.match(/NOME DA MÃE:/i)) {
      cpfMae = cpfRaw;
      continue;
    }

    // Contexto 2: CPF logo após "Nome do Pai:"
    if (linhaAnterior.match(/NOME DO PAI:/i)) {
      cpfPai = cpfRaw;
      continue;
    }

    // Contexto 3: CPF em seção de documentos
    // Verifica se há "Tipo:" ou "RG" ou "Número:" nas proximidades (linhas anteriores ou posteriores)
    const contextoDocumentos = [
      linhas[i - 2] || '',
      linhaAnterior,
      linhas[i + 1] || '',
      linhas[i + 2] || '',
    ].some(l => l.match(/TIPO:|NÚMERO:|RG|ÓRGÃO EMISSOR/i));

    if (contextoDocumentos && !cpfAluno) {
      cpfAluno = cpfRaw;
      continue;
    }

    // Se não encontrou contexto específico e ainda não tem CPF do aluno, assumir que é do aluno
    if (!cpfAluno && !cpfMae && !cpfPai) {
      cpfAluno = cpfRaw;
    }
  }

  return {
    cpfAluno: limparCPF(cpfAluno),
    cpfMae: limparCPF(cpfMae),
    cpfPai: limparCPF(cpfPai),
  };
}

/**
 * Parseia o texto de Dados Pessoais
 *
 * @param texto - Texto bruto colado pelo usuário
 * @returns Objeto com campos parseados
 */
export function parseDadosPessoais(texto: string): DadosPessoais {
  // ===== DADOS CADASTRAIS =====
  const nome = extrairCampo(texto, /NOME:\s*(.+)/i);
  const nomeSocial = extrairCampo(texto, /NOME SOCIAL:\s*(.+)/i);
  const dataNascimento = extrairCampo(texto, /DATA NASCIMENTO:\s*(.+)/i) ||
                         extrairCampo(texto, /DATA DE NASCIMENTO:\s*(.+)/i);
  const sexoRaw = extrairCampo(texto, /SEXO:\s*(.+)/i);
  const sexo = sexoRaw ? normalizarSexo(sexoRaw) : undefined;
  const estadoCivil = extrairCampo(texto, /ESTADO CIVIL:\s*(.+)/i);
  const paisNascimento = extrairCampo(texto, /PAÍS DE NASCIMENTO:\s*(.+)/i);
  const nacionalidade = extrairCampo(texto, /NACIONALIDADE:\s*(.+)/i);
  const uf = extrairCampo(texto, /UF DE NASCIMENTO:\s*(.+)/i);
  const naturalidade = extrairNaturalidade(texto);
  const necessidadeEspecial = extrairCampo(texto, /NECESSIDADE ESPECIAL:\s*(.+)/i);

  // ===== DOCUMENTOS =====
  const tipoDocumento = extrairCampo(texto, /TIPO:\s*(.+)/i);
  const rg = extrairCampo(texto, /NÚMERO:\s*(.+)/i) || extrairCampo(texto, /RG:\s*(.+)/i);
  const complementoIdentidade = extrairCampo(texto, /COMPLEMENTO DA IDENTIDADE:\s*(.+)/i);
  const estadoEmissao = extrairCampo(texto, /ESTADO:\s*(.+)/i);
  const orgaoEmissor = extrairCampo(texto, /ÓRGÃO EMISSOR:\s*(.+)/i);
  const dataEmissaoRG = extrairCampo(texto, /DATA DE EXPEDIÇÃO:\s*(.+)/i) ||
                        extrairCampo(texto, /EMISSÃO:\s*(.+)/i);

  // ===== CPFs (parsing contextual para distinguir aluno, mãe, pai) =====
  const { cpfAluno, cpfMae, cpfPai } = extrairCPFs(texto);

  // ===== FILIAÇÃO =====
  const nomeMae = extrairCampo(texto, /NOME DA MÃE:\s*(.+)/i);
  const nomePai = extrairCampo(texto, /NOME DO PAI:\s*(.+)/i);

  // ===== CONTATO =====
  const email = extrairCampo(texto, /E-MAIL:\s*(.+)/i) ||
                extrairCampo(texto, /EMAIL:\s*(.+)/i);

  // ===== CERTIDÃO CIVIL =====
  const tipoCertidaoCivil = extrairCampo(texto, /^TIPO CERTIDÃO CIVIL:\s*(.+)/im);
  const numeroCertidaoCivil = extrairCampo(texto, /^CERTIDÃO CIVIL:\s*(.+)/im);
  const ufCartorio = extrairCampo(texto, /^UF DO CARTÓRIO:\s*(.+)/im);
  const municipioCartorio = extrairCampo(texto, /^MUNICÍPIO DO CARTÓRIO:\s*(.+)/im);
  const nomeCartorio = extrairCampo(texto, /^CARTÓRIO:\s*(.+)/im);
  const numeroTermo = extrairCampo(texto, /^NÚMERO DO TERMO:\s*(.+)/im);
  const dataEmissaoCertidao = extrairCampo(texto, /^DATA DE EMISSÃO:\s*(.+)/im);
  const estadoCertidao = extrairCampo(texto, /^ESTADO:\s*(.+)/im);
  const folhaCertidao = extrairCampo(texto, /^FOLHA:\s*(.+)/im);
  const livroCertidao = extrairCampo(texto, /^LIVRO:\s*(.+)/im);

  return {
    // Dados Cadastrais
    nome,
    nomeSocial,
    dataNascimento,
    sexo,
    estadoCivil,
    paisNascimento,
    nacionalidade,
    uf,
    naturalidade,
    necessidadeEspecial,

    // Documentos
    tipoDocumento,
    rg,
    complementoIdentidade,
    estadoEmissao,
    orgaoEmissor,
    dataEmissaoRG,
    cpf: cpfAluno, // CPF do aluno (extraído por contexto)

    // Filiação
    nomeMae,
    cpfMae, // CPF da mãe (extraído por contexto)
    nomePai,
    cpfPai, // CPF do pai (extraído por contexto)

    // Contato
    email,

    // Certidão Civil
    tipoCertidaoCivil,
    numeroCertidaoCivil,
    ufCartorio,
    municipioCartorio,
    nomeCartorio,
    numeroTermo,
    dataEmissaoCertidao,
    estadoCertidao,
    folhaCertidao,
    livroCertidao,
  };
}
