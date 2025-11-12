/**
 * Setup global para testes com Vitest
 *
 * Este arquivo é executado uma vez antes de todos os testes.
 * Use para configurar mocks globais, matchers customizados, etc.
 */

import '@testing-library/jest-dom';
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Limpa o DOM após cada teste (importante para testes de componentes React)
afterEach(() => {
  cleanup();
});

// Matchers customizados podem ser adicionados aqui
// Exemplo:
// expect.extend({
//   toBeValidCPF(received: string) {
//     const isValid = validarCPF(received);
//     return {
//       message: () => `expected ${received} to be a valid CPF`,
//       pass: isValid,
//     };
//   },
// });

// Mock de variáveis de ambiente (se necessário)
// process.env.NODE_ENV = 'test';
// process.env.DATABASE_URL = 'file:./test.db';

// Configurações globais
(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;