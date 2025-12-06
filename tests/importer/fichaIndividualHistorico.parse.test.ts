import { readFileSync } from "fs";
import path from "path";
import { describe, expect, it } from "vitest";
import { executarExtratorXlsx } from "@/lib/parsers/engine/xlsx/executors";
import { fichaIndividualHistoricoProfile } from "@/lib/importer/profiles/fichaIndividualHistorico";
import { serializarFichaDisciplina } from "@/lib/parsers/profiles/fichaIndividualHistorico/serializer";

describe("Ficha Individual - Histórico (XLSX)", () => {
  it("deve extrair aluno, séries e disciplinas do fixture real", async () => {
    const fixturePath = path.join(
      __dirname,
      "..",
      "fixtures",
      "RS_FichaIndividualAlunoHistorico.xlsx"
    );
    const buffer = readFileSync(fixturePath);

    const parsed = await executarExtratorXlsx(fichaIndividualHistoricoProfile, buffer);
    const linhas = serializarFichaDisciplina(parsed, {});

    expect(parsed.aluno).toBeTruthy();
    expect(parsed.series.length).toBeGreaterThan(0);
    const totalDisciplinas = parsed.series.reduce(
      (acc, serie) => acc + (serie.disciplinas?.length ?? 0),
      0
    );
    expect(totalDisciplinas + parsed.series.length).toBeGreaterThan(0);
    expect(linhas.length).toBeGreaterThan(0);
  });
});
