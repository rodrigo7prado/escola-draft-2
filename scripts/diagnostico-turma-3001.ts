/**
 * Diagnóstico específico: Turma IF_CIA_3001-180191 de 2024
 * Por que só 3 alunos foram criados?
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function diagnosticar() {
  console.log('🔍 DIAGNÓSTICO: Turma 3001 de 2024\n');
  console.log('═'.repeat(80));

  // Buscar alunos da turma 3001 de 2024
  const alunosTurma3001 = await prisma.enturmacao.findMany({
    where: {
      anoLetivo: '2024',
      turma: 'IF_CIA_3001-180191'
    },
    include: {
      aluno: {
        select: {
          matricula: true,
          nome: true
        }
      }
    }
  });

  console.log(`\n👥 ALUNOS CRIADOS DA TURMA 3001 (${alunosTurma3001.length}):\n`);

  alunosTurma3001.forEach((ent, index) => {
    console.log(`${index + 1}. ${ent.aluno.nome} (${ent.aluno.matricula})`);
  });

  console.log('\n' + '═'.repeat(80));

  // Agora vamos ver TODAS as matrículas que aparecem no CSV dessa turma
  const linhasTurma3001 = await prisma.linhaImportada.findMany({
    where: {
      tipoEntidade: 'aluno'
    }
  });

  // Filtrar apenas linhas da turma 3001
  const matriculasNoCSV = new Set<string>();
  const nomesNoCSV = new Map<string, string>();

  for (const linha of linhasTurma3001) {
    const dados = linha.dadosOriginais as any;

    // Limpar prefixo da turma
    const turma = (dados.TURMA || '').toString().trim().replace('Turma: ', '');
    const anoLetivo = (dados.Ano || '').toString().trim().replace('Ano Letivo: ', '').replace('Ano: ', '');

    if (turma === 'IF_CIA_3001-180191' && anoLetivo === '2024') {
      const matricula = linha.identificadorChave;
      if (matricula) {
        matriculasNoCSV.add(matricula);
        if (!nomesNoCSV.has(matricula)) {
          nomesNoCSV.set(matricula, dados.NOME_COMPL || '(sem nome)');
        }
      }
    }
  }

  console.log(`\n📝 TOTAL DE ALUNOS ÚNICOS NO CSV DA TURMA 3001: ${matriculasNoCSV.size}\n`);

  // Comparar com alunos criados
  const matriculasCriadas = new Set(alunosTurma3001.map(e => e.aluno.matricula));

  const faltantes: Array<{matricula: string, nome: string}> = [];

  for (const matricula of matriculasNoCSV) {
    if (!matriculasCriadas.has(matricula)) {
      faltantes.push({
        matricula,
        nome: nomesNoCSV.get(matricula) || '(sem nome)'
      });
    }
  }

  console.log('═'.repeat(80));
  console.log(`\n❌ ALUNOS FALTANTES (${faltantes.length}):\n`);

  faltantes.forEach((aluno, index) => {
    console.log(`${index + 1}. ${aluno.nome} (${aluno.matricula})`);
  });

  console.log('\n' + '═'.repeat(80));
}

diagnosticar()
  .catch(console.error)
  .finally(() => prisma.$disconnect());