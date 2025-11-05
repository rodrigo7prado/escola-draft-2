/**
 * Script para verificar dados no banco
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Verificando dados no banco...\n');

  const [alunos, enturmacoes, arquivos, linhas] = await Promise.all([
    prisma.aluno.count(),
    prisma.enturmacao.count(),
    prisma.arquivoImportado.count(),
    prisma.linhaImportada.count(),
  ]);

  console.log('📊 Contagens:');
  console.log(`  - Alunos: ${alunos}`);
  console.log(`  - Enturmações: ${enturmacoes}`);
  console.log(`  - Arquivos Importados: ${arquivos}`);
  console.log(`  - Linhas Importadas: ${linhas}`);

  if (enturmacoes > 0) {
    console.log('\n📋 Primeiras 5 enturmações:');
    const primeiras5 = await prisma.enturmacao.findMany({
      take: 5,
      include: {
        aluno: {
          select: {
            matricula: true,
            nome: true,
          },
        },
      },
    });

    primeiras5.forEach((ent, i) => {
      console.log(`  ${i + 1}. ${ent.aluno.nome} (${ent.aluno.matricula})`);
      console.log(`     Ano: ${ent.anoLetivo} | Turma: ${ent.turma} | Série: ${ent.serie}`);
    });
  }

  if (enturmacoes === 0) {
    console.log('\n⚠️  Nenhuma enturmação encontrada!');
    console.log('   Possível causa: dados não foram migrados ou foram deletados.');
  }
}

main()
  .catch((e) => {
    console.error('❌ Erro:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
