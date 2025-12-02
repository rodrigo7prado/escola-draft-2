import type { PrismaClient } from "@prisma/client";
import { ImportProfile } from "./types";

type ExistingKeys = Map<string, Map<string, Set<string>>>;

async function loadFromEnturmacoes(prisma: PrismaClient): Promise<ExistingKeys> {
  const enturmacoes = await prisma.enturmacao.findMany({
    select: {
      anoLetivo: true,
      turma: true,
      aluno: { select: { matricula: true } },
    },
  });

  const mapa = new Map<string, Map<string, Set<string>>>();
  for (const ent of enturmacoes) {
    if (!mapa.has(ent.anoLetivo)) mapa.set(ent.anoLetivo, new Map());
    const turmas = mapa.get(ent.anoLetivo)!;
    if (!turmas.has(ent.turma)) turmas.set(ent.turma, new Set());
    turmas.get(ent.turma)!.add(ent.aluno.matricula);
  }
  return mapa;
}

export async function loadExistingKeys(
  prisma: PrismaClient,
  profile: ImportProfile
): Promise<ExistingKeys> {
  if (profile.existingKeysSource === "enturmacoes") {
    return loadFromEnturmacoes(prisma);
  }
  return new Map();
}
