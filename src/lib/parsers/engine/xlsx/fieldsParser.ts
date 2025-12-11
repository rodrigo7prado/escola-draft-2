import { loadWorkbookSheets, type SheetRows } from "../../xlsx/utils";
const debugImport = process.env.DEBUG_IMPORT === "true";

/**
 * Estrutura genérica de dados extraídos de XLSX
 * Não conhece domínio - apenas estruturas de planilha
 */
export type ParsedXlsx = {
  sheets: Array<{
    name: string;
    rotulos: Record<string, string>;
    tabelas: Array<{
      headerRow: number;
      colunasPorHeader: Map<string, string>;
      linhas: Array<Record<string, unknown>>;
    }>;
  }>;
};

/**
 * Parser XLSX genérico
 * Extrai estruturas básicas: rótulos (LABEL: value) e tabelas (headers + rows)
 */
export async function parseXlsxGeneric(
  buffer: Buffer,
  headersParaBuscar: string[]
): Promise<ParsedXlsx> {
  const sheets = await loadWorkbookSheets(buffer);

  const resultado: ParsedXlsx = { sheets: [] };

  for (const sheet of sheets) {
    const rotulos = extrairRotulos(sheet.rows);
    const tabelas = extrairTabelas(sheet.rows, headersParaBuscar, sheet.name);

    resultado.sheets.push({
      name: sheet.name,
      rotulos,
      tabelas,
    });
  }

  return resultado;
}

// ==================== EXTRAÇÃO DE RÓTULOS ====================

/**
 * Extrai pares "RÓTULO: valor" de células
 */
function extrairRotulos(rows: SheetRows): Record<string, string> {
  const rotulos: Record<string, string> = {};

  for (const row of Object.values(rows)) {
    for (const valor of Object.values(row)) {
      if (!valor || typeof valor !== "string") continue;

      const partes = valor.split(":");
      if (partes.length < 2) continue;

      const rotulo = partes[0]?.trim();
      const resto = partes.slice(1).join(":").trim();

      if (!rotulo || !resto) continue;

      const rotuloNormalizado = normalizarTexto(rotulo);
      rotulos[rotuloNormalizado] = resto;
    }
  }

  return rotulos;
}

// ==================== EXTRAÇÃO DE TABELAS ====================

/**
 * Detecta e extrai tabelas baseado em headers
 */
function extrairTabelas(
  rows: SheetRows,
  headersParaBuscar: string[],
  sheetName: string
): Array<{
  headerRow: number;
  colunasPorHeader: Map<string, string>;
  linhas: Array<Record<string, unknown>>;
}> {
  const tabelas: Array<{
    headerRow: number;
    colunasPorHeader: Map<string, string>;
    linhas: Array<Record<string, unknown>>;
  }> = [];

  if (!headersParaBuscar.length) return tabelas;

  const cabecalhos = detectarCabecalhos(rows, headersParaBuscar);
  if (!cabecalhos.length) {
    if (debugImport) {
      console.info("[parse:xlsx] nenhum cabecalho completo encontrado", {
        sheet: sheetName,
        headersBuscados: headersParaBuscar,
      });
    }
    return tabelas;
  }

  cabecalhos.forEach((info, idx) => {
    const headerRow = info.headerRow;
    const colunas = info.colunas;
    const proxHeaderRow = cabecalhos[idx + 1]?.headerRow;
    const linhas = extrairLinhasTabela(rows, headerRow, colunas, proxHeaderRow, sheetName);

    tabelas.push({
      headerRow,
      colunasPorHeader: colunas,
      linhas,
    });
  });

  return tabelas;
}

function detectarCabecalhos(
  rows: SheetRows,
  headersParaBuscar: string[]
): Array<{ headerRow: number; colunas: Map<string, string> }> {
  const encontrados: Array<{ headerRow: number; colunas: Map<string, string> }> = [];
  const rowNumbers = Object.keys(rows)
    .map(Number)
    .sort((a, b) => a - b);

  for (let i = 0; i < rowNumbers.length; i++) {
    const n = rowNumbers[i];
    const row = rows[n];
    const colunas = new Map<string, string>();

    for (const [col, val] of Object.entries(row)) {
      if (!val) continue;
      const cellNormalizado = normalizarHeaderTexto(String(val));

      for (const header of headersParaBuscar) {
        const headerNormalizado = normalizarHeaderTexto(header);

        if (
          cellNormalizado.includes(headerNormalizado) ||
          headerNormalizado.includes(cellNormalizado)
        ) {
          if (!colunas.has(header)) {
            colunas.set(header, col);
          }
        }
      }
    }

    // Header encontrado apenas se 100% das colunas esperadas forem localizadas
    if (colunas.size === headersParaBuscar.length) {
      encontrados.push({ headerRow: n, colunas });
    }
  }

  return encontrados;
}

function extrairLinhasTabela(
  rows: SheetRows,
  headerRow: number,
  colunas: Map<string, string>,
  stopBeforeRow: number | undefined,
  sheetName: string
): Array<Record<string, unknown>> {
  const linhas: Array<Record<string, unknown>> = [];
  const rowNumbers = Object.keys(rows)
    .map(Number)
    .sort((a, b) => a - b);
  let totalConsideradas = 0;
  let descartarVazia = 0;

  for (const n of rowNumbers) {
    if (n <= headerRow) continue;
    if (stopBeforeRow && n >= stopBeforeRow) break;
    totalConsideradas += 1;

    const row = rows[n];
    const linha: Record<string, unknown> = {};

    for (const [header, col] of colunas.entries()) {
      const valor = row[col];
      if (valor !== undefined && valor !== null) {
        linha[header] = valor;
      }
    }

    // Incluir linha se tiver algum dado
    const temDados = Object.values(linha).some((v) => {
      if (typeof v === "string") return v.trim() !== "";
      return v !== undefined && v !== null;
    });

    if (temDados) {
      linhas.push(linha);
    } else {
      descartarVazia += 1;
    }
  }

  if (debugImport) {
    console.info("[parse:xlsx] linhas extraidas da tabela", {
      sheet: sheetName,
      headerRow,
      stopBeforeRow,
      linhasIncluidas: linhas.length,
      linhasConsideradas: totalConsideradas,
      linhasVazias: descartarVazia,
    });
  }

  return linhas;
}

// ==================== UTILITÁRIOS ====================

function normalizarTexto(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toUpperCase()
    .trim();
}

function normalizarHeaderTexto(raw: string): string {
  return raw
    .replace(/[.%]/g, "")
    .replace(/\s+/g, "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toUpperCase();
}
