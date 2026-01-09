import dadosEscolares from "@/lib/core/data/gestao-alunos/def-objects/dadosEscolares";
import dadosPessoais from "@/lib/core/data/gestao-alunos/def-objects/dadosPessoais";
import historicoEscolar from "@/lib/core/data/gestao-alunos/def-objects/historicoEscolar";
import {
  calcularCompletudeDadosPessoais,
  calcularCompletudeDadosEscolares,
  calcularCompletudeDocumento,
  calcularCompletudeEmissao,
  calcularCompletudeFase,
  calcularCompletudeHistoricoEscolar,
  type DadosAlunoCompleto,
} from "@/lib/core/data/gestao-alunos/documentos/calcularCompletude";
import type { DocEmissao, Phase } from "@/lib/core/data/gestao-alunos/phases.types";

const DOCUMENTOS: DocEmissao[] = [
  "Certidão",
  "Certificado",
  "Diploma",
  "Histórico Escolar",
];

const DEF_OBJECTS = [
  dadosPessoais,
  dadosEscolares,
  historicoEscolar,
];

describe("calcularCompletudeDocumento", () => {
  it("retorna ausente quando aluno nao possui dados", () => {
    const resultado = calcularCompletudeDocumento("Certidão", {});

    expect(resultado.status).toBe("ausente");
    expect(resultado.camposPreenchidos).toBe(0);
    expect(resultado.totalCampos).toBeGreaterThan(0);
    expect(resultado.percentual).toBe(0);
    expect(resultado.camposFaltantes).toHaveLength(resultado.totalCampos);
  });

  it("retorna completo quando todos os campos estao preenchidos", () => {
    const alunoCompleto = montarAlunoCompleto(["Certidão"]);
    const resultado = calcularCompletudeDocumento("Certidão", alunoCompleto);

    expect(resultado.status).toBe("completo");
    expect(resultado.percentual).toBe(100);
    expect(resultado.camposFaltantes).toHaveLength(0);
  });

  it("retorna incompleto quando falta algum campo", () => {
    const alunoCompleto = montarAlunoCompleto(["Certidão"]);
    delete (alunoCompleto as Record<string, unknown>).nome;

    const resultado = calcularCompletudeDocumento("Certidão", alunoCompleto);

    expect(resultado.status).toBe("incompleto");
    expect(resultado.camposPreenchidos).toBeLessThan(resultado.totalCampos);
    expect(resultado.camposFaltantes.some((campo) => campo.campo === "nome")).toBe(true);
  });
});

describe("calcularCompletudeEmissao", () => {
  it("retorna completo quando todos os documentos estao completos", () => {
    const alunoCompleto = montarAlunoCompleto(DOCUMENTOS);
    const resumo = calcularCompletudeEmissao(alunoCompleto);

    expect(resumo.statusGeral).toBe("completo");
    expect(resumo.documentosProntos).toBe(4);
  });

  it("retorna ausente quando nenhum documento possui dados", () => {
    const resumo = calcularCompletudeEmissao({});
    expect(resumo.statusGeral).toBe("ausente");
  });
});

describe("calcularCompletudeDadosPessoais", () => {
  it("retorna completo quando todos os campos exigidos estao preenchidos", () => {
    const alunoCompleto = montarAlunoCompletoPorFase("FASE:DADOS_PESSOAIS");
    const resultado = calcularCompletudeDadosPessoais(alunoCompleto);

    expect(resultado.status).toBe("completo");
    expect(resultado.percentual).toBe(100);
    expect(resultado.camposFaltantes).toHaveLength(0);
  });

  it("retorna ausente quando nenhum campo esta preenchido", () => {
    const resultado = calcularCompletudeDadosPessoais({});

    expect(resultado.status).toBe("ausente");
    expect(resultado.percentual).toBe(0);
    expect(resultado.camposPreenchidos).toBe(0);
    expect(resultado.camposFaltantes?.length).toBeGreaterThan(0);
  });

  it("retorna incompleto quando falta algum campo", () => {
    const alunoCompleto = montarAlunoCompletoPorFase("FASE:DADOS_PESSOAIS");
    delete (alunoCompleto as Record<string, unknown>).nome;

    const resultado = calcularCompletudeDadosPessoais(alunoCompleto);
    const campos = resultado.camposFaltantes?.map((campo) => campo.campo) ?? [];

    expect(resultado.status).toBe("incompleto");
    expect(campos).toEqual(expect.arrayContaining(["nome"]));
  });
});

describe("calcularCompletudeDadosEscolares", () => {
  it("retorna completo quando todos os campos exigidos estao preenchidos", () => {
    const alunoCompleto = montarAlunoCompletoPorFase("FASE:DADOS_ESCOLARES");
    const resultado = calcularCompletudeDadosEscolares(alunoCompleto);

    expect(resultado.status).toBe("completo");
    expect(resultado.percentual).toBe(100);
    expect(resultado.camposFaltantes).toHaveLength(0);
  });

  it("retorna ausente quando nenhum campo esta preenchido", () => {
    const resultado = calcularCompletudeDadosEscolares({});

    expect(resultado.status).toBe("ausente");
    expect(resultado.percentual).toBe(0);
    expect(resultado.camposPreenchidos).toBe(0);
    expect(resultado.camposFaltantes?.length).toBeGreaterThan(0);
  });

  it("retorna incompleto quando falta algum campo", () => {
    const alunoCompleto = montarAlunoCompletoPorFase("FASE:DADOS_ESCOLARES");
    const serie = alunoCompleto.seriesCursadas?.[0] as Record<string, unknown>;
    delete (alunoCompleto as Record<string, unknown>).nome;
    if (serie) delete serie.segmento;

    const resultado = calcularCompletudeDadosEscolares(alunoCompleto);
    const campos = resultado.camposFaltantes?.map((campo) => campo.campo) ?? [];

    expect(resultado.status).toBe("incompleto");
    expect(campos).toEqual(expect.arrayContaining(["nome", "segmento"]));
  });
});

describe("calcularCompletudeHistoricoEscolar", () => {
  it("retorna completo quando todos os campos exigidos estao preenchidos", () => {
    const alunoCompleto = montarAlunoCompletoPorFase("FASE:HISTORICO_ESCOLAR");
    const resultado = calcularCompletudeHistoricoEscolar(alunoCompleto);

    expect(resultado.status).toBe("completo");
    expect(resultado.totalSeries).toBe(1);
    expect(resultado.totalRegistros).toBe(1);
    expect(resultado.percentual).toBe(100);
  });

  it("retorna ausente quando nenhum campo esta preenchido", () => {
    const resultado = calcularCompletudeHistoricoEscolar({});

    expect(resultado.status).toBe("ausente");
    expect(resultado.totalSeries).toBe(0);
    expect(resultado.totalRegistros).toBe(0);
    expect(resultado.percentual).toBe(0);
    expect(resultado.camposFaltantes?.length).toBeGreaterThan(0);
  });

  it("retorna incompleto quando falta algum campo", () => {
    const alunoCompleto = montarAlunoCompletoPorFase("FASE:HISTORICO_ESCOLAR");
    const historico = alunoCompleto.seriesCursadas?.[0]
      ?.historicos?.[0] as Record<string, unknown> | undefined;
    if (historico) delete historico.componenteCurricular;

    const resultado = calcularCompletudeHistoricoEscolar(alunoCompleto);
    const campos = resultado.camposFaltantes?.map((campo) => campo.campo) ?? [];

    expect(resultado.status).toBe("incompleto");
    expect(resultado.totalSeries).toBe(1);
    expect(resultado.totalRegistros).toBe(1);
    expect(campos).toEqual(expect.arrayContaining(["componenteCurricular"]));
  });
});

describe("calcularCompletudeFase", () => {
  it("retorna ausente quando fase nao possui def-object", () => {
    const resultado = calcularCompletudeFase("FASE:EMISSAO_DOCUMENTOS", {});

    expect(resultado.status).toBe("ausente");
    expect(resultado.totalCampos).toBe(0);
    expect(resultado.camposPreenchidos).toBe(0);
  });

  it("ignora campos sem documentos associados", () => {
    const resultado = calcularCompletudeFase("FASE:DADOS_PESSOAIS", {
      id: "ok",
    });

    expect(resultado.status).toBe("ausente");
    expect(resultado.camposPreenchidos).toBe(0);
  });
});

function montarAlunoCompleto(documentos: DocEmissao[]): DadosAlunoCompleto {
  const aluno: Record<string, unknown> = {};
  const serie: Record<string, unknown> = {};
  const historico: Record<string, unknown> = {};
  let precisaSerie = false;
  let precisaHistorico = false;

  for (const documento of documentos) {
    for (const schema of DEF_OBJECTS) {
      for (const [tabela, campos] of Object.entries(schema)) {
        for (const [campo, docs] of Object.entries(campos)) {
          if (!docs.includes(documento)) continue;

          if (tabela === "Aluno") {
            aluno[campo] = "ok";
            continue;
          }

          if (tabela === "SerieCursada") {
            precisaSerie = true;
            serie[campo] = "ok";
            continue;
          }

          if (tabela === "HistoricoEscolar") {
            precisaHistorico = true;
            historico[campo] = "ok";
          }
        }
      }
    }
  }

  if (!precisaSerie && !precisaHistorico) {
    return aluno;
  }

  const serieCompleta: Record<string, unknown> = {
    ...serie,
  };

  if (precisaHistorico) {
    serieCompleta.historicos = [historico];
  }

  return {
    ...aluno,
    seriesCursadas: [serieCompleta],
  };
}

function montarAlunoCompletoPorFase(fase: Phase): DadosAlunoCompleto {
  const schema = obterSchemaPorFase(fase);
  if (!schema) return {};

  const aluno: Record<string, unknown> = {};
  const serie: Record<string, unknown> = {};
  const historico: Record<string, unknown> = {};
  let precisaSerie = false;
  let precisaHistorico = false;

  for (const [tabela, campos] of Object.entries(schema)) {
    for (const [campo, documentos] of Object.entries(campos)) {
      if (!Array.isArray(documentos) || documentos.length === 0) continue;

      if (tabela === "Aluno") {
        aluno[campo] = "ok";
        continue;
      }

      if (tabela === "SerieCursada") {
        precisaSerie = true;
        serie[campo] = "ok";
        continue;
      }

      if (tabela === "HistoricoEscolar") {
        precisaHistorico = true;
        historico[campo] = "ok";
      }
    }
  }

  if (!precisaSerie && !precisaHistorico) {
    return aluno;
  }

  const serieCompleta: Record<string, unknown> = {
    ...serie,
  };

  if (precisaHistorico) {
    serieCompleta.historicos = [historico];
  }

  return {
    ...aluno,
    seriesCursadas: [serieCompleta],
  };
}

function obterSchemaPorFase(
  fase: Phase
): Record<string, Record<string, DocEmissao[]>> | null {
  if (fase === "FASE:DADOS_PESSOAIS") return dadosPessoais;
  if (fase === "FASE:DADOS_ESCOLARES") return dadosEscolares;
  if (fase === "FASE:HISTORICO_ESCOLAR") return historicoEscolar;
  return null;
}
