import type { LogicalLine, RawSheetCells } from "@/lib/importer/pipelines/xlsx/types";
import type { KeyBuilderId, ParseResult } from "@/lib/parsers/tipos";

function isPresent(value: unknown): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") return value.trim() !== "";
  return true;
}

function toStringSafe(v: unknown) {
  if (v === undefined || v === null) return undefined;
  return typeof v === "string" ? v : String(v);
}

function pickFirst(obj: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const val = toStringSafe(obj[key]);
    if (val) return val;
  }
  return undefined;
}

type KeyBuilder = (aluno: Record<string, unknown>) => string | undefined;

const keyBuilders: Record<KeyBuilderId, KeyBuilder> = {
  nomeDataNascimento: (aluno) => {
    const nome = pickFirst(aluno, ["nome", "NOME DO ALUNO"]);
    const data = pickFirst(aluno, ["dataNascimento", "DATA DE NASCIMENTO"]);
    if (!nome) return undefined;
    return `${nome}|${data ?? "?"}`;
  },
  nome: (aluno) => pickFirst(aluno, ["nome", "NOME DO ALUNO"]),
};

function resolveKeyBuilder(id?: KeyBuilderId): KeyBuilder {
  if (id && keyBuilders[id]) return keyBuilders[id];
  return keyBuilders.nomeDataNascimento;
}

function validarParseResult(parsed: ParseResult) {
  const missing: string[] = [];

  if (!isPresent((parsed.aluno as any)?.nome)) missing.push("aluno.nome");
  if (!isPresent((parsed.aluno as any)?.dataNascimento)) missing.push("aluno.dataNascimento");

  if (!parsed.series || parsed.series.length === 0) {
    throw new Error("Nenhuma série encontrada na planilha");
  }

  parsed.series.forEach((serie, idx) => {
    const ctx = serie.contexto || {};
    const requiredContext = ["anoLetivo", "periodoLetivo", "curso", "serie", "turma", "turno", "escola"];
    requiredContext.forEach((key) => {
      if (!isPresent((ctx as any)[key])) {
        missing.push(`series[${idx}].contexto.${key}`);
      }
    });
  });

  const totalDisciplinas = parsed.series.reduce(
    (sum, serie) => sum + (serie.disciplinas?.length ?? 0),
    0
  );
  const hasResumo = parsed.series.some((serie) =>
    Object.values(serie.resumo ?? {}).some((v) => isPresent(v))
  );

  if (missing.length) {
    throw new Error(`Campos obrigatórios ausentes: ${missing.join(", ")}`);
  }

  if (totalDisciplinas === 0 && !hasResumo) {
    throw new Error("Cabeçalho da tabela não encontrado ou nenhuma disciplina/resumo lido");
  }
}

export function serializarFichaDisciplina(
  parsed: ParseResult,
  opts: { selectedKeyId?: KeyBuilderId; rawSheets?: RawSheetCells[] }
): LogicalLine[] {
  validarParseResult(parsed);

  const builder = resolveKeyBuilder(opts.selectedKeyId);
  const baseKey = builder(parsed.aluno);
  const linhas: LogicalLine[] = [];

  const sheets = opts.rawSheets;
  if (sheets && sheets.length) {
    for (const sheet of sheets) {
      linhas.push({
        dadosOriginais: {
          sheet: sheet.name,
          cells: sheet.cells,
        },
        identificadorChave: baseKey,
      });
    }
    return linhas;
  }

  // Fallback: estrutura baseada em séries/disciplinas extraídas
  for (const serie of parsed.series) {
    if (!serie.disciplinas.length) {
      linhas.push({
        dadosOriginais: {
          aluno: parsed.aluno,
          contexto: serie.contexto,
          resumo: serie.resumo,
          disciplina: null,
        },
        identificadorChave: baseKey,
      });
      continue;
    }

    for (const disciplina of serie.disciplinas) {
      linhas.push({
        dadosOriginais: {
          aluno: parsed.aluno,
          contexto: serie.contexto,
          resumo: serie.resumo,
          disciplina,
        },
        identificadorChave: baseKey,
      });
    }
  }

  return linhas;
}
