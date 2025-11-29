export type Formato = "CSV" | "XML" | "TXT" | "XLSX";

export type EstrategiaXLSX =
  | { estrategia: "BLOCO_ROTULO"; rotuloRegex: RegExp }
  | { estrategia: "TABELA_DISCIPLINAS"; colunaHeader: RegExp }
  | { estrategia: "RESUMO_TOTAL"; campo: "C.H" | "%FR" }
  | { estrategia: "RESOLVER"; resolverNome: "situacaoFinal" };

export type Normalizacao =
  | { tipo: "DATA_ISO" }
  | { tipo: "NUMERO"; formato: "INT" | "FLOAT" }
  | { tipo: "STRING_TRIM_UPPER" }
  | { tipo: "EXTRAIR_POSFIXO"; separador: string };

export type Persistencia =
  | { tipoVinculo: "nenhum" }
  | { tipoVinculo: "gravação" | "vinculação" | "validação" | "composição"; modelo?: string; campo?: string };

export type CampoConfig = {
  extracao: { XLSX: EstrategiaXLSX };
  normalizacao?: Normalizacao;
  persistencia?: Persistencia;
};

export type ParserConfig = {
  parserNome: string;
  formatosSuportados: Formato[];
  campos: Record<string, CampoConfig>;
};

export type ValorExtraido = Record<string, unknown>;

export type DisciplinaExtraida = {
  componenteCurricular?: string;
  cargaHoraria?: number;
  frequencia?: number;
  totalPontos?: number;
  faltasTotais?: number;
};

export type ResumoSerie = {
  cargaHorariaTotal?: number;
  frequenciaGlobal?: number;
  situacaoFinal?: string;
};

export type SerieExtraida = {
  contexto: Record<string, unknown>;
  disciplinas: DisciplinaExtraida[];
  resumo: ResumoSerie;
};

export type ParseResult = {
  aluno: Record<string, unknown>;
  series: SerieExtraida[];
};
