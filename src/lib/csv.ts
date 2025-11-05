/**
 * Utilitários para processamento de arquivos CSV do Conexão Educação (SEEDUC-RJ)
 *
 * Este módulo centraliza funções críticas para limpeza e transformação de dados
 * dos arquivos CSV exportados do sistema Conexão Educação.
 */

/**
 * Remove prefixos dos campos do CSV do Conexão Educação
 *
 * O sistema Conexão exporta CSVs com valores prefixados, ex:
 * - "Ano Letivo: 2024" → precisa virar "2024"
 * - "Modalidade: REGULAR" → precisa virar "REGULAR"
 * - "Turma: 3001" → precisa virar "3001"
 *
 * Sem essa limpeza, os valores excedem o tamanho das colunas do banco
 * e causam erro "value too long for type character varying(X)"
 *
 * @param valor - Valor do campo CSV (pode ser undefined)
 * @param prefixo - Prefixo esperado (ex: "Ano Letivo:", "Modalidade:")
 * @returns String limpa sem prefixo, ou string vazia se valor undefined
 *
 * @example
 * ```typescript
 * limparValor("Ano Letivo: 2024", "Ano Letivo:")  // "2024"
 * limparValor("Modalidade: REGULAR", "Modalidade:")  // "REGULAR"
 * limparValor("3001", "Turma:")  // "3001" (sem prefixo, retorna original)
 * limparValor(undefined, "Turma:")  // ""
 * limparValor("  Ano Letivo: 2024  ", "Ano Letivo:")  // "2024" (trim aplicado)
 * ```
 */
export function limparValor(
  valor: string | undefined,
  prefixo: string
): string {
  if (!valor) return '';

  const str = valor.toString().trim();

  if (str.startsWith(prefixo)) {
    return str.substring(prefixo.length).trim();
  }

  return str;
}

/**
 * Helper para limpar todos os campos de enturmação de uma vez
 *
 * Aplica limparValor() em todos os campos necessários para criar uma Enturmacao,
 * economizando código repetitivo e garantindo consistência.
 *
 * @param dados - Objeto com dados de uma linha do CSV (Record<string, string>)
 * @returns Objeto com campos limpos prontos para criar Enturmacao
 *
 * @example
 * ```typescript
 * const row = {
 *   "Ano": "Ano Letivo: 2024",
 *   "MODALIDADE": "Modalidade: REGULAR",
 *   "TURMA": "Turma: 3001",
 *   "SERIE": "Série: 3",
 *   "TURNO": "Turno: MANHÃ"
 * };
 *
 * const campos = limparCamposEnturmacao(row);
 * // {
 * //   anoLetivo: "2024",
 * //   modalidade: "REGULAR",
 * //   turma: "3001",
 * //   serie: "3",
 * //   turno: "MANHÃ"
 * // }
 * ```
 */
export function limparCamposEnturmacao(dados: Record<string, string>) {
  // Tentar primeiro "Ano Letivo:", depois "Ano:" como fallback
  let anoLetivo = limparValor(dados.Ano, 'Ano Letivo:');
  if (!anoLetivo || anoLetivo === dados.Ano?.trim()) {
    // Se não removeu o prefixo, tentar alternativa
    anoLetivo = limparValor(dados.Ano, 'Ano:');
  }

  return {
    anoLetivo,
    modalidade: limparValor(dados.MODALIDADE, 'Modalidade:'),
    turma: limparValor(dados.TURMA, 'Turma:'),
    serie: limparValor(dados.SERIE, 'Série:'),
    turno: limparValor(dados.TURNO, 'Turno:') || null
  };
}
