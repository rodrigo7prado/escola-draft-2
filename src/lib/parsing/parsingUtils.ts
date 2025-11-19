/**
 * Utilitários compartilhados para parsing de dados colados
 * Reutilizado por parseDadosPessoais e parseDadosEscolares
 */

/**
 * Normaliza texto base removendo caracteres especiais e padronizando quebras de linha
 */
export function normalizarTextoBase(texto: string): string {
  return texto
    .replace(/\uFEFF/g, "") // Remove BOM
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\u00a0/g, " ") // Remove non-breaking space
    .trim();
}

/**
 * Opções para normalização de texto para comparação
 */
export interface NormalizacaoOpcoes {
  /** Se true, converte para UPPERCASE; se false, converte para lowercase. Padrão: true */
  uppercase?: boolean;
  /** Caracteres adicionais a remover além dos acentos. Padrão: ['*'] */
  removerCaracteres?: string[];
  /** Se true, normaliza múltiplos espaços em um único. Padrão: true */
  normalizarEspacos?: boolean;
}

/**
 * Normaliza texto para comparação, removendo acentos, caracteres especiais e padronizando case
 * Baseado na implementação de parseDadosPessoais (normalizarParaComparacao)
 */
export function normalizarTextoParaComparacao(
  texto: string,
  options: NormalizacaoOpcoes = {}
): string {
  const {
    uppercase = true,
    removerCaracteres = ["*"],
    normalizarEspacos = true,
  } = options;

  // Remove acentos (NFD + remoção de diacríticos)
  let resultado = texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  // Remove caracteres especificados
  if (removerCaracteres.length > 0) {
    const escaped = removerCaracteres.map((c) => {
      // Escapa caracteres especiais de regex
      return c.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    });
    const pattern = new RegExp(`[${escaped.join("")}]`, "g");
    resultado = resultado.replace(pattern, "");
  }

  // Normaliza espaços múltiplos
  if (normalizarEspacos) {
    resultado = resultado.replace(/\s+/g, " ");
  }

  resultado = resultado.trim();

  return uppercase ? resultado.toUpperCase() : resultado.toLowerCase();
}

/**
 * Estrutura de linha processada para parsing
 */
export interface LinhaProcessada {
  raw: string;
  normalized: string;
  normalizedLabel: string;
}

/**
 * Prepara linhas para processamento
 */
export function prepararLinhas(texto: string): LinhaProcessada[] {
  return texto.split("\n").map((linha) => {
    const raw = linha.replace(/\t/g, " ").trimEnd();
    const normalized = normalizarTextoParaComparacao(raw);
    const normalizedLabel = normalizarTextoParaComparacao(raw.split(":")[0] || raw);
    return { raw, normalized, normalizedLabel };
  });
}

/**
 * Placeholders comuns que devem ser ignorados durante o parsing
 */
export const PLACEHOLDERS = new Set([
  "",
  "*",
  "V",
  "SELECIONE",
  "SAIBA MAIS",
  "NAO DECLARADO",
  "NAO DECLARADA",
  "NAO INFORMADO",
  "NAO INFORMADA",
  "NAO SE APLICA",
  "NAO SE APLICA.",
  "NAO DECLARADO.",
  "MASCULINO FEMININO",
]);

/**
 * Verifica se um valor é disponível (não vazio e não placeholder)
 */
export function valorDisponivel(valor?: string): boolean {
  if (!valor) return false;
  const normalizado = valor.replace(/\s+/g, " ").trim();
  if (!normalizado) return false;
  if (PLACEHOLDERS.has(normalizarTextoParaComparacao(normalizado))) return false;
  return true;
}

/**
 * Verifica se uma linha é uma instrução (texto entre parênteses)
 */
export function ehInstrucao(valor: string): boolean {
  const trimmed = valor.trim();
  return trimmed.startsWith("(") && trimmed.endsWith(")");
}

/**
 * Verifica se uma linha é um label sem valor (termina com : ou :*)
 */
export function ehLinhaLabelSemValor(linha: LinhaProcessada): boolean {
  const trimmed = linha.raw.trim();
  if (!trimmed.includes(":")) {
    return false;
  }

  const [, ...resto] = trimmed.split(":");
  const depois = resto.join(":").trim();
  return depois === "" || depois === "*" || depois === "-";
}

/**
 * Captura valor na mesma linha após os dois pontos
 */
export function capturarMesmaLinha(linha: LinhaProcessada): string | undefined {
  if (!linha.raw.includes(":")) {
    return undefined;
  }

  const [, ...resto] = linha.raw.split(":");
  const valor = resto.join(":");
  return valor.trim();
}

/**
 * Captura valor na próxima linha não-vazia
 */
export function capturarProximaLinha(
  linhas: LinhaProcessada[],
  indiceLabel: number
): { valor?: string; nextIndex: number } {
  for (let i = indiceLabel + 1; i < linhas.length; i++) {
    const candidato = linhas[i].raw.trim();

    if (!candidato) {
      continue;
    }

    if (ehInstrucao(candidato)) {
      continue;
    }

    if (ehLinhaLabelSemValor(linhas[i])) {
      break;
    }

    if (PLACEHOLDERS.has(normalizarTextoParaComparacao(candidato))) {
      continue;
    }

    return { valor: candidato, nextIndex: i + 1 };
  }

  return { valor: undefined, nextIndex: indiceLabel + 1 };
}

/**
 * Captura valor para campo Naturalidade (pula códigos numéricos)
 */
export function capturarNaturalidade(
  linhas: LinhaProcessada[],
  indiceLabel: number
): { valor?: string; nextIndex: number } {
  const valorMesmaLinha = capturarMesmaLinha(linhas[indiceLabel]);
  if (valorDisponivel(valorMesmaLinha)) {
    return { valor: valorMesmaLinha, nextIndex: indiceLabel + 1 };
  }

  for (let i = indiceLabel + 1; i < linhas.length; i++) {
    const linha = linhas[i].raw.trim();
    if (!linha) continue;

    if (/^\d+$/.test(linha)) {
      const possivelCidade = linhas[i + 1]?.raw.trim();
      if (possivelCidade) {
        return { valor: possivelCidade, nextIndex: i + 2 };
      }
      continue;
    }

    if (ehLinhaLabelSemValor(linhas[i])) {
      break;
    }

    if (!PLACEHOLDERS.has(normalizarTextoParaComparacao(linha))) {
      return { valor: linha, nextIndex: i + 1 };
    }
  }

  return { valor: undefined, nextIndex: indiceLabel + 1 };
}