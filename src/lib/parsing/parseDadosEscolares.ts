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

function normalizarTextoBase(texto: string): string {
  return texto
    .replace(/\uFEFF/g, "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .trim();
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
  const linhas = texto.split("\n").map((linha) => linha.trim());
  const info: AlunoBlocoInfo = {};

  for (let i = 0; i < linhas.length; i++) {
    const linha = linhas[i];
    if (linha.startsWith("Matrícula")) {
      info.matriculaExtraida =
        capturarValorInline(linha) ?? linhas[i + 1]?.trim();
    } else if (linha.startsWith("Situação")) {
      info.situacaoEscolar = capturarValorInline(linha);
    } else if (linha.startsWith("Causa do Encerramento")) {
      info.causaEncerramentoEscolar = capturarValorInline(linha);
    } else if (linha.startsWith("Motivo")) {
      const valorInline = capturarValorInline(linha);
      info.motivoEscolar = valorInline ?? linhas[i + 1]?.trim();
    } else if (
      linha.startsWith(
        "Recebe Escolarização em Outro Espaço (diferente da escola)?"
      )
    ) {
      info.recebeOutroEspacoEscolar =
        capturarValorInline(linha) ?? linhas[i + 1]?.trim();
    }
  }

  return info;
}

function capturarValorInline(linha: string): string | undefined {
  const [, valor] = linha.split(":");
  if (!valor) return undefined;
  const limpo = valor.replace(/\t/g, " ").trim();
  return limpo || undefined;
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
  const bloco = extrairBetween(texto, "Dados de Ingresso", "Escolaridade");
  if (!bloco) {
    throw new Error("Sessão 'Dados de Ingresso' não encontrada");
  }

  const mapa = mapearCampos(bloco);
  const ano = limparChaves(mapa.get("ano ingresso"));
  const periodo = limparChaves(mapa.get("período ingresso"));

  return {
    anoIngresso: ano ? parseInt(ano, 10) : undefined,
    periodoIngresso: periodo ? parseInt(periodo, 10) : undefined,
    dataInclusao: limparChaves(mapa.get("data de inclusão do aluno")),
    tipoIngresso: limparChaves(mapa.get("tipo ingresso")),
    redeOrigem: limparChaves(mapa.get("rede de ensino origem")),
  };
}

function extrairBlocoEscolaridade(texto: string): EscolaridadeInfo {
  const bloco = extrairBetween(texto, "Escolaridade", "Dados de Ingresso");
  if (!bloco) {
    throw new Error("Sessão 'Escolaridade' não encontrada");
  }

  const mapa = mapearCampos(bloco);
  return {
    matrizCurricular: limparChaves(mapa.get("matriz curricular")),
  };
}

function extrairBetween(
  texto: string,
  inicioLabel: string,
  fimLabel: string
): string | null {
  const inicio = texto.indexOf(inicioLabel);
  if (inicio === -1) return null;
  const depois = texto.slice(inicio + inicioLabel.length);
  const fim = depois.indexOf(fimLabel);
  return fim === -1 ? depois : depois.slice(0, fim);
}

function mapearCampos(bloco: string): Map<string, string> {
  const linhas = bloco.split("\n");
  const mapa = new Map<string, string>();

  for (let i = 0; i < linhas.length; i++) {
    const linha = linhas[i].trim();
    if (!linha) continue;
    const [label, ...resto] = linha.split(":");
    if (!resto.length) continue;
    const valorInline = resto.join(":").trim();
    if (valorInline) {
      mapa.set(normalizarLabel(label), valorInline);
      continue;
    }

    const proxima = linhas[i + 1]?.trim();
    if (proxima) {
      mapa.set(normalizarLabel(label), proxima);
      i += 1;
    }
  }

  return mapa;
}

function normalizarLabel(label: string): string {
  return label
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\*/g, "")
    .trim()
    .toLowerCase();
}

function limparChaves(valor?: string): string | undefined {
  if (!valor) return undefined;
  return valor.replace(/[<>]/g, "").trim() || undefined;
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
    throw new Error("Cabeçalho da tabela de renovação não encontrado");
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
      anoLetivo: limparObrigatorio(anoLetivo),
      periodoLetivo: limparObrigatorio(periodoLetivo),
      unidadeEnsino,
      codigoEscola,
      modalidade,
      segmento,
      curso,
      serie: limparOpcional(serie),
      turno: limparOpcional(turno),
      situacao: limparOpcional(situacao),
      tipoVaga: limparOpcional(tipoVagaCompleto),
      matrizCurricular: escolaridade.matrizCurricular,
      dataInclusaoAluno: ingresso.dataInclusao,
      redeEnsinoOrigem: ingresso.redeOrigem,
      ensinoReligioso: traduzirBooleano(ensinoRel),
      linguaEstrangeira: traduzirBooleano(linguaEstr),
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
  const viaTab = linha.split(/\t+/).map((parte) => parte.trim()).filter(Boolean);
  if (viaTab.length >= 9) {
    return viaTab;
  }
  return linha.split(/\s{2,}/).map((parte) => parte.trim()).filter(Boolean);
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
