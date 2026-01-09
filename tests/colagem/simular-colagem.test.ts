import { describe, expect, it } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { detectarTipoPagina } from "@/lib/parsing/detectarTipoPagina";
import { parseDadosPessoais } from "@/lib/parsing/parseDadosPessoais";
import { parseDadosEscolares } from "@/lib/parsing/parseDadosEscolares";
import { extrairMatriculaDoTexto } from "@/lib/parsing/extrairMatriculaDoTexto";
import {
  schemaSalvarDadosEscolares,
  schemaSalvarDadosPessoais,
} from "@/lib/importacao/schemas";

const __dirname = dirname(fileURLToPath(import.meta.url));
const FIXTURE_PATH = join(
  __dirname,
  "..",
  "fixtures",
  "colagem",
  "colagem.txt"
);
const DEFAULT_ALUNO_ID = "00000000-0000-4000-8000-000000000000";

function parseDataBrSemHora(valor: string): Date | null {
  const match = valor.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return null;
  const [, dia, mes, ano] = match;
  const date = new Date(`${ano}-${mes}-${dia}`);
  return Number.isNaN(date.getTime()) ? null : date;
}

describe("simular colagem (sem persistencia)", () => {
  it("processa a colagem informada via env", () => {
    if (!existsSync(FIXTURE_PATH)) {
      throw new Error(`Arquivo de colagem nao encontrado: ${FIXTURE_PATH}`);
    }

    const texto = readFileSync(FIXTURE_PATH, "utf8");
    const nome = "colagem.txt";

    const alunoId = DEFAULT_ALUNO_ID;
    const matriculaDetectada = extrairMatriculaDoTexto(texto);

    const erros: string[] = [];
    let tipoPagina: ReturnType<typeof detectarTipoPagina> = null;

    try {
      tipoPagina = detectarTipoPagina(texto);
    } catch (error) {
      const mensagem = error instanceof Error ? error.message : "Erro desconhecido";
      erros.push(`Falha ao detectar tipo de pagina: ${mensagem}`);
    }

    if (!tipoPagina) {
      erros.push("Tipo de pagina nao detectado.");
    }

    if (!matriculaDetectada) {
      erros.push("Matricula nao encontrada no texto.");
    }

    if (tipoPagina === "dadosPessoais") {
      const dados = parseDadosPessoais(texto);
      const payload = { alunoId, textoBruto: texto, dados };

      const validacao = schemaSalvarDadosPessoais.safeParse(payload);
      if (!validacao.success) {
        erros.push(
          `Validacao dados pessoais falhou: ${validacao.error.issues[0]?.message}`
        );
      }

      const datas: Array<[string, string | undefined]> = [
        ["dataNascimento", dados.dataNascimento],
        ["dataEmissaoRG", dados.dataEmissaoRG],
        ["dataEmissaoCertidao", dados.dataEmissaoCertidao],
      ];

      datas.forEach(([campo, valor]) => {
        if (!valor) return;
        const parsed = parseDataBrSemHora(valor);
        if (!parsed) {
          erros.push(`Data invalida para ${campo}: "${valor}"`);
        }
      });

      console.log(
        JSON.stringify(
          {
            fixture: nome,
            tipoPagina,
            matriculaDetectada,
            alunoId,
            camposDetectados: Object.keys(dados).filter(
              (chave) => dados[chave as keyof typeof dados] !== undefined
            ),
          },
          null,
          2
        )
      );
    }

    if (tipoPagina === "dadosEscolares") {
      const matriculaParser = matriculaDetectada || undefined;
      const dados = parseDadosEscolares(texto, matriculaParser);
      const payload = { alunoId, textoBruto: texto, dados };

      const validacao = schemaSalvarDadosEscolares.safeParse(payload);
      if (!validacao.success) {
        erros.push(
          `Validacao dados escolares falhou: ${validacao.error.issues[0]?.message}`
        );
      }

      if (dados.alunoInfo.dataInclusao) {
        const parsed = new Date(dados.alunoInfo.dataInclusao);
        if (Number.isNaN(parsed.getTime())) {
          erros.push(
            `Data de inclusao invalida para JS Date: "${dados.alunoInfo.dataInclusao}"`
          );
        }
      }

      console.log(
        JSON.stringify(
          {
            fixture: nome,
            tipoPagina,
            matriculaDetectada,
            alunoId,
            alunoInfo: dados.alunoInfo,
            totalSeries: dados.series.length,
            avisos: dados.avisos,
          },
          null,
          2
        )
      );
    }

    if (!tipoPagina) {
      erros.push("Nao foi possivel processar a colagem.");
    }

    if (erros.length > 0) {
      throw new Error(erros.join("\n"));
    }

    expect(erros).toHaveLength(0);
  });
});
