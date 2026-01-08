# FLUXO DE USUÁRIO - Emissão de Documentos Escolares

## Contexto
Implementar sistema completo de emissão de documentos escolares (Certidão, Certificado, Histórico Escolar e Diploma) com geração de arquivos PDF e DOCX, validação de completude de dados, preview e impressão.

## Referências
- **Modelos oficiais:** `/docs/templates/arquivosDeExemplo/documentosEmissao/*.pdf`
- **Imagens:** `/docs/templates/arquivosDeExemplo/documentosEmissao/imagens/`
- **Objetos TypeScript:** `/src/lib/core/data/gestao-alunos/def-objects/*`
- **Componente atual (placeholder):** [DadosAlunoEmissao.tsx](../../../src/components/DadosAlunoEmissao.tsx)

## Fluxos

### F1: Seleção de Tipo de Documento
F1.1: Na aba "Emissão de Documentos" do painel de Gestão do Aluno, o sistema exibe cards para cada tipo de documento disponível
F1.2: Cada card mostra o título do documento (Certidão, Certificado, Histórico Escolar, Diploma)
F1.3: Cada card exibe indicador visual de disponibilidade baseado na completude dos dados do aluno
F1.4: Cards habilitados (dados completos) permitem seleção, cards desabilitados exibem tooltip com campos faltantes
F1.5: Usuário clica em um card para selecionar o tipo de documento a emitir

### F2: Validação de Completude de Dados
F2.1: Sistema usa o componente existente [DRY.UI:ANALISE_COMPLETUDE_DE_DADOS] para validar completude
F2.2: Validação verifica campos obrigatórios definidos nos def-objects (dadosPessoais.ts, dadosEscolares.ts, historicoEscolar.ts)
F2.3: Cada campo nos def-objects possui array com nomes dos documentos que o requerem
F2.4: Sistema filtra campos por tipo de documento e verifica se estão preenchidos
F2.5: Se dados estão completos (100%), sistema habilita botão "Gerar Preview"
F2.6: Se dados estão incompletos, sistema exibe indicador de completude com percentual
F2.7: Lista de campos faltantes agrupa por categoria (Dados Pessoais, Dados Escolares, etc.)
F2.8: Cada campo faltante exibe label legível e link direto para aba correspondente

### F3: Preview do Documento
F3.1: Ao clicar em "Gerar Preview", sistema gera versão temporária do documento
F3.2: Preview é exibido em visualizador de PDF incorporado na interface
F3.3: Preview mostra documento formatado exatamente como será emitido
F3.4: Preview inclui todos os campos preenchidos do aluno
F3.5: Preview usa metadados da instituição (nome escola, diretor, secretária, brasões)
F3.6: Números de registro aparecem como "SERÁ GERADO" no preview (não oficial ainda)

### F4: Geração e Download de Documentos
F4.1: No preview, usuário tem opções de ação: "Baixar PDF", "Baixar DOCX", "Imprimir"
F4.2: Ao clicar "Baixar PDF", sistema gera documento em formato PDF e inicia download
F4.3: Ao clicar "Baixar DOCX", sistema gera documento em formato DOCX e inicia download
F4.4: Nome do arquivo segue padrão: `[TIPO_DOC]_[MATRICULA]_[NOME_ALUNO]_[DATA].pdf`
F4.5: Geração é feita server-side via API route
F4.6: Sistema exibe feedback visual durante geração (loading spinner)

### F5: Impressão de Documentos
F5.1: Ao clicar "Imprimir", sistema abre diálogo de impressão do navegador
F5.2: Documento é formatado para impressão em papel A4
F5.3: Margens e espaçamentos respeitam modelo oficial
F5.4: Brasões e imagens são incluídos em alta resolução
F5.5: Usuário pode imprimir diretamente ou salvar como PDF via diálogo do navegador

### F6: Impressão em Lote (Todos os Documentos)
F6.1: Interface exibe botão "Imprimir Todos os Documentos"
F6.2: Botão habilitado apenas se pelo menos 1 documento está disponível
F6.3: Ao clicar, sistema gera todos os documentos disponíveis do aluno
F6.4: Documentos são combinados em um único PDF para impressão
F6.5: Ordem dos documentos: Certidão, Histórico Escolar, Certificado, Diploma
F6.6: Sistema exibe progresso da geração (1/4, 2/4, etc.)

### F7: Configuração de Metadados Institucionais
F7.1: Sistema carrega metadados da instituição de arquivo de configuração TypeScript
F7.2: Metadados incluem: nome da escola, diretor, secretária, logotipos, legislação
F7.3: Configuração é global e afeta todos os documentos emitidos
F7.4: (Futuro) Interface de administração permitirá editar metadados sem deploy

### F8: Sistema de Numeração (Preparação para Implementação Futura)
F8.1: Sistema aloca espaço para número de registro em todos os templates
F8.2: No MVP, número aparece como placeholder ou não é exibido
F8.3: Estrutura de dados preparada para receber numeração futura
F8.4: Templates incluem campos: número de registro, folha, livro

### F9: Fonte Única de Configuração - Def-Objects
F9.1: Campos obrigatórios por documento são definidos nos def-objects existentes
F9.2: Arquivos: dadosPessoais.ts, dadosEscolares.ts, historicoEscolar.ts em `/src/lib/core/data/gestao-alunos/def-objects/`
F9.3: Cada campo possui array de documentos que o requerem (ex: `nome: ["Certidão", "Certificado", "Diploma", "Histórico Escolar"]`)
F9.4: Sistema de análise de completude lê esses objetos para determinar se aluno pode emitir documento
F9.5: Layout visual (textos legais, posicionamento) definido em templates PDF React
F9.6: Metadados institucionais em arquivo separado (INSTITUICAO_CONFIG)

### F10: Diferenciação por Modalidade
F10.1: Sistema identifica modalidade do curso do aluno (Regular, EJA, etc.)
F10.2: Textos legais e decretos variam conforme modalidade
F10.3: Certificado EMR usa Decreto 804/1976, outros usam Decreto 43.723/2012
F10.4: Certificado EJA inclui texto adicional "na Modalidade de Ensino de Jovens e Adultos"
F10.5: Livros de registro diferem: Certificado usa 57-A, Diploma usa 25

## Observações Técnicas

### Biblioteca de Geração de PDF
- Usar `@react-pdf/renderer` para geração de PDFs
- Estratégia server-side via API routes do Next.js
- Componentes React para templates reutilizáveis

### Biblioteca de Geração de DOCX
- Usar `docx` ou biblioteca similar para geração de arquivos Word
- Manter paridade visual com PDFs gerados

### Componentização DRY
- Criar componentes genéricos reutilizáveis para elementos comuns
- Cabeçalhos, rodapés, boxes de validação devem ser componentes
- Seguir princípio: se aparece 2x, componentizar

### Integração com Sistema Existente
- Reutilizar tipos e hooks existentes (`useAlunoSelecionado`)
- Integrar com objeto `PHASES_CONFIG` para ícones de status
- Aproveitar componente `CardDadosPessoais` de DadosAlunoHistorico.tsx
- Tabela de histórico escolar reutiliza lógica de DadosAlunoHistorico.tsx