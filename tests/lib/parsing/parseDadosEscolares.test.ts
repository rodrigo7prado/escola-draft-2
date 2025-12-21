import { describe, expect, it } from "vitest";
import { parseDadosEscolares } from "@/lib/parsing/parseDadosEscolares";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const TEMPLATE_PATH = join(
  __dirname,
  "..",
  "..",
  "..",
  "docs",
  "templates",
  "arquivosDeExemplo",
  "importacaoPorColagem",
  "DadosEscolaresColagemModelo.txt"
);
const ESPERADO_PATH = join(
  __dirname,
  "..",
  "..",
  "..",
  "docs",
  "templates",
  "arquivosDeExemplo",
  "importacaoPorColagem",
  "DadosEscolaresEsperados.json"
);

const fixturesExist = existsSync(TEMPLATE_PATH) && existsSync(ESPERADO_PATH);
const TEXTO_COMPLETO = fixturesExist ? readFileSync(TEMPLATE_PATH, "utf8") : "";
const DADOS_ESPERADOS = fixturesExist
  ? JSON.parse(readFileSync(ESPERADO_PATH, "utf8"))
  : {};

const suite = fixturesExist ? describe : describe.skip;

suite("parseDadosEscolares", () => {
  it("deve extrair dados conforme modelo oficial", () => {
    const resultado = parseDadosEscolares(TEXTO_COMPLETO, "202200001111222");

    expect(resultado.avisos).toHaveLength(0);

    expect(resultado.alunoInfo.situacao).toBe(DADOS_ESPERADOS.Aluno["Situação"]);
    expect(resultado.alunoInfo.motivoEncerramento).toBe(
      DADOS_ESPERADOS.Aluno.Motivo
    );
    expect(resultado.alunoInfo.anoIngresso).toBe(
      DADOS_ESPERADOS["Dados de Ingresso"]["Ano Ingresso"]
    );
    expect(resultado.alunoInfo.matrizCurricular).toBe(
      DADOS_ESPERADOS.Escolaridade["Matriz Curricular"]
    );

    const esperadoTabela =
      DADOS_ESPERADOS["Confirmação/Renovação de Matrícula"][
        "Renovação de Matrícula (Tabela)"
      ];

    // Ignora linha sintética de ingresso (sem série) e compara apenas linhas reais da tabela
    const seriesTabela = resultado.series.filter((serie) => serie.serie !== undefined);

    expect(seriesTabela).toHaveLength(esperadoTabela.length);

    const ordenar = (a: any, b: any) =>
      Number(a["Ano Letivo"] ?? a.anoLetivo) - Number(b["Ano Letivo"] ?? b.anoLetivo) ||
      Number(a["Período Letivo"] ?? a.periodoLetivo) - Number(b["Período Letivo"] ?? b.periodoLetivo);

    const parsedOrdenado = [...seriesTabela].sort(ordenar);
    const esperadoOrdenado = [...esperadoTabela].sort(ordenar);

    parsedOrdenado.forEach((serie, index) => {
      const esperado = esperadoOrdenado[index];

      expect(Number(serie.anoLetivo)).toBe(esperado["Ano Letivo"]);
      expect(Number(serie.periodoLetivo)).toBe(esperado["Período Letivo"]);
      expect(serie.unidadeEnsino).toBe(esperado["Unidade de Ensino"]);
      expect(serie.serie).toBe(String(esperado["Série/Ano Escolar"]));
      expect(serie.turno).toBe(esperado["Turno"]);
      expect(serie.situacao).toBe(esperado["Situação"]);
      expect(serie.tipoVaga).toBe(esperado["Tipo Vaga"]);
    });
  });

  it("lança erro se matrícula divergente", () => {
    expect(() =>
      parseDadosEscolares(TEXTO_COMPLETO, "000000000000000")
    ).toThrow("Matrícula do texto não corresponde ao aluno ativo");
  });

  it("lança erro para turno desconhecido", () => {
    const textoInvalido = TEXTO_COMPLETO.replace(
      "\tM\t\t\tPossui",
      "\tX\t\t\tPossui"
    );
    expect(() => parseDadosEscolares(textoInvalido)).toThrow(
      "Turno desconhecido"
    );
  });

  it("emite aviso para tipo de vaga inesperado", () => {
    const textoAviso = TEXTO_COMPLETO.replace(
      /Possui confirmação\tVaga de Continuidade/,
      "Possui confirmação\tOutro tipo"
    );
    const resultado = parseDadosEscolares(textoAviso);
    expect(resultado.avisos).toEqual(
      expect.arrayContaining([
        expect.stringContaining("Tipo de Vaga desconhecido"),
      ])
    );
  });
});
