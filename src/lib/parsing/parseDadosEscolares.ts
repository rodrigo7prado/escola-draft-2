import {
  normalizarTextoBase,
  normalizarTextoParaComparacao,
  prepararLinhas,
  valorDisponivel,
  capturarMesmaLinha,
  capturarProximaLinha,
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
  matrizCurricular?: string;
  dataInclusaoAluno?: string;
  redeEnsinoOrigem?: string;
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
}

type EstrategiaCaptura = "mesmaLinha" | "mesmaOuProxima" | "proximaLinha";

type SanitizeFn = (valor: string) => string | undefined;

interface CampoDescritor<T> {
  campo: keyof T;
  label: string;
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

const CAMPOS_DESCRITORES_ALUNO: CampoDescritor<AlunoBlocoInfo>[] = [
  {
    campo: "matriculaExtraida",
    label: "MATRICULA",
    estrategia: "mesmaOuProxima",
    ancora: "ALUNO",
  },
  {
    campo: "situacaoEscolar",
    label: "SITUACAO",
    estrategia: "mesmaLinha",
  },
  {
    campo: "causaEncerramentoEscolar",
    label: "CAUSA DO ENCERRAMENTO",
    estrategia: "mesmaLinha",
  },
  {
    campo: "motivoEscolar",
    label: "MOTIVO",
    estrategia: "mesmaOuProxima",
  },
  {
    campo: "recebeOutroEspacoEscolar",
    label: "RECEBE ESCOLARIZACAO EM OUTRO ESPACO",
    aliases: ["RECEBE ESCOLARIZACAO EM OUTRO ESPACO (DIFERENTE DA ESCOLA)"],
    estrategia: "mesmaOuProxima",
  },
];

const CAMPOS_DESCRITORES_INGRESSO: CampoDescritor<Record<string, string | undefined>>[] = [
  {
    campo: "anoIngresso",
    label: "ANO INGRESSO",
    estrategia: "mesmaLinha",
    ancora: "DADOS DE INGRESSO",
    sanitize: sanitizeValorComChaves,
  },
  {
    campo: "periodoIngresso",
    label: "PERIODO INGRESSO",
    estrategia: "mesmaLinha",
    sanitize: sanitizeValorComChaves,
  },
  {
    campo: "dataInclusao",
    label: "DATA DE INCLUSAO DO ALUNO",
    estrategia: "mesmaOuProxima",
  },
  {
    campo: "tipoIngresso",
    label: "TIPO INGRESSO",
    estrategia: "mesmaOuProxima",
    sanitize: sanitizeValorComChaves,
  },
  {
    campo: "redeOrigem",
    label: "REDE DE ENSINO ORIGEM",
    estrategia: "mesmaOuProxima",
    sanitize: sanitizeValorComChaves,
  },
];

const CAMPOS_DESCRITORES_ESCOLARIDADE: CampoDescritor<EscolaridadeInfo>[] = [
  {
    campo: "matrizCurricular",
    label: "MATRIZ CURRICULAR",
    aliases: ["MATRIZ CURRICULAR"],
    estrategia: "mesmaOuProxima",
    ancora: "ESCOLARIDADE",
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

  const trecho = extrairTrechoDadosEscolares(textoNormalizado);
  if (!trecho) {
    throw new Error("Estrutura de dados escolares não encontrada");
  }

  const alunoInfo = extrairBlocoAluno(trecho);
  validarMatricula(alunoInfo, matriculaEsperada);

  const ingresso = extrairBlocoIngresso(trecho);
  const escolaridade = extrairBlocoEscolaridade(trecho);
  const series = extrairSeriesCursadas(trecho, ingresso, escolaridade);

  if (series.length === 0) {
    throw new Error("Nenhuma série encontrada em Renovações de Matrícula");
  }

  const resultadoAluno: DadosEscolaresAlunoInfo = {
    situacao: alunoInfo.situacaoEscolar,
    causaEncerramento: alunoInfo.causaEncerramentoEscolar,
    motivoEncerramento: alunoInfo.motivoEscolar,
    recebeOutroEspaco: alunoInfo.recebeOutroEspacoEscolar,
    anoIngresso: ingresso.anoIngresso,
    periodoIngresso: ingresso.periodoIngresso,
    dataInclusao: ingresso.dataInclusao,
    tipoIngresso: ingresso.tipoIngresso,
    redeOrigem: ingresso.redeOrigem,
    matrizCurricular: escolaridade.matrizCurricular,
  };

  return {
    alunoInfo: resultadoAluno,
    series,
    textoLimpo: trecho.trim(),
  };
}

function encontrarIndiceLabel<T>(
  linhas: LinhaProcessada[],
  descritor: CampoDescritor<T>,
  inicio: number
): number {
  const possiveis = [
    normalizarParaComparacao(descritor.label),
    ...(descritor.aliases?.map(normalizarParaComparacao) ?? []),
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

function normalizarParaComparacao(texto: string): string {
  return normalizarTextoParaComparacao(texto);
}

function sanitizeValorBase(valor?: string): string | undefined {
  if (!valor) return undefined;
  const normalizado = valor.replace(/\s+/g, " ").trim();
  if (!normalizado) return undefined;
  return normalizado;
}

function sanitizeValorComChaves(valor: string): string | undefined {
  const limpo = valor.replace(/[<>*]/g, "").trim();
  return limpo || undefined;
}

function extrairTrechoDadosEscolares(texto: string): string {
  const inicio = texto.search(/^\s*Aluno\b/im);
  if (inicio === -1) {
    return "";
  }

  const restante = texto.slice(inicio);
  const fimMatch = restante.search(/<<\s*Anterior/i);
  if (fimMatch === -1) {
    return restante;
  }

  return restante.slice(0, fimMatch);
}

function extrairBlocoAluno(texto: string): AlunoBlocoInfo {
  const linhas = prepararLinhas(texto);
  return extrairCamposOrdenados(linhas, CAMPOS_DESCRITORES_ALUNO);
}

function validarMatricula(
  info: AlunoBlocoInfo,
  matriculaEsperada?: string
) {
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

function somenteDigitos(valor: string): string {
  return valor.replace(/\D/g, "");
}

function extrairBlocoIngresso(texto: string): IngressoInfo {
  const bloco = extrairTrechoEntre(texto, "Dados de Ingresso", [
    "Renovação de Matrícula",
    "Histórico de Confirmação",
    "<< Anterior",
  ]);
  if (!bloco) {
    throw new Error("Sessão 'Dados de Ingresso' não encontrada");
  }

  const linhas = prepararLinhas(bloco);
  const resultado = extrairCamposOrdenados(linhas, CAMPOS_DESCRITORES_INGRESSO);

  const anoStr = resultado.anoIngresso as string | undefined;
  const periodoStr = resultado.periodoIngresso as string | undefined;

  return {
    anoIngresso: anoStr ? parseInt(anoStr, 10) : undefined,
    periodoIngresso: periodoStr ? parseInt(periodoStr, 10) : undefined,
    dataInclusao: resultado.dataInclusao as string | undefined,
    tipoIngresso: resultado.tipoIngresso as string | undefined,
    redeOrigem: resultado.redeOrigem as string | undefined,
  };
}

function extrairBlocoEscolaridade(texto: string): EscolaridadeInfo {
  const bloco = extrairTrechoEntre(texto, "Escolaridade", ["Dados de Ingresso"]);
  if (!bloco) {
    throw new Error("Sessão 'Escolaridade' não encontrada");
  }

  const linhas = prepararLinhas(bloco);
  return extrairCamposOrdenados(linhas, CAMPOS_DESCRITORES_ESCOLARIDADE);
}

function extrairTrechoEntre(
  texto: string,
  inicioLabel: string,
  finais: string[]
): string | null {
  const inicio = texto.indexOf(inicioLabel);
  if (inicio === -1) return null;

  const depois = texto.slice(inicio + inicioLabel.length);
  let menorFim: number | null = null;
  for (const fimLabel of finais) {
    const idx = depois.indexOf(fimLabel);
    if (idx !== -1 && (menorFim === null || idx < menorFim)) {
      menorFim = idx;
    }
  }

  return menorFim === null ? depois : depois.slice(0, menorFim);
}

function extrairSeriesCursadas(
  texto: string,
  ingresso: IngressoInfo,
  escolaridade: EscolaridadeInfo
): SerieCursadaDTO[] {
  const bloco = extrairBlocoRenovacao(texto);
  if (!bloco) {
    throw new Error("Tabela 'Renovação de Matrícula' não encontrada");
  }

  const linhas = bloco
    .split("\n")
    .map((linha) => linha.trim())
    .filter(Boolean);

  if (!linhas.length) {
    return [];
  }

  const headerIndex = linhas.findIndex((linha) =>
    linha.match(/Ano Letivo/i)
  );
  if (headerIndex === -1) {
    throw new Error("Tabela 'Renovação de Matrícula' não encontrada");
  }

  const dados = linhas.slice(headerIndex + 1);
  const series: SerieCursadaDTO[] = [];

  for (const linha of dados) {
    if (linha.startsWith("Página") || linha.startsWith("Nota")) {
      break;
    }

    const colunas = dividirLinhaTabela(linha);
    if (colunas.length < 9) {
      continue;
    }

    const [anoLetivo, periodoLetivo, unidadeColuna, modalidadeColuna, serie, turno, ensinoRel, linguaEstr, situacao, tipoVaga, ...resto] =
      colunas;

    const tipoVagaCompleto = [tipoVaga, ...resto].filter(Boolean).join(" ");

    const { unidadeEnsino, codigoEscola } = separarCodigoEscola(unidadeColuna);
    const { modalidade, segmento, curso } = separarModalidadeSegmentoCurso(
      modalidadeColuna
    );

    series.push({
      anoLetivo: sanitizeCampoObrigatorio(anoLetivo),
      periodoLetivo: sanitizeCampoObrigatorio(periodoLetivo),
      unidadeEnsino,
      codigoEscola,
      modalidade,
      segmento,
      curso,
      serie: sanitizeCampoOpcional(serie),
      turno: sanitizeCampoOpcional(turno),
      situacao: sanitizeCampoOpcional(situacao),
      tipoVaga: sanitizeCampoOpcional(tipoVagaCompleto),
      matrizCurricular: escolaridade.matrizCurricular,
      dataInclusaoAluno: ingresso.dataInclusao,
      redeEnsinoOrigem: ingresso.redeOrigem,
      ensinoReligioso: parseBooleano(ensinoRel),
      linguaEstrangeira: parseBooleano(linguaEstr),
    });
  }

  if (series.length && ingresso.anoIngresso !== undefined) {
    series[0].anoLetivo = ingresso.anoIngresso.toString();
  }
  if (series.length && ingresso.periodoIngresso !== undefined) {
    series[0].periodoLetivo = ingresso.periodoIngresso.toString();
  }

  return series;
}

function extrairBlocoRenovacao(texto: string): string | null {
  const inicio = texto.indexOf("Renovação de Matrícula");
  if (inicio === -1) {
    return null;
  }

  const depois = texto.slice(inicio);
  const fim = depois.search(/Histórico de Confirmação|Nota:|<<\s*Anterior/i);
  return fim === -1 ? depois : depois.slice(0, fim);
}

function dividirLinhaTabela(linha: string): string[] {
  const normalizado = linha.replace(/\u00a0/g, " ").replace(/\t/g, "  ");
  const delimitador = /\s{2,}/g;
  const partes: string[] = [];
  let inicio = 0;
  let match: RegExpExecArray | null;

  while ((match = delimitador.exec(normalizado)) !== null) {
    const trecho = normalizado.slice(inicio, match.index).trim();
    partes.push(trecho);
    inicio = match.index + match[0].length;
  }

  const final = normalizado.slice(inicio).trim();
  partes.push(final);

  return preencherColunas(partes);
}

function preencherColunas(colunas: string[]): string[] {
  const resultado: string[] = [];
  for (let i = 0; i < 10; i++) {
    resultado.push(colunas[i] ?? "");
  }
  return resultado;
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
  return valor.trim();
}

function sanitizeCampoOpcional(valor?: string): string | undefined {
  const limpo = valor?.trim();
  return limpo ? limpo : undefined;
}
