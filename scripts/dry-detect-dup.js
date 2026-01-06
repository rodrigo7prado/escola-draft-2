#!/usr/bin/env node

/**
 * Scanner simples para identificar blocos de código duplicados que podem virar DRY.
 *
 * Uso:
 *   pnpm dry:dup
 *   pnpm dry:dup --root src,tests --min-lines 6 --top 20
 */

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);

function getArg(name, fallback) {
  const prefix = `${name}=`;
  const direct = args.find((arg) => arg.startsWith(prefix));
  if (direct) return direct.slice(prefix.length);
  return fallback;
}

const roots = getArg('--root', 'src')
  .split(',')
  .map((p) => p.trim())
  .filter(Boolean);
const minLines = parseInt(getArg('--min-lines', '6'), 10);
const topN = parseInt(getArg('--top', '20'), 10);

const exts = new Set(['.ts', '.tsx', '.js', '.jsx']);
const ignorePatterns = [
  'node_modules',
  '.git',
  '.next',
  '.turbo',
  'dist',
  'build',
  'coverage',
];

function shouldIgnore(filePath) {
  return ignorePatterns.some((pattern) => filePath.includes(`/${pattern}/`) || filePath.endsWith(`/${pattern}`));
}

function findFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (shouldIgnore(full)) return [];
    if (entry.isDirectory()) return findFiles(full);
    if (entry.isFile() && exts.has(path.extname(entry.name))) return [full];
    return [];
  });
}

function normalizeLine(line) {
  return line.trim().replace(/\s+/g, ' ');
}

function collectBlocks(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const blocks = [];

  for (let i = 0; i <= lines.length - minLines; i += 1) {
    const slice = lines.slice(i, i + minLines).map(normalizeLine);
    const normalized = slice.join('\n');

    const contentWeight = normalized.replace(/[{}();,.\s]/g, '');
    if (contentWeight.length < 30) continue; // evita blocos triviais

    blocks.push({
      hash: normalized,
      start: i + 1,
      preview: normalized.split('\n').slice(0, 3).join(' | '),
    });
  }

  return blocks;
}

function main() {
  const files = roots.flatMap((root) => findFiles(path.join(process.cwd(), root)));
  if (files.length === 0) {
    console.log('Nenhum arquivo encontrado para análise.');
    return;
  }

  const map = new Map();

  files.forEach((file) => {
    collectBlocks(file).forEach((block) => {
      if (!map.has(block.hash)) {
        map.set(block.hash, { preview: block.preview, occurrences: [] });
      }
      map.get(block.hash).occurrences.push({ file, line: block.start });
    });
  });

  const duplicates = Array.from(map.values())
    .filter((entry) => entry.occurrences.length > 1)
    .sort((a, b) => b.occurrences.length - a.occurrences.length);

  if (duplicates.length === 0) {
    console.log('✅ Nenhum bloco duplicado encontrado com os critérios atuais.');
    return;
  }

  console.log(`🔎 Blocos duplicados (top ${topN})\n`);

  duplicates.slice(0, topN).forEach((entry, idx) => {
    console.log(`${idx + 1}. ${entry.occurrences.length} ocorrências`);
    console.log(`   Preview: ${entry.preview.slice(0, 140)}\n   Locais:`);
    entry.occurrences
      .sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line)
      .forEach((occ) => {
        console.log(`   - ${path.relative(process.cwd(), occ.file)}:${occ.line}`);
      });
    console.log('');
  });

  console.log(
    `Total de blocos duplicados: ${duplicates.length}. Ajuste --min-lines ou --root para calibrar a análise.`
  );
}

main();
