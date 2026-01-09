# DECISÕES TÉCNICAS - Feature: Emissão de Documentos

Este arquivo documenta decisões técnicas não-óbvias tomadas durante a implementação da feature de emissão de documentos, com rastreabilidade bidirecional ao código.

---

## TEC1: UI de emissão usa Modal genérico com PDFViewer para prévia

**Motivação:**
- Usuário precisa revisar documento antes de imprimir (evitar desperdício de papel e retrabalho)
- Reutilizar componente Modal existente em `/src/components/ui/Modal.tsx` (princípio DRY)
- Permitir correção de dados sem sair da página do aluno
- Manter contexto do aluno visível durante visualização do documento

**Alternativas Consideradas:**
- ❌ **Abrir em nova aba do navegador**: Perde contexto da tela de dados do aluno, dificulta correção imediata de campos incorretos, gera múltiplas abas abertas
- ❌ **Renderizar inline no formulário**: Polui a UI, dificulta foco exclusivo no documento, problemas de scroll/layout
- ✅ **Modal com PDFViewer**: Mantém contexto, permite foco no documento, reutiliza componente existente, melhor UX

**Referências no Código:**
- [src/components/DadosAlunoEmissao.tsx:42-67](../../src/components/DadosAlunoEmissao.tsx) - Implementação do modal de prévia
- [src/components/ui/Modal.tsx](../../src/components/ui/Modal.tsx) - Componente Modal reutilizado

---

### TEC1.1: Botão "Imprimir" individual abre modal com template específico

**Motivação:**
- Permite revisão focada de um documento por vez
- Usuário pode identificar erros em documento específico sem distração
- Facilita correção incremental (emitir documentos conforme dados são completados)

**Implementação:**
- Props `tipoDocumento: TipoDocumento` passada ao componente de template PDF
- Estado local `documentoAtual` controla qual template renderizar
- Cada botão chama `handleImprimir(tipo)` com tipo específico

**Referências no Código:**
- [src/components/DadosAlunoEmissao.tsx:15-23](../../src/components/DadosAlunoEmissao.tsx) - Handler de impressão individual
- [src/components/pdf/templates/TemplateCertidao.tsx](../../src/components/pdf/templates/TemplateCertidao.tsx) - Template individual de Certidão
- [src/components/pdf/templates/TemplateCertificado.tsx](../../src/components/pdf/templates/TemplateCertificado.tsx) - Template individual de Certificado
- [src/components/pdf/templates/TemplateDiploma.tsx](../../src/components/pdf/templates/TemplateDiploma.tsx) - Template individual de Diploma
- [src/components/pdf/templates/TemplateHistoricoEscolar.tsx](../../src/components/pdf/templates/TemplateHistoricoEscolar.tsx) - Template individual de Histórico

---

### TEC1.2: Botão "Imprimir Todos" usa Document combinado com múltiplas páginas

**Motivação:**
- Evita abrir 4 janelas separadas do navegador (melhor UX)
- Gera um único PDF com todos os documentos em sequência
- Facilita impressão física (um único job de impressão)
- Ordem de documentos segue fluxo lógico definido no FLUXO.md (F1.X)

**Implementação:**
- Componente `DocumentoCombinado` cria um `<Document>` do `@react-pdf/renderer`
- Dentro do Document, múltiplos `<Page>` são renderizados sequencialmente
- Cada Page usa o template específico do documento (reutiliza templates individuais)
- Ordem: Certidão → Certificado → Diploma → Histórico Escolar

**Alternativas Consideradas:**
- ❌ **Gerar 4 PDFs separados e fazer merge no backend**: Complexidade desnecessária, latência adicional, dependência de biblioteca de merge
- ❌ **Abrir 4 modais em sequência**: UX ruim, usuário precisa clicar 4 vezes
- ✅ **Document único com múltiplas páginas**: Solução nativa do @react-pdf, simples, performática

**Referências no Código:**
- [src/components/DadosAlunoEmissao.tsx:25-30](../../src/components/DadosAlunoEmissao.tsx) - Handler de impressão combinada
- [src/components/pdf/DocumentoCombinado.tsx](../../src/components/pdf/DocumentoCombinado.tsx) - Componente que combina múltiplos templates

---

### TEC1.3: Dados de prévia derivados do aluno selecionado, última série cursada e INSTITUICAO_CONFIG

**Motivação:**
- Dados de aluno e série vêm do banco (fonte única da verdade)
- Última série cursada determina dados de conclusão (ano, modalidade, etc)
- Metadados institucionais centralizados em config para fácil atualização
- Separação de concerns: dados do aluno vs dados da instituição

**Implementação:**
- Props do componente recebem `aluno: AlunoCompleto` (incluindo seriesCursadas)
- Última série obtida via `aluno.seriesCursadas.sort(...)[0]`
- `INSTITUICAO_CONFIG` importado de `@/config/instituicao`
- Objeto `DadosCertidao/Certificado/etc` montado combinando as 3 fontes

**Referências no Código:**
- [src/config/instituicao.ts](../../src/config/instituicao.ts) - Configuração centralizada de metadados institucionais
- [src/components/DadosAlunoEmissao.tsx:35-50](../../src/components/DadosAlunoEmissao.tsx) - Montagem de dados para templates

---

## TEC2: Escolha de @react-pdf/renderer para geração de PDFs

**Motivação:**
- Biblioteca madura e bem mantida para geração de PDFs em React
- Renderização server-side e client-side (flexibilidade)
- Sintaxe similar a React (baixa curva de aprendizado)
- Suporte nativo a fontes, imagens e layouts complexos
- Comunidade ativa e boa documentação

**Alternativas Consideradas:**
- ❌ **jsPDF**: API imperativa (dificulta componentização), menos flexível para layouts complexos
- ❌ **pdfmake**: Configuração JSON (não se beneficia de JSX/TypeScript), menos type-safe
- ❌ **Puppeteer (HTML→PDF)**: Overhead de browser headless, complexidade de deploy, latência
- ✅ **@react-pdf/renderer**: Componentização React, type-safe, performático, sem dependências externas pesadas

**Referências no Código:**
- [package.json](../../package.json) - Dependência `@react-pdf/renderer`
- [src/components/pdf/templates/*](../../src/components/pdf/templates/) - Todos os templates PDF usam esta biblioteca

---

## TEC3: Estrutura de def-objects como fonte única da verdade para campos de documentos

**Motivação:**
- Evitar duplicação de lógica (DRY): um único lugar define quais campos são necessários por documento
- Facilita adição de novos documentos ou campos (atualizar def-object e código segue automaticamente)
- Permite cálculo automático de completude de dados por documento
- Rastreabilidade: campo marcado no def-object → aparece no cálculo de completude → aparece no template PDF

**Implementação:**
- Arquivo `dadosPessoais.ts` define campos de Aluno com array de documentos que usam cada campo
- Exemplo: `nome: { label: "Nome", documentos: ["Certidão", "Certificado", "Diploma", "Histórico"] }`
- Mesma estrutura para `dadosEscolares.ts` e `historicoEscolar.ts`
- Função `calcularCompletudeDocumento` itera sobre def-objects para determinar campos obrigatórios

**Alternativas Consideradas:**
- ❌ **Hardcoded lists em cada template**: Duplicação, dificulta manutenção, propenso a erros
- ❌ **Schemas Zod separados por documento**: Duplicação de lógica de validação, não integra com sistema de fases
- ✅ **def-objects estendidos com informação de documentos**: Centralizado, DRY, integra com sistema existente

**Referências no Código:**
- [src/lib/core/data/gestao-alunos/def-objects/dadosPessoais.ts](../../src/lib/core/data/gestao-alunos/def-objects/dadosPessoais.ts) - Definição de campos de aluno por documento
- [src/lib/core/data/gestao-alunos/def-objects/dadosEscolares.ts](../../src/lib/core/data/gestao-alunos/def-objects/dadosEscolares.ts) - Definição de campos escolares
- [src/lib/core/data/gestao-alunos/def-objects/historicoEscolar.ts](../../src/lib/core/data/gestao-alunos/def-objects/historicoEscolar.ts) - Definição de campos de histórico

---

## TEC4: Layout centralizado em MAPEAMENTO_LAYOUT_DOCUMENTOS

**Motivação:**
- Cada documento oficial tem especificações exatas de layout (margens, fontes, espaçamento)
- Centralizar facilita ajustes globais (ex: mudança de margem aplica a todos)
- Separação de concerns: templates focam em conteúdo, layout object foca em estilização
- Permite criar variantes de layout sem duplicar componentes

**Implementação:**
- Arquivo `layout.ts` exporta objeto com configuração de cada tipo de documento
- Cada template importa e aplica as configurações via `criarEstilosDocumento(layout)`
- Estilos gerados dinamicamente com base nas especificações

**Referências no Código:**
- [src/lib/core/data/gestao-alunos/documentos/layout.ts](../../src/lib/core/data/gestao-alunos/documentos/layout.ts) - Configuração centralizada de layouts
- [src/components/pdf/common/styles.ts](../../src/components/pdf/common/styles.ts) - Função que gera estilos a partir do layout
- [src/components/pdf/templates/TemplateCertidao.tsx:15-16](../../src/components/pdf/templates/TemplateCertidao.tsx) - Uso do layout

---

## TEC5: Componentes PDF comuns para cabeçalho, rodapé e assinaturas

**Motivação:**
- Cabeçalho, rodapé e bloco de assinaturas são idênticos em múltiplos documentos
- Reutilização reduz código duplicado (DRY)
- Mudanças em elementos comuns (ex: atualizar brasão) aplicam automaticamente a todos
- Componentização facilita testes isolados

**Implementação:**
- `PdfHeader`: Brasões + governo + secretaria + nome da escola
- `PdfFooterCoordenadoria`: Informações de coordenadoria e regional
- `PdfAssinaturas`: Bloco de assinaturas (diretor, secretário escolar, aluno)
- Cada componente recebe props específicas e renderiza estrutura padronizada

**Referências no Código:**
- [src/components/pdf/common/PdfHeader.tsx](../../src/components/pdf/common/PdfHeader.tsx) - Componente de cabeçalho comum
- [src/components/pdf/common/PdfFooterCoordenadoria.tsx](../../src/components/pdf/common/PdfFooterCoordenadoria.tsx) - Componente de rodapé comum
- [src/components/pdf/common/PdfAssinaturas.tsx](../../src/components/pdf/common/PdfAssinaturas.tsx) - Componente de assinaturas comum
- [src/components/pdf/templates/TemplateCertidao.tsx:60-80](../../src/components/pdf/templates/TemplateCertidao.tsx) - Uso dos componentes comuns

---

## TEC6: Formatters centralizados para dados em formatters.ts

**Motivação:**
- Formatação de datas, telefones, CPF, etc deve ser consistente em todos os documentos
- Centralizar lógica de formatação evita duplicação e bugs
- Facilita mudanças globais (ex: mudar formato de data de DD/MM/YYYY para DD-MM-YYYY)
- Tratamento de casos edge (null, undefined, valores inválidos) em um só lugar

**Implementação:**
- `formatarData`: Converte Date/string para formato brasileiro DD/MM/YYYY
- `getCampoTexto`: Retorna valor do campo ou placeholder padrão ("Não informado")
- `formatarCPF`, `formatarTelefone`, etc: Formatações específicas
- Todas as funções são puras (sem side effects)

**Referências no Código:**
- [src/components/pdf/common/formatters.ts](../../src/components/pdf/common/formatters.ts) - Funções de formatação centralizadas
- [src/components/pdf/templates/TemplateCertidao.tsx:22-29](../../src/components/pdf/templates/TemplateCertidao.tsx) - Uso dos formatters

---

## TEC7: Cálculo centralizado de completude por documento e integração com UI

**Motivação:**
- Evitar lógica duplicada entre lista de alunos e aba de emissão
- Usar def-objects como fonte única da verdade para campos obrigatórios
- Permitir status consistente da fase `FASE:EMISSAO_DOCUMENTOS`
- Habilitar/ bloquear impressão com base em dados completos

**Alternativas Consideradas:**
- ❌ **Regras hardcoded na UI**: duplicação, difícil manutenção, risco de divergência
- ❌ **Queries específicas por documento**: acoplamento ao backend e pouca flexibilidade
- ✅ **Função pura + integração no hook**: centraliza regras e facilita reuso

**Implementação:**
- Funções `calcularCompletudeDocumento` e `calcularCompletudeEmissao` em arquivo dedicado
- Hook `useAlunosCertificacao` calcula `progressoEmissaoDocumentos`
- Lista usa status dinâmico na fase de emissão e badge de pronto
- Aba de emissão exibe detalhe por documento e desabilita impressão quando incompleto

**Referências no Código:**
- [src/lib/core/data/gestao-alunos/documentos/calcularCompletude.ts](../../src/lib/core/data/gestao-alunos/documentos/calcularCompletude.ts) - Funções de completude
- [src/hooks/useAlunosCertificacao.ts:88-105](../../src/hooks/useAlunosCertificacao.ts) - Integração no hook
- [src/components/ListaAlunosCertificacao.tsx:170-210](../../src/components/ListaAlunosCertificacao.tsx) - Status dinâmico e badge
- [src/components/CompletudeDocumentos.tsx](../../src/components/CompletudeDocumentos.tsx) - UI detalhada por documento
- [src/components/DadosAlunoEmissao.tsx:120-195](../../src/components/DadosAlunoEmissao.tsx) - Uso na aba de emissão

---

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
- [src/lib/core/data/gestao-alunos/documentos/calcularCompletude.ts:186](../../src/lib/core/data/gestao-alunos/documentos/calcularCompletude.ts) - Novas funções de completude por fase
- [src/hooks/useAlunosCertificacao.ts:161](../../src/hooks/useAlunosCertificacao.ts) - Hook atualizado para usar DRY

---

### TEC8.1: Uso de def-objects vs Lógica Inline

**Motivação:**
Função original `calcularResumoDadosEscolares()` usa lógica inline (3 slots fixos).
Precisávamos decidir se usar def-objects como fonte ou manter lógica inline.

**Alternativas:**
- ❌ Lógica inline pura: Não segue padrão de def-objects, fonte da verdade duplicada
- ⚠️ Híbrido: Usa def-objects mas tem validações customizadas
- ✅ Def-objects como base + validadores específicos: Melhor dos dois mundos

**Decisão:**
Usar def-objects como base para os campos da fase e complementar com validadores
específicos (ex: validação de tripla série do médio).

**Referências no Código:**
- [src/lib/core/data/gestao-alunos/documentos/calcularCompletude.ts:186](../../src/lib/core/data/gestao-alunos/documentos/calcularCompletude.ts) - `calcularCompletudeDadosEscolares()`
- [src/lib/core/data/gestao-alunos/documentos/calcularCompletude.ts:309](../../src/lib/core/data/gestao-alunos/documentos/calcularCompletude.ts) - `validarTriplaSerieMedio()`

---

### TEC8.2: Validação de Tripla Série do Médio

**Motivação:**
Regra específica do sistema: aluno deve ter cursado 1 série "-" (mais antiga)
seguida de 2 séries "MÉDIO" para conclusão do ensino médio regular.

**Decisão:**
Mover função `possuiTriplaSerieMedio()` do hook para `calcularCompletude.ts`
como `validarTriplaSerieMedio()`. Mantém lógica de ordenação por ano letivo
e validação de segmentos.

**Referências no Código:**
- [src/lib/core/data/gestao-alunos/documentos/calcularCompletude.ts:309](../../src/lib/core/data/gestao-alunos/documentos/calcularCompletude.ts) - `validarTriplaSerieMedio()`

---

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
- [src/lib/core/data/gestao-alunos/documentos/calcularCompletude.ts:257](../../src/lib/core/data/gestao-alunos/documentos/calcularCompletude.ts) - `calcularCompletudeHistoricoEscolar()`

---

## OBSERVAÇÕES GERAIS

### Manutenção Futura
Ao adicionar novos tipos de documentos:
1. Adicionar tipo em `TipoDocumento` ([src/lib/core/data/gestao-alunos/documentos/types.ts](../../src/lib/core/data/gestao-alunos/documentos/types.ts))
2. Adicionar layout em `MAPEAMENTO_LAYOUT_DOCUMENTOS` ([src/lib/core/data/gestao-alunos/documentos/layout.ts](../../src/lib/core/data/gestao-alunos/documentos/layout.ts))
3. Atualizar def-objects com novo documento nos campos necessários
4. Criar template em `/src/components/pdf/templates/Template[Nome].tsx`
5. Adicionar botão em `DadosAlunoEmissao.tsx`

### Rastreabilidade de Campos
Para saber quais campos são usados em um documento:
1. Abrir o template PDF correspondente (ex: `TemplateCertidao.tsx`)
2. Ver comentários `[FEAT:emissao-documentos_TEC*]` no código
3. Consultar def-objects referenciados para ver mapeamento completo

### Testes
Áreas críticas para testes automatizados:
- Função `calcularCompletudeDocumento`: Garante que cálculo de completude está correto
- Formatters: Garante que formatação de dados está correta (datas, null handling)
- Templates PDF: Testes de snapshot para evitar regressões visuais
