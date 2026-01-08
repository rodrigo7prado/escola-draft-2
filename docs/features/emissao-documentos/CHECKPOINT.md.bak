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
    [ ] T1.1.1: Executar `pnpm add @react-pdf/renderer`
    [ ] T1.1.2: Executar `pnpm add -D @types/react-pdf` (se necessário)
    [ ] T1.1.3: Verificar compatibilidade com Next.js 16
  [ ] CP1.2: Instalar biblioteca de geração de DOCX
    [ ] T1.2.1: Pesquisar biblioteca adequada (sugestão: `docx`)
    [ ] T1.2.2: Executar `pnpm add docx`
    [ ] T1.2.3: Verificar exemplos de uso da biblioteca
  [ ] CP1.3: Instalar bibliotecas auxiliares se necessário
    [ ] T1.3.1: Para merge de PDFs: `pnpm add pdf-lib` (se necessário)
    [ ] T1.3.2: Para manipulação de imagens: verificar se precisa de biblioteca adicional

[ ] CP2: Criar arquivo de configuração de metadados institucionais
  [ ] CP2.1: Criar arquivo de configuração
    [ ] T2.1.1: Localização: `/src/config/instituicao.ts`
    [ ] T2.1.2: Exportar constante `INSTITUICAO_CONFIG`
    [ ] T2.1.3: Incluir campos: nome, governo, secretaria, diretor, secretariaEscolar, coordenadoria, regional, cnpj, endereco
  [ ] CP2.2: Definir tipo TypeScript para metadados
    [ ] T2.2.1: Criar tipo `MetadadosInstituicao` com todos os campos
    [ ] T2.2.2: Incluir tipo `Legislacao` com: leiLDB, resolucaoSEEDUC, decretos (objeto com chaves por modalidade)
    [ ] T2.2.3: Incluir tipo `Brasoes` com caminhos para imagens
  [ ] CP2.3: Preencher dados de exemplo (conforme modelo PDF)
    [ ] T2.3.1: `governo: "Governo do Estado do Rio de Janeiro"`
    [ ] T2.3.2: `secretaria: "Secretaria de Estado de Educação"`
    [ ] T2.3.3: `nome: "COLÉGIO ESTADUAL SENOR ABRAVANEL"`
    [ ] T2.3.4: `coordenadoria: "Coordenadoria de Inspeção Escolar – Regional Metropolitana VI"`
    [ ] T2.3.5: Legislação:
      - `leiLDB: "Lei Federal nº 9.394/1996"`
      - `resolucaoSEEDUC: "Resolução SEEDUC nº 6.346/2025"`
      - `decretos.EMR: "Decreto nº 804 de 15 de julho de 1976"`
      - `decretos.NEJA: "Decreto nº 43.723/2012"`
      - `decretos.DIPLOMA: "Decreto nº 43.723/2012"`
    [ ] T2.3.6: Livros de registro:
      - `livros.CERTIFICADO: "57-A"`
      - `livros.DIPLOMA: "25"`
  [ ] CP2.4: Configurar caminhos para imagens
    [ ] T2.4.1: `brasoes.brasil: "/docs/templates/arquivosDeExemplo/documentosEmissao/imagens/Brasão Brasil.jpg"`
    [ ] T2.4.2: `brasoes.rj: "/docs/templates/arquivosDeExemplo/documentosEmissao/imagens/Brasão RJ.jpg"`
    [ ] T2.4.3: Nota: Considerar copiar imagens para `/public` para acesso no servidor

[ ] CP3: Criar estrutura de tipos TypeScript para documentos
  [ ] CP3.1: Criar arquivo de tipos
    [ ] T3.1.1: Localização: `/src/lib/core/data/gestao-alunos/documentos/types.ts`
    [ ] T3.1.2: Exportar `type TipoDocumento = "CERTIDAO" | "CERTIFICADO" | "HISTORICO" | "DIPLOMA"`
    [ ] T3.1.3: Exportar `type StatusDisponibilidade = "disponivel" | "indisponivel" | "parcial"`
  [ ] CP3.2: Definir tipos para dados de cada documento
    [ ] T3.2.1: Criar `interface DadosCertidao` com campos: aluno (dados básicos), serie (dados da série cursada), metadados (instituição)
    [ ] T3.2.2: Criar `interface DadosCertificado` estendendo DadosCertidao + campos de conclusão
    [ ] T3.2.3: Criar `interface DadosDiploma` similar a DadosCertificado
    [ ] T3.2.4: Criar `interface DadosHistoricoEscolar` com: aluno, series[], historicosPorSerie[], metadados
  [ ] CP3.3: Definir tipo para resultado de validação
    [ ] T3.3.1: Criar `interface ResultadoValidacao` com: disponivel, percentual, camposFaltantes[]
    [ ] T3.3.2: Criar `interface CampoFaltante` com: campo, label, categoria, abaId

---

## Sessão 2 (Análise de Modelos e Atualização de def-objects) - Feature: Emissão de Documentos

### Componentes DRY Usados
- Objetos def-objects existentes (dadosPessoais, dadosEscolares, historicoEscolar)

### Checkpoints

[ ] CP4: Analisar modelo PDF de Certidão e mapear campos
  [ ] CP4.1: Abrir e estudar modelo oficial (FONTE DA VERDADE)
    [ ] T4.1.1: Abrir `/docs/templates/arquivosDeExemplo/documentosEmissao/EMR Certidão Modelo 2025.pdf`
    [ ] T4.1.2: Identificar TODOS os campos variáveis (marcados como XXXXXXXXXX ou similar)
    [ ] T4.1.3: Criar lista completa de campos em ordem de aparição no documento
  [ ] CP4.2: Mapear campos do PDF para schema Prisma
    [ ] T4.2.1: Para cada campo variável do PDF, identificar origem no banco: Aluno.campo ou SerieCursada.campo
    [ ] T4.2.2: Exemplo: XXXXXXXXXX (nome do aluno) → Aluno.nome
    [ ] T4.2.3: Exemplo: XXXXXXXXXX (RG) → Aluno.rg
    [ ] T4.2.4: Criar mapeamento completo em comentário ou arquivo temporário
  [ ] CP4.3: Verificar alinhamento com def-objects
    [ ] T4.3.1: Abrir `/src/lib/core/data/gestao-alunos/def-objects/dadosPessoais.ts`
    [ ] T4.3.2: Abrir `/src/lib/core/data/gestao-alunos/def-objects/dadosEscolares.ts`
    [ ] T4.3.3: Para CADA campo mapeado, verificar se existe no def-object correspondente
    [ ] T4.3.4: Se campo NÃO existe, documentar discrepância (pode indicar necessidade de atualização do schema)
    [ ] T4.3.5: Preparar lista final de campos que serão atualizados

[ ] CP5: Atualizar def-objects com campos de Certidão
  [ ] CP5.1: Atualizar dadosPessoais.ts
    [ ] T5.1.1: Para CADA campo do Aluno identificado no CP4.3, adicionar "Certidão" ao array existente
    [ ] T5.1.2: Exemplo: `nome: [...arrayAtual, "Certidão"]`
    [ ] T5.1.3: Exemplo: `rg: [...arrayAtual, "Certidão"]`
    [ ] T5.1.4: IMPORTANTE: Não remover valores existentes, apenas adicionar "Certidão"
  [ ] CP5.2: Atualizar dadosEscolares.ts
    [ ] T5.2.1: Para CADA campo de SerieCursada identificado no CP4.3, adicionar "Certidão" ao array
    [ ] T5.2.2: Verificar se há campos de Aluno neste arquivo também (caso existam)

[ ] CP6: Analisar modelo PDF de Certificado e mapear campos
  [ ] CP6.1: Abrir e estudar modelo oficial (FONTE DA VERDADE)
    [ ] T6.1.1: Abrir `/docs/templates/arquivosDeExemplo/documentosEmissao/EMR Certificado Modelo 2025.pdf`
    [ ] T6.1.2: Identificar TODOS os campos variáveis (marcados como XXXXXXXXXX ou similar)
    [ ] T6.1.3: Criar lista completa de campos em ordem de aparição no documento
  [ ] CP6.2: Mapear campos do PDF para schema Prisma
    [ ] T6.2.1: Para cada campo variável do PDF, identificar origem no banco: Aluno.campo ou SerieCursada.campo
    [ ] T6.2.2: Incluir campos de conclusão do ensino médio se presentes no PDF
    [ ] T6.2.3: Criar mapeamento completo em comentário ou arquivo temporário
  [ ] CP6.3: Verificar alinhamento com def-objects
    [ ] T6.3.1: Abrir `/src/lib/core/data/gestao-alunos/def-objects/dadosPessoais.ts`
    [ ] T6.3.2: Abrir `/src/lib/core/data/gestao-alunos/def-objects/dadosEscolares.ts`
    [ ] T6.3.3: Para CADA campo mapeado, verificar se existe no def-object correspondente
    [ ] T6.3.4: Se campo NÃO existe, documentar discrepância
    [ ] T6.3.5: Preparar lista final de campos que serão atualizados

[ ] CP7: Atualizar def-objects com campos de Certificado
  [ ] CP7.1: Atualizar dadosPessoais.ts
    [ ] T7.1.1: Para CADA campo do Aluno identificado no CP6.3, adicionar "Certificado" ao array existente
    [ ] T7.1.2: IMPORTANTE: Não remover valores existentes, apenas adicionar "Certificado"
  [ ] CP7.2: Atualizar dadosEscolares.ts
    [ ] T7.2.1: Para CADA campo de SerieCursada identificado no CP6.3, adicionar "Certificado" ao array
    [ ] T7.2.2: Incluir campos de conclusão do Ensino Médio se identificados no PDF
    [ ] T7.2.3: Verificar se há campos de Aluno neste arquivo também (caso existam)

[ ] CP8: Analisar modelo PDF de Diploma e mapear campos
  [ ] CP8.1: Abrir e estudar modelo oficial (FONTE DA VERDADE)
    [ ] T8.1.1: Abrir `/docs/templates/arquivosDeExemplo/documentosEmissao/Diploma Modelo 2025.pdf`
    [ ] T8.1.2: Identificar TODOS os campos variáveis (marcados como XXXXXXXXXX ou similar)
    [ ] T8.1.3: Criar lista completa de campos em ordem de aparição no documento
  [ ] CP8.2: Mapear campos do PDF para schema Prisma
    [ ] T8.2.1: Para cada campo variável do PDF, identificar origem no banco: Aluno.campo ou SerieCursada.campo
    [ ] T8.2.2: Criar mapeamento completo em comentário ou arquivo temporário
  [ ] CP8.3: Verificar alinhamento com def-objects
    [ ] T8.3.1: Abrir `/src/lib/core/data/gestao-alunos/def-objects/dadosPessoais.ts`
    [ ] T8.3.2: Abrir `/src/lib/core/data/gestao-alunos/def-objects/dadosEscolares.ts`
    [ ] T8.3.3: Para CADA campo mapeado, verificar se existe no def-object correspondente
    [ ] T8.3.4: Se campo NÃO existe, documentar discrepância
    [ ] T8.3.5: Preparar lista final de campos que serão atualizados

[ ] CP9: Atualizar def-objects com campos de Diploma
  [ ] CP9.1: Atualizar dadosPessoais.ts
    [ ] T9.1.1: Para CADA campo do Aluno identificado no CP8.3, adicionar "Diploma" ao array existente
    [ ] T9.1.2: IMPORTANTE: Não remover valores existentes, apenas adicionar "Diploma"
  [ ] CP9.2: Atualizar dadosEscolares.ts
    [ ] T9.2.1: Para CADA campo de SerieCursada identificado no CP8.3, adicionar "Diploma" ao array
    [ ] T9.2.2: Verificar se há campos de Aluno neste arquivo também (caso existam)

[ ] CP10: Analisar modelo de Histórico Escolar e mapear campos
  [ ] CP10.1: Estudar componente React existente (REFERÊNCIA VISUAL)
    [ ] T10.1.1: Abrir `/src/components/DadosAlunoHistorico.tsx`
    [ ] T10.1.2: Identificar quais dados do aluno são exibidos (linhas 218-248)
    [ ] T10.1.3: Identificar quais dados de séries são exibidos na tabela (linhas 107-187)
    [ ] T10.1.4: Identificar quais dados de históricos (disciplinas) são necessários
  [ ] CP10.2: Mapear campos identificados para schema Prisma
    [ ] T10.2.1: Dados do aluno: nome, matricula, dataNascimento, sexo, cpf → Aluno.campo
    [ ] T10.2.2: Dados de séries: anoLetivo, serie, segmento, modalidade → SerieCursada.campo
    [ ] T10.2.3: Dados de históricos: componenteCurricular, cargaHoraria, totalPontos, frequencia → HistoricoEscolar.campo
    [ ] T10.2.4: Criar mapeamento completo em comentário ou arquivo temporário
  [ ] CP10.3: Verificar alinhamento com def-objects
    [ ] T10.3.1: Abrir `/src/lib/core/data/gestao-alunos/def-objects/dadosPessoais.ts`
    [ ] T10.3.2: Abrir `/src/lib/core/data/gestao-alunos/def-objects/dadosEscolares.ts`
    [ ] T10.3.3: Verificar se existe `/src/lib/core/data/gestao-alunos/def-objects/historicoEscolar.ts`
    [ ] T10.3.4: Para CADA campo mapeado, verificar se existe no def-object correspondente
    [ ] T10.3.5: Se campo NÃO existe, documentar discrepância
    [ ] T10.3.6: Preparar lista final de campos que serão atualizados

[ ] CP11: Atualizar def-objects com campos de Histórico Escolar
  [ ] CP11.1: Atualizar dadosPessoais.ts
    [ ] T11.1.1: Para CADA campo do Aluno identificado no CP10.3, adicionar "Histórico Escolar" ao array existente
    [ ] T11.1.2: IMPORTANTE: Não remover valores existentes, apenas adicionar "Histórico Escolar"
  [ ] CP11.2: Atualizar dadosEscolares.ts
    [ ] T11.2.1: Para CADA campo de SerieCursada identificado no CP10.3, adicionar "Histórico Escolar" ao array
  [ ] CP11.3: Criar ou atualizar historicoEscolar.ts
    [ ] T11.3.1: Verificar se existe `/src/lib/core/data/gestao-alunos/def-objects/historicoEscolar.ts`
    [ ] T11.3.2: Se não existir, criar seguindo padrão de dadosPessoais.ts
    [ ] T11.3.3: Para CADA campo de HistoricoEscolar identificado no CP10.3, adicionar "Histórico Escolar" ao array
    [ ] T11.3.4: IMPORTANTE: Não remover valores existentes, apenas adicionar "Histórico Escolar"

---

## Sessão 3 (Templates PDF - Componentes Comuns) - Feature: Emissão de Documentos

### Componentes DRY Usados
- Nenhum (criação de código específico da feature)

### Observação sobre DRY
Esta sessão cria componentes PDF específicos para emissão de documentos escolares. São componentes de primeiro uso, portanto código específico da feature. Se padrões similares aparecerem em outras features (ex: outros tipos de documentos), considerar componentização DRY.

### Checkpoints

[ ] CP8: Criar estrutura de pastas para componentes PDF
  [ ] CP8.1: Criar pastas
    [ ] T8.1.1: `/src/components/pdf/` (pasta raiz)
    [ ] T8.1.2: `/src/components/pdf/common/` (componentes comuns)
    [ ] T8.1.3: `/src/components/pdf/templates/` (templates de documentos)

[ ] CP9: Criar componentes PDF comuns
  [ ] CP9.1: Criar componente Cabecalho
    [ ] T9.1.1: Localização: `/src/components/pdf/common/Cabecalho.tsx`
    [ ] T9.1.2: Importar `View, Text, Image` de `@react-pdf/renderer`
    [ ] T9.1.3: Props: `governo: string`, `secretaria: string`, `nomeEscola: string`, `brasaoEsquerda: string`, `brasaoDireita: string`
    [ ] T9.1.4: Layout:
      - Brasão Brasil (esquerda) - Textos centralizados - Brasão RJ (direita)
      - Textos: governo, secretaria, nome escola (tudo centralizado)
    [ ] T9.1.5: Estilos:
      - Fonte serif (Times)
      - Tamanhos: governo/secretaria (10-11pt), nome escola (12-14pt, bold)
      - Brasões: largura ~60-80px
  [ ] CP9.2: Criar componente RodapeAssinaturas
    [ ] T9.2.1: Localização: `/src/components/pdf/common/RodapeAssinaturas.tsx`
    [ ] T9.2.2: Props: `local: string`, `data: string`, `secretaria: string`, `diretor: string`
    [ ] T9.2.3: Layout:
      - Local e data (centralizado)
      - Duas colunas: "Confere" (esquerda) e "Visto" (direita)
      - Linha inferior: "Secretária Escolar" e "Diretor"
    [ ] T9.2.4: Espaçamentos conforme modelo PDF
  [ ] CP9.3: Criar componente BoxValidacaoInspecao
    [ ] T9.3.1: Localização: `/src/components/pdf/common/BoxValidacaoInspecao.tsx`
    [ ] T9.3.2: Props: `governo: string`, `secretaria: string`, `coordenadoria: string`, `brasao: string`
    [ ] T9.3.3: Layout:
      - Box com borda preta
      - Brasão pequeno no topo (centralizado)
      - Textos: governo, secretaria, coordenadoria
      - Texto de declaração de regularidade
      - Linha para assinatura e matrícula
    [ ] T9.3.4: Estilos: fonte pequena (9-10pt), padding interno

[ ] CP10: Criar utilitários de formatação
  [ ] CP10.1: Criar arquivo de utilitários
    [ ] T10.1.1: Localização: `/src/lib/utils/formatacaoDocumentos.ts`
  [ ] CP10.2: Criar função formatarDataExtenso
    [ ] T10.2.1: Assinatura: `(data: Date | string) => string`
    [ ] T10.2.2: Retornar formato: "DD de MMMM de AAAA"
    [ ] T10.2.3: Exemplo: "08 de janeiro de 2025"
  [ ] CP10.3: Criar função formatarNacionalidade
    [ ] T10.3.1: Assinatura: `(nacionalidade: string | null, sexo: string | null) => string`
    [ ] T10.3.2: Retornar com concordância: "brasileiro(a)" ou forma específica
  [ ] CP10.4: Criar função formatarCargaHoraria
    [ ] T10.4.1: Assinatura: `(horasAula: number) => { horasAula: number, horas: number, texto: string }`
    [ ] T10.4.2: Calcular horas reais (pode usar fator 0.833 ou outro apropriado)
    [ ] T10.4.3: Retornar texto: "XXXX horas/aula, que correspondem a XXXX horas"
  [ ] CP10.5: Criar função substituirPlaceholders
    [ ] T10.5.1: Assinatura: `(template: string, dados: Record<string, any>) => string`
    [ ] T10.5.2: Substituir marcadores {{campo}} pelos valores reais
    [ ] T10.5.3: Tratar valores null/undefined (usar string vazia ou placeholder)

---

## Sessão 4 (Template PDF - Certidão) - Feature: Emissão de Documentos

### Componentes DRY Usados
- Componentes comuns criados na Sessão 3 (Cabecalho, RodapeAssinaturas, BoxValidacaoInspecao)
- Utilitários de formatação criados na Sessão 3

### Observação sobre DRY
Template específico de Certidão. Primeiro uso deste padrão de documento.

### Checkpoints

[ ] CP11: Analisar detalhadamente modelo oficial de Certidão
  [ ] CP11.1: Estudar modelo PDF
    [ ] T11.1.1: Abrir `/docs/templates/arquivosDeExemplo/documentosEmissao/EMR Certidão Modelo 2025.pdf`
    [ ] T11.1.2: Identificar TODOS os campos variáveis (XXXXXXXXXX)
    [ ] T11.1.3: Listar em ordem de aparição no documento
    [ ] T11.1.4: Mapear cada campo para origem de dados (Aluno.campo, SerieCursada.campo, etc.)
  [ ] CP11.2: Extrair texto legal completo
    [ ] T11.2.1: Copiar texto do corpo do documento
    [ ] T11.2.2: Identificar partes fixas e variáveis
    [ ] T11.2.3: Criar template de texto com placeholders {{campo}}

[ ] CP12: Criar template PDF de Certidão
  [ ] CP12.1: Criar arquivo do template
    [ ] T12.1.1: Localização: `/src/components/pdf/templates/TemplateCertidao.tsx`
    [ ] T12.1.2: Importar `Document, Page, View, Text, StyleSheet` de `@react-pdf/renderer`
    [ ] T12.1.3: Importar componentes comuns (Cabecalho, RodapeAssinaturas, BoxValidacaoInspecao)
  [ ] CP12.2: Definir props do componente
    [ ] T12.2.1: Interface `TemplateCertidaoProps` com tipo `DadosCertidao`
    [ ] T12.2.2: Incluir todos os dados do aluno necessários
    [ ] T12.2.3: Incluir metadados da instituição (INSTITUICAO_CONFIG)
  [ ] CP12.3: Criar stylesheet
    [ ] T12.3.1: Definir estilos para: page, titulo, corpo, registro, observacao
    [ ] T12.3.2: Fonte serif (Times)
    [ ] T12.3.3: Tamanhos conforme modelo (corpo ~11-12pt)
    [ ] T12.3.4: Margens do page: aproximadamente 2-3cm
  [ ] CP12.4: Estruturar layout do documento
    [ ] T12.4.1: `<Document>` → `<Page size="A4">`
    [ ] T12.4.2: Cabecalho (topo)
    [ ] T12.4.3: View com título "CERTIDÃO" (centralizado, bold)
    [ ] T12.4.4: View com corpo (texto justificado)
    [ ] T12.4.5: View com informações de registro
    [ ] T12.4.6: View com campo "OBSERVAÇÃO"
    [ ] T12.4.7: RodapeAssinaturas
    [ ] T12.4.8: BoxValidacaoInspecao
  [ ] CP12.5: Renderizar corpo do documento
    [ ] T12.5.1: Usar template de texto extraído no CP11.2
    [ ] T12.5.2: Substituir placeholders usando função `substituirPlaceholders`
    [ ] T12.5.3: Aplicar formatações (datas, nacionalidade, etc.)
    [ ] T12.5.4: Garantir textAlign="justify"
  [ ] CP12.6: Renderizar informações de registro
    [ ] T12.6.1: Texto: "Este Certificado foi registrado sob o nº {{numero}} em fls {{folha}}, do livro nº {{livro}} desta U.E."
    [ ] T12.6.2: No MVP, usar placeholders: "XXXX" para número e folha
    [ ] T12.6.3: Livro: não se aplica para Certidão (verificar modelo)

---

## Sessão 5 (Template PDF - Certificado e Diploma) - Feature: Emissão de Documentos

### Componentes DRY Usados
- Componentes comuns criados na Sessão 3 (Cabecalho, RodapeAssinaturas, BoxValidacaoInspecao)
- Utilitários de formatação criados na Sessão 3

### Observação sobre DRY
Templates específicos de Certificado e Diploma. Primeiro uso destes padrões.

### Checkpoints

[ ] CP13: Analisar modelo oficial de Certificado
  [ ] CP13.1: Estudar modelo PDF
    [ ] T13.1.1: Abrir `/docs/templates/arquivosDeExemplo/documentosEmissao/EMR Certificado Modelo 2025.pdf`
    [ ] T13.1.2: Comparar com Certidão para identificar diferenças
    [ ] T13.1.3: Identificar campos adicionais (conclusão, carga horária)
  [ ] CP13.2: Mapear variações por modalidade
    [ ] T13.2.1: EMR: "conclusão do ENSINO MÉDIO" + Decreto 804/1976
    [ ] T13.2.2: NEJA: adicionar "na Modalidade de Ensino de Jovens e Adultos" + Decreto 43.723/2012
    [ ] T13.2.3: Livro de registro: 57-A

[ ] CP14: Criar template PDF de Certificado
  [ ] CP14.1: Criar arquivo
    [ ] T14.1.1: Localização: `/src/components/pdf/templates/TemplateCertificado.tsx`
    [ ] T14.1.2: Estrutura similar ao TemplateCertidao
    [ ] T14.1.3: Props: `TemplateCertificadoProps` com tipo `DadosCertificado`
  [ ] CP14.2: Implementar lógica de modalidade
    [ ] T14.2.1: Detectar modalidade do aluno (campo `modalidade` ou similar)
    [ ] T14.2.2: Condicional: se NEJA, incluir texto adicional
    [ ] T14.2.3: Condicional: usar decreto apropriado conforme modalidade
  [ ] CP14.3: Renderizar corpo do Certificado
    [ ] T14.3.1: Template de texto base (do modelo PDF)
    [ ] T14.3.2: Incluir carga horária formatada (usando `formatarCargaHoraria`)
    [ ] T14.3.3: Incluir data de conclusão formatada
  [ ] CP14.4: Renderizar registro
    [ ] T14.4.1: Texto com número (XXXX), folha (XXXX), livro (57-A)

[ ] CP15: Analisar modelo oficial de Diploma
  [ ] CP15.1: Estudar modelo PDF
    [ ] T15.1.1: Abrir `/docs/templates/arquivosDeExemplo/documentosEmissao/Diploma Modelo 2025.pdf`
    [ ] T15.1.2: Comparar com Certificado
  [ ] CP15.2: Identificar diferenças
    [ ] T15.2.1: Título: "DIPLOMA"
    [ ] T15.2.2: Decreto: sempre 43.723/2012
    [ ] T15.2.3: Livro: 25
    [ ] T15.2.4: Demais campos: idênticos ao Certificado

[ ] CP16: Criar template PDF de Diploma
  [ ] CP16.1: Criar arquivo
    [ ] T16.1.1: Localização: `/src/components/pdf/templates/TemplateDiploma.tsx`
    [ ] T16.1.2: Pode copiar estrutura de TemplateCertificado e ajustar
  [ ] CP16.2: Ajustar diferenças
    [ ] T16.2.1: Título renderiza "DIPLOMA"
    [ ] T16.2.2: Texto legal usa Decreto 43.723/2012
    [ ] T16.2.3: Registro usa livro "25"

---

## Sessão 6 (Template PDF - Histórico Escolar) - Feature: Emissão de Documentos

### Componentes DRY Usados
- Componentes comuns criados na Sessão 3 (Cabecalho, RodapeAssinaturas)
- Lógica existente do componente DadosAlunoHistorico.tsx (funções de ordenação e formatação)

### Observação sobre DRY
Template de Histórico Escolar reutiliza lógica de DadosAlunoHistorico mas adapta para PDF. Funções de utilidade (ordenarSeries, normalizarDisciplina) devem ser extraídas para reutilização, mas não precisam de documentação DRY (são helpers simples de transformação de dados).

### Checkpoints

[ ] CP17: Extrair lógica reutilizável de DadosAlunoHistorico
  [ ] CP17.1: Analisar componente existente
    [ ] T17.1.1: Localização: `/src/components/DadosAlunoHistorico.tsx`
    [ ] T17.1.2: Estudar função `ordenarSeries` (linhas 28-37)
    [ ] T17.1.3: Estudar função `normalizarDisciplina` (linhas 201-203)
    [ ] T17.1.4: Estudar função `formatNumero` (linhas 205-209)
  [ ] CP17.2: Mover funções para utilitários
    [ ] T17.2.1: Criar `/src/lib/utils/historicoEscolar.ts`
    [ ] T17.2.2: Exportar `ordenarSeries`
    [ ] T17.2.3: Exportar `normalizarDisciplina`
    [ ] T17.2.4: Exportar `formatNumero` (ou reutilizar de formatacaoDocumentos)
  [ ] CP17.3: Refatorar DadosAlunoHistorico para usar utilitários
    [ ] T17.3.1: Importar funções de `/src/lib/utils/historicoEscolar`
    [ ] T17.3.2: Remover declarações locais das funções
    [ ] T17.3.3: Garantir que componente continua funcionando

[ ] CP18: Criar componente de tabela para PDF
  [ ] CP18.1: Criar arquivo
    [ ] T18.1.1: Localização: `/src/components/pdf/common/TabelaDisciplinas.tsx`
    [ ] T18.1.2: Importar `View, Text` de `@react-pdf/renderer`
  [ ] CP18.2: Definir props
    [ ] T18.2.1: `seriesOrdenadas: SerieCursadaResumo[]`
    [ ] T18.2.2: `disciplinasOrdenadas: string[]`
    [ ] T18.2.3: `mapasPorSerie: Array<{ serie, mapa }>`
    [ ] T18.2.4: (Mesma estrutura do useMemo de DadosAlunoHistorico)
  [ ] CP18.3: Criar stylesheet da tabela
    [ ] T18.3.1: Estilos para: tabela, headerRow, headerCell, row, cell, footer
    [ ] T18.3.2: Bordas entre células
    [ ] T18.3.3: Background cinza para cabeçalho
    [ ] T18.3.4: Fonte pequena (10-11pt)
  [ ] CP18.4: Renderizar cabeçalho
    [ ] T18.4.1: Primeira linha: "Disciplina" + colunas por série
    [ ] T18.4.2: Para cada série: exibir segmento, série, ano/período
    [ ] T18.4.3: Segunda linha (subcabeçalho): "Pontos" e "CH" para cada série
  [ ] CP18.5: Renderizar corpo
    [ ] T18.5.1: Iterar sobre `disciplinasOrdenadas`
    [ ] T18.5.2: Para cada disciplina, criar linha
    [ ] T18.5.3: Primeira célula: nome da disciplina
    [ ] T18.5.4: Para cada série: células com totalPontos e cargaHoraria (ou "-")
  [ ] CP18.6: Renderizar rodapé
    [ ] T18.6.1: Linha de totalização
    [ ] T18.6.2: Label: "Carga horária total"
    [ ] T18.6.3: Para cada série: exibir `cargaHorariaTotal`

[ ] CP19: Criar template de Histórico Escolar
  [ ] CP19.1: Criar arquivo
    [ ] T19.1.1: Localização: `/src/components/pdf/templates/TemplateHistoricoEscolar.tsx`
    [ ] T19.1.2: Props: `TemplateHistoricoEscolarProps` com tipo `DadosHistoricoEscolar`
  [ ] CP19.2: Processar dados
    [ ] T19.2.1: Usar `ordenarSeries` nos dados recebidos
    [ ] T19.2.2: Criar mapas de disciplinas (mesma lógica do componente React)
    [ ] T19.2.3: Ordenar disciplinas
  [ ] CP19.3: Criar componente de dados pessoais para PDF
    [ ] T19.3.1: Criar `/src/components/pdf/common/CardDadosPessoais.tsx`
    [ ] T19.3.2: Renderizar grid com dados: Nome, Matrícula, Data Nascimento, Sexo, CPF
    [ ] T19.3.3: Formato similar ao componente React (linhas 218-248 de DadosAlunoHistorico)
  [ ] CP19.4: Estruturar layout do documento
    [ ] T19.4.1: Cabecalho
    [ ] T19.4.2: Título: "Histórico Escolar · Disciplinas"
    [ ] T19.4.3: Resumo: quantidade de séries e disciplinas
    [ ] T19.4.4: CardDadosPessoais
    [ ] T19.4.5: TabelaDisciplinas
    [ ] T19.4.6: RodapeAssinaturas

---

## Sessão 7 (API de Geração de Documentos) - Feature: Emissão de Documentos

### Componentes DRY Usados
- [DRY.UI:ANALISE_COMPLETUDE_DE_DADOS] - Sistema existente de validação de completude
- Objetos def-objects (dadosPessoais, dadosEscolares, historicoEscolar)
- Templates PDF criados nas Sessões 3-6

### Observação sobre DRY
API routes são código específico da feature de emissão de documentos escolares. Primeiro uso deste padrão de geração de documentos.

### Checkpoints

[ ] CP20: Preparar imagens para acesso no servidor
  [ ] CP20.1: Copiar brasões para pasta pública
    [ ] T20.1.1: Copiar `/docs/templates/arquivosDeExemplo/documentosEmissao/imagens/Brasão Brasil.jpg` para `/public/assets/brasoes/`
    [ ] T20.1.2: Copiar Brasão RJ também
    [ ] T20.1.3: Atualizar caminhos em `INSTITUICAO_CONFIG` para `/assets/brasoes/...`
  [ ] CP20.2: Converter imagens para base64 (alternativa)
    [ ] T20.2.1: Se abordagem de /public não funcionar, criar utilitário de conversão
    [ ] T20.2.2: Função para ler imagem e converter para base64
    [ ] T20.2.3: Usar base64 nos componentes PDF

[ ] CP21: Criar API route para geração de PDF
  [ ] CP21.1: Criar arquivo
    [ ] T21.1.1: Localização: `/src/app/api/documentos/gerar-pdf/route.ts`
    [ ] T21.1.2: Exportar função `POST` assíncrona
  [ ] CP21.2: Validar requisição
    [ ] T21.2.1: Usar Zod para validar body
    [ ] T21.2.2: Schema: `{ alunoId: string, tipoDocumento: TipoDocumento }`
    [ ] T21.2.3: Retornar erro 400 se inválido
  [ ] CP21.3: Buscar dados do aluno
    [ ] T21.3.1: Usar Prisma para buscar aluno por ID
    [ ] T21.3.2: Incluir relações: `seriesCursadas: { include: { historicos: true } }`
    [ ] T21.3.3: Retornar erro 404 se não encontrado
  [ ] CP21.4: Validar completude (usar def-objects)
    [ ] T21.4.1: Iterar sobre def-objects (dadosPessoais, dadosEscolares, historicoEscolar)
    [ ] T21.4.2: Para cada campo que possui o tipoDocumento no array, verificar se o campo está preenchido no aluno
    [ ] T21.4.3: Acumular campos faltantes
    [ ] T21.4.4: Se há campos faltantes, retornar erro 422 com lista completa
  [ ] CP21.5: Preparar dados para template
    [ ] T21.5.1: Montar objeto `DadosCertidao`, `DadosCertificado`, etc. conforme tipo
    [ ] T21.5.2: Aplicar formatações (datas, carga horária, etc.)
    [ ] T21.5.3: Incluir metadados de `INSTITUICAO_CONFIG`
  [ ] CP21.6: Renderizar template
    [ ] T21.6.1: Switch por `tipoDocumento`
    [ ] T21.6.2: CERTIDAO → `<TemplateCertidao {...dados} />`
    [ ] T21.6.3: CERTIFICADO → `<TemplateCertificado {...dados} />`
    [ ] T21.6.4: DIPLOMA → `<TemplateDiploma {...dados} />`
    [ ] T21.6.5: HISTORICO → `<TemplateHistoricoEscolar {...dados} />`
  [ ] CP21.7: Gerar PDF
    [ ] T21.7.1: Importar `renderToBuffer` de `@react-pdf/renderer`
    [ ] T21.7.2: Chamar `renderToBuffer(componente)`
    [ ] T21.7.3: Aguardar geração do buffer
  [ ] CP21.8: Retornar resposta
    [ ] T21.8.1: Headers: `Content-Type: application/pdf`
    [ ] T21.8.2: Header: `Content-Disposition: attachment; filename="${nomeArquivo}"`
    [ ] T21.8.3: Nome do arquivo: `${tipoDoc}_${matricula}_${nomeLimpo}_${dataISO}.pdf`
    [ ] T21.8.4: Body: buffer do PDF
    [ ] T21.8.5: Status: 200

[ ] CP22: Criar API route para geração de DOCX
  [ ] CP22.1: Criar arquivo
    [ ] T22.1.1: Localização: `/src/app/api/documentos/gerar-docx/route.ts`
    [ ] T22.1.2: Estrutura similar ao CP21
  [ ] CP22.2: Implementar geração usando biblioteca `docx`
    [ ] T22.2.1: Importar classes da biblioteca (Document, Paragraph, TextRun, etc.)
    [ ] T22.2.2: Criar documento programaticamente
    [ ] T22.2.3: Replicar layout dos PDFs (cabeçalho, corpo, rodapé)
    [ ] T22.2.4: Inserir brasões como imagens
    [ ] T22.2.5: Aplicar estilos (fonte Times, tamanhos, alinhamentos)
  [ ] CP22.3: Retornar DOCX
    [ ] T22.3.1: Headers: `Content-Type: application/vnd.openxmlformats-officedocument.wordprocessingml.document`
    [ ] T22.3.2: Extensão: `.docx`
    [ ] T22.3.3: Body: buffer do DOCX

[ ] CP23: Criar API route para geração de todos os documentos
  [ ] CP23.1: Criar arquivo
    [ ] T23.1.1: Localização: `/src/app/api/documentos/gerar-todos-pdf/route.ts`
    [ ] T23.1.2: Receber: `{ alunoId: string }`
  [ ] CP23.2: Determinar documentos disponíveis
    [ ] T23.2.1: Para cada TipoDocumento, validar completude
    [ ] T23.2.2: Criar array de tipos disponíveis
  [ ] CP23.3: Gerar cada PDF
    [ ] T23.3.1: Iterar sobre tipos disponíveis
    [ ] T23.3.2: Gerar buffer de cada documento
    [ ] T23.3.3: Acumular buffers em array
  [ ] CP23.4: Combinar PDFs
    [ ] T23.4.1: Usar biblioteca `pdf-lib`
    [ ] T23.4.2: Criar documento PDF vazio
    [ ] T23.4.3: Para cada buffer gerado, carregar e copiar páginas para documento final
    [ ] T23.4.4: Ordem: Certidão, Histórico, Certificado, Diploma
  [ ] CP23.5: Retornar PDF combinado
    [ ] T23.5.1: Nome: `Documentos_Completos_${matricula}_${nome}.pdf`
    [ ] T23.5.2: Retornar buffer do PDF combinado

---

## Sessão 8 (Interface do Usuário - Componente Principal) - Feature: Emissão de Documentos

### Componentes DRY Usados
- [DRY.UI:ANALISE_COMPLETUDE_DE_DADOS] - Sistema existente de validação
- Objetos def-objects (dadosPessoais, dadosEscolares, historicoEscolar)

### Observação sobre DRY
Componentes UI (CardTipoDocumento, PreviewDocumento, AcoesDocumento) são específicos da feature de emissão de documentos. Primeiro uso destes padrões. Se padrões similares aparecerem em outras features (ex: seleção de tipo de relatório, preview de outros documentos), considerar componentização DRY.

### Checkpoints

[ ] CP24: Criar componente CardTipoDocumento
  [ ] CP24.1: Criar arquivo
    [ ] T24.1.1: Localização: `/src/components/ui/CardTipoDocumento.tsx`
    [ ] T24.1.2: Props: `tipo: TipoDocumento`, `titulo: string`, `status: StatusDisponibilidade`, `percentual: number`, `onSelect: () => void`, `disabled: boolean`
  [ ] CP24.2: Renderizar estrutura
    [ ] T24.2.1: Container: div com border, padding, rounded, cursor
    [ ] T24.2.2: Ícone do documento (FileText do Lucide)
    [ ] T24.2.3: Título do documento
    [ ] T24.2.4: Indicador de disponibilidade (ícone + cor baseado em status)
    [ ] T24.2.5: Barra de progresso visual com percentual
    [ ] T24.2.6: Label com texto: "X% completo" ou "Disponível" ou "Indisponível"
  [ ] CP24.3: Aplicar estados visuais
    [ ] T24.3.1: `disponivel` (100%): border-green-500, bg-green-50 no hover, cursor-pointer
    [ ] T24.3.2: `parcial`: border-yellow-500, bg-yellow-50 no hover, cursor-pointer
    [ ] T24.3.3: `indisponivel`: border-gray-300, opacity-60, cursor-not-allowed
  [ ] CP24.4: Implementar interatividade
    [ ] T24.4.1: onClick chama `onSelect` se não `disabled`
    [ ] T24.4.2: Adicionar efeito hover apropriado

[ ] CP25: Criar componente PreviewDocumento
  [ ] CP25.1: Criar arquivo
    [ ] T25.1.1: Localização: `/src/components/PreviewDocumento.tsx`
    [ ] T25.1.2: Props: `urlPdf: string | null`, `isLoading: boolean`, `erro: string | null`
  [ ] CP25.2: Renderizar visualizador
    [ ] T25.2.1: Se `isLoading`, exibir spinner
    [ ] T25.2.2: Se `erro`, exibir mensagem de erro
    [ ] T25.2.3: Se `urlPdf`, renderizar iframe ou objeto para exibir PDF
    [ ] T25.2.4: Alternativa: usar biblioteca `react-pdf` para visualização customizada
  [ ] CP25.3: Estilos
    [ ] T25.3.1: Container com altura mínima (ex: 600px)
    [ ] T25.3.2: Borda ao redor do preview

[ ] CP26: Criar componente AcoesDocumento
  [ ] CP26.1: Criar arquivo
    [ ] T26.1.1: Localização: `/src/components/AcoesDocumento.tsx`
    [ ] T26.1.2: Props: `tipoDocumento: TipoDocumento`, `alunoId: string`, `nomeAluno: string`, `matricula: string`
  [ ] CP26.2: Implementar botão "Baixar PDF"
    [ ] T26.2.1: Renderizar Button com ícone Download
    [ ] T26.2.2: onClick: fazer fetch para `/api/documentos/gerar-pdf`
    [ ] T26.2.3: Body: `JSON.stringify({ alunoId, tipoDocumento })`
    [ ] T26.2.4: Receber blob da resposta
    [ ] T26.2.5: Criar URL com `URL.createObjectURL(blob)`
    [ ] T26.2.6: Criar link temporário e clicar para iniciar download
    [ ] T26.2.7: Exibir loading no botão durante operação
  [ ] CP26.3: Implementar botão "Baixar DOCX"
    [ ] T26.3.1: Estrutura idêntica ao CP26.2
    [ ] T26.3.2: Endpoint: `/api/documentos/gerar-docx`
  [ ] CP26.4: Implementar botão "Imprimir"
    [ ] T26.4.1: onClick: gerar PDF (mesmo fetch do CP26.2)
    [ ] T26.4.2: Abrir PDF em nova janela: `window.open(url)`
    [ ] T26.4.3: Chamar `window.print()` na nova janela (se possível)
  [ ] CP26.5: Tratamento de erros
    [ ] T26.5.1: Capturar erros de fetch
    [ ] T26.5.2: Se erro 422, parsear JSON com campos faltantes
    [ ] T26.5.3: Exibir toast/alert com mensagem de erro apropriada

[ ] CP27: Refatorar DadosAlunoEmissao (componente principal)
  [ ] CP27.1: Abrir arquivo
    [ ] T27.1.1: Localização: `/src/components/DadosAlunoEmissao.tsx`
    [ ] T27.1.2: Remover placeholder (linhas 40-44)
  [ ] CP27.2: Adicionar estados
    [ ] T27.2.1: `const [tipoSelecionado, setTipoSelecionado] = useState<TipoDocumento | null>(null)`
    [ ] T27.2.2: `const [modoPreview, setModoPreview] = useState(false)`
    [ ] T27.2.3: `const [urlPreview, setUrlPreview] = useState<string | null>(null)`
    [ ] T27.2.4: `const [isGerandoPreview, setIsGerandoPreview] = useState(false)`
  [ ] CP27.3: Criar lógica de validação baseada em def-objects
    [ ] T27.3.1: Importar def-objects (dadosPessoais, dadosEscolares, historicoEscolar)
    [ ] T27.3.2: Para cada tipo de documento, iterar sobre def-objects e verificar completude
    [ ] T27.3.3: Armazenar resultados em objeto: `const statusPorTipo = useMemo(() => ({ CERTIDAO: {...}, CERTIFICADO: {...}, ... }), [aluno, series])`
    [ ] T27.3.4: Cada resultado contém: disponivel (boolean), percentual (number), camposFaltantes (array)
  [ ] CP27.4: Renderizar seção de seleção (modo inicial)
    [ ] T27.4.1: Se `!tipoSelecionado && !modoPreview`
    [ ] T27.4.2: Título: "Selecione o tipo de documento a emitir"
    [ ] T27.4.3: Grid com 4 CardTipoDocumento
    [ ] T27.4.4: Ordem: Certidão, Histórico Escolar, Certificado, Diploma
    [ ] T27.4.5: Para cada card, passar status correspondente de `statusPorTipo`
    [ ] T27.4.6: onSelect: `setTipoSelecionado(tipo)`
  [ ] CP27.5: Renderizar seção de validação (tipo selecionado)
    [ ] T27.5.1: Se `tipoSelecionado && !modoPreview`
    [ ] T27.5.2: Exibir título do documento selecionado
    [ ] T27.5.3: Se `statusPorTipo[tipoSelecionado].disponivel === true`:
      - Botão "Gerar Preview"
    [ ] T27.5.4: Se não disponível:
      - ListaCamposFaltantes com campos faltantes
      - onCampoClick: navegar para aba correspondente (usar state de FluxoCertificacao)
    [ ] T27.5.5: Botão "Voltar" para `setTipoSelecionado(null)`
  [ ] CP27.6: Renderizar seção de preview
    [ ] T27.6.1: Se `modoPreview`
    [ ] T27.6.2: PreviewDocumento com `urlPreview` e `isGerandoPreview`
    [ ] T27.6.3: AcoesDocumento abaixo (só exibir se preview carregou com sucesso)
    [ ] T27.6.4: Botão "Voltar" para sair do preview
  [ ] CP27.7: Implementar geração de preview
    [ ] T27.7.1: Função `handleGerarPreview` assíncrona
    [ ] T27.7.2: `setIsGerandoPreview(true)`
    [ ] T27.7.3: Fetch para `/api/documentos/gerar-pdf`
    [ ] T27.7.4: Receber blob, criar URL
    [ ] T27.7.5: `setUrlPreview(url)` e `setModoPreview(true)`
    [ ] T27.7.6: `setIsGerandoPreview(false)`
    [ ] T27.7.7: Capturar erros e exibir mensagem

[ ] CP28: Implementar botão "Imprimir Todos os Documentos"
  [ ] CP28.1: Adicionar botão na interface
    [ ] T28.1.1: Posição: topo da seção, alinhado à direita
    [ ] T28.1.2: Label: "Imprimir Todos os Documentos"
    [ ] T28.1.3: Ícone: Printer (Lucide)
  [ ] CP28.2: Calcular disponibilidade
    [ ] T28.2.1: Contar quantos documentos têm `disponivel === true`
    [ ] T28.2.2: Habilitar botão se count >= 1
    [ ] T28.2.3: Tooltip mostra: "Serão impressos: [lista de documentos disponíveis]"
  [ ] CP28.3: Implementar ação
    [ ] T28.3.1: onClick assíncrono
    [ ] T28.3.2: Fetch para `/api/documentos/gerar-todos-pdf`
    [ ] T28.3.3: Exibir loading
    [ ] T28.3.4: Receber blob do PDF combinado
    [ ] T28.3.5: Abrir em nova janela e chamar print()

---

## Sessão 9 (Refinamentos e Testes) - Feature: Emissão de Documentos

### Checkpoints

[ ] CP29: Ajustar fidelidade visual dos PDFs
  [ ] CP29.1: Comparar PDFs gerados com modelos
    [ ] T29.1.1: Gerar Certidão de teste
    [ ] T29.1.2: Abrir lado a lado com modelo oficial
    [ ] T29.1.3: Identificar diferenças (margens, fontes, espaçamentos)
  [ ] CP29.2: Ajustar margens
    [ ] T29.2.1: Modificar margens no StyleSheet do Page
    [ ] T29.2.2: Testar diferentes valores até corresponder ao modelo
  [ ] CP29.3: Ajustar fontes e tamanhos
    [ ] T29.3.1: Confirmar fonte (Times New Roman ou similar)
    [ ] T29.3.2: Ajustar tamanhos de texto conforme modelo
  [ ] CP29.4: Ajustar posicionamento de brasões
    [ ] T29.4.1: Ajustar width/height das imagens
    [ ] T29.4.2: Ajustar posicionamento no cabeçalho
  [ ] CP29.5: Ajustar box de validação
    [ ] T29.5.1: Tamanho, borda, padding
    [ ] T29.5.2: Posicionamento correto

[ ] CP30: Testar fluxo completo
  [ ] CP30.1: Testar seleção de documentos
    [ ] T30.1.1: Aluno com dados completos → todos os 4 cards devem estar disponíveis
    [ ] T30.1.2: Aluno com dados parciais → alguns cards indisponíveis
  [ ] CP30.2: Testar validação
    [ ] T30.2.1: Tentar gerar documento indisponível → deve mostrar campos faltantes
    [ ] T30.2.2: Clicar em campo faltante → deve navegar para aba correta
  [ ] CP30.3: Testar preview
    [ ] T30.3.1: Gerar preview de cada tipo
    [ ] T30.3.2: Verificar que dados do aluno aparecem corretos
  [ ] CP30.4: Testar downloads
    [ ] T30.4.1: Baixar PDF de cada tipo
    [ ] T30.4.2: Baixar DOCX de cada tipo
    [ ] T30.4.3: Verificar nomes de arquivos
  [ ] CP30.5: Testar impressão
    [ ] T30.5.1: Imprimir documento individual
    [ ] T30.5.2: Imprimir todos os documentos
  [ ] CP30.6: Testar casos extremos
    [ ] T30.6.1: Aluno sem séries → Histórico indisponível
    [ ] T30.6.2: Aluno sem conclusão → Certificado/Diploma indisponíveis
    [ ] T30.6.3: Campos opcionais vazios → não quebra layout

---

## Sessão 10 (Documentação DRY) - Feature: Emissão de Documentos

### Checkpoints

[ ] CP31: Atualizar documentação DRY (será feito pelo Claude, não pelo Codex)
  [ ] CP31.1: Claude criará documentação para componentes de configuração (metadados instituição, tipos)
  [ ] CP31.2: Claude criará documentação para componentes PDF (templates, componentes comuns)
  [ ] CP31.3: Claude criará documentação para utilitários (formatadores, histórico escolar)
  [ ] CP31.4: Claude criará documentação para componentes UI (cards, preview, ações)
  [ ] CP31.5: Claude atualizará summary.md

[ ] CP32: Atualizar integração com sistema de fases
  [ ] CP32.1: Atualizar cálculo de status da fase EMISSAO_DOCUMENTOS
    [ ] T32.1.1: Localizar onde status é calculado (useAlunosCertificacao ou similar)
    [ ] T32.1.2: Status = "completo" se pelo menos 1 documento disponível
    [ ] T32.1.3: Status = "parcial" se alguns disponíveis
    [ ] T32.1.4: Status = "ausente" se nenhum disponível
  [ ] CP32.2: Atualizar tooltip do ícone
    [ ] T32.2.1: Exibir: "X/4 documentos disponíveis"

---

## Observações Gerais

### Ordem de Prioridade
1. Sessões 1-2: Setup e validação
2. Sessões 3-6: Templates de documentos
3. Sessão 7: API de geração
4. Sessão 8: Interface do usuário
5. Sessão 9: Refinamentos
6. Sessão 10: Documentação

### Pontos Críticos de Atenção
- **Análise de modelos PDF:** Codex DEVE abrir e estudar detalhadamente os PDFs antes de implementar templates
- **Mapeamento de campos:** Garantir que TODOS os campos variáveis do modelo estão mapeados
- **Brasões:** Garantir que imagens são acessíveis no servidor
- **Validação:** Sempre validar dados antes de gerar documento
- **Erros:** Retornar mensagens claras e úteis ao usuário

### Reutilização de Código
- Aproveitar lógica de DadosAlunoHistorico para Histórico Escolar
- Reutilizar componentes comuns (Cabecalho, Rodape) em todos os templates
- Usar utilitários de formatação em todos os lugares
- Seguir princípio DRY: se aparece 2x, componentizar

### Preparação para Futuro
- Numeração de documentos: estrutura preparada, lógica posterior
- Metadados editáveis: config TypeScript agora, interface admin depois
- Histórico de emissões: estrutura preparada, persistência posterior