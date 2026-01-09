import dadosEscolares from "@/lib/core/data/gestao-alunos/def-objects/dadosEscolares";
import dadosPessoais from "@/lib/core/data/gestao-alunos/def-objects/dadosPessoais";
import historicoEscolar from "@/lib/core/data/gestao-alunos/def-objects/historicoEscolar";
import {
  calcularCompletudeDadosEscolares,
  calcularCompletudeDocumento,
  calcularCompletudeEmissao,
  calcularCompletudeHistoricoEscolar,
  validarTriplaSerieMedio,
  type DadosAlunoCompleto,
} from "@/lib/core/data/gestao-alunos/documentos/calcularCompletude";
import type { DocEmissao } from "@/lib/core/data/gestao-alunos/phases.types";

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

describe("calcularCompletudeDadosEscolares", () => {
  it("retorna completo quando todos os slots estao preenchidos", () => {
    const aluno: DadosAlunoCompleto = {
      situacaoEscolar: "Ativo",
      motivoEncerramento: "Concluido",
      seriesCursadas: [
        { anoLetivo: "2020", segmento: "-" },
        { anoLetivo: "2021", segmento: "MÉDIO" },
        { anoLetivo: "2022", segmento: "MÉDIO" },
      ],
    };

    const resultado = calcularCompletudeDadosEscolares(aluno);

    expect(resultado.status).toBe("completo");
    expect(resultado.percentual).toBe(100);
    expect(resultado.camposPreenchidos).toBe(3);
    expect(resultado.camposFaltantes).toHaveLength(0);
  });

  it("retorna ausente quando nenhum slot esta preenchido", () => {
    const aluno: DadosAlunoCompleto = {
      situacaoEscolar: " ",
      motivoEncerramento: null,
      seriesCursadas: [],
    };

    const resultado = calcularCompletudeDadosEscolares(aluno);

    expect(resultado.status).toBe("ausente");
    expect(resultado.percentual).toBe(0);
    expect(resultado.camposPreenchidos).toBe(0);
    expect(resultado.camposFaltantes).toHaveLength(3);
  });

  it("retorna incompleto quando ha slots parciais", () => {
    const aluno: DadosAlunoCompleto = {
      situacaoEscolar: "Ativo",
      motivoEncerramento: null,
      seriesCursadas: [{ anoLetivo: "2021", segmento: "-" }],
    };

    const resultado = calcularCompletudeDadosEscolares(aluno);
    const campos = resultado.camposFaltantes?.map((campo) => campo.campo) ?? [];

    expect(resultado.status).toBe("incompleto");
    expect(resultado.percentual).toBe(33);
    expect(resultado.camposPreenchidos).toBe(1);
    expect(campos).toEqual(
      expect.arrayContaining(["motivoEncerramento", "triplaSerieMedio"])
    );
  });
});

describe("calcularCompletudeHistoricoEscolar", () => {
  it("retorna completo quando ha historicos para 3 series", () => {
    const aluno: DadosAlunoCompleto = {
      seriesCursadas: [
        { historicos: [{}, {}] },
        { historicos: [{}] },
        { _count: { historicos: 2 } },
      ],
    };

    const resultado = calcularCompletudeHistoricoEscolar(aluno);

    expect(resultado.status).toBe("completo");
    expect(resultado.totalSeries).toBe(3);
    expect(resultado.totalRegistros).toBe(5);
    expect(resultado.percentual).toBe(100);
  });

  it("retorna ausente quando nao ha historicos", () => {
    const resultado = calcularCompletudeHistoricoEscolar({ seriesCursadas: [] });

    expect(resultado.status).toBe("ausente");
    expect(resultado.totalSeries).toBe(0);
    expect(resultado.totalRegistros).toBe(0);
    expect(resultado.percentual).toBe(0);
    expect(resultado.camposFaltantes).toHaveLength(1);
  });

  it("retorna incompleto quando ha historicos para 2 series", () => {
    const resultado = calcularCompletudeHistoricoEscolar({
      seriesCursadas: [{ historicos: [{}] }, { historicos: [{}, {}] }],
    });

    expect(resultado.status).toBe("incompleto");
    expect(resultado.totalSeries).toBe(2);
    expect(resultado.totalRegistros).toBe(3);
    expect(resultado.percentual).toBe(67);
  });
});

describe("validarTriplaSerieMedio", () => {
  it("retorna true para 1 serie '-' e 2 series 'MÉDIO'", () => {
    const series = [
      { anoLetivo: "2020", segmento: "-" },
      { anoLetivo: "2021", segmento: "MÉDIO" },
      { anoLetivo: "2022", segmento: "MÉDIO" },
    ];

    expect(validarTriplaSerieMedio(series)).toBe(true);
  });

  it("retorna false para 3 series 'MÉDIO'", () => {
    const series = [
      { anoLetivo: "2020", segmento: "MÉDIO" },
      { anoLetivo: "2021", segmento: "MÉDIO" },
      { anoLetivo: "2022", segmento: "MÉDIO" },
    ];

    expect(validarTriplaSerieMedio(series)).toBe(false);
  });

  it("retorna false quando ha menos de 3 series", () => {
    const series = [
      { anoLetivo: "2020", segmento: "-" },
      { anoLetivo: "2021", segmento: "MÉDIO" },
    ];

    expect(validarTriplaSerieMedio(series)).toBe(false);
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
