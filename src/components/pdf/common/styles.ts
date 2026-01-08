import { StyleSheet } from "@react-pdf/renderer";
import type { LayoutDocumento } from "@/lib/core/data/gestao-alunos/documentos/layout";

export const criarEstilosDocumento = (layout: LayoutDocumento) =>
  StyleSheet.create({
    page: {
      paddingTop: layout.margensPt.superior,
      paddingBottom: layout.margensPt.inferior,
      paddingLeft: layout.margensPt.esquerda,
      paddingRight: layout.margensPt.direita,
      fontSize: layout.fontesPt.corpo,
      fontFamily: "Helvetica",
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 12,
    },
    headerCol: {
      flex: 1,
      textAlign: "center",
    },
    headerText: {
      fontSize: layout.fontesPt.subtitulo,
      textAlign: "center",
    },
    headerNome: {
      fontSize: layout.fontesPt.subtitulo,
      textAlign: "center",
      fontWeight: 700,
    },
    brasao: {
      width: 32,
      height: 32,
    },
    title: {
      fontSize: layout.fontesPt.titulo,
      textAlign: "center",
      fontWeight: 700,
      marginBottom: 12,
    },
    paragraph: {
      fontSize: layout.fontesPt.corpo,
      lineHeight: layout.espacamentoEntreLinhas,
      textAlign: layout.alinhamento.corpo,
      marginBottom: 8,
    },
    paragraphBold: {
      fontSize: layout.fontesPt.corpo,
      lineHeight: layout.espacamentoEntreLinhas,
      textAlign: layout.alinhamento.corpo,
      fontWeight: 700,
      marginBottom: 8,
    },
    paragraphRight: {
      fontSize: layout.fontesPt.corpo,
      textAlign: "right",
      marginTop: 6,
      marginBottom: 6,
    },
    footer: {
      marginTop: 16,
    },
    footerTitle: {
      fontSize: layout.fontesPt.rodape,
      textAlign: "center",
    },
    footerText: {
      fontSize: layout.fontesPt.rodape,
      textAlign: "center",
      marginTop: 2,
    },
    assinaturaBloco: {
      marginTop: 10,
    },
    assinaturaLinha: {
      fontSize: layout.fontesPt.assinatura,
      textAlign: "left",
      marginBottom: 2,
    },
    assinaturaNome: {
      fontSize: layout.fontesPt.assinatura,
      textAlign: "center",
    },
    assinaturaCargo: {
      fontSize: layout.fontesPt.assinatura,
      textAlign: "center",
    },
    small: {
      fontSize: layout.fontesPt.rodape,
    },
  });
