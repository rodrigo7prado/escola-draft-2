/**
 * Normaliza o valor do campo sexo
 *
 * @param valor - Valor do campo sexo (ex: "Masculino", "M", "Feminino", "F")
 * @returns 'M' | 'F' | undefined (se não puder normalizar)
 */

export function normalizarSexo(valor: string): 'M' | 'F' | undefined {
  if (!valor) {
    return undefined;
  }

  const normalizado = valor.trim().toLowerCase();

  // Masculino ou M
  if (normalizado === 'm' || normalizado === 'masculino') {
    return 'M';
  }

  // Feminino ou F
  if (normalizado === 'f' || normalizado === 'feminino') {
    return 'F';
  }

  // Valor inválido
  return undefined;
}
