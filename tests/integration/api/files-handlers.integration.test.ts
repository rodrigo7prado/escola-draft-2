/**
 * Testes de integração exercitando os handlers gerados por createCsvRouteHandlers.
 * Garante que POST/GET/DELETE estão usando o profile declarativo e persistindo/consultando
 * de forma consistente com a UI.
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { createCsvRouteHandlers } from "@/lib/importer/csv/handlers";
import { alunosCsvProfile } from "@/lib/importer/profiles/alunosCsvProfile";
import { CSV_VALIDO_3_ALUNOS, parseCsvLoose } from "../../helpers/csv-fixtures";
import {
  setupTestDatabase,
  teardownTestDatabase,
  clearTestDatabase,
  getTestPrisma,
  contarRegistros,
} from "../../helpers/db-setup";

function makePostRequest(body: unknown) {
  return {
    url: "http://localhost/api/files",
    async json() {
      return body;
    },
  } as any;
}

function makeDeleteRequest(query: string) {
  return {
    url: `http://localhost/api/files${query}`,
  } as any;
}

describe("API handlers via createCsvRouteHandlers", () => {
  let handlers: ReturnType<typeof createCsvRouteHandlers>;

  beforeAll(async () => {
    await setupTestDatabase();
    handlers = createCsvRouteHandlers({
      prisma: getTestPrisma(),
      profile: alunosCsvProfile,
      deleteScopes: { byId: true, byPeriod: true },
    });
  });

  afterAll(async () => {
    await teardownTestDatabase();
  });

  beforeEach(async () => {
    await clearTestDatabase();
  });

  it("POST deve importar e persistir Arquivo, Linhas, Alunos e Enturmações", async () => {
    const csvData = parseCsvLoose(CSV_VALIDO_3_ALUNOS);
    const req = makePostRequest({ data: csvData, fileName: "ata.csv" });

    const res = await handlers.POST(req);
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.linhasImportadas).toBe(csvData.rows.length);

    const counts = await contarRegistros();
    expect(counts.arquivos).toBe(1);
    expect(counts.linhas).toBe(csvData.rows.length);
    expect(counts.alunos).toBe(csvData.rows.length);
    expect(counts.enturmacoes).toBe(csvData.rows.length);
  });

  it("POST deve retornar 409 e fileId em caso de hash duplicado", async () => {
    const csvData = parseCsvLoose(CSV_VALIDO_3_ALUNOS);
    const req = makePostRequest({ data: csvData, fileName: "ata.csv" });

    const res1 = await handlers.POST(req);
    const body1 = await res1.json();
    expect(res1.status).toBe(201);
    const firstFileId = body1.arquivo.id;

    const res2 = await handlers.POST(req);
    expect(res2.status).toBe(409);
    const body2 = await res2.json();
    expect(body2.fileId).toBe(firstFileId);
  });

  it("GET deve refletir alunos no banco (pendentes = 0) após importação", async () => {
    const csvData = parseCsvLoose(CSV_VALIDO_3_ALUNOS);
    const req = makePostRequest({ data: csvData, fileName: "ata.csv" });
    const res = await handlers.POST(req);
    expect(res.status).toBe(201);

    const getRes = await handlers.GET();
    expect(getRes.status).toBe(200);
    const body = await getRes.json();

    expect(body.periodos).toBeInstanceOf(Array);
    expect(body.periodos).not.toHaveLength(0);
    const resumo = body.periodos[0].resumo;
    expect(resumo.totalAlunosCSV).toBe(csvData.rows.length);
    expect(resumo.totalAlunosBanco).toBe(csvData.rows.length);
    expect(resumo.pendentes).toBe(0);
  });

  it("DELETE por id deve remover registros e marcar fonte ausente", async () => {
    const csvData = parseCsvLoose(CSV_VALIDO_3_ALUNOS);
    const postRes = await handlers.POST(makePostRequest({ data: csvData, fileName: "ata.csv" }));
    expect(postRes.status).toBe(201);
    const body = await postRes.json();
    const fileId = body.arquivo.id;

    const deleteRes = await handlers.DELETE(makeDeleteRequest(`?id=${fileId}`));
    expect(deleteRes.status).toBe(200);
    const counts = await contarRegistros();
    expect(counts.arquivos).toBe(0);
    expect(counts.linhas).toBe(0);
  });

  it("DELETE por período deve apagar arquivos daquele ano", async () => {
    const csvData = parseCsvLoose(CSV_VALIDO_3_ALUNOS);
    const postRes = await handlers.POST(makePostRequest({ data: csvData, fileName: "ata-2024.csv" }));
    expect(postRes.status).toBe(201);

    const deleteRes = await handlers.DELETE(makeDeleteRequest(`?periodo=2024`));
    expect(deleteRes.status).toBe(200);

    const counts = await contarRegistros();
    expect(counts.arquivos).toBe(0);
    expect(counts.linhas).toBe(0);
    expect(counts.alunos).toBe(0);
    expect(counts.enturmacoes).toBe(0);
  });

  it("POST deve rejeitar payload sem data ou fileName", async () => {
    const badReq1 = makePostRequest({ fileName: "ata.csv" });
    const res1 = await handlers.POST(badReq1);
    expect(res1.status).toBe(400);

    const badReq2 = makePostRequest({ data: parseCsvLoose(CSV_VALIDO_3_ALUNOS) });
    const res2 = await handlers.POST(badReq2);
    expect(res2.status).toBe(400);
  });

  it("GET deve marcar pendentes quando não há enturmações existentes", async () => {
    const prisma = getTestPrisma();
    const csvData = parseCsvLoose(CSV_VALIDO_3_ALUNOS);
    const postRes = await handlers.POST(makePostRequest({ data: csvData, fileName: "ata.csv" }));
    expect(postRes.status).toBe(201);

    // Remove enturmações para simular ausência no banco
    await prisma.enturmacao.deleteMany();

    const getRes = await handlers.GET();
    expect(getRes.status).toBe(200);
    const body = await getRes.json();
    const resumo = body.periodos[0].resumo;
    expect(resumo.totalAlunosCSV).toBe(csvData.rows.length);
    expect(resumo.totalAlunosBanco).toBe(0);
    expect(resumo.pendentes).toBe(csvData.rows.length);
  });
});
