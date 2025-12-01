```typescript
import { ModeloDeDados } from "../../../src/lib/mapeamentos/models.type";

/**
 * Motivo de existir e de diferenciação entre valores:
 * - "Dado XLSX": Indica que o campo é extraído de um arquivo XLSX (Excel).
 * - "Dado XML": Indica que o campo é extraído de um arquivo XML.
 */
type TipoExtracao = "Dado XLSX" | "Dado XML";

/**
 * Metadados para o Agente de IA.
 */
type IAMetaDados = {
  /**
 * Descrição do campo para o Agente de IA. A situação ideia é sempre não precisar dessa descrição,
 * mas em alguns casos específicos de implementação incompleta pode ser útil fornecer mais contexto.
 */
  descricaoCampo?: string;
}

type RegexNormalizacao = {
  regex: string;
  /* Instrução para o Agente de IA sobre como aplicar a regex de normalização */
  instrucaoIA: string;
}

type TYPE_EXTRACAO = {
  tipoExtracao: TipoExtracao;
  /**
   * Rótulo do campo na interface do usuário:
   * - Se Dado XLSX: Deve corresponder exatamente ao nome do campo no arquivo XLSX.
   * - Se Dado XML: Pode ser um rótulo do XML.
   */
  label: string;
  regexNormalizacao?: RegexNormalizacao;
}

type TYPE_PERSISTENCIA = {
  /**
   * Indica se há vínculo com o modelo de dados.
   */
  vinculoModeloDados: boolean;
}

/**
 * Propriedades comuns a todos os campos.
 */
type CampoPropsBase = {
  EXTRACAO: TYPE_EXTRACAO;
  PERSISTENCIA: TYPE_PERSISTENCIA;
  iaMeta?: IAMetaDados;
}

/**
 * Campos NÃO vinculados ao modelo de dados.
 */
type CampoNaoVinculado = CampoPropsBase & {
  PERSISTENCIA: {
    vinculoModeloDados: false;
  }
}

/**
 * Campos vinculados ao modelo de dados.
 */
type CampoVinculadoBase = CampoPropsBase & {
  PERSISTENCIA: {
    vinculoModeloDados: true;
    tipoVinculoModeloDados: TipoVinculoModeloDados; // Tipo de vínculo com o modelo de dados
  }
}

/**
 * Campos vinculados do tipo 'composição' NÃO possuem vínculo direto com campos no banco de dados.
 */
type CampoVinculadoComposicao = CampoVinculadoBase & {
  PERSISTENCIA: {
    vinculoModeloDados: true;
    tipoVinculoModeloDados: 'composição';
  }
}

/**
 * Campos vinculados que NÃO são do tipo 'composição' POSSUEM vínculo direto com campos no banco de dados.
 */
type CampoVinculadoNaoComposicao = CampoVinculadoBase & {
  PERSISTENCIA: {
    vinculoModeloDados: true;
    tipoVinculoModeloDados: Exclude<TipoVinculoModeloDados, 'composição'>; // 'gravação' | 'vinculação' | 'validação'
    campoNoBancoDeDados: string; // Nome do campo no modelo de dados
    modeloDeDados: ModeloDeDados;  // Nome da tabela ou entidade no modelo de dados do Prisma,
  }
}

/**
 * Campos vinculados ao modelo de dados, podendo ser do tipo 'composição' ou não.
 */
type CampoVinculado = CampoVinculadoComposicao | CampoVinculadoNaoComposicao;

/**
 * União de todos os tipos de campos.
 */
export type Campo = CampoVinculado | CampoNaoVinculado;
```