/**
 * Propriedades comuns a todos os campos.
 */
type CampoPropsBase = {
  /**
   * Motivo de existir e de diferenciação entre valores:
   * - "Dado XLSX": Indica que o campo é extraído de um arquivo XLSX (Excel).
   * - "Dado XML": Indica que o campo é extraído de um arquivo XML.
   */
  tipoExtração: "Dado XLSX" | "Dado XML";
  /**
   * Rótulo do campo na interface do usuário:
   * - Se Dado XLSX: Deve corresponder exatamente ao nome do campo no arquivo XLSX.
   * - Se Dado XML: Pode ser um rótulo do XML.
   */
  labelUI: string;
  /**
   * Indica se há vínculo com o modelo de dados.
   */
  vinculoModeloDados: boolean;
  /**
   * Metadados para o Agente de IA.
   */
  iaMeta: {
    /**
     * Descrição do campo para o Agente de IA. A situação ideia é sempre não precisar dessa descrição,
     * mas em alguns casos específicos de implementação incompleta pode ser útil fornecer mais contexto.
     */
    descricaoCampo: string | undefined;
  }
}

/**
 * Campos vinculados ao modelo de dados.
 */
type CampoVinculadoBase = CampoPropsBase & {
  vinculoModeloDados: true;
  tipoVinculoModeloDados: TipoVinculoModeloDados; // Tipo de vínculo com o modelo de dados
}

/**
 * Campos vinculados do tipo 'composição' NÃO possuem vínculo direto com campos no banco de dados.
 */
type CampoVinculadoComposicao = CampoVinculadoBase & {
  tipoVinculoModeloDados: 'composição';
}

/**
 * Campos vinculados que NÃO são do tipo 'composição' POSSUEM vínculo direto com campos no banco de dados.
 */
type CampoVinculadoNaoComposicao = CampoVinculadoBase & {
  tipoVinculoModeloDados: Exclude<TipoVinculoModeloDados, 'composição'>; // 'gravação' | 'vinculação' | 'validação'
  campoNoBancoDeDados: string; // Nome do campo no modelo de dados
  modeloDeDados: ModeloDeDados;  // Nome da tabela ou entidade no modelo de dados do Prisma,
}

/**
 * Campos vinculados ao modelo de dados, podendo ser do tipo 'composição' ou não.
 */
type CampoVinculado = CampoVinculadoComposicao | CampoVinculadoNaoComposicao;

/**
 * Campos NÃO vinculados ao modelo de dados.
 */
type CampoNaoVinculado = CampoPropsBase & {
  vinculoModeloDados: false;
}

/**
 * União de todos os tipos de campos.
 */
type Campo = CampoVinculado | CampoNaoVinculado;

/**
 * Modelos de dados do Prisma disponíveis para mapeamento.
 */
type ModeloDeDados =
  | "Aluno" // Modelo de dados para informações do aluno.
  | "Enturmacao" // Modelo de dados para informações de enturmação.
  | "SerieCursada" // Modelo de dados para informações de série cursada.
  | "HistoricoEscolar" // Modelo de dados para informações do histórico escolar.

/**
 * Tipos de vínculo com o modelo de dados. 
 * */
type TipoVinculoModeloDados =
  | 'gravação' // Campo usado para gravar dados no modelo.
  | 'vinculação' // Campo usado para vincular registros existentes.
  | 'validação' // Campo usado para validar dados existentes.
  | 'composição'; // Campo usado para compor informações, sem vínculo direto.

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

/**
 * Tipo que representa os nomes dos campos.
 */
type NomesCampo = typeof nomesCampo[number];

/**
 * DESCRIÇÃO:
 *  - Mapeamento dos campos para importação de Ficha Individual - Histórico.
 *  - Cada campo é definido com suas propriedades, incluindo tipo de extração,
 *    vínculo com o modelo de dados, e detalhes específicos conforme necessário.
 *  - Este mapeamento é utilizado pelo Agente de IA para processar e validar os dados importados.
 * CONSTANTES:
 *  @nomesCampo - Lista dos nomes dos campos disponíveis para mapeamento.
 */
export const mapFields: Record<NomesCampo, Campo> = {
  "NOME DO ALUNO": {
    tipoExtração: "Dado XLSX",
    labelUI: "NOME DO ALUNO",
    vinculoModeloDados: true,
    tipoVinculoModeloDados: 'vinculação',
    modeloDeDados: "Aluno",
    campoNoBancoDeDados: "nome",
    iaMeta: {
      descricaoCampo: "Nome do aluno poderá ser usado para vinculação do registro no modelo Aluno."
    }
  },
  "DATA DE NASCIMENTO": {
    tipoExtração: "Dado XLSX",
    labelUI: "DATA DE NASCIMENTO",
    vinculoModeloDados: true,
    tipoVinculoModeloDados: 'vinculação',
    modeloDeDados: "Aluno",
    campoNoBancoDeDados: "data_nascimento",
    iaMeta: {
      descricaoCampo: undefined,
    }
  },
  "SEXO": {
    tipoExtração: "Dado XLSX",
    labelUI: "SEXO",
    vinculoModeloDados: true,
    tipoVinculoModeloDados: 'validação',
    modeloDeDados: "Aluno",
    campoNoBancoDeDados: "sexo",
    iaMeta: {
      descricaoCampo: "Sexo do aluno poderá ser usado para validação do campo Sexo no modelo Aluno."
    }
  },
  "PAI": {
    tipoExtração: "Dado XLSX",
    labelUI: "PAI",
    vinculoModeloDados: false,
    iaMeta: {
      descricaoCampo: undefined,
    }
  },
  "MÃE": {
    tipoExtração: "Dado XLSX",
    labelUI: "MÃE",
    vinculoModeloDados: false,
    iaMeta: {
      descricaoCampo: undefined,
    }
  },
  "ANO LETIVO": {
    tipoExtração: "Dado XML",
    labelUI: "[A DEFINIR]",
    vinculoModeloDados: true,
    tipoVinculoModeloDados: 'composição',
    iaMeta: {
      descricaoCampo: undefined,
    }
  },
  "PERÍODO LETIVO": {
    tipoExtração: "Dado XML",
    labelUI: "[A DEFINIR]",
    vinculoModeloDados: true,
    tipoVinculoModeloDados: 'composição',
    iaMeta: {
      descricaoCampo: undefined,
    }
  },
  "CURSO": {
    tipoExtração: "Dado XML",
    labelUI: "[A DEFINIR]",
    vinculoModeloDados: true,
    tipoVinculoModeloDados: 'composição',
    iaMeta: {
      descricaoCampo: undefined,
    }
  },
  "SÉRIE": {
    tipoExtração: "Dado XML",
    labelUI: "[A DEFINIR]",
    vinculoModeloDados: true,
    tipoVinculoModeloDados: 'composição',
    iaMeta: {
      descricaoCampo: undefined,
    }
  },
  "TURMA": {
    tipoExtração: "Dado XML",
    labelUI: "[A DEFINIR]",
    vinculoModeloDados: true,
    tipoVinculoModeloDados: 'composição',
    iaMeta: {
      descricaoCampo: undefined,
    }
  },
  "COMPONENTE CURRICULAR": {
    tipoExtração: "Dado XML",
    labelUI: "[A DEFINIR]",
    vinculoModeloDados: true,
    tipoVinculoModeloDados: 'gravação',
    modeloDeDados: "HistoricoEscolar",
    campoNoBancoDeDados: "componenteCurricular",
    iaMeta: {
      descricaoCampo: undefined,
    }
  },
  "CARGA HORÁRIA": {
    tipoExtração: "Dado XML",
    labelUI: "[A DEFINIR]",
    vinculoModeloDados: true,
    tipoVinculoModeloDados: 'gravação',
    modeloDeDados: "HistoricoEscolar",
    campoNoBancoDeDados: "cargaHoraria",
    iaMeta: {
      descricaoCampo: undefined,
    }
  },
  "CARGA HORÁRIA TOTAL": {
    tipoExtração: "Dado XML",
    labelUI: "[A DEFINIR]",
    vinculoModeloDados: true,
    tipoVinculoModeloDados: 'gravação',
    modeloDeDados: "SerieCursada",
    campoNoBancoDeDados: "cargaHorariaTotal",
    iaMeta: {
      descricaoCampo: undefined,
    }
  },
  "FREQUÊNCIA": {
    tipoExtração: "Dado XML",
    labelUI: "[A DEFINIR]",
    vinculoModeloDados: true,
    tipoVinculoModeloDados: 'gravação',
    modeloDeDados: "HistoricoEscolar",
    campoNoBancoDeDados: "frequencia",
    iaMeta: {
      descricaoCampo: undefined,
    }
  },
  "FREQUÊNCIA GLOBAL": {
    tipoExtração: "Dado XML",
    labelUI: "[A DEFINIR]",
    vinculoModeloDados: true,
    tipoVinculoModeloDados: 'gravação',
    modeloDeDados: "SerieCursada",
    campoNoBancoDeDados: "frequenciaGlobal",
    iaMeta: {
      descricaoCampo: undefined,
    }
  },
  "TOTAL DE PONTOS": {
    tipoExtração: "Dado XML",
    labelUI: "[A DEFINIR]",
    vinculoModeloDados: true,
    tipoVinculoModeloDados: 'gravação',
    modeloDeDados: "SerieCursada",
    campoNoBancoDeDados: "totalPontos",
    iaMeta: {
      descricaoCampo: undefined,
    }
  },
  "SITUAÇÃO FINAL": {
    tipoExtração: "Dado XML",
    labelUI: "[A DEFINIR]",
    vinculoModeloDados: true,
    tipoVinculoModeloDados: 'gravação',
    modeloDeDados: "SerieCursada",
    campoNoBancoDeDados: "situacaoFinal",
    iaMeta: {
      descricaoCampo: "O label pode ser confuso, como uma string longa do tipo 'À VISTA DOS RESULTADOS OBTIDOS O(A) ALUNO(A) FOI CONSIDERADO(A):'. O que importa é o valor final da situação."
    }
  },
}