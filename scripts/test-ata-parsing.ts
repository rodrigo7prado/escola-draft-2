/**
 * Script para testar o parsing do CSV de Ata de Resultados
 * Simula o que acontece no upload sem acessar o banco
 */

// Simular uma linha do CSV
const linhasCSV = [
  {
    "Ano": "Ano Letivo: 2024",
    "CENSO": "Escola:          33063397 - CE SENOR ABRAVANEL",
    "MODALIDADE": "Modalidade: REGULAR",
    "CURSO": "Curso: NEM ITINERÁRIO FORMATIVO BLOCO TEMÁTICO LGG+CHS - CIDADANIA ATIVA",
    "SERIE": "Série: 3",
    "TURNO": "Turno: M",
    "TURMA": "Turma: IF_CIA_3001-180191",
    "ALUNO": "202201940865733",
    "NOME_COMPL": "ANDRÉ RODRIGUES DE SOUSA FILHO",
    "DISCIPLINA1": "CLUBE DA LEITURA",
    "TOTAL_PONTOS": "-",
    "FALTAS": "0",
    "Textbox148": "80.02",
    "SITUACAO_FINAL": "Aprovado"
  },
  {
    "Ano": "Ano Letivo: 2024",
    "CENSO": "Escola:          33063397 - CE SENOR ABRAVANEL",
    "MODALIDADE": "Modalidade: REGULAR",
    "CURSO": "Curso: NEM ITINERÁRIO FORMATIVO BLOCO TEMÁTICO LGG+CHS - CIDADANIA ATIVA",
    "SERIE": "Série: 3",
    "TURNO": "Turno: M",
    "TURMA": "Turma: IF_CIA_3001-180191",
    "ALUNO": "202201940865733",
    "NOME_COMPL": "ANDRÉ RODRIGUES DE SOUSA FILHO",
    "DISCIPLINA1": "DA GRÉCIA AO BRASIL",
    "TOTAL_PONTOS": "23.00",
    "FALTAS": "23",
    "Textbox148": "80.02",
    "SITUACAO_FINAL": "Aprovado"
  },
  {
    "Ano": "Ano Letivo: 2024",
    "CENSO": "Escola:          33063397 - CE SENOR ABRAVANEL",
    "MODALIDADE": "Modalidade: REGULAR",
    "CURSO": "Curso: NEM ITINERÁRIO FORMATIVO BLOCO TEMÁTICO LGG+CHS - CIDADANIA ATIVA",
    "SERIE": "Série: 3",
    "TURNO": "Turno: M",
    "TURMA": "Turma: IF_CIA_3001-180191",
    "ALUNO": "202201940897856",
    "NOME_COMPL": "ANNA CLARA SAMPAIO GOMES",
    "DISCIPLINA1": "CLUBE DA LEITURA",
    "TOTAL_PONTOS": "-",
    "FALTAS": "0",
    "Textbox148": "79.70",
    "SITUACAO_FINAL": "Aprovado"
  }
];

// Função helper (copiada do route.ts)
const limparValor = (valor: string | undefined, prefixo: string): string => {
  if (!valor) return '';
  const str = valor.toString().trim();
  if (str.startsWith(prefixo)) {
    return str.substring(prefixo.length).trim();
  }
  return str;
};

console.log('🔍 TESTE DE PARSING DO CSV DE ATA\n');
console.log('═'.repeat(80));

// Simular agrupamento por aluno
const alunosMap = new Map<string, any>();

for (let i = 0; i < linhasCSV.length; i++) {
  const row = linhasCSV[i];
  const matricula = row.ALUNO?.trim();

  console.log(`\n📄 Linha ${i + 1}:`);
  console.log(`   Matrícula: "${matricula}"`);
  console.log(`   Nome: "${row.NOME_COMPL}"`);
  console.log(`   Disciplina: "${row.DISCIPLINA1}"`);

  if (!matricula) {
    console.log('   ❌ IGNORADA: Sem matrícula');
    continue;
  }

  // Guardar para processar alunos depois (apenas primeira ocorrência)
  if (!alunosMap.has(matricula)) {
    alunosMap.set(matricula, {
      dados: row
    });
    console.log('   ✅ PRIMEIRA OCORRÊNCIA - Guardado para criar aluno');
  } else {
    console.log('   ⏭️  DUPLICADA - Aluno já existe no map (mesma matrícula)');
  }
}

console.log('\n' + '═'.repeat(80));
console.log(`\n📊 RESUMO DO AGRUPAMENTO:\n`);
console.log(`Total de linhas processadas: ${linhasCSV.length}`);
console.log(`Total de alunos únicos: ${alunosMap.size}`);

console.log('\n' + '═'.repeat(80));
console.log('\n👥 ALUNOS QUE SERIAM CRIADOS:\n');

let count = 1;
for (const [matricula, info] of alunosMap) {
  console.log(`${count}. Matrícula: ${matricula}`);
  console.log(`   Nome: ${info.dados.NOME_COMPL || '(sem nome)'}`);

  // Testar extração de dados de enturmação
  const anoLetivo = limparValor(info.dados.Ano, 'Ano Letivo:') || limparValor(info.dados.Ano, 'Ano:');
  const modalidade = limparValor(info.dados.MODALIDADE, 'Modalidade:');
  const turma = limparValor(info.dados.TURMA, 'Turma:');
  const serie = limparValor(info.dados.SERIE, 'Série:');
  const turno = limparValor(info.dados.TURNO, 'Turno:') || null;

  console.log(`\n   📚 Dados de Enturmação:`);
  console.log(`      Ano Letivo: "${anoLetivo}" ${anoLetivo ? '✅' : '❌'}`);
  console.log(`      Modalidade: "${modalidade}" ${modalidade ? '✅' : '❌'}`);
  console.log(`      Turma: "${turma}" ${turma ? '✅' : '❌'}`);
  console.log(`      Série: "${serie}" ${serie ? '✅' : '❌'}`);
  console.log(`      Turno: "${turno || '(não informado)'}"`);

  const podecriarEnturmacao = anoLetivo && modalidade && turma && serie;
  console.log(`\n   ${podecriarEnturmacao ? '✅ ENTURMAÇÃO SERÁ CRIADA' : '❌ ENTURMAÇÃO NÃO SERÁ CRIADA (faltam dados)'}`);

  console.log('');
  count++;
}

console.log('═'.repeat(80));
console.log('\n✅ Simulação concluída!\n');