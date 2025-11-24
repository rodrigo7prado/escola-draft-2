# Documentação Técnica para Parsers de Importação de Dados
Toda implementação de parser passará por um objeto de configuração, tal como:
```typescript
  type Formato = "CSV" | "XML" | "TXT" | "XLSX";

  type ParserConfig = {
    parserNome: string;
    formatosSuportados: Formato[];
    listaCampos: string[];
  }

  const parserConfig: ParserConfig = {
    parserNome: "ataResultadosFinais",
    formatosSuportados: ["CSV"],
    listaCampos: ["ALUNO", "TURMA" /*, outros campos */],
  }
  ```
## As fases do Parser
Todo parser deverá ter as fases executadas em funções separadas para cada etapa do pipeline:
1. Extração
  Função responsável: `extrairDados`

  Para o caso da fase de extração, o parser deve suportar múltiplos formatos de entrada (CSV, XML, TXT, XLSX). Cada formato pode ter regras específicas para a extração dos dados conforme o mapeamento definido.
  
  Após a fase de extração, o formato de origem não importa mais. A partir de então, o parser deve aplicar regras mais gerais para as fases subsequentes.
  
2. Normalização (opcional)
  Função responsável: `normalizarDados`

3. Persistência
  Função responsável: `persistirDados`

## Estrutura do Mapeamento de Campos

### FASE DE EXTRAÇÃO
#### EXTRAÇÃO POR FORMATO
O parser deve lidar com múltiplos formatos de entrada (CSV, XML, TXT, XLSX) e cada formato pode ter regras específicas em cada fase do parser.
  #### Formato CSV
  label: nome do campo conforme aparece no CSV

  #### Formato XML
  *Aviso: o formato XML ainda não foi implementado*

  #### Formato XLSX
  Tipo de extração:\
    1. "Dado XLSX": quando o campo é extraído da parte XLSX do arquivo XLSX;\
    2. "Dado XML": quando o campo é extraído do XML interno do XLSX.

  Label:\
    - Se tipoExtracao for "Dado XLSX": deve corresponder exatamente ao nome do campo na parte XLSX do arquivo XLSX.\
    - Se tipoExtracao for "Dado XML": pode ser um rótulo do XML interno do XLSX.
  
  #### Formato TXT
  Extração de campo:\
    metodoExtracao: "REGEX_PURO" | "ISOLAMENTO_POR_BLOCOS"\
    label: regex para localizar o campo no TXT;\
    valor: regex para extrair o valor do campo no TXT.
  
  Extração de tabela:\
    listaDeCampos: array de campos a serem extraídos;\
    mapeamentoCabecalhos: mapeamento entre a lista de campos e os cabeçalhos da tabela no TXT;

### FASE DE NORMALIZAÇÃO (OPCIONAL)
  tipoNormalizacao: "REGEX"\
  regexNormalizacao: expressão regular para normalizar o valor extraído.

### FASE DE PERSISTÊNCIA
  **vinculoModeloDados**: booleano que indica se há vínculo com o modelo de dados.\
  **tipoVinculo**: "gravação" | "vinculação" | "validação" | "composição"\
  **modeloDadosRelacionado**: nome do modelo de dados ao qual o campo está vinculado.\
  **campoBancoDados**: nome do campo no banco de dados onde o valor será armazenado ou referenciado.
