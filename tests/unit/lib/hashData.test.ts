/**
 * Testes unitários para função de hash de dados CSV
 *
 * Valida a função crítica que calcula hash SHA-256 para detecção de duplicatas.
 * Estes testes cobrem V2.2.1 da MIGRACAO_ESPECIFICACAO.md
 *
 * @see docs/ciclos/MIGRACAO_ESPECIFICACAO.md - V2.2.1: Calcular hash SHA-256
 * @see src/lib/hash.ts - Implementação da função testada
 */

import { describe, it, expect } from 'vitest';
import { hashData, type ParsedCsv } from "@/lib/parsers/csv/hash";

describe('hashData', () => {
  describe('Casos básicos (V2.2.1: Calcular hash SHA-256)', () => {
    it('deve retornar hash SHA-256 válido (64 caracteres hexadecimais)', async () => {
      const data: ParsedCsv = {
        headers: ['NOME', 'IDADE'],
        rows: [{ NOME: 'João', IDADE: '20' }],
      };

      const hash = await hashData(data);

      expect(hash).toBeDefined();
      expect(hash).toHaveLength(64); // SHA-256 = 64 hex chars
      expect(hash).toMatch(/^[a-f0-9]{64}$/); // Apenas hexadecimal minúsculo
    });

    it('deve retornar hash diferente para dados diferentes', async () => {
      const data1: ParsedCsv = {
        headers: ['NOME'],
        rows: [{ NOME: 'João' }],
      };

      const data2: ParsedCsv = {
        headers: ['NOME'],
        rows: [{ NOME: 'Maria' }],
      };

      const hash1 = await hashData(data1);
      const hash2 = await hashData(data2);

      expect(hash1).not.toBe(hash2);
    });

    it('deve retornar hash idêntico para dados idênticos', async () => {
      const data: ParsedCsv = {
        headers: ['NOME', 'IDADE'],
        rows: [{ NOME: 'João', IDADE: '20' }],
      };

      const hash1 = await hashData(data);
      const hash2 = await hashData(data);

      expect(hash1).toBe(hash2);
    });
  });

  describe('Propriedade crítica: Ordem não importa (V2.2.1)', () => {
    it('deve gerar MESMO hash se linhas estiverem em ordem diferente', async () => {
      const data1: ParsedCsv = {
        headers: ['NOME', 'IDADE'],
        rows: [
          { NOME: 'João', IDADE: '20' },
          { NOME: 'Maria', IDADE: '22' },
          { NOME: 'Pedro', IDADE: '25' },
        ],
      };

      const data2: ParsedCsv = {
        headers: ['NOME', 'IDADE'],
        rows: [
          { NOME: 'Pedro', IDADE: '25' }, // Ordem invertida
          { NOME: 'Maria', IDADE: '22' },
          { NOME: 'João', IDADE: '20' },
        ],
      };

      const hash1 = await hashData(data1);
      const hash2 = await hashData(data2);

      expect(hash1).toBe(hash2);
    });

    it('deve gerar MESMO hash se headers estiverem em ordem diferente', async () => {
      const data1: ParsedCsv = {
        headers: ['NOME', 'IDADE', 'CIDADE'],
        rows: [{ NOME: 'João', IDADE: '20', CIDADE: 'Rio' }],
      };

      const data2: ParsedCsv = {
        headers: ['CIDADE', 'NOME', 'IDADE'], // Ordem diferente
        rows: [{ NOME: 'João', IDADE: '20', CIDADE: 'Rio' }],
      };

      const hash1 = await hashData(data1);
      const hash2 = await hashData(data2);

      expect(hash1).toBe(hash2);
    });

    it('deve gerar MESMO hash se headers E linhas estiverem em ordem diferente', async () => {
      const data1: ParsedCsv = {
        headers: ['NOME', 'IDADE'],
        rows: [
          { NOME: 'João', IDADE: '20' },
          { NOME: 'Maria', IDADE: '22' },
        ],
      };

      const data2: ParsedCsv = {
        headers: ['IDADE', 'NOME'], // Headers invertidos
        rows: [
          { NOME: 'Maria', IDADE: '22' }, // Linhas invertidas
          { NOME: 'João', IDADE: '20' },
        ],
      };

      const hash1 = await hashData(data1);
      const hash2 = await hashData(data2);

      expect(hash1).toBe(hash2);
    });
  });

  describe('Edge cases: Dados vazios ou mínimos', () => {
    it('deve lidar com CSV vazio (sem linhas)', async () => {
      const data: ParsedCsv = {
        headers: ['NOME', 'IDADE'],
        rows: [],
      };

      const hash = await hashData(data);

      expect(hash).toBeDefined();
      expect(hash).toHaveLength(64);
    });

    it('deve lidar com CSV sem headers', async () => {
      const data: ParsedCsv = {
        headers: [],
        rows: [{ CAMPO1: 'valor1' }],
      };

      const hash = await hashData(data);

      expect(hash).toBeDefined();
      expect(hash).toHaveLength(64);
    });

    it('deve lidar com uma única linha', async () => {
      const data: ParsedCsv = {
        headers: ['NOME'],
        rows: [{ NOME: 'João' }],
      };

      const hash = await hashData(data);

      expect(hash).toBeDefined();
      expect(hash).toHaveLength(64);
    });

    it('deve lidar com linha vazia (todos campos vazios)', async () => {
      const data: ParsedCsv = {
        headers: ['NOME', 'IDADE'],
        rows: [{ NOME: '', IDADE: '' }],
      };

      const hash = await hashData(data);

      expect(hash).toBeDefined();
      expect(hash).toHaveLength(64);
    });
  });

  describe('Edge cases: Valores especiais', () => {
    it('deve lidar com valores com acentuação', async () => {
      const data: ParsedCsv = {
        headers: ['NOME'],
        rows: [{ NOME: 'José María González' }],
      };

      const hash = await hashData(data);

      expect(hash).toBeDefined();
      expect(hash).toHaveLength(64);
    });

    it('deve lidar com valores com caracteres especiais', async () => {
      const data: ParsedCsv = {
        headers: ['ENDERECO'],
        rows: [{ ENDERECO: 'Rua A, nº 10 - Apto 5 (Fundos)' }],
      };

      const hash = await hashData(data);

      expect(hash).toBeDefined();
      expect(hash).toHaveLength(64);
    });

    it('deve lidar com valores numéricos grandes', async () => {
      const data: ParsedCsv = {
        headers: ['CPF', 'RG'],
        rows: [{ CPF: '123.456.789-10', RG: '12.345.678-9' }],
      };

      const hash = await hashData(data);

      expect(hash).toBeDefined();
      expect(hash).toHaveLength(64);
    });

    it('deve lidar com valores JSON-like (aspas, chaves)', async () => {
      const data: ParsedCsv = {
        headers: ['OBSERVACAO'],
        rows: [{ OBSERVACAO: 'Aluno disse: "Ótimo!" {aprovado: true}' }],
      };

      const hash = await hashData(data);

      expect(hash).toBeDefined();
      expect(hash).toHaveLength(64);
    });
  });

  describe('Edge cases: Sensibilidade', () => {
    it('deve gerar hash DIFERENTE se valor mudar case (case-sensitive)', async () => {
      const data1: ParsedCsv = {
        headers: ['NOME'],
        rows: [{ NOME: 'João' }],
      };

      const data2: ParsedCsv = {
        headers: ['NOME'],
        rows: [{ NOME: 'joão' }], // Case diferente
      };

      const hash1 = await hashData(data1);
      const hash2 = await hashData(data2);

      expect(hash1).not.toBe(hash2);
    });

    it('deve gerar hash DIFERENTE se houver espaço extra', async () => {
      const data1: ParsedCsv = {
        headers: ['NOME'],
        rows: [{ NOME: 'João' }],
      };

      const data2: ParsedCsv = {
        headers: ['NOME'],
        rows: [{ NOME: 'João ' }], // Espaço no fim
      };

      const hash1 = await hashData(data1);
      const hash2 = await hashData(data2);

      expect(hash1).not.toBe(hash2);
    });

    it('deve gerar hash DIFERENTE se houver campo a mais', async () => {
      const data1: ParsedCsv = {
        headers: ['NOME'],
        rows: [{ NOME: 'João' }],
      };

      const data2: ParsedCsv = {
        headers: ['NOME', 'IDADE'],
        rows: [{ NOME: 'João', IDADE: '' }], // Campo extra (mesmo vazio)
      };

      const hash1 = await hashData(data1);
      const hash2 = await hashData(data2);

      expect(hash1).not.toBe(hash2);
    });
  });

  describe('Casos de regressão: Detecção de duplicatas', () => {
    it('deve detectar CSV duplicado mesmo com linhas embaralhadas', async () => {
      // Simula upload do mesmo CSV 2x, mas Excel/Google Sheets
      // reordenou as linhas antes de exportar
      const upload1: ParsedCsv = {
        headers: ['MATRICULA', 'NOME', 'TURMA'],
        rows: [
          { MATRICULA: '001', NOME: 'João', TURMA: '3001' },
          { MATRICULA: '002', NOME: 'Maria', TURMA: '3001' },
          { MATRICULA: '003', NOME: 'Pedro', TURMA: '3002' },
        ],
      };

      const upload2: ParsedCsv = {
        headers: ['MATRICULA', 'NOME', 'TURMA'],
        rows: [
          { MATRICULA: '003', NOME: 'Pedro', TURMA: '3002' }, // Ordem diferente
          { MATRICULA: '001', NOME: 'João', TURMA: '3001' },
          { MATRICULA: '002', NOME: 'Maria', TURMA: '3001' },
        ],
      };

      const hash1 = await hashData(upload1);
      const hash2 = await hashData(upload2);

      expect(hash1).toBe(hash2); // Deve detectar duplicata!
    });

    it('deve detectar diferença se UMA linha mudar', async () => {
      const original: ParsedCsv = {
        headers: ['MATRICULA', 'NOME'],
        rows: [
          { MATRICULA: '001', NOME: 'João' },
          { MATRICULA: '002', NOME: 'Maria' },
        ],
      };

      const modificado: ParsedCsv = {
        headers: ['MATRICULA', 'NOME'],
        rows: [
          { MATRICULA: '001', NOME: 'João' },
          { MATRICULA: '002', NOME: 'Mariaa' }, // Typo: "Mariaa"
        ],
      };

      const hash1 = await hashData(original);
      const hash2 = await hashData(modificado);

      expect(hash1).not.toBe(hash2); // Deve detectar diferença!
    });

    it('deve detectar diferença se linha for ADICIONADA', async () => {
      const original: ParsedCsv = {
        headers: ['MATRICULA', 'NOME'],
        rows: [{ MATRICULA: '001', NOME: 'João' }],
      };

      const comLinhaExtra: ParsedCsv = {
        headers: ['MATRICULA', 'NOME'],
        rows: [
          { MATRICULA: '001', NOME: 'João' },
          { MATRICULA: '002', NOME: 'Maria' }, // Linha nova
        ],
      };

      const hash1 = await hashData(original);
      const hash2 = await hashData(comLinhaExtra);

      expect(hash1).not.toBe(hash2); // Deve detectar diferença!
    });

    it('deve detectar diferença se linha for REMOVIDA', async () => {
      const original: ParsedCsv = {
        headers: ['MATRICULA', 'NOME'],
        rows: [
          { MATRICULA: '001', NOME: 'João' },
          { MATRICULA: '002', NOME: 'Maria' },
        ],
      };

      const semUmaLinha: ParsedCsv = {
        headers: ['MATRICULA', 'NOME'],
        rows: [{ MATRICULA: '001', NOME: 'João' }], // Maria removida
      };

      const hash1 = await hashData(original);
      const hash2 = await hashData(semUmaLinha);

      expect(hash1).not.toBe(hash2); // Deve detectar diferença!
    });
  });

  describe('Integração: Dados reais do CSV do Conexão Educação', () => {
    it('deve processar CSV real com múltiplos alunos', async () => {
      // Exemplo de dados reais (simplificado)
      const csvReal: ParsedCsv = {
        headers: [
          'Ano',
          'MODALIDADE',
          'TURMA',
          'SERIE',
          'TURNO',
          'MATRICULA',
          'NOME',
          'SEXO',
          'NASCIMENTO',
        ],
        rows: [
          {
            Ano: 'Ano Letivo: 2024',
            MODALIDADE: 'Modalidade: REGULAR',
            TURMA: 'Turma: 3001',
            SERIE: 'Série: 3',
            TURNO: 'Turno: MANHÃ',
            MATRICULA: '123456789012345',
            NOME: 'João da Silva',
            SEXO: 'M',
            NASCIMENTO: '01/01/2006',
          },
          {
            Ano: 'Ano Letivo: 2024',
            MODALIDADE: 'Modalidade: REGULAR',
            TURMA: 'Turma: 3001',
            SERIE: 'Série: 3',
            TURNO: 'Turno: MANHÃ',
            MATRICULA: '234567890123456',
            NOME: 'Ana Paula Santos',
            SEXO: 'F',
            NASCIMENTO: '15/03/2006',
          },
        ],
      };

      const hash = await hashData(csvReal);

      expect(hash).toBeDefined();
      expect(hash).toHaveLength(64);
      // Hash deve ser consistente (mesmos dados = mesmo hash)
      const hash2 = await hashData(csvReal);
      expect(hash).toBe(hash2);
    });

    it('deve gerar mesmo hash se CSV real for reordenado', async () => {
      const csv1: ParsedCsv = {
        headers: ['MATRICULA', 'NOME', 'TURMA'],
        rows: [
          {
            MATRICULA: '123456789012345',
            NOME: 'João da Silva',
            TURMA: 'Turma: 3001',
          },
          {
            MATRICULA: '234567890123456',
            NOME: 'Ana Paula Santos',
            TURMA: 'Turma: 3001',
          },
        ],
      };

      const csv2: ParsedCsv = {
        headers: ['TURMA', 'MATRICULA', 'NOME'], // Headers reordenados
        rows: [
          {
            MATRICULA: '234567890123456',
            NOME: 'Ana Paula Santos',
            TURMA: 'Turma: 3001',
          }, // Linhas reordenadas
          {
            MATRICULA: '123456789012345',
            NOME: 'João da Silva',
            TURMA: 'Turma: 3001',
          },
        ],
      };

      const hash1 = await hashData(csv1);
      const hash2 = await hashData(csv2);

      expect(hash1).toBe(hash2);
    });
  });
});
