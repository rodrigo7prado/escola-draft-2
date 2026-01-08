import { Document, Page, Text } from "@react-pdf/renderer";
import type { DadosCertificado } from "@/lib/core/data/gestao-alunos/documentos/types";
import { MAPEAMENTO_LAYOUT_DOCUMENTOS } from "@/lib/core/data/gestao-alunos/documentos/layout";
import { PdfAssinaturas } from "@/components/pdf/common/PdfAssinaturas";
import { PdfFooterCoordenadoria } from "@/components/pdf/common/PdfFooterCoordenadoria";
import { PdfHeader } from "@/components/pdf/common/PdfHeader";
import { criarEstilosDocumento } from "@/components/pdf/common/styles";
import {
  formatarData,
  formatarNumero,
  getCampoTexto,
} from "@/components/pdf/common/formatters";

export type TemplateCertificadoProps = {
  dados: DadosCertificado;
};

export function TemplateCertificado({ dados }: TemplateCertificadoProps) {
  const layout = MAPEAMENTO_LAYOUT_DOCUMENTOS.CERTIFICADO;
  const styles = criarEstilosDocumento(layout);

  const aluno = (dados.aluno ?? {}) as Record<string, unknown>;
  const serie = (dados.serie ?? {}) as Record<string, unknown>;
  const metadados = dados.metadados;

  const nome = getCampoTexto(aluno, "nome");
  const rg = getCampoTexto(aluno, "rg");
  const rgOrgao = getCampoTexto(aluno, "rgOrgaoEmissor");
  const nomeMae = getCampoTexto(aluno, "nomeMae");
  const nomePai = getCampoTexto(aluno, "nomePai");
  const naturalidade = getCampoTexto(aluno, "naturalidade");
  const dataNascimento = formatarData(aluno["dataNascimento"] as string | Date | null);
  const dataConclusao = formatarData(aluno["dataConclusaoEnsinoMedio"] as string | Date | null);
  const segmento = getCampoTexto(serie, "segmento", "ENSINO MÉDIO");

  const leiLdb = metadados.legislacao.leiLDB;
  const resolucao = metadados.legislacao.resolucaoSEEDUC;
  const decreto = metadados.legislacao.decretos.EMR;
  const observacao = getCampoTexto(aluno, "observacoes", "Não se aplica");

  const cargaHoraria = formatarNumero(serie["cargaHorariaTotal"] as number | string | null);
  const livro = metadados.livros.CERTIFICADO || getCampoTexto(null, "livro");

  const registroNumero = getCampoTexto(null, "registroNumero");
  const registroFolha = getCampoTexto(null, "registroFolha");
  const localEmissao = "Rio de Janeiro";
  const dataEmissao = getCampoTexto(null, "dataEmissao");

  const corpo =
    `O Diretor do ${metadados.nome}, em cumprimento ao art. 24, inciso VII da ${leiLdb} e a ` +
    `${resolucao}, confere a ${nome}, brasileiro(a), portador(a) da identidade n° ${rg}, ` +
    `expedido pelo(a) ${rgOrgao}, filho(a) de ${nomeMae} e ${nomePai}, natural do(e) ` +
    `${naturalidade}, nascido(a) em ${dataNascimento}, o presente CERTIFICADO pela conclusão ` +
    `do ${segmento}, autorizado nos termos do ${decreto}, com carga horária total de ` +
    `${cargaHoraria} horas/aula, que correspondem a ${cargaHoraria} horas, concluído em ` +
    `${dataConclusao}, a fim de que ${nome} possa gozar de todos os direitos e prerrogativas ` +
    `legais. E, por ser verdade, é lavrado o presente CERTIFICADO, que dato e assino.`;

  const registro =
    `Este Certificado foi registrado sob o nº ${registroNumero} em fls ${registroFolha}, ` +
    `do livro nº ${livro} desta U.E.`;

  return (
    <Document>
      <Page
        size={[layout.pagina.larguraPt, layout.pagina.alturaPt]}
        style={styles.page}
      >
        <PdfHeader metadados={metadados} styles={styles} />

        <Text style={styles.title}>CERTIFICADO</Text>
        <Text style={styles.paragraph}>{corpo}</Text>
        <Text style={styles.paragraph}>{registro}</Text>
        <Text style={styles.paragraphBold}>OBSERVAÇÃO: {observacao}</Text>
        <Text style={styles.paragraphRight}>
          {localEmissao}, {dataEmissao}.
        </Text>

        <PdfAssinaturas metadados={metadados} styles={styles} />
        <PdfFooterCoordenadoria metadados={metadados} styles={styles} />
      </Page>
    </Document>
  );
}
