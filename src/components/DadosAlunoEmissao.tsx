"use client";

import { useMemo, useState } from "react";
import { Document, PDFViewer } from "@react-pdf/renderer";
import { Button } from "@/components/ui/Button";
import { Modal, ModalFooter } from "@/components/ui/Modal";
import { CompletudeDocumentos } from "@/components/CompletudeDocumentos";
import { INSTITUICAO_CONFIG } from "@/config/instituicao";
import type {
  AlunoDetalhado,
  SerieCursadaResumo,
} from "@/hooks/useAlunoSelecionado";
import type {
  DadosCertidao,
  DadosCertificado,
  DadosDiploma,
  DadosHistoricoEscolar,
  TipoDocumento,
} from "@/lib/core/data/gestao-alunos/documentos/types";
import {
  calcularCompletudeEmissao,
} from "@/lib/core/data/gestao-alunos/documentos/calcularCompletude";
import type { DocEmissao } from "@/lib/core/data/gestao-alunos/phases.types";
import {
  CertidaoPage,
  TemplateCertidao,
} from "@/components/pdf/templates/TemplateCertidao";
import {
  CertificadoPage,
  TemplateCertificado,
} from "@/components/pdf/templates/TemplateCertificado";
import {
  DiplomaPage,
  TemplateDiploma,
} from "@/components/pdf/templates/TemplateDiploma";
import {
  HistoricoEscolarPage,
  TemplateHistoricoEscolar,
} from "@/components/pdf/templates/TemplateHistoricoEscolar";

type DadosAlunoEmissaoProps = {
  aluno: AlunoDetalhado | null;
  series: SerieCursadaResumo[];
  isLoading: boolean;
  erro?: string | null;
  onNavigateToAba?: (abaId: string) => void;
};

type DocumentoSelecionado = TipoDocumento | "TODOS";

const ALTURA_PREVIEW = "70vh";
const DOC_EMISSAO_POR_TIPO: Record<TipoDocumento, DocEmissao> = {
  CERTIDAO: "Certidão",
  CERTIFICADO: "Certificado",
  DIPLOMA: "Diploma",
  HISTORICO: "Histórico Escolar",
};

// [FEAT:emissao-documentos_TEC1] Modal com PDFViewer para prévia de documentos
export function DadosAlunoEmissao({
  aluno,
  series,
  isLoading,
  erro,
  onNavigateToAba,
}: DadosAlunoEmissaoProps) {
  const [documentoSelecionado, setDocumentoSelecionado] =
    useState<DocumentoSelecionado | null>(null);

  const seriesOrdenadas = useMemo(() => ordenarSeries(series), [series]);
  const serieReferencia = seriesOrdenadas[seriesOrdenadas.length - 1] ?? null;

  const alunoDados = useMemo<Record<string, unknown>>(() => {
    if (!aluno) return {};
    return {
      ...aluno,
      rgOrgaoEmissor:
        (aluno as Record<string, unknown>).rgOrgaoEmissor ?? aluno.orgaoEmissor,
    };
  }, [aluno]);

  const historicosPorSerie = useMemo<Record<string, unknown>[]>(() => {
    const resultado: Record<string, unknown>[] = [];
    for (const serie of seriesOrdenadas) {
      for (const historico of serie.historicos ?? []) {
        resultado.push({
          ...historico,
          serieCursadaId: serie.id,
        });
      }
    }
    return resultado;
  }, [seriesOrdenadas]);

  // [FEAT:emissao-documentos_TEC1.3] Dados combinam aluno, série e metadados institucionais
  const dadosCertidao = useMemo<DadosCertidao>(
    () => ({
      aluno: alunoDados,
      serie: serieReferencia ?? {},
      metadados: INSTITUICAO_CONFIG,
    }),
    [alunoDados, serieReferencia]
  );

  const dadosCertificado = useMemo<DadosCertificado>(
    () => ({
      aluno: alunoDados,
      serie: serieReferencia ?? {},
      conclusao: {},
      metadados: INSTITUICAO_CONFIG,
    }),
    [alunoDados, serieReferencia]
  );

  const dadosDiploma = useMemo<DadosDiploma>(
    () => ({
      aluno: alunoDados,
      serie: serieReferencia ?? {},
      conclusao: {},
      metadados: INSTITUICAO_CONFIG,
    }),
    [alunoDados, serieReferencia]
  );

  const dadosHistorico = useMemo<DadosHistoricoEscolar>(
    () => ({
      aluno: alunoDados,
      series: seriesOrdenadas,
      historicosPorSerie,
      metadados: INSTITUICAO_CONFIG,
    }),
    [alunoDados, seriesOrdenadas, historicosPorSerie]
  );

  // [FEAT:emissao-documentos_TEC7.1] Calcula completude usando def-objects como fonte unica.
  const completudeEmissao = useMemo(
    () =>
      aluno
        ? calcularCompletudeEmissao({
            ...aluno,
            seriesCursadas: series,
          })
        : null,
    [aluno, series]
  );

  // [FEAT:emissao-documentos_TEC1.1] Lista de documentos para impressão individual
  const documentos = useMemo(
    () => [
      {
        tipo: "CERTIDAO" as const,
        titulo: "Certidão",
        descricao: "Conclusão do Ensino Médio (EMR).",
        render: () => <TemplateCertidao dados={dadosCertidao} />,
      },
      {
        tipo: "HISTORICO" as const,
        titulo: "Histórico Escolar",
        descricao: "Disciplinas e resultados do aluno.",
        render: () => <TemplateHistoricoEscolar dados={dadosHistorico} />,
      },
      {
        tipo: "CERTIFICADO" as const,
        titulo: "Certificado",
        descricao: "Certificado de conclusão do Ensino Médio.",
        render: () => <TemplateCertificado dados={dadosCertificado} />,
      },
      {
        tipo: "DIPLOMA" as const,
        titulo: "Diploma",
        descricao: "Diploma do Ensino Médio.",
        render: () => <TemplateDiploma dados={dadosDiploma} />,
      },
    ],
    [dadosCertidao, dadosHistorico, dadosCertificado, dadosDiploma]
  );

  const documentoAtivo =
    documentoSelecionado && documentoSelecionado !== "TODOS"
      ? documentos.find((doc) => doc.tipo === documentoSelecionado)
      : null;

  const modalAberto = documentoSelecionado !== null;
  const tituloModal =
    documentoSelecionado === "TODOS"
      ? "Prévia · Todos os documentos"
      : documentoAtivo
        ? `Prévia · ${documentoAtivo.titulo}`
        : "Prévia";

  // [FEAT:emissao-documentos_TEC1.2] Document combinado com múltiplas páginas para impressão em lote
  const documentoLote = useMemo(
    () => (
      <Document>
        <CertidaoPage dados={dadosCertidao} />
        <HistoricoEscolarPage dados={dadosHistorico} />
        <CertificadoPage dados={dadosCertificado} />
        <DiplomaPage dados={dadosDiploma} />
      </Document>
    ),
    [dadosCertidao, dadosHistorico, dadosCertificado, dadosDiploma]
  );

  const documentoPreview =
    documentoSelecionado === "TODOS"
      ? documentoLote
      : documentoAtivo?.render() ?? null;

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center text-sm text-neutral-500">
        Carregando dados para emissão de documentos...
      </div>
    );
  }

  if (erro) {
    return (
      <div className="h-full flex items-center justify-center text-sm text-red-600 text-center px-6">
        {erro}
      </div>
    );
  }

  if (!aluno) {
    return (
      <div className="text-center py-12 text-neutral-500 text-sm">
        Selecione um aluno para ver emissão de documentos
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col min-h-0">
      <div className="border-b px-4 py-3 flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-neutral-800">
            Emissão de Documentos
          </div>
          <div className="text-xs text-neutral-500">
            Pré-visualize e imprima os documentos do aluno selecionado.
          </div>
        </div>
        {(() => {
          const podeImprimirTodos =
            completudeEmissao?.statusGeral === "completo";
          const tooltipTodos = podeImprimirTodos
            ? "Imprimir todos os documentos completos."
            : "Complete todos os documentos para imprimir em lote.";
          const botaoTodos = (
            <Button
              size="sm"
              disabled={!podeImprimirTodos}
              onClick={() => setDocumentoSelecionado("TODOS")}
            >
              Imprimir todos
            </Button>
          );

          return podeImprimirTodos ? (
            botaoTodos
          ) : (
            <span className="inline-flex" title={tooltipTodos}>
              {botaoTodos}
            </span>
          );
        })()}
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto p-4">
        {completudeEmissao && (
          <div className="mb-4">
            <CompletudeDocumentos
              completude={completudeEmissao}
              onNavigateToAba={onNavigateToAba}
            />
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {documentos.map((documento) => {
            const docEmissao = DOC_EMISSAO_POR_TIPO[documento.tipo];
            const infoDocumento = completudeEmissao?.porDocumento[docEmissao];
            const documentoCompleto = infoDocumento?.status === "completo";
            const tooltipImpressao = documentoCompleto
              ? "Documento completo para impressão."
              : infoDocumento
                ? `Faltam ${infoDocumento.camposFaltantes.length} campos para liberar.`
                : "Complete os dados para liberar a impressão.";

            const botaoImprimir = (
              <Button
                variant="outline"
                size="sm"
                disabled={!documentoCompleto}
                onClick={() => setDocumentoSelecionado(documento.tipo)}
              >
                Imprimir
              </Button>
            );

            return (
              <div
                key={documento.tipo}
                className="border rounded-sm p-4 bg-white flex flex-col gap-3"
              >
                <div>
                  <div className="text-sm font-semibold text-neutral-800">
                    {documento.titulo}
                  </div>
                  <div className="text-xs text-neutral-500">
                    {documento.descricao}
                  </div>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] text-neutral-500">
                    {infoDocumento
                      ? `${infoDocumento.percentual}% completo`
                      : "Prévia disponível"}
                  </span>
                  {documentoCompleto ? (
                    botaoImprimir
                  ) : (
                    <span className="inline-flex" title={tooltipImpressao}>
                      {botaoImprimir}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Modal
        open={modalAberto}
        onClose={() => setDocumentoSelecionado(null)}
        title={tituloModal}
        size="xl"
      >
        {documentoPreview ? (
          <PDFViewer style={{ width: "100%", height: ALTURA_PREVIEW }}>
            {documentoPreview}
          </PDFViewer>
        ) : (
          <div className="text-sm text-neutral-500">
            Não foi possível carregar a prévia do documento.
          </div>
        )}
        <ModalFooter>
          <Button variant="ghost" onClick={() => setDocumentoSelecionado(null)}>
            Fechar
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}

function ordenarSeries(series: SerieCursadaResumo[]) {
  return [...series].sort((a, b) => {
    const anoA = Number.parseInt(a.anoLetivo, 10);
    const anoB = Number.parseInt(b.anoLetivo, 10);
    if (anoA !== anoB) return anoA - anoB;
    const periodoA = a.periodoLetivo ? Number.parseInt(a.periodoLetivo, 10) : 0;
    const periodoB = b.periodoLetivo ? Number.parseInt(b.periodoLetivo, 10) : 0;
    return periodoA - periodoB;
  });
}
