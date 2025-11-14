export const CAMPOS_DADOS_PESSOAIS = [
  "nome",
  "nomeSocial",
  "sexo",
  "dataNascimento",
  "estadoCivil",
  "paisNascimento",
  "nacionalidade",
  "uf",
  "naturalidade",
  "necessidadeEspecial",
  "tipoDocumento",
  "rg",
  "complementoIdentidade",
  "estadoEmissao",
  "orgaoEmissor",
  "dataEmissaoRG",
  "cpf",
  "nomeMae",
  "cpfMae",
  "nomePai",
  "cpfPai",
  "email",
  "tipoCertidaoCivil",
  "numeroCertidaoCivil",
  "ufCartorio",
  "municipioCartorio",
  "nomeCartorio",
  "numeroTermo",
  "dataEmissaoCertidao",
  "estadoCertidao",
  "folhaCertidao",
  "livroCertidao",
] as const;

export type CampoDadosPessoais = (typeof CAMPOS_DADOS_PESSOAIS)[number];

export type CategoriaDadosPessoais =
  | "cadastro"
  | "documentos"
  | "filiacao"
  | "contato"
  | "certidao";

export type TipoInputCampo = "text" | "date" | "textarea" | "select";

export type CampoDadosConfig = {
  campo: CampoDadosPessoais;
  label: string;
  categoria: CategoriaDadosPessoais;
  input?: TipoInputCampo;
  normalizarComparacao?: (valor: string | null) => string;
  options?: Array<{ value: string; label: string }>;
};

export const CAMPOS_DADOS_PESSOAIS_ALIASES: Partial<
  Record<CampoDadosPessoais, string>
> = {
  orgaoEmissor: "rgOrgaoEmissor",
  dataEmissaoRG: "rgDataEmissao",
};

export const CAMPOS_DADOS_PESSOAIS_CONFIG: ReadonlyArray<CampoDadosConfig> = [
  { campo: "nome", label: "Nome", categoria: "cadastro" },
  { campo: "nomeSocial", label: "Nome Social", categoria: "cadastro" },
  {
    campo: "sexo",
    label: "Sexo",
    categoria: "cadastro",
    input: "select",
    options: [
      { value: "", label: "Selecione..." },
      { value: "M", label: "Masculino" },
      { value: "F", label: "Feminino" },
    ],
  },
  {
    campo: "dataNascimento",
    label: "Data de Nascimento",
    categoria: "cadastro",
    input: "date",
  },
  { campo: "estadoCivil", label: "Estado Civil", categoria: "cadastro" },
  {
    campo: "paisNascimento",
    label: "País de Nascimento",
    categoria: "cadastro",
  },
  { campo: "nacionalidade", label: "Nacionalidade", categoria: "cadastro" },
  { campo: "uf", label: "UF de Nascimento", categoria: "cadastro" },
  { campo: "naturalidade", label: "Naturalidade", categoria: "cadastro" },
  {
    campo: "necessidadeEspecial",
    label: "Necessidade Especial",
    categoria: "cadastro",
  },
  {
    campo: "tipoDocumento",
    label: "Tipo de Documento",
    categoria: "documentos",
  },
  { campo: "rg", label: "RG", categoria: "documentos" },
  {
    campo: "complementoIdentidade",
    label: "Complemento da Identidade",
    categoria: "documentos",
  },
  {
    campo: "estadoEmissao",
    label: "Estado de Emissão",
    categoria: "documentos",
  },
  { campo: "orgaoEmissor", label: "Órgão Emissor", categoria: "documentos" },
  {
    campo: "dataEmissaoRG",
    label: "Data de Expedição",
    categoria: "documentos",
    input: "date",
  },
  {
    campo: "cpf",
    label: "CPF",
    categoria: "documentos",
    normalizarComparacao: normalizarCPF,
  },
  { campo: "nomeMae", label: "Nome da Mãe", categoria: "filiacao" },
  {
    campo: "cpfMae",
    label: "CPF da Mãe",
    categoria: "filiacao",
    normalizarComparacao: normalizarCPF,
  },
  { campo: "nomePai", label: "Nome do Pai", categoria: "filiacao" },
  {
    campo: "cpfPai",
    label: "CPF do Pai",
    categoria: "filiacao",
    normalizarComparacao: normalizarCPF,
  },
  { campo: "email", label: "E-mail", categoria: "contato" },
  {
    campo: "tipoCertidaoCivil",
    label: "Tipo Certidão Civil",
    categoria: "certidao",
  },
  {
    campo: "numeroCertidaoCivil",
    label: "Número da Certidão",
    categoria: "certidao",
  },
  { campo: "ufCartorio", label: "UF do Cartório", categoria: "certidao" },
  {
    campo: "municipioCartorio",
    label: "Município do Cartório",
    categoria: "certidao",
  },
  { campo: "nomeCartorio", label: "Nome do Cartório", categoria: "certidao" },
  { campo: "numeroTermo", label: "Número do Termo", categoria: "certidao" },
  {
    campo: "dataEmissaoCertidao",
    label: "Data de Emissão",
    categoria: "certidao",
    input: "date",
  },
  { campo: "estadoCertidao", label: "Estado", categoria: "certidao" },
  { campo: "folhaCertidao", label: "Folha", categoria: "certidao" },
  { campo: "livroCertidao", label: "Livro", categoria: "certidao" },
];

export const CATEGORIA_LABELS: Record<CategoriaDadosPessoais, string> = {
  cadastro: "Dados Cadastrais",
  documentos: "Documentos",
  filiacao: "Filiação",
  contato: "Contato",
  certidao: "Certidão Civil",
};

export type ResumoDadosPessoais = {
  totalCampos: number;
  camposPreenchidos: number;
  percentual: number;
  completo: boolean;
  pendentes: CampoDadosPessoais[];
};

export const TOTAL_CAMPOS_DADOS_PESSOAIS = CAMPOS_DADOS_PESSOAIS.length;

export type ValoresDadosPessoais = Partial<Record<CampoDadosPessoais, unknown>>;

type Normalizador = (valor: string | null) => string;

const NORMALIZADORES_POR_INPUT: Partial<Record<TipoInputCampo, Normalizador>> = {
  date: normalizarDataComparacao,
  select: normalizarTextoGenerico,
  text: normalizarTextoGenerico,
  textarea: normalizarTextoGenerico,
};

function normalizarTextoGenerico(valor: string | null): string {
  if (!valor) return "";
  return valor.trim().toUpperCase();
}

export function normalizarValorParaComparacao(
  config: CampoDadosConfig,
  valor: string | null
): string {
  if (config.normalizarComparacao) {
    return config.normalizarComparacao(valor);
  }

  if (config.input) {
    const normalizador = NORMALIZADORES_POR_INPUT[config.input];
    if (normalizador) {
      return normalizador(valor);
    }
  }

  return normalizarTextoGenerico(valor);
}

export function calcularResumoDadosPessoais(
  aluno: ValoresDadosPessoais
): ResumoDadosPessoais {
  const pendentes: CampoDadosPessoais[] = [];

  for (const campo of CAMPOS_DADOS_PESSOAIS) {
    const valor = aluno[campo];
    if (!valorPreenchido(valor)) {
      pendentes.push(campo);
    }
  }

  const totalCampos = TOTAL_CAMPOS_DADOS_PESSOAIS;
  const camposPreenchidos = totalCampos - pendentes.length;
  const percentual =
    totalCampos === 0
      ? 0
      : Math.round((camposPreenchidos / totalCampos) * 100);

  return {
    totalCampos,
    camposPreenchidos,
    percentual,
    completo: pendentes.length === 0,
    pendentes,
  };
}

function valorPreenchido(valor: unknown): boolean {
  if (valor === null || valor === undefined) {
    return false;
  }

  if (typeof valor === "string") {
    return valor.trim().length > 0;
  }

  if (valor instanceof Date) {
    return !Number.isNaN(valor.getTime());
  }

  if (typeof valor === "number") {
    return !Number.isNaN(valor);
  }

  return true;
}

export function normalizarDataComparacao(valor: string | null): string {
  if (!valor) return "";
  const trimmed = valor.trim();
  if (!trimmed) return "";

  const isoMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    const [, ano, mes, dia] = isoMatch;
    return `${ano}-${mes}-${dia}`;
  }

  const brMatch = trimmed.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (brMatch) {
    const [, dia, mes, ano] = brMatch;
    return `${ano}-${mes}-${dia}`;
  }

  // fallback: deixar o Date parsear e extrair em UTC
  const parsed = new Date(trimmed);
  if (!Number.isNaN(parsed.getTime())) {
    const ano = parsed.getUTCFullYear();
    const mes = String(parsed.getUTCMonth() + 1).padStart(2, "0");
    const dia = String(parsed.getUTCDate()).padStart(2, "0");
    return `${ano}-${mes}-${dia}`;
  }

  return trimmed.toUpperCase();
}

function normalizarCPF(valor: string | null): string {
  if (!valor) return "";
  return valor.replace(/\D/g, "");
}
