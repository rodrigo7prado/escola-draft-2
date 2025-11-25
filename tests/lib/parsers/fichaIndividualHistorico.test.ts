import fs from "fs/promises";
import path from "path";
import { parseFichaIndividualHistorico } from "@/lib/parsers/fichaIndividualHistorico/parser";

const samplePath = path.join(
  process.cwd(),
  "docs/templates/arquivosDeExemplo/FichasIndividuaisExemplos/serie1.xlsx"
);

describe("parseFichaIndividualHistorico", () => {
  it("deve extrair dados do aluno, contexto e disciplinas do XLSX de exemplo", async () => {
    const buffer = await fs.readFile(samplePath);
    const parsed = await parseFichaIndividualHistorico(buffer);

    expect(parsed.aluno["NOME DO ALUNO"]).toBe("ANNA CLARA SAMPAIO GOMES");
    expect(parsed.aluno["DATA DE NASCIMENTO"]).toBe("2006-05-25");
    expect(parsed.aluno["SEXO"]).toBe("F");

    expect(parsed.series).toHaveLength(4);

    const primeira = parsed.series[0];
    expect(primeira.contexto["ANO LETIVO"]).toBe(2022);
    expect(primeira.contexto["CURSO"]).toBe("MÉDIO");
    expect(primeira.contexto["TURMA"]).toBe("1005");
    expect(primeira.contexto["SÉRIE"]).toBe(1);

    const filosofia = primeira.disciplinas.find(
      (d) => d.componenteCurricular === "FILOSOFIA"
    );
    expect(filosofia?.cargaHoraria).toBe(80);
    expect(filosofia?.frequencia).toBeCloseTo(87.18, 2);
    expect(filosofia?.totalPontos).toBeCloseTo(23, 2);

    expect(primeira.resumo.cargaHorariaTotal).toBe(1040);
    expect(primeira.resumo.frequenciaGlobal).toBeCloseTo(87.3575, 3);
    expect(primeira.resumo.situacaoFinal).toBe("APROVADO");

    const ultima = parsed.series[3];
    expect(ultima.contexto["TURMA"]).toBe("ELET3-M-1005");
    expect(ultima.resumo.cargaHorariaTotal).toBe(80);
    expect(ultima.resumo.frequenciaGlobal).toBeCloseTo(96.428, 3);
  });
});
