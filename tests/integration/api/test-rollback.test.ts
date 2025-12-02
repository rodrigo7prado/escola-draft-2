/**
 * Teste manual de ROLLBACK da transação
 *
 * Este teste simula um erro no meio do processamento para
 * validar que a transação faz rollback completo.
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { setupTestDatabase, clearTestDatabase, teardownTestDatabase, getTestPrisma } from '../../helpers/db-setup';
import { CSV_VALIDO_3_ALUNOS, parseCsvLoose } from '../../helpers/csv-fixtures';
import type { ParsedCsv } from "@/lib/parsers/csv/hash";

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

    // 3. Simular a lógica da API POST /api/files diretamente
    // Não fazemos HTTP request, mas testamos a transação em si
    let erroCapturado = false;

    try {
      // Esta transação deve FALHAR e fazer ROLLBACK
      await prisma.$transaction(async (tx) => {
        // Criar arquivo importado (igual à API)
        const arquivo = await tx.arquivoImportado.create({
          data: {
            nomeArquivo: 'alunos-com-erro.csv',
            hashArquivo: 'hash-teste-erro',
            tipo: 'alunos',
            status: 'ativo'
          }
        });

        // Tentar criar linhas com dados corrompidos
        const linhasData = csvComErro.rows.map((row, i) => ({
          arquivoId: arquivo.id,
          numeroLinha: i,
          dadosOriginais: row as any,
          identificadorChave: row.ALUNO?.trim() || '',
          tipoEntidade: 'aluno' as const
        }));

        // AQUI DEVE FALHAR: matricula tem max 255 chars
        await tx.linhaImportada.createMany({
          data: linhasData
        });

        // Se chegou aqui, não deveria ter chegado
        // Mas vamos continuar para simular processamento adicional
        const linhasCriadas = await tx.linhaImportada.findMany({
          where: { arquivoId: arquivo.id }
        });

        // Criar alunos (isso também pode falhar)
        for (const linha of linhasCriadas) {
          const dados = linha.dadosOriginais as any;
          await tx.aluno.create({
            data: {
              matricula: dados.ALUNO || '',
              nome: dados.NOME_COMPL || null,
              origemTipo: 'csv',
              linhaOrigemId: linha.id,
              fonteAusente: false
            }
          });
        }
      });
    } catch (error) {
      // Esperamos que dê erro
      erroCapturado = true;
    }

    // 4. Validar que houve erro
    expect(erroCapturado).toBe(true);

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
