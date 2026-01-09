type DataParseResult = Date | null;

export function parseDataBr(valor?: string | null): DataParseResult {
  if (!valor) return null;

  const trimmed = valor.trim();
  if (!trimmed) return null;

  // Accept ISO format if already provided.
  if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
    const iso = new Date(trimmed);
    return Number.isNaN(iso.getTime()) ? null : iso;
  }

  const match = trimmed.match(
    /^(\d{2})\/(\d{2})\/(\d{4})(?:\s+(\d{2}):(\d{2})(?::(\d{2}))?)?$/
  );

  if (!match) return null;

  const [, dia, mes, ano, hora, minuto, segundo] = match;
  const year = Number(ano);
  const month = Number(mes) - 1;
  const day = Number(dia);
  const hours = hora ? Number(hora) : 0;
  const minutes = minuto ? Number(minuto) : 0;
  const seconds = segundo ? Number(segundo) : 0;

  const date = new Date(year, month, day, hours, minutes, seconds);
  if (Number.isNaN(date.getTime())) return null;

  // Validate components to avoid dates like 31/02.
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}
