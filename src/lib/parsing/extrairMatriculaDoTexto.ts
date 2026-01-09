export function extrairMatriculaDoTexto(texto: string): string | null {
  const labelMatch = texto.match(/MATR[IÍ]CULA[^0-9]*([0-9]{15})/i);
  if (labelMatch) {
    return labelMatch[1];
  }

  const genericMatch = texto.match(/\b\d{15}\b/);
  return genericMatch ? genericMatch[0] : null;
}
