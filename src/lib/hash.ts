/**
 * Utilitários para cálculo de hash de dados CSV
 *
 * Este módulo centraliza a função crítica para calcular hash SHA-256
 * dos dados de CSV, usada para detecção de duplicatas no upload.
 */

import crypto from 'crypto';

/**
 * Tipo representando dados parseados de um CSV
 */
export type ParsedCsv = {
  headers: string[];
  rows: Record<string, string>[];
};

/**
 * Calcula hash SHA-256 dos dados de um CSV parseado
 *
 * O hash é calculado de forma determinística:
 * 1. Headers são ordenados alfabeticamente
 * 2. Rows são ordenadas por concatenação de suas chaves e valores
 * 3. Tudo é serializado em JSON
 * 4. Hash SHA-256 é calculado sobre a string resultante
 *
 * **Propriedade crítica:** Mesmo CSV com linhas em ordem diferente
 * gera o MESMO hash (detecção de duplicatas independente de ordem).
 *
 * @param data - Objeto com headers e rows parseados do CSV
 * @returns Hash SHA-256 em formato hexadecimal (64 caracteres)
 *
 * @example
 * ```typescript
 * const csv1 = {
 *   headers: ['NOME', 'IDADE'],
 *   rows: [
 *     { NOME: 'João', IDADE: '20' },
 *     { NOME: 'Maria', IDADE: '22' }
 *   ]
 * };
 *
 * const csv2 = {
 *   headers: ['IDADE', 'NOME'],  // Ordem diferente
 *   rows: [
 *     { NOME: 'Maria', IDADE: '22' },  // Linhas invertidas
 *     { NOME: 'João', IDADE: '20' }
 *   ]
 * };
 *
 * const hash1 = await hashData(csv1);
 * const hash2 = await hashData(csv2);
 *
 * console.log(hash1 === hash2);  // true - mesmo conteúdo, mesmo hash!
 * ```
 *
 * @see docs/ciclos/MIGRACAO_ESPECIFICACAO.md - V2.2.1: Calcular hash SHA-256
 */
export async function hashData(data: ParsedCsv): Promise<string> {
  // Ordenar rows de forma determinística
  // Cada row é convertida em string "key1:value1|key2:value2|..."
  // e ordenada lexicograficamente
  const sortedRows = [...data.rows].sort((a, b) => {
    const keyA = Object.keys(a)
      .map((k) => `${k}:${a[k]}`)
      .join('|');
    const keyB = Object.keys(b)
      .map((k) => `${k}:${b[k]}`)
      .join('|');
    return keyA.localeCompare(keyB);
  });

  // Serializar com headers ordenados + rows ordenadas
  const str = JSON.stringify({
    headers: data.headers.sort(),
    rows: sortedRows,
  });

  // Calcular hash SHA-256
  return crypto.createHash('sha256').update(str).digest('hex');
}