export type Legislacao = {
  leiLDB: string;
  resolucaoSEEDUC: string;
  decretos: {
    EMR: string;
    NEJA: string;
    DIPLOMA: string;
  };
};

export type Brasoes = {
  brasil: string;
  rj: string;
};

export type LivrosRegistro = {
  CERTIDAO: string;
  CERTIFICADO: string;
  DIPLOMA: string;
};

export type MetadadosInstituicao = {
  nome: string;
  governo: string;
  secretaria: string;
  diretor: string;
  secretariaEscolar: string;
  coordenadoria: string;
  regional: string;
  cnpj: string;
  endereco: string;
  legislacao: Legislacao;
  brasoes: Brasoes;
  livros: LivrosRegistro;
};

export const INSTITUICAO_CONFIG: MetadadosInstituicao = {
  nome: "COLÉGIO ESTADUAL SENOR ABRAVANEL",
  governo: "Governo do Estado do Rio de Janeiro",
  secretaria: "Secretaria de Estado de Educação",
  diretor: "",
  secretariaEscolar: "",
  coordenadoria: "Coordenadoria de Inspeção Escolar",
  regional: "Regional Metropolitana VI",
  cnpj: "",
  endereco: "",
  legislacao: {
    leiLDB: "Lei Federal nº 9.394/1996",
    resolucaoSEEDUC: "Resolução SEEDUC nº 6.346/2025",
    decretos: {
      EMR: "Decreto nº 804 de 15 de julho de 1976",
      NEJA: "Decreto nº 43.723/2012",
      DIPLOMA: "Decreto nº 43.723/2012",
    },
  },
  brasoes: {
    brasil: "/documentos-emissao/brasoes/brasao-brasil.jpg",
    rj: "/documentos-emissao/brasoes/brasao-rj.jpg",
  },
  livros: {
    CERTIDAO: "1-A",
    CERTIFICADO: "57-A",
    DIPLOMA: "25",
  },
};
