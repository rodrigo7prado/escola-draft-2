/**
 * Script para migrar dados existentes de alunos para a tabela de enturmações
 *
 * Este script deve ser executado após a criação do model Enturmacao
 * para popular os registros de enturmação dos alunos já existentes no banco.
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrarEnturmacoes() {
  console.log('🚀 Iniciando migração de enturmações...\n');

  try {
    // 1. Verificar quantos alunos existem
    const totalAlunos = await prisma.aluno.count();
    console.log(`📊 Total de alunos no banco: ${totalAlunos}`);

    // 2. Verificar quantas enturmações já existem
    const totalEnturmacoesAntes = await prisma.enturmacao.count();
    console.log(`📊 Enturmações existentes antes da migração: ${totalEnturmacoesAntes}\n`);

    // 3. Buscar todos os alunos que têm linha de origem (CSV)
    const alunosComOrigem = await prisma.aluno.findMany({
      where: {
        linhaOrigemId: {
          not: null
        }
      },
      include: {
        linhaOrigem: true,
        enturmacoes: true
      }
    });

    console.log(`📋 Alunos com origem CSV: ${alunosComOrigem.length}\n`);

    let enturmacoesNovas = 0;
    let alunosSemDados = 0;
    let erros = 0;

    // 4. Para cada aluno, criar enturmação baseada nos dados originais
    for (const aluno of alunosComOrigem) {
      try {
        if (!aluno.linhaOrigem) {
          console.log(`⚠️  Aluno ${aluno.matricula}: sem linha de origem`);
          continue;
        }

        const dadosOriginais = aluno.linhaOrigem.dadosOriginais as any;

        // Função helper para remover prefixos
        const limparValor = (valor: string, prefixo: string): string => {
          if (!valor) return '';
          const str = valor.toString().trim();
          if (str.startsWith(prefixo)) {
            return str.substring(prefixo.length).trim();
          }
          return str;
        };

        // Extrair dados removendo prefixos
        const anoLetivo = limparValor(dadosOriginais.Ano, 'Ano Letivo:') || limparValor(dadosOriginais.Ano, 'Ano:');
        const modalidade = limparValor(dadosOriginais.MODALIDADE, 'Modalidade:');
        const turma = limparValor(dadosOriginais.TURMA, 'Turma:');
        const serie = limparValor(dadosOriginais.SERIE, 'Série:');
        const turno = limparValor(dadosOriginais.TURNO, 'Turno:') || null;

        // Validar dados essenciais
        if (!anoLetivo || !modalidade || !turma || !serie) {
          console.log(`⚠️  Aluno ${aluno.matricula}: dados incompletos (ano: ${anoLetivo}, modalidade: ${modalidade}, turma: ${turma}, série: ${serie})`);
          alunosSemDados++;
          continue;
        }

        // Verificar se já existe essa enturmação
        const enturmacaoExistente = aluno.enturmacoes.find(e =>
          e.anoLetivo === anoLetivo &&
          e.modalidade === modalidade &&
          e.turma === turma &&
          e.serie === serie
        );

        if (enturmacaoExistente) {
          // Já existe, pular
          continue;
        }

        // Criar nova enturmação
        await prisma.enturmacao.create({
          data: {
            alunoId: aluno.id,
            anoLetivo,
            regime: 0, // Padrão anual
            modalidade,
            turma,
            serie,
            turno,
            origemTipo: 'csv',
            linhaOrigemId: aluno.linhaOrigemId
          }
        });

        enturmacoesNovas++;

        // Log a cada 100 registros
        if (enturmacoesNovas % 100 === 0) {
          console.log(`✅ ${enturmacoesNovas} enturmações criadas...`);
        }

      } catch (error) {
        console.error(`❌ Erro ao processar aluno ${aluno.matricula}:`, error);
        erros++;
      }
    }

    // 5. Verificar total após migração
    const totalEnturmacoesDepois = await prisma.enturmacao.count();

    console.log('\n📊 Resumo da migração:');
    console.log(`   ✅ Enturmações criadas: ${enturmacoesNovas}`);
    console.log(`   ⚠️  Alunos sem dados completos: ${alunosSemDados}`);
    console.log(`   ❌ Erros: ${erros}`);
    console.log(`   📊 Total de enturmações no banco: ${totalEnturmacoesDepois}`);
    console.log('\n✨ Migração concluída!');

  } catch (error) {
    console.error('❌ Erro fatal durante a migração:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Executar
migrarEnturmacoes()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
