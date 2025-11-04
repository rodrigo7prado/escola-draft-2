/**
 * Limpar arquivos que foram soft-deleted pelo método antigo
 * Agora fazemos hard delete, então precisamos remover os registros antigos
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function limpar() {
  console.log('🧹 LIMPEZA DE ARQUIVOS SOFT-DELETED\n');
  console.log('═'.repeat(80));

  // 1. Buscar arquivos com status='excluido'
  const arquivosExcluidos = await prisma.arquivoImportado.findMany({
    where: { status: 'excluido' },
    include: {
      linhas: {
        select: { id: true }
      }
    }
  });

  if (arquivosExcluidos.length === 0) {
    console.log('\n✅ Nenhum arquivo com status "excluido" encontrado. Banco limpo!');
    return;
  }

  console.log(`\n📦 Encontrados ${arquivosExcluidos.length} arquivo(s) com status "excluido":\n`);

  for (const arquivo of arquivosExcluidos) {
    console.log(`  - ${arquivo.nomeArquivo}`);
    console.log(`    ID: ${arquivo.id}`);
    console.log(`    Hash: ${arquivo.hashArquivo.substring(0, 16)}...`);
    console.log(`    Linhas: ${arquivo.linhas.length}`);
    console.log(`    Excluído em: ${arquivo.excluidoEm}`);
    console.log('');
  }

  // 2. Coletar IDs das linhas para marcar fonteAusente
  const todasLinhasIds: string[] = [];
  for (const arquivo of arquivosExcluidos) {
    todasLinhasIds.push(...arquivo.linhas.map(l => l.id));
  }

  console.log(`📝 Total de linhas a processar: ${todasLinhasIds.length}\n`);

  // Confirmar ação
  console.log('⚠️  ATENÇÃO: Esta operação irá:');
  console.log('   1. Marcar alunos/enturmações como fonteAusente=true');
  console.log('   2. Deletar permanentemente os arquivos e linhas');
  console.log('   3. Remover os hashes do banco (permitindo reimportação)\n');

  console.log('Executando em 3 segundos...\n');
  await new Promise(resolve => setTimeout(resolve, 3000));

  // 3. Marcar alunos e enturmações como fonteAusente
  console.log('📌 Marcando entidades como fonte ausente...');

  const resultadoAlunos = await prisma.aluno.updateMany({
    where: {
      linhaOrigemId: { in: todasLinhasIds },
      origemTipo: 'csv'
    },
    data: { fonteAusente: true }
  });

  const resultadoEnturmacoes = await prisma.enturmacao.updateMany({
    where: {
      linhaOrigemId: { in: todasLinhasIds },
      origemTipo: 'csv'
    },
    data: { fonteAusente: true }
  });

  console.log(`   ✅ ${resultadoAlunos.count} aluno(s) marcados`);
  console.log(`   ✅ ${resultadoEnturmacoes.count} enturmação(ões) marcadas\n`);

  // 4. Hard delete dos arquivos (cascade deleta linhas)
  console.log('🗑️  Deletando arquivos permanentemente...');

  const idsParaDeletar = arquivosExcluidos.map(a => a.id);

  const resultadoDeletar = await prisma.arquivoImportado.deleteMany({
    where: {
      id: { in: idsParaDeletar }
    }
  });

  console.log(`   ✅ ${resultadoDeletar.count} arquivo(s) deletados\n`);

  console.log('═'.repeat(80));
  console.log('\n✅ LIMPEZA CONCLUÍDA COM SUCESSO!\n');
  console.log('Agora você pode reimportar os arquivos normalmente.');
  console.log('Os alunos marcados como fonteAusente=true serão restaurados ao reimportar.\n');
}

limpar()
  .catch((error) => {
    console.error('\n❌ ERRO durante a limpeza:', error);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });