const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkColumn() {
  try {
    // Primeiro, mostrar qual banco está sendo usado
    const dbInfo = await prisma.$queryRaw`SELECT current_database() as database`;
    console.log('🔍 Banco de dados em uso:', dbInfo[0].database);
    console.log('DATABASE_URL:', process.env.DATABASE_URL || 'não definida (usando default)');
    console.log('');

    // Verificar se a coluna existe
    const result = await prisma.$queryRaw`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'alunos'
      AND column_name = 'dadosOriginais'
    `;
    console.log('Resultado da busca pela coluna dadosOriginais:');
    console.log(JSON.stringify(result, null, 2));

    if (result.length === 0) {
      console.log('\n❌ Coluna dadosOriginais NÃO existe no banco!');
    } else {
      console.log('\n✅ Coluna dadosOriginais existe no banco!');
    }

    // Listar todas as colunas da tabela alunos para comparação
    console.log('\n📋 Listando todas as colunas da tabela alunos:');
    const allColumns = await prisma.$queryRaw`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'alunos'
      ORDER BY ordinal_position
    `;
    allColumns.forEach(col => console.log(`  - ${col.column_name}`));
    console.log(`\nTotal: ${allColumns.length} colunas`);

  } catch (error) {
    console.error('Erro:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkColumn();