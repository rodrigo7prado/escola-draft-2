#!/usr/bin/env node

/**
 * Wrapper para rodar testes via pre-commit hook
 *
 * Este script evita o segmentation fault que ocorre quando
 * o Vitest é executado diretamente via Git hook no Windows.
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('🧪 Rodando testes...\n');

// Rodar pnpm test:run
const child = spawn('pnpm', ['test:run'], {
  stdio: 'inherit',
  shell: true,
  cwd: path.resolve(__dirname, '..')
});

child.on('exit', (code) => {
  if (code !== 0) {
    console.error('\n❌ Testes falharam! Commit bloqueado.');
    process.exit(1);
  } else {
    console.log('\n✅ Todos os testes passaram!');
    process.exit(0);
  }
});

child.on('error', (err) => {
  console.error('\n❌ Erro ao executar testes:', err.message);
  process.exit(1);
});