import type { TipoDocumento } from "./types";

export type LayoutDocumento = {
  pagina: {
    larguraPt: number;
    alturaPt: number;
  };
  margensPt: {
    superior: number;
    inferior: number;
    esquerda: number;
    direita: number;
  };
  espacamentoEntreLinhas: number;
  fontesPt: {
    titulo: number;
    subtitulo: number;
    corpo: number;
    rodape: number;
    assinatura: number;
  };
  alinhamento: {
    titulo: "centralizado";
    corpo: "justificado" | "esquerda";
  };
  cabecalho: {
    incluirBrasoes: boolean;
    incluirInstituicao: boolean;
  };
  rodape: {
    incluirCoordenadoria: boolean;
    incluirAssinaturas: boolean;
  };
};

const PAGINA_A4 = {
  larguraPt: 595.3,
  alturaPt: 841.9,
};

const MARGENS_PADRAO = {
  superior: 56.7,
  inferior: 56.7,
  esquerda: 56.7,
  direita: 56.7,
};

const LAYOUT_PADRAO: LayoutDocumento = {
  pagina: PAGINA_A4,
  margensPt: MARGENS_PADRAO,
  espacamentoEntreLinhas: 1.25,
  fontesPt: {
    titulo: 20,
    subtitulo: 16,
    corpo: 11,
    rodape: 10,
    assinatura: 11,
  },
  alinhamento: {
    titulo: "centralizado",
    corpo: "justificado",
  },
  cabecalho: {
    incluirBrasoes: true,
    incluirInstituicao: true,
  },
  rodape: {
    incluirCoordenadoria: true,
    incluirAssinaturas: true,
  },
};

export const MAPEAMENTO_LAYOUT_DOCUMENTOS: Record<TipoDocumento, LayoutDocumento> = {
  CERTIDAO: LAYOUT_PADRAO,
  CERTIFICADO: LAYOUT_PADRAO,
  DIPLOMA: LAYOUT_PADRAO,
  HISTORICO: {
    ...LAYOUT_PADRAO,
    alinhamento: {
      titulo: "centralizado",
      corpo: "esquerda",
    },
  },
};
