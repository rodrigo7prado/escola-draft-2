const PLACEHOLDER = "________";

export const getCampoTexto = (
  fonte: Record<string, unknown> | null | undefined,
  chave: string,
  fallback: string = PLACEHOLDER
) => {
  if (!fonte) return fallback;
  const valor = fonte[chave];
  if (valor === null || valor === undefined) return fallback;
  if (typeof valor === "string") {
    const limpo = valor.trim();
    return limpo.length ? limpo : fallback;
  }
  if (typeof valor === "number" || typeof valor === "boolean") {
    return String(valor);
  }
  if (valor instanceof Date) {
    return formatarData(valor, fallback);
  }
  try {
    return JSON.stringify(valor);
  } catch {
    return String(valor);
  }
};

export const formatarData = (
  valor: string | Date | null | undefined,
  fallback: string = PLACEHOLDER
) => {
  if (!valor) return fallback;
  if (valor instanceof Date) {
    return valor.toLocaleDateString("pt-BR");
  }
  if (typeof valor === "string") {
    const limpo = valor.trim();
    if (!limpo) return fallback;
    const data = new Date(limpo);
    if (!Number.isNaN(data.getTime())) {
      return data.toLocaleDateString("pt-BR");
    }
    return limpo;
  }
  return fallback;
};

export const formatarDataExtenso = (
  valor: Date | null | undefined,
  fallback: string = PLACEHOLDER
) => {
  if (!valor) return fallback;
  return valor.toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

export const formatarNumero = (
  valor: number | string | null | undefined,
  fallback: string = PLACEHOLDER
) => {
  if (valor === null || valor === undefined) return fallback;
  if (typeof valor === "number") return String(valor);
  if (typeof valor === "string") {
    const limpo = valor.trim();
    return limpo.length ? limpo : fallback;
  }
  return fallback;
};
