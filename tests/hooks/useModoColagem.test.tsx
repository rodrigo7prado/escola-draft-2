import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useModoColagem } from "@/hooks/useModoColagem";
import type { DadosPessoais } from "@/lib/parsing/parseDadosPessoais";

describe("useModoColagem", () => {
  const matricula = "123456789012345";
  const alunoId = "aluno-1";
  const textoColado = `MATRICULA ${matricula}`;

  const dadosMock: DadosPessoais = {
    nome: "Aluno Teste",
    cpf: "11122233344",
  };

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.stubGlobal("fetch", vi.fn());
    vi.stubGlobal("alert", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("executa callback de confirmação após salvar com sucesso", async () => {
    const fetchMock = global.fetch as unknown as ReturnType<typeof vi.fn>;
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          sucesso: true,
          tipoPagina: "dadosPessoais",
          precisaConfirmarSexo: false,
          dados: dadosMock,
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          sucesso: true,
          mensagem: "Salvo",
        }),
      });

    const onDadosConfirmados = vi.fn();
    const { result } = renderHook(() =>
      useModoColagem({ onDadosConfirmados })
    );

    await act(async () => {
      result.current.ativarModoColagem(alunoId);
      await result.current.handlePaste(textoColado, matricula, alunoId);
    });

    await waitFor(() => {
      expect(result.current.dadosParsed).toEqual(dadosMock);
    });

    await act(async () => {
      await result.current.confirmarDados(result.current.dadosParsed!);
    });

    await waitFor(() => {
      expect(onDadosConfirmados).toHaveBeenCalledWith(alunoId);
    });

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
