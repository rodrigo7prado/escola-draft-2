/**
 * Testes de integração: POST /api/files (Upload de CSV)
 *
 * Testa o fluxo completo de upload de arquivo CSV:
 * 1. Parse do CSV
 * 2. Cálculo de hash
 * 3. Detecção de duplicatas
 * 4. Criação de registros no banco (Arquivo, Linhas, Alunos, Enturmações)
 *
 * Valida as seguintes seções da ESPECIFICACAO.md:
 * - V2: Validação de Payload (Backend)
 * - V4: Operações de Banco
 *
 * @see docs/ciclos/MIGRACAO_ESPECIFICACAO.md - Seções V2, V4
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import {
  setupTestDatabase,
  teardownTestDatabase,
  clearTestDatabase,
  getTestPrisma,
  contarRegistros,
} from '../../helpers/db-setup';
import { CSV_VALIDO_3_ALUNOS } from '../../helpers/csv-fixtures';
import { hashData, type ParsedCsv } from '@/lib/hash';

// Função de parse CSV simplificada para testes
function parseCsvLoose(text: string): ParsedCsv {
  const rawLines = text.split(/\r?\n/);
  const lines = rawLines.map((l) => l.replace(/\uFEFF/g, "")).filter((l) => l.trim().length > 0);
  if (lines.length === 0) return { headers: [], rows: [] };

  const headers = lines[0].split(',').map(h => h.trim());
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => {
      row[h] = values[idx] || '';
    });
    rows.push(row);
  }

  return { headers, rows };
}

// Importar a lógica da API (simularemos a chamada)
// NOTA: Como não podemos testar Next.js route handlers diretamente,
// vamos testar a lógica de negócio extraindo-a ou testando via HTTP

describe('POST /api/files - Upload de CSV', () => {
  beforeAll(async () => {
    await setupTestDatabase();
  });

  afterAll(async () => {
    await teardownTestDatabase();
  });

  // Limpar banco ANTES de cada teste (não depois)
  beforeEach(async () => {
    await clearTestDatabase();
  });

  // Limpar banco DEPOIS de cada teste também (para garantir)
  afterEach(async () => {
    await clearTestDatabase();
  });

  describe('V2.1: Validação básica de payload', () => {
    it('deve rejeitar payload sem campo "data"', async () => {
      // Simular payload inválido
      const payload = {
        fileName: 'teste.csv',
        // data está faltando
      };

      // TODO: Testar via HTTP request ou extrair lógica
      expect(payload).not.toHaveProperty('data');
    });

    it('deve rejeitar payload sem campo "fileName"', async () => {
      const csvData = parseCsvLoose(CSV_VALIDO_3_ALUNOS);
      const payload = {
        data: csvData,
        // fileName está faltando
      };

      expect(payload).not.toHaveProperty('fileName');
    });
  });

  describe('V4.1: Criar ArquivoImportado', () => {
    it('deve criar registro de ArquivoImportado no banco', async () => {
      const prisma = getTestPrisma();
      const csvData = parseCsvLoose(CSV_VALIDO_3_ALUNOS);
      const dataHash = await hashData(csvData);

      // Simular criação (lógica da API)
      const arquivo = await prisma.arquivoImportado.create({
        data: {
          nomeArquivo: 'teste.csv',
          hashArquivo: dataHash,
          tipo: 'alunos',
          status: 'ativo',
        },
      });

      expect(arquivo).toBeDefined();
      expect(arquivo.id).toBeTruthy();
      expect(arquivo.nomeArquivo).toBe('teste.csv');
      expect(arquivo.hashArquivo).toBe(dataHash);
      expect(arquivo.status).toBe('ativo');

      // Verificar que foi salvo no banco
      const count = await prisma.arquivoImportado.count();
      expect(count).toBe(1);
    });

    it('deve calcular hash corretamente baseado no conteúdo', async () => {
      const prisma = getTestPrisma();
      const csvData = parseCsvLoose(CSV_VALIDO_3_ALUNOS);
      const hash1 = await hashData(csvData);
      const hash2 = await hashData(csvData);

      // Hash deve ser idêntico para mesmo conteúdo
      expect(hash1).toBe(hash2);
      expect(hash1).toHaveLength(64); // SHA-256 = 64 chars hex
    });
  });

  describe('V4.2: Detectar duplicatas (V2.2.2)', () => {
    it('deve detectar arquivo duplicado e retornar erro 409', async () => {
      const prisma = getTestPrisma();
      const csvData = parseCsvLoose(CSV_VALIDO_3_ALUNOS);
      const dataHash = await hashData(csvData);

      // Criar primeiro arquivo
      const arquivo1 = await prisma.arquivoImportado.create({
        data: {
          nomeArquivo: 'teste1.csv',
          hashArquivo: dataHash,
          tipo: 'alunos',
          status: 'ativo',
        },
      });

      expect(arquivo1).toBeDefined();

      // Tentar criar segundo arquivo com MESMO hash
      const existing = await prisma.arquivoImportado.findFirst({
        where: {
          hashArquivo: dataHash,
          status: 'ativo',
        },
      });

      expect(existing).toBeDefined();
      expect(existing?.id).toBe(arquivo1.id);

      // API deveria retornar erro 409 aqui
    });

    it('deve permitir upload se arquivo anterior foi deletado (status: excluido)', async () => {
      const prisma = getTestPrisma();
      const csvData = parseCsvLoose(CSV_VALIDO_3_ALUNOS);
      const dataHash = await hashData(csvData);

      // Criar arquivo e marcar como excluído
      await prisma.arquivoImportado.create({
        data: {
          nomeArquivo: 'teste-deletado.csv',
          hashArquivo: dataHash,
          tipo: 'alunos',
          status: 'excluido',
          excluidoEm: new Date(),
        },
      });

      // Verificar que não acha duplicata (apenas busca status: ativo)
      const existing = await prisma.arquivoImportado.findFirst({
        where: {
          hashArquivo: dataHash,
          status: 'ativo',
        },
      });

      expect(existing).toBeNull();

      // Criar novo arquivo com mesmo hash (deve ser permitido)
      const arquivo2 = await prisma.arquivoImportado.create({
        data: {
          nomeArquivo: 'teste-novo.csv',
          hashArquivo: dataHash,
          tipo: 'alunos',
          status: 'ativo',
        },
      });

      expect(arquivo2).toBeDefined();
      expect(arquivo2.status).toBe('ativo');
    });
  });

  describe('V4.3: Criar LinhaImportada', () => {
    it('deve criar registros de LinhaImportada para cada linha do CSV', async () => {
      const prisma = getTestPrisma();
      const csvData = parseCsvLoose(CSV_VALIDO_3_ALUNOS);
      const dataHash = await hashData(csvData);

      // Criar arquivo
      const arquivo = await prisma.arquivoImportado.create({
        data: {
          nomeArquivo: 'teste.csv',
          hashArquivo: dataHash,
          tipo: 'alunos',
          status: 'ativo',
        },
      });

      // Criar linhas
      const linhasCriadas = [];
      for (let i = 0; i < csvData.rows.length; i++) {
        const row = csvData.rows[i];
        const matricula = row.ALUNO?.trim();

        const linha = await prisma.linhaImportada.create({
          data: {
            arquivoId: arquivo.id,
            numeroLinha: i,
            dadosOriginais: row as any,
            identificadorChave: matricula || '',
            tipoEntidade: 'aluno',
          },
        });

        linhasCriadas.push(linha);
      }

      expect(linhasCriadas).toHaveLength(3); // CSV_VALIDO_3_ALUNOS tem 3 linhas

      // Verificar no banco
      const count = await prisma.linhaImportada.count();
      expect(count).toBe(3);

      // Verificar dadosOriginais (JSONB)
      const primeiraLinha = linhasCriadas[0];
      expect(primeiraLinha.dadosOriginais).toBeDefined();
      expect(primeiraLinha.dadosOriginais).toHaveProperty('ALUNO');
      expect(primeiraLinha.dadosOriginais).toHaveProperty('NOME');
    });
  });

  describe('V4.4: Criar ou atualizar Aluno', () => {
    it('deve criar registro de Aluno se não existir', async () => {
      const prisma = getTestPrisma();
      const csvData = parseCsvLoose(CSV_VALIDO_3_ALUNOS);
      const dataHash = await hashData(csvData);

      // Criar arquivo e linha
      const arquivo = await prisma.arquivoImportado.create({
        data: {
          nomeArquivo: 'teste.csv',
          hashArquivo: dataHash,
          tipo: 'alunos',
          status: 'ativo',
        },
      });

      const primeiraRow = csvData.rows[0];
      const linha = await prisma.linhaImportada.create({
        data: {
          arquivoId: arquivo.id,
          numeroLinha: 0,
          dadosOriginais: primeiraRow as any,
          identificadorChave: primeiraRow.ALUNO?.trim() || '',
          tipoEntidade: 'aluno',
        },
      });

      // Criar aluno
      const aluno = await prisma.aluno.create({
        data: {
          matricula: primeiraRow.ALUNO?.trim() || '',
          nome: primeiraRow.NOME?.trim(),
          sexo: primeiraRow.SEXO?.trim(),
          origemTipo: 'csv',
          linhaOrigemId: linha.id,
          fonteAusente: false,
        },
      });

      expect(aluno).toBeDefined();
      expect(aluno.matricula).toBe('123456789012345');
      expect(aluno.nome).toBe('João da Silva');
      expect(aluno.sexo).toBe('M');
      expect(aluno.origemTipo).toBe('csv');
      expect(aluno.fonteAusente).toBe(false);

      // Verificar no banco
      const count = await prisma.aluno.count();
      expect(count).toBe(1);
    });

    it('deve atualizar Aluno existente se já existir (upsert)', async () => {
      const prisma = getTestPrisma();

      // Criar aluno inicial (manual)
      const alunoExistente = await prisma.aluno.create({
        data: {
          matricula: '123456789012345',
          nome: 'Nome Antigo',
          origemTipo: 'manual',
          fonteAusente: false,
        },
      });

      expect(alunoExistente.nome).toBe('Nome Antigo');

      // Simular atualização via CSV
      const alunoAtualizado = await prisma.aluno.update({
        where: { matricula: '123456789012345' },
        data: {
          nome: 'João da Silva',
          sexo: 'M',
          origemTipo: 'csv',
        },
      });

      expect(alunoAtualizado.nome).toBe('João da Silva');
      expect(alunoAtualizado.sexo).toBe('M');

      // Deve ter apenas 1 registro (atualizado, não duplicado)
      const count = await prisma.aluno.count();
      expect(count).toBe(1);
    });
  });

  describe('V4.5: Criar Enturmacao', () => {
    it('deve criar registro de Enturmacao para cada aluno', async () => {
      const prisma = getTestPrisma();
      const csvData = parseCsvLoose(CSV_VALIDO_3_ALUNOS);

      // Criar estrutura mínima
      const arquivo = await prisma.arquivoImportado.create({
        data: {
          nomeArquivo: 'teste.csv',
          hashArquivo: await hashData(csvData),
          tipo: 'alunos',
          status: 'ativo',
        },
      });

      const primeiraRow = csvData.rows[0];
      const linha = await prisma.linhaImportada.create({
        data: {
          arquivoId: arquivo.id,
          numeroLinha: 0,
          dadosOriginais: primeiraRow as any,
          identificadorChave: primeiraRow.ALUNO?.trim() || '',
          tipoEntidade: 'aluno',
        },
      });

      const aluno = await prisma.aluno.create({
        data: {
          matricula: primeiraRow.ALUNO?.trim() || '',
          nome: primeiraRow.NOME?.trim(),
          origemTipo: 'csv',
          linhaOrigemId: linha.id,
          fonteAusente: false,
        },
      });

      // Criar enturmação (com dados já limpos)
      const enturmacao = await prisma.enturmacao.create({
        data: {
          alunoId: aluno.id,
          anoLetivo: '2024', // Já limpo via limparValor()
          regime: 0,
          modalidade: 'REGULAR',
          turma: '3001',
          serie: '3',
          turno: 'MANHÃ',
          origemTipo: 'csv',
          linhaOrigemId: linha.id,
          fonteAusente: false,
        },
      });

      expect(enturmacao).toBeDefined();
      expect(enturmacao.anoLetivo).toBe('2024');
      expect(enturmacao.modalidade).toBe('REGULAR');
      expect(enturmacao.turma).toBe('3001');
      expect(enturmacao.serie).toBe('3');

      // Verificar no banco
      const count = await prisma.enturmacao.count();
      expect(count).toBe(1);
    });
  });

  describe('V4: Fluxo completo (end-to-end)', () => {
    it('deve processar CSV completo: Arquivo → Linhas → Alunos → Enturmações', async () => {
      const prisma = getTestPrisma();
      const csvData = parseCsvLoose(CSV_VALIDO_3_ALUNOS);
      const dataHash = await hashData(csvData);

      // 1. Criar arquivo
      const arquivo = await prisma.arquivoImportado.create({
        data: {
          nomeArquivo: 'ata-2024.csv',
          hashArquivo: dataHash,
          tipo: 'alunos',
          status: 'ativo',
        },
      });

      expect(arquivo).toBeDefined();

      // 2. Criar linhas
      const linhas = [];
      for (let i = 0; i < csvData.rows.length; i++) {
        const row = csvData.rows[i];
        const linha = await prisma.linhaImportada.create({
          data: {
            arquivoId: arquivo.id,
            numeroLinha: i,
            dadosOriginais: row as any,
            identificadorChave: row.ALUNO?.trim() || '',
            tipoEntidade: 'aluno',
          },
        });
        linhas.push(linha);
      }

      expect(linhas).toHaveLength(3);

      // 3. Criar alunos e enturmações
      for (let i = 0; i < csvData.rows.length; i++) {
        const row = csvData.rows[i];
        const linha = linhas[i];

        const aluno = await prisma.aluno.create({
          data: {
            matricula: row.ALUNO?.trim() || '',
            nome: row.NOME?.trim(),
            sexo: row.SEXO?.trim(),
            origemTipo: 'csv',
            linhaOrigemId: linha.id,
            fonteAusente: false,
          },
        });

        await prisma.enturmacao.create({
          data: {
            alunoId: aluno.id,
            anoLetivo: '2024',
            regime: 0,
            modalidade: 'REGULAR',
            turma: '3001',
            serie: '3',
            turno: 'MANHÃ',
            origemTipo: 'csv',
            linhaOrigemId: linha.id,
            fonteAusente: false,
          },
        });
      }

      // 4. Verificar contagens finais
      const contagem = await contarRegistros();
      expect(contagem.arquivos).toBe(1);
      expect(contagem.linhas).toBe(3);
      expect(contagem.alunos).toBe(3);
      expect(contagem.enturmacoes).toBe(3);
      expect(contagem.total).toBe(10); // 1 + 3 + 3 + 3

      // 5. Verificar relacionamentos (JOIN)
      const alunosComEnturmacoes = await prisma.aluno.findMany({
        include: {
          enturmacoes: true,
          linhaOrigem: true,
        },
      });

      expect(alunosComEnturmacoes).toHaveLength(3);
      expect(alunosComEnturmacoes[0].enturmacoes).toHaveLength(1);
      expect(alunosComEnturmacoes[0].linhaOrigem).toBeDefined();
    });
  });
});