import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  beforeEach,
  vi,
} from "vitest";
import { NextRequest } from "next/server";
import {
  setupTestDatabase,
  clearTestDatabase,
  teardownTestDatabase,
  seedTestData,
  getTestPrisma,
} from "../../helpers/db-setup";

const PARSE_RESULT_MOCK = {
  alunoInfo: {
    situacao: "POSSUI CONFIRMACAO",
    causaEncerramento: "Transferido",
    motivoEncerramento: "mudanca",
    recebeOutroEspaco: "nao",
    anoIngresso: 2022,
    periodoIngresso: 1,
    dataInclusao: "2022-02-01",
    tipoIngresso: "NOVATO",
    redeOrigem: "REDE PUBLICA",
    matrizCurricular: "BASICA",
  },
  series: [
    {
      anoLetivo: "2024",
      periodoLetivo: "1",
      unidadeEnsino: "EE TESTE",
      codigoEscola: "12345",
      modalidade: "REGULAR",
      segmento: "FUNDAMENTAL",
      curso: "ANOS INICIAIS",
      serie: "3",
      turno: "M",
      situacao: "POSSUI CONFIRMACAO",
      tipoVaga: "VAGA DE CONTINUIDADE",
      matrizCurricular: "BASICA",
      dataInclusaoAluno: "2024-02-01",
      redeEnsinoOrigem: "REDE PUBLICA",
      ensinoReligioso: null,
      linguaEstrangeira: null,
      textoBrutoOrigemId: undefined,
    },
  ],
  textoLimpo: "bloco escolar limpo",
  avisos: [],
};

describe("POST /api/importacao-estruturada (dados escolares)", () => {
  let importRoute: typeof import("@/app/api/importacao-estruturada/route").POST;
  let salvarEscolaresRoute: typeof import("@/app/api/importacao-estruturada/salvar-dados-escolares/route").POST;

  beforeAll(async () => {
    await setupTestDatabase();

    vi.doMock("@/lib/prisma", () => ({
      prisma: getTestPrisma(),
    }));

    vi.doMock("@/lib/parsing/detectarTipoPagina", () => ({
      detectarTipoPagina: vi.fn(() => "dadosEscolares" as const),
    }));

    vi.doMock("@/lib/parsing/parseDadosEscolares", () => ({
      parseDadosEscolares: vi.fn(() => PARSE_RESULT_MOCK),
    }));

    ({ POST: importRoute } = await import("@/app/api/importacao-estruturada/route"));
    ({ POST: salvarEscolaresRoute } = await import(
      "@/app/api/importacao-estruturada/salvar-dados-escolares/route"
    ));
  });

  afterAll(async () => {
    await teardownTestDatabase();
    vi.resetModules();
    vi.clearAllMocks();
  });

  beforeEach(async () => {
    await clearTestDatabase();
  });

  it("deve salvar dados escolares e substituir séries cursadas", async () => {
    const prisma = getTestPrisma();
    const { alunoId } = await seedTestData();
    const aluno = await prisma.aluno.findUnique({
      where: { id: alunoId },
      select: { matricula: true },
    });

    expect(aluno?.matricula).toBeDefined();
    const payload = {
      texto: "Texto escolar suficiente para passar na validação",
      matricula: aluno!.matricula,
      alunoId,
    };

    const request = new NextRequest(
      new Request("http://localhost/api/importacao-estruturada", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
    );

    const response = await importRoute(request);
    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.sucesso).toBe(true);
    expect(json.tipoPagina).toBe("dadosEscolares");
    expect(json.dados.series?.length).toBe(1);

    // Persistir dados escolares (passo de confirmação)
    const salvarRequest = new NextRequest(
      new Request("http://localhost/api/importacao-estruturada/salvar-dados-escolares", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          alunoId,
          textoBruto: payload.texto,
          dados: json.dados,
        }),
      })
    );

    const salvarResponse = await salvarEscolaresRoute(salvarRequest);
    expect(salvarResponse.status).toBe(200);
    const salvarJson = await salvarResponse.json();
    expect(salvarJson.sucesso).toBe(true);

    const alunoAtualizado = await prisma.aluno.findUnique({
      where: { id: alunoId },
      select: {
        situacaoEscolar: true,
        causaEncerramentoEscolar: true,
        motivoEncerramento: true,
        recebeOutroEspacoEscolar: true,
        anoIngressoEscolar: true,
        periodoIngressoEscolar: true,
        dadosOriginais: true,
      },
    });

    expect(alunoAtualizado?.situacaoEscolar).toBe(PARSE_RESULT_MOCK.alunoInfo.situacao);
    expect(alunoAtualizado?.causaEncerramentoEscolar).toBe(
      PARSE_RESULT_MOCK.alunoInfo.causaEncerramento
    );
    expect(alunoAtualizado?.motivoEncerramento).toBe(
      PARSE_RESULT_MOCK.alunoInfo.motivoEncerramento
    );
    expect(alunoAtualizado?.recebeOutroEspacoEscolar).toBe(
      PARSE_RESULT_MOCK.alunoInfo.recebeOutroEspaco
    );
    expect(alunoAtualizado?.anoIngressoEscolar).toBe(
      PARSE_RESULT_MOCK.alunoInfo.anoIngresso
    );
    expect(alunoAtualizado?.periodoIngressoEscolar).toBe(
      PARSE_RESULT_MOCK.alunoInfo.periodoIngresso
    );
    expect((alunoAtualizado?.dadosOriginais as any)?.tipoImportacao).toBe(
      "dadosEscolares"
    );

    const series = await prisma.serieCursada.findMany({
      where: { alunoMatricula: aluno!.matricula },
    });
    expect(series.length).toBe(1);
    expect(series[0].anoLetivo).toBe(PARSE_RESULT_MOCK.series[0].anoLetivo);
    expect(series[0].modalidade).toBe(PARSE_RESULT_MOCK.series[0].modalidade);
    expect(series[0].turno).toBe(PARSE_RESULT_MOCK.series[0].turno);
    expect(series[0].situacao).toBe(PARSE_RESULT_MOCK.series[0].situacao);
    expect(series[0].tipoVaga).toBe(PARSE_RESULT_MOCK.series[0].tipoVaga);
  });
});
