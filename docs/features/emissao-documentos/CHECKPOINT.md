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
    [x] T1.1.1: Executar `pnpm add @react-pdf/renderer`
    [x] T1.1.2: `@react-pdf/renderer` já inclui tipos (`index.d.ts`), sem necessidade de `@types/react-pdf`
    [x] T1.1.3: Peer dependency suporta React 19 (compatível com Next.js 16)
  [x] CP1.2: Instalar biblioteca de geração de DOCX
    [x] T1.2.1: Pesquisar biblioteca adequada (sugestão: `docx`)
    [x] T1.2.2: Executar `pnpm add docx`
    [x] T1.2.3: README confirma uso em React/Node com exemplos
  [ ] CP1.3: Instalar bibliotecas auxiliares se necessário
    [ ] T1.3.1: Para merge de PDFs: `pnpm add pdf-lib` (se necessário)
    [ ] T1.3.2: Para manipulação de imagens: verificar se precisa de biblioteca adicional

[x] CP2: Criar arquivo de configuração de metadados institucionais
  [x] CP2.1: Criar arquivo de configuração
    [x] T2.1.1: Localização: `/src/config/instituicao.ts`
    [x] T2.1.2: Exportar constante `INSTITUICAO_CONFIG`
    [x] T2.1.3: Incluir campos: nome, governo, secretaria, diretor, secretariaEscolar, coordenadoria, regional, cnpj, endereco
  [x] CP2.2: Definir tipo TypeScript para metadados
    [x] T2.2.1: Criar tipo `MetadadosInstituicao` com todos os campos
    [x] T2.2.2: Incluir tipo `Legislacao` com: leiLDB, resolucaoSEEDUC, decretos (objeto com chaves por modalidade)
    [x] T2.2.3: Incluir tipo `Brasoes` com caminhos para imagens
  [x] CP2.3: Preencher dados de exemplo (conforme modelo PDF)
    [x] T2.3.1: `governo: "Governo do Estado do Rio de Janeiro"`
    [x] T2.3.2: `secretaria: "Secretaria de Estado de Educação"`
    [x] T2.3.3: `nome: "COLÉGIO ESTADUAL SENOR ABRAVANEL"`
    [x] T2.3.4: `coordenadoria: "Coordenadoria de Inspeção Escolar"`
    [x] T2.3.5: `regional: "Regional Metropolitana VI"`
    [x] T2.3.6: Legislação:
      - `leiLDB: "Lei Federal nº 9.394/1996"`
      - `resolucaoSEEDUC: "Resolução SEEDUC nº 6.346/2025"`
      - `decretos.EMR: "Decreto nº 804 de 15 de julho de 1976"`
      - `decretos.NEJA: "Decreto nº 43.723/2012"`
      - `decretos.DIPLOMA: "Decreto nº 43.723/2012"`
    [x] T2.3.7: Livros de registro:
      - `livros.CERTIDAO: "1-A"`
      - `livros.CERTIFICADO: "57-A"`
      - `livros.DIPLOMA: "25"`
  [x] CP2.4: Configurar caminhos para imagens
    [x] T2.4.1: `brasoes.brasil: "/documentos-emissao/brasoes/brasao-brasil.jpg"`
    [x] T2.4.2: `brasoes.rj: "/documentos-emissao/brasoes/brasao-rj.jpg"`
    [x] T2.4.3: Imagens movidas para `/public/documentos-emissao/brasoes`

[x] CP3: Criar estrutura de tipos TypeScript para documentos
  [x] CP3.1: Criar arquivo de tipos
    [x] T3.1.1: Localização: `/src/lib/core/data/gestao-alunos/documentos/types.ts`
    [x] T3.1.2: Exportar `type TipoDocumento = "CERTIDAO" | "CERTIFICADO" | "HISTORICO" | "DIPLOMA"`
    [x] T3.1.3: Exportar `type StatusDisponibilidade = "disponivel" | "indisponivel" | "parcial"`
  [x] CP3.2: Definir tipos para dados de cada documento
    [x] T3.2.1: Criar `interface DadosCertidao` com campos: aluno (dados básicos), serie (dados da série cursada), metadados (instituição)
    [x] T3.2.2: Criar `interface DadosCertificado` estendendo DadosCertidao + campos de conclusão
    [x] T3.2.3: Criar `interface DadosDiploma` similar a DadosCertificado
    [x] T3.2.4: Criar `interface DadosHistoricoEscolar` com: aluno, series[], historicosPorSerie[], metadados
  [x] CP3.3: Definir tipo para resultado de validação
    [x] T3.3.1: Criar `interface ResultadoValidacao` com: disponivel, percentual, camposFaltantes[]
    [x] T3.3.2: Criar `interface CampoFaltante` com: campo, label, categoria, abaId

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

[x] T4: Para o caso do Histórico Escolar, adaptar os checkpoints conforme necessário (baseado em DadosAlunoHistorico.tsx)

[x] CP4: Analisar modelos PDF (ou componente React) e mapear campos para def-objects
  [x] CP4.1: Registrar mapeamento dos campos do documento para def-objects

[x] CP5: Procedimento detalhado para cada documento:
  [x] T5.1: Abrir e estudar modelo oficial
  [x] T5.2: Identificar TODOS os campos variáveis (marcados como XXXXXXXXXX, similar ou análogo)
  [x] T5.3: Criar objeto de associação entre esses campos e os de Def-objects
    [x] T5.3.1: Mapeamento registrado em `docs/features/emissao-documentos/MAPEAMENTO.md`
  [x] T5.4: Verificar alinhamento com def-objects
    [x] T5.4.1: Para CADA campo mapeado, verificar se existe no def-object correspondente
    [x] T5.4.2: Se campo NAO existe, documentar discrepancia (pode indicar necessidade de atualizacao do schema)
    [x] T5.4.3: Preparar lista final de campos que serao atualizados

[x] CP6: Atualizar def-objects com campos de Documento em questão
  [x] CP6.1: Atualizar dadosPessoais.ts
    [x] T6.1.1: Para CADA campo do Aluno identificado no CP5.2, adicionar "Certidão" ao array existente
    [x] T6.1.2: Exemplo: `nome: [...arrayAtual, "Certidão"]`
    [x] T6.1.3: Exemplo: `rg: [...arrayAtual, "Certidão"]`
    [x] T6.1.4: IMPORTANTE: Não remover valores existentes, apenas adicionar "Certidão", ou o outro documento em questão
  [x] CP6.2: E assim fazer para atualizar dadosEscolares.ts e historicoEscolar.ts se necessário

[x] CP7: Repetir o processo para os outros documentos (Certificado e Diploma)
  [x] T7.1: Seguir o mesmo procedimento detalhado no CP5
  [x] T7.2: Atualizar def-objects conforme necessário
  [x] T7.3: Check nos quatro documentos:
    [x] T7.3.1: Certidão
    [x] T7.3.2: Certificado
    [x] T7.3.3: Diploma
    [x] T7.3.4: Histórico Escolar

### Checkpoints para DEFINIÇÃO DE LAYOUT dos Documentos

[x] CP8: Criar um objeto com os quatro documentos para DEFINIÇÃO DE LAYOUT:
  [x] T8.1: Avaliar cuidadosamente o Modelo PDF de cada documento
  [x] T8.2: Identificar os campos variáveis em cada modelo
  [x] T8.3: Mapear esses campos para os campos existentes nos def-objects
  [x] T8.4: Documentar o mapeamento no objeto TypeScript
    [x] T8.4.1: Arquivo criado em `src/lib/core/data/gestao-alunos/documentos/layout.ts`
    [x] T8.4.2: Estrutura sugerida (referencia):
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
  [x] T9.1: Para cada documento, definir:
    [x] T9.1.1: Margens (superior, inferior, lateral)
    [x] T9.1.2: Espaçamento entre linhas
    [x] T9.1.3: Tamanhos de fonte para títulos, subtítulos, corpo do texto
    [x] T9.1.4: Alinhamento de texto (justificado, centralizado, etc.)
    [x] T9.1.5: Estilos de cabeçalho e rodapé (incluir brasões, informações institucionais)
  [x] T9.2: Documentar essas diretivas no objeto MAPEAMENTO_LAYOUT_DOCUMENTOS

[x] CP10: Criar estrutura de pastas para componentes PDF e aplicar componentização segundo as diretivas de layout
  [x] T10.1: Criar pastas
    [x] T10.1.1: `/src/components/pdf/` (pasta raiz)
    [x] T10.1.2: `/src/components/pdf/common/` (componentes comuns)
    [x] T10.1.3: `/src/components/pdf/templates/` (templates de documentos)

[x] CP11: Enfim construir os templates de cada documento

---

[x] CP12: Implementar a UI da emissão de documentos na aba de documentos do aluno
  [x] CP12.1: Botão "Imprimir" para cada documento
  [x] CP12.2: Botão "Imprimir Todos os Documentos"
  [x] CP12.3: Cada documento poderá ser visualizado através do modal já abstraído em components/ui.

---

## Sessão 3 (Análise de Completude e Integração com Ícones de Status) - Feature: Emissão de Documentos

### Contexto
Esta sessão implementa o sistema de análise de completude de dados por documento, integrando com os ícones de status de fases existentes. O objetivo é que o status da fase `FASE:EMISSAO_DOCUMENTOS` reflita dinamicamente se os dados do aluno estão prontos para emitir cada tipo de documento, baseando-se nos mapeamentos definidos nos def-objects.

### Componentes DRY Usados
- [DRY.UI:ICONE_STATUS_FASE] - Ícone de status por fase (já existe, será consumido)
- [DRY.UI:AGREGADOR_ICONES_FASES] - Agregador de ícones de fases (já existe, será consumido)
- [DRY.OBJECT:PHASES] - Configuração de fases (já existe, referência em `phases.ts`)

### Referências de Código Existente
- `/src/lib/core/data/gestao-alunos/def-objects/` - Objetos que definem campos por documento
- `/src/components/ListaAlunosCertificacao.tsx` - Função `montarStatusPorFase` (linha 285-316)
- `/src/hooks/useAlunosCertificacao.ts` - Hook que calcula progresso de dados
- `/src/lib/core/data/gestao-alunos/phases.ts` - Configuração das fases
- `/src/lib/core/data/gestao-alunos/phases.types.ts` - Tipos e schemas de fases

### Checkpoints

[x] CP13: Criar função utilitária de análise de completude por documento
  [x] CP13.1: Criar arquivo de utilitários
    [x] T13.1.1: Localização: `/src/lib/core/data/gestao-alunos/documentos/calcularCompletude.ts`
    [x] T13.1.2: Exportar tipo `CompletudeDocumento` com campos:
      - `documento: DocEmissao` - tipo do documento
      - `status: PhaseStatus` - status calculado (completo/incompleto/ausente)
      - `percentual: number` - percentual de completude (0-100)
      - `camposPreenchidos: number` - quantidade de campos preenchidos
      - `totalCampos: number` - quantidade total de campos obrigatórios
      - `camposFaltantes: CampoFaltante[]` - array de campos faltantes
    [x] T13.1.3: Exportar tipo `CampoFaltante` com campos:
      - `campo: string` - nome técnico do campo
      - `label: string` - nome legível do campo
      - `tabela: string` - tabela de origem (Aluno, SerieCursada, HistoricoEscolar)
      - `fase: Phase` - fase a que pertence o campo
    [x] T13.1.4: Exportar tipo `ResumoCompletudeEmissao` com campos:
      - `statusGeral: PhaseStatus` - status consolidado de todos os documentos
      - `documentosProntos: number` - quantidade de documentos com status "completo"
      - `totalDocumentos: number` - sempre 4 (Certidão, Certificado, Diploma, Histórico)
      - `porDocumento: Record<DocEmissao, CompletudeDocumento>` - detalhes por documento

  [x] CP13.2: Implementar função `calcularCompletudeDocumento`
    [x] T13.2.1: Assinatura: `function calcularCompletudeDocumento(documento: DocEmissao, dadosAluno: DadosAlunoCompleto): CompletudeDocumento`
    [x] T13.2.2: Parâmetro `DadosAlunoCompleto` deve incluir:
      - Campos de `Aluno` (tabela principal)
      - Array de `SerieCursada[]` com históricos
      - Campos derivados necessários
    [x] T13.2.3: Lógica da função:
      1. Importar os 3 def-objects (dadosPessoais, dadosEscolares, historicoEscolar)
      2. Para cada def-object, iterar sobre suas tabelas (ex: `dadosPessoais.Aluno`)
      3. Para cada campo da tabela, verificar se o array de documentos inclui o `documento` solicitado
      4. Se sim, verificar se o valor do campo no `dadosAluno` está preenchido (não null/undefined/empty)
      5. Acumular contador de campos obrigatórios e campos preenchidos
      6. Montar array de `camposFaltantes` com informações sobre campos não preenchidos
      7. Calcular percentual: `(camposPreenchidos / totalCampos) * 100`
      8. Determinar status:
         - `completo`: percentual === 100
         - `ausente`: percentual === 0
         - `incompleto`: 0 < percentual < 100
    [x] T13.2.4: Tratamento especial para campos de arrays (SerieCursada, HistoricoEscolar):
      - Se o documento exige campos de SerieCursada, verificar se existe ao menos 1 registro
      - Se o documento exige campos de HistoricoEscolar, verificar se existem registros vinculados
      - Para Histórico Escolar especificamente, validar que existam componentes curriculares

  [x] CP13.3: Implementar função `calcularCompletudeEmissao`
    [x] T13.3.1: Assinatura: `function calcularCompletudeEmissao(dadosAluno: DadosAlunoCompleto): ResumoCompletudeEmissao`
    [x] T13.3.2: Lógica da função:
      1. Chamar `calcularCompletudeDocumento` para cada um dos 4 tipos de documento
      2. Montar objeto `porDocumento` com resultado de cada documento
      3. Contar quantos documentos têm `status === "completo"`
      4. Determinar `statusGeral`:
         - `completo`: se todos os 4 documentos estão completos
         - `ausente`: se todos os 4 documentos estão ausentes
         - `incompleto`: casos intermediários
      5. Retornar `ResumoCompletudeEmissao` completo
    [x] T13.3.3: Adicionar testes unitários básicos para esta função

[x] CP14: Integrar cálculo de completude no hook useAlunosCertificacao
  [x] CP14.1: Atualizar tipo `AlunoCertificacao`
    [x] T14.1.1: Localização: `/src/hooks/useAlunosCertificacao.ts`
    [x] T14.1.2: Adicionar campo: `progressoEmissaoDocumentos: ResumoCompletudeEmissao`

  [x] CP14.2: Modificar função `obterAlunosCertificacao`
    [x] T14.2.1: Após buscar alunos do banco, para cada aluno:
      1. Montar objeto `DadosAlunoCompleto` com dados necessários
      2. Chamar `calcularCompletudeEmissao(dadosAluno)`
      3. Adicionar resultado ao campo `progressoEmissaoDocumentos`
    [x] T14.2.2: Garantir que a query Prisma inclui todos os campos necessários:
      - Todos os campos de `Aluno` usados nos def-objects
      - Incluir `seriesCursadas` com seus campos
      - Incluir `historicos` dentro de `seriesCursadas`

  [x] CP14.3: Atualizar função `montarStatusPorFase` no componente ListaAlunosCertificacao
    [x] T14.3.1: Localização: `/src/components/ListaAlunosCertificacao.tsx` (linha 285)
    [x] T14.3.2: Substituir status fixo de `FASE:EMISSAO_DOCUMENTOS`:
      ```typescript
      // ANTES (linha 310-314):
      "FASE:EMISSAO_DOCUMENTOS": {
        status: "ausente",
        label: "--",
        title: `${faseEmissao.titulo}: pendente`,
      },

      // DEPOIS:
      "FASE:EMISSAO_DOCUMENTOS": {
        status: aluno.progressoEmissaoDocumentos.statusGeral,
        label: `${aluno.progressoEmissaoDocumentos.documentosProntos}/${aluno.progressoEmissaoDocumentos.totalDocumentos}`,
        title: `${faseEmissao.titulo}: ${aluno.progressoEmissaoDocumentos.documentosProntos} de ${aluno.progressoEmissaoDocumentos.totalDocumentos} documentos prontos`,
      },
      ```

[x] CP15: Criar componente de detalhamento de completude por documento
  [x] CP15.1: Criar componente `CompletudeDocumentos`
    [x] T15.1.1: Localização: `/src/components/CompletudeDocumentos.tsx`
    [x] T15.1.2: Props:
      - `completude: ResumoCompletudeEmissao` - dados de completude
      - `onNavigateToAba?: (abaId: string) => void` - callback para navegar para aba com campo faltante
    [x] T15.1.3: UI deve exibir:
      - Card para cada um dos 4 tipos de documento
      - Ícone de status (verde/amarelo/vermelho) por documento
      - Título do documento (ex: "Certidão de Conclusão")
      - Percentual de completude (ex: "85%")
      - Botão "Ver detalhes" que expande lista de campos faltantes
      - Lista de campos faltantes agrupada por fase/aba
      - Link clicável em cada campo faltante que chama `onNavigateToAba`
    [x] T15.1.4: Estilo deve seguir padrão existente do sistema (usar classes Tailwind consistentes)

  [x] CP15.2: Integrar componente na aba de Emissão
    [x] T15.2.1: Localização: `/src/components/DadosAlunoEmissao.tsx`
    [x] T15.2.2: Substituir placeholder atual por:
      1. Componente `CompletudeDocumentos` no topo da aba
      2. Manter botões de impressão/preview existentes
      3. Desabilitar botões de impressão se documento não estiver completo
      4. Adicionar tooltip explicativo nos botões desabilitados

[x] CP16: Adicionar feedback visual aprimorado
  [x] CP16.1: Criar indicadores de completude na lista de alunos
    [x] T16.1.1: No componente `IndicadoresDadosAluno` (linha 279 de ListaAlunosCertificacao.tsx):
      - Ícone de `FASE:EMISSAO_DOCUMENTOS` agora mostrará status dinâmico
      - Tooltip mostrará "X/4 documentos prontos"

[x] CP16.2: Adicionar badge de "pronto para emitir" quando aplicável
    [x] T16.2.1: Se `statusGeral === "completo"`, exibir badge verde discreto
    [x] T16.2.2: Badge pode aparecer ao lado do nome do aluno ou no card de emissão

[x] CP17: Criar testes para o sistema de completude
  [x] CP17.1: Testes unitários para `calcularCompletudeDocumento`
    [x] T17.1.1: Localização: `/tests/lib/calcularCompletude.test.ts`
    [x] T17.1.2: Casos de teste:
      - Aluno sem nenhum dado: percentual 0, status "ausente"
      - Aluno com dados completos: percentual 100, status "completo"
      - Aluno com dados parciais: percentual intermediário, status "incompleto"
      - Validar array de camposFaltantes está correto
      - Testar cada tipo de documento (Certidão, Certificado, Diploma, Histórico)

[x] CP17.2: Testes de integração para hook atualizado
    [x] T17.2.1: Verificar que `useAlunosCertificacao` retorna `progressoEmissaoDocumentos`
    [x] T17.2.2: Verificar que status dinâmico aparece no componente de lista

[x] CP18: Documentar decisões técnicas
  [x] CP18.1: Atualizar arquivo TECNICO.md
    [x] T18.1.1: Documentar motivação: garantir consistência entre def-objects e status visual
    [x] T18.1.2: Documentar arquitetura: função pura + integração via hook
    [x] T18.1.3: Documentar critérios de completude (100% dos campos obrigatórios)

  [x] CP18.2: Atualizar DRY se necessário
    [x] T18.2.1: Se componente `CompletudeDocumentos` for genérico o suficiente, documentar em `/docs/dry/`
    [x] T18.2.2: Se função `calcularCompletude` for reutilizável para outras features, documentar

---

### Observações Técnicas da Sessão 3

#### Fonte Única da Verdade
Os def-objects (`dadosPessoais.ts`, `dadosEscolares.ts`, `historicoEscolar.ts`) são a **única fonte da verdade** para determinar quais campos são obrigatórios para cada documento. Qualquer mudança nos requisitos de um documento deve ser feita atualizando esses arquivos.

#### Critério de Completude
Inicialmente, usaremos critério de **100% de completude** - todos os campos marcados no def-object para aquele documento devem estar preenchidos. No futuro, podemos implementar:
- Campos "críticos" vs "opcionais"
- Percentual configurável para liberação
- Validação condicional (ex: alguns campos só obrigatórios para determinadas modalidades)

#### Performance
A função `calcularCompletudeEmissao` será executada para cada aluno ao carregar a lista. Considerações:
- Manter lógica eficiente (evitar loops desnecessários)
- Aproveitar dados já carregados pelo hook (não fazer queries adicionais)
- Se necessário, implementar memoização no futuro

#### Expansibilidade
A estrutura permite expansão futura para:
- Adicionar novos tipos de documentos
- Implementar validações personalizadas por documento
- Criar relatórios de completude da turma
- Filtrar alunos por documentos prontos

---

## Sessão 4 (Extensão de Sistema de Completude para Fases) - Feature: Emissão de Documentos

### Contexto
Esta sessão ESTENDE o sistema de completude implementado na Sessão 3 para suportar cálculo de completude por fase de gestão de alunos. Atualmente, o hook `useAlunosCertificacao` possui funções inline (`calcularResumoDadosEscolares` e `calcularResumoHistoricoEscolar`) que calculam completude de forma ad-hoc. Esta sessão irá:
1. Abstrair essas funções para o arquivo `calcularCompletude.ts` (já existente)
2. Seguir o mesmo padrão estabelecido para documentos
3. Usar def-objects como fonte única da verdade
4. Garantir consistência entre cálculos de documentos e fases

### Motivação
- **Reutilização de padrão:** Sistema de completude de documentos já foi implementado e testado
- **Consistência:** Todas as completudes seguirão mesmo cálculo, status e formato
- **Manutenibilidade:** Mudanças em def-objects refletirão automaticamente nos cálculos
- **Testabilidade:** Funções puras facilitam testes unitários

### Componentes DRY Usados
- [DRY.BACKEND:CALCULAR_COMPLETUDE_DOCUMENTOS] - **ESTENDIDO** nesta sessão para suportar fases
- [DRY.OBJECT:PHASES] - Configuração de fases

### Referências de Código
- **Código a refatorar:** `/src/hooks/useAlunosCertificacao.ts` (linhas 179-227)
  - `calcularResumoDadosEscolares()` - função inline a ser abstraída
  - `calcularResumoHistoricoEscolar()` - função inline a ser abstraída
  - `possuiTriplaSerieMedio()` - validador específico (manter ou mover)
- **Sistema existente:** `/src/lib/core/data/gestao-alunos/documentos/calcularCompletude.ts`
  - Padrão a seguir: `calcularCompletudeDocumento()` e `calcularCompletudeEmissao()`
- **Def-objects:** `/src/lib/core/data/gestao-alunos/def-objects/`
  - `dadosPessoais.ts` - já usado para documentos
  - `dadosEscolares.ts` - será fonte de campos obrigatórios para FASE:DADOS_ESCOLARES
  - `historicoEscolar.ts` - será fonte para FASE:HISTORICO_ESCOLAR

### Checkpoints

[ ] CP19: Análise e planejamento da extensão
  [ ] CP19.1: Analisar código inline existente
    [ ] T19.1.1: Ler função `calcularResumoDadosEscolares()` (useAlunosCertificacao.ts:179-202)
      - Identifica 3 slots: situacaoEscolar, motivoEncerramento, tripla série médio
      - Retorna: totalSlots, slotsPreenchidos, percentual, completo, status
    [ ] T19.1.2: Ler função `calcularResumoHistoricoEscolar()` (useAlunosCertificacao.ts:205-227)
      - Conta registros em seriesCursadas[].historicos[]
      - Status "completo" se totalSeries === 3
      - Retorna: totalRegistros, totalSeries, status, completo
    [ ] T19.1.3: Ler função auxiliar `possuiTriplaSerieMedio()` (useAlunosCertificacao.ts:229-245)
      - Valida regra específica: 1 série "-" + 2 séries "MÉDIO"
      - Ordenação por ano letivo

  [ ] CP19.2: Identificar padrão comum com sistema de documentos
    [ ] T19.2.1: Ambos contam campos/slots preenchidos vs total
    [ ] T19.2.2: Ambos calculam percentual
    [ ] T19.2.3: Ambos determinam status (completo/incompleto/ausente)
    [ ] T19.2.4: Documentos usam def-objects, fases têm validações específicas
    [ ] T19.2.5: **Decisão:** Usar def-objects + validadores customizados

  [ ] CP19.3: Definir estratégia de tipos
    [ ] T19.3.1: Verificar tipos existentes:
      - `CompletudeDocumento` (já existe para documentos)
      - `ResumoDadosEscolares` (tipo inline no hook)
      - `ResumoHistoricoEscolar` (tipo inline no hook)
    [ ] T19.3.2: Criar tipo genérico `CompletudeItem`:
      ```typescript
      export type CompletudeItem = {
        fase?: Phase;              // fase se aplicável
        documento?: DocEmissao;    // documento se aplicável
        status: PhaseStatus;
        percentual: number;
        camposPreenchidos: number;
        totalCampos: number;
        camposFaltantes?: CampoFaltante[];
      };
      ```
    [ ] T19.3.3: Manter `CompletudeDocumento` como alias/extensão de `CompletudeItem`
    [ ] T19.3.4: Adapters se necessário para compatibilidade com código existente

[ ] CP20: Criar funções de completude para FASE:DADOS_ESCOLARES
  [ ] CP20.1: Análise de campos obrigatórios
    [ ] T20.1.1: Consultar def-object `dadosEscolares.ts`
    [ ] T20.1.2: Identificar campos marcados para documentos (Certidão, Certificado, etc)
    [ ] T20.1.3: Campos específicos da fase:
      - `Aluno.situacaoEscolar` - situação atual do aluno
      - `Aluno.motivoEncerramento` - motivo de saída se aplicável
      - `SerieCursada.segmento` - validação de tripla série do médio

  [ ] CP20.2: Criar função `calcularCompletudeDadosEscolares()`
    [ ] T20.2.1: Localização: `/src/lib/core/data/gestao-alunos/documentos/calcularCompletude.ts`
    [ ] T20.2.2: Assinatura:
      ```typescript
      // [FEAT:emissao-documentos_TEC8.1] Calcula completude FASE:DADOS_ESCOLARES
      export function calcularCompletudeDadosEscolares(
        dadosAluno: DadosAlunoCompleto
      ): CompletudeItem
      ```
    [ ] T20.2.3: Implementação:
      1. Buscar campos de `dadosEscolares.Aluno` que são marcados para documentos
      2. Validar campo `situacaoEscolar`: `valorPreenchido(dadosAluno.situacaoEscolar)`
      3. Validar campo `motivoEncerramento`: `valorPreenchido(dadosAluno.motivoEncerramento)`
      4. Validar "tripla série médio": usar função auxiliar `validarTriplaSerieMedio()`
      5. Contar slots preenchidos vs total (3 slots)
      6. Calcular percentual: `(slotsPreenchidos / 3) * 100`
      7. Determinar status:
         - "completo": todos os 3 slots preenchidos
         - "ausente": nenhum slot preenchido
         - "incompleto": slots parciais
      8. Montar `camposFaltantes` se necessário
    [ ] T20.2.4: Retornar objeto `CompletudeItem`:
      ```typescript
      {
        fase: "FASE:DADOS_ESCOLARES",
        status: status,
        percentual: percentual,
        camposPreenchidos: slotsPreenchidos,
        totalCampos: 3,
        camposFaltantes: camposFaltantes
      }
      ```

  [ ] CP20.3: Criar função auxiliar `validarTriplaSerieMedio()`
    [ ] T20.3.1: Mover função `possuiTriplaSerieMedio()` do hook para `calcularCompletude.ts`
    [ ] T20.3.2: Renomear para `validarTriplaSerieMedio()` (mais descritivo)
    [ ] T20.3.3: Adicionar comentário de rastreabilidade:
      ```typescript
      // [FEAT:emissao-documentos_TEC8.2] Valida regra específica: 1 série "-" + 2 "MÉDIO"
      function validarTriplaSerieMedio(series?: SerieCursadaCompleta[]): boolean {
        // Implementação atual mantida
      }
      ```
    [ ] T20.3.4: Manter funções auxiliares `normalizarSegmento()` e `compararAnoLetivoAsc()`

[ ] CP21: Criar funções de completude para FASE:HISTORICO_ESCOLAR
  [ ] CP21.1: Análise de campos obrigatórios
    [ ] T21.1.1: Consultar def-object `historicoEscolar.ts`
    [ ] T21.1.2: Identificar campos marcados para "Histórico Escolar"
    [ ] T21.1.3: Regra específica: deve ter históricos para 3 séries

  [ ] CP21.2: Criar função `calcularCompletudeHistoricoEscolar()`
    [ ] T21.2.1: Localização: `/src/lib/core/data/gestao-alunos/documentos/calcularCompletude.ts`
    [ ] T21.2.2: Assinatura:
      ```typescript
      // [FEAT:emissao-documentos_TEC8.3] Calcula completude FASE:HISTORICO_ESCOLAR
      export function calcularCompletudeHistoricoEscolar(
        dadosAluno: DadosAlunoCompleto
      ): CompletudeItem
      ```
    [ ] T21.2.3: Implementação:
      1. Extrair `seriesCursadas` de `dadosAluno`
      2. Contar total de registros em `seriesCursadas[].historicos[]`
      3. Contar séries que têm históricos (totalSeries)
      4. Status "completo" se `totalSeries >= 3`
      5. Status "ausente" se `totalSeries === 0`
      6. Status "incompleto" nos casos intermediários
      7. Percentual baseado em `totalSeries / 3 * 100` (máximo 100%)
    [ ] T21.2.4: Retornar objeto `CompletudeItem`:
      ```typescript
      {
        fase: "FASE:HISTORICO_ESCOLAR",
        status: status,
        percentual: Math.min(100, Math.round((totalSeries / 3) * 100)),
        camposPreenchidos: totalSeries,
        totalCampos: 3,
        camposFaltantes: totalSeries < 3 ? [{
          campo: "historicos",
          label: "Histórico escolar completo (3 séries)",
          tabela: "SerieCursada",
          fase: "FASE:HISTORICO_ESCOLAR"
        }] : []
      }
      ```

[ ] CP22: Criar função consolidadora (opcional)
  [ ] CP22.1: Avaliar necessidade
    [ ] T22.1.1: Verificar se há uso para função que consolida TODAS as 4 fases
    [ ] T22.1.2: Se sim, criar `calcularCompletudeTodasFases()`
    [ ] T22.1.3: Se não, pular este checkpoint

  [ ] CP22.2: Implementar função consolidadora (se necessário)
    [ ] T22.2.1: Assinatura:
      ```typescript
      export function calcularCompletudeTodasFases(
        dadosAluno: DadosAlunoCompleto
      ): ResumoCompletudeFases
      ```
    [ ] T22.2.2: Chamar funções de cada fase:
      - DADOS_PESSOAIS: `calcularResumoDadosPessoais()` (já existe em outro arquivo)
      - DADOS_ESCOLARES: `calcularCompletudeDadosEscolares()` (nova)
      - HISTORICO_ESCOLAR: `calcularCompletudeHistoricoEscolar()` (nova)
      - EMISSAO_DOCUMENTOS: `calcularCompletudeEmissao()` (já existe)
    [ ] T22.2.3: Consolidar status geral de todas as 4 fases
    [ ] T22.2.4: Retornar tipo `ResumoCompletudeFases` (a definir se necessário)

[ ] CP23: Refatorar hook useAlunosCertificacao
  [ ] CP23.1: Remover funções inline
    [ ] T23.1.1: DELETAR função `calcularResumoDadosEscolares()` (linhas 179-202)
      - Será substituída por `calcularCompletudeDadosEscolares()` do DRY
    [ ] T23.1.2: DELETAR função `calcularResumoHistoricoEscolar()` (linhas 205-227)
      - Será substituída por `calcularCompletudeHistoricoEscolar()` do DRY
    [ ] T23.1.3: DELETAR função `possuiTriplaSerieMedio()` (linhas 229-245)
      - Movida para `calcularCompletude.ts` como `validarTriplaSerieMedio()`
    [ ] T23.1.4: DELETAR funções auxiliares `normalizarSegmento()` e `compararAnoLetivoAsc()`
      - Movidas para `calcularCompletude.ts`

  [ ] CP23.2: Adicionar imports do DRY
    [ ] T23.2.1: Adicionar import no topo do arquivo:
      ```typescript
      // [FEAT:emissao-documentos_TEC8] Usa DRY.BACKEND:CALCULAR_COMPLETUDE para fases
      import {
        calcularCompletudeEmissao,
        calcularCompletudeDadosEscolares,
        calcularCompletudeHistoricoEscolar,
        type ResumoCompletudeEmissao,
        type CompletudeItem,
      } from '@/lib/core/data/gestao-alunos/documentos/calcularCompletude';
      ```

  [ ] CP23.3: Atualizar tipos no hook
    [ ] T23.3.1: Verificar tipo `ResumoDadosEscolares`:
      - Se compatível com `CompletudeItem`, usar `CompletudeItem`
      - Se incompatível, criar adapter ou manter tipo atual
    [ ] T23.3.2: Verificar tipo `ResumoHistoricoEscolar`:
      - Mesma análise de compatibilidade
    [ ] T23.3.3: Atualizar tipo `AlunoCertificacao`:
      ```typescript
      export type AlunoCertificacao = AlunoApiResponse & {
        progressoDadosPessoais: ResumoDadosPessoais;
        progressoDadosEscolares: CompletudeItem;  // atualizado
        progressoHistoricoEscolar: CompletudeItem; // atualizado
        progressoEmissaoDocumentos: ResumoCompletudeEmissao;
      };
      ```

  [ ] CP23.4: Atualizar função `obterAlunosCertificacao`
    [ ] T23.4.1: Localização: linha 146 do hook
    [ ] T23.4.2: Substituir chamadas:
      ```typescript
      // ANTES:
      progressoDadosEscolares: calcularResumoDadosEscolares(aluno),
      progressoHistoricoEscolar: calcularResumoHistoricoEscolar(aluno.seriesCursadas),

      // DEPOIS:
      progressoDadosEscolares: calcularCompletudeDadosEscolares(aluno),
      progressoHistoricoEscolar: calcularCompletudeHistoricoEscolar(aluno),
      ```

  [ ] CP23.5: Verificar compatibilidade com componente
    [ ] T23.5.1: Abrir `/src/components/ListaAlunosCertificacao.tsx`
    [ ] T23.5.2: Verificar função `montarStatusPorFase()` (linha 291)
    [ ] T23.5.3: Garantir que acessa campos corretos:
      - `aluno.progressoDadosEscolares.status` (deve existir)
      - `aluno.progressoDadosEscolares.percentual` (deve existir)
      - `aluno.progressoHistoricoEscolar.status` (deve existir)
      - `aluno.progressoHistoricoEscolar.totalRegistros` (verificar se existe ou adaptar)
      - `aluno.progressoHistoricoEscolar.totalSeries` (verificar se existe ou adaptar)
    [ ] T23.5.4: Criar adapters se necessário para manter compatibilidade com UI

[ ] CP24: Ajustes de compatibilidade (se necessário)
  [ ] CP24.1: Analisar campos usados no componente
    [ ] T24.1.1: Componente usa `progressoDadosEscolares.totalSlots` e `slotsPreenchidos`?
      - Se sim, adicionar esses campos ao tipo `CompletudeItem` como opcionais
      - Ou criar adapter que mapeia `totalCampos` → `totalSlots`
    [ ] T24.1.2: Componente usa `progressoHistoricoEscolar.totalRegistros` e `totalSeries`?
      - Se sim, adicionar ao tipo `CompletudeItem` como opcionais
      - Ou modificar `calcularCompletudeHistoricoEscolar()` para incluir esses campos

  [ ] CP24.2: Implementar adapters se necessário
    [ ] T24.2.1: Criar função `adaptarCompletudeDadosEscolares()`:
      ```typescript
      function adaptarCompletudeDadosEscolares(item: CompletudeItem): ResumoDadosEscolares {
        return {
          totalSlots: item.totalCampos,
          slotsPreenchidos: item.camposPreenchidos,
          percentual: item.percentual,
          completo: item.status === "completo",
          status: item.status,
        };
      }
      ```
    [ ] T24.2.2: Usar adapter no hook se tipos forem incompatíveis

[ ] CP25: Testes das novas funções
  [ ] CP25.1: Testes unitários para `calcularCompletudeDadosEscolares()`
    [ ] T25.1.1: Localização: `/tests/lib/calcularCompletude.test.ts` (adicionar aos testes existentes)
    [ ] T25.1.2: Caso 1: Aluno com todos os slots preenchidos
      - situacaoEscolar preenchida
      - motivoEncerramento preenchido
      - tripla série válida
      - Espera: status "completo", percentual 100
    [ ] T25.1.3: Caso 2: Aluno sem nenhum slot
      - Campos vazios/nulos
      - Espera: status "ausente", percentual 0
    [ ] T25.1.4: Caso 3: Aluno com slots parciais
      - Apenas situacaoEscolar preenchida
      - Espera: status "incompleto", percentual ~33
    [ ] T25.1.5: Validar array de `camposFaltantes` está correto

  [ ] CP25.2: Testes unitários para `calcularCompletudeHistoricoEscolar()`
    [ ] T25.2.1: Caso 1: Aluno com 3 séries com históricos
      - Espera: status "completo", totalSeries 3, percentual 100
    [ ] T25.2.2: Caso 2: Aluno sem históricos
      - Espera: status "ausente", totalSeries 0, percentual 0
    [ ] T25.2.3: Caso 3: Aluno com 2 séries
      - Espera: status "incompleto", totalSeries 2, percentual ~67

  [ ] CP25.3: Testes unitários para `validarTriplaSerieMedio()`
    [ ] T25.3.1: Caso válido: 1 série "-" (mais antiga) + 2 séries "MÉDIO"
      - Espera: true
    [ ] T25.3.2: Caso inválido: 3 séries "MÉDIO"
      - Espera: false
    [ ] T25.3.3: Caso inválido: menos de 3 séries
      - Espera: false

  [ ] CP25.4: Testes de integração
    [ ] T25.4.1: Testar hook `useAlunosCertificacao` com funções DRY
      - Mock de dados de aluno
      - Verificar que `progressoDadosEscolares` é calculado corretamente
      - Verificar que `progressoHistoricoEscolar` é calculado corretamente
    [ ] T25.4.2: Testar componente `ListaAlunosCertificacao`
      - Renderizar com dados mockados
      - Verificar que ícones de status aparecem
      - Verificar tooltips com informações corretas

[ ] CP26: Atualizar documentação DRY
  [ ] CP26.1: Expandir documento existente
    [ ] T26.1.1: Abrir `/docs/dry/backend/validacao/calcular-completude.md`
    [ ] T26.1.2: Adicionar seção "Cálculo de Completude por Fase" após seção de documentos
    [ ] T26.1.3: Documentar função `calcularCompletudeDadosEscolares()`:
      - Descrição da função
      - Parâmetros e retorno
      - Lógica de validação (3 slots)
      - Exemplos de uso
    [ ] T26.1.4: Documentar função `calcularCompletudeHistoricoEscolar()`:
      - Descrição da função
      - Regra de 3 séries
      - Exemplos de uso
    [ ] T26.1.5: Documentar função auxiliar `validarTriplaSerieMedio()`:
      - Explicar regra específica
      - Casos de uso
    [ ] T26.1.6: Adicionar diagrama de fluxo (opcional):
      ```
      calcularCompletude.ts
      ├─ Documentos
      │  ├─ calcularCompletudeDocumento()
      │  └─ calcularCompletudeEmissao()
      └─ Fases
         ├─ calcularCompletudeDadosEscolares()
         ├─ calcularCompletudeHistoricoEscolar()
         └─ validarTriplaSerieMedio() (auxiliar)
      ```

  [ ] CP26.2: Atualizar metadados do DRY
    [ ] T26.2.1: Atualizar ID DRY no summary.md (se necessário):
      - Opção 1: Manter [DRY.BACKEND:CALCULAR_COMPLETUDE_DOCUMENTOS]
      - Opção 2: Renomear para [DRY.BACKEND:CALCULAR_COMPLETUDE] (mais genérico)
      - **Decisão:** Manter nome atual, expandir descrição
    [ ] T26.2.2: Atualizar descrição no `summary.md`:
      ```markdown
      20. [DRY.BACKEND:CALCULAR_COMPLETUDE_DOCUMENTOS](backend/validacao/calcular-completude.md#drybackendcalcular_completude_documentos) - Sistema de análise de completude baseado em def-objects para documentos e fases
      ```
    [ ] T26.2.3: Adicionar seção "Uso para Fases" no documento principal

  [ ] CP26.3: Adicionar exemplos práticos
    [ ] T26.3.1: Exemplo de uso em hook:
      ```typescript
      // Hook useAlunosCertificacao
      import { calcularCompletudeDadosEscolares } from '@/lib/.../calcularCompletude';

      const aluno = await prisma.aluno.findUnique({...});
      const completude = calcularCompletudeDadosEscolares(aluno);

      console.log(`Status: ${completude.status}`);
      console.log(`Percentual: ${completude.percentual}%`);
      ```
    [ ] T26.3.2: Exemplo de uso em componente:
      ```typescript
      // Componente ListaAlunosCertificacao
      const statusDadosEscolares = aluno.progressoDadosEscolares.status;
      const percentual = aluno.progressoDadosEscolares.percentual;
      ```

  [ ] CP26.4: Adicionar referências cruzadas
    [ ] T26.4.1: No arquivo DRY, adicionar seção "Componentes Relacionados":
      - Hook: `useAlunosCertificacao`
      - Componente: `ListaAlunosCertificacao`
      - Tipos: `CompletudeItem`, `ResumoDadosEscolares`, `ResumoHistoricoEscolar`
    [ ] T26.4.2: No arquivo DRY, adicionar seção "Features que Utilizam":
      - Emissão de Documentos (origem)
      - Listagem de Alunos (consumidor)

[ ] CP27: Validação final e garantias de uso do DRY
  [ ] CP27.1: Verificar imports no código
    [ ] T27.1.1: Executar comando:
      ```bash
      grep -r "calcularCompletudeDadosEscolares" src/hooks/
      ```
      - Deve encontrar import em `useAlunosCertificacao.ts`
    [ ] T27.1.2: Executar comando:
      ```bash
      grep -r "calcularCompletudeHistoricoEscolar" src/hooks/
      ```
      - Deve encontrar import em `useAlunosCertificacao.ts`
    [ ] T27.1.3: Verificar que imports vêm de `calcularCompletude.ts` (não código inline)

  [ ] CP27.2: Verificar comentários de rastreabilidade
    [ ] T27.2.1: Executar comando:
      ```bash
      grep -r "TEC8" src/
      ```
      - Deve encontrar comentários em:
        - `calcularCompletude.ts` (funções novas)
        - `useAlunosCertificacao.ts` (import)
    [ ] T27.2.2: Garantir formato correto: `[FEAT:emissao-documentos_TEC8.X]`

  [ ] CP27.3: Validar documentação DRY atualizada
    [ ] T27.3.1: Arquivo `/docs/dry/backend/validacao/calcular-completude.md`:
      - Contém seção "Cálculo por Fase"?
      - Funções documentadas: `calcularCompletudeDadosEscolares`, `calcularCompletudeHistoricoEscolar`?
      - Exemplos de uso claros?
    [ ] T27.3.2: Executar `pnpm summary:dry`
      - Verificar que summary.md foi atualizado

  [ ] CP27.4: Executar validações automatizadas
    [ ] T27.4.1: Executar `pnpm validate:dry`
      - Verificar se DRY está válido
    [ ] T27.4.2: Executar testes:
      ```bash
      pnpm test calcularCompletude
      pnpm test useAlunosCertificacao
      ```
      - Todos os testes devem passar

  [ ] CP27.5: Verificar integração com UI
    [ ] T27.5.1: Iniciar aplicação em dev: `pnpm dev`
    [ ] T27.5.2: Navegar para Painel de Alunos
    [ ] T27.5.3: Verificar que ícones de fases aparecem corretamente
    [ ] T27.5.4: Verificar tooltips com informações de completude
    [ ] T27.5.5: Testar com diferentes alunos (completos, incompletos, ausentes)

[ ] CP28: Documentar decisões técnicas no TECNICO.md
  [ ] CP28.1: Criar entrada TEC8 principal
    [ ] T28.1.1: Localização: `/docs/features/emissao-documentos/TECNICO.md`
    [ ] T28.1.2: Adicionar seção:
      ```markdown
      ## TEC8: Extensão de Sistema de Completude para Fases

      **Motivação:**
      Código original tinha lógica inline de cálculo de completude em `useAlunosCertificacao`.
      Esta lógica era conceitualmente idêntica ao sistema implementado para documentos na Sessão 3.
      Ao estender o sistema existente, ganhamos:
      1. Reutilização de padrão testado
      2. Consistência entre documentos e fases
      3. Uso de def-objects como fonte única da verdade
      4. Facilita manutenção futura

      **Alternativas Consideradas:**
      - ❌ Manter código inline: Duplicação de lógica, dificulta manutenção
      - ❌ Criar novo DRY separado: Violaria princípio DRY (duplicaria padrão)
      - ✅ Estender DRY existente: Reutiliza padrão, mantém consistência

      **Decisão:**
      Estender [DRY.BACKEND:CALCULAR_COMPLETUDE_DOCUMENTOS] para suportar fases,
      seguindo exatamente o mesmo padrão de documentos.

      **Referências no Código:**
      - `/src/lib/core/data/gestao-alunos/documentos/calcularCompletude.ts:XXX` - novas funções
      - `/src/hooks/useAlunosCertificacao.ts:XXX` - código refatorado
      ```

  [ ] CP28.2: Criar entrada TEC8.1 - Uso de def-objects
    [ ] T28.2.1: Adicionar subseção:
      ```markdown
      ### TEC8.1: Uso de def-objects vs Lógica Inline

      **Motivação:**
      Função original `calcularResumoDadosEscolares()` usa lógica inline (3 slots fixos).
      Precisávamos decidir se usar def-objects como fonte ou manter lógica inline.

      **Alternativas:**
      - ❌ Lógica inline pura: Não segue padrão de def-objects, fonte da verdade duplicada
      - ⚠️ Híbrido: Usa def-objects mas tem validações customizadas
      - ✅ Def-objects como base + validadores específicos: Melhor dos dois mundos

      **Decisão:**
      Usar def-objects como fonte primária de campos obrigatórios, mas permitir
      validadores customizados para lógica específica (ex: validação de tripla série).

      **Referências no Código:**
      - `/src/lib/core/data/gestao-alunos/documentos/calcularCompletude.ts:XXX` - `calcularCompletudeDadosEscolares()`
      - `/src/lib/core/data/gestao-alunos/documentos/calcularCompletude.ts:XXX` - `validarTriplaSerieMedio()`
      ```

  [ ] CP28.3: Criar entrada TEC8.2 - Validação de tripla série
    [ ] T28.3.1: Adicionar subseção:
      ```markdown
      ### TEC8.2: Validação de Tripla Série do Médio

      **Motivação:**
      Regra específica do sistema: aluno deve ter cursado 1 série "-" (mais antiga)
      seguida de 2 séries "MÉDIO" para conclusão do ensino médio regular.

      **Decisão:**
      Mover função `possuiTriplaSerieMedio()` do hook para `calcularCompletude.ts`
      como `validarTriplaSerieMedio()`. Mantém lógica de ordenação por ano letivo
      e validação de segmentos.

      **Referências no Código:**
      - `/src/lib/core/data/gestao-alunos/documentos/calcularCompletude.ts:XXX` - `validarTriplaSerieMedio()`
      - Auxiliares: `normalizarSegmento()`, `compararAnoLetivoAsc()`
      ```

  [ ] CP28.4: Criar entrada TEC8.3 - Cálculo de histórico escolar
    [ ] T28.4.1: Adicionar subseção:
      ```markdown
      ### TEC8.3: Cálculo de Completude de Histórico Escolar

      **Motivação:**
      Histórico escolar requer que aluno tenha registros de componentes curriculares
      para 3 séries do ensino médio.

      **Decisão:**
      Implementar `calcularCompletudeHistoricoEscolar()` que:
      1. Conta séries com históricos vinculados
      2. Status "completo" se totalSeries >= 3
      3. Retorna estrutura compatível com `CompletudeItem`

      **Referências no Código:**
      - `/src/lib/core/data/gestao-alunos/documentos/calcularCompletude.ts:XXX` - função principal
      ```

---

### Observações Técnicas da Sessão 4

#### Compatibilidade com Código Existente
A refatoração mantém compatibilidade com componentes existentes. Se tipos forem incompatíveis, adapters devem ser criados para mapear entre `CompletudeItem` e tipos inline antigos (`ResumoDadosEscolares`, `ResumoHistoricoEscolar`).

#### Fonte Única da Verdade
Def-objects continuam sendo a fonte única da verdade para campos obrigatórios. Validações específicas (como tripla série) são implementadas como funções auxiliares que complementam a análise baseada em def-objects.

#### Performance
Funções são puras e eficientes. Não fazem queries adicionais ao banco, apenas analisam dados já carregados pelo hook.

#### Expansibilidade Futura
- Adicionar novas fases: criar função `calcularCompletude[NomeFase]()`
- Modificar regras de completude: atualizar def-objects ou validadores customizados
- Criar dashboard de completude: reutilizar funções existentes

---

## Sessão 5 (Refatoração: Convergência de Cálculo de Completude) - Feature: Emissão de Documentos

### Contexto
A Sessão 4 implementou funções de completude para fases (`calcularCompletudeDadosEscolares` e `calcularCompletudeHistoricoEscolar`), mas essas funções NÃO seguem o mesmo padrão da função `calcularCompletudeDocumento()`.

**Problema identificado:**
- `calcularCompletudeDocumento()` analisa campos baseados nos def-objects (fonte única da verdade)
- `calcularCompletudeDadosEscolares()` usa 3 slots hard-coded (`situacaoEscolar`, `motivoEncerramento`, `triplaSerieMedio`) que **não aparecem em documentos**
- `calcularCompletudeHistoricoEscolar()` apenas conta se tem 3 séries, mas não verifica campos específicos

**Consequência:**
- Emissão de Documentos mostra poucos campos faltantes (apenas os usados em documentos)
- Lista de Alunos (ícones de fase) mostra muitos campos faltantes (campos diferentes)
- **Números não convergem** - são bases de cálculo diferentes

### Motivação
Garantir que as funções de completude de fases analisem **exatamente os mesmos campos** que a Emissão de Documentos analisa, para que:
1. Os números de completude possam convergir
2. Def-objects continuem sendo a fonte única da verdade
3. Um campo só seja analisado se for usado em algum documento

### Componentes DRY Usados
- [DRY.BACKEND:CALCULAR_COMPLETUDE_DOCUMENTOS] - **REFATORADO** nesta sessão
- [DRY.OBJECT:PHASES] - Configuração de fases (def-objects)

### Referências de Código
- **Código a refatorar:** `/src/lib/core/data/gestao-alunos/documentos/calcularCompletude.ts`
  - `calcularCompletudeDadosEscolares()` - linhas 186-254 (REFATORAR)
  - `calcularCompletudeHistoricoEscolar()` - linhas 257-306 (REFATORAR)
  - `validarTriplaSerieMedio()` - linhas 309-327 (REMOVER - não é usado em documentos)
- **Sistema existente (padrão a seguir):**
  - `calcularCompletudeDocumento()` - linhas 94-148 (PADRÃO CORRETO)
- **Def-objects:**
  - `/src/lib/core/data/gestao-alunos/def-objects/dadosEscolares.ts` - campos da FASE:DADOS_ESCOLARES
  - `/src/lib/core/data/gestao-alunos/def-objects/historicoEscolar.ts` - campos da FASE:HISTORICO_ESCOLAR

### Checkpoints

[ ] CP29: Análise da refatoração necessária
  [ ] CP29.1: Identificar campos que DEVEM ser analisados por fase
    [ ] T29.1.1: Analisar def-object `dadosEscolares.ts`:
      - Aluno.matricula: ["Certidão", "Certificado"]
      - Aluno.nome: ["Certidão", "Certificado", "Diploma", "Histórico Escolar"]
      - Aluno.sexo: ["Certidão", "Certificado", "Diploma", "Histórico Escolar"]
      - Aluno.dataNascimento: ["Certidão", "Certificado", "Diploma", "Histórico Escolar"]
      - Aluno.nacionalidade: ["Certidão", "Certificado", "Diploma"]
      - Aluno.naturalidade: ["Certidão", "Certificado", "Diploma"]
      - SerieCursada.segmento: ["Certidão", "Certificado", "Diploma"]
      - SerieCursada.cargaHorariaTotal: ["Certificado", "Diploma"]
      - **TOTAL:** ~8 campos usados em documentos
    [ ] T29.1.2: Campos atualmente analisados (INCORRETOS):
      - `situacaoEscolar` - **NÃO aparece em documentos** (array vazio no def-object linha 39)
      - `motivoEncerramento` - **NÃO aparece em documentos** (array vazio linha 41)
      - `triplaSerieMedio` - **NÃO é um campo, é uma validação customizada**
    [ ] T29.1.3: Analisar def-object `historicoEscolar.ts`:
      - SerieCursada.anoLetivo: ["Histórico Escolar"]
      - SerieCursada.serie: ["Histórico Escolar"]
      - SerieCursada.periodoLetivo: ["Histórico Escolar"]
      - SerieCursada.segmento: ["Histórico Escolar"]
      - SerieCursada.cargaHorariaTotal: ["Histórico Escolar"]
      - HistoricoEscolar.totalPontos: ["Histórico Escolar"]
      - HistoricoEscolar.componenteCurricular: ["Histórico Escolar"]
      - HistoricoEscolar.cargaHoraria: ["Histórico Escolar"]
      - **TOTAL:** ~8 campos usados no documento "Histórico Escolar"

  [ ] CP29.2: Decisão de estratégia de refatoração
    [ ] T29.2.1: **Decisão principal:** Reutilizar lógica de `calcularCompletudeDocumento()`
      - **Não** criar lógica separada para fases
      - **Sim** adaptar função existente para suportar filtro por fase
    [ ] T29.2.2: **Alternativas consideradas:**
      - ❌ Manter funções separadas com lógica duplicada: Viola DRY
      - ❌ Criar função nova que itera def-objects apenas da fase: Duplica lógica
      - ✅ Criar função helper que filtra campos por fase + reutiliza lógica existente
    [ ] T29.2.3: **Abordagem escolhida:**
      - Criar função `calcularCompletudeFase(fase, dadosAluno)` que:
        1. Filtra def-objects pela fase desejada
        2. Itera campos dessa fase que são usados em **qualquer documento**
        3. Reutiliza funções helper existentes (`campoEstaPreenchido`, `valorPreenchido`, etc)

[ ] CP30: Criar nova função genérica para fases
  [ ] CP30.1: Implementar `calcularCompletudeFase()`
    [ ] T30.1.1: Localização: `/src/lib/core/data/gestao-alunos/documentos/calcularCompletude.ts`
    [ ] T30.1.2: Adicionar após `calcularCompletudeEmissao()` (antes das funções antigas de fase)
    [ ] T30.1.3: Assinatura:
      ```typescript
      // [FEAT:emissao-documentos_TEC9.1] Calcula completude de fase baseado em def-objects
      // Analisa apenas campos que são usados em algum documento
      function calcularCompletudeFase(
        fase: Phase,
        dadosAluno: DadosAlunoCompleto
      ): CompletudeItem
      ```
    [ ] T30.1.4: Implementação:
      ```typescript
      function calcularCompletudeFase(
        fase: Phase,
        dadosAluno: DadosAlunoCompleto
      ): CompletudeItem {
        let totalCampos = 0;
        let camposPreenchidos = 0;
        const camposFaltantes: CampoFaltante[] = [];

        // Encontrar def-object correspondente à fase
        const defObj = DEF_OBJECTS.find(obj => obj.fase === fase);
        if (!defObj) {
          // Fase não possui def-object, retornar ausente
          return {
            fase,
            status: "ausente",
            percentual: 0,
            camposPreenchidos: 0,
            totalCampos: 0,
            camposFaltantes: [],
          };
        }

        // Iterar campos do def-object da fase
        for (const [tabela, campos] of Object.entries(defObj.schema)) {
          for (const [campo, documentos] of Object.entries(campos)) {
            // FILTRO: só considerar campos usados em ALGUM documento
            if (!Array.isArray(documentos) || documentos.length === 0) continue;

            totalCampos += 1;
            const preenchido = campoEstaPreenchido(tabela, campo, dadosAluno);

            if (preenchido) {
              camposPreenchidos += 1;
            } else {
              camposFaltantes.push({
                campo,
                label: obterLabelCampo(campo),
                tabela,
                fase,
              });
            }
          }
        }

        // Calcular status e percentual (mesma lógica de documentos)
        const percentual =
          totalCampos === 0
            ? 0
            : Math.round((camposPreenchidos / totalCampos) * 100);

        let status: PhaseStatus = "incompleto";
        if (totalCampos === 0 || camposPreenchidos === 0) {
          status = "ausente";
        } else if (camposPreenchidos === totalCampos) {
          status = "completo";
        }

        return {
          fase,
          status,
          percentual,
          camposPreenchidos,
          totalCampos,
          camposFaltantes,
        };
      }
      ```
    [ ] T30.1.5: Comentário de rastreabilidade:
      ```typescript
      // [FEAT:emissao-documentos_TEC9.1] Calcula completude de fase usando def-objects
      // Garante que fases analisem mesmos campos que documentos (convergência)
      ```

[ ] CP31: Refatorar `calcularCompletudeDadosEscolares()`
  [ ] CP31.1: Simplificar para usar nova função genérica
    [ ] T31.1.1: DELETAR implementação atual (linhas 186-254)
    [ ] T31.1.2: Nova implementação:
      ```typescript
      // [FEAT:emissao-documentos_TEC9.2] Calcula completude FASE:DADOS_ESCOLARES
      export function calcularCompletudeDadosEscolares(
        dadosAluno: DadosAlunoCompleto
      ): ResumoDadosEscolares {
        const resultado = calcularCompletudeFase("FASE:DADOS_ESCOLARES", dadosAluno);

        // Adapter para manter compatibilidade com tipo ResumoDadosEscolares
        return {
          ...resultado,
          totalSlots: resultado.totalCampos,
          slotsPreenchidos: resultado.camposPreenchidos,
          completo: resultado.status === "completo",
        };
      }
      ```
    [ ] T31.1.3: Verificar que tipos são compatíveis (ResumoDadosEscolares extends CompletudeItem)

[ ] CP32: Refatorar `calcularCompletudeHistoricoEscolar()`
  [ ] CP32.1: Simplificar para usar nova função genérica
    [ ] T32.1.1: DELETAR implementação atual (linhas 257-306)
    [ ] T32.1.2: Nova implementação:
      ```typescript
      // [FEAT:emissao-documentos_TEC9.3] Calcula completude FASE:HISTORICO_ESCOLAR
      export function calcularCompletudeHistoricoEscolar(
        dadosAluno: DadosAlunoCompleto
      ): ResumoHistoricoEscolar {
        const resultado = calcularCompletudeFase("FASE:HISTORICO_ESCOLAR", dadosAluno);

        // Calcular totalRegistros e totalSeries para compatibilidade
        const series = obterSeriesCursadas(dadosAluno);
        const { totalRegistros, totalSeries } = series.reduce(
          (acc, serie) => {
            const count =
              serie._count?.historicos ??
              (Array.isArray(serie.historicos) ? serie.historicos.length : 0);
            return {
              totalRegistros: acc.totalRegistros + count,
              totalSeries: acc.totalSeries + (count > 0 ? 1 : 0),
            };
          },
          { totalRegistros: 0, totalSeries: 0 }
        );

        // Adapter para manter compatibilidade com tipo ResumoHistoricoEscolar
        return {
          ...resultado,
          totalRegistros,
          totalSeries,
          completo: resultado.status === "completo",
        };
      }
      ```
    [ ] T32.1.3: Manter cálculo de `totalRegistros` e `totalSeries` para compatibilidade com UI

[ ] CP33: Remover código não utilizado
  [ ] CP33.1: Remover função `validarTriplaSerieMedio()`
    [ ] T33.1.1: DELETAR função `validarTriplaSerieMedio()` (linhas 309-327)
      - Não é usada em documentos
      - Não é um campo do def-object
      - Era uma validação customizada que não segue o padrão
    [ ] T33.1.2: DELETAR funções auxiliares:
      - `normalizarSegmento()` (linha 329)
      - `compararAnoLetivoAsc()` (linha 333)
    [ ] T33.1.3: Verificar se essas funções são usadas em outros lugares:
      ```bash
      grep -r "validarTriplaSerieMedio" src/
      grep -r "normalizarSegmento" src/
      grep -r "compararAnoLetivoAsc" src/
      ```
    [ ] T33.1.4: Se não forem usadas em outros lugares, deletar completamente

  [ ] CP33.2: Atualizar exports
    [ ] T33.2.1: Remover export de `validarTriplaSerieMedio` se estava exportada
    [ ] T33.2.2: Manter exports de:
      - `calcularCompletudeDocumento`
      - `calcularCompletudeEmissao`
      - `calcularCompletudeDadosEscolares`
      - `calcularCompletudeHistoricoEscolar`
      - Tipos: `CompletudeItem`, `CompletudeDocumento`, `ResumoCompletudeEmissao`, etc.

[ ] CP34: Refatorar FASE:DADOS_PESSOAIS para usar def-objects
  [ ] CP34.1: Análise da situação atual
    [ ] T34.1.1: Verificar implementação de `calcularResumoDadosPessoais()`
      - Localização: `/src/lib/importacao/dadosPessoaisMetadata.ts:223`
      - **PROBLEMA:** Usa lista hard-coded `CAMPOS_DADOS_PESSOAIS` (34 campos)
      - **PROBLEMA:** NÃO usa def-object `dadosPessoais.ts`
      - **PROBLEMA:** Analisa TODOS os 34 campos, independente de serem usados em documentos
      - **CONSEQUÊNCIA:** Números NÃO convergem com Emissão de Documentos
    [ ] T34.1.2: Verificar def-object `dadosPessoais.ts` existe:
      - Localização: `/src/lib/core/data/gestao-alunos/def-objects/dadosPessoais.ts`
      - Contém campos marcados por documento (ex: nome: ["Certidão", "Certificado", ...])
      - **TOTAL de campos usados em documentos:** ~13 campos (não 34!)
    [ ] T34.1.3: Comparar listas de campos:
      - `CAMPOS_DADOS_PESSOAIS` (hard-coded): 34 campos
      - `dadosPessoais.Aluno` (def-object) com documentos: ~13 campos
      - **Divergência:** 21 campos analisados que NÃO são usados em documentos!

  [ ] CP34.2: Identificar impactos da refatoração
    [ ] T34.2.1: Arquivos que usam `calcularResumoDadosPessoais()`:
      - `/src/hooks/useAlunosCertificacao.ts` - hook principal (IMPACTO: precisa migrar)
      - Outros usos? Executar: `grep -r "calcularResumoDadosPessoais" src/`
    [ ] T34.2.2: Arquivos que usam tipo `ResumoDadosPessoais`:
      - `/src/hooks/useAlunosCertificacao.ts`
      - `/src/components/ListaAlunosCertificacao.tsx` - UI (IMPACTO: verificar compatibilidade)
      - `/tests/integration/emissao-documentos-completude.test.ts` - testes (IMPACTO: atualizar)
    [ ] T34.2.3: Arquivos que usam `CAMPOS_DADOS_PESSOAIS_CONFIG`:
      - `/src/components/DadosAlunoEditavel.tsx` - formulário de edição (IMPACTO: **NENHUM** - continua usando)
      - `/src/hooks/useAlunoSelecionado.ts` - (IMPACTO: verificar)
      - **IMPORTANTE:** Formulário de edição pode continuar usando CAMPOS_DADOS_PESSOAIS_CONFIG
    [ ] T34.2.4: Avaliar se `CAMPOS_DADOS_PESSOAIS` deve ser mantido:
      - **SIM** - Formulário de edição precisa de todos os 34 campos
      - **SIM** - Funcionalidade de importação/edição é diferente de cálculo de completude
      - **Decisão:** Manter `CAMPOS_DADOS_PESSOAIS` para edição, criar nova função para completude

  [ ] CP34.3: Estratégia de refatoração
    [ ] T34.3.1: **NÃO modificar** arquivo `dadosPessoaisMetadata.ts`:
      - Manter `CAMPOS_DADOS_PESSOAIS` e `calcularResumoDadosPessoais()` existentes
      - Esses são usados para funcionalidade de **edição completa** de dados
      - Diferentes de cálculo de completude para **documentos**
    [ ] T34.3.2: **Criar nova função** em `calcularCompletude.ts`:
      - `calcularCompletudeDadosPessoais()` - usa def-objects, analisa apenas campos de documentos
      - Reutiliza função genérica `calcularCompletudeFase("FASE:DADOS_PESSOAIS", ...)`
    [ ] T34.3.3: **Migrar hook** para usar nova função:
      - Hook usa função de completude (baseada em documentos)
      - Formulário de edição continua usando função antiga (todos os campos)

  [ ] CP34.4: Implementar nova função de completude
    [ ] T34.4.1: Adicionar função em `calcularCompletude.ts`:
      ```typescript
      // [FEAT:emissao-documentos_TEC9.4] Calcula completude FASE:DADOS_PESSOAIS
      export function calcularCompletudeDadosPessoais(
        dadosAluno: DadosAlunoCompleto
      ): CompletudeItem {
        return calcularCompletudeFase("FASE:DADOS_PESSOAIS", dadosAluno);
      }
      ```
    [ ] T34.4.2: Verificar compatibilidade de tipos:
      - `CompletudeItem` vs `ResumoDadosPessoais`
      - Campos comuns: `totalCampos`, `camposPreenchidos`, `percentual`
      - Campo diferente: `completo` (ResumoDadosPessoais) vs `status` (CompletudeItem)
      - Campo diferente: `pendentes` (ResumoDadosPessoais) vs `camposFaltantes` (CompletudeItem)
    [ ] T34.4.3: Criar adapter se necessário:
      ```typescript
      export type ResumoDadosPessoaisCompletude = CompletudeItem & {
        completo: boolean;
        pendentes?: string[];  // lista de nomes de campos (opcional, para compatibilidade)
      };

      export function calcularCompletudeDadosPessoais(
        dadosAluno: DadosAlunoCompleto
      ): ResumoDadosPessoaisCompletude {
        const resultado = calcularCompletudeFase("FASE:DADOS_PESSOAIS", dadosAluno);

        return {
          ...resultado,
          completo: resultado.status === "completo",
          pendentes: resultado.camposFaltantes?.map(c => c.campo),
        };
      }
      ```

  [ ] CP34.5: Atualizar hook useAlunosCertificacao
    [ ] T34.5.1: Remover import de `dadosPessoaisMetadata.ts`:
      ```typescript
      // DELETAR:
      import {
        calcularResumoDadosPessoais,
        ResumoDadosPessoais,
        ValoresDadosPessoais,
      } from "@/lib/importacao/dadosPessoaisMetadata";
      ```
    [ ] T34.5.2: Adicionar import de `calcularCompletude.ts`:
      ```typescript
      import {
        calcularCompletudeDadosPessoais,
        type ResumoDadosPessoaisCompletude,
      } from '@/lib/core/data/gestao-alunos/documentos/calcularCompletude';
      ```
    [ ] T34.5.3: Atualizar tipo `AlunoCertificacao`:
      ```typescript
      export type AlunoCertificacao = AlunoApiResponse & {
        progressoDadosPessoais: ResumoDadosPessoaisCompletude;  // atualizado
        progressoDadosEscolares: ResumoDadosEscolares;
        progressoHistoricoEscolar: ResumoHistoricoEscolar;
        progressoEmissaoDocumentos: ResumoCompletudeEmissao;
      };
      ```
    [ ] T34.5.4: Atualizar função `obterAlunosCertificacao`:
      ```typescript
      // ANTES:
      progressoDadosPessoais: calcularResumoDadosPessoais(aluno),

      // DEPOIS:
      progressoDadosPessoais: calcularCompletudeDadosPessoais(aluno),
      ```
    [ ] T34.5.5: Manter export de `ValoresDadosPessoais` se usado em outros lugares

  [ ] CP34.6: Verificar compatibilidade com componente ListaAlunosCertificacao
    [ ] T34.6.1: Função `montarStatusPorFase()` (linha 291):
      - Acessa: `aluno.progressoDadosPessoais.camposPreenchidos` ✅ existe
      - Acessa: `aluno.progressoDadosPessoais.totalCampos` ✅ existe
      - **APÓS refatoração:** valores serão diferentes (menos campos)
    [ ] T34.6.2: Função `mapearStatusPessoais()` (linha 324):
      - Acessa: `resumo.completo` ✅ existe no adapter
      - Acessa: `resumo.camposPreenchidos` ✅ existe
      - **Compatível** com adapter
    [ ] T34.6.3: Verificar se UI precisa de ajustes:
      - Tooltip mostrará menos campos faltantes (apenas os usados em documentos)
      - Percentual será diferente (base de cálculo diferente)
      - **Isso é o comportamento desejado!**

  [ ] CP34.7: Atualizar testes
    [ ] T34.7.1: Arquivo: `/tests/integration/emissao-documentos-completude.test.ts`
      - Verificar se testa `progressoDadosPessoais`
      - Atualizar expectativas para nova lógica (baseada em def-objects)
    [ ] T34.7.2: Arquivo: `/tests/lib/importacao/dadosPessoaisMetadata.test.ts`
      - **NÃO modificar** - testa função antiga (ainda usada para edição)
    [ ] T34.7.3: Criar novos testes em `/tests/lib/calcularCompletude.test.ts`:
      - Testar `calcularCompletudeDadosPessoais()`
      - Caso 1: Aluno com todos os campos de def-object preenchidos → "completo"
      - Caso 2: Aluno sem nenhum campo → "ausente"
      - Caso 3: Aluno com campos parciais → "incompleto"
      - Verificar que NÃO analisa campos que não aparecem em documentos

  [ ] CP34.8: Documentar divergência entre funções
    [ ] T34.8.1: Criar comentário em `dadosPessoaisMetadata.ts`:
      ```typescript
      /**
       * [DEPRECATED para cálculo de completude de documentos]
       *
       * Esta função calcula completude de TODOS os 34 campos de dados pessoais,
       * independente de serem usados em documentos de emissão.
       *
       * USO ATUAL:
       * - Formulário de edição completa de dados pessoais (DadosAlunoEditavel.tsx)
       * - Funcionalidades de importação que precisam validar todos os campos
       *
       * PARA CÁLCULO DE COMPLETUDE DE DOCUMENTOS:
       * - Use `calcularCompletudeDadosPessoais()` de `calcularCompletude.ts`
       * - Essa função usa def-objects e analisa apenas campos usados em documentos
       *
       * @see calcularCompletudeDadosPessoais - para completude de documentos
       */
      export function calcularResumoDadosPessoais(
        aluno: ValoresDadosPessoais
      ): ResumoDadosPessoais {
        // ... implementação existente
      }
      ```
    [ ] T34.8.2: Adicionar comentário em `calcularCompletude.ts`:
      ```typescript
      /**
       * Calcula completude de DADOS PESSOAIS baseado em def-objects.
       *
       * IMPORTANTE: Analisa apenas campos que são usados em documentos de emissão.
       *
       * DIFERENÇA em relação a `calcularResumoDadosPessoais()`:
       * - Esta função: ~13 campos (apenas os usados em documentos)
       * - Função antiga: 34 campos (todos os campos de edição)
       *
       * @see dadosPessoaisMetadata.calcularResumoDadosPessoais - para validação completa de edição
       */
      export function calcularCompletudeDadosPessoais(...) { ... }
      ```

[ ] CP35: Testes das funções refatoradas
  [ ] CP35.1: Verificar testes existentes
    [ ] T35.1.1: Localização: `/tests/lib/calcularCompletude.test.ts`
    [ ] T35.1.2: Verificar se existem testes para `calcularCompletudeDadosEscolares()`
    [ ] T35.1.3: Verificar se existem testes para `calcularCompletudeHistoricoEscolar()`

  [ ] CP35.2: Atualizar testes para nova implementação
    [ ] T35.2.1: Testes de `calcularCompletudeDadosEscolares()`:
      - **ANTES:** testava 3 slots (situacaoEscolar, motivoEncerramento, triplaSerie)
      - **DEPOIS:** deve testar campos de `dadosEscolares.ts` usados em documentos
      - Casos de teste:
        1. Aluno com todos os campos de dadosEscolares preenchidos → "completo"
        2. Aluno sem nenhum campo → "ausente"
        3. Aluno com campos parciais → "incompleto"
        4. Verificar `camposFaltantes` contém campos corretos do def-object
    [ ] T35.2.2: Testes de `calcularCompletudeHistoricoEscolar()`:
      - **ANTES:** testava apenas contagem de séries (>= 3)
      - **DEPOIS:** deve testar campos de `historicoEscolar.ts` usados em documentos
      - Casos de teste:
        1. Aluno com todos os campos de histórico preenchidos → "completo"
        2. Aluno sem históricos → "ausente"
        3. Aluno com históricos parciais → "incompleto"
        4. Verificar `camposFaltantes` contém campos corretos do def-object
    [ ] T35.2.3: Testar função genérica `calcularCompletudeFase()`:
      - Caso 1: Fase válida com def-object
      - Caso 2: Fase sem def-object → retorna "ausente"
      - Caso 3: Def-object com campos vazios (sem documentos) → retorna "ausente"

  [ ] CP35.3: Executar testes
    [ ] T35.3.1: Executar suite de testes:
      ```bash
      pnpm test calcularCompletude
      ```
    [ ] T35.3.2: Garantir 100% de cobertura das funções refatoradas
    [ ] T35.3.3: Corrigir falhas se houver

[ ] CP36: Verificar integração com UI
  [ ] CP36.1: Testar em desenvolvimento
    [ ] T36.1.1: Iniciar aplicação: `pnpm dev`
    [ ] T36.1.2: Navegar para Painel de Alunos
    [ ] T36.1.3: Verificar ícones de fase:
      - FASE:DADOS_ESCOLARES deve mostrar status baseado em campos de documentos
      - FASE:HISTORICO_ESCOLAR deve mostrar status baseado em campos de documentos
    [ ] T36.1.4: Comparar números com Emissão de Documentos:
      - **ANTES:** números diferentes (fases vs documentos)
      - **DEPOIS:** números devem convergir (mesma base de cálculo)

  [ ] CP36.2: Verificar tooltips e campos faltantes
    [ ] T36.2.1: Hover sobre ícone de DADOS_ESCOLARES
      - Tooltip deve mostrar campos de `dadosEscolares.ts` que faltam
      - **NÃO** deve mostrar `situacaoEscolar` ou `motivoEncerramento`
    [ ] T36.2.2: Hover sobre ícone de HISTORICO_ESCOLAR
      - Tooltip deve mostrar campos de `historicoEscolar.ts` que faltam
      - Deve incluir campos como `anoLetivo`, `serie`, `componenteCurricular`, etc.

  [ ] CP36.3: Testar com diferentes perfis de alunos
    [ ] T36.3.1: Aluno completo (todos os campos preenchidos)
      - Todas as fases devem mostrar "completo"
      - Emissão de documentos deve mostrar todos prontos
    [ ] T36.3.2: Aluno com dados parciais
      - Fases devem mostrar "incompleto" com mesmos campos faltantes dos documentos
    [ ] T36.3.3: Aluno novo (sem dados)
      - Fases devem mostrar "ausente"

[ ] CP37: Atualizar documentação DRY
  [ ] CP37.1: Atualizar documento de completude
    [ ] T37.1.1: Abrir `/docs/dry/backend/validacao/calcular-completude.md`
    [ ] T37.1.2: Atualizar seção "Cálculo de Completude por Fase"
    [ ] T37.1.3: Documentar nova estratégia:
      - Fases agora usam mesma lógica de documentos
      - Campos analisados vêm dos def-objects
      - Apenas campos usados em documentos são considerados
    [ ] T37.1.4: Adicionar diagrama atualizado:
      ```
      calcularCompletude.ts
      ├─ calcularCompletudeDocumento(doc, dados)
      │  └─ Analisa campos de def-objects para documento específico
      ├─ calcularCompletudeEmissao(dados)
      │  └─ Consolida completude de todos os documentos
      └─ calcularCompletudeFase(fase, dados) [NOVA FUNÇÃO GENÉRICA]
         ├─ Filtra def-object da fase
         ├─ Analisa campos usados em qualquer documento
         └─ Reutiliza helpers existentes
         ├─ calcularCompletudeDadosEscolares(dados) → usa calcularCompletudeFase()
         └─ calcularCompletudeHistoricoEscolar(dados) → usa calcularCompletudeFase()
      ```
    [ ] T37.1.5: Adicionar nota de convergência:
      > **Convergência de Cálculos:**
      > As funções de completude de fases agora analisam exatamente os mesmos campos
      > que a emissão de documentos, garantindo que os números possam convergir.
      > Um campo só é considerado se for usado em pelo menos um documento.

  [ ] CP37.2: Executar validação DRY
    [ ] T37.2.1: Executar `pnpm validate:dry`
    [ ] T37.2.2: Executar `pnpm summary:dry` para atualizar summary.md
    [ ] T37.2.3: Corrigir erros se houver

[ ] CP38: Documentar decisões técnicas no TECNICO.md
  [ ] CP38.1: Criar entrada TEC9 principal
    [ ] T38.1.1: Localização: `/docs/features/emissao-documentos/TECNICO.md`
    [ ] T38.1.2: Adicionar seção:
      ```markdown
      ## TEC9: Refatoração - Convergência de Cálculo de Completude

      **Motivação:**
      Sessão 4 implementou funções de completude para fases, mas não seguiam o padrão
      de `calcularCompletudeDocumento()`. Isso causou incongruência:
      - Emissão de Documentos analisava campos de def-objects
      - Fases analisavam campos hard-coded diferentes
      - Resultado: números não convergiam

      **Problema Identificado:**
      - `calcularCompletudeDadosEscolares()` analisava `situacaoEscolar`,
        `motivoEncerramento`, `triplaSerieMedio` - campos que **não aparecem em documentos**
      - `calcularCompletudeHistoricoEscolar()` apenas contava séries, sem analisar campos

      **Alternativas Consideradas:**
      - ❌ Manter funções separadas: Duplicação de lógica, viola DRY
      - ❌ Adicionar campos customizados aos def-objects: Poluiria def-objects com campos não usados
      - ✅ Criar função genérica que filtra def-objects por fase: Reutiliza lógica, garante convergência

      **Decisão:**
      Criar função `calcularCompletudeFase(fase, dadosAluno)` que:
      1. Filtra def-object pela fase desejada
      2. Analisa apenas campos que são usados em algum documento
      3. Reutiliza helpers existentes (`campoEstaPreenchido`, `valorPreenchido`, etc)
      4. Garante que fases e documentos usem mesma base de cálculo

      **Referências no Código:**
      - `/src/lib/core/data/gestao-alunos/documentos/calcularCompletude.ts:XXX` - `calcularCompletudeFase()`
      - `/src/lib/core/data/gestao-alunos/documentos/calcularCompletude.ts:XXX` - funções refatoradas
      ```

  [ ] CP38.2: Criar entrada TEC9.1 - Função genérica
    [ ] T38.2.1: Adicionar subseção:
      ```markdown
      ### TEC9.1: Função Genérica calcularCompletudeFase()

      **Motivação:**
      Evitar duplicação de lógica entre fases e documentos. Garantir que todas
      as análises de completude sigam mesmo padrão e usem def-objects.

      **Implementação:**
      - Recebe fase como parâmetro
      - Encontra def-object correspondente
      - Itera campos que são usados em algum documento (array não-vazio)
      - Reutiliza 100% da lógica de helpers existentes

      **Vantagens:**
      - DRY: uma única implementação para documentos e fases
      - Consistência: mesma lógica de status, percentual, campos faltantes
      - Manutenibilidade: mudanças em def-objects refletem automaticamente

      **Referências no Código:**
      - `/src/lib/core/data/gestao-alunos/documentos/calcularCompletude.ts:XXX`
      ```

  [ ] CP38.3: Criar entrada TEC9.2 - Remoção de código customizado
    [ ] T38.2.2: Adicionar subseção:
      ```markdown
      ### TEC9.2: Remoção de Validações Customizadas

      **Motivação:**
      Funções `validarTriplaSerieMedio()`, `normalizarSegmento()`, `compararAnoLetivoAsc()`
      foram criadas na Sessão 4 para validar regras específicas que **não são usadas
      em documentos**.

      **Decisão:**
      Remover completamente essas funções, pois:
      1. Não são campos de def-objects
      2. Não são usados em nenhum documento
      3. Criavam divergência com cálculo de documentos

      **Nota:**
      Se no futuro essas validações forem necessárias para lógica de negócio
      (não relacionada a documentos), devem ser implementadas em módulo separado,
      **não** nas funções de completude.

      **Referências no Código:**
      - Código removido: `validarTriplaSerieMedio()`, `normalizarSegmento()`, `compararAnoLetivoAsc()`
      ```

[ ] CP39: Validação final
  [ ] CP39.1: Checklist de convergência
    [ ] T39.1.1: Executar aplicação e comparar números:
      - Emissão de Documentos: X campos faltantes
      - Ícone FASE:DADOS_ESCOLARES: X campos faltantes (deve ser igual)
      - Ícone FASE:HISTORICO_ESCOLAR: Y campos faltantes
      - **Números devem convergir**
    [ ] T39.1.2: Verificar campos faltantes são os mesmos:
      - Tooltip de fase deve listar mesmos campos que emissão
    [ ] T39.1.3: Garantir que nenhum campo é analisado se não for usado em documento

  [ ] CP39.2: Verificar rastreabilidade
    [ ] T39.2.1: Comentários `[FEAT:emissao-documentos_TEC9.X]` estão corretos?
    [ ] T39.2.2: TECNICO.md possui entrada TEC9 completa?
    [ ] T39.2.3: DRY atualizado e validado?

  [ ] CP39.3: Code review final
    [ ] T39.3.1: Código removido não deixou resíduos?
    [ ] T39.3.2: Tipos continuam compatíveis?
    [ ] T39.3.3: Todos os testes passando?
    [ ] T39.3.4: Performance não foi afetada?

---

### Observações Técnicas da Sessão 5

#### Convergência de Números
Após esta refatoração, os números de completude de fases e documentos **devem convergir**, pois ambos analisam a mesma base de campos (def-objects).

#### Fonte Única da Verdade
Def-objects continuam sendo a fonte única da verdade. Um campo só é analisado se aparecer em pelo menos um documento.

#### Eliminação de Lógica Customizada
Validações customizadas (como `triplaSerieMedio`) que não são campos de documentos foram removidas, pois criavam divergência.

#### Reutilização de Código
A nova função `calcularCompletudeFase()` reutiliza 100% da lógica existente de `calcularCompletudeDocumento()`, apenas filtrando por fase em vez de documento.
