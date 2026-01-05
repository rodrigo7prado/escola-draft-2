#!/usr/bin/env node

/**
 * Script de validação da documentação DRY
 *
 * Valida:
 * - Existência de todos os IDs DRY referenciados
 * - Links internos funcionando
 * - Duplicação de IDs
 * - Consistência de formato
 */

const fs = require('fs');
const path = require('path');

class DryValidator {
  constructor(docsPath) {
    this.docsPath = docsPath;
    this.definitions = new Map();
    this.references = new Map();
    this.errors = [];
    this.warnings = [];

    // Padrões de ID DRY suportados
    this.patterns = {
      // Definições: *`DRY.TIPO:NOME`* ou DRY.TIPO:NOME com backticks
      definition: /[*`]+\s*(DRY\.[A-Z_-]+:[A-Z_]+(?:\.[A-Z_]+)*)\s*[`*]+/g,
      // Referências: [DRY.TIPO:NOME] ou DRY.TIPO:NOME sem formatação especial
      reference: /\[?(DRY\.[A-Z_-]+:[A-Z_]+(?:\.[A-Z_]+)*)\]?/g,
      // Links markdown: [texto](caminho)
      markdownLink: /\[([^\]]+)\]\(([^)]+)\)/g,
    };
  }

  async validate() {
    console.log('🔍 Iniciando validação da documentação DRY...\n');

    // 1. Encontrar todos os arquivos .md em docs/dry/
    const files = await this.findMarkdownFiles(this.docsPath);
    console.log(`📁 Encontrados ${files.length} arquivos markdown\n`);

    // 2. Extrair definições e referências
    for (const file of files) {
      await this.processFile(file);
    }

    // 3. Validar referências
    this.validateReferences();

    // 4. Validar duplicações
    this.validateDuplicates();

    // 5. Validar links markdown
    for (const file of files) {
      await this.validateMarkdownLinks(file);
    }

    return {
      errors: this.errors,
      warnings: this.warnings,
      stats: {
        totalFiles: files.length,
        totalDefinitions: Array.from(this.definitions.values()).flat().length,
        totalReferences: Array.from(this.references.values()).flat().length,
        uniqueIds: this.definitions.size,
      },
    };
  }

  async findMarkdownFiles(dir) {
    let results = [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        results = results.concat(await this.findMarkdownFiles(fullPath));
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        results.push(fullPath);
      }
    }

    return results;
  }

  async processFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    const relPath = path.relative(process.cwd(), filePath);

    lines.forEach((line, index) => {
      // Extrair definições (apenas em cabeçalhos markdown ou itens de lista de definição)
      const isDefinitionContext =
        line.trim().match(/^#{1,6}\s+.*\*`DRY\./) ||     // Cabeçalho markdown
        line.trim().match(/^\d+\.\s+\*`DRY\./) ||        // Lista numerada
        line.trim().match(/^-\s+\*`DRY\./) ||            // Lista com -
        line.trim().match(/^[*]\s+\*`DRY\./) ||          // Lista com *
        line.trim().match(/^-\s+\[\s*[xX ]?\s*\]\s+\*`DRY\./); // Lista com checkbox

      if (isDefinitionContext) {
        const defMatches = [...line.matchAll(this.patterns.definition)];
        defMatches.forEach((match) => {
          const id = match[1];
          const ref = {
            id,
            file: relPath,
            line: index + 1,
            type: 'definition',
            context: line.trim(),
          };

          if (!this.definitions.has(id)) {
            this.definitions.set(id, []);
          }
          this.definitions.get(id).push(ref);
        });
      }

      // Extrair referências (excluindo as que já são definições)
      if (!isDefinitionContext) {
        const refMatches = [...line.matchAll(this.patterns.reference)];
        refMatches.forEach((match) => {
          const id = match[1];

          // Ignorar se está dentro de um link markdown ou é uma definição
          if (!line.includes('`' + id + '`') || line.includes('[' + id + ']')) {
            const ref = {
              id,
              file: relPath,
              line: index + 1,
              type: 'reference',
              context: line.trim(),
            };

            if (!this.references.has(id)) {
              this.references.set(id, []);
            }
            this.references.get(id).push(ref);
          }
        });
      }
    });
  }

  validateReferences() {
    for (const [id, refs] of this.references.entries()) {
      if (!this.definitions.has(id)) {
        refs.forEach((ref) => {
          this.errors.push({
            type: 'missing_definition',
            message: `ID DRY referenciado mas não definido: "${id}"`,
            file: ref.file,
            line: ref.line,
            suggestion: `Defina o ID usando: *\`${id}\`* em algum arquivo DRY`,
          });
        });
      }
    }
  }

  validateDuplicates() {
    for (const [id, defs] of this.definitions.entries()) {
      if (defs.length > 1) {
        this.errors.push({
          type: 'duplicate_definition',
          message: `ID DRY duplicado: "${id}" (${defs.length} definições)`,
          file: defs.map((d) => `${d.file}:${d.line}`).join(', '),
          suggestion: `Mantenha apenas uma definição ou use IDs únicos`,
        });
      }
    }
  }

  async validateMarkdownLinks(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    const relPath = path.relative(process.cwd(), filePath);
    const fileDir = path.dirname(filePath);

    lines.forEach((line, index) => {
      const linkMatches = [...line.matchAll(this.patterns.markdownLink)];

      linkMatches.forEach((match) => {
        const linkText = match[1];
        const linkPath = match[2];

        // Ignorar links externos (http/https)
        if (linkPath.startsWith('http://') || linkPath.startsWith('https://')) {
          return;
        }

        // Ignorar âncoras puras (#section)
        if (linkPath.startsWith('#')) {
          return;
        }

        // Resolver caminho do link
        let targetPath = linkPath.split('#')[0]; // Remover âncora
        if (targetPath.startsWith('/')) {
          // Caminho absoluto do projeto
          targetPath = path.join(process.cwd(), targetPath);
        } else {
          // Caminho relativo ao arquivo atual
          targetPath = path.join(fileDir, targetPath);
        }

        // Verificar se o arquivo existe
        if (!fs.existsSync(targetPath)) {
          this.warnings.push({
            type: 'broken_link',
            message: `Link quebrado: "${linkText}" aponta para "${linkPath}"`,
            file: relPath,
            line: index + 1,
            suggestion: `Verifique se o caminho está correto ou se o arquivo foi movido`,
          });
        }
      });
    });
  }

  printReport(result) {
    console.log('📊 ESTATÍSTICAS');
    console.log('─'.repeat(60));
    console.log(`Arquivos analisados:     ${result.stats.totalFiles}`);
    console.log(`IDs únicos definidos:    ${result.stats.uniqueIds}`);
    console.log(`Total de definições:     ${result.stats.totalDefinitions}`);
    console.log(`Total de referências:    ${result.stats.totalReferences}`);
    console.log('');

    if (result.errors.length === 0 && result.warnings.length === 0) {
      console.log('✅ Nenhum erro ou aviso encontrado!\n');
      return;
    }

    if (result.errors.length > 0) {
      console.log(`❌ ERROS (${result.errors.length})`);
      console.log('─'.repeat(60));
      result.errors.forEach((error, i) => {
        console.log(`\n${i + 1}. ${error.message}`);
        console.log(`   Arquivo: ${error.file}${error.line ? `:${error.line}` : ''}`);
        if (error.suggestion) {
          console.log(`   💡 ${error.suggestion}`);
        }
      });
      console.log('');
    }

    if (result.warnings.length > 0) {
      console.log(`⚠️  AVISOS (${result.warnings.length})`);
      console.log('─'.repeat(60));
      result.warnings.forEach((warning, i) => {
        console.log(`\n${i + 1}. ${warning.message}`);
        console.log(`   Arquivo: ${warning.file}${warning.line ? `:${warning.line}` : ''}`);
        if (warning.suggestion) {
          console.log(`   💡 ${warning.suggestion}`);
        }
      });
      console.log('');
    }

    // Lista de todos os IDs definidos (para referência)
    if (result.stats.uniqueIds > 0) {
      console.log('📚 IDs DRY DEFINIDOS');
      console.log('─'.repeat(60));
      const sortedIds = Array.from(this.definitions.keys()).sort();
      sortedIds.forEach((id) => {
        const defs = this.definitions.get(id);
        console.log(`  ${id}`);
        console.log(`    └─ ${defs[0].file}:${defs[0].line}`);
      });
      console.log('');
    }
  }
}

// Executar validação
async function main() {
  const docsPath = path.join(process.cwd(), 'docs/dry');

  if (!fs.existsSync(docsPath)) {
    console.error(`❌ Diretório não encontrado: ${docsPath}`);
    process.exit(1);
  }

  const validator = new DryValidator(docsPath);
  const result = await validator.validate();
  validator.printReport(result);

  // Código de saída
  if (result.errors.length > 0) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('❌ Erro na validação:', error);
  process.exit(1);
});