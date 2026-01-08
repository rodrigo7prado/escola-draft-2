*Para uso das IAs*

# CHECKPOINTS DE SESSÕES DE TRABALHO

---

## Sessão 1 (Preparação e Setup Inicial) - Feature: Emissão de Documentos

### Componentes DRY Usados
- Nenhum (sessão inicial)

### Observação sobre DRY
Esta sessão cria código específico da feature (configuração de metadados e tipos TypeScript). Não são componentes DRY reutilizáveis, apenas estruturas de dados específicas para emissão de documentos. Componentes DRY só devem ser criados quando o padrão aparece 2+ vezes.

### Checkpoints

[ ] CP1: Instalar e configurar bibliotecas necessárias
  [x] CP1.1: Instalar biblioteca de geração de PDF
    [x] TEC1.1.1: Executar `pnpm add @react-pdf/renderer`
    [x] TEC1.1.2: `@react-pdf/renderer` já inclui tipos (`index.d.ts`), sem necessidade de `@types/react-pdf`
    [x] TEC1.1.3: Peer dependency suporta React 19 (compatível com Next.js 16)
  [x] CP1.2: Instalar biblioteca de geração de DOCX
    [x] TEC1.2.1: Pesquisar biblioteca adequada (sugestão: `docx`)
    [x] TEC1.2.2: Executar `pnpm add docx`
    [x] TEC1.2.3: README confirma uso em React/Node com exemplos
  [ ] CP1.3: Instalar bibliotecas auxiliares se necessário
    [ ] TEC1.3.1: Para merge de PDFs: `pnpm add pdf-lib` (se necessário)
    [ ] TEC1.3.2: Para manipulação de imagens: verificar se precisa de biblioteca adicional

[x] CP2: Criar arquivo de configuração de metadados institucionais
  [x] CP2.1: Criar arquivo de configuração
    [x] TEC2.1.1: Localização: `/src/config/instituicao.ts`
    [x] TEC2.1.2: Exportar constante `INSTITUICAO_CONFIG`
    [x] TEC2.1.3: Incluir campos: nome, governo, secretaria, diretor, secretariaEscolar, coordenadoria, regional, cnpj, endereco
  [x] CP2.2: Definir tipo TypeScript para metadados
    [x] TEC2.2.1: Criar tipo `MetadadosInstituicao` com todos os campos
    [x] TEC2.2.2: Incluir tipo `Legislacao` com: leiLDB, resolucaoSEEDUC, decretos (objeto com chaves por modalidade)
    [x] TEC2.2.3: Incluir tipo `Brasoes` com caminhos para imagens
  [x] CP2.3: Preencher dados de exemplo (conforme modelo PDF)
    [x] TEC2.3.1: `governo: "Governo do Estado do Rio de Janeiro"`
    [x] TEC2.3.2: `secretaria: "Secretaria de Estado de Educação"`
    [x] TEC2.3.3: `nome: "COLÉGIO ESTADUAL SENOR ABRAVANEL"`
    [x] TEC2.3.4: `coordenadoria: "Coordenadoria de Inspeção Escolar"`
    [x] TEC2.3.5: `regional: "Regional Metropolitana VI"`
    [x] TEC2.3.6: Legislação:
      - `leiLDB: "Lei Federal nº 9.394/1996"`
      - `resolucaoSEEDUC: "Resolução SEEDUC nº 6.346/2025"`
      - `decretos.EMR: "Decreto nº 804 de 15 de julho de 1976"`
      - `decretos.NEJA: "Decreto nº 43.723/2012"`
      - `decretos.DIPLOMA: "Decreto nº 43.723/2012"`
    [x] TEC2.3.7: Livros de registro:
      - `livros.CERTIDAO: "1-A"`
      - `livros.CERTIFICADO: "57-A"`
      - `livros.DIPLOMA: "25"`
  [x] CP2.4: Configurar caminhos para imagens
    [x] TEC2.4.1: `brasoes.brasil: "/documentos-emissao/brasoes/brasao-brasil.jpg"`
    [x] TEC2.4.2: `brasoes.rj: "/documentos-emissao/brasoes/brasao-rj.jpg"`
    [x] TEC2.4.3: Imagens movidas para `/public/documentos-emissao/brasoes`

[x] CP3: Criar estrutura de tipos TypeScript para documentos
  [x] CP3.1: Criar arquivo de tipos
    [x] TEC3.1.1: Localização: `/src/lib/core/data/gestao-alunos/documentos/types.ts`
    [x] TEC3.1.2: Exportar `type TipoDocumento = "CERTIDAO" | "CERTIFICADO" | "HISTORICO" | "DIPLOMA"`
    [x] TEC3.1.3: Exportar `type StatusDisponibilidade = "disponivel" | "indisponivel" | "parcial"`
  [x] CP3.2: Definir tipos para dados de cada documento
    [x] TEC3.2.1: Criar `interface DadosCertidao` com campos: aluno (dados básicos), serie (dados da série cursada), metadados (instituição)
    [x] TEC3.2.2: Criar `interface DadosCertificado` estendendo DadosCertidao + campos de conclusão
    [x] TEC3.2.3: Criar `interface DadosDiploma` similar a DadosCertificado
    [x] TEC3.2.4: Criar `interface DadosHistoricoEscolar` com: aluno, series[], historicosPorSerie[], metadados
  [x] CP3.3: Definir tipo para resultado de validação
    [x] TEC3.3.1: Criar `interface ResultadoValidacao` com: disponivel, percentual, camposFaltantes[]
    [x] TEC3.3.2: Criar `interface CampoFaltante` com: campo, label, categoria, abaId

---

## Sessão 2 (Análise de Modelos e Atualização de def-objects) - Feature: Emissão de Documentos

### Referências Usadas
- Modelos oficiais em PDF:
  - Certidão: `/docs/templates/arquivosDeExemplo/documentosEmissao/EMR Certidão Modelo 2025.pdf`
  - Certificado: `/docs/templates/arquivosDeExemplo/documentosEmissao/EMR Certificado Modelo 2025.pdf`
  - Diploma: `/docs/templates/arquivosDeExemplo/documentosEmissao/Diploma Modelo 2025.pdf`
- Referência de Componente React:
  - Histórico Escolar: `/src/components/DadosAlunoHistorico.tsx`

- Def-objects: Objeto de Definição de Campos:
  - Localização: `/src/lib/core/data/gestao-alunos/def-objects/`
  - Arquivos: `dadosPessoais.ts`, `dadosEscolares.ts`, `historicoEscolar.ts`
- Os objetos definidores de campos importados referenciam dentro deles o Documento em questão.

### Checkpoints para def-objects dos Documentos: Certidão, Certificado, Diploma e Histórico Escolar

[x] TEC4: Para o caso do Histórico Escolar, adaptar os checkpoints conforme necessário (baseado em DadosAlunoHistorico.tsx)

[x] CP4: Analisar modelos PDF (ou componente React) e mapear campos para def-objects
  [x] CP4.1: Registrar mapeamento dos campos do documento para def-objects

[x] CP5: Procedimento detalhado para cada documento:
  [x] TEC5.1: Abrir e estudar modelo oficial
  [x] TEC5.2: Identificar TODOS os campos variáveis (marcados como XXXXXXXXXX, similar ou análogo)
  [x] TEC5.3: Criar objeto de associação entre esses campos e os de Def-objects
    [x] TEC5.3.1: Mapeamento registrado em `docs/features/emissao-documentos/MAPEAMENTO.md`
  [x] TEC5.4: Verificar alinhamento com def-objects
    [x] TEC5.4.1: Para CADA campo mapeado, verificar se existe no def-object correspondente
    [x] TEC5.4.2: Se campo NAO existe, documentar discrepancia (pode indicar necessidade de atualizacao do schema)
    [x] TEC5.4.3: Preparar lista final de campos que serao atualizados

[x] CP6: Atualizar def-objects com campos de Documento em questão
  [x] CP6.1: Atualizar dadosPessoais.ts
    [x] TEC6.1.1: Para CADA campo do Aluno identificado no CP5.2, adicionar "Certidão" ao array existente
    [x] TEC6.1.2: Exemplo: `nome: [...arrayAtual, "Certidão"]`
    [x] TEC6.1.3: Exemplo: `rg: [...arrayAtual, "Certidão"]`
    [x] TEC6.1.4: IMPORTANTE: Não remover valores existentes, apenas adicionar "Certidão", ou o outro documento em questão
  [x] CP6.2: E assim fazer para atualizar dadosEscolares.ts e historicoEscolar.ts se necessário

[x] CP7: Repetir o processo para os outros documentos (Certificado e Diploma)
  [x] TEC7.1: Seguir o mesmo procedimento detalhado no CP5
  [x] TEC7.2: Atualizar def-objects conforme necessário
  [x] TEC7.3: Check nos quatro documentos:
    [x] TEC7.3.1: Certidão
    [x] TEC7.3.2: Certificado
    [x] TEC7.3.3: Diploma
    [x] TEC7.3.4: Histórico Escolar

### Checkpoints para DEFINIÇÃO DE LAYOUT dos Documentos

[x] CP8: Criar um objeto com os quatro documentos para DEFINIÇÃO DE LAYOUT:
  [x] TEC8.1: Avaliar cuidadosamente o Modelo PDF de cada documento
  [x] TEC8.2: Identificar os campos variáveis em cada modelo
  [x] TEC8.3: Mapear esses campos para os campos existentes nos def-objects
  [x] TEC8.4: Documentar o mapeamento no objeto TypeScript
    [x] TEC8.4.1: Arquivo criado em `src/lib/core/data/gestao-alunos/documentos/layout.ts`
    [x] TEC8.4.2: Estrutura sugerida (referencia):
      ```typescript
      interface MapeamentoLayoutDocumento {
        [tipoDocumento: string]: {
          margemLateral?: number;
          EspacamentoEntreLinhas?: number;
          ... // demais estilos específicos por documento
        }[];
      }
      const MAPEAMENTO_LAYOUT_DOCUMENTOS: MapeamentoLayoutDocumento = {
        CERTIDAO: [
          { margemLateral: 20, EspacamentoEntreLinhas: 1.5 },
          ...
        ],
        CERTIFICADO: [
          { margemLateral: 25, EspacamentoEntreLinhas: 1.6 },
          ...
        ],
        ...
      };
      ```

[x] CP9: Definir diretivas de layout específicas para cada documento
  [x] TEC9.1: Para cada documento, definir:
    [x] TEC9.1.1: Margens (superior, inferior, lateral)
    [x] TEC9.1.2: Espaçamento entre linhas
    [x] TEC9.1.3: Tamanhos de fonte para títulos, subtítulos, corpo do texto
    [x] TEC9.1.4: Alinhamento de texto (justificado, centralizado, etc.)
    [x] TEC9.1.5: Estilos de cabeçalho e rodapé (incluir brasões, informações institucionais)
  [x] TEC9.2: Documentar essas diretivas no objeto MAPEAMENTO_LAYOUT_DOCUMENTOS

[x] CP10: Criar estrutura de pastas para componentes PDF e aplicar componentização segundo as diretivas de layout
  [x] TEC10.1: Criar pastas
    [x] TEC10.1.1: `/src/components/pdf/` (pasta raiz)
    [x] TEC10.1.2: `/src/components/pdf/common/` (componentes comuns)
    [x] TEC10.1.3: `/src/components/pdf/templates/` (templates de documentos)

[ ] CP11: Enfim construir os templates de cada documento

---

[ ] CP12: Implementar a UI da emissão de documentos na aba de documentos do aluno
  [ ] CP12.1: Botão "Imprimir" para cada documento
  [ ] CP12.2: Botão "Imprimir Todos os Documentos"
  [ ] CP12.3: Cada documento poderá ser visualizado através do modal já abstraído em components/ui.
