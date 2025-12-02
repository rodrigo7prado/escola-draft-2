export function limparValor(valor: string | undefined, prefixo: string): string {
  if (!valor) return "";

  const str = valor.toString().trim();

  if (str.startsWith(prefixo)) {
    return str.substring(prefixo.length).trim();
  }

  return str;
}

export function limparCamposContexto(dados: Record<string, string>) {
  let anoLetivo = limparValor(dados.Ano, "Ano Letivo:");
  if (!anoLetivo || anoLetivo === dados.Ano?.trim()) {
    anoLetivo = limparValor(dados.Ano, "Ano:");
  }

  return {
    anoLetivo,
    modalidade: limparValor(dados.MODALIDADE, "Modalidade:"),
    turma: limparValor(dados.TURMA, "Turma:"),
    serie: limparValor(dados.SERIE, "Série:"),
    turno: limparValor(dados.TURNO, "Turno:") || null,
  };
}
