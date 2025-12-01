```typescript
import { Campo } from "../Campo.type";

/**
 * Nomes dos campos disponíveis para mapeamento.
 */
const nomesCampo = [
  "NOME DO ALUNO",
  "DATA DE NASCIMENTO",
  "SEXO",
  "PAI",
  "MÃE",
  "ANO LETIVO",
  "PERÍODO LETIVO",
  "CURSO",
  "SÉRIE",
  "TURMA",
  "COMPONENTE CURRICULAR",
  "CARGA HORÁRIA",
  "CARGA HORÁRIA TOTAL",
  "FREQUÊNCIA",
  "FREQUÊNCIA GLOBAL",
  "TOTAL DE PONTOS",
  "SITUAÇÃO FINAL",
] as const;

type NomesCampo = typeof nomesCampo[number];

export const mapFields: Record<NomesCampo, Campo> = {
  "NOME DO ALUNO": {
    EXTRACAO: {
      tipoExtracao: "Dado XLSX",
      label: "NOME DO ALUNO",
    },
    PERSISTENCIA: {
      vinculoModeloDados: true,
      tipoVinculoModeloDados: 'vinculação',
      modeloDeDados: "Aluno",
      campoNoBancoDeDados: "nome",
    }
  },
  "DATA DE NASCIMENTO": {
    EXTRACAO: {
      tipoExtracao: "Dado XLSX",
      label: "DATA DE NASCIMENTO",
    },
    PERSISTENCIA: {
      vinculoModeloDados: true,
      tipoVinculoModeloDados: 'vinculação',
      modeloDeDados: "Aluno",
      campoNoBancoDeDados: "data_nascimento",
    }
  },
  "SEXO": {
    EXTRACAO: {
      tipoExtracao: "Dado XLSX",
      label: "SEXO",
    },
    PERSISTENCIA: {
      vinculoModeloDados: true,
      tipoVinculoModeloDados: 'validação',
      modeloDeDados: "Aluno",
      campoNoBancoDeDados: "sexo",
    }
  },
  "PAI": {
    EXTRACAO: {
      tipoExtracao: "Dado XLSX",
      label: "PAI",
    },
    PERSISTENCIA: {
      vinculoModeloDados: false
    }
  },
  "MÃE": {
    EXTRACAO: {
      tipoExtracao: "Dado XLSX",
      label: "MÃE",
    },
    PERSISTENCIA: {
      vinculoModeloDados: false,
    }
  },
  "ANO LETIVO": {
    EXTRACAO: {
      tipoExtracao: "Dado XML",
      label: "[A DEFINIR]",
    },
    PERSISTENCIA: {
      vinculoModeloDados: true,
      tipoVinculoModeloDados: 'composição',
    },
  },
  "PERÍODO LETIVO": {
    EXTRACAO: {
      tipoExtracao: "Dado XML",
      label: "[A DEFINIR]",
    },
    PERSISTENCIA: {
      vinculoModeloDados: true,
      tipoVinculoModeloDados: 'composição',
    }
  },
  "CURSO": {
    EXTRACAO: {
      tipoExtracao: "Dado XML",
      label: "[A DEFINIR]",
    },
    PERSISTENCIA: {
      vinculoModeloDados: true,
      tipoVinculoModeloDados: 'composição',
    }
  },
  "SÉRIE": {
    EXTRACAO: {
      tipoExtracao: "Dado XML",
      label: "[A DEFINIR]",
    },
    PERSISTENCIA: {
      vinculoModeloDados: true,
      tipoVinculoModeloDados: 'composição',
    }
  },
  "TURMA": {
    EXTRACAO: {
      tipoExtracao: "Dado XML",
      label: "[A DEFINIR]",
    },
    PERSISTENCIA: {
      vinculoModeloDados: true,
      tipoVinculoModeloDados: 'composição',
    }
  },
  "COMPONENTE CURRICULAR": {
    EXTRACAO: {
      tipoExtracao: "Dado XML",
      label: "[A DEFINIR]",
    },
    PERSISTENCIA: {
      vinculoModeloDados: true,
      tipoVinculoModeloDados: 'gravação',
      modeloDeDados: "HistoricoEscolar",
      campoNoBancoDeDados: "componenteCurricular",
    }
  },
  "CARGA HORÁRIA": {
    EXTRACAO: {
      tipoExtracao: "Dado XML",
      label: "[A DEFINIR]",
    },
    PERSISTENCIA: {
      vinculoModeloDados: true,
      tipoVinculoModeloDados: 'gravação',
      modeloDeDados: "HistoricoEscolar",
      campoNoBancoDeDados: "cargaHoraria",
    }
  },
  "CARGA HORÁRIA TOTAL": {
    EXTRACAO: {
      tipoExtracao: "Dado XML",
      label: "[A DEFINIR]",
    },
    PERSISTENCIA: {
      vinculoModeloDados: true,
      tipoVinculoModeloDados: 'gravação',
      modeloDeDados: "SerieCursada",
      campoNoBancoDeDados: "cargaHorariaTotal",
    }
  },
  "FREQUÊNCIA": {
    EXTRACAO: {
      tipoExtracao: "Dado XML",
      label: "[A DEFINIR]",
    },
    PERSISTENCIA: {
      vinculoModeloDados: true,
      tipoVinculoModeloDados: 'gravação',
      modeloDeDados: "HistoricoEscolar",
      campoNoBancoDeDados: "frequencia",
    }
  },
  "FREQUÊNCIA GLOBAL": {
    EXTRACAO: {
      tipoExtracao: "Dado XML",
      label: "[A DEFINIR]",
    },
    PERSISTENCIA: {
      vinculoModeloDados: true,
      tipoVinculoModeloDados: 'gravação',
      modeloDeDados: "SerieCursada",
      campoNoBancoDeDados: "frequenciaGlobal",
    }
  },
  "TOTAL DE PONTOS": {
    EXTRACAO: {
      tipoExtracao: "Dado XML",
      label: "[A DEFINIR]",
    },
    PERSISTENCIA: {
      vinculoModeloDados: true,
      tipoVinculoModeloDados: 'gravação',
      modeloDeDados: "SerieCursada",
      campoNoBancoDeDados: "totalPontos",
    }
  },
  "SITUAÇÃO FINAL": {
    EXTRACAO: {
      tipoExtracao: "Dado XML",
      label: "[A DEFINIR]",
    },
    PERSISTENCIA: {
      vinculoModeloDados: true,
      tipoVinculoModeloDados: 'gravação',
      modeloDeDados: "SerieCursada",
      campoNoBancoDeDados: "situacaoFinal",
    }
  },
}
export default mapFields;
```