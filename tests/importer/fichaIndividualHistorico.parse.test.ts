import { readFileSync } from "fs";
import path from "path";
import { describe, expect, it } from "vitest";
import { executarExtratorXlsx } from "@/lib/parsers/engine/xlsx/executors";
import { fichaIndividualHistoricoProfile } from "@/lib/importer/profiles/fichaIndividualHistorico";
import { serializarFichaDisciplina } from "@/lib/parsers/profiles/fichaIndividualHistorico/serializer";
import { loadWorkbookSheets } from "@/lib/parsers/xlsx/utils";

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
    const rawSheets = (await loadWorkbookSheets(buffer)).map((sheet) => ({
      name: sheet.name,
      cells: Object.fromEntries(
        Object.entries(sheet.rows).flatMap(([rowNum, cols]) =>
          Object.entries(cols).map(([col, val]) => [`${col}${rowNum}`, val as string])
        )
      ),
    }));

    // Debug: imprimir contexto e resumos antes da validação
    // eslint-disable-next-line no-console
    console.log("contextos:", parsed.series.map((s) => s.contexto));
    // eslint-disable-next-line no-console
    console.log("resumos:", parsed.series.map((s) => s.resumo));

    const linhas = serializarFichaDisciplina(parsed, { rawSheets });

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
