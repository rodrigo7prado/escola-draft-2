import type { Prisma, LinhaImportada } from "@prisma/client";
import type { ImportProfile } from "@/lib/importer/csv/types";

type PersistDeps = {
  rows: Record<string, string>[];
  linhas: LinhaImportada[];
  arquivo: { id: string };
  dataHash: string;
  fileName: string;
  profile: ImportProfile;
  extractField: (row: Record<string, string>, field: { column: string; prefixes?: string[] }) => string;
  extractName: (row: Record<string, string>, fields: { column: string; prefixes?: string[] }[]) => string;
  extractContext: (row: Record<string, string>, profile: ImportProfile) => {
    periodo: string;
    grupo: string;
    modalidade: string;
    serie: string;
    turno: string;
  };
};

type EnturmacaoSeed = {
  matricula: string;
  linhaId: string;
  row: Record<string, string>;
  ctx: ReturnType<PersistDeps["extractContext"]>;
};

function mapEnturmacoes(deps: PersistDeps) {
  const linhasPorNumero = new Map<number, string>(
    deps.linhas.map((linha) => [linha.numeroLinha, linha.id])
  );
  const seeds = new Map<string, EnturmacaoSeed>();

  deps.rows.forEach((row, idx) => {
    const matricula = deps.extractField(row, deps.profile.duplicateKey);
    if (!matricula) return;
    const linhaId = linhasPorNumero.get(idx);
    if (!linhaId) return;

    const ctx = deps.extractContext(row, deps.profile);
    const chave = `${matricula}|${ctx.periodo}|${ctx.grupo}`;

    if (!seeds.has(chave)) {
      seeds.set(chave, { matricula, linhaId, row, ctx });
    }
  });

  return seeds;
}

function mapAlunos(seeds: Map<string, EnturmacaoSeed>) {
  const alunos = new Map<string, EnturmacaoSeed>();
  for (const [, seed] of seeds) {
    if (!alunos.has(seed.matricula)) alunos.set(seed.matricula, seed);
  }
  return alunos;
}

async function upsertAlunos(
  tx: Prisma.TransactionClient,
  alunos: Map<string, EnturmacaoSeed>,
  deps: PersistDeps
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
            nome: deps.extractName(info.row, deps.profile.displayName) || null,
            origemTipo: "csv",
            linhaOrigemId: info.linhaId,
            fonteAusente: false,
          },
        });
        novos += 1;
        alunoId = novo.id;
      } else {
        if (existente.fonteAusente) {
          await tx.aluno.update({
            where: { id: existente.id },
            data: { linhaOrigemId: info.linhaId, fonteAusente: false },
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

    if (alunoId) ids.set(matricula, alunoId);
  }

  return { ids, novos, atualizados };
}

async function criarEnturmacoes(
  tx: Prisma.TransactionClient,
  seeds: Map<string, EnturmacaoSeed>,
  alunoIds: Map<string, string>
) {
  let criadas = 0;

  for (const [, seed] of seeds) {
    const alunoId = alunoIds.get(seed.matricula);
    if (!alunoId) continue;

    const { periodo, grupo, modalidade, serie, turno } = seed.ctx;
    if (!periodo || !grupo || !serie || !modalidade) continue;

    try {
      const existente = await tx.enturmacao.findFirst({
        where: {
          alunoId,
          anoLetivo: periodo,
          turma: grupo,
          modalidade,
          serie,
        },
      });

      if (!existente) {
        await tx.enturmacao.create({
          data: {
            alunoId,
            anoLetivo: periodo,
            regime: 0,
            modalidade,
            turma: grupo,
            serie,
            turno: turno || null,
            origemTipo: "csv",
            linhaOrigemId: seed.linhaId,
            fonteAusente: false,
          },
        });
        criadas += 1;
      } else if (existente.fonteAusente) {
        await tx.enturmacao.update({
          where: { id: existente.id },
          data: { linhaOrigemId: seed.linhaId, fonteAusente: false },
        });
      }
    } catch (error: any) {
      if (error.code === "P2002") continue;
      throw error;
    }
  }

  return criadas;
}

export async function persistAlunosDomain(
  tx: Prisma.TransactionClient,
  deps: PersistDeps
) {
  const enturmacoes = mapEnturmacoes(deps);
  const alunos = mapAlunos(enturmacoes);
  const { ids, novos, atualizados } = await upsertAlunos(tx, alunos, deps);
  const enturmacoesNovas = await criarEnturmacoes(tx, enturmacoes, ids);

  return {
    alunosNovos: novos,
    alunosAtualizados: atualizados,
    enturmacoesNovas,
  };
}
