/**
 * Testes unitários para funções de limpeza de CSV
 *
 * Valida as funções críticas que removem prefixos dos dados do Conexão Educação.
 * Estes testes cobrem os casos descritos em MIGRACAO_ESPECIFICACAO.md (V3.1 - V3.7)
 *
 * @see docs/ciclos/MIGRACAO_ESPECIFICACAO.md - Seção V3: Transformação de Dados
 * @see src/lib/csv.ts - Implementação das funções testadas
 */

import { describe, it, expect } from 'vitest';
import { limparValor, limparCamposContexto } from "@/lib/parsers/csv/utils";

describe('limparValor', () => {
  describe('Casos básicos (V3.1: Remover prefixos conhecidos)', () => {
    it('deve remover prefixo "Ano Letivo:" corretamente', () => {
      expect(limparValor('Ano Letivo: 2024', 'Ano Letivo:')).toBe('2024');
    });

    it('deve remover prefixo "Modalidade:" corretamente', () => {
      expect(limparValor('Modalidade: REGULAR', 'Modalidade:')).toBe('REGULAR');
    });

    it('deve remover prefixo "Turma:" corretamente', () => {
      expect(limparValor('Turma: 3001', 'Turma:')).toBe('3001');
    });

    it('deve remover prefixo "Série:" corretamente', () => {
      expect(limparValor('Série: 3', 'Série:')).toBe('3');
    });

    it('deve remover prefixo "Turno:" corretamente', () => {
      expect(limparValor('Turno: MANHÃ', 'Turno:')).toBe('MANHÃ');
    });
  });

  describe('Casos edge: valores sem prefixo (V3.2)', () => {
    it('deve retornar valor original se não tiver o prefixo esperado', () => {
      expect(limparValor('2024', 'Ano Letivo:')).toBe('2024');
      expect(limparValor('REGULAR', 'Modalidade:')).toBe('REGULAR');
      expect(limparValor('3001', 'Turma:')).toBe('3001');
    });

    it('deve retornar valor vazio se entrada for undefined', () => {
      expect(limparValor(undefined, 'Ano Letivo:')).toBe('');
    });

    it('deve retornar valor vazio se entrada for string vazia', () => {
      expect(limparValor('', 'Ano Letivo:')).toBe('');
    });

    it('deve retornar valor vazio se entrada for apenas espaços', () => {
      expect(limparValor('   ', 'Ano Letivo:')).toBe('');
    });
  });

  describe('Casos edge: espaços e formatação (V3.3)', () => {
    it('deve remover espaços antes e depois do valor completo', () => {
      expect(limparValor('  Ano Letivo: 2024  ', 'Ano Letivo:')).toBe('2024');
    });

    it('deve remover espaços depois do prefixo', () => {
      expect(limparValor('Ano Letivo:    2024', 'Ano Letivo:')).toBe('2024');
    });

    it('deve preservar espaços internos no valor', () => {
      expect(limparValor('Nome: João da Silva', 'Nome:')).toBe('João da Silva');
    });

    it('deve aplicar trim mesmo sem prefixo', () => {
      expect(limparValor('   2024   ', 'Ano Letivo:')).toBe('2024');
    });
  });

  describe('Casos edge: prefixos parciais (V3.4)', () => {
    it('NÃO deve remover se prefixo estiver no meio', () => {
      expect(limparValor('Valor Ano Letivo: 2024', 'Ano Letivo:')).toBe(
        'Valor Ano Letivo: 2024'
      );
    });

    it('NÃO deve remover se prefixo estiver no fim', () => {
      expect(limparValor('2024 Ano Letivo:', 'Ano Letivo:')).toBe('2024 Ano Letivo:');
    });

    it('deve ser case-sensitive (não remover se case diferente)', () => {
      expect(limparValor('ano letivo: 2024', 'Ano Letivo:')).toBe('ano letivo: 2024');
      expect(limparValor('ANO LETIVO: 2024', 'Ano Letivo:')).toBe('ANO LETIVO: 2024');
    });
  });

  describe('Casos edge: valores especiais (V3.5)', () => {
    it('deve lidar com valores numéricos', () => {
      expect(limparValor('Ano Letivo: 2024', 'Ano Letivo:')).toBe('2024');
      expect(limparValor('Série: 1', 'Série:')).toBe('1');
    });

    it('deve lidar com valores alfanuméricos', () => {
      expect(limparValor('Turma: 3001A', 'Turma:')).toBe('3001A');
      expect(limparValor('Código: ABC123', 'Código:')).toBe('ABC123');
    });

    it('deve lidar com caracteres especiais', () => {
      expect(limparValor('Nome: José & Maria', 'Nome:')).toBe('José & Maria');
      expect(limparValor('Endereço: Rua A, nº 10', 'Endereço:')).toBe('Rua A, nº 10');
    });

    it('deve lidar com acentuação', () => {
      expect(limparValor('Modalidade: EDUCAÇÃO', 'Modalidade:')).toBe('EDUCAÇÃO');
      expect(limparValor('Turno: MANHÃ', 'Turno:')).toBe('MANHÃ');
    });
  });

  describe('Casos de regressão (bugs encontrados no passado)', () => {
    it('deve evitar erro "value too long for column" - caso original', () => {
      // Antes: "Ano Letivo: 2024" (16 chars) estoura coluna VARCHAR(4)
      // Depois: "2024" (4 chars) cabe perfeitamente
      const resultado = limparValor('Ano Letivo: 2024', 'Ano Letivo:');
      expect(resultado).toBe('2024');
      expect(resultado.length).toBeLessThanOrEqual(4);
    });

    it('deve evitar erro "value too long for column" - modalidade', () => {
      // Antes: "Modalidade: REGULAR" (19 chars) estoura coluna VARCHAR(50)
      const resultado = limparValor('Modalidade: REGULAR', 'Modalidade:');
      expect(resultado).toBe('REGULAR');
      expect(resultado.length).toBeLessThanOrEqual(50);
    });

    it('deve evitar erro "value too long for column" - turma', () => {
      // Antes: "Turma: 3001" (11 chars) estoura coluna VARCHAR(10)
      const resultado = limparValor('Turma: 3001', 'Turma:');
      expect(resultado).toBe('3001');
      expect(resultado.length).toBeLessThanOrEqual(10);
    });
  });
});

describe('limparCamposContexto', () => {
  describe('Casos básicos (V3.6: Transformar campos de contexto escolar)', () => {
    it('deve limpar todos os campos corretamente com prefixos completos', () => {
      const dados = {
        Ano: 'Ano Letivo: 2024',
        MODALIDADE: 'Modalidade: REGULAR',
        TURMA: 'Turma: 3001',
        SERIE: 'Série: 3',
        TURNO: 'Turno: MANHÃ',
      };

      const resultado = limparCamposContexto(dados);

      expect(resultado).toEqual({
        anoLetivo: '2024',
        modalidade: 'REGULAR',
        turma: '3001',
        serie: '3',
        turno: 'MANHÃ',
      });
    });

    it('deve lidar com campos sem prefixos', () => {
      const dados = {
        Ano: '2024',
        MODALIDADE: 'REGULAR',
        TURMA: '3001',
        SERIE: '3',
        TURNO: 'MANHÃ',
      };

      const resultado = limparCamposContexto(dados);

      expect(resultado).toEqual({
        anoLetivo: '2024',
        modalidade: 'REGULAR',
        turma: '3001',
        serie: '3',
        turno: 'MANHÃ',
      });
    });
  });

  describe('Casos edge: variações de prefixo (V3.7)', () => {
    it('deve aceitar "Ano:" como alternativa a "Ano Letivo:"', () => {
      const dados = {
        Ano: 'Ano: 2024',
        MODALIDADE: 'Modalidade: REGULAR',
        TURMA: 'Turma: 3001',
        SERIE: 'Série: 3',
        TURNO: 'Turno: MANHÃ',
      };

      const resultado = limparCamposContexto(dados);

      expect(resultado.anoLetivo).toBe('2024');
    });

    it('deve priorizar "Ano Letivo:" sobre "Ano:" se ambos presentes', () => {
      const dados = {
        Ano: 'Ano Letivo: 2024',
        MODALIDADE: 'MODALIDADE',
        TURMA: 'TURMA',
        SERIE: 'SERIE',
        TURNO: 'TURNO',
      };

      const resultado = limparCamposContexto(dados);

      expect(resultado.anoLetivo).toBe('2024');
    });
  });

  describe('Casos edge: campos ausentes/vazios', () => {
    it('deve retornar strings vazias para campos undefined', () => {
      const dados = {} as Record<string, string>;

      const resultado = limparCamposContexto(dados);

      expect(resultado).toEqual({
        anoLetivo: '',
        modalidade: '',
        turma: '',
        serie: '',
        turno: null, // turno pode ser null
      });
    });

    it('deve retornar null para turno vazio (campo opcional)', () => {
      const dados = {
        Ano: '2024',
        MODALIDADE: 'REGULAR',
        TURMA: '3001',
        SERIE: '3',
        TURNO: '',
      };

      const resultado = limparCamposContexto(dados);

      expect(resultado.turno).toBe(null);
    });

    it('deve preservar valores válidos mesmo com outros campos vazios', () => {
      const dados = {
        Ano: 'Ano Letivo: 2024',
        MODALIDADE: '',
        TURMA: 'Turma: 3001',
        SERIE: '',
        TURNO: '',
      };

      const resultado = limparCamposContexto(dados);

      expect(resultado.anoLetivo).toBe('2024');
      expect(resultado.turma).toBe('3001');
      expect(resultado.modalidade).toBe('');
      expect(resultado.serie).toBe('');
      expect(resultado.turno).toBe(null);
    });
  });

  describe('Integração: dados reais do CSV', () => {
    it('deve processar linha completa do CSV do Conexão Educação', () => {
      // Exemplo de linha real de CSV exportado
      const linhaCsv = {
        Ano: 'Ano Letivo: 2024',
        MODALIDADE: 'Modalidade: REGULAR',
        TURMA: 'Turma: 3001',
        SERIE: 'Série: 3',
        TURNO: 'Turno: MANHÃ',
        MATRICULA: '123456789012345',
        NOME: 'João da Silva',
        // ... outros campos não relevantes para o contexto
      };

      const resultado = limparCamposContexto(linhaCsv);

      expect(resultado).toMatchObject({
        anoLetivo: '2024',
        modalidade: 'REGULAR',
        turma: '3001',
        serie: '3',
        turno: 'MANHÃ',
      });

      // Validar que todos os valores cabem no schema do banco
      expect(resultado.anoLetivo.length).toBeLessThanOrEqual(4);
      expect(resultado.modalidade.length).toBeLessThanOrEqual(50);
      expect(resultado.turma.length).toBeLessThanOrEqual(10);
      expect(resultado.serie.length).toBeLessThanOrEqual(2);
      if (resultado.turno) {
        expect(resultado.turno.length).toBeLessThanOrEqual(20);
      }
    });
  });
});
