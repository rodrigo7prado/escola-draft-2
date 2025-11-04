/**
 * Verificar quais arquivos estão ativos no banco
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verificar() {
  console.log('🔍 VERIFICANDO ARQUIVOS ATIVOS\n');
  console.log('═'.repeat(80));

  // Buscar arquivos ativos
  const arquivosAtivos = await prisma.arquivoImportado.findMany({
    where: { status: 'ativo' },
    include: {
      linhas: {
        take: 1,
        select: {
          dadosOriginais: true
        }
      }
    },
    orderBy: { dataUpload: 'desc' }
  });

  if (arquivosAtivos.length === 0) {
    console.log('\n✅ Nenhum arquivo ativo encontrado.\n');
    return;
  }

  console.log(`\n📦 Encontrados ${arquivosAtivos.length} arquivo(s) ativo(s):\n`);

  for (const arquivo of arquivosAtivos) {
    const primeiraLinha = arquivo.linhas[0]?.dadosOriginais as any;
    const anoLetivo = primeiraLinha?.Ano || '(desconhecido)';

    console.log(`  📄 ${arquivo.nomeArquivo}`);
    console.log(`     ID: ${arquivo.id}`);
    console.log(`     Hash: ${arquivo.hashArquivo.substring(0, 16)}...`);
    console.log(`     Upload: ${arquivo.dataUpload.toLocaleString('pt-BR')}`);
    console.log(`     Ano Letivo: ${anoLetivo}`);
    console.log('');
  }

  console.log('═'.repeat(80));
  console.log('\n💡 Se quiser deletar algum arquivo específico:');
  console.log('   Use o botão "Resetar" na interface');
  console.log('   Ou DELETE /api/files?periodo=2024\n');
}

verificar()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
