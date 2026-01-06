export function normalizarMatricula(valor: string): string {
  return (valor ?? "").replace(/\D/g, "");
}

export function extrairMatriculaDoNomeArquivo(fileName: string): string | null {
  const semExtensao = fileName.replace(/\.[^.]+$/, "");
  const [trechoMatricula] = semExtensao.split("_");
  const matricula = normalizarMatricula(trechoMatricula);

  return matricula || null;
}
