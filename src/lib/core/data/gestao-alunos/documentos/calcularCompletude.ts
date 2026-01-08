import dadosEscolares from "../def-objects/dadosEscolares";
import dadosPessoais from "../def-objects/dadosPessoais";
import historicoEscolar from "../def-objects/historicoEscolar";
import { type DocEmissao, type Phase, type PhaseStatus } from "../phases.types";
import {
  CAMPOS_DADOS_PESSOAIS_ALIASES,
  CAMPOS_DADOS_PESSOAIS_CONFIG,
} from "@/lib/importacao/dadosPessoaisMetadata";

type SerieCursadaCompleta = Record<string, unknown> & {
  historicos?: Record<string, unknown>[];
  _count?: { historicos?: number };
};

export type DadosAlunoCompleto = Record<string, unknown> & {
  seriesCursadas?: SerieCursadaCompleta[];
};

export type CampoFaltante = {
  campo: string;
  label: string;
  tabela: string;
  fase: Phase;
};

export type CompletudeDocumento = {
  documento: DocEmissao;
  status: PhaseStatus;
  percentual: number;
  camposPreenchidos: number;
  totalCampos: number;
  camposFaltantes: CampoFaltante[];
};

export type ResumoCompletudeEmissao = {
  statusGeral: PhaseStatus;
  documentosProntos: number;
  totalDocumentos: number;
  porDocumento: Record<DocEmissao, CompletudeDocumento>;
};

const DOCUMENTOS_EMISSAO: DocEmissao[] = [
  "Certidão",
  "Certificado",
  "Diploma",
  "Histórico Escolar",
];

const DEF_OBJECTS = [
  { fase: "FASE:DADOS_PESSOAIS" as const, schema: dadosPessoais },
  { fase: "FASE:DADOS_ESCOLARES" as const, schema: dadosEscolares },
  { fase: "FASE:HISTORICO_ESCOLAR" as const, schema: historicoEscolar },
];

const LABELS_POR_CAMPO = new Map<string, string>();
for (const item of CAMPOS_DADOS_PESSOAIS_CONFIG) {
  LABELS_POR_CAMPO.set(item.campo, item.label);
  const alias = CAMPOS_DADOS_PESSOAIS_ALIASES[item.campo];
  if (alias) LABELS_POR_CAMPO.set(alias, item.label);
}
LABELS_POR_CAMPO.set("dataConclusaoEnsinoMedio", "Data conclusao ensino medio");
LABELS_POR_CAMPO.set("observacoes", "Observacoes");

const ALUNO_ALIASES = new Map<string, string>(
  Object.entries(CAMPOS_DADOS_PESSOAIS_ALIASES).map(([campo, alias]) => [
    alias,
    campo,
  ])
);

// [FEAT:emissao-documentos_TEC7] Funcoes puras de completude para documentos.
export function calcularCompletudeDocumento(
  documento: DocEmissao,
  dadosAluno: DadosAlunoCompleto
): CompletudeDocumento {
  let totalCampos = 0;
  let camposPreenchidos = 0;
  const camposFaltantes: CampoFaltante[] = [];

  for (const { fase, schema } of DEF_OBJECTS) {
    for (const [tabela, campos] of Object.entries(schema)) {
      for (const [campo, documentos] of Object.entries(campos)) {
        if (!documentos.includes(documento)) continue;

        totalCampos += 1;
        const preenchido = campoEstaPreenchido(
          tabela,
          campo,
          dadosAluno
        );

        if (preenchido) {
          camposPreenchidos += 1;
        } else {
          camposFaltantes.push({
            campo,
            label: obterLabelCampo(campo),
            tabela,
            fase,
          });
        }
      }
    }
  }

  const percentual =
    totalCampos === 0
      ? 0
      : Math.round((camposPreenchidos / totalCampos) * 100);

  let status: PhaseStatus = "incompleto";
  if (totalCampos === 0 || camposPreenchidos === 0) {
    status = "ausente";
  } else if (camposPreenchidos === totalCampos) {
    status = "completo";
  }

  return {
    documento,
    status,
    percentual,
    camposPreenchidos,
    totalCampos,
    camposFaltantes,
  };
}

export function calcularCompletudeEmissao(
  dadosAluno: DadosAlunoCompleto
): ResumoCompletudeEmissao {
  const porDocumento = DOCUMENTOS_EMISSAO.reduce(
    (acc, documento) => {
      acc[documento] = calcularCompletudeDocumento(documento, dadosAluno);
      return acc;
    },
    {} as Record<DocEmissao, CompletudeDocumento>
  );

  const documentosProntos = Object.values(porDocumento).filter(
    (info) => info.status === "completo"
  ).length;

  const totalDocumentos = DOCUMENTOS_EMISSAO.length;
  const documentosAusentes = Object.values(porDocumento).filter(
    (info) => info.status === "ausente"
  ).length;

  let statusGeral: PhaseStatus = "incompleto";
  if (documentosProntos === totalDocumentos) {
    statusGeral = "completo";
  } else if (documentosAusentes === totalDocumentos) {
    statusGeral = "ausente";
  }

  return {
    statusGeral,
    documentosProntos,
    totalDocumentos,
    porDocumento,
  };
}

function campoEstaPreenchido(
  tabela: string,
  campo: string,
  dadosAluno: DadosAlunoCompleto
): boolean {
  if (tabela === "Aluno") {
    const valor = obterValorCampoAluno(dadosAluno, campo);
    return valorPreenchido(valor);
  }

  const series = obterSeriesCursadas(dadosAluno);

  if (tabela === "SerieCursada") {
    return campoPreenchidoEmColecao(series, campo);
  }

  if (tabela === "HistoricoEscolar") {
    const historicos = obterHistoricos(series);
    if (historicos.length === 0) return false;
    return campoPreenchidoEmColecao(historicos, campo);
  }

  return false;
}

function obterSeriesCursadas(dadosAluno: DadosAlunoCompleto): SerieCursadaCompleta[] {
  return Array.isArray(dadosAluno.seriesCursadas)
    ? dadosAluno.seriesCursadas
    : [];
}

function obterHistoricos(series: SerieCursadaCompleta[]): Record<string, unknown>[] {
  const historicos: Record<string, unknown>[] = [];
  for (const serie of series) {
    if (Array.isArray(serie.historicos)) {
      historicos.push(...serie.historicos);
    } else if (serie._count?.historicos) {
      historicos.push({ _count: serie._count.historicos });
    }
  }
  return historicos;
}

function campoPreenchidoEmColecao(
  registros: Record<string, unknown>[],
  campo: string
): boolean {
  return registros.some((registro) => valorPreenchido(registro[campo]));
}

function obterValorCampoAluno(
  dadosAluno: Record<string, unknown>,
  campo: string
): unknown {
  if (campo in dadosAluno) return dadosAluno[campo];
  const alias = ALUNO_ALIASES.get(campo);
  if (alias && alias in dadosAluno) return dadosAluno[alias];
  return undefined;
}

function obterLabelCampo(campo: string): string {
  return LABELS_POR_CAMPO.get(campo) ?? humanizarCampo(campo);
}

function valorPreenchido(valor: unknown): boolean {
  if (valor === null || valor === undefined) return false;
  if (typeof valor === "string") return valor.trim().length > 0;
  if (typeof valor === "number") return Number.isFinite(valor);
  if (typeof valor === "boolean") return true;
  if (Array.isArray(valor)) return valor.length > 0;
  if (valor instanceof Date) return !Number.isNaN(valor.getTime());
  return true;
}

function humanizarCampo(campo: string): string {
  const texto = campo
    .replace(/_/g, " ")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/\s+/g, " ")
    .trim();

  if (!texto) return campo;

  return texto[0].toUpperCase() + texto.slice(1);
}
