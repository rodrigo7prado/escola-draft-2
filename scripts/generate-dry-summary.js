#!/usr/bin/env node

/**
 * Gera docs/dry/summary.md automaticamente.
 * Extrai IDs DRY e índices dos arquivos de referência para manter a navegação atualizada.
 */

const fs = require('fs');
const path = require('path');

const projectRoot = process.cwd();
const dryRoot = path.join(projectRoot, 'docs', 'dry');
const summaryPath = path.join(dryRoot, 'summary.md');

const definitionRegex = /[*`]+\s*(DRY\.[A-Z0-9_.-]+:[A-Z0-9_.-]+(?:\.[A-Z0-9_.-]+)*)\s*[`*]+/g;

function slugify(text) {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s_-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

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

function collectDefinitions(root) {
  const files = findMarkdownFiles(root);
  const definitions = [];

  files.forEach((file) => {
    const relPath = path.relative(root, file);
    const lines = fs.readFileSync(file, 'utf8').split('\n');

    let currentHeading = null;
    let currentSlug = null;

    lines.forEach((line, index) => {
      const headingMatch = line.match(/^(#{1,6})\s+(.+)/);
      if (headingMatch) {
        currentHeading = headingMatch[2].trim();
        currentSlug = slugify(currentHeading);
      }

      const isDefinitionContext =
        line.trim().match(/^#{1,6}\s+.*\*`DRY\./) ||
        line.trim().match(/^\d+\.\s+\*`DRY\./) ||
        line.trim().match(/^-\s+\*`DRY\./) ||
        line.trim().match(/^[*]\s+\*`DRY\./) ||
        line.trim().match(/^-\s+\[\s*[xX ]?\s*\]\s+\*`DRY\./);

      if (!isDefinitionContext) {
        return;
      }

      const matches = [...line.matchAll(definitionRegex)];
      matches.forEach((match) => {
        const id = match[1];
        const anchor = line.startsWith('#')
          ? slugify(line.replace(/^#{1,6}\s+/, ''))
          : currentSlug;

        definitions.push({
          id,
          file: relPath,
          anchor,
          heading: currentHeading,
          line: index + 1,
        });
      });
    });
  });

  return definitions;
}

function formatTitle(text) {
  return text
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function resolveDefinitionLink(id, definitions, preferredPathPrefix) {
  const matches = definitions.filter((item) => item.id === id);
  if (!matches.length) {
    return null;
  }

  const sorted = matches
    .sort((a, b) => a.line - b.line)
    .sort((a, b) => a.file.localeCompare(b.file));

  const preferred =
    sorted.find((item) => preferredPathPrefix && item.file.startsWith(preferredPathPrefix)) ||
    sorted[0];

  const anchorPart = preferred.anchor ? `#${preferred.anchor}` : '';
  return `${preferred.file}${anchorPart}`;
}

function buildIntro() {
  return [
    '# DRY - Sumário de Documentação',
    '',
    'Sumário organizado das documentações de DRY e IDD para refletir o estado atual dos componentes e processos. A estrutura obedece à organização vigente no diretório docs/dry/.',
  ].join('\n');
}

function buildMacroSection() {
  const macroPath = path.join(dryRoot, 'ui', 'ui-macro.md');
  if (!fs.existsSync(macroPath)) {
    return { content: '', count: 0 };
  }

  const lines = fs.readFileSync(macroPath, 'utf8').split('\n');
  const items = [];

  lines.forEach((line) => {
    const match = line.match(
      /^####\s+\[\s*[xX ]?\s*\]\s+([0-9.]+)\s+\*`(DRY\.CONCEPT:[A-Z0-9_.:-]+)`\*/i
    );
    if (match) {
      const rawNumber = match[1];
      const number = rawNumber.endsWith('.') ? rawNumber.slice(0, -1) : rawNumber;
      const id = match[2];
      const anchor = slugify(line.replace(/^####\s+/, ''));
      items.push({ number, id, anchor });
    }
  });

  if (!items.length) {
    return { content: '', count: 0 };
  }

  const content = ['## Macro', ...items.map((item) => `${item.number}. [${item.id}](ui/ui-macro.md#${item.anchor})`)].join('\n');
  return { content, count: items.length };
}

function buildBackendSection(definitions) {
  const backendDefs = definitions.filter((item) => item.id.startsWith('DRY.BACKEND'));
  if (!backendDefs.length) {
    return { content: '', count: 0 };
  }

  const groups = [];

  backendDefs.forEach((def) => {
    const title = def.heading ? def.heading : formatTitle(path.basename(def.file, '.md'));
    const groupKey = `${def.file}::${title}`;
    let group = groups.find((item) => item.key === groupKey);

    if (!group) {
      group = { key: groupKey, title, items: [] };
      groups.push(group);
    }

    group.items.push(def);
  });

  const lines = ['## Backend'];
  let count = 0;

  groups.forEach((group) => {
    lines.push(`\n### ${group.title}`);
    group.items.forEach((item, index) => {
      const anchorPart = item.anchor ? `#${item.anchor}` : '';
      lines.push(`${index + 1}. [${item.id}](${item.file}${anchorPart})`);
      count += 1;
    });
  });

  return { content: lines.join('\n'), count };
}

function buildUiSection() {
  const uiComponentsPath = path.join(dryRoot, 'ui', 'ui-components.dry.md');
  if (!fs.existsSync(uiComponentsPath)) {
    return { content: '', count: 0 };
  }

  const lines = fs.readFileSync(uiComponentsPath, 'utf8').split('\n');
  const anchorsByNumber = {};

  lines.forEach((line) => {
    const heading = line.match(/^###\s+(\d+)\.\s+(.+)/);
    if (heading) {
      const number = heading[1];
      const anchor = slugify(`${number}. ${heading[2].trim()}`);
      anchorsByNumber[number] = anchor;
    }
  });

  let inIndex = false;
  let currentSubsection = null;
  const subsections = [];

  lines.forEach((line) => {
    if (line.trim().startsWith('## Índice')) {
      inIndex = true;
      return;
    }

    if (inIndex && line.trim().startsWith('---')) {
      inIndex = false;
      return;
    }

    if (!inIndex) {
      return;
    }

    const subsectionMatch = line.match(/^###\s+(.+)/);
    if (subsectionMatch) {
      currentSubsection = subsectionMatch[1].trim();
      subsections.push({ title: currentSubsection, items: [] });
      return;
    }

    const itemMatch = line.match(/^\s*(\d+)\.\s+\[([^\]]+)\](?:\s*-\s*(.+))?/);
    if (itemMatch && currentSubsection) {
      const number = itemMatch[1];
      const id = itemMatch[2];
      const desc = itemMatch[3]?.trim();
      const anchor = anchorsByNumber[number] || slugify(`${number}. ${desc || id}`);

      const subsection = subsections[subsections.length - 1];
      subsection.items.push({ number, id, desc, anchor });
    }
  });

  if (!subsections.length) {
    return { content: '', count: 0 };
  }

  const linesOut = ['## UI'];
  let count = 0;

  subsections.forEach((section) => {
    linesOut.push(`\n### ${section.title}`);
    section.items.forEach((item) => {
      const descPart = item.desc ? ` - ${item.desc}` : '';
      linesOut.push(`${item.number}. [${item.id}](ui/ui-components.dry.md#${item.anchor})${descPart}`);
      count += 1;
    });
  });

  return { content: linesOut.join('\n'), count };
}

function buildObjectsSection(definitions) {
  const indexPath = path.join(dryRoot, 'objects', 'index.md');
  if (!fs.existsSync(indexPath)) {
    return { content: '', count: 0 };
  }

  const lines = fs.readFileSync(indexPath, 'utf8').split('\n');
  let inIndex = false;
  let currentSection = null;
  const sections = [];

  lines.forEach((line) => {
    if (line.trim().startsWith('## Índice')) {
      inIndex = true;
      return;
    }

    if (inIndex && line.trim().startsWith('---')) {
      inIndex = false;
      return;
    }

    if (!inIndex) {
      return;
    }

    const sectionMatch = line.match(/^###\s+(.+)/);
    if (sectionMatch) {
      currentSection = sectionMatch[1].trim();
      sections.push({ title: currentSection, items: [] });
      return;
    }

    const itemMatch = line.match(/^\s*(\d+)\.\s+\[([^\]]+)\]\(([^)]+)\)(?:\s*-\s*(.+))?/);
    if (itemMatch && currentSection) {
      const number = itemMatch[1];
      const id = itemMatch[2];
      const link = itemMatch[3];
      const desc = itemMatch[4]?.trim();

      const resolvedLink =
        resolveDefinitionLink(id, definitions, 'objects') ||
        (link.startsWith('#') ? `objects/index.md${link}` : link);

      const section = sections[sections.length - 1];
      section.items.push({ number, id, desc, link: resolvedLink });
    }
  });

  if (!sections.length) {
    return { content: '', count: 0 };
  }

  const linesOut = ['## Objetos e Tipos'];
  let count = 0;

  sections.forEach((section) => {
    linesOut.push(`\n### ${section.title}`);
    section.items.forEach((item) => {
      const descPart = item.desc ? ` - ${item.desc}` : '';
      linesOut.push(`${item.number}. [${item.id}](${item.link})${descPart}`);
      count += 1;
    });
  });

  return { content: linesOut.join('\n'), count };
}

function writeSummary() {
  if (!fs.existsSync(dryRoot)) {
    throw new Error(`Diretório não encontrado: ${dryRoot}`);
  }

  const definitions = collectDefinitions(dryRoot);

  const intro = buildIntro();
  const macro = buildMacroSection(definitions);
  const backend = buildBackendSection(definitions);
  const ui = buildUiSection(definitions);
  const objects = buildObjectsSection(definitions);

  const parts = [intro, macro.content, backend.content, ui.content, objects.content].filter(Boolean);
  const totalItems = macro.count + backend.count + ui.count + objects.count;

  fs.writeFileSync(summaryPath, parts.join('\n\n') + '\n', 'utf8');
  console.log(`✅ summary.md atualizado (${totalItems} entradas)`);
}

try {
  writeSummary();
} catch (error) {
  console.error('❌ Erro ao gerar summary.md:', error.message);
  process.exit(1);
}
