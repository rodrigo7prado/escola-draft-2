const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('Populando tabela alunos...\n')

  // Buscar todas as linhas do tipo 'aluno' agrupadas por matrícula
  const linhas = await prisma.linhaImportada.findMany({
    where: { tipoEntidade: 'aluno' },
    include: { arquivo: true },
    orderBy: [
      { arquivo: { dataUpload: 'desc' } },
      { createdAt: 'desc' }
    ]
  })

  console.log(`Total de linhas encontradas: ${linhas.length}`)

  // Agrupar por matrícula e pegar apenas a mais recente
  const alunosPorMatricula = new Map()

  for (const linha of linhas) {
    const matricula = linha.identificadorChave

    if (!matricula || matricula.trim() === '') continue

    // Se ainda não tem essa matrícula, adiciona
    if (!alunosPorMatricula.has(matricula)) {
      alunosPorMatricula.set(matricula, linha)
    }
  }

  console.log(`Alunos únicos encontrados: ${alunosPorMatricula.size}`)

  // Inserir alunos
  let inserted = 0
  let errors = 0

  for (const [matricula, linha] of alunosPorMatricula) {
    try {
      const dados = linha.dadosOriginais

      await prisma.aluno.create({
        data: {
          matricula: matricula,
          nome: dados.NOME_COMPL || null,
          origemTipo: 'csv',
          linhaOrigemId: linha.id,
          fonteAusente: false,
          fonteAusenteCiente: false
        }
      })

      inserted++

      if (inserted % 100 === 0) {
        console.log(`Inseridos: ${inserted} alunos...`)
      }
    } catch (error) {
      errors++
      console.error(`Erro ao inserir aluno ${matricula}:`, error.message)
    }
  }

  console.log(`\nConcluído!`)
  console.log(`Alunos inseridos: ${inserted}`)
  console.log(`Erros: ${errors}`)
}

main()
  .catch((e) => {
    console.error('Erro:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
