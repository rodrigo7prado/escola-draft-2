import { type ParserConfig } from "../tipos";

export const fichaIndividualHistoricoMap: ParserConfig = {
  parserNome: "importacaoFichaIndividualHistorico",
  formatosSuportados: ["XLSX"],
  campos: {
    "NOME DO ALUNO": {
      extracao: { XLSX: { estrategia: "BLOCO_ROTULO", rotuloRegex: /^NOME DO ALUNO/i } },
      normalizacao: { tipo: "STRING_TRIM_UPPER" },
      persistencia: { tipoVinculo: "vinculação", modelo: "Aluno", campo: "nome" },
    },
    "DATA DE NASCIMENTO": {
      extracao: { XLSX: { estrategia: "BLOCO_ROTULO", rotuloRegex: /^DATA DE NASCIMENTO/i } },
      normalizacao: { tipo: "DATA_ISO" },
      persistencia: { tipoVinculo: "vinculação", modelo: "Aluno", campo: "dataNascimento" },
    },
    SEXO: {
      extracao: { XLSX: { estrategia: "BLOCO_ROTULO", rotuloRegex: /^SEXO/i } },
      normalizacao: { tipo: "STRING_TRIM_UPPER" },
      persistencia: { tipoVinculo: "validação", modelo: "Aluno", campo: "sexo" },
    },
    PAI: {
      extracao: { XLSX: { estrategia: "BLOCO_ROTULO", rotuloRegex: /^PAI/i } },
      normalizacao: { tipo: "STRING_TRIM_UPPER" },
      persistencia: { tipoVinculo: "nenhum" },
    },
    "MÃE": {
      extracao: { XLSX: { estrategia: "BLOCO_ROTULO", rotuloRegex: /^M[ÃA]E/i } },
      normalizacao: { tipo: "STRING_TRIM_UPPER" },
      persistencia: { tipoVinculo: "nenhum" },
    },
    "ANO LETIVO": {
      extracao: { XLSX: { estrategia: "BLOCO_ROTULO", rotuloRegex: /^ANO/i } },
      normalizacao: { tipo: "NUMERO", formato: "INT" },
      persistencia: { tipoVinculo: "composição", modelo: "SerieCursada", campo: "anoLetivo" },
    },
    "PERÍODO LETIVO": {
      extracao: { XLSX: { estrategia: "BLOCO_ROTULO", rotuloRegex: /^PER[IÍ]ODO/i } },
      normalizacao: { tipo: "NUMERO", formato: "INT" },
      persistencia: { tipoVinculo: "composição", modelo: "SerieCursada", campo: "periodoLetivo" },
    },
    CURSO: {
      extracao: { XLSX: { estrategia: "BLOCO_ROTULO", rotuloRegex: /^CURSO/i } },
      normalizacao: { tipo: "STRING_TRIM_UPPER" },
      persistencia: { tipoVinculo: "composição", modelo: "SerieCursada", campo: "curso" },
    },
    "SÉRIE": {
      extracao: { XLSX: { estrategia: "BLOCO_ROTULO", rotuloRegex: /^S[ÉE]RIE/i } },
      normalizacao: { tipo: "NUMERO", formato: "INT" },
      persistencia: { tipoVinculo: "composição", modelo: "SerieCursada", campo: "serie" },
    },
    TURMA: {
      extracao: { XLSX: { estrategia: "BLOCO_ROTULO", rotuloRegex: /^TURMA/i } },
      normalizacao: { tipo: "STRING_TRIM_UPPER" },
      persistencia: { tipoVinculo: "composição", modelo: "SerieCursada", campo: "turma" },
    },
    TURNO: {
      extracao: { XLSX: { estrategia: "BLOCO_ROTULO", rotuloRegex: /^TURNO/i } },
      normalizacao: { tipo: "STRING_TRIM_UPPER" },
      persistencia: { tipoVinculo: "composição", modelo: "SerieCursada", campo: "turno" },
    },
    ESCOLA: {
      extracao: { XLSX: { estrategia: "BLOCO_ROTULO", rotuloRegex: /^ESCOLA/i } },
      normalizacao: { tipo: "STRING_TRIM_UPPER" },
      persistencia: { tipoVinculo: "composição" },
    },
    "COMPONENTE CURRICULAR": {
      extracao: { XLSX: { estrategia: "TABELA_DISCIPLINAS", colunaHeader: /^DISCIPLINA/i } },
      normalizacao: { tipo: "STRING_TRIM_UPPER" },
      persistencia: { tipoVinculo: "gravação", modelo: "HistoricoEscolar", campo: "componenteCurricular" },
    },
    "CARGA HORÁRIA": {
      extracao: { XLSX: { estrategia: "TABELA_DISCIPLINAS", colunaHeader: /^C\\.H/i } },
      normalizacao: { tipo: "NUMERO", formato: "INT" },
      persistencia: { tipoVinculo: "gravação", modelo: "HistoricoEscolar", campo: "cargaHoraria" },
    },
    FREQUÊNCIA: {
      extracao: { XLSX: { estrategia: "TABELA_DISCIPLINAS", colunaHeader: /^%?FR/i } },
      normalizacao: { tipo: "NUMERO", formato: "FLOAT" },
      persistencia: { tipoVinculo: "gravação", modelo: "HistoricoEscolar", campo: "frequencia" },
    },
    "TOTAL DE PONTOS": {
      extracao: { XLSX: { estrategia: "TABELA_DISCIPLINAS", colunaHeader: /^PONTOS/i } },
      normalizacao: { tipo: "NUMERO", formato: "FLOAT" },
      persistencia: { tipoVinculo: "gravação", modelo: "HistoricoEscolar", campo: "totalPontos" },
    },
    "FALTAS TOTAIS": {
      extracao: { XLSX: { estrategia: "TABELA_DISCIPLINAS", colunaHeader: /^T\\.F/i } },
      normalizacao: { tipo: "NUMERO", formato: "INT" },
      persistencia: { tipoVinculo: "nenhum" },
    },
    "CARGA HORÁRIA TOTAL": {
      extracao: { XLSX: { estrategia: "RESUMO_TOTAL", campo: "C.H" } },
      normalizacao: { tipo: "NUMERO", formato: "INT" },
      persistencia: { tipoVinculo: "gravação", modelo: "SerieCursada", campo: "cargaHorariaTotal" },
    },
    "FREQUÊNCIA GLOBAL": {
      extracao: { XLSX: { estrategia: "RESUMO_TOTAL", campo: "%FR" } },
      normalizacao: { tipo: "NUMERO", formato: "FLOAT" },
      persistencia: { tipoVinculo: "gravação", modelo: "SerieCursada", campo: "frequenciaGlobal" },
    },
    "SITUAÇÃO FINAL": {
      extracao: { XLSX: { estrategia: "RESOLVER", resolverNome: "situacaoFinal" } },
      normalizacao: { tipo: "EXTRAIR_POSFIXO", separador: ":" },
      persistencia: { tipoVinculo: "gravação", modelo: "SerieCursada", campo: "situacaoFinal" },
    },
  },
};

export default fichaIndividualHistoricoMap;
