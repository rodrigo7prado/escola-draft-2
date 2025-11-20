import {
  normalizarTextoBase,
  normalizarTextoParaComparacao,
  prepararLinhas,
  valorDisponivel,
  capturarMesmaLinha,
  capturarProximaLinha,
  extrairTrechoLimpo,
  type LinhaProcessada,
} from "./parsingUtils";

export interface SerieCursadaDTO {
  anoLetivo: string;
  periodoLetivo: string;
  unidadeEnsino?: string;
  codigoEscola?: string;
  modalidade?: string;
  segmento?: string;
  curso?: string;
  serie?: string;
  turno?: string;
  situacao?: string;
  tipoVaga?: string;
  ensinoReligioso?: boolean | null;
  linguaEstrangeira?: boolean | null;
  textoBrutoOrigemId?: string;
}

export interface DadosEscolaresAlunoInfo {
  situacao?: string;
  causaEncerramento?: string;
  motivoEncerramento?: string;
  recebeOutroEspaco?: string;
  anoIngresso?: number;
  periodoIngresso?: number;
  dataInclusao?: string;
  tipoIngresso?: string;
  redeOrigem?: string;
  matrizCurricular?: string;
}

export interface DadosEscolaresParseResult {
  alunoInfo: DadosEscolaresAlunoInfo;
  series: SerieCursadaDTO[];
  textoLimpo: string;
  avisos: string[];
}

type EstrategiaCaptura = "mesmaLinha" | "mesmaOuProxima" | "proximaLinha";

type SanitizeFn = (valor: string) => string | undefined;

type NomeBloco = keyof typeof CATALOGO_ELEMENTOS_COLAGEM.blocos;

type LabelReferencia = string | readonly string[];

interface CampoDescritor<T> {
  campo: keyof T;
  label: LabelReferencia;
  estrategia: EstrategiaCaptura;
  sanitize?: SanitizeFn;
  ancora?: string;
  aliases?: string[];
}

interface AlunoBlocoInfo {
  matriculaExtraida?: string;
  situacaoEscolar?: string;
  causaEncerramentoEscolar?: string;
  motivoEscolar?: string;
  recebeOutroEspacoEscolar?: string;
}

interface IngressoInfo {
  anoIngresso?: number;
  periodoIngresso?: number;
  dataInclusao?: string;
  tipoIngresso?: string;
  redeOrigem?: string;
}

interface EscolaridadeInfo {
  matrizCurricular?: string;
}

const DEBUG_PARSE_ESCOLARES =
  process.env.DEBUG_PARSE_ESCOLARES?.toLowerCase() === "true";

function logDebug(...args: unknown[]) {
  if (DEBUG_PARSE_ESCOLARES) {
    console.debug("[parseDadosEscolares]", ...args);
  }
}

const CATALOGO_ELEMENTOS_COLAGEM = {
  blocos: {
    aluno: {
      inicio: /Aluno[\s\n]*Inscri[cç][aã]o Matr[ií]cula F[áa]cil\s*:\s*/i,
      fim: /Dados de Ingresso/i,
    },
    dadosIngresso: {
      inicio: /Dados de Ingresso/i,
      fim: /Escolaridade/i,
    },
    escolaridade: {
      inicio: /Escolaridade/i,
      fim: /Confirma[cç][aã]o\/?Renova[cç][aã]o de Matr[ií]cula/i,
    },
    renovacao: {
      inicio: /Renova[cç][aã]o de Matr[ií]cula/i,
      fim: /Hist[oó]rico de Confirma[cç][aã]o de Matr[ií]cula/i,
    },
  },
  labels: {
    matricula: ["Matrícula", "Matrícula:*"],
    situacao: ["Situação"],
    causaEncerramento: ["Causa do Encerramento"],
    motivo: ["Motivo"],
    recebeOutroEspaco: [
      "Recebe Escolarização em Outro Espaço (diferente da escola)?",
    ],
    anoIngresso: ["Ano Ingresso"],
    periodoIngresso: ["Período Ingresso"],
    dataInclusao: ["Data de Inclusão do Aluno"],
    tipoIngresso: ["Tipo Ingresso"],
    redeOrigem: ["Rede de Ensino Origem"],
    matrizCurricular: ["Matriz Curricular"],
  },
  ruidos: {
    palavrasChave: [
      "GESTAO ESCOLAR",
      "ALUNOS",
      "GESTAO DO ENSINO",
      "GESTAO DA REDE",
      "RELATORIO",
      "CONFIGURACOES",
      "TRANSPORTE ESCOLAR",
      "PROGRAMAS SOCIAS/ESPECIAIS",
      "ATENDIMENTO EDUCACIONAL ESPECIALIZADO",
      "AEDH - ESCOLARIZACAO EM OUTROS ESPACOS",
      "DADOS PESSOAIS",
      "DADOS ESCOLARES",
      "TRANSPORTE ESCOLAR",
      "DOCUMENTOS ENTREGUES",
      "PROGRAMAS SOCIAS/ESPECIAIS",
      "ATENDIMENTO EDUCACIONAL ESPECIALIZADO",
      "IRMÃOS",
      "EDITARNOVOALUNOS",
      "INFORME A MATRICULA OU O NOME DO ALUNO",
      "ENVIAR",
      "CONTROLE DE ACESSO",
      "CONFIGURACOES GERAIS",
      "NOTA:",
    ],
    navegacao: ["<< ANTERIOR", "PRÓXIMO >>", "PRÓXIMO", "ANTERIOR", "[1]"],
    regex: [/^Página \d+/i, /^\[\d+\]$/, /^Próximo$/i],
  },
} as const;

const VALORES_CONHECIDOS_TABELA = {
  turnos: ["M", "T", "N", "I", "A"],
  situacoes: ["POSSUI CONFIRMACAO"],
  tiposVaga: ["VAGA DE CONTINUIDADE"],
};

const CAMPOS_DESCRITORES_ALUNO: CampoDescritor<AlunoBlocoInfo>[] = [
  {
    campo: "matriculaExtraida",
    label: CATALOGO_ELEMENTOS_COLAGEM.labels.matricula,
    estrategia: "mesmaOuProxima",
  },
  {
    campo: "situacaoEscolar",
    label: CATALOGO_ELEMENTOS_COLAGEM.labels.situacao,
    estrategia: "mesmaOuProxima",
  },
  {
    campo: "causaEncerramentoEscolar",
    label: CATALOGO_ELEMENTOS_COLAGEM.labels.causaEncerramento,
    estrategia: "mesmaLinha",
  },
  {
    campo: "motivoEscolar",
    label: CATALOGO_ELEMENTOS_COLAGEM.labels.motivo,
    estrategia: "mesmaOuProxima",
  },
  {
    campo: "recebeOutroEspacoEscolar",
    label: CATALOGO_ELEMENTOS_COLAGEM.labels.recebeOutroEspaco,
    estrategia: "mesmaOuProxima",
  },
];

const CAMPOS_DESCRITORES_INGRESSO: CampoDescritor<Record<string, string | undefined>>[] = [
  {
    campo: "anoIngresso",
    label: CATALOGO_ELEMENTOS_COLAGEM.labels.anoIngresso,
    estrategia: "mesmaOuProxima",
    sanitize: sanitizeValorComChaves,
  },
  {
    campo: "periodoIngresso",
    label: CATALOGO_ELEMENTOS_COLAGEM.labels.periodoIngresso,
    estrategia: "mesmaOuProxima",
    sanitize: sanitizeValorComChaves,
  },
  {
    campo: "dataInclusao",
    label: CATALOGO_ELEMENTOS_COLAGEM.labels.dataInclusao,
    estrategia: "mesmaOuProxima",
  },
  {
    campo: "tipoIngresso",
    label: CATALOGO_ELEMENTOS_COLAGEM.labels.tipoIngresso,
    estrategia: "mesmaOuProxima",
    sanitize: sanitizeValorComChaves,
  },
  {
    campo: "redeOrigem",
    label: CATALOGO_ELEMENTOS_COLAGEM.labels.redeOrigem,
    estrategia: "mesmaOuProxima",
    sanitize: sanitizeValorComChaves,
  },
];

const CAMPOS_DESCRITORES_ESCOLARIDADE: CampoDescritor<EscolaridadeInfo>[] = [
  {
    campo: "matrizCurricular",
    label: CATALOGO_ELEMENTOS_COLAGEM.labels.matrizCurricular,
    estrategia: "mesmaOuProxima",
    sanitize: sanitizeValorComChaves,
  },
];

export function parseDadosEscolares(
  texto: string,
  matriculaEsperada?: string
): DadosEscolaresParseResult {
  const textoNormalizado = normalizarTextoBase(texto);
  if (!textoNormalizado) {
    throw new Error("Texto de dados escolares vazio");
  }

  const trechoPrincipal = extrairConteudoPrincipal(textoNormalizado);
  if (!trechoPrincipal) {
    throw new Error("Estrutura de dados escolares não encontrada");
  }

  const blocoAluno = extrairBlocoPorNome(trechoPrincipal, "aluno");
  const infoAluno = extrairBlocoAluno(blocoAluno);
  validarMatricula(infoAluno, matriculaEsperada);

  const blocoIngresso = extrairBlocoPorNome(trechoPrincipal, "dadosIngresso");
  const infoIngresso = extrairBlocoIngresso(blocoIngresso);

  const blocoRenovacao = extrairBlocoPorNome(trechoPrincipal, "renovacao");
  const avisos: string[] = [];
  const series = extrairSeriesRenovacao(blocoRenovacao, infoIngresso, avisos);

  const alunoInfo: DadosEscolaresAlunoInfo = {
    situacao: infoAluno.situacaoEscolar,
    causaEncerramento: infoAluno.causaEncerramentoEscolar,
    motivoEncerramento: infoAluno.motivoEscolar,
    recebeOutroEspaco: infoAluno.recebeOutroEspacoEscolar,
    anoIngresso: infoIngresso.anoIngresso,
    periodoIngresso: infoIngresso.periodoIngresso,
    dataInclusao: infoIngresso.dataInclusao,
    tipoIngresso: infoIngresso.tipoIngresso,
    redeOrigem: infoIngresso.redeOrigem,
    matrizCurricular: extrairBlocoEscolaridade(
      extrairBlocoPorNome(trechoPrincipal, "escolaridade")
    ).matrizCurricular,
  };

  return {
    alunoInfo,
    series,
    textoLimpo: trechoPrincipal.trim(),
    avisos,
  };
}

function extrairConteudoPrincipal(texto: string): string {
  const bloco = extrairTrechoLimpo(
    texto,
    CATALOGO_ELEMENTOS_COLAGEM.blocos.aluno.inicio,
    [
      CATALOGO_ELEMENTOS_COLAGEM.blocos.renovacao.fim,
      /<<\s*Anterior/i,
      /©\s*Todos os direitos/i,
    ],
    false
  );

  if (!bloco) {
    logDebug("Nenhum trecho principal encontrado a partir do bloco de aluno.");
    return "";
  }

  logDebug(
    "Trecho bruto extraído (início):",
    bloco
      .split("\n")
      .slice(0, 20)
      .join("\n")
  );

  return bloco;
}

function removerLinhasRuidoEspecifico(texto: string): string {
  return texto;
}

function extrairBlocoPorNome(texto: string, nome: NomeBloco): string {
  const bloco = CATALOGO_ELEMENTOS_COLAGEM.blocos[nome];
  const inicioMatch = texto.match(bloco.inicio);
  if (!inicioMatch || inicioMatch.index === undefined) {
    throw new Error(`Bloco "${nome}" não encontrado no texto`);
  }

  const inicio = inicioMatch.index;
  const textoAPartirDoInicio = texto.slice(inicio);
  const fimMatch = textoAPartirDoInicio.match(bloco.fim);
  const fimIndex = fimMatch && fimMatch.index !== undefined
    ? fimMatch.index
    : textoAPartirDoInicio.length;

  return textoAPartirDoInicio.slice(0, fimIndex);
}

function extrairBlocoAluno(texto: string): AlunoBlocoInfo {
  const linhas = prepararLinhas(texto);
  return extrairCamposOrdenados(linhas, CAMPOS_DESCRITORES_ALUNO);
}

function validarMatricula(info: AlunoBlocoInfo, matriculaEsperada?: string) {
  if (!matriculaEsperada) {
    return;
  }

  const extraida = somenteDigitos(info.matriculaExtraida ?? "");
  const esperada = somenteDigitos(matriculaEsperada);

  if (!extraida) {
    throw new Error("Matrícula não foi localizada no texto escolar");
  }

  if (extraida !== esperada) {
    throw new Error("Matrícula do texto não corresponde ao aluno ativo");
  }
}

function extrairBlocoIngresso(texto: string): IngressoInfo {
  const linhas = prepararLinhas(texto);
  const campos = extrairCamposOrdenados(linhas, CAMPOS_DESCRITORES_INGRESSO);

  const ano = campos.anoIngresso ? parseInt(campos.anoIngresso as string, 10) : undefined;
  const periodo = campos.periodoIngresso
    ? parseInt(campos.periodoIngresso as string, 10)
    : undefined;

  return {
    anoIngresso: Number.isNaN(ano) ? undefined : ano,
    periodoIngresso: Number.isNaN(periodo) ? undefined : periodo,
    dataInclusao: campos.dataInclusao as string | undefined,
    tipoIngresso: campos.tipoIngresso as string | undefined,
    redeOrigem: campos.redeOrigem as string | undefined,
  };
}

function extrairBlocoEscolaridade(texto: string): EscolaridadeInfo {
  const linhas = prepararLinhas(texto);
  return extrairCamposOrdenados(linhas, CAMPOS_DESCRITORES_ESCOLARIDADE);
}

function extrairSeriesRenovacao(
  texto: string,
  ingresso: IngressoInfo,
  avisos: string[]
): SerieCursadaDTO[] {
  const linhas = texto
    .split("\n")
    .map((linha) => linha.trim())
    .filter((linha) => Boolean(linha));

  const series: SerieCursadaDTO[] = [];

  for (const linha of linhas) {
    if (/^Página \d+/i.test(linha) || /^Nota:/i.test(linha)) {
      break;
    }

    if (!/^\d{4}/.test(linha)) {
      continue;
    }

    const colunas = dividirLinhaTabela(linha);
    if (colunas.length < 10) {
      throw new Error("Linha da tabela 'Renovação de Matrícula' está incompleta");
    }

    const [
      anoLetivo,
      periodoLetivo,
      unidadeColuna,
      modalidadeColuna,
      serieColuna,
      turno,
      ensinoReligiosoColuna,
      linguaEstrangeiraColuna,
      situacaoColuna,
      tipoVagaColuna,
    ] = colunas;

    const serie = validarSerie(serieColuna);
    const turnoNormalizado = validarTurno(turno);

    const situacao = registrarAvisoSeNecessario(
      "Situação",
      situacaoColuna,
      VALORES_CONHECIDOS_TABELA.situacoes,
      avisos
    );

    const tipoVaga = registrarAvisoSeNecessario(
      "Tipo de Vaga",
      tipoVagaColuna,
      VALORES_CONHECIDOS_TABELA.tiposVaga,
      avisos
    );

    const { unidadeEnsino, codigoEscola } = separarCodigoEscola(unidadeColuna);
    const { modalidade, segmento, curso } = separarModalidadeSegmentoCurso(
      modalidadeColuna
    );

    const anoLetivoFinal =
      valorDisponivel(anoLetivo) || valorDisponivel(String(ingresso.anoIngresso))
        ? sanitizeCampoObrigatorio(anoLetivo || String(ingresso.anoIngresso))
        : sanitizeCampoObrigatorio(anoLetivo);

    const periodoLetivoFinal =
      valorDisponivel(periodoLetivo) ||
      (ingresso.periodoIngresso !== undefined && ingresso.periodoIngresso !== null)
        ? sanitizeCampoObrigatorio(periodoLetivo || String(ingresso.periodoIngresso))
        : sanitizeCampoObrigatorio(periodoLetivo);

    series.push({
      anoLetivo: anoLetivoFinal,
      periodoLetivo: periodoLetivoFinal,
      unidadeEnsino,
      codigoEscola,
      modalidade,
      segmento,
      curso,
      serie,
      turno: turnoNormalizado,
      situacao,
      tipoVaga,
      ensinoReligioso: parseBooleano(ensinoReligiosoColuna),
      linguaEstrangeira: parseBooleano(linguaEstrangeiraColuna),
    });
  }

  if (ingresso.anoIngresso !== undefined) {
    const ano = sanitizeCampoObrigatorio(String(ingresso.anoIngresso));
    const periodo =
      ingresso.periodoIngresso !== undefined && ingresso.periodoIngresso !== null
        ? sanitizeCampoObrigatorio(String(ingresso.periodoIngresso))
        : "";

    series.unshift({
      anoLetivo: ano,
      periodoLetivo: periodo,
      unidadeEnsino: undefined,
      codigoEscola: undefined,
      modalidade: undefined,
      segmento: undefined,
      curso: undefined,
      serie: undefined,
      turno: undefined,
      situacao: undefined,
      tipoVaga: undefined,
      ensinoReligioso: undefined,
      linguaEstrangeira: undefined,
    });
  }

  return series.sort((a, b) => {
    const anoA = parseInt(a.anoLetivo, 10);
    const anoB = parseInt(b.anoLetivo, 10);
    if (!Number.isNaN(anoA) && !Number.isNaN(anoB) && anoA !== anoB) {
      return anoA - anoB;
    }

    const periodoA = a.periodoLetivo ? parseInt(a.periodoLetivo, 10) : Number.POSITIVE_INFINITY;
    const periodoB = b.periodoLetivo ? parseInt(b.periodoLetivo, 10) : Number.POSITIVE_INFINITY;
    if (!Number.isNaN(periodoA) && !Number.isNaN(periodoB)) {
      return periodoA - periodoB;
    }

    return 0;
  });
}

function dividirLinhaTabela(linha: string): string[] {
  if (linha.includes("\t")) {
    const partes = linha.split("\t").map((parte) => parte.trim());
    return ajustarColunasTabela(partes);
  }

  const partes = linha
    .split(/\s{2,}/)
    .map((parte) => parte.trim());

  return ajustarColunasTabela(partes);
}

function ajustarColunasTabela(partes: string[]): string[] {
  const limpas = partes.map((parte) => parte.replace(/\s+/g, " ").trim());

  if (limpas.length >= 10) {
    const primeiras = limpas.slice(0, 9);
    const restante = limpas.slice(9).filter(Boolean).join(" ");
    return [...primeiras, restante];
  }

  if (limpas.length === 8) {
    return [
      limpas[0],
      limpas[1],
      limpas[2],
      limpas[3],
      limpas[4],
      limpas[5],
      "",
      "",
      limpas[6],
      limpas[7],
    ];
  }

  if (limpas.length === 9) {
    return [
      limpas[0],
      limpas[1],
      limpas[2],
      limpas[3],
      limpas[4],
      limpas[5],
      limpas[6],
      "",
      limpas[7],
      limpas[8],
    ];
  }

  throw new Error(
    "Não foi possível identificar todas as colunas da tabela 'Renovação de Matrícula'"
  );
}

function validarSerie(valor: string): string {
  const limpo = sanitizeCampoObrigatorio(valor);
  if (!/^\d+$/.test(limpo)) {
    throw new Error(`Valor de Série/Ano Escolar inválido: "${valor}"`);
  }
  return limpo;
}

function validarTurno(valor: string): string {
  const limpo = sanitizeCampoObrigatorio(valor).toUpperCase();
  if (!VALORES_CONHECIDOS_TABELA.turnos.includes(limpo)) {
    throw new Error(`Turno desconhecido encontrado na tabela: "${valor}"`);
  }
  return limpo;
}

function registrarAvisoSeNecessario(
  campo: string,
  valor: string,
  conhecidos: string[],
  avisos: string[]
): string | undefined {
  const limpo = sanitizeCampoOpcional(valor);
  if (!limpo) {
    return undefined;
  }

  const normalizado = normalizarParaComparacao(limpo);
  if (!conhecidos.includes(normalizado)) {
    avisos.push(
      `${campo} desconhecido encontrado: "${limpo}". Atualize a lista de valores conhecidos.`
    );
  }
  return limpo;
}

function extrairCamposOrdenados<T>(
  linhas: LinhaProcessada[],
  descritores: CampoDescritor<T>[]
): Partial<T> {
  const resultado: Partial<T> = {};
  let cursor = 0;

  for (const descritor of descritores) {
    const indiceLabel = encontrarIndiceLabel(linhas, descritor, cursor);
    if (indiceLabel === -1) {
      continue;
    }

    const { valor, nextIndex } = capturarValor(linhas, indiceLabel, descritor);

    if (valor !== undefined) {
      (resultado as Record<keyof T, string | undefined>)[descritor.campo] = valor;
    }

    cursor = Math.max(cursor, nextIndex);
  }

  return resultado;
}

function encontrarIndiceLabel<T>(
  linhas: LinhaProcessada[],
  descritor: CampoDescritor<T>,
  inicio: number
): number {
  const labels = Array.isArray(descritor.label)
    ? descritor.label
    : [descritor.label];

  const possiveis = [
    ...labels.map((label) => normalizarParaComparacao(label)),
    ...(descritor.aliases?.map((alias) => normalizarParaComparacao(alias)) ?? []),
  ];

  let inicioBusca = inicio;

  if (descritor.ancora) {
    const ancoraNormalizada = normalizarParaComparacao(descritor.ancora);
    for (let i = inicio; i < linhas.length; i++) {
      if (linhas[i].normalizedLabel === ancoraNormalizada) {
        inicioBusca = i;
        break;
      }
    }
  }

  for (let i = inicioBusca; i < linhas.length; i++) {
    if (!linhas[i].raw.includes(":")) {
      continue;
    }

    const labelNormalizada = linhas[i].normalizedLabel;
    const corresponde = possiveis.some(
      (alvo) =>
        labelNormalizada === alvo || labelNormalizada.endsWith(` ${alvo}`)
    );

    if (corresponde) {
      return i;
    }
  }

  return -1;
}

function capturarValor<T>(
  linhas: LinhaProcessada[],
  indiceLabel: number,
  descritor: CampoDescritor<T>
): { valor?: string; nextIndex: number } {
  let bruto: string | undefined;
  let nextIndex = indiceLabel + 1;

  switch (descritor.estrategia) {
    case "mesmaLinha":
      bruto = capturarMesmaLinha(linhas[indiceLabel]);
      break;
    case "proximaLinha":
      ({ valor: bruto, nextIndex } = capturarProximaLinha(linhas, indiceLabel));
      break;
    case "mesmaOuProxima":
      bruto = capturarMesmaLinha(linhas[indiceLabel]);
      if (!valorDisponivel(bruto)) {
        const resultadoProxima = capturarProximaLinha(linhas, indiceLabel);
        bruto = resultadoProxima.valor;
        nextIndex = resultadoProxima.nextIndex;
      }
      break;
  }

  if (!valorDisponivel(bruto)) {
    return { valor: undefined, nextIndex };
  }

  const valorSanitizado = descritor.sanitize
    ? descritor.sanitize(bruto!)
    : sanitizeValorBase(bruto);

  return { valor: valorSanitizado, nextIndex };
}

function normalizarParaComparacao(texto: string): string {
  return normalizarTextoParaComparacao(texto);
}

function sanitizeValorBase(valor?: string): string | undefined {
  if (!valor) return undefined;
  const normalizado = valor.replace(/\s+/g, " ").trim();
  return normalizado || undefined;
}

function sanitizeValorComChaves(valor: string): string | undefined {
  const limpo = valor.replace(/[<>*]/g, "").trim();
  return limpo || undefined;
}

function somenteDigitos(valor: string): string {
  return valor.replace(/\D/g, "");
}

function separarCodigoEscola(valor?: string): {
  unidadeEnsino?: string;
  codigoEscola?: string;
} {
  if (!valor) return {};
  const partes = valor.split("-").map((parte) => parte.trim());
  if (partes.length === 1) {
    return { unidadeEnsino: partes[0] };
  }
  const codigo = partes.shift();
  return {
    codigoEscola: codigo,
    unidadeEnsino: partes.join(" - ") || undefined,
  };
}

function separarModalidadeSegmentoCurso(valor?: string): {
  modalidade?: string;
  segmento?: string;
  curso?: string;
} {
  if (!valor) return {};
  const partes = valor
    .split("/")
    .map((parte) => parte.trim())
    .filter(Boolean);
  const [modalidade, segmento, ...resto] = partes;
  return {
    modalidade,
    segmento,
    curso: resto.length ? resto.join(" / ") : undefined,
  };
}

function parseBooleano(valor?: string): boolean | null {
  if (!valor) return null;
  const normalizado = valor
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toUpperCase();

  if (normalizado === "SIM" || normalizado === "S") return true;
  if (normalizado === "NAO" || normalizado === "N") return false;
  return null;
}

function sanitizeCampoObrigatorio(valor?: string): string {
  if (!valor) {
    throw new Error("Campo obrigatório da tabela está vazio");
  }
  const limpo = valor.trim();
  if (!limpo) {
    throw new Error("Campo obrigatório da tabela está vazio");
  }
  return limpo;
}

function sanitizeCampoOpcional(valor?: string): string | undefined {
  const limpo = valor?.trim();
  return limpo ? limpo : undefined;
}
