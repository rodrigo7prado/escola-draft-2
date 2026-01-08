import { Text, View } from "@react-pdf/renderer";
import type { MetadadosInstituicao } from "@/config/instituicao";

type PdfFooterCoordenadoriaProps = {
  metadados: MetadadosInstituicao;
  styles: Record<string, any>;
};

export function PdfFooterCoordenadoria({ metadados, styles }: PdfFooterCoordenadoriaProps) {
  const regional = metadados.regional ? ` – ${metadados.regional}` : "";
  const texto = `${metadados.coordenadoria}${regional}, verificada a documentação escolar, declaro a regularidade dos estudos realizados, nos termos da legislação em vigor.`;

  return (
    <View style={styles.footer}>
      <Text style={styles.footerTitle}>{metadados.governo}</Text>
      <Text style={styles.footerTitle}>{metadados.secretaria}</Text>
      <Text style={styles.footerText}>{texto}</Text>
      <Text style={styles.footerText}>Assinatura e Matrícula</Text>
    </View>
  );
}
