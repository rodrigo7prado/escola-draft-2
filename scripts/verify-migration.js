const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('Verificando dados migrados...\n')

  const arquivosCount = await prisma.arquivoImportado.count()
  const linhasCount = await prisma.linhaImportada.count()
  const alunosCount = await prisma.aluno.count()
  const auditoriaCount = await prisma.auditoria.count()

  console.log(`Arquivos importados: ${arquivosCount}`)
  console.log(`Linhas importadas: ${linhasCount}`)
  console.log(`Alunos: ${alunosCount}`)
  console.log(`Registros de auditoria: ${auditoriaCount}`)

  if (linhasCount > 0) {
    console.log('\nDados migrados com sucesso!')

    // Mostra exemplo de uma linha
    const exemploLinha = await prisma.linhaImportada.findFirst({
      include: { arquivo: true }
    })

    if (exemploLinha) {
      console.log('\nExemplo de linha importada:')
      console.log(`- Arquivo: ${exemploLinha.arquivo.nomeArquivo}`)
      console.log(`- Matrícula: ${exemploLinha.identificadorChave}`)
      console.log(`- Dados: ${JSON.stringify(exemploLinha.dadosOriginais).substring(0, 100)}...`)
    }
  } else {
    console.log('\nNenhum dado foi migrado. Verifique a migration.')
  }
}

main()
  .catch((e) => {
    console.error('Erro:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
