/**
 * Helper para setup/teardown de banco de dados em testes de integração
 *
 * ESTRATÉGIA: PostgreSQL real + limpeza entre testes
 *
 * Usa o banco de dados PostgreSQL real (não SQLite em memória) pelos seguintes motivos:
 * 1. Sistema usa features PostgreSQL-specific (JSONB, arrays, índices complexos)
 * 2. Comportamento idêntico entre testes e produção
 * 3. Cascatas e foreign keys funcionam exatamente como em produção
 * 4. Lógica crítica de integridade de dados (Metodologia CIF)
 *
 * ISOLAMENTO:
 * - Usa banco separado (DATABASE_URL_TEST)
 * - Limpa todos os dados entre testes (beforeEach/afterEach)
 *
 * @see docs/ciclos/MIGRACAO_ESPECIFICACAO.md - Seções V4, V5, V6
 */

import { PrismaClient } from '@prisma/client';

// Cliente Prisma para testes (compartilhado entre todos os testes)
let prismaTest: PrismaClient | null = null;

// Validação obrigatória: DATABASE_URL_TEST deve estar configurada
if (!process.env.DATABASE_URL_TEST) {
  throw new Error(
    '❌ DATABASE_URL_TEST não configurada!\n\n' +
    'Configure no .env:\n' +
    'DATABASE_URL_TEST="postgresql://postgres:postgres@localhost:5432/certificados_test?schema=public"\n\n' +
    'Rode as migrations no banco de teste:\n' +
    'DATABASE_URL=$DATABASE_URL_TEST pnpm prisma migrate deploy'
  );
}

/**
 * Inicializa banco de dados de teste
 *
 * Cria conexão com o banco PostgreSQL de TESTE (certificados_test).
 * Usa DATABASE_URL_TEST do .env
 *
 * IMPORTANTE:
 * - Só inicializa uma vez (singleton pattern)
 * - Usa banco SEPARADO do principal (certificados_test vs certificados)
 * - Isso garante que testes nunca afetam dados reais
 */
export async function setupTestDatabase() {
  if (prismaTest) {
    // Já inicializado
    return;
  }

  prismaTest = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL_TEST,
      },
    },
    log: process.env.DEBUG_TESTS ? ['query', 'error', 'warn'] : ['error'],
  });

  await prismaTest.$connect();
}

/**
 * Limpa todos os dados do banco de teste
 *
 * IMPORTANTE: Respeita ordem de deleção por causa das foreign keys:
 * 1. Auditoria (sem dependências)
 * 2. Enturmacao (depende de Aluno e LinhaImportada)
 * 3. Aluno (depende de LinhaImportada)
 * 4. LinhaImportada (depende de ArquivoImportado)
 * 5. ArquivoImportado (sem dependências)
 *
 * Útil para garantir isolamento entre testes.
 * Deve ser chamado em beforeEach() ou afterEach().
 */
export async function clearTestDatabase() {
  if (!prismaTest) {
    throw new Error('Banco de teste não inicializado. Chame setupTestDatabase() primeiro.');
  }

  // Ordem de exclusão respeitando foreign keys
  await prismaTest.auditoria.deleteMany();
  await prismaTest.enturmacao.deleteMany();
  await prismaTest.aluno.deleteMany();
  await prismaTest.linhaImportada.deleteMany();
  await prismaTest.arquivoImportado.deleteMany();
}

/**
 * Fecha conexão com banco de teste
 *
 * Deve ser chamado em afterAll() para liberar recursos.
 */
export async function teardownTestDatabase() {
  if (prismaTest) {
    await prismaTest.$disconnect();
    prismaTest = null;
  }
}

/**
 * Retorna instância do Prisma para testes
 *
 * IMPORTANTE: Use esta função ao invés de importar prisma diretamente
 * nos testes para garantir que está usando a conexão de teste.
 */
export function getTestPrisma(): PrismaClient {
  if (!prismaTest) {
    throw new Error(
      'Banco de teste não inicializado. Chame setupTestDatabase() primeiro.'
    );
  }
  return prismaTest;
}

/**
 * Cria fixtures básicas no banco de teste
 *
 * Útil para testes que precisam de dados pré-existentes.
 * Retorna IDs dos registros criados para uso nos testes.
 *
 * @example
 * ```typescript
 * const { alunoId, arquivoId } = await seedTestData();
 * // Usar IDs nos testes
 * ```
 */
export async function seedTestData() {
  const prisma = getTestPrisma();

  // Criar arquivo importado de exemplo
  const arquivo = await prisma.arquivoImportado.create({
    data: {
      nomeArquivo: 'teste.csv',
      hashArquivo: 'hash-teste-12345',
      tipo: 'alunos',
      status: 'ativo',
    },
  });

  // Criar linha importada de exemplo
  const linha = await prisma.linhaImportada.create({
    data: {
      arquivoId: arquivo.id,
      numeroLinha: 0,
      dadosOriginais: {
        ALUNO: '123456789012345',
        NOME: 'Aluno Teste',
        Ano: 'Ano Letivo: 2024',
        MODALIDADE: 'Modalidade: REGULAR',
        TURMA: 'Turma: 3001',
        SERIE: 'Série: 3',
        TURNO: 'Turno: MANHÃ',
      },
      identificadorChave: '123456789012345',
      tipoEntidade: 'aluno',
    },
  });

  // Criar aluno de exemplo
  const aluno = await prisma.aluno.create({
    data: {
      matricula: '123456789012345',
      nome: 'Aluno Teste',
      sexo: 'M',
      origemTipo: 'csv',
      linhaOrigemId: linha.id,
      fonteAusente: false,
    },
  });

  // Criar enturmação de exemplo
  const enturmacao = await prisma.enturmacao.create({
    data: {
      alunoId: aluno.id,
      anoLetivo: '2024',
      regime: 0,
      modalidade: 'REGULAR',
      turma: '3001',
      serie: '3',
      turno: 'MANHÃ',
      origemTipo: 'csv',
      linhaOrigemId: linha.id,
      fonteAusente: false,
    },
  });

  return {
    arquivoId: arquivo.id,
    linhaId: linha.id,
    alunoId: aluno.id,
    enturmacaoId: enturmacao.id,
  };
}

/**
 * Helper para contar registros de cada tabela
 *
 * Útil para verificar se os dados foram criados/deletados corretamente.
 *
 * @example
 * ```typescript
 * const contagem = await contarRegistros();
 * expect(contagem.alunos).toBe(3);
 * expect(contagem.total).toBe(10);
 * ```
 */
export async function contarRegistros() {
  const prisma = getTestPrisma();

  const [arquivos, linhas, alunos, enturmacoes, auditorias] = await Promise.all([
    prisma.arquivoImportado.count(),
    prisma.linhaImportada.count(),
    prisma.aluno.count(),
    prisma.enturmacao.count(),
    prisma.auditoria.count(),
  ]);

  return {
    arquivos,
    linhas,
    alunos,
    enturmacoes,
    auditorias,
    total: arquivos + linhas + alunos + enturmacoes + auditorias,
  };
}