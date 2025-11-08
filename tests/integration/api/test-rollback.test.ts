/**
 * Teste manual de ROLLBACK da transação
 *
 * Este teste simula um erro no meio do processamento para
 * validar que a transação faz rollback completo.
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { setupTestDatabase, clearTestDatabase, teardownTestDatabase, getTestPrisma } from '../../helpers/db-setup';
import { CSV_VALIDO_3_ALUNOS, parseCsvLoose } from '../../helpers/csv-fixtures';
import type { ParsedCsv } from '@/lib/hash';

describe('TESTE DE ROLLBACK - Transação completa', () => {
  beforeAll(async () => {
    await setupTestDatabase();
  });

  afterAll(async () => {
    await teardownTestDatabase();
  });

  beforeEach(async () => {
    await clearTestDatabase();
  });

  it('deve fazer ROLLBACK completo se houver erro no meio do processamento', async () => {
    const prisma = getTestPrisma();

    // 1. Verificar que banco está vazio
    const countAntes = await prisma.arquivoImportado.count();
    expect(countAntes).toBe(0);

    // 2. Preparar CSV válido e depois corromper
    const csvData = parseCsvLoose(CSV_VALIDO_3_ALUNOS);

    // Corromper o 3º aluno: matrícula com 1000 caracteres (vai violar constraint)
    const csvComErro: ParsedCsv = {
      headers: csvData.headers,
      rows: [
        csvData.rows[0], // Aluno 1 OK
        csvData.rows[1], // Aluno 2 OK
        {
          ...csvData.rows[2],
          ALUNO: 'A'.repeat(1000) // 1000 caracteres - vai causar erro
        }
      ]
    };

    // 3. Tentar fazer upload (deve falhar)
    const response = await fetch('http://localhost:3006/api/files', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        data: csvComErro,
        fileName: 'alunos-com-erro.csv'
      })
    });

    // 4. Validar que retornou erro
    expect(response.ok).toBe(false);

    // 5. VALIDAÇÃO CRÍTICA: Verificar que NENHUM registro foi criado
    const countDepois = {
      arquivos: await prisma.arquivoImportado.count(),
      linhas: await prisma.linhaImportada.count(),
      alunos: await prisma.aluno.count(),
      enturmacoes: await prisma.enturmacao.count()
    };

    // Se a transação funcionou, TODOS devem ser 0
    expect(countDepois.arquivos).toBe(0);
    expect(countDepois.linhas).toBe(0);
    expect(countDepois.alunos).toBe(0);
    expect(countDepois.enturmacoes).toBe(0);

    console.log('✅ ROLLBACK COMPLETO: Nenhum registro foi criado após erro');
  });
});