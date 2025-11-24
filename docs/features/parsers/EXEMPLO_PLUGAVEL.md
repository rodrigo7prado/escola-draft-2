Exemplo de pipeline plugável onde a variação vem do mapeamento, não do código fixo.
Orquestração fixa; adaptadores por formato leem estratégias declaradas no mapeamento.
```typescript
type Formato = "CSV" | "XML" | "TXT" | "XLSX";

type EstrategiaCSV =
  | { estrategia: "LABEL"; label: string }
  | { estrategia: "ORDEM_FIXA"; indice: number }
  | { estrategia: "HEADER_REGEX"; regexCabecalho: RegExp }
  | { estrategia: "RESOLVER"; resolver: (ctx: { cabecalho: string[]; linha: string[] }) => unknown };

type CampoConfig = {
  extracao: {
    CSV?: EstrategiaCSV;
    // Outros formatos poderiam receber estratégias análogas (XML/XLSX/TXT).
  };
  normalizacao?: {
    tipo: "REGEX" | "FUNCAO";
    regex?: RegExp;
    func?: (valor: unknown) => unknown;
  };
};

type MapeamentoParser = {
  parserNome: string;
  formatosSuportados: Formato[];
  campos: Record<string, CampoConfig>;
};

const mapeamentoExemplo: MapeamentoParser = {
  parserNome: "importacaoFichaIndividualHistorico",
  formatosSuportados: ["CSV"],
  campos: {
    ALUNO: {
      extracao: { CSV: { estrategia: "LABEL", label: "ALUNO" } },
      normalizacao: { tipo: "FUNCAO", func: (v) => (typeof v === "string" ? v.trim() : v) },
    },
    TURMA: {
      extracao: { CSV: { estrategia: "HEADER_REGEX", regexCabecalho: /turma/i } },
    },
    ANO_LETIVO: {
      extracao: { CSV: { estrategia: "ORDEM_FIXA", indice: 2 } },
      normalizacao: { tipo: "REGEX", regex: /\d{4}/ },
    },
    CODIGO_INTERNO: {
      extracao: {
        CSV: {
          estrategia: "RESOLVER",
          resolver: ({ cabecalho, linha }) => {
            // Lógica específica declarada no mapeamento.
            const idx = cabecalho.findIndex((h) => /cod.*interno/i.test(h));
            return idx >= 0 ? linha[idx] : null;
          },
        },
      },
    },
  },
};

async function executarParser(map: MapeamentoParser, input: Buffer, formato: Formato) {
  if (!map.formatosSuportados.includes(formato)) {
    throw new Error(`Formato não suportado: ${formato}`);
  }

  const extraido = extrair(map, input, formato);
  const normalizado = normalizar(map, extraido);
  await persistir(map.parserNome, normalizado);
  return normalizado;
}

function extrair(map: MapeamentoParser, input: Buffer, formato: Formato) {
  if (formato !== "CSV") throw new Error(`Extração não implementada para ${formato}`);

  const [cabecalhoRaw, primeiraLinhaRaw] = input.toString("utf8").split("\n");
  if (!cabecalhoRaw || !primeiraLinhaRaw) throw new Error("CSV inválido ou vazio");
  const cabecalho = cabecalhoRaw.split(",").map((c) => c.trim());
  const linha = primeiraLinhaRaw.split(",").map((c) => c.trim());

  const resultado: Record<string, unknown> = {};

  for (const [campo, cfg] of Object.entries(map.campos)) {
    const estrategia = cfg.extracao.CSV;
    if (!estrategia) throw new Error(`Sem estratégia CSV para campo ${campo}`);

    switch (estrategia.estrategia) {
      case "LABEL": {
        const idx = cabecalho.indexOf(estrategia.label);
        if (idx === -1) throw new Error(`Campo ausente no CSV: ${estrategia.label}`);
        resultado[campo] = linha[idx];
        break;
      }
      case "ORDEM_FIXA": {
        const idx = estrategia.indice;
        if (idx < 0 || idx >= linha.length) throw new Error(`Índice fora do CSV para ${campo}`);
        resultado[campo] = linha[idx];
        break;
      }
      case "HEADER_REGEX": {
        const idx = cabecalho.findIndex((h) => estrategia.regexCabecalho.test(h));
        if (idx === -1) throw new Error(`Cabeçalho não encontrado via regex para ${campo}`);
        resultado[campo] = linha[idx];
        break;
      }
      case "RESOLVER": {
        resultado[campo] = estrategia.resolver({ cabecalho, linha });
        break;
      }
      default:
        throw new Error(`Estratégia CSV desconhecida para ${campo}`);
    }
  }

  return resultado;
}

function normalizar(map: MapeamentoParser, dados: Record<string, unknown>) {
  const normalizado: Record<string, unknown> = {};

  for (const [campo, valor] of Object.entries(dados)) {
    const norm = map.campos[campo]?.normalizacao;
    if (!norm) {
      normalizado[campo] = valor;
      continue;
    }

    if (norm.tipo === "REGEX" && norm.regex) {
      const match = typeof valor === "string" ? valor.match(norm.regex) : null;
      if (!match) throw new Error(`Normalização falhou para campo ${campo}`);
      normalizado[campo] = match[0];
    } else if (norm.tipo === "FUNCAO" && norm.func) {
      normalizado[campo] = norm.func(valor);
    } else {
      throw new Error(`Normalização inválida para campo ${campo}`);
    }
  }

  return normalizado;
}

async function persistir(parserNome: string, payload: Record<string, unknown>) {
  console.log(`Persistindo ${parserNome}:`, payload);
}

async function exemplo() {
  const csv = Buffer.from("ALUNO,TURMA,ANO LETIVO,COD_INT\nMaria,3A,2023,ABC123");
  await executarParser(mapeamentoExemplo, csv, "CSV");
}

// Não executa automaticamente; descomente para testar manualmente.
// exemplo();
```