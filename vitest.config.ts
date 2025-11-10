import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  plugins: [],
  test: {
    // Ambiente de teste (happy-dom é mais leve que jsdom)
    environment: 'happy-dom',

    // Pool explícito para evitar cache de config antiga
    pool: 'threads',

    // OTIMIZAÇÃO: Rodar testes em paralelo de forma mais agressiva
    // Cada suite de testes roda em paralelo (describe blocks)
    // Reduz tempo total significativamente
    fileParallelism: true,

    // OTIMIZAÇÃO: Máximo de workers = número de CPUs
    // Isso maximiza uso de recursos
    maxWorkers: undefined, // undefined = auto-detect CPUs

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

    // OTIMIZAÇÃO: Timeout aumentado para testes de DB
    // Mas não tanto para não mascarar problemas reais
    testTimeout: 15000,

    // OTIMIZAÇÃO: Reporter mais rápido (dot ao invés de verbose)
    // verbose é lento pois imprime cada teste individualmente
    reporters: process.env.CI ? ['dot'] : ['verbose'],

    // Globals (permite usar expect, describe, etc sem import)
    globals: true,

    // OTIMIZAÇÃO: Pool options para threads
    poolOptions: {
      threads: {
        // Máximo de threads simultâneas
        maxThreads: undefined, // auto-detect
        minThreads: 1,
      },
    },
  },

  // Resolver alias (para imports como @/components)
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});