import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  plugins: [],
  test: {
    // Ambiente de teste (happy-dom é mais leve que jsdom)
    environment: 'happy-dom',

    // Pool de execução - vmThreads para compatibilidade com crypto
    pool: 'vmThreads',

    // Arquivos de setup global
    setupFiles: ['./tests/setup.ts'],

    // Inclui apenas arquivos de teste
    include: ['tests/**/*.test.{ts,tsx}'],

    // Exclui arquivos que não são testes
    exclude: [
      'node_modules',
      'dist',
      '.next',
      'tests/helpers/**',
      'tests/fixtures/**',
    ],

    // Coverage (cobertura de código)
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.d.ts',
        'src/**/*.test.{ts,tsx}',
        'src/app/**', // Rotas Next.js (testar com E2E)
      ],
    },

    // Timeout (padrão: 5s)
    testTimeout: 10000,

    // Mostrar output mais detalhado
    reporters: ['verbose'],

    // Globals (permite usar expect, describe, etc sem import)
    globals: true,
  },

  // Resolver alias (para imports como @/components)
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});