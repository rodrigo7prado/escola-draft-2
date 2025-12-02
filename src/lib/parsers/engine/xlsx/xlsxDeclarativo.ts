import {
  type CampoConfig,
  type CampoExtracao,
  type ParserConfig,
  type ParseResult,
  type DisciplinaExtraida,
  type ResumoSerie,
} from "@/lib/parsers/tipos";
import { aplicarNormalizacao } from "@/lib/parsers/engine/xlsx/normalizers";
import { xlsxResolvers as resolvers } from "@/lib/parsers/engine/xlsx/resolvers";
import { loadWorkbookSheets, SheetRows } from "../../xlsx/utils";

type RotuloValor = { rotulo: string; valor: string };

function destinoCampo(cfg: CampoConfig, fallback: string) {
  const persist = cfg.persistencia as { campo?: string } | undefined;
  return persist?.campo ?? fallback;
}

function modeloPersistencia(cfg: CampoConfig) {
  const persist = cfg.persistencia as { modelo?: string } | undefined;
  return persist?.modelo;
}

function normalizarHeaderTexto(raw: string): string {
  return raw
    .replace(/[.%]/g, "")
    .replace(/\s+/g, "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toUpperCase();
}

function coletarRotulos(rows: SheetRows): RotuloValor[] {
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

function extrairPorRotulo(rotulos: RotuloValor[], campo: string, cfg: CampoConfig): unknown {
  const estrategia = cfg.extracao.XLSX;
  if (!estrategia || estrategia.estrategia !== "BLOCO_ROTULO") return undefined;
  const alvo = rotulos.find((r) => estrategia.rotuloRegex.test(r.rotulo));
  if (!alvo) return undefined;
  return aplicarNormalizacao(alvo.valor, cfg.normalizacao);
}

function detectarColunasTabela(
  rows: SheetRows,
  camposTabela: { nome: string; estrategia: CampoExtracao["XLSX"]; cfg: CampoConfig }[]
) {
  let headerRowNumber: number | undefined;
  const colunas = new Map<string, string>();

  const rowNumbers = Object.keys(rows)
    .map(Number)
    .sort((a, b) => a - b);

  for (const n of rowNumbers) {
    const row = rows[n];
    for (const [col, val] of Object.entries(row)) {
      if (!val) continue;
      const normalized = normalizarHeaderTexto(val);
      for (const campo of camposTabela) {
        const estrategia = campo.estrategia;
        if (!estrategia || estrategia.estrategia !== "TABELA_DISCIPLINAS") continue;
        if (estrategia.colunaHeader.test(normalized)) {
          if (!headerRowNumber) headerRowNumber = n;
          if (!colunas.has(campo.nome)) {
            colunas.set(campo.nome, col);
          }
        }
      }
    }

    if (headerRowNumber && colunas.size === camposTabela.length) break;
  }

  return { headerRowNumber, colunas };
}

function extrairTabela(
  rows: SheetRows,
  camposTabela: { nome: string; estrategia: CampoExtracao["XLSX"]; cfg: CampoConfig }[],
  camposResumo: { nome: string; estrategia: CampoExtracao["XLSX"]; cfg: CampoConfig }[]
) {
  const { headerRowNumber, colunas } = detectarColunasTabela(rows, camposTabela);

  if (!headerRowNumber) {
    return { disciplinas: [] as DisciplinaExtraida[], resumo: {} as ResumoSerie };
  }

  const disciplinas: DisciplinaExtraida[] = [];
  const resumo: ResumoSerie = {};
  const rowNumbers = Object.keys(rows)
    .map(Number)
    .sort((a, b) => a - b);

  const anchorCampo = camposTabela[0]?.nome;
  const anchorCol = anchorCampo ? colunas.get(anchorCampo) : undefined;

  const findColunaPorRegex = (regex: RegExp) => {
    const headerRow = rows[headerRowNumber];
    if (!headerRow) return undefined;
    for (const [col, val] of Object.entries(headerRow)) {
      if (!val) continue;
      if (regex.test(normalizarHeaderTexto(val))) return col;
    }
    return undefined;
  };

  for (const n of rowNumbers) {
    if (n <= headerRowNumber) continue;
    const row = rows[n];
    const anchorVal = anchorCol ? row[anchorCol] : undefined;
    const isResumo = !anchorVal || `${anchorVal}`.trim() === "";

    if (isResumo) {
      for (const campo of camposResumo) {
        const estrategia = campo.estrategia;
        if (!estrategia || estrategia.estrategia !== "RESUMO_TOTAL") continue;
        const regex = estrategia.campo === "C.H" ? /^C\.?H/i : /^%?FR/i;
        const col = findColunaPorRegex(regex);
        const raw = col ? row[col] : undefined;
        if (raw === undefined) continue;
        const normalizado = aplicarNormalizacao(raw, campo.cfg.normalizacao);
        const destino = destinoCampo(campo.cfg, campo.nome);
        (resumo as Record<string, unknown>)[destino] = normalizado;
      }
      continue;
    }

    const disciplina: DisciplinaExtraida = {};
    for (const campo of camposTabela) {
      const col = colunas.get(campo.nome);
      if (!col) continue;
      const raw = row[col];
      const normalizado = aplicarNormalizacao(raw, campo.cfg.normalizacao);
      const destino = destinoCampo(campo.cfg, campo.nome);
      (disciplina as Record<string, unknown>)[destino] = normalizado;
    }

    const algumValor = Object.values(disciplina).some((v) => v !== undefined && v !== "");
    if (algumValor) {
      disciplinas.push(disciplina);
    }
  }

  return { disciplinas, resumo };
}

export async function executarParserXlsxDeclarativo(config: ParserConfig, buffer: Buffer): Promise<ParseResult> {
  const sheets = await loadWorkbookSheets(buffer);
  if (!sheets.length) throw new Error("XLSX sem sheets lidas");

  const camposRotulo = Object.entries(config.campos).filter(
    ([, cfg]) => cfg.extracao.XLSX && cfg.extracao.XLSX.estrategia === "BLOCO_ROTULO"
  );
  const camposTabela = Object.entries(config.campos)
    .filter(([, cfg]) => cfg.extracao.XLSX && cfg.extracao.XLSX.estrategia === "TABELA_DISCIPLINAS")
    .map(([nome, cfg]) => ({ nome, estrategia: cfg.extracao.XLSX, cfg }));
  const camposResumo = Object.entries(config.campos)
    .filter(([, cfg]) => cfg.extracao.XLSX && cfg.extracao.XLSX.estrategia === "RESUMO_TOTAL")
    .map(([nome, cfg]) => ({ nome, estrategia: cfg.extracao.XLSX, cfg }));
  const camposResolver = Object.entries(config.campos)
    .filter(([, cfg]) => cfg.extracao.XLSX && cfg.extracao.XLSX.estrategia === "RESOLVER")
    .map(([nome, cfg]) => ({ nome, estrategia: cfg.extracao.XLSX, cfg }));

  const aluno: Record<string, unknown> = {};
  const rotulosPrimeira = coletarRotulos(sheets[0].rows);
  for (const [campo, cfg] of camposRotulo) {
    if (modeloPersistencia(cfg) === "Aluno") {
      const valor = extrairPorRotulo(rotulosPrimeira, campo, cfg);
      if (valor !== undefined) {
        const destino = destinoCampo(cfg, campo);
        aluno[destino] = valor;
      }
    }
  }

  const series: ParseResult["series"] = [];
  for (const sheet of sheets) {
    const rotulosSheet = coletarRotulos(sheet.rows);
    const contexto: Record<string, unknown> = {};

    for (const [campo, cfg] of camposRotulo) {
      if (modeloPersistencia(cfg) === "Aluno") continue;
      const valor = extrairPorRotulo(rotulosSheet, campo, cfg);
      if (valor !== undefined) {
        const destino = destinoCampo(cfg, campo);
        contexto[destino] = valor;
      }
    }

    const { disciplinas, resumo } = extrairTabela(sheet.rows, camposTabela, camposResumo);

    series.push({ contexto, disciplinas, resumo });
  }

  // Resolvers globais (ex.: situacaoFinal)
  const resolverContext = { sheets };
  for (const campoResolver of camposResolver) {
    const estrategia = campoResolver.estrategia;
    if (!estrategia || estrategia.estrategia !== "RESOLVER") continue;
    const resolver = resolvers[estrategia.resolverNome];
    if (!resolver) continue;
    const valor = resolver(resolverContext);
    if (valor === undefined) continue;
    const destino = destinoCampo(campoResolver.cfg, campoResolver.nome);
    for (const serie of series) {
      (serie.resumo as Record<string, unknown>)[destino] = aplicarNormalizacao(
        valor,
        campoResolver.cfg.normalizacao
      );
    }
  }

  return { aluno, series };
}
