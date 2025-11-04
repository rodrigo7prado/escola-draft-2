/**
 * Verificar quais anos letivos estão no CSV
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verificarAnos() {
  console.log('📅 VERIFICANDO ANOS LETIVOS NO CSV\n');
  console.log('═'.repeat(80));

  const arquivo = await prisma.arquivoImportado.findFirst({
    where: {
      nomeArquivo: {
        contains: 'Ata_resultados_finais'
      }
    }
  });

  if (!arquivo) {
    console.log('❌ Arquivo não encontrado');
    return;
  }

  const linhas = await prisma.linhaImportada.findMany({
    where: { arquivoId: arquivo.id }
  });

  const anosSet = new Set<string>();
  const turmasSet = new Set<string>();

  const limparValor = (valor: string | undefined, prefixo: string): string => {
    if (!valor) return '';
    const str = valor.toString().trim();
    if (str.startsWith(prefixo)) {
      return str.substring(prefixo.length).trim();
    }
    return str;
  };

  for (const linha of linhas) {
    const dados = linha.dadosOriginais as any;
    const ano = limparValor(dados.Ano, 'Ano Letivo:') || limparValor(dados.Ano, 'Ano:');
    const turma = limparValor(dados.TURMA, 'Turma:');

    if (ano) anosSet.add(ano);
    if (turma) turmasSet.add(turma);
  }

  console.log(`\n📊 Anos letivos encontrados: ${anosSet.size}\n`);
  Array.from(anosSet).sort().forEach(ano => {
    console.log(`   - ${ano}`);
  });

  console.log(`\n📚 Total de turmas únicas: ${turmasSet.size}\n`);

  // Filtrar apenas turmas 3001
  const turmas3001 = Array.from(turmasSet).filter(t => t.includes('3001'));
  console.log(`Turmas 3001 encontradas: ${turmas3001.length}\n`);
  turmas3001.forEach(t => console.log(`   - ${t}`));

  console.log('\n' + '═'.repeat(80));
}

verificarAnos()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
