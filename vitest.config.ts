import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  plugins: [],
  test: {
    // Ambiente de teste (happy-dom é mais leve que jsdom)
    environment: "happy-dom",

    // Pool: 'forks' é mais estável no Windows (evita segfaults)
    // 'threads' pode causar crash com crypto/banco de dados
    pool: "forks",
    // IMPORTANTE: Desabilitar paralelismo para testes de integração com banco
    // Testes que usam o mesmo banco não podem rodar em paralelo (race conditions)
    // clearTestDatabase() em um teste afeta outros testes rodando simultaneamente
    fileParallelism: false,

    // OTIMIZAÇÃO: Limitar workers para evitar crash no Windows
    // undefined = auto-detect, mas pode causar problemas com muitos workers
    maxWorkers: 1, // Modo sequencial garante estabilidade

    // Arquivos de setup global
    setupFiles: ["./tests/setup.ts"],

    // Inclui apenas arquivos de teste
    include: ["tests/**/*.test.{ts,tsx}"],

    // Exclui arquivos que não são testes
    exclude: [
      "node_modules",
      "dist",
      ".next",
      "tests/helpers/**",
      "tests/fixtures/**",
    ],

    // Coverage (cobertura de código)
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "src/**/*.d.ts",
        "src/**/*.test.{ts,tsx}",
        "src/app/**", // Rotas Next.js (testar com E2E)
      ],
    },

    // OTIMIZAÇÃO: Timeout aumentado para testes de DB
    // Mas não tanto para não mascarar problemas reais
    testTimeout: 15000,

    // OTIMIZAÇÃO: Reporter mais rápido (dot ao invés de verbose)
    // verbose é lento pois imprime cada teste individualmente
    reporters: process.env.CI ? ["dot"] : ["verbose"],

    // Globals (permite usar expect, describe, etc sem import)
    globals: true,
  },

  // Resolver alias (para imports como @/components)
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
