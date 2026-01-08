import { render, screen, waitFor } from "@testing-library/react";
import { SWRConfig } from "swr";
import { vi } from "vitest";
import { ListaAlunosCertificacao } from "@/components/ListaAlunosCertificacao";
import type {
  AlunoCertificacao,
  ResumoDadosPessoaisTurma,
} from "@/hooks/useAlunosCertificacao";
import { useAlunosCertificacao } from "@/hooks/useAlunosCertificacao";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.resetAllMocks();
});

describe("Integracao emissao documentos", () => {
  it("useAlunosCertificacao expõe progressoEmissaoDocumentos", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        alunos: [
          {
            id: "1",
            matricula: "2024001",
            nome: "Aluno Teste",
            cpf: null,
            origemTipo: "manual",
            fonteAusente: false,
            seriesCursadas: [],
          },
        ],
      }),
    });

    vi.stubGlobal("fetch", fetchMock);

    function HookConsumer() {
      const { alunos } = useAlunosCertificacao({
        anoLetivo: "2024",
        turma: "",
      });

      if (alunos.length === 0) return <div>vazio</div>;

      return (
        <div>
          {alunos[0].progressoEmissaoDocumentos.statusGeral}
        </div>
      );
    }

    render(
      <SWRConfig value={{ provider: () => new Map() }}>
        <HookConsumer />
      </SWRConfig>
    );

    await waitFor(() => {
      expect(screen.getByText("ausente")).toBeInTheDocument();
    });
  });

  it("lista de alunos exibe status dinamico de emissao", () => {
    const aluno: AlunoCertificacao = {
      id: "1",
      matricula: "2024001",
      nome: "Aluno Teste",
      cpf: null,
      origemTipo: "manual",
      fonteAusente: false,
      progressoDadosPessoais: {
        totalCampos: 10,
        camposPreenchidos: 5,
        percentual: 50,
        completo: false,
        pendentes: [],
      },
      progressoDadosEscolares: {
        totalSlots: 3,
        slotsPreenchidos: 1,
        percentual: 33,
        completo: false,
        status: "incompleto",
      },
      progressoHistoricoEscolar: {
        totalRegistros: 0,
        totalSeries: 0,
        status: "ausente",
        completo: false,
      },
      progressoEmissaoDocumentos: {
        statusGeral: "incompleto",
        documentosProntos: 1,
        totalDocumentos: 4,
        porDocumento: {
          "Certidão": {
            documento: "Certidão",
            status: "completo",
            percentual: 100,
            camposPreenchidos: 3,
            totalCampos: 3,
            camposFaltantes: [],
          },
          "Certificado": {
            documento: "Certificado",
            status: "ausente",
            percentual: 0,
            camposPreenchidos: 0,
            totalCampos: 3,
            camposFaltantes: [],
          },
          "Diploma": {
            documento: "Diploma",
            status: "ausente",
            percentual: 0,
            camposPreenchidos: 0,
            totalCampos: 3,
            camposFaltantes: [],
          },
          "Histórico Escolar": {
            documento: "Histórico Escolar",
            status: "ausente",
            percentual: 0,
            camposPreenchidos: 0,
            totalCampos: 3,
            camposFaltantes: [],
          },
        },
      },
    };

    const resumo: ResumoDadosPessoaisTurma = {
      total: 1,
      completos: 0,
      pendentes: 1,
      percentualGeral: 0,
    };

    render(
      <ListaAlunosCertificacao
        filtros={{ anoLetivo: "2024", turma: "" }}
        alunoSelecionadoId={null}
        onSelecionarAluno={() => undefined}
        alunoIdModoColagemAtivo={null}
        onToggleModoColagem={() => undefined}
        alunos={[aluno]}
        isLoading={false}
        isAtualizando={false}
        error={null}
        totalAlunos={1}
        resumoDadosPessoais={resumo}
      />
    );

    expect(screen.getByText("1/4")).toBeInTheDocument();
  });
});
