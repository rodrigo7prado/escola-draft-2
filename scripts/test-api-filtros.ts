/**
 * Script para testar API de filtros diretamente
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Testando lógica da API de filtros...\n');

  // Testar: buscar anos letivos
  console.log('1️⃣  Buscando anos letivos...');
  const anos = await prisma.enturmacao.findMany({
    select: { anoLetivo: true },
    distinct: ['anoLetivo'],
    orderBy: { anoLetivo: 'desc' }
  });
  console.log('   Encontrados:', anos.map(a => a.anoLetivo));

  // Testar: buscar turmas de 2023, regime 0, REGULAR, série 3
  console.log('\n2️⃣  Buscando turmas (2023, regime 0, REGULAR, série 3)...');
  const turmas = await prisma.enturmacao.findMany({
    where: {
      anoLetivo: '2023',
      regime: 0,
      modalidade: 'REGULAR',
      serie: '3'
    },
    select: { turma: true },
    distinct: ['turma'],
    orderBy: { turma: 'asc' }
  });
  console.log('   Encontradas:', turmas.map(t => t.turma));

  // Testar: buscar alunos de uma turma específica
  if (turmas.length > 0) {
    const primeiraTurma = turmas[0].turma;
    console.log(`\n3️⃣  Buscando alunos da turma ${primeiraTurma}...`);

    const enturmacoes = await prisma.enturmacao.findMany({
      where: {
        anoLetivo: '2023',
        regime: 0,
        modalidade: 'REGULAR',
        serie: '3',
        turma: primeiraTurma
      },
      include: {
        aluno: true
      }
    });

    console.log(`   Encontrados: ${enturmacoes.length} alunos`);
    if (enturmacoes.length > 0) {
      console.log(`   Exemplo: ${enturmacoes[0].aluno.nome} (${enturmacoes[0].aluno.matricula})`);
    }
  }

  console.log('\n✅ Todas as queries funcionaram!');
}

main()
  .catch((e) => {
    console.error('❌ Erro:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });