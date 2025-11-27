import type { Prisma } from "@prisma/client";
import { limparCamposContexto } from "@/lib/csv";
import {
  type CsvImportAdapter,
  type CsvPersistContext,
} from "@/lib/importer/csv/types";

type CsvRow = Record<string, string>;

const REQUIRED_HEADERS = [
  "Ano",
  "CENSO",
  "MODALIDADE",
  "CURSO",
  "SERIE",
  "TURNO",
  "TURMA",
  "ALUNO",
  "NOME_COMPL",
  "DISCIPLINA1",
  "TOTAL_PONTOS",
  "FALTAS",
  "Textbox148",
  "SITUACAO_FINAL",
];

const tipoArquivo = "alunos";
const tipoEntidade = "aluno";

function buildLinha(row: CsvRow, numeroLinha: number, arquivoId: string) {
  return {
    arquivoId,
    numeroLinha,
    dadosOriginais: row,
    identificadorChave: row.ALUNO?.trim() || "",
    tipoEntidade,
  };
}

type EnturmacaoSeed = {
  matricula: string;
  linha: { id: string };
  dados: CsvRow;
};

function mapEnturmacoes(rows: CsvRow[], ctx: CsvPersistContext<CsvRow>) {
  const linhasPorNumero = new Map<number, { id: string }>(
    ctx.linhas.map((linha) => [linha.numeroLinha, { id: linha.id }])
  );
  const enturmacoes = new Map<string, EnturmacaoSeed>();

  rows.forEach((row, idx) => {
    const matricula = row.ALUNO?.trim();
    if (!matricula) return;
    const linha = linhasPorNumero.get(idx);
    if (!linha) return;

    const contexto = limparCamposContexto(row);
    const chave = `${matricula}|${contexto.anoLetivo}|${contexto.turma}`;

    if (!enturmacoes.has(chave)) {
      enturmacoes.set(chave, { matricula, linha, dados: row });
    }
  });

  return enturmacoes;
}

function mapAlunos(enturmacoes: Map<string, EnturmacaoSeed>) {
  const alunos = new Map<string, EnturmacaoSeed>();
  for (const [, info] of enturmacoes) {
    if (!alunos.has(info.matricula)) {
      alunos.set(info.matricula, info);
    }
  }
  return alunos;
}

async function upsertAlunos(
  tx: Prisma.TransactionClient,
  alunos: Map<string, EnturmacaoSeed>
) {
  const ids = new Map<string, string>();
  let novos = 0;
  let atualizados = 0;

  for (const [matricula, info] of alunos) {
    let alunoId: string | null = null;
    try {
      const existente = await tx.aluno.findUnique({ where: { matricula } });
      if (!existente) {
        const novo = await tx.aluno.create({
          data: {
            matricula,
            nome: info.dados.NOME_COMPL || null,
            origemTipo: "csv",
            linhaOrigemId: info.linha.id,
            fonteAusente: false,
          },
        });
        novos += 1;
        alunoId = novo.id;
      } else {
        if (existente.fonteAusente) {
          await tx.aluno.update({
            where: { id: existente.id },
            data: { linhaOrigemId: info.linha.id, fonteAusente: false },
          });
        }
        atualizados += 1;
        alunoId = existente.id;
      }
    } catch (error: any) {
      if (error.code === "P2002") {
        const existente = await tx.aluno.findUnique({ where: { matricula } });
        if (existente) {
          atualizados += 1;
          alunoId = existente.id;
        } else {
          throw error;
        }
      } else {
        throw error;
      }
    }

    if (alunoId) {
      ids.set(matricula, alunoId);
    }
  }

  return { ids, novos, atualizados };
}

async function criarEnturmacoes(
  tx: Prisma.TransactionClient,
  enturmacoes: Map<string, EnturmacaoSeed>,
  alunoIds: Map<string, string>
) {
  let criadas = 0;

  for (const [, info] of enturmacoes) {
    const alunoId = alunoIds.get(info.matricula);
    if (!alunoId) continue;

    const contexto = limparCamposContexto(info.dados);
    const { anoLetivo, modalidade, turma, serie, turno } = contexto;
    if (!anoLetivo || !modalidade || !turma || !serie) continue;

    try {
      const existente = await tx.enturmacao.findFirst({
        where: { alunoId, anoLetivo, modalidade, turma, serie },
      });

      if (!existente) {
        await tx.enturmacao.create({
          data: {
            alunoId,
            anoLetivo,
            regime: 0,
            modalidade,
            turma,
            serie,
            turno,
            origemTipo: "csv",
            linhaOrigemId: info.linha.id,
            fonteAusente: false,
          },
        });
        criadas += 1;
      } else if (existente.fonteAusente) {
        await tx.enturmacao.update({
          where: { id: existente.id },
          data: { linhaOrigemId: info.linha.id, fonteAusente: false },
        });
      }
    } catch (error: any) {
      if (error.code === "P2002") continue;
      throw error;
    }
  }

  return criadas;
}

async function persistDomain(
  tx: Prisma.TransactionClient,
  ctx: CsvPersistContext<CsvRow>
) {
  const enturmacoes = mapEnturmacoes(ctx.rows, ctx);
  const alunos = mapAlunos(enturmacoes);

  const { ids, novos, atualizados } = await upsertAlunos(tx, alunos);
  const enturmacoesNovas = await criarEnturmacoes(tx, enturmacoes, ids);

  return {
    alunosNovos: novos,
    alunosAtualizados: atualizados,
    enturmacoesNovas,
  };
}

export const alunoCsvAdapter: CsvImportAdapter<CsvRow, {
  alunosNovos: number;
  alunosAtualizados: number;
  enturmacoesNovas: number;
}> = {
  tipoArquivo,
  tipoEntidade,
  duplicateKey: (row) => row.ALUNO?.trim() || "",
  buildLinha,
  persistDomain,
};

export { REQUIRED_HEADERS as ALUNO_CSV_HEADERS };
