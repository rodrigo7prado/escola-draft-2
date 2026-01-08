import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { DadosHistoricoEscolar } from "@/lib/core/data/gestao-alunos/documentos/types";
import { MAPEAMENTO_LAYOUT_DOCUMENTOS } from "@/lib/core/data/gestao-alunos/documentos/layout";
import { PdfFooterCoordenadoria } from "@/components/pdf/common/PdfFooterCoordenadoria";
import { PdfHeader } from "@/components/pdf/common/PdfHeader";
import { criarEstilosDocumento } from "@/components/pdf/common/styles";
import { formatarData, formatarNumero, getCampoTexto } from "@/components/pdf/common/formatters";

export type TemplateHistoricoEscolarProps = {
  dados: DadosHistoricoEscolar;
};

type SerieLike = Record<string, unknown> & { id?: string | number };

export function TemplateHistoricoEscolar({ dados }: TemplateHistoricoEscolarProps) {
  const layout = MAPEAMENTO_LAYOUT_DOCUMENTOS.HISTORICO;
  const styles = criarEstilosDocumento(layout);
  const tableStyles = criarEstilosTabela();

  const aluno = (dados.aluno ?? {}) as Record<string, unknown>;
  const series = (Array.isArray(dados.series) ? dados.series : []) as SerieLike[];
  const historicos = Array.isArray(dados.historicosPorSerie)
    ? (dados.historicosPorSerie as Record<string, unknown>[]) : [];
  const metadados = dados.metadados;

  const alunoResumo = [
    { label: "Nome", valor: getCampoTexto(aluno, "nome") },
    { label: "Matrícula", valor: getCampoTexto(aluno, "matricula") },
    { label: "Nome Social", valor: getCampoTexto(aluno, "nomeSocial", "-") },
    { label: "Data de Nascimento", valor: formatarData(aluno["dataNascimento"] as string | Date | null, "-") },
    { label: "Sexo", valor: getCampoTexto(aluno, "sexo", "-") },
    { label: "CPF", valor: getCampoTexto(aluno, "cpf", "-") },
  ];

  const historicosPorSerie = new Map<string, Record<string, unknown>[]>();
  const historicosSemSerie: Record<string, unknown>[] = [];

  for (const item of historicos) {
    const serieId = item["serieCursadaId"] ?? item["serieId"];
    if (!serieId) {
      historicosSemSerie.push(item);
      continue;
    }
    const chave = String(serieId);
    if (!historicosPorSerie.has(chave)) {
      historicosPorSerie.set(chave, []);
    }
    historicosPorSerie.get(chave)?.push(item);
  }

  return (
    <Document>
      <Page
        size={[layout.pagina.larguraPt, layout.pagina.alturaPt]}
        style={styles.page}
      >
        <PdfHeader metadados={metadados} styles={styles} />

        <Text style={styles.title}>HISTÓRICO ESCOLAR</Text>

        <View style={tableStyles.infoBox}>
          {alunoResumo.map((item) => (
            <View key={item.label} style={tableStyles.infoItem}>
              <Text style={tableStyles.infoLabel}>{item.label}</Text>
              <Text style={tableStyles.infoValue}>{item.valor}</Text>
            </View>
          ))}
        </View>

        {series.map((serie) => {
          const serieId = String(serie.id ?? "");
          const historicosSerie = historicosPorSerie.get(serieId) ?? [];
          const segmento = getCampoTexto(serie, "segmento", "");
          const serieNome = getCampoTexto(serie, "serie", "");
          const anoLetivo = getCampoTexto(serie, "anoLetivo", "");
          const periodo = getCampoTexto(serie, "periodoLetivo", "");
          const cargaHoraria = formatarNumero(serie["cargaHorariaTotal"] as number | string | null, "-");

          const tituloSerie = [segmento, serieNome].filter(Boolean).join(" · ");

          return (
            <View key={serieId} style={tableStyles.section}>
              <Text style={tableStyles.sectionTitle}>{tituloSerie || "Série"}</Text>
              <Text style={tableStyles.sectionSubtitle}>
                Ano letivo: {anoLetivo} · Período: {periodo} · CH total: {cargaHoraria}
              </Text>

              <View style={tableStyles.table}>
                <View style={tableStyles.rowHeader}>
                  <Text style={tableStyles.cellDisciplina}>Disciplina</Text>
                  <Text style={tableStyles.cellNota}>Pontos</Text>
                  <Text style={tableStyles.cellNota}>CH</Text>
                </View>
                {historicosSerie.map((item, index) => {
                  const disciplina = getCampoTexto(item, "componenteCurricular", "-");
                  const pontos = formatarNumero(item["totalPontos"] as number | string | null, "-");
                  const ch = formatarNumero(item["cargaHoraria"] as number | string | null, "-");
                  const linhaStyle = index % 2 === 0 ? tableStyles.rowEven : tableStyles.rowOdd;

                  return (
                    <View key={`${serieId}-${index}`} style={[tableStyles.row, linhaStyle]}>
                      <Text style={tableStyles.cellDisciplina}>{disciplina}</Text>
                      <Text style={tableStyles.cellNota}>{pontos}</Text>
                      <Text style={tableStyles.cellNota}>{ch}</Text>
                    </View>
                  );
                })}
                {historicosSerie.length === 0 && (
                  <View style={tableStyles.rowEmpty}>
                    <Text style={tableStyles.cellEmpty}>Sem disciplinas registradas.</Text>
                  </View>
                )}
              </View>
            </View>
          );
        })}

        {historicosSemSerie.length > 0 && (
          <View style={tableStyles.section}>
            <Text style={tableStyles.sectionTitle}>Disciplinas (sem série vinculada)</Text>
            <View style={tableStyles.table}>
              <View style={tableStyles.rowHeader}>
                <Text style={tableStyles.cellDisciplina}>Disciplina</Text>
                <Text style={tableStyles.cellNota}>Pontos</Text>
                <Text style={tableStyles.cellNota}>CH</Text>
              </View>
              {historicosSemSerie.map((item, index) => {
                const disciplina = getCampoTexto(item, "componenteCurricular", "-");
                const pontos = formatarNumero(item["totalPontos"] as number | string | null, "-");
                const ch = formatarNumero(item["cargaHoraria"] as number | string | null, "-");
                const linhaStyle = index % 2 === 0 ? tableStyles.rowEven : tableStyles.rowOdd;

                return (
                  <View key={`sem-serie-${index}`} style={[tableStyles.row, linhaStyle]}>
                    <Text style={tableStyles.cellDisciplina}>{disciplina}</Text>
                    <Text style={tableStyles.cellNota}>{pontos}</Text>
                    <Text style={tableStyles.cellNota}>{ch}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        <PdfFooterCoordenadoria metadados={metadados} styles={styles} />
      </Page>
    </Document>
  );
}

function criarEstilosTabela() {
  return StyleSheet.create({
    infoBox: {
      borderWidth: 1,
      borderColor: "#e5e7eb",
      padding: 8,
      marginBottom: 12,
    },
    infoItem: {
      marginBottom: 4,
    },
    infoLabel: {
      fontSize: 9,
      color: "#6b7280",
    },
    infoValue: {
      fontSize: 11,
    },
    section: {
      marginBottom: 12,
    },
    sectionTitle: {
      fontSize: 12,
      fontWeight: 700,
      marginBottom: 2,
    },
    sectionSubtitle: {
      fontSize: 9,
      color: "#6b7280",
      marginBottom: 6,
    },
    table: {
      borderWidth: 1,
      borderColor: "#e5e7eb",
    },
    rowHeader: {
      flexDirection: "row",
      backgroundColor: "#f3f4f6",
      paddingVertical: 4,
      paddingHorizontal: 6,
    },
    row: {
      flexDirection: "row",
      paddingVertical: 3,
      paddingHorizontal: 6,
    },
    rowEven: {
      backgroundColor: "#ffffff",
    },
    rowOdd: {
      backgroundColor: "#f9fafb",
    },
    rowEmpty: {
      padding: 6,
    },
    cellDisciplina: {
      flex: 3,
      fontSize: 9,
    },
    cellNota: {
      flex: 1,
      fontSize: 9,
      textAlign: "right",
    },
    cellEmpty: {
      fontSize: 9,
      color: "#6b7280",
    },
  });
}
