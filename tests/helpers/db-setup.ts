/**
 * Helper para setup/teardown de banco de dados em testes
 *
 * Este arquivo será usado futuramente para testes de integração que precisam
 * interagir com o banco de dados (APIs, queries complexas, etc).
 *
 * NOTA: Por enquanto está preparado mas não usado. Será ativado quando
 * implementarmos testes de API (V4, V5, V6 da ESPECIFICACAO.md)
 *
 * @see docs/ciclos/MIGRACAO_ESPECIFICACAO.md - Seções V4, V5, V6
 */

import { PrismaClient } from '@prisma/client';

// Cliente Prisma para testes (será SQLite em memória no futuro)
let prismaTest: PrismaClient | null = null;

/**
 * Inicializa banco de dados de teste
 *
 * Configuração futura:
 * - Usar SQLite em memória (DATABASE_URL=file::memory:)
 * - Executar migrations automaticamente
 * - Popular dados de fixtures se necessário
 */
export async function setupTestDatabase() {
  // TODO: Implementar quando começarmos testes de integração
  // prismaTest = new PrismaClient({
  //   datasources: {
  //     db: {
  //       url: 'file::memory:?cache=shared',
  //     },
  //   },
  // });
  //
  // await prismaTest.$connect();
  // await runMigrations(prismaTest);

  console.warn('[db-setup] setupTestDatabase() ainda não implementado');
}

/**
 * Limpa todos os dados do banco de teste
 *
 * Útil para garantir isolamento entre testes.
 * Deve ser chamado em beforeEach() ou afterEach().
 */
export async function clearTestDatabase() {
  // TODO: Implementar quando começarmos testes de integração
  // if (!prismaTest) return;
  //
  // await prismaTest.auditoria.deleteMany();
  // await prismaTest.enturmacao.deleteMany();
  // await prismaTest.aluno.deleteMany();
  // await prismaTest.linhaImportada.deleteMany();
  // await prismaTest.arquivoImportado.deleteMany();

  console.warn('[db-setup] clearTestDatabase() ainda não implementado');
}

/**
 * Fecha conexão com banco de teste
 *
 * Deve ser chamado em afterAll() para liberar recursos.
 */
export async function teardownTestDatabase() {
  // TODO: Implementar quando começarmos testes de integração
  // if (prismaTest) {
  //   await prismaTest.$disconnect();
  //   prismaTest = null;
  // }

  console.warn('[db-setup] teardownTestDatabase() ainda não implementado');
}

/**
 * Retorna instância do Prisma para testes
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
 */
export async function seedTestData() {
  // TODO: Implementar quando começarmos testes de integração
  // const prisma = getTestPrisma();
  //
  // await prisma.aluno.create({
  //   data: {
  //     matricula: '123456789012345',
  //     nome: 'Aluno Teste',
  //     origemTipo: 'csv',
  //     // ... outros campos
  //   },
  // });

  console.warn('[db-setup] seedTestData() ainda não implementado');
}