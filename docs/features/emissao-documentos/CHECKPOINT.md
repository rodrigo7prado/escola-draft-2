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
