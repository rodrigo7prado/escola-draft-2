import { PhaseSchema } from "./abstract";

const historicoEscolar: PhaseSchema<"FASE:HISTORICO_ESCOLAR"> = {
  SerieCursada: {
    id: [],
    criadoEm: [],
    atualizadoEm: [],
    anoLetivo: [],
    modalidade: [],
    serie: [],
    turno: [],
    alunoMatricula: [],
    periodoLetivo: [],
    unidadeEnsino: [],
    codigoEscola: [],
    segmento: [],
    curso: [],
    situacao: [],
    tipoVaga: [],
    ensinoReligioso: [],
    linguaEstrangeira: [],
    textoBrutoOrigemId: [],
    cargaHorariaTotal: [],
    frequenciaGlobal: [],
    totalPontos: [],
    situacaoFinal: []
  },
  HistoricoEscolar: {
    id: [],
    criadoEm: [],
    atualizadoEm: [],
    totalPontos: [],
    serieCursadaId: [],
    componenteCurricular: [],
    cargaHoraria: [],
    frequencia: [],
    faltasTotais: []
  }
}

export default historicoEscolar;