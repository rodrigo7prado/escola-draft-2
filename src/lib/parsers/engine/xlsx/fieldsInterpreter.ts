import type { ParseResult, DisciplinaExtraida, ResumoSerie } from "@/lib/parsers/tipos";
import type { ImportFieldDef } from "@/lib/importer/pipelines/csv/types";
import type { ParsedXlsx } from "./fieldsParser";

/**
 * Interpretador genérico que converte ParsedXlsx → ParseResult
 * Usa apenas metadata declarativa de fields (roles, persist.tipo, persist.modelo)
 * NÃO conhece domínio específico
 */
export function interpretarXlsxComFields(
  parsed: ParsedXlsx,
  fields: ImportFieldDef[]
): ParseResult {
  // Separar fields por metadata (genérico)
  const fieldsEntidadePrincipal = fields.filter((f) =>
    f.roles.includes("key") || f.roles.includes("display")
  );
  const fieldsContexto = fields.filter((f) => f.roles.includes("context"));

  // Agrupar fields de gravação por modelo
  const fieldsPorModelo = agruparPorModelo(
    fields.filter((f) => f.persist.tipo === "gravacao")
  );

  // Extrair entidade principal (primeira sheet)
  const primeiraSheet = parsed.sheets[0];
  const entidadePrincipal = extrairDeRotulos(primeiraSheet.rotulos, fieldsEntidadePrincipal);

  // Extrair séries (uma por sheet)
  const series: ParseResult["series"] = [];

  for (const sheet of parsed.sheets) {
    const contexto = extrairDeRotulos(sheet.rotulos, fieldsContexto);
    const { disciplinas, resumo } = extrairDeTabelasGenericas(sheet.tabelas, fieldsPorModelo);

    series.push({ contexto, disciplinas, resumo });
  }

  return { aluno: entidadePrincipal, series };
}

// ==================== AGRUPAMENTO POR MODELO ====================

function agruparPorModelo(fields: ImportFieldDef[]): Map<string, ImportFieldDef[]> {
  const grupos = new Map<string, ImportFieldDef[]>();

  for (const field of fields) {
    if (field.persist.tipo !== "gravacao") continue;

    const modelo = field.persist.modelo;
    if (!grupos.has(modelo)) {
      grupos.set(modelo, []);
    }
    grupos.get(modelo)!.push(field);
  }

  return grupos;
}

// ==================== EXTRAÇÃO DE RÓTULOS ====================

function extrairDeRotulos(
  rotulos: Record<string, string>,
  fields: ImportFieldDef[]
): Record<string, unknown> {
  const dados: Record<string, unknown> = {};

  for (const field of fields) {
    const header = field.source.header;
    if (!header) continue;

    const rotuloNormalizado = normalizarTexto(header);
    const valor = rotulos[rotuloNormalizado];

    if (valor !== undefined) {
      const nomeCampo = getCampoDestino(field);
      dados[nomeCampo] = normalizarValor(valor, field);
    }
  }

  return dados;
}

// ==================== EXTRAÇÃO DE TABELAS ====================

function extrairDeTabelasGenericas(
  tabelas: ParsedXlsx["sheets"][0]["tabelas"],
  fieldsPorModelo: Map<string, ImportFieldDef[]>
): { disciplinas: DisciplinaExtraida[]; resumo: ResumoSerie } {
  const disciplinas: DisciplinaExtraida[] = [];
  const resumo: ResumoSerie = {};

  if (!tabelas.length || !fieldsPorModelo.size) {
    return { disciplinas, resumo };
  }

  const tabela = tabelas[0];
  const modelos = Array.from(fieldsPorModelo.keys());

  // Assumir: primeiro modelo = linhas de dados, demais = resumo
  const modeloDados = modelos[0];
  const modelosResumo = modelos.slice(1);

  const fieldsDados = fieldsPorModelo.get(modeloDados) || [];
  const fieldsResumo = modelosResumo.flatMap((m) => fieldsPorModelo.get(m) || []);

  // Campo âncora (primeiro field de dados)
  const campoAncora = fieldsDados[0];
  const headerAncora = campoAncora?.source.header;

  for (const linhaRaw of tabela.linhas) {
    const valorAncora = headerAncora ? linhaRaw[headerAncora] : undefined;
    const isLinhaVazia = !valorAncora || String(valorAncora).trim() === "";

    if (isLinhaVazia && fieldsResumo.length) {
      // Linha vazia = resumo
      extrairLinha(linhaRaw, fieldsResumo, resumo);
    } else if (!isLinhaVazia) {
      // Linha com dados
      const linha: Record<string, unknown> = {};
      extrairLinha(linhaRaw, fieldsDados, linha);

      const temDados = Object.values(linha).some((v) => v !== undefined && v !== "");
      if (temDados) {
        disciplinas.push(linha);
      }
    }
  }

  return { disciplinas, resumo };
}

function extrairLinha(
  linhaRaw: Record<string, unknown>,
  fields: ImportFieldDef[],
  destino: Record<string, unknown>
): void {
  for (const field of fields) {
    const header = field.source.header;
    if (!header) continue;

    const valorRaw = linhaRaw[header];
    if (valorRaw !== undefined) {
      const nomeCampo = getCampoDestino(field);
      const valorNormalizado = normalizarValor(valorRaw, field);
      destino[nomeCampo] = valorNormalizado;
    }
  }
}

// ==================== UTILITÁRIOS ====================

function getCampoDestino(field: ImportFieldDef): string {
  if (field.persist.tipo === "vinculacao" || field.persist.tipo === "gravacao") {
    return field.persist.campo;
  }
  return field.name;
}

function normalizarTexto(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toUpperCase()
    .trim();
}

/**
 * Normalização declarativa baseada em field.normalize
 */
function normalizarValor(valor: unknown, field: ImportFieldDef): unknown {
  if (valor === undefined || valor === null) return undefined;

  const str = String(valor).trim();
  if (!str) return undefined;

  const normalize = field.normalize;
  if (!normalize || normalize.type === "none") {
    return str;
  }

  switch (normalize.type) {
    case "string":
      if (normalize.transform === "uppercase") return str.toUpperCase();
      if (normalize.transform === "lowercase") return str.toLowerCase();
      if (normalize.transform === "trim") return str.trim();
      return str;

    case "number":
      if (normalize.format === "int") {
        const num = parseInt(str.replace(/\D/g, ""), 10);
        return isNaN(num) ? undefined : num;
      }
      if (normalize.format === "float") {
        const cleaned = str.replace(",", ".").replace(/[^\d.]/g, "");
        const num = parseFloat(cleaned);
        return isNaN(num) ? undefined : num;
      }
      return undefined;

    case "date":
      if (normalize.inputFormat === "DD/MM/YYYY" && normalize.outputFormat === "YYYY-MM-DD") {
        const match = str.match(/(\d{2})\/(\d{2})\/(\d{4})/);
        if (match) {
          return `${match[3]}-${match[2]}-${match[1]}`;
        }
      }
      return str;

    default:
      return str;
  }
}
