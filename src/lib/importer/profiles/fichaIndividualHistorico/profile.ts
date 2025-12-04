import type { ImportProfile } from "@/lib/importer/pipelines/csv/types";
import fichaIndividualHistoricoMap from "@/lib/parsers/profiles/fichaIndividualHistorico/mapeamento";

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
      persist: { tipo: "vinculacao", modelo: "Aluno", campo: "nome" }
    },
    {
      name: "dataNascimento",
      source: { header: "DATA DE NASCIMENTO" },
      roles: ["display"],
      persist: { tipo: "vinculacao", modelo: "Aluno", campo: "dataNascimento" }
    },
    {
      name: "anoLetivo",
      source: { header: "ANO LETIVO" },
      roles: ["context"],
      persist: { tipo: "composicao" }
    },
    {
      name: "periodoLetivo",
      source: { header: "PERÍODO LETIVO" },
      roles: ["context"],
      persist: { tipo: "composicao" }
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
      }
    },
    {
      name: "frequencia",
      source: { header: "FREQUÊNCIA" },
      roles: ["display"],
      persist: {
        tipo: "gravacao",
        modelo: "HistoricoEscolar",
        campo: "frequencia"
      }
    },
    {
      name: "totalPontos",
      source: { header: "TOTAL DE PONTOS" },
      roles: ["display"],
      persist: {
        tipo: "gravacao",
        modelo: "HistoricoEscolar",
        campo: "totalPontos"
      }
    },
    {
      name: "faltasTotais",
      source: { header: "FALTAS TOTAIS" },
      roles: ["display"],
      persist: {
        tipo: "gravacao",
        modelo: "HistoricoEscolar",
        campo: "faltasTotais"
      }
    },
    {
      name: "cargaHorariaTotal",
      source: { header: "CARGA HORÁRIA TOTAL" },
      roles: ["display"],
      persist: {
        tipo: "gravacao",
        modelo: "SerieCursada",
        campo: "cargaHorariaTotal"
      }
    },
    {
      name: "frequenciaGlobal",
      source: { header: "FREQUÊNCIA GLOBAL" },
      roles: ["display"],
      persist: {
        tipo: "gravacao",
        modelo: "SerieCursada",
        campo: "frequenciaGlobal"
      }
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
