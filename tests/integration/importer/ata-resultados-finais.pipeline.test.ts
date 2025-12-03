import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import fs from "fs";
import path from "path";
import { runCsvImport } from "@/lib/importer/pipelines/csv/pipeline";
import { DuplicateFileError } from "@/lib/importer/pipelines/csv/types";
import { parseCsvLoose } from "@/lib/parsers/csv/parse";
import { ataResultadosFinaisProfile } from "@/lib/importer/profiles";
import { buildPeriodoResumo } from "@/lib/importer/profiles/ataResultadosFinais/summary";
import {
  setupTestDatabase,
  teardownTestDatabase,
  clearTestDatabase,
  getTestPrisma,
} from "../../helpers/db-setup";

const csvAtaFixture = fs.readFileSync(
  path.join(process.cwd(), "tests/fixtures/Ata_resultados_finais(1).csv"),
  "utf8"
);
import { resolveRequiredHeaders } from "@/lib/parsers/engine/csv/executors";

const parsedAtaFixture = parseCsvLoose(csvAtaFixture, resolveRequiredHeaders(ataResultadosFinaisProfile));

describe("Pipeline CSV - Ata de Resultados Finais", () => {
  beforeAll(async () => {
    await setupTestDatabase();
  });

  afterAll(async () => {
    await teardownTestDatabase();
  });

  beforeEach(async () => {
    await clearTestDatabase();
  });

  it("deve impedir reimportação do mesmo arquivo (hash duplicado)", async () => {
    const prisma = getTestPrisma();
    const primeiro = await runCsvImport({
      prisma,
      data: parsedAtaFixture,
      fileName: "ata.csv",
      profile: ataResultadosFinaisProfile,
    });

    expect(primeiro.arquivo.id).toBeTruthy();

    await expect(
      runCsvImport({
        prisma,
        data: parsedAtaFixture,
        fileName: "ata-duplicada.csv",
        profile: ataResultadosFinaisProfile,
      })
    ).rejects.toBeInstanceOf(DuplicateFileError);
  });

  it("deve reativar aluno e enturmação marcados como fonte ausente", async () => {
    const prisma = getTestPrisma();
    const firstRow = parsedAtaFixture.rows[0];

    // Estado anterior: aluno e enturmação existentes, porém fonteAusente=true
    const alunoExistente = await prisma.aluno.create({
      data: {
        matricula: firstRow["ALUNO"],
        nome: "Aluno Antigo",
        origemTipo: "csv",
        fonteAusente: true,
      },
    });
    await prisma.enturmacao.create({
      data: {
        alunoId: alunoExistente.id,
        anoLetivo: "2024",
        regime: 0,
        modalidade: "REGULAR",
        turma: "IF_CIA_3008-180191",
        serie: "3",
        turno: "T",
        origemTipo: "csv",
        fonteAusente: true,
      },
    });

    await runCsvImport({
      prisma,
      data: parsedAtaFixture,
      fileName: "ata.csv",
      profile: ataResultadosFinaisProfile,
    });

    const alunoAtualizado = await prisma.aluno.findUniqueOrThrow({
      where: { matricula: firstRow["ALUNO"] },
    });
    expect(alunoAtualizado.fonteAusente).toBe(false);
    expect(alunoAtualizado.linhaOrigemId).toBeTruthy();

    const enturmacoes = await prisma.enturmacao.findMany({
      where: { alunoId: alunoAtualizado.id },
    });
    expect(enturmacoes).not.toHaveLength(0);
    expect(enturmacoes[0].fonteAusente).toBe(false);
  });

  it("deve sinalizar pendências no resumo quando não há enturmações existentes", () => {
    const linhas = parsedAtaFixture.rows.map((row, idx) => ({
      id: `linha-${idx}`,
      arquivoId: "arquivo-x",
      numeroLinha: idx,
      dadosOriginais: row,
      identificadorChave: row["ALUNO"],
      tipoEntidade: ataResultadosFinaisProfile.tipoEntidade,
    })) as any; // buildPeriodoResumo lê apenas dadosOriginais/identificadorChave

    const resumo = buildPeriodoResumo(linhas, new Map(), ataResultadosFinaisProfile);
    expect(resumo).not.toHaveLength(0);
    const periodo = resumo[0];
    expect(periodo.resumo.pendentes).toBe(parsedAtaFixture.rows.length);
    expect(periodo.resumo.status).toBe("pendente");
  });
});
