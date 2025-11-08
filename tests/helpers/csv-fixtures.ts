/**
 * Fixtures de CSVs para testes
 *
 * Fornece dados de exemplo para testar upload e parsing de arquivos CSV.
 * Baseado em estrutura real dos arquivos do Conexão Educação (SEEDUC-RJ).
 *
 * @see docs/ciclos/MIGRACAO_ESPECIFICACAO.md - Edge Cases
 */

/**
 * CSV válido com 3 alunos da mesma turma
 *
 * Representa uma exportação típica de Ata de Resultados Finais.
 * IMPORTANTE: Usa "ALUNO" como nome da coluna (padrão do sistema oficial)
 */
export const CSV_VALIDO_3_ALUNOS = `Ano,MODALIDADE,TURMA,SERIE,TURNO,ALUNO,NOME,SEXO,NASCIMENTO,NACIONALIDADE,NATURALIDADE,UF,RG,ORGAO_EMISSOR,DATA_EMISSAO_RG,CPF,NOME_MAE,NOME_PAI
Ano Letivo: 2024,Modalidade: REGULAR,Turma: 3001,Série: 3,Turno: MANHÃ,123456789012345,João da Silva,M,01/01/2006,Brasileira,Rio de Janeiro,RJ,12.345.678-9,DETRAN,01/01/2020,123.456.789-10,Maria da Silva,José da Silva
Ano Letivo: 2024,Modalidade: REGULAR,Turma: 3001,Série: 3,Turno: MANHÃ,234567890123456,Ana Paula Santos,F,15/03/2006,Brasileira,Niterói,RJ,23.456.789-0,DETRAN,15/03/2020,234.567.890-11,Paula Santos,Carlos Santos
Ano Letivo: 2024,Modalidade: REGULAR,Turma: 3001,Série: 3,Turno: MANHÃ,345678901234567,Pedro Oliveira,M,20/07/2005,Brasileira,São Gonçalo,RJ,34.567.890-1,DETRAN,20/07/2019,345.678.901-22,Joana Oliveira,Paulo Oliveira`;

/**
 * CSV com campos faltando (dados incompletos)
 *
 * Testa robustez do parser com dados ausentes.
 */
export const CSV_DADOS_INCOMPLETOS = `Ano,MODALIDADE,TURMA,SERIE,TURNO,MATRICULA,NOME,SEXO,NASCIMENTO,NACIONALIDADE,NATURALIDADE,UF,RG,ORGAO_EMISSOR,DATA_EMISSAO_RG,CPF,NOME_MAE,NOME_PAI
Ano Letivo: 2024,Modalidade: REGULAR,Turma: 3001,Série: 3,Turno: MANHÃ,123456789012345,João da Silva,,,,,,,,,,,
Ano Letivo: 2024,Modalidade: REGULAR,Turma: 3001,Série: 3,,234567890123456,Ana Paula Santos,F,15/03/2006,Brasileira,Niterói,RJ,,,,,Paula Santos,`;

/**
 * CSV sem prefixos (já limpo)
 *
 * Testa se sistema aceita CSVs que já vêm sem prefixos.
 */
export const CSV_SEM_PREFIXOS = `Ano,MODALIDADE,TURMA,SERIE,TURNO,MATRICULA,NOME,SEXO,NASCIMENTO,NACIONALIDADE,NATURALIDADE,UF,RG,ORGAO_EMISSOR,DATA_EMISSAO_RG,CPF,NOME_MAE,NOME_PAI
2024,REGULAR,3001,3,MANHÃ,123456789012345,João da Silva,M,01/01/2006,Brasileira,Rio de Janeiro,RJ,12.345.678-9,DETRAN,01/01/2020,123.456.789-10,Maria da Silva,José da Silva`;

/**
 * CSV com encoding especial (acentuação)
 *
 * Testa se parser lida corretamente com UTF-8.
 */
export const CSV_COM_ACENTUACAO = `Ano,MODALIDADE,TURMA,SERIE,TURNO,MATRICULA,NOME,SEXO,NASCIMENTO,NACIONALIDADE,NATURALIDADE,UF,RG,ORGAO_EMISSOR,DATA_EMISSAO_RG,CPF,NOME_MAE,NOME_PAI
Ano Letivo: 2024,Modalidade: EDUCAÇÃO DE JOVENS E ADULTOS,Turma: 3001,Série: 3,Turno: NOITE,123456789012345,José María González,M,01/01/1990,Brasileira,São Paulo,SP,12.345.678-9,SSP,01/01/2010,123.456.789-10,María González,João González`;

/**
 * CSV vazio (apenas header)
 *
 * Edge case: arquivo válido mas sem dados.
 */
export const CSV_VAZIO = `Ano,MODALIDADE,TURMA,SERIE,TURNO,MATRICULA,NOME,SEXO,NASCIMENTO,NACIONALIDADE,NATURALIDADE,UF,RG,ORGAO_EMISSOR,DATA_EMISSAO_RG,CPF,NOME_MAE,NOME_PAI`;

/**
 * CSV com múltiplas turmas
 *
 * Testa agrupamento hierárquico (ano → turma).
 */
export const CSV_MULTIPLAS_TURMAS = `Ano,MODALIDADE,TURMA,SERIE,TURNO,MATRICULA,NOME,SEXO,NASCIMENTO,NACIONALIDADE,NATURALIDADE,UF,RG,ORGAO_EMISSOR,DATA_EMISSAO_RG,CPF,NOME_MAE,NOME_PAI
Ano Letivo: 2024,Modalidade: REGULAR,Turma: 3001,Série: 3,Turno: MANHÃ,123456789012345,João da Silva,M,01/01/2006,Brasileira,Rio de Janeiro,RJ,12.345.678-9,DETRAN,01/01/2020,123.456.789-10,Maria da Silva,José da Silva
Ano Letivo: 2024,Modalidade: REGULAR,Turma: 3002,Série: 3,Turno: TARDE,234567890123456,Ana Paula Santos,F,15/03/2006,Brasileira,Niterói,RJ,23.456.789-0,DETRAN,15/03/2020,234.567.890-11,Paula Santos,Carlos Santos`;

/**
 * CSV com múltiplos anos
 *
 * Testa separação por período letivo.
 */
export const CSV_MULTIPLOS_ANOS = `Ano,MODALIDADE,TURMA,SERIE,TURNO,MATRICULA,NOME,SEXO,NASCIMENTO,NACIONALIDADE,NATURALIDADE,UF,RG,ORGAO_EMISSOR,DATA_EMISSAO_RG,CPF,NOME_MAE,NOME_PAI
Ano Letivo: 2023,Modalidade: REGULAR,Turma: 3001,Série: 3,Turno: MANHÃ,123456789012345,João da Silva,M,01/01/2006,Brasileira,Rio de Janeiro,RJ,12.345.678-9,DETRAN,01/01/2020,123.456.789-10,Maria da Silva,José da Silva
Ano Letivo: 2024,Modalidade: REGULAR,Turma: 3001,Série: 3,Turno: MANHÃ,234567890123456,Ana Paula Santos,F,15/03/2006,Brasileira,Niterói,RJ,23.456.789-0,DETRAN,15/03/2020,234.567.890-11,Paula Santos,Carlos Santos`;

/**
 * Helper para criar arquivo File em testes
 *
 * Converte string CSV em objeto File como se fosse upload real.
 */
export function criarArquivoCsvTeste(conteudo: string, nomeArquivo = 'teste.csv'): File {
  const blob = new Blob([conteudo], { type: 'text/csv' });
  return new File([blob], nomeArquivo, { type: 'text/csv' });
}

/**
 * Helper para criar FormData em testes
 *
 * Simula upload de arquivo via FormData.
 */
export function criarFormDataTeste(arquivo: File): FormData {
  const formData = new FormData();
  formData.append('file', arquivo);
  return formData;
}

/**
 * Parser CSV simplificado para testes
 *
 * Converte string CSV em objeto ParsedCsv com headers e rows.
 * Usado para preparar dados de teste antes de enviar para API.
 */
export function parseCsvLoose(text: string): { headers: string[]; rows: Record<string, string>[] } {
  const rawLines = text.split(/\r?\n/);
  const lines = rawLines
    .map((l) => l.replace(/\uFEFF/g, ''))
    .filter((l) => l.trim());

  const [headerLine, ...dataLines] = lines;
  const headers = headerLine.split(',');
  const rows = dataLines.map((line) => {
    const values = line.split(',');
    const row: Record<string, string> = {};
    headers.forEach((header, i) => {
      row[header] = values[i] || '';
    });
    return row;
  });

  return { headers, rows };
}

/**
 * Dados de aluno válido (objeto já parseado)
 *
 * Útil para testes de validação de dados sem precisar parsear CSV.
 */
export const ALUNO_VALIDO = {
  matricula: '123456789012345',
  nome: 'João da Silva',
  sexo: 'M',
  nascimento: '2006-01-01',
  nacionalidade: 'Brasileira',
  naturalidade: 'Rio de Janeiro',
  uf: 'RJ',
  rg: '12.345.678-9',
  orgaoEmissor: 'DETRAN',
  dataEmissaoRg: '2020-01-01',
  cpf: '123.456.789-10',
  nomeMae: 'Maria da Silva',
  nomePai: 'José da Silva',
};

/**
 * Dados de enturmação válida (objeto já parseado)
 */
export const ENTURMACAO_VALIDA = {
  anoLetivo: '2024',
  modalidade: 'REGULAR',
  turma: '3001',
  serie: '3',
  turno: 'MANHÃ',
};