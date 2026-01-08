import dadosEscolares from "@/lib/core/data/gestao-alunos/def-objects/dadosEscolares";
import dadosPessoais from "@/lib/core/data/gestao-alunos/def-objects/dadosPessoais";
import historicoEscolar from "@/lib/core/data/gestao-alunos/def-objects/historicoEscolar";
import {
  calcularCompletudeDocumento,
  calcularCompletudeEmissao,
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
