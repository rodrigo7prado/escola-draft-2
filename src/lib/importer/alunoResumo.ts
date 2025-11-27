import type { LinhaImportada } from "@prisma/client";
import { limparValor } from "@/lib/csv";
import {
  type CsvResumoPeriodo,
  type CsvSummaryGrouping,
} from "@/lib/importer/csv/types";
import { buildPeriodoResumo } from "@/lib/importer/csv/summary";

type AlunosNoBanco = Map<string, Map<string, Set<string>>>;

function buildGrouping(): CsvSummaryGrouping {
  return {
    periodo: (dados) =>
      limparValor(dados.Ano, "Ano Letivo:") ||
      limparValor(dados.Ano, "Ano:") ||
      "(sem ano)",
    grupo: (dados) => limparValor(dados.TURMA, "Turma:") || "(sem turma)",
    chave: (dados) => dados.ALUNO?.trim() || "",
    nome: (dados) => dados.NOME_COMPL || dados.NOME || "(sem nome)",
  };
}

export function resumirAlunosPorPeriodo(
  linhas: LinhaImportada[],
  alunosBanco: AlunosNoBanco
): CsvResumoPeriodo[] {
  return buildPeriodoResumo(linhas, buildGrouping(), alunosBanco);
}

type EnturmacaoComAluno = {
  anoLetivo: string;
  turma: string;
  aluno: { matricula: string };
};

export function mapearAlunosBanco(
  enturmacoes: EnturmacaoComAluno[]
): AlunosNoBanco {
  const mapa = new Map<string, Map<string, Set<string>>>();

  for (const ent of enturmacoes) {
    if (!mapa.has(ent.anoLetivo)) mapa.set(ent.anoLetivo, new Map());
    const turmas = mapa.get(ent.anoLetivo)!;
    if (!turmas.has(ent.turma)) turmas.set(ent.turma, new Set());
    turmas.get(ent.turma)!.add(ent.aluno.matricula);
  }

  return mapa;
}
