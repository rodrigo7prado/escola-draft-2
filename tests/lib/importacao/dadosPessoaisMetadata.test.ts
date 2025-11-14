import { describe, it, expect } from "vitest";
import {
  CAMPOS_DADOS_PESSOAIS_CONFIG,
  normalizarValorParaComparacao,
} from "@/lib/importacao/dadosPessoaisMetadata";

const getConfig = (campo: string) => {
  const config = CAMPOS_DADOS_PESSOAIS_CONFIG.find(
    (item) => item.campo === campo
  );
  if (!config) {
    throw new Error(`Config não encontrada para campo ${campo}`);
  }
  return config;
};

describe("normalizarValorParaComparacao", () => {
  it("normaliza datas brasileiras e ISO para o mesmo valor", () => {
    const configData = getConfig("dataNascimento");

    const iso = normalizarValorParaComparacao(
      configData,
      "2001-05-12T00:00:00.000Z"
    );
    const br = normalizarValorParaComparacao(configData, "12/05/2001");

    expect(iso).toBe("2001-05-12");
    expect(br).toBe(iso);
  });

  it("normaliza CPF mascarado e sem máscara para o mesmo valor", () => {
    const configCPF = getConfig("cpf");

    const semMascara = normalizarValorParaComparacao(configCPF, "12345678900");
    const comMascara = normalizarValorParaComparacao(
      configCPF,
      "123.456.789-00"
    );

    expect(semMascara).toBe("12345678900");
    expect(comMascara).toBe(semMascara);
  });
});
