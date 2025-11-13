import { useEffect, useMemo, useState } from "react";
import type { AlunoCertificacao } from "./useAlunosCertificacao";
import {
  CAMPOS_DADOS_PESSOAIS,
  CAMPOS_DADOS_PESSOAIS_ALIASES,
  type CampoDadosPessoais,
} from "@/lib/importacao/dadosPessoaisMetadata";

export type AlunoDetalhado = {
  id: string;
  matricula: string;
  nome: string | null;
  fonteAusente: boolean;
} & {
  [K in CampoDadosPessoais]?: string | null;
};

export type DadosOriginaisAluno = Record<string, unknown> | null;

export function useAlunoSelecionado() {
  const [alunoSelecionado, setAlunoSelecionado] =
    useState<AlunoCertificacao | null>(null);
  const [alunoDetalhes, setAlunoDetalhes] = useState<AlunoDetalhado | null>(
    null
  );
  const [dadosOriginais, setDadosOriginais] =
    useState<DadosOriginaisAluno>(null);
  const [isLoadingDetalhes, setIsLoadingDetalhes] = useState(false);
  const [erroDetalhes, setErroDetalhes] = useState<string | null>(null);

  const selecionarAluno = (aluno: AlunoCertificacao | null) => {
    setAlunoSelecionado(aluno);
  };

  const limparSelecao = () => {
    setAlunoSelecionado(null);
    setAlunoDetalhes(null);
    setDadosOriginais(null);
    setErroDetalhes(null);
  };

  useEffect(() => {
    if (!alunoSelecionado) {
      setAlunoDetalhes(null);
      setDadosOriginais(null);
      return;
    }

    const controller = new AbortController();
    const carregarDetalhes = async () => {
      setIsLoadingDetalhes(true);
      setErroDetalhes(null);

      try {
        const response = await fetch(
          `/api/alunos?matricula=${alunoSelecionado.matricula}`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error("Erro ao carregar dados completos do aluno");
        }

        const data = await response.json();
        const aluno = data.aluno;
        const original =
          aluno?.dadosOriginais ??
          aluno?.linhaOrigem?.dadosOriginais ??
          null;

        setAlunoDetalhes(mapearAlunoDetalhado(aluno));
        setDadosOriginais(original);
      } catch (error) {
        if (controller.signal.aborted) return;
        console.error("Erro ao carregar aluno detalhado:", error);
        setErroDetalhes(
          error instanceof Error ? error.message : "Erro inesperado"
        );
        setAlunoDetalhes(null);
        setDadosOriginais(null);
      } finally {
        if (!controller.signal.aborted) {
          setIsLoadingDetalhes(false);
        }
      }
    };

    carregarDetalhes();
    return () => controller.abort();
  }, [alunoSelecionado?.matricula]);

  const temAlunoSelecionado = useMemo(
    () => Boolean(alunoSelecionado),
    [alunoSelecionado]
  );

  return {
    alunoSelecionado,
    selecionarAluno,
    limparSelecao,
    temAlunoSelecionado,
    alunoDetalhes,
    dadosOriginais,
    isLoadingDetalhes,
    erroDetalhes,
  };
}

function mapearAlunoDetalhado(raw: Record<string, any> | null): AlunoDetalhado | null {
  if (!raw) return null;

  const resultado: AlunoDetalhado = {
    id: raw.id,
    matricula: raw.matricula,
    nome: raw.nome ?? null,
    fonteAusente: Boolean(raw.fonteAusente),
  };

  for (const campo of CAMPOS_DADOS_PESSOAIS) {
    const alias = CAMPOS_DADOS_PESSOAIS_ALIASES[campo];
    const valorCru =
      raw[campo] ?? (alias ? raw[alias as keyof typeof raw] : undefined);
    resultado[campo] = serializarValor(valorCru);
  }

  return resultado;
}

function serializarValor(valor: unknown): string | null {
  if (valor === null || valor === undefined) {
    return null;
  }

  if (typeof valor === "string") {
    return valor;
  }

  if (valor instanceof Date) {
    return valor.toISOString();
  }

  if (typeof valor === "number" || typeof valor === "boolean") {
    return String(valor);
  }

  try {
    return JSON.stringify(valor);
  } catch {
    return String(valor);
  }
}
