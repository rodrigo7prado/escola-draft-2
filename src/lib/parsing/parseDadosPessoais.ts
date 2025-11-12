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

import { normalizarSexo } from "./normalizarSexo";

export interface DadosPessoais {
  // Dados Cadastrais
  nome?: string;
  nomeSocial?: string;
  dataNascimento?: string;
  sexo?: "M" | "F";
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
 * REGRA GERAL: Se após um label só há outro label (ou valores inválidos), o campo é VAZIO.
 *
 * Formato comum:
 * - "Nome: ADRIEL" → valor na mesma linha
 * - "Nome:*\nADRIEL" → valor na próxima linha
 * - "Nome Social:\tData Nascimento:*" → Nome Social VAZIO (próximo texto é outro label)
 * - "Complemento:\nEstado*:\nRJ" → Complemento VAZIO (próximo não-vazio é label)
 *
 * A função procura linhas subsequentes até encontrar um valor válido
 * (que NÃO seja label, valor inválido, ou instrução)
 */
function extrairCampo(texto: string, regex: RegExp): string | undefined {
  const match = texto.match(regex);
  if (!match) return undefined;

  // Lista de valores inválidos (placeholders vazios)
  const valoresInvalidos = [
    "*",
    "v",
    "Saiba Mais",
    "Selecione",
    "",
    "\n",
    "\t",
  ];

  // Helper: verifica se string é um label (contém ":" mas não é um valor válido)
  // Labels terminam com ":" ou "*:" ou contêm apenas letras + ":"
  const ehLabel = (str: string): boolean => {
    const trimmed = str.trim();

    // Termina com : ou *:
    if (trimmed.endsWith(":") || trimmed.endsWith("*:")) return true;

    // Padrão "Palavra(s) + dois pontos" (ex: "Data Nascimento:")
    // Mas NÃO capturar valores válidos que por acaso têm : (ex: "10:30", "http://")
    if (/^[A-Za-zÀ-ÿ\s]+\*?:/.test(trimmed)) return true;

    return false;
  };

  // Helper: verifica se é instrução entre parênteses
  const ehInstrucao = (str: string): boolean => {
    return /^\(.*\)$/.test(str.trim());
  };

  // Helper: verifica se é checkbox/radio (texto único: "Sim", "Não", "Masculino", "Feminino")
  const ehOpcaoRadio = (str: string): boolean => {
    const trimmed = str.trim();
    return ["Sim", "Não", "Masculino", "Feminino"].includes(trimmed);
  };

  // Valor capturado na mesma linha
  const valorNaMesmaLinha = match[1]?.trim();

  // Se valor na mesma linha é válido (não é label, não é inválido, não é instrução)
  if (
    valorNaMesmaLinha &&
    !valoresInvalidos.includes(valorNaMesmaLinha) &&
    !ehLabel(valorNaMesmaLinha) &&
    !ehInstrucao(valorNaMesmaLinha) &&
    !ehOpcaoRadio(valorNaMesmaLinha)
  ) {
    return valorNaMesmaLinha;
  }

  // Valor na mesma linha é inválido/vazio, buscar nas próximas linhas
  const posicaoMatch = match.index || 0;
  const textoAposMatch = texto.substring(posicaoMatch + match[0].length);
  const linhas = textoAposMatch.split("\n");

  // Procurar nas próximas linhas (máximo 10 linhas à frente)
  for (let i = 0; i < Math.min(linhas.length, 10); i++) {
    const linha = linhas[i]?.trim();

    // Pular linhas vazias
    if (!linha) continue;

    // DEBUG: Log para diagnosticar problema de "Complemento da Identidade"
    if (regex.source.includes("COMPLEMENTO")) {
      console.log(`[DEBUG] Linha ${i}: "${linha}"`, {
        ehLabel: ehLabel(linha),
        ehInstrucao: ehInstrucao(linha),
        ehOpcaoRadio: ehOpcaoRadio(linha),
        ehInvalido: valoresInvalidos.includes(linha),
      });
    }

    // SE ENCONTROU UM LABEL, o campo original está VAZIO
    if (ehLabel(linha)) {
      return undefined;
    }

    // Pular valores inválidos (placeholders)
    if (valoresInvalidos.includes(linha)) continue;

    // Pular instruções entre parênteses
    if (ehInstrucao(linha)) continue;

    // Pular opções de radio/checkbox (não são valores de texto)
    if (ehOpcaoRadio(linha)) continue;

    // Encontrou valor válido!
    return linha;
  }

  return undefined; // Campo vazio (não encontrou valor válido)
}

/**
 * Limpa CPF (remove formatação)
 */
function limparCPF(cpf: string | undefined): string | undefined {
  return cpf?.replace(/\D/g, "") || undefined;
}

/**
 * Extrai naturalidade (valor após código numérico + quebra de linha)
 * Formato do sistema:
 * "Naturalidade:*\n00007043\nRIO DE JANEIRO"
 * Deve retornar: "RIO DE JANEIRO"
 */
function extrairNaturalidade(texto: string): string | undefined {
  const match = texto.match(/NATURALIDADE:\s*\*?\s*\n\s*\d+\s*\n\s*(.+)/i);
  if (match) {
    return match[1].trim();
  }

  // Fallback: formato inline "Naturalidade: 00001404 IPU"
  const matchInline = texto.match(/NATURALIDADE:\s*(.+)/i);
  if (!matchInline) return undefined;

  const valor = matchInline[1].trim();
  const partes = valor.split(/\s+/);

  // Se tem mais de uma parte, pegar a partir da segunda (remove código)
  if (partes.length > 1) {
    return partes.slice(1).join(" ");
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
  const linhas = texto.split("\n");
  let cpfAluno: string | undefined;
  let cpfMae: string | undefined;
  let cpfPai: string | undefined;

  for (let i = 0; i < linhas.length; i++) {
    const linha = linhas[i];
    const linhaAnterior = i > 0 ? linhas[i - 1] : "";
    const proximaLinha = i < linhas.length - 1 ? linhas[i + 1] : "";

    // Detectar "CPF:" nesta linha
    if (!linha.match(/CPF:\s*$/i) && !linha.match(/CPF:\s*(.+)/i)) continue;

    // Tentar extrair CPF da mesma linha
    const matchCPFMesmaLinha = linha.match(/CPF:\s*(.+)/i);
    let cpfRaw = matchCPFMesmaLinha ? matchCPFMesmaLinha[1].trim() : undefined;

    // Se CPF não está na mesma linha ou está vazio, procurar na próxima
    if (!cpfRaw || cpfRaw === "" || cpfRaw === "\t") {
      cpfRaw = proximaLinha?.trim();
    }

    // Ignorar valores vazios ou tabs
    if (!cpfRaw || cpfRaw === "\t" || cpfRaw === "") continue;

    // Contexto 1: CPF após "Nome da Mãe:"
    // Procurar "Nome da Mãe" nas linhas anteriores (até 3 linhas atrás)
    const contextomae = [
      linhas[i - 3] || "",
      linhas[i - 2] || "",
      linhaAnterior,
    ].some((l) => l.match(/NOME DA MÃE:/i));

    if (contextomae && !cpfMae) {
      cpfMae = cpfRaw;
      continue;
    }

    // Contexto 2: CPF após "Nome do Pai:"
    const contextoPai = [
      linhas[i - 3] || "",
      linhas[i - 2] || "",
      linhaAnterior,
    ].some((l) => l.match(/NOME DO PAI:/i));

    if (contextoPai && !cpfPai) {
      cpfPai = cpfRaw;
      continue;
    }

    // Contexto 3: CPF na seção "Outros Documentos"
    const contextoDocumentos = [
      linhas[i - 5] || "",
      linhas[i - 4] || "",
      linhas[i - 3] || "",
      linhas[i - 2] || "",
      linhaAnterior,
    ].some((l) => l.match(/Outros Documentos|TIPO:|NÚMERO\*?:|ÓRGÃO EMISSOR/i));

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
  const dataNascimento =
    extrairCampo(texto, /DATA NASCIMENTO:\s*(.+)/i) ||
    extrairCampo(texto, /DATA DE NASCIMENTO:\s*(.+)/i);
  const sexoRaw = extrairCampo(texto, /SEXO:\s*(.+)/i);
  const sexo = sexoRaw ? normalizarSexo(sexoRaw) : undefined;
  const estadoCivil = extrairCampo(texto, /ESTADO CIVIL:\s*(.+)/i);
  const paisNascimento = extrairCampo(texto, /PAÍS DE NASCIMENTO:\s*(.+)/i);
  const nacionalidade = extrairCampo(texto, /NACIONALIDADE:\s*(.+)/i);
  const uf = extrairCampo(texto, /UF DE NASCIMENTO:\s*(.+)/i);
  const naturalidade = extrairNaturalidade(texto);
  const necessidadeEspecial = extrairCampo(
    texto,
    /NECESSIDADE ESPECIAL:\s*(.+)/i
  );

  // ===== DOCUMENTOS =====
  const tipoDocumento = extrairCampo(texto, /TIPO:\s*(.+)/i);
  const rg = extrairCampo(texto, /NÚMERO\*?:\s*(.+)/i);
  let complementoIdentidade = extrairCampo(
    texto,
    /COMPLEMENTO DA IDENTIDADE:\s*(.+)\\n/i
  );
  // Se capturou apenas tab ou whitespace, retornar undefined
  if (complementoIdentidade && /^\s*$/.test(complementoIdentidade)) {
    complementoIdentidade = undefined;
  }
  const estadoEmissao = extrairCampo(texto, /ESTADO\*?:\s*(.+)/i);
  const orgaoEmissor = extrairCampo(texto, /ÓRGÃO EMISSOR\*?:\s*(.+)/i);
  const dataEmissaoRG = extrairCampo(texto, /DATA DE EXPEDIÇÃO\*?:\s*(.+)/i);

  // ===== CPFs (parsing contextual para distinguir aluno, mãe, pai) =====
  const { cpfAluno, cpfMae, cpfPai } = extrairCPFs(texto);

  // ===== FILIAÇÃO =====
  const nomeMae = extrairCampo(texto, /NOME DA MÃE:\s*(.+)/i);
  const nomePai = extrairCampo(texto, /NOME DO PAI:\s*(.+)/i);

  // ===== CONTATO =====
  const email =
    extrairCampo(texto, /E-MAIL:\s*(.+)/i) ||
    extrairCampo(texto, /EMAIL:\s*(.+)/i);

  // ===== CERTIDÃO CIVIL =====
  const tipoCertidaoCivil = extrairCampo(
    texto,
    /^TIPO CERTIDÃO CIVIL:\s*(.+)/im
  );
  const numeroCertidaoCivil = extrairCampo(texto, /^CERTIDÃO CIVIL:\s*(.+)/im);
  const ufCartorio = extrairCampo(texto, /^UF DO CARTÓRIO:\s*(.+)/im);
  const municipioCartorio = extrairCampo(
    texto,
    /^MUNICÍPIO DO CARTÓRIO:\s*(.+)/im
  );
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
