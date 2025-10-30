/**
 * Script para diagnosticar os tamanhos dos dados originais
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function diagnosticar() {
  console.log('🔍 Diagnosticando dados...\n');

  try {
    // Buscar 5 alunos de exemplo
    const alunosExemplo = await prisma.aluno.findMany({
      take: 5,
      where: {
        linhaOrigemId: { not: null }
      },
      include: {
        linhaOrigem: true
      }
    });

    console.log(`📋 Analisando ${alunosExemplo.length} alunos de exemplo:\n`);

    for (const aluno of alunosExemplo) {
      console.log(`\n--- Aluno: ${aluno.matricula} ---`);

      if (!aluno.linhaOrigem) {
        console.log('  ⚠️  Sem linha de origem');
        continue;
      }

      const dados = aluno.linhaOrigem.dadosOriginais as any;

      console.log(`  Ano: "${dados.Ano}" (length: ${dados.Ano?.length || 0})`);
      console.log(`  MODALIDADE: "${dados.MODALIDADE}" (length: ${dados.MODALIDADE?.length || 0})`);
      console.log(`  TURMA: "${dados.TURMA}" (length: ${dados.TURMA?.length || 0})`);
      console.log(`  SERIE: "${dados.SERIE}" (length: ${dados.SERIE?.length || 0})`);
      console.log(`  TURNO: "${dados.TURNO}" (length: ${dados.TURNO?.length || 0})`);
    }

    // Buscar maiores valores de cada campo
    console.log('\n\n📊 Analisando tamanhos máximos em todos os registros:\n');

    const todasLinhas = await prisma.linhaImportada.findMany({
      where: {
        tipoEntidade: 'aluno'
      }
    });

    let maxAno = 0;
    let maxModalidade = 0;
    let maxTurma = 0;
    let maxSerie = 0;
    let maxTurno = 0;

    let exemplosModalidade: string[] = [];
    let exemplosTurma: string[] = [];

    for (const linha of todasLinhas) {
      const dados = linha.dadosOriginais as any;

      if (dados.Ano?.length > maxAno) maxAno = dados.Ano.length;

      if (dados.MODALIDADE?.length > maxModalidade) {
        maxModalidade = dados.MODALIDADE.length;
        if (!exemplosModalidade.includes(dados.MODALIDADE)) {
          exemplosModalidade.push(dados.MODALIDADE);
        }
      }

      if (dados.TURMA?.length > maxTurma) {
        maxTurma = dados.TURMA.length;
        if (!exemplosTurma.includes(dados.TURMA)) {
          exemplosTurma.push(dados.TURMA);
        }
      }

      if (dados.SERIE?.length > maxSerie) maxSerie = dados.SERIE.length;
      if (dados.TURNO?.length > maxTurno) maxTurno = dados.TURNO.length;
    }

    console.log(`  Ano: max ${maxAno} caracteres (schema permite 10)`);
    console.log(`  MODALIDADE: max ${maxModalidade} caracteres (schema permite 100)`);
    console.log(`  TURMA: max ${maxTurma} caracteres (schema permite 50)`);
    console.log(`  SERIE: max ${maxSerie} caracteres (schema permite 10)`);
    console.log(`  TURNO: max ${maxTurno} caracteres (schema permite 20)`);

    console.log(`\n  Exemplos de modalidades (primeiras 10):`);
    exemplosModalidade.slice(0, 10).forEach(m => console.log(`    - "${m}"`));

    console.log(`\n  Exemplos de turmas (primeiras 10):`);
    exemplosTurma.slice(0, 10).forEach(t => console.log(`    - "${t}"`));

    console.log('\n✨ Diagnóstico concluído!');

  } catch (error) {
    console.error('❌ Erro durante o diagnóstico:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Executar
diagnosticar()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
