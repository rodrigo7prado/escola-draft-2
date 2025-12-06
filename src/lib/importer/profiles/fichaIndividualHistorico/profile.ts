import type { ImportProfile } from "@/lib/importer/pipelines/csv/types";

export const fichaIndividualHistoricoProfile: ImportProfile = {
  formato: "XLSX",
  tipoArquivo: "fichaIndividualHistorico",
  tipoEntidade: "HistoricoEscolar",
  persistorId: "seriesHistorico",
  chavesDisponiveis: ["nomeDataNascimento", "nome"],
  fields: [
    {
      name: "nome",
      source: { header: "NOME DO ALUNO" },
      roles: ["key", "display"],
      persist: { tipo: "vinculacao", modelo: "Aluno", campo: "nome" },
      normalize: { type: "string", transform: "uppercase" }
    },
    {
      name: "dataNascimento",
      source: { header: "DATA DE NASCIMENTO" },
      roles: ["display"],
      persist: { tipo: "vinculacao", modelo: "Aluno", campo: "dataNascimento" },
      normalize: { type: "date", inputFormat: "DD/MM/YYYY", outputFormat: "YYYY-MM-DD" }
    },
    {
      name: "anoLetivo",
      source: { header: "ANO LETIVO" },
      roles: ["context"],
      persist: { tipo: "composicao" },
      normalize: { type: "number", format: "int" }
    },
    {
      name: "periodoLetivo",
      source: { header: "PERÍODO LETIVO" },
      roles: ["context"],
      persist: { tipo: "composicao" },
      normalize: { type: "number", format: "int" }
    },
    {
      name: "curso",
      source: { header: "CURSO" },
      roles: ["context"],
      persist: { tipo: "composicao" }
    },
    {
      name: "serie",
      source: { header: "SÉRIE" },
      roles: ["context"],
      persist: { tipo: "composicao" }
    },
    {
      name: "turma",
      source: { header: "TURMA" },
      roles: ["context"],
      persist: { tipo: "composicao" }
    },
    {
      name: "turno",
      source: { header: "TURNO" },
      roles: ["context"],
      persist: { tipo: "composicao" }
    },
    {
      name: "escola",
      source: { header: "ESCOLA" },
      roles: ["context"],
      persist: { tipo: "composicao" }
    },
    {
      name: "componenteCurricular",
      source: { header: "COMPONENTE CURRICULAR" },
      roles: ["display"],
      persist: {
        tipo: "gravacao",
        modelo: "HistoricoEscolar",
        campo: "componenteCurricular"
      }
    },
    {
      name: "cargaHoraria",
      source: { header: "CARGA HORÁRIA" },
      roles: ["display"],
      persist: {
        tipo: "gravacao",
        modelo: "HistoricoEscolar",
        campo: "cargaHoraria"
      },
      normalize: { type: "number", format: "int" }
    },
    {
      name: "frequencia",
      source: { header: "FREQUÊNCIA" },
      roles: ["display"],
      persist: {
        tipo: "gravacao",
        modelo: "HistoricoEscolar",
        campo: "frequencia"
      },
      normalize: { type: "number", format: "float" }
    },
    {
      name: "totalPontos",
      source: { header: "TOTAL DE PONTOS" },
      roles: ["display"],
      persist: {
        tipo: "gravacao",
        modelo: "HistoricoEscolar",
        campo: "totalPontos"
      },
      normalize: { type: "number", format: "float" }
    },
    {
      name: "faltasTotais",
      source: { header: "FALTAS TOTAIS" },
      roles: ["display"],
      persist: {
        tipo: "gravacao",
        modelo: "HistoricoEscolar",
        campo: "faltasTotais"
      },
      normalize: { type: "number", format: "int" }
    },
    {
      name: "cargaHorariaTotal",
      source: { header: "CARGA HORÁRIA TOTAL" },
      roles: ["display"],
      persist: {
        tipo: "gravacao",
        modelo: "SerieCursada",
        campo: "cargaHorariaTotal"
      },
      normalize: { type: "number", format: "int" }
    },
    {
      name: "frequenciaGlobal",
      source: { header: "FREQUÊNCIA GLOBAL" },
      roles: ["display"],
      persist: {
        tipo: "gravacao",
        modelo: "SerieCursada",
        campo: "frequenciaGlobal"
      },
      normalize: { type: "number", format: "float" }
    },
    {
      name: "situacaoFinal",
      source: { header: "SITUAÇÃO FINAL" },
      roles: ["display"],
      persist: {
        tipo: "gravacao",
        modelo: "SerieCursada",
        campo: "situacaoFinal"
      }
    },
  ],
};
