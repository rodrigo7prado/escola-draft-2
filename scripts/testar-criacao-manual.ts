/**
 * Testar criação manual de alunos faltantes
 * Objetivo: descobrir por que não foram criados
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testarCriacao() {
  console.log('🧪 TESTE: Criar manualmente alunos faltantes\n');
  console.log('═'.repeat(80));

  // Pegar a primeira aluna faltante: ANNA CLARA SAMPAIO GOMES
  const matriculaTeste = '202201940897856';

  console.log(`\n📝 Testando matrícula: ${matriculaTeste}\n`);

  // Buscar linha no CSV
  const linha = await prisma.linhaImportada.findFirst({
    where: {
      identificadorChave: matriculaTeste
    }
  });

  if (!linha) {
    console.log('❌ Linha não encontrada no banco!');
    return;
  }

  const dados = linha.dadosOriginais as any;

  console.log('📄 Dados da linha:');
  console.log(`   Nome: ${dados.NOME_COMPL}`);
  console.log(`   Disciplina: ${dados.DISCIPLINA1}`);
  console.log(`   Ano: ${dados.Ano}`);
  console.log(`   Turma: ${dados.TURMA}`);

  // Verificar se já existe
  const alunoExistente = await prisma.aluno.findUnique({
    where: { matricula: matriculaTeste }
  });

  if (alunoExistente) {
    console.log('\n⚠️  Aluno JÁ EXISTE no banco!');
    console.log(`   ID: ${alunoExistente.id}`);
    console.log(`   Nome: ${alunoExistente.nome}`);

    // Verificar se tem enturmação
    const enturmacoes = await prisma.enturmacao.findMany({
      where: { alunoId: alunoExistente.id }
    });

    console.log(`\n   Enturmações: ${enturmacoes.length}`);

    if (enturmacoes.length > 0) {
      enturmacoes.forEach(e => {
        console.log(`   - ${e.anoLetivo} / ${e.turma} / Série ${e.serie}`);
      });
    }

    return;
  }

  // Tentar criar
  console.log('\n🔨 Tentando criar aluno...\n');

  try {
    const novoAluno = await prisma.aluno.create({
      data: {
        matricula: matriculaTeste,
        nome: dados.NOME_COMPL || null,
        origemTipo: 'csv',
        linhaOrigemId: linha.id,
        fonteAusente: false
      }
    });

    console.log(`✅ SUCESSO! Aluno criado:`);
    console.log(`   ID: ${novoAluno.id}`);
    console.log(`   Matrícula: ${novoAluno.matricula}`);
    console.log(`   Nome: ${novoAluno.nome}`);

    // Agora tentar criar enturmação
    console.log('\n🔨 Tentando criar enturmação...\n');

    const limparValor = (valor: string | undefined, prefixo: string): string => {
      if (!valor) return '';
      const str = valor.toString().trim();
      if (str.startsWith(prefixo)) {
        return str.substring(prefixo.length).trim();
      }
      return str;
    };

    const anoLetivo = limparValor(dados.Ano, 'Ano Letivo:') || limparValor(dados.Ano, 'Ano:');
    const modalidade = limparValor(dados.MODALIDADE, 'Modalidade:');
    const turma = limparValor(dados.TURMA, 'Turma:');
    const serie = limparValor(dados.SERIE, 'Série:');
    const turno = limparValor(dados.TURNO, 'Turno:') || null;

    console.log(`   Dados extraídos:`);
    console.log(`   - Ano Letivo: "${anoLetivo}"`);
    console.log(`   - Modalidade: "${modalidade}"`);
    console.log(`   - Turma: "${turma}"`);
    console.log(`   - Série: "${serie}"`);
    console.log(`   - Turno: "${turno}"`);

    const enturmacao = await prisma.enturmacao.create({
      data: {
        alunoId: novoAluno.id,
        anoLetivo,
        regime: 0,
        modalidade,
        turma,
        serie,
        turno,
        origemTipo: 'csv',
        linhaOrigemId: linha.id
      }
    });

    console.log(`\n✅ SUCESSO! Enturmação criada:`);
    console.log(`   ID: ${enturmacao.id}`);

    console.log('\n💡 CONCLUSÃO: O problema NÃO é no banco de dados!');
    console.log('   Os dados podem ser criados normalmente.');
    console.log('   O problema está na LÓGICA DO UPLOAD (route.ts)');

  } catch (error: any) {
    console.log(`\n❌ ERRO ao criar:`);
    console.log(`   ${error.message}`);
    console.log(`\n💡 CONCLUSÃO: O problema É no banco de dados!`);
    console.log('   Há alguma constraint ou validação bloqueando.');
  }

  console.log('\n' + '═'.repeat(80));
}

testarCriacao()
  .catch(console.error)
  .finally(() => prisma.$disconnect());