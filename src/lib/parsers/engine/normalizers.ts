import type { Normalizacao } from "@/lib/parsers/tipos";

export function aplicarNormalizacao(valor: unknown, normalizacao?: Normalizacao): unknown {
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
