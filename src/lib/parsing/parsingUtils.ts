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