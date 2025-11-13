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

export type ResumoDadosPessoais = {
  totalCampos: number;
  camposPreenchidos: number;
  percentual: number;
  completo: boolean;
  pendentes: CampoDadosPessoais[];
};

export const TOTAL_CAMPOS_DADOS_PESSOAIS = CAMPOS_DADOS_PESSOAIS.length;

export type ValoresDadosPessoais = Partial<Record<CampoDadosPessoais, unknown>>;

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
