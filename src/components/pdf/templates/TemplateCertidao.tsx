// [FEAT:emissao-documentos_TEC2] Uso de @react-pdf/renderer para geração de PDFs
import { Document, Page, Text } from "@react-pdf/renderer";
import type { DadosCertidao } from "@/lib/core/data/gestao-alunos/documentos/types";
// [FEAT:emissao-documentos_TEC4] Layout centralizado em MAPEAMENTO_LAYOUT_DOCUMENTOS
import { MAPEAMENTO_LAYOUT_DOCUMENTOS } from "@/lib/core/data/gestao-alunos/documentos/layout";
// [FEAT:emissao-documentos_TEC5] Componentes PDF comuns reutilizados
import { PdfAssinaturas } from "@/components/pdf/common/PdfAssinaturas";
import { PdfFooterCoordenadoria } from "@/components/pdf/common/PdfFooterCoordenadoria";
import { PdfHeader } from "@/components/pdf/common/PdfHeader";
import { criarEstilosDocumento } from "@/components/pdf/common/styles";
// [FEAT:emissao-documentos_TEC6] Formatters centralizados para consistência
import { formatarData, getCampoTexto } from "@/components/pdf/common/formatters";

export type TemplateCertidaoProps = {
  dados: DadosCertidao;
};

export function CertidaoPage({ dados }: TemplateCertidaoProps) {
  const layout = MAPEAMENTO_LAYOUT_DOCUMENTOS.CERTIDAO;
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

  const registroNumero = getCampoTexto(null, "registroNumero");
  const registroFolha = getCampoTexto(null, "registroFolha");
  const livro = metadados.livros.CERTIDAO || getCampoTexto(null, "livro");
  const localEmissao = "Rio de Janeiro";
  const dataEmissao = getCampoTexto(null, "dataEmissao");

  const corpo =
    `Em cumprimento ao art. 24, inciso VII da ${leiLdb} e a ${resolucao}, CERTIFICO que, ` +
    `verificando o arquivo escolar, consta que ${nome}, brasileiro(a), portador(a) da ` +
    `identidade n° ${rg}, expedido pelo(a) ${rgOrgao}, filho(a) de ${nomeMae} e ${nomePai}, ` +
    `natural do(e) ${naturalidade}, nascido(a) em ${dataNascimento}, concluiu em ${dataConclusao} ` +
    `o ${segmento}, autorizado nos termos do ${decreto}. Assim sendo, é expedida a presente ` +
    `CERTIDÃO, que satisfaz as exigências legais, em conformidade com a Constituição do Estado ` +
    `do Rio de Janeiro – Art. 12, inciso II, a fim de que ${nome} possa gozar de todos os direitos ` +
    `e prerrogativas legais. E, por ser verdade, é lavrada a presente CERTIDÃO, que dato e assino.`;

  const registro =
    `Esta Certidão foi registrada sob o nº ${registroNumero}, em fls. ${registroFolha}, ` +
    `do livro nº ${livro} desta U.E.`;

  return (
    <Page
      size={[layout.pagina.larguraPt, layout.pagina.alturaPt]}
      style={styles.page}
    >
      <PdfHeader metadados={metadados} styles={styles} />

      <Text style={styles.title}>CERTIDÃO</Text>
      <Text style={styles.paragraph}>{corpo}</Text>
      <Text style={styles.paragraph}>{registro}</Text>
      <Text style={styles.paragraphBold}>OBSERVAÇÃO: {observacao}</Text>
      <Text style={styles.paragraphRight}>
        {localEmissao}, {dataEmissao}.
      </Text>

      <PdfAssinaturas metadados={metadados} styles={styles} />
      <PdfFooterCoordenadoria metadados={metadados} styles={styles} />
    </Page>
  );
}

export function TemplateCertidao({ dados }: TemplateCertidaoProps) {
  return (
    <Document>
      <CertidaoPage dados={dados} />
    </Document>
  );
}
