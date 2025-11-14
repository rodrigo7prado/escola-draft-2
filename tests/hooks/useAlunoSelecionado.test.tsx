import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useAlunoSelecionado } from "@/hooks/useAlunoSelecionado";
import type { AlunoDetalhado } from "@/hooks/useAlunoSelecionado";
import type { AlunoCertificacao } from "@/hooks/useAlunosCertificacao";

const alunoBase: AlunoCertificacao = {
  id: "aluno-1",
  matricula: "123456789012345",
  nome: "Aluno Teste",
  cpf: "00011122233",
  origemTipo: "csv",
  fonteAusente: false,
  progressoDadosPessoais: {
    completo: false,
    percentual: 10,
    totalCampos: 32,
    camposPreenchidos: 3,
  },
};

function mockFetchSequence(responses: Array<Record<string, unknown>>) {
  const fetchMock = vi.fn();
  responses.forEach((payload) => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => payload,
    });
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

describe("useAlunoSelecionado", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("revalida dados após refreshAlunoSelecionado", async () => {
    const dadosInicial: AlunoDetalhado = {
      id: alunoBase.id,
      matricula: alunoBase.matricula,
      nome: "Versão Antiga",
      fonteAusente: false,
    };

    const dadosAtualizado: AlunoDetalhado = {
      ...dadosInicial,
      nome: "Versão Nova",
    };

    const dadosOriginais = { NOME: "Origem" };

    mockFetchSequence([
      { aluno: { ...dadosInicial, dadosOriginais } },
      { aluno: { ...dadosAtualizado, dadosOriginais } },
    ]);

    const { result } = renderHook(() => useAlunoSelecionado());

    act(() => {
      result.current.selecionarAluno(alunoBase);
    });

    await waitFor(() => {
      expect(result.current.alunoDetalhes?.nome).toBe("Versão Antiga");
    });

    await act(async () => {
      await result.current.refreshAlunoSelecionado();
    });

    await waitFor(() => {
      expect(result.current.alunoDetalhes?.nome).toBe("Versão Nova");
    });
  });
});
