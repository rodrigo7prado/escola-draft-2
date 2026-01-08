import { PhaseSchema } from "../phases.types";

const historicoEscolar: PhaseSchema<"FASE:HISTORICO_ESCOLAR"> = {
  SerieCursada: {
    id: [],
    criadoEm: [],
    atualizadoEm: [],
    anoLetivo: ["Histórico Escolar"],
    modalidade: [],
    serie: ["Histórico Escolar"],
    turno: [],
    alunoMatricula: [],
    periodoLetivo: ["Histórico Escolar"],
    unidadeEnsino: [],
    codigoEscola: [],
    segmento: ["Histórico Escolar"],
    curso: [],
    situacao: [],
    tipoVaga: [],
    ensinoReligioso: [],
    linguaEstrangeira: [],
    textoBrutoOrigemId: [],
    cargaHorariaTotal: ["Histórico Escolar"],
    frequenciaGlobal: [],
    totalPontos: [],
    situacaoFinal: []
  },
  HistoricoEscolar: {
    id: [],
    criadoEm: [],
    atualizadoEm: [],
    totalPontos: ["Histórico Escolar"],
    serieCursadaId: [],
    componenteCurricular: ["Histórico Escolar"],
    cargaHoraria: ["Histórico Escolar"],
    frequencia: [],
    faltasTotais: []
  }
}

export default historicoEscolar;
