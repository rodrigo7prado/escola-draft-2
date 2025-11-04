/**
 * Script de diagnóstico: verificar por que alunos da Ata não foram criados
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function diagnosticar() {
  console.log('🔍 DIAGNÓSTICO: Importação da Ata de Resultados Finais\n');
  console.log('═'.repeat(80));

  // 1. Buscar o arquivo importado
  const arquivo = await prisma.arquivoImportado.findFirst({
    where: {
      nomeArquivo: {
        contains: 'Ata_resultados_finais'
      }
    },
    include: {
      linhas: {
        take: 5 // Apenas primeiras 5 linhas como amostra
      }
    }
  });

  if (!arquivo) {
    console.log('❌ Arquivo "Ata_resultados_finais.csv" não encontrado no banco!');
    return;
  }

  console.log(`\n✅ Arquivo encontrado:`);
  console.log(`   ID: ${arquivo.id}`);
  console.log(`   Nome: ${arquivo.nomeArquivo}`);
  console.log(`   Status: ${arquivo.status}`);
  console.log(`   Upload em: ${arquivo.dataUpload.toLocaleString('pt-BR')}`);

  // 2. Contar linhas importadas
  const totalLinhas = await prisma.linhaImportada.count({
    where: { arquivoId: arquivo.id }
  });

  console.log(`\n📊 Total de linhas importadas: ${totalLinhas}`);

  // 3. Contar matrículas únicas nas linhas
  const linhasComMatricula = await prisma.linhaImportada.findMany({
    where: { arquivoId: arquivo.id },
    select: {
      identificadorChave: true
    }
  });

  const matriculasUnicas = new Set(
    linhasComMatricula
      .map(l => l.identificadorChave)
      .filter(m => m !== null)
  );

  console.log(`📝 Matrículas únicas no CSV: ${matriculasUnicas.size}`);

  // 4. Verificar quantos alunos foram criados vinculados a essas linhas
  const alunosCriados = await prisma.aluno.count({
    where: {
      linhaOrigem: {
        arquivoId: arquivo.id
      }
    }
  });

  console.log(`👥 Alunos criados no banco: ${alunosCriados}`);

  // 5. Verificar enturmações criadas
  const enturmacoesCriadas = await prisma.enturmacao.count({
    where: {
      linhaOrigem: {
        arquivoId: arquivo.id
      }
    }
  });

  console.log(`📚 Enturmações criadas: ${enturmacoesCriadas}`);

  console.log('\n' + '═'.repeat(80));
  console.log('\n🔎 ANÁLISE DAS PRIMEIRAS 5 LINHAS:\n');

  for (let i = 0; i < Math.min(5, arquivo.linhas.length); i++) {
    const linha = arquivo.linhas[i];
    const dados = linha.dadosOriginais as any;

    console.log(`Linha ${i + 1}:`);
    console.log(`   Matrícula: ${linha.identificadorChave}`);
    console.log(`   Nome: ${dados.NOME_COMPL || '(sem nome)'}`);
    console.log(`   Disciplina: ${dados.DISCIPLINA1 || '(sem disciplina)'}`);

    // Verificar se aluno foi criado
    const aluno = await prisma.aluno.findUnique({
      where: { matricula: linha.identificadorChave || '' }
    });

    if (aluno) {
      console.log(`   ✅ Aluno CRIADO no banco (ID: ${aluno.id})`);
    } else {
      console.log(`   ❌ Aluno NÃO CRIADO no banco`);
    }

    console.log('');
  }

  console.log('═'.repeat(80));
  console.log('\n📋 RESUMO:\n');

  const faltamCriar = matriculasUnicas.size - alunosCriados;

  console.log(`Total de alunos que DEVERIAM existir: ${matriculasUnicas.size}`);
  console.log(`Total de alunos que EXISTEM: ${alunosCriados}`);
  console.log(`Total FALTANDO criar: ${faltamCriar}`);

  if (faltamCriar > 0) {
    console.log('\n❌ PROBLEMA CONFIRMADO: Alunos não foram criados durante o upload!');
    console.log('\n💡 Possíveis causas:');
    console.log('   1. Erro silencioso durante a transação');
    console.log('   2. Lógica de criação não executou (bug no código)');
    console.log('   3. Constraint violation no banco de dados');
    console.log('\n🔧 Próximo passo: Verificar logs do servidor durante o upload');
  } else {
    console.log('\n✅ OK: Todos os alunos foram criados!');
  }

  console.log('\n' + '═'.repeat(80));
}

diagnosticar()
  .catch(console.error)
  .finally(() => prisma.$disconnect());