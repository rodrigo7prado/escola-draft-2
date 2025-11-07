/**
 * Script para resetar o banco de dados
 *
 * Remove todos os dados das tabelas mantendo a estrutura (schema)
 *
 * USO:
 * pnpx tsx scripts/reset-database.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function resetDatabase() {
  console.log('🗑️  Resetando banco de dados...\n');

  try {
    // Ordem importante: deletar das tabelas filhas para as pais (respeitar FKs)

    console.log('1. Deletando Auditorias...');
    const auditorias = await prisma.auditoria.deleteMany();
    console.log(`   ✅ ${auditorias.count} auditorias removidas`);

    console.log('2. Deletando Enturmações...');
    const enturmacoes = await prisma.enturmacao.deleteMany();
    console.log(`   ✅ ${enturmacoes.count} enturmações removidas`);

    console.log('3. Deletando Alunos...');
    const alunos = await prisma.aluno.deleteMany();
    console.log(`   ✅ ${alunos.count} alunos removidos`);

    console.log('4. Deletando Linhas Importadas...');
    const linhas = await prisma.linhaImportada.deleteMany();
    console.log(`   ✅ ${linhas.count} linhas importadas removidas`);

    console.log('5. Deletando Arquivos Importados...');
    const arquivos = await prisma.arquivoImportado.deleteMany();
    console.log(`   ✅ ${arquivos.count} arquivos importados removidos`);

    console.log('\n✅ Banco de dados resetado com sucesso!');
    console.log('\n📊 Resumo:');
    console.log(`   - Auditorias: ${auditorias.count}`);
    console.log(`   - Enturmações: ${enturmacoes.count}`);
    console.log(`   - Alunos: ${alunos.count}`);
    console.log(`   - Linhas Importadas: ${linhas.count}`);
    console.log(`   - Arquivos Importados: ${arquivos.count}`);
    console.log(`   - TOTAL: ${auditorias.count + enturmacoes.count + alunos.count + linhas.count + arquivos.count} registros removidos`);

  } catch (error) {
    console.error('❌ Erro ao resetar banco de dados:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Executar
resetDatabase()
  .then(() => {
    console.log('\n🎉 Script finalizado!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Script falhou:', error);
    process.exit(1);
  });
