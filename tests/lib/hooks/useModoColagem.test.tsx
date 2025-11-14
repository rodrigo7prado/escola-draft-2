import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useModoColagem } from "@/hooks/useModoColagem";

describe("useModoColagem - bloqueio por matrícula", () => {
  beforeEach(() => {
    vi.spyOn(global, "fetch").mockResolvedValue({
      json: async () => ({}),
    } as Response);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const setup = () => renderHook(() => useModoColagem());

  it("bloqueia quando não encontra matrícula no texto", async () => {
    const { result } = setup();

    await act(async () => {
      await result.current.handlePaste("texto sem matrícula", "123456789012345", "aluno-1");
    });

    expect(result.current.erro).toMatch(/não encontramos a matrícula/i);
    expect(result.current.modalAberto).toBe(false);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("bloqueia quando matrícula detectada não bate com aluno selecionado", async () => {
    const texto = "Dados do aluno\nMATRÍCULA: 111111111111111\n...";

    const { result } = setup();

    await act(async () => {
      await result.current.handlePaste(texto, "222222222222222", "aluno-1");
    });

    expect(result.current.erro).toMatch(/diferente do aluno selecionado/i);
    expect(result.current.modalAberto).toBe(false);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("permite colagem quando matrícula bate", async () => {
    const texto = "MATRÍCULA: 123456789012345\n...";
    const { result } = setup();

    await act(async () => {
      await result.current.handlePaste(texto, "123456789012345", "aluno-1");
    });

    expect(fetch).toHaveBeenCalledTimes(1);
  });
});
