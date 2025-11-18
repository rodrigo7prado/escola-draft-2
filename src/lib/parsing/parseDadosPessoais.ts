import { normalizarSexo } from "./normalizarSexo";
import { normalizarTextoBase, normalizarTextoParaComparacao } from "./parsingUtils";

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

type EstrategiaCaptura =
  | "mesmaLinha"
  | "mesmaOuProxima"
  | "proximaLinha"
  | "naturalidade";

type SanitizeFn = (valor: string) => string | undefined;

interface CampoDescritor {
  campo: keyof DadosPessoais;
  label: string;
  estrategia: EstrategiaCaptura;
  sanitize?: SanitizeFn;
  ancora?: string;
  aliases?: string[];
}

interface LinhaProcessada {
  raw: string;
  normalized: string;
  normalizedLabel: string;
}

const PLACEHOLDERS = new Set([
  "",
  "*",
  "V",
  "SELECIONE",
  "SAIBA MAIS",
  "NAO DECLARADO",
  "NAO DECLARADA",
  "NAO INFORMADO",
  "NAO INFORMADA",
  "NAO SE APLICA",
  "NAO SE APLICA.",
  "NAO DECLARADO.",
  "MASCULINO FEMININO",
]);

const CAMPOS_DESCRITORES: CampoDescritor[] = [
  { campo: "nome", label: "NOME", estrategia: "mesmaOuProxima" },
  { campo: "nomeSocial", label: "NOME SOCIAL", estrategia: "mesmaOuProxima" },
  {
    campo: "dataNascimento",
    label: "DATA NASCIMENTO",
    aliases: ["DATA DE NASCIMENTO"],
    estrategia: "mesmaOuProxima",
  },
  { campo: "estadoCivil", label: "ESTADO CIVIL", estrategia: "mesmaOuProxima" },
  {
    campo: "paisNascimento",
    label: "PAIS DE NASCIMENTO",
    estrategia: "mesmaOuProxima",
  },
  {
    campo: "nacionalidade",
    label: "NACIONALIDADE",
    estrategia: "mesmaOuProxima",
  },
  { campo: "uf", label: "UF DE NASCIMENTO", estrategia: "mesmaOuProxima" },
  {
    campo: "naturalidade",
    label: "NATURALIDADE",
    estrategia: "naturalidade",
    sanitize: sanitizeNaturalidade,
  },
  {
    campo: "necessidadeEspecial",
    label: "NECESSIDADE ESPECIAL",
    estrategia: "mesmaOuProxima",
  },
  { campo: "nomeMae", label: "NOME DA MAE", estrategia: "mesmaOuProxima" },
  {
    campo: "cpfMae",
    label: "CPF",
    estrategia: "mesmaOuProxima",
    sanitize: sanitizeCPF,
  },
  { campo: "nomePai", label: "NOME DO PAI", estrategia: "mesmaOuProxima" },
  {
    campo: "cpfPai",
    label: "CPF",
    estrategia: "mesmaOuProxima",
    sanitize: sanitizeCPF,
  },
  { campo: "email", label: "E-MAIL", estrategia: "mesmaOuProxima" },
  {
    campo: "cpf",
    label: "CPF",
    estrategia: "mesmaOuProxima",
    sanitize: sanitizeCPF,
    ancora: "OUTROS DOCUMENTOS",
  },
  {
    campo: "tipoDocumento",
    label: "TIPO",
    estrategia: "mesmaOuProxima",
    ancora: "OUTROS DOCUMENTOS",
  },
  {
    campo: "rg",
    label: "NUMERO",
    estrategia: "mesmaOuProxima",
    ancora: "OUTROS DOCUMENTOS",
  },
  {
    campo: "complementoIdentidade",
    label: "COMPLEMENTO DA IDENTIDADE",
    estrategia: "mesmaOuProxima",
    ancora: "OUTROS DOCUMENTOS",
  },
  {
    campo: "estadoEmissao",
    label: "ESTADO",
    estrategia: "mesmaOuProxima",
    ancora: "OUTROS DOCUMENTOS",
  },
  {
    campo: "orgaoEmissor",
    label: "ORGAO EMISSOR",
    estrategia: "mesmaOuProxima",
    ancora: "OUTROS DOCUMENTOS",
  },
  {
    campo: "dataEmissaoRG",
    label: "DATA DE EXPEDICAO",
    estrategia: "mesmaOuProxima",
    ancora: "OUTROS DOCUMENTOS",
  },
  {
    campo: "tipoCertidaoCivil",
    label: "TIPO CERTIDAO CIVIL",
    estrategia: "mesmaOuProxima",
    ancora: "CERTIDAO CIVIL",
  },
  {
    campo: "numeroCertidaoCivil",
    label: "CERTIDAO CIVIL",
    estrategia: "mesmaOuProxima",
    ancora: "CERTIDAO CIVIL",
  },
  {
    campo: "ufCartorio",
    label: "UF DO CARTORIO",
    estrategia: "mesmaOuProxima",
    ancora: "CERTIDAO CIVIL",
  },
  {
    campo: "municipioCartorio",
    label: "MUNICIPIO DO CARTORIO",
    estrategia: "mesmaOuProxima",
    ancora: "CERTIDAO CIVIL",
  },
  {
    campo: "nomeCartorio",
    label: "CARTORIO",
    estrategia: "mesmaOuProxima",
    ancora: "CERTIDAO CIVIL",
  },
  {
    campo: "numeroTermo",
    label: "NUMERO DO TERMO",
    estrategia: "mesmaOuProxima",
    ancora: "CERTIDAO CIVIL",
  },
  {
    campo: "dataEmissaoCertidao",
    label: "DATA DE EMISSAO",
    estrategia: "mesmaOuProxima",
    ancora: "CERTIDAO CIVIL",
  },
  {
    campo: "estadoCertidao",
    label: "ESTADO",
    estrategia: "mesmaOuProxima",
    ancora: "CERTIDAO CIVIL",
  },
  {
    campo: "folhaCertidao",
    label: "FOLHA",
    estrategia: "mesmaOuProxima",
    ancora: "CERTIDAO CIVIL",
  },
  {
    campo: "livroCertidao",
    label: "LIVRO",
    estrategia: "mesmaOuProxima",
    ancora: "CERTIDAO CIVIL",
  },
];

export function parseDadosPessoais(texto: string): DadosPessoais {
  const textoNormalizado = normalizarTextoBase(texto);
  const trechoDados = extrairTrechoDadosPessoais(textoNormalizado);
  const linhas = prepararLinhas(trechoDados);
  const camposSequenciais = extrairCamposOrdenados(linhas);

  const sexo = extrairSexo(textoNormalizado);

  return {
    ...camposSequenciais,
    sexo: sexo as DadosPessoais["sexo"],
  };
}

function extrairCamposOrdenados(
  linhas: LinhaProcessada[]
): Partial<DadosPessoais> {
  const resultado: Partial<DadosPessoais> = {};
  let cursor = 0;

  for (const descritor of CAMPOS_DESCRITORES) {
    const indiceLabel = encontrarIndiceLabel(linhas, descritor, cursor);
    if (indiceLabel === -1) {
      continue;
    }

    const { valor, nextIndex } = capturarValor(linhas, indiceLabel, descritor);

    if (valor !== undefined) {
      (resultado as Record<keyof DadosPessoais, string | undefined>)[
        descritor.campo
      ] = valor;
    }

    cursor = Math.max(cursor, nextIndex);
  }

  return resultado;
}

function encontrarIndiceLabel(
  linhas: LinhaProcessada[],
  descritor: CampoDescritor,
  inicio: number
): number {
  const possiveis = [
    normalizarParaComparacao(descritor.label),
    ...(descritor.aliases?.map(normalizarParaComparacao) ?? []),
  ];
  let inicioBusca = inicio;

  if (descritor.ancora) {
    const ancoraNormalizada = normalizarParaComparacao(descritor.ancora);
    for (let i = inicio; i < linhas.length; i++) {
      if (linhas[i].normalizedLabel === ancoraNormalizada) {
        inicioBusca = i;
        break;
      }
    }
  }

  for (let i = inicioBusca; i < linhas.length; i++) {
    if (!linhas[i].raw.includes(":")) {
      continue;
    }

    const labelNormalizada = linhas[i].normalizedLabel;
    const corresponde = possiveis.some(
      (alvo) =>
        labelNormalizada === alvo || labelNormalizada.endsWith(` ${alvo}`)
    );

    if (corresponde) {
      return i;
    }
  }

  return -1;
}

function capturarValor(
  linhas: LinhaProcessada[],
  indiceLabel: number,
  descritor: CampoDescritor
): { valor?: string; nextIndex: number } {
  let bruto: string | undefined;
  let nextIndex = indiceLabel + 1;

  switch (descritor.estrategia) {
    case "mesmaLinha":
      bruto = capturarMesmaLinha(linhas[indiceLabel]);
      break;
    case "proximaLinha":
      ({ valor: bruto, nextIndex } = capturarProximaLinha(linhas, indiceLabel));
      break;
    case "mesmaOuProxima":
      bruto = capturarMesmaLinha(linhas[indiceLabel]);
      if (!valorDisponivel(bruto)) {
        const resultadoProxima = capturarProximaLinha(linhas, indiceLabel);
        bruto = resultadoProxima.valor;
        nextIndex = resultadoProxima.nextIndex;
      }
      break;
    case "naturalidade":
      ({ valor: bruto, nextIndex } = capturarNaturalidade(linhas, indiceLabel));
      break;
  }

  if (!valorDisponivel(bruto)) {
    return { valor: undefined, nextIndex };
  }

  const valorSanitizado = descritor.sanitize
    ? descritor.sanitize(bruto!)
    : sanitizeValorBase(bruto);

  return { valor: valorSanitizado, nextIndex };
}

function capturarMesmaLinha(linha: LinhaProcessada): string | undefined {
  if (!linha.raw.includes(":")) {
    return undefined;
  }

  const [, ...resto] = linha.raw.split(":");
  const valor = resto.join(":");
  return valor.trim();
}

function capturarProximaLinha(
  linhas: LinhaProcessada[],
  indiceLabel: number
): { valor?: string; nextIndex: number } {
  for (let i = indiceLabel + 1; i < linhas.length; i++) {
    const candidato = linhas[i].raw.trim();

    if (!candidato) {
      continue;
    }

    if (ehInstrucao(candidato)) {
      continue;
    }

    if (ehLinhaLabelSemValor(linhas[i])) {
      break;
    }

    if (PLACEHOLDERS.has(normalizarParaComparacao(candidato))) {
      continue;
    }

    return { valor: candidato, nextIndex: i + 1 };
  }

  return { valor: undefined, nextIndex: indiceLabel + 1 };
}

function capturarNaturalidade(
  linhas: LinhaProcessada[],
  indiceLabel: number
): { valor?: string; nextIndex: number } {
  const valorMesmaLinha = capturarMesmaLinha(linhas[indiceLabel]);
  if (valorDisponivel(valorMesmaLinha)) {
    return { valor: valorMesmaLinha, nextIndex: indiceLabel + 1 };
  }

  for (let i = indiceLabel + 1; i < linhas.length; i++) {
    const linha = linhas[i].raw.trim();
    if (!linha) continue;

    if (/^\d+$/.test(linha)) {
      const possivelCidade = linhas[i + 1]?.raw.trim();
      if (possivelCidade) {
        return { valor: possivelCidade, nextIndex: i + 2 };
      }
      continue;
    }

    if (ehLinhaLabelSemValor(linhas[i])) {
      break;
    }

    if (!PLACEHOLDERS.has(normalizarParaComparacao(linha))) {
      return { valor: linha, nextIndex: i + 1 };
    }
  }

  return { valor: undefined, nextIndex: indiceLabel + 1 };
}

function extrairSexo(texto: string): DadosPessoais["sexo"] {
  const match = texto.match(/SEXO:\s*([^\n]+)/i);
  if (!match) return undefined;
  const sexoNormalizado = normalizarSexo(match[1]);
  return sexoNormalizado ?? undefined;
}


function extrairTrechoDadosPessoais(texto: string): string {
  const inicio = texto.search(/Dados Pessoais/i);
  if (inicio === -1) {
    return texto;
  }

  const fim = texto.slice(inicio).search(/Pr[oó]ximo/iu);
  if (fim === -1) {
    return texto.slice(inicio);
  }

  return texto.slice(inicio, inicio + fim);
}

function prepararLinhas(texto: string): LinhaProcessada[] {
  return texto.split("\n").map((linha) => {
    const raw = linha.replace(/\t/g, " ").trimEnd();
    const normalized = normalizarParaComparacao(raw);
    const normalizedLabel = normalizarParaComparacao(raw.split(":")[0] || raw);
    return { raw, normalized, normalizedLabel };
  });
}

// Função mantida como wrapper para manter compatibilidade com código existente
function normalizarParaComparacao(texto: string): string {
  return normalizarTextoParaComparacao(texto);
}

function sanitizeValorBase(valor?: string): string | undefined {
  if (!valor) return undefined;
  const normalizado = valor.replace(/\s+/g, " ").trim();
  if (!normalizado) return undefined;
  if (PLACEHOLDERS.has(normalizarParaComparacao(normalizado))) return undefined;
  return normalizado;
}

function sanitizeCPF(valor: string): string | undefined {
  const digitos = valor.replace(/\D/g, "");
  return digitos.length ? digitos : undefined;
}

function sanitizeNaturalidade(valor: string): string | undefined {
  return sanitizeValorBase(valor.replace(/^\d+\s*/, ""));
}

function valorDisponivel(valor?: string): boolean {
  if (!valor) return false;
  return !!sanitizeValorBase(valor);
}

function ehInstrucao(valor: string): boolean {
  const trimmed = valor.trim();
  return trimmed.startsWith("(") && trimmed.endsWith(")");
}

function ehLinhaLabelSemValor(linha: LinhaProcessada): boolean {
  const trimmed = linha.raw.trim();
  if (!trimmed.includes(":")) {
    return false;
  }

  const [, ...resto] = trimmed.split(":");
  const depois = resto.join(":").trim();
  return depois === "" || depois === "*" || depois === "-";
}
