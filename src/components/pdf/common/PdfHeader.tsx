import { Image, Text, View } from "@react-pdf/renderer";
import type { MetadadosInstituicao } from "@/config/instituicao";

type PdfHeaderProps = {
  metadados: MetadadosInstituicao;
  styles: Record<string, any>;
};

export function PdfHeader({ metadados, styles }: PdfHeaderProps) {
  const brasil = metadados.brasoes?.brasil;
  const rj = metadados.brasoes?.rj;

  return (
    <View style={styles.header}>
      {brasil ? <Image src={brasil} style={styles.brasao} /> : <View style={styles.brasao} />}

      <View style={styles.headerCol}>
        <Text style={styles.headerText}>{metadados.governo}</Text>
        <Text style={styles.headerText}>{metadados.secretaria}</Text>
        <Text style={styles.headerNome}>{metadados.nome}</Text>
      </View>

      {rj ? <Image src={rj} style={styles.brasao} /> : <View style={styles.brasao} />}
    </View>
  );
}
