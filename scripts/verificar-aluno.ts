/**
 * Script temporário para verificar dados do aluno 202169211192910
 *
 * Verifica:
 * - Se textoBrutoDadosEscolares foi gravado (bug)
 * - Se textoBrutoDadosPessoais existe
 * - Quais campos foram preenchidos
 * - Conteúdo de dadosOriginais (JSONB)
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const matricula = '202169211192910';

  console.log(`\n🔍 Verificando aluno: ${matricula}\n`);

  const aluno = await prisma.aluno.findUnique({
    where: { matricula },
  });

  if (!aluno) {
    console.log('❌ Aluno não encontrado no banco de dados');
    return;
  }

  console.log('✅ Aluno encontrado!\n');
  console.log('='.repeat(80));
  console.log('📋 DADOS BÁSICOS');
  console.log('='.repeat(80));
  console.log(`ID: ${aluno.id}`);
  console.log(`Matrícula: ${aluno.matricula}`);
  console.log(`Nome: ${aluno.nome || '(vazio)'}`);
  console.log(`Sexo: ${aluno.sexo || '(vazio)'}`);
  console.log(`Data Nascimento: ${aluno.dataNascimento || '(vazio)'}`);

  console.log('\n' + '='.repeat(80));
  console.log('📝 TEXTOS BRUTOS IMPORTADOS');
  console.log('='.repeat(80));
  console.log(`textoBrutoDadosPessoais: ${aluno.textoBrutoDadosPessoais ? `${aluno.textoBrutoDadosPessoais.substring(0, 100)}...` : '(vazio)'}`);
  console.log(`dataImportacaoTextoDadosPessoais: ${aluno.dataImportacaoTextoDadosPessoais || '(vazio)'}`);
  console.log(`\ntextoBrutoDadosEscolares: ${aluno.textoBrutoDadosEscolares ? `${aluno.textoBrutoDadosEscolares.substring(0, 100)}...` : '(vazio)'}`);
  console.log(`dataImportacaoTextoDadosEscolares: ${aluno.dataImportacaoTextoDadosEscolares || '(vazio)'}`);

  console.log('\n' + '='.repeat(80));
  console.log('📊 DADOS CADASTRAIS (10 campos)');
  console.log('='.repeat(80));
  console.log(`Nome Social: ${aluno.nomeSocial || '(vazio)'}`);
  console.log(`Estado Civil: ${aluno.estadoCivil || '(vazio)'}`);
  console.log(`País Nascimento: ${aluno.paisNascimento || '(vazio)'}`);
  console.log(`UF: ${aluno.uf || '(vazio)'}`);
  console.log(`Naturalidade: ${aluno.naturalidade || '(vazio)'}`);
  console.log(`Nacionalidade: ${aluno.nacionalidade || '(vazio)'}`);
  console.log(`Necessidade Especial: ${aluno.necessidadeEspecial || '(vazio)'}`);

  console.log('\n' + '='.repeat(80));
  console.log('📄 DOCUMENTOS (7 campos)');
  console.log('='.repeat(80));
  console.log(`Tipo Documento: ${aluno.tipoDocumento || '(vazio)'}`);
  console.log(`RG: ${aluno.rg || '(vazio)'}`);
  console.log(`Complemento Identidade: ${aluno.complementoIdentidade || '(vazio)'}`);
  console.log(`Estado Emissão: ${aluno.estadoEmissao || '(vazio)'}`);
  console.log(`Órgão Emissor: ${aluno.rgOrgaoEmissor || '(vazio)'}`);
  console.log(`Data Emissão RG: ${aluno.rgDataEmissao || '(vazio)'}`);
  console.log(`CPF: ${aluno.cpf || '(vazio)'}`);

  console.log('\n' + '='.repeat(80));
  console.log('👨‍👩‍👧 FILIAÇÃO (4 campos)');
  console.log('='.repeat(80));
  console.log(`Nome Mãe: ${aluno.nomeMae || '(vazio)'}`);
  console.log(`CPF Mãe: ${aluno.cpfMae || '(vazio)'}`);
  console.log(`Nome Pai: ${aluno.nomePai || '(vazio)'}`);
  console.log(`CPF Pai: ${aluno.cpfPai || '(vazio)'}`);

  console.log('\n' + '='.repeat(80));
  console.log('📧 CONTATO (1 campo)');
  console.log('='.repeat(80));
  console.log(`Email: ${aluno.email || '(vazio)'}`);

  console.log('\n' + '='.repeat(80));
  console.log('📜 CERTIDÃO CIVIL (10 campos)');
  console.log('='.repeat(80));
  console.log(`Tipo Certidão: ${aluno.tipoCertidaoCivil || '(vazio)'}`);
  console.log(`Número Certidão: ${aluno.numeroCertidaoCivil || '(vazio)'}`);
  console.log(`UF Cartório: ${aluno.ufCartorio || '(vazio)'}`);
  console.log(`Município Cartório: ${aluno.municipioCartorio || '(vazio)'}`);
  console.log(`Nome Cartório: ${aluno.nomeCartorio || '(vazio)'}`);
  console.log(`Número Termo: ${aluno.numeroTermo || '(vazio)'}`);
  console.log(`Data Emissão Certidão: ${aluno.dataEmissaoCertidao || '(vazio)'}`);
  console.log(`Estado Certidão: ${aluno.estadoCertidao || '(vazio)'}`);
  console.log(`Folha Certidão: ${aluno.folhaCertidao || '(vazio)'}`);
  console.log(`Livro Certidão: ${aluno.livroCertidao || '(vazio)'}`);

  console.log('\n' + '='.repeat(80));
  console.log('🗃️ DADOS ORIGINAIS (JSONB)');
  console.log('='.repeat(80));
  if (aluno.dadosOriginais) {
    console.log(JSON.stringify(aluno.dadosOriginais, null, 2));
  } else {
    console.log('(vazio)');
  }

  console.log('\n' + '='.repeat(80));
  console.log('📈 RESUMO');
  console.log('='.repeat(80));

  const camposPreenchidos = [
    aluno.nome,
    aluno.nomeSocial,
    aluno.dataNascimento,
    aluno.sexo,
    aluno.estadoCivil,
    aluno.paisNascimento,
    aluno.nacionalidade,
    aluno.uf,
    aluno.naturalidade,
    aluno.necessidadeEspecial,
    aluno.tipoDocumento,
    aluno.rg,
    aluno.complementoIdentidade,
    aluno.estadoEmissao,
    aluno.rgOrgaoEmissor,
    aluno.rgDataEmissao,
    aluno.cpf,
    aluno.nomeMae,
    aluno.cpfMae,
    aluno.nomePai,
    aluno.cpfPai,
    aluno.email,
    aluno.tipoCertidaoCivil,
    aluno.numeroCertidaoCivil,
    aluno.ufCartorio,
    aluno.municipioCartorio,
    aluno.nomeCartorio,
    aluno.numeroTermo,
    aluno.dataEmissaoCertidao,
    aluno.estadoCertidao,
    aluno.folhaCertidao,
    aluno.livroCertidao,
  ].filter(Boolean).length;

  console.log(`Total de campos preenchidos: ${camposPreenchidos}/32`);
  console.log(`Texto bruto dados pessoais: ${aluno.textoBrutoDadosPessoais ? '✅' : '❌'}`);
  console.log(`Texto bruto dados escolares: ${aluno.textoBrutoDadosEscolares ? '⚠️ PRESENTE (bug?)' : '✅ Vazio'}`);
  console.log(`Dados originais (JSONB): ${aluno.dadosOriginais ? '✅' : '❌'}`);

  console.log('\n');
}

main()
  .catch((error) => {
    console.error('❌ Erro ao executar script:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
