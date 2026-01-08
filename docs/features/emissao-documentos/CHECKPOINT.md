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
  [ ] CP1.1: Instalar biblioteca de geração de PDF
    [ ] TEC1.1.1: Executar `pnpm add @react-pdf/renderer`
    [ ] TEC1.1.2: Executar `pnpm add -D @types/react-pdf` (se necessário)
    [ ] TEC1.1.3: Verificar compatibilidade com Next.js 16
  [ ] CP1.2: Instalar biblioteca de geração de DOCX
    [ ] TEC1.2.1: Pesquisar biblioteca adequada (sugestão: `docx`)
    [ ] TEC1.2.2: Executar `pnpm add docx`
    [ ] TEC1.2.3: Verificar exemplos de uso da biblioteca
  [ ] CP1.3: Instalar bibliotecas auxiliares se necessário
    [ ] TEC1.3.1: Para merge de PDFs: `pnpm add pdf-lib` (se necessário)
    [ ] TEC1.3.2: Para manipulação de imagens: verificar se precisa de biblioteca adicional

[ ] CP2: Criar arquivo de configuração de metadados institucionais
  [ ] CP2.1: Criar arquivo de configuração
    [ ] TEC2.1.1: Localização: `/src/config/instituicao.ts`
    [ ] TEC2.1.2: Exportar constante `INSTITUICAO_CONFIG`
    [ ] TEC2.1.3: Incluir campos: nome, governo, secretaria, diretor, secretariaEscolar, coordenadoria, regional, cnpj, endereco
  [ ] CP2.2: Definir tipo TypeScript para metadados
    [ ] TEC2.2.1: Criar tipo `MetadadosInstituicao` com todos os campos
    [ ] TEC2.2.2: Incluir tipo `Legislacao` com: leiLDB, resolucaoSEEDUC, decretos (objeto com chaves por modalidade)
    [ ] TEC2.2.3: Incluir tipo `Brasoes` com caminhos para imagens
  [ ] CP2.3: Preencher dados de exemplo (conforme modelo PDF)
    [ ] TEC2.3.1: `governo: "Governo do Estado do Rio de Janeiro"`
    [ ] TEC2.3.2: `secretaria: "Secretaria de Estado de Educação"`
    [ ] TEC2.3.3: `nome: "COLÉGIO ESTADUAL SENOR ABRAVANEL"`
    [ ] TEC2.3.4: `coordenadoria: "Coordenadoria de Inspeção Escolar – Regional Metropolitana VI"`
    [ ] TEC2.3.5: Legislação:
      - `leiLDB: "Lei Federal nº 9.394/1996"`
      - `resolucaoSEEDUC: "Resolução SEEDUC nº 6.346/2025"`
      - `decretos.EMR: "Decreto nº 804 de 15 de julho de 1976"`
      - `decretos.NEJA: "Decreto nº 43.723/2012"`
      - `decretos.DIPLOMA: "Decreto nº 43.723/2012"`
    [ ] TEC2.3.6: Livros de registro:
      - `livros.CERTIFICADO: "57-A"`
      - `livros.DIPLOMA: "25"`
  [ ] CP2.4: Configurar caminhos para imagens
    [ ] TEC2.4.1: `brasoes.brasil: "/docs/templates/arquivosDeExemplo/documentosEmissao/imagens/Brasão Brasil.jpg"`
    [ ] TEC2.4.2: `brasoes.rj: "/docs/templates/arquivosDeExemplo/documentosEmissao/imagens/Brasão RJ.jpg"`
    [ ] TEC2.4.3: Nota: Considerar copiar imagens para `/public` para acesso no servidor

[ ] CP3: Criar estrutura de tipos TypeScript para documentos
  [ ] CP3.1: Criar arquivo de tipos
    [ ] TEC3.1.1: Localização: `/src/lib/core/data/gestao-alunos/documentos/types.ts`
    [ ] TEC3.1.2: Exportar `type TipoDocumento = "CERTIDAO" | "CERTIFICADO" | "HISTORICO" | "DIPLOMA"`
    [ ] TEC3.1.3: Exportar `type StatusDisponibilidade = "disponivel" | "indisponivel" | "parcial"`
  [ ] CP3.2: Definir tipos para dados de cada documento
    [ ] TEC3.2.1: Criar `interface DadosCertidao` com campos: aluno (dados básicos), serie (dados da série cursada), metadados (instituição)
    [ ] TEC3.2.2: Criar `interface DadosCertificado` estendendo DadosCertidao + campos de conclusão
    [ ] TEC3.2.3: Criar `interface DadosDiploma` similar a DadosCertificado
    [ ] TEC3.2.4: Criar `interface DadosHistoricoEscolar` com: aluno, series[], historicosPorSerie[], metadados
  [ ] CP3.3: Definir tipo para resultado de validação
    [ ] TEC3.3.1: Criar `interface ResultadoValidacao` com: disponivel, percentual, camposFaltantes[]
    [ ] TEC3.3.2: Criar `interface CampoFaltante` com: campo, label, categoria, abaId

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

[ ] TEC4: Para o caso do Histórico Escolar, adaptar os checkpoints conforme necessário

[ ] CP4: Analisar modelos PDF (ou componente React) e mapear campos para def-objects
  [ ] CP4.1: Atualizar def-objects com campos do Documento em questão

[ ] CP5: Procedimento detalhado para cada documento:
  [ ] TEC5.1: Abrir e estudar modelo oficial
  [ ] TEC5.2: Identificar TODOS os campos variáveis (marcados como XXXXXXXXXX, similar ou análogo)
  [ ] TEC5.3: Criar objeto de associação entre esses campos e os de Def-objects;
  [ ] TEC5.4: Verificar alinhamento com def-objects
    [ ] TEC5.4.1: Para CADA campo mapeado, verificar se existe no def-object correspondente
    [ ] TEC5.4.2: Se campo NÃO existe, documentar discrepância (pode indicar necessidade de atualização do schema)
    [ ] TEC5.4.3: Preparar lista final de campos que serão atualizados

[ ] CP6: Atualizar def-objects com campos de Documento em questão
  [ ] CP6.1: Atualizar dadosPessoais.ts
    [ ] TEC6.1.1: Para CADA campo do Aluno identificado no CP4.3, adicionar "Certidão" ao array existente
    [ ] TEC6.1.2: Exemplo: `nome: [...arrayAtual, "Certidão"]`
    [ ] TEC6.1.3: Exemplo: `rg: [...arrayAtual, "Certidão"]`
    [ ] TEC6.1.4: IMPORTANTE: Não remover valores existentes, apenas adicionar "Certidão", ou o outro documento em questão
  [ ] CP6.2: E assim fazer para atualizar dadosEscolares.ts e historicoEscolar.ts se necessário

[ ] CP7: Repetir o processo para os outros documentos (Certificado e Diploma)
  [ ] TEC7.1: Seguir o mesmo procedimento detalhado no CP5
  [ ] TEC7.2: Atualizar def-objects conforme necessário
  [ ] TEC7.3: Check nos três documentos:
    [ ] TEC7.3.1: Certidão
    [ ] TEC7.3.2: Certificado
    [ ] TEC7.3.3: Diploma
    [ ] TEC7.3.4: Histórico Escolar

### Checkpoints para DEFINIÇÃO DE LAYOUT dos Documentos

[ ] CP8: Criar um objeto com os quatro documentos para DEFINIÇÃO DE LAYOUT:
  [ ] TEC8.1: Avaliar cuidadosamente o Modelo PDF de cada documento
  [ ] TEC8.2: Identificar os campos variáveis em cada modelo
  [ ] TEC8.3: Mapear esses campos para os campos existentes nos def-objects
  [ ] TEC8.4: Documentar o mapeamento no objeto TypeScript
    [ ] TEC8.4.1: Estrutura sugerida:
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
[ ] CP9: Definir diretivas de layout específicas para cada documento
  [ ] TEC9.1: Para cada documento, definir:
    [ ] TEC9.1.1: Margens (superior, inferior, lateral)
    [ ] TEC9.1.2: Espaçamento entre linhas
    [ ] TEC9.1.3: Tamanhos de fonte para títulos, subtítulos, corpo do texto
    [ ] TEC9.1.4: Alinhamento de texto (justificado, centralizado, etc.)
    [ ] TEC9.1.5: Estilos de cabeçalho e rodapé (incluir brasões, informações institucionais)
  [ ] TEC9.2: Documentar essas diretivas no objeto MAPEAMENTO_LAYOUT_DOCUMENTOS

[ ] CP10: Criar estrutura de pastas para componentes PDF e aplicar componentização segundo as diretivas de layout
  [ ] TEC10.1: Criar pastas
    [ ] TEC10.1.1: `/src/components/pdf/` (pasta raiz)
    [ ] TEC10.1.2: `/src/components/pdf/common/` (componentes comuns)
    [ ] TEC10.1.3: `/src/components/pdf/templates/` (templates de documentos)

[ ] CP11: A partir deste objeto de referência criado anteriormnte, criar estrutura de pastas para componentes PDF e aplicar a componentização segundo as diretivas de layout ali estabelecidas.
  [ ] CP11.1: Criar pastas
    [ ] TEC11.1.1: `/src/components/pdf/` (pasta raiz)
    [ ] TEC11.1.2: `/src/components/pdf/common/` (componentes comuns)
    [ ] TEC11.1.3: `/src/components/pdf/templates/` (templates de documentos)
[ ] CP12: Enfim construir os templates de cada documento

---

[ ] CP13: Implementar a UI da emissão de documentos na aba de documentos do aluno
  [ ] CP13.1: Botão "Imprimir" para cada documento
  [ ] CP13.2: Botão "Imprimir Todos os Documentos"
  [ ] CP13.3: Cada documento poderá ser visualizado através do modal já abstraído em components/ui.
