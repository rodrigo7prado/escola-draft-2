import { Text, View } from "@react-pdf/renderer";
import type { MetadadosInstituicao } from "@/config/instituicao";

type PdfAssinaturasProps = {
  metadados: MetadadosInstituicao;
  styles: Record<string, any>;
};

export function PdfAssinaturas({ metadados, styles }: PdfAssinaturasProps) {
  const secretaria = metadados.secretariaEscolar || "Secretária Escolar";
  const diretor = metadados.diretor || "Diretor";

  return (
    <View style={styles.assinaturaBloco}>
      <Text style={styles.assinaturaLinha}>Confere</Text>
      <Text style={styles.assinaturaNome}>{secretaria}</Text>
      <Text style={styles.assinaturaLinha}>Visto</Text>
      <Text style={styles.assinaturaNome}>{diretor}</Text>
    </View>
  );
}
