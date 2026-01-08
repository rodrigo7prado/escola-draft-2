import type { MetadadosInstituicao } from "@/config/instituicao";

export type TipoDocumento =
  | "CERTIDAO"
  | "CERTIFICADO"
  | "HISTORICO"
  | "DIPLOMA";

export type StatusDisponibilidade =
  | "disponivel"
  | "indisponivel"
  | "parcial";

export type DadosAlunoBasicos = Record<string, unknown>;
export type DadosSerieCursada = Record<string, unknown>;
export type DadosConclusao = Record<string, unknown>;
export type DadosHistoricoSerie = Record<string, unknown>;

export interface DadosCertidao {
  aluno: DadosAlunoBasicos;
  serie: DadosSerieCursada;
  metadados: MetadadosInstituicao;
}

export interface DadosCertificado extends DadosCertidao {
  conclusao: DadosConclusao;
}

export interface DadosDiploma extends DadosCertificado {}

export interface DadosHistoricoEscolar {
  aluno: DadosAlunoBasicos;
  series: DadosSerieCursada[];
  historicosPorSerie: DadosHistoricoSerie[];
  metadados: MetadadosInstituicao;
}

export interface CampoFaltante {
  campo: string;
  label: string;
  categoria: string;
  abaId: string;
}

export interface ResultadoValidacao {
  disponivel: boolean;
  percentual: number;
  camposFaltantes: CampoFaltante[];
}
