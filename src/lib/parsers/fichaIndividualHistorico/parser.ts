import { loadWorkbookSheets } from "../xlsxUtils";
import { executarParser } from "../orquestrador";
import fichaIndividualHistoricoMap from "./mapeamento";
import type {
  CampoConfig,
  DisciplinaExtraida,
  Normalizacao,
  ParseResult,
  ResumoSerie,
  SerieExtraida,
} from "../tipos";

type RotuloValor = { rotulo: string; valor: string };

const camposAluno = ["NOME DO ALUNO", "DATA DE NASCIMENTO", "SEXO", "PAI", "MÃE"] as const;
const camposContexto = ["ANO LETIVO", "PERÍODO LETIVO", "CURSO", "SÉRIE", "TURMA", "TURNO", "ESCOLA"] as const;

const headerMatchers = {
  disciplina: /^DISCIPLINA/i,
  cargaHoraria: /^CH$/i,
  frequencia: /^FR$/i,
  totalPontos: /^PONTOS/i,
  faltasTotais: /^TF$/i,
};

function normalizarHeaderTexto(raw: string): string {
  return raw
    .replace(/[.%]/g, "")
    .replace(/\s+/g, "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toUpperCase();
}

function aplicarNormalizacao(valor: unknown, normalizacao?: Normalizacao): unknown {
  if (!normalizacao) return valor;
  if (valor === undefined || valor === null) return valor;
  if (typeof valor === "string") {
    switch (normalizacao.tipo) {
      case "STRING_TRIM_UPPER":
        return valor.trim().toUpperCase();
      case "EXTRAIR_POSFIXO": {
        const idx = valor.indexOf(normalizacao.separador);
        if (idx === -1) return valor.trim();
        return valor.slice(idx + normalizacao.separador.length).trim();
      }
      case "DATA_ISO": {
        const match = valor.trim().match(/^(\d{2})[\\/](\d{2})[\\/](\d{4})/);
        if (!match) return valor;
        return `${match[3]}-${match[2]}-${match[1]}`;
      }
      case "NUMERO": {
        const cleaned = valor.replace(/[^\d.,-]/g, "").replace(",", ".");
        const num = normalizacao.formato === "INT" ? parseInt(cleaned, 10) : parseFloat(cleaned);
        return Number.isFinite(num) ? num : valor;
      }
      default:
        return valor;
    }
  }
  return valor;
}

function coletarRotulos(rows: Record<number, Record<string, string | undefined>>): RotuloValor[] {
  const encontrados: RotuloValor[] = [];
  for (const row of Object.values(rows)) {
    for (const valor of Object.values(row)) {
      if (!valor || typeof valor !== "string") continue;
      const partes = valor.split(":");
      if (partes.length < 2) continue;
      const rotulo = partes[0]?.trim();
      const resto = partes.slice(1).join(":").trim();
      if (!rotulo || !resto) continue;
      encontrados.push({ rotulo, valor: resto });
    }
  }
  return encontrados;
}

function extrairPorRotulo(
  rotulos: RotuloValor[],
  campo: string,
  cfg: CampoConfig
): unknown {
  const estrategia = cfg.extracao.XLSX;
  if (!estrategia || estrategia.estrategia !== "BLOCO_ROTULO") return undefined;
  const alvo = rotulos.find((r) => estrategia.rotuloRegex.test(r.rotulo));
  if (!alvo) return undefined;
  return aplicarNormalizacao(alvo.valor, cfg.normalizacao);
}

function extrairTabela(rows: Record<number, Record<string, string | undefined>>) {
  let headerRowNumber: number | undefined;
  let headerRow: Record<string, string | undefined> | undefined;

  const rowNumbers = Object.keys(rows)
    .map(Number)
    .sort((a, b) => a - b);

  for (const n of rowNumbers) {
    const row = rows[n];
    const temDisciplina = Object.values(row).some((v) => typeof v === "string" && /DISCIPLINA/i.test(v));
    if (temDisciplina) {
      headerRowNumber = n;
      headerRow = row;
      break;
    }
  }

  if (!headerRowNumber || !headerRow) {
    return { disciplinas: [] as DisciplinaExtraida[], resumo: {} as ResumoSerie };
  }

  const colunas: Partial<Record<keyof typeof headerMatchers, string>> = {};
  for (const [col, val] of Object.entries(headerRow)) {
    if (!val) continue;
    const normalized = normalizarHeaderTexto(val);
    if (headerMatchers.disciplina.test(normalized)) colunas.disciplina = col;
    if (headerMatchers.cargaHoraria.test(normalized)) colunas.cargaHoraria = col;
    if (headerMatchers.frequencia.test(normalized)) colunas.frequencia = col;
    if (headerMatchers.totalPontos.test(normalized)) colunas.totalPontos = col;
    if (headerMatchers.faltasTotais.test(normalized)) colunas.faltasTotais = col;
  }

  const disciplinas: DisciplinaExtraida[] = [];
  const resumo: ResumoSerie = {};

  for (const n of rowNumbers) {
    if (n <= headerRowNumber) continue;
    const row = rows[n];
    const disciplinaRaw = colunas.disciplina ? row[colunas.disciplina] : undefined;
    const isResumo = !disciplinaRaw || disciplinaRaw === "" || disciplinaRaw === undefined;

    const parseNumero = (v?: string) => {
      if (!v) return undefined;
      const num = parseFloat(v.replace(",", "."));
      return Number.isFinite(num) ? num : undefined;
    };

    if (isResumo) {
      const ch = colunas.cargaHoraria ? parseNumero(row[colunas.cargaHoraria]) : undefined;
      const fr = colunas.frequencia ? parseNumero(row[colunas.frequencia]) : undefined;
      if (ch !== undefined) resumo.cargaHorariaTotal = ch;
      if (fr !== undefined) resumo.frequenciaGlobal = fr;
      continue;
    }

    const disciplina: DisciplinaExtraida = {};
    if (disciplinaRaw) disciplina.componenteCurricular = disciplinaRaw.trim();
    if (colunas.cargaHoraria) disciplina.cargaHoraria = parseNumero(row[colunas.cargaHoraria]);
    if (colunas.frequencia) disciplina.frequencia = parseNumero(row[colunas.frequencia]);
    if (colunas.totalPontos) disciplina.totalPontos = parseNumero(row[colunas.totalPontos]);
    if (colunas.faltasTotais) disciplina.faltasTotais = parseNumero(row[colunas.faltasTotais]);

    const algumValor =
      disciplina.componenteCurricular ||
      disciplina.cargaHoraria !== undefined ||
      disciplina.frequencia !== undefined ||
      disciplina.totalPontos !== undefined ||
      disciplina.faltasTotais !== undefined;

    if (algumValor) {
      disciplinas.push(disciplina);
    }
  }

  // Situação final pode estar fora da tabela
  for (const row of Object.values(rows)) {
    for (const val of Object.values(row)) {
      if (!val || typeof val !== "string") continue;
      if (/CONSIDERADO\(A\)/i.test(val) && val.includes(":")) {
        resumo.situacaoFinal = aplicarNormalizacao(val, { tipo: "EXTRAIR_POSFIXO", separador: ":" }) as string;
      }
    }
  }

  return { disciplinas, resumo };
}

async function extrairDados(
  input: Buffer,
  formato: "XLSX" | "CSV" | "XML" | "TXT"
): Promise<ParseResult> {
  if (formato !== "XLSX") {
    throw new Error(`Formato não suportado para este parser: ${formato}`);
  }

  const sheets = await loadWorkbookSheets(input);
  if (!sheets.length) throw new Error("XLSX sem sheets lidas");

  const rotulosPrimeira = coletarRotulos(sheets[0].rows);
  const aluno: Record<string, unknown> = {};

  for (const campo of camposAluno) {
    const cfg = fichaIndividualHistoricoMap.campos[campo];
    const valor = extrairPorRotulo(rotulosPrimeira, campo, cfg);
    if (valor !== undefined) aluno[campo] = valor;
  }

  const series: SerieExtraida[] = [];
  for (const sheet of sheets) {
    const rotulosSheet = coletarRotulos(sheet.rows);
    const contexto: Record<string, unknown> = {};
    for (const campo of camposContexto) {
      const cfg = fichaIndividualHistoricoMap.campos[campo];
      const valor = extrairPorRotulo(rotulosSheet, campo, cfg);
      if (valor !== undefined) contexto[campo] = valor;
    }
    const { disciplinas, resumo } = extrairTabela(sheet.rows);
    series.push({ contexto, disciplinas, resumo });
  }

  // Preenche situacao final global se já encontrada em algum resumo
  const situacaoGlobal =
    series.find((s) => s.resumo.situacaoFinal)?.resumo.situacaoFinal ??
    (extrairPorRotulo(rotulosPrimeira, "SITUAÇÃO FINAL", fichaIndividualHistoricoMap.campos["SITUAÇÃO FINAL"]) as
      | string
      | undefined);

  if (situacaoGlobal) {
    for (const serie of series) {
      if (!serie.resumo.situacaoFinal) {
        serie.resumo.situacaoFinal = situacaoGlobal;
      }
    }
  }

  return { aluno, series };
}

export async function parseFichaIndividualHistorico(buffer: Buffer) {
  return executarParser(fichaIndividualHistoricoMap, buffer, "XLSX", extrairDados);
}
