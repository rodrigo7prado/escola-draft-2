#!/usr/bin/env node

/**
 * Busca IDs DRY na documentação (definições e referências).
 * Uso: node scripts/search-dry.js <ID ou fragmento> [--exact]
 */

const fs = require('fs');
const path = require('path');

const projectRoot = process.cwd();
const docsPath = path.join(projectRoot, 'docs', 'dry');
const args = process.argv.slice(2);
const query = args.find((arg) => !arg.startsWith('--'));
const exact = args.includes('--exact');

if (!query) {
  console.error('Uso: pnpm search:dry <ID ou fragmento> [--exact]');
  process.exit(1);
}

if (!fs.existsSync(docsPath)) {
  console.error(`Diretório não encontrado: ${docsPath}`);
  process.exit(1);
}

const patterns = {
  definition: /[*`]+\s*(DRY\.[A-Z0-9_.-]+:[A-Z0-9_.-]+(?:\.[A-Z0-9_.-]+)*)\s*[`*]+/g,
  reference: /\[?(DRY\.[A-Z0-9_.-]+:[A-Z0-9_.-]+(?:\.[A-Z0-9_.-]+)*)\]?/g,
};

function findMarkdownFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      return findMarkdownFiles(fullPath);
    }
    if (entry.isFile() && entry.name.endsWith('.md')) {
      return [fullPath];
    }
    return [];
  });
}

function matchesQuery(id) {
  if (exact) {
    return id === query;
  }
  return id.toLowerCase().includes(query.toLowerCase());
}

function collect() {
  const files = findMarkdownFiles(docsPath);
  const definitions = [];
  const references = [];

  files.forEach((filePath) => {
    const relPath = path.relative(projectRoot, filePath);
    const lines = fs.readFileSync(filePath, 'utf8').split('\n');
    let inCodeBlock = false;

    lines.forEach((line, index) => {
      const trimmed = line.trim();

      if (trimmed.startsWith('```')) {
        inCodeBlock = !inCodeBlock;
        return;
      }

      if (inCodeBlock) {
        return;
      }

      const isDefinitionContext =
        trimmed.match(/^#{1,6}\s+.*\*`DRY\./) ||
        trimmed.match(/^\d+\.\s+\*`DRY\./) ||
        trimmed.match(/^-\s+\*`DRY\./) ||
        trimmed.match(/^[*]\s+\*`DRY\./) ||
        trimmed.match(/^-\s+\[\s*[xX ]?\s*\]\s+\*`DRY\./);

      if (isDefinitionContext) {
        const defMatches = [...line.matchAll(patterns.definition)];
        defMatches.forEach((match) => {
          definitions.push({
            id: match[1],
            file: relPath,
            line: index + 1,
            context: trimmed,
          });
        });
        return;
      }

      const refMatches = [...line.matchAll(patterns.reference)];
      refMatches.forEach((match) => {
        const id = match[1];
        const fullMatch = match[0];
        const isInBackticks = line.includes('`' + id + '`') || line.includes('`' + fullMatch + '`');
        const isReference = fullMatch.startsWith('[') && fullMatch.endsWith(']');

        if (isReference && !isInBackticks) {
          references.push({
            id,
            file: relPath,
            line: index + 1,
            context: trimmed,
          });
        }
      });
    });
  });

  return { definitions, references };
}

function printSection(title, items) {
  console.log(`${title} (${items.length}):`);
  if (items.length === 0) {
    console.log('  - Nenhum encontrado.\n');
    return;
  }
  items
    .sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line)
    .forEach((item) => {
      console.log(`  - ${item.file}:${item.line} -> ${item.context}`);
    });
  console.log('');
}

console.log(`Buscando por "${query}" em docs/dry ${exact ? '(modo exato)' : ''}\n`);

const { definitions, references } = collect();
const defHits = definitions.filter((item) => matchesQuery(item.id));
const refHits = references.filter((item) => matchesQuery(item.id));

if (defHits.length === 0 && refHits.length === 0) {
  console.log('Nenhum resultado encontrado.');
  process.exit(1);
}

printSection('Definições', defHits);
printSection('Referências', refHits);

console.log('Concluído.');
