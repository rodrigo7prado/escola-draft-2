# CONCEITO: Importação Estruturada por Texto

## VISÃO GERAL

Sistema de captura, validação e estruturação de dados de alunos através de **Importação Estruturada por Texto** - processo de transferência de informações provenientes de fontes externas mediante entrada de texto formatado.

## CONTEXTO E MOTIVAÇÃO

### Problema Atual
- Dados complementares dos alunos (pessoais, documentos, filiação, naturalidade, entre outros) não estão disponíveis nos arquivos CSV
- **Histórico de períodos letivos cursados** (renovações de matrícula) não está disponível nos arquivos CSV
- Sistema oficial contém informações completas mas não exporta em formato estruturado
- Necessidade de integrar dados de múltiplas fontes mantendo integridade e rastreabilidade
- **Dados de ingresso** (ano, período, tipo, rede de origem) essenciais para histórico escolar completo

### Solução Proposta
- **Importação via entrada de texto estruturado** de múltiplas seções do sistema oficial
- **Validação automática** de estrutura e conformidade com padrões esperados
- **Parsing inteligente** para extrair dados e popular banco de dados
- **Rastreabilidade completa** com armazenamento de textos originais
- **Captura de trajetória escolar** através de registros de renovação de matrícula

## OBJETIVOS

### Primários
1. **Capturar dados complementares** de alunos de forma eficiente e confiável
2. **Capturar histórico de períodos letivos** (trajetória escolar do aluno)
3. **Validar integridade** dos dados capturados antes do processamento
4. **Popular banco de dados** com informações estruturadas e auditáveis
5. **Fornecer feedback visual** sobre completude e status do cadastro

### Secundários
- Minimizar erros de digitação manual
- Permitir correção e reprocessamento se necessário
- Manter histórico de importações para auditoria
- Facilitar identificação de dados faltantes ou inconsistentes

## CONCEITOS-CHAVE

### 1. Entrada de Texto Estruturado
- Usuário fornece texto formatado de sistema externo
- Sistema espera estrutura específica (padrões reconhecíveis)
- Múltiplas entradas podem ser necessárias por aluno (diferentes seções/páginas)

### 2. Validação de Estrutura
- Verificar se texto fornecido corresponde ao padrão esperado
- Detectar ausência de campos obrigatórios
- Identificar formato incorreto ou corrompido

### 3. Parsing e Extração
- Analisar texto validado para extrair informações
- Mapear campos encontrados para modelo de dados
- Normalizar e limpar valores extraídos

### 4. Armazenamento Dual
- **Texto bruto:** preservar entrada original para auditoria/reprocessamento
- **Dados estruturados:** popular modelos normalizados (Aluno, etc)

### 5. Status de Completude
- Indicar quais dados foram capturados
- Sinalizar dados faltantes ou pendentes
- Exibir progresso do cadastro completo

## ESCOPO

### Dentro do Escopo
✅ Captura de dados complementares (documentos, filiação, naturalidade, etc)
✅ **Captura de períodos cursados** (renovações de matrícula + dados de ingresso)
✅ Validação de estrutura de texto
✅ Parsing e extração automatizada
✅ Armazenamento de textos originais
✅ Atualização de registros de Aluno
✅ **Criação de registros de PeriodoCursado**
✅ Interface para entrada de dados
✅ Exibição de status de completude
✅ Suporte a múltiplas seções/páginas por aluno
✅ **Sistema de abas** para visualização (Dados Pessoais + Períodos Cursados)

### Fora do Escopo (nesta fase)
❌ Captura de histórico escolar com disciplinas/notas/frequência (será implementado futuramente)
❌ Integração direta com APIs externas
❌ OCR de documentos escaneados
❌ Importação em lote automatizada

## FLUXO DE ALTO NÍVEL

```
[Usuário]
    ↓ (1) Navega até aluno
[Sistema exibe status de cadastro]
    ↓ (2) Identifica dados faltantes
[Usuário acessa interface de importação]
    ↓ (3) Fornece texto estruturado
[Sistema valida estrutura]
    ↓ (4a) Válido → Parse e extração
    ↓ (4b) Inválido → Mensagem de erro
[Sistema armazena texto bruto]
    ↓ (5) Extrai e valida dados
[Sistema atualiza banco de dados]
    ↓ (6) Cria registro de auditoria
[Sistema exibe novo status]
    ✓ Dados atualizados e visíveis
```

## CATEGORIAS DE DADOS A IMPORTAR

### 1. Dados Pessoais (Implementado ✅)
- 32 campos de dados cadastrais, documentos, filiação, contato e certidão civil
- Origem: Seção "Dados Pessoais" do sistema oficial
- Destino: Model `Aluno` + campo JSONB `dadosOriginais`

### 2. Períodos Cursados (Nova funcionalidade 🆕)
- **Dados de Ingresso** (aparecem no primeiro período):
  - Ano Ingresso, Período Ingresso
  - Data de Inclusão do Aluno
  - Tipo Ingresso (Transferência, Outros, etc)
  - Rede de Ensino Origem (Estadual, Municipal, Particular, etc)

- **Dados de Renovação de Matrícula** (aparecem em todos os períodos):
  - Ano Letivo, Período Letivo (0=anual, 1/2=semestral)
  - Unidade de Ensino (código + nome)
  - Nível/Segmento (ex: MÉDIO)
  - Modalidade (REGULAR, EJA, etc)
  - Curso (descrição completa)
  - Série/Ano Escolar
  - Turno (M, T, N)
  - Matriz Curricular
  - Situação (Possui confirmação, etc)
  - Tipo Vaga (Vaga de Continuidade, etc)

- **Campos não capturáveis na colagem** (input radio/checkbox):
  - Ensino Religioso (será NULL)
  - Língua Estrangeira Facultativa (será NULL)

- Origem: Tabela "Renovação de Matrícula" do sistema oficial
- Destino: Model `PeriodoCursado` (novo)

### 3. Histórico Escolar Detalhado (Fora do escopo atual)
❌ Componentes curriculares (disciplinas)
❌ Notas por bimestre/semestre
❌ Frequência por disciplina
❌ Situação final por disciplina

> **Nota:** Esta categoria será implementada em fase futura, quando houver necessidade de capturar o histórico escolar completo com disciplinas, notas e frequência.

## BENEFÍCIOS ESPERADOS

### Para o Usuário
- ⚡ Entrada rápida de dados (vs digitação manual)
- ✅ Validação imediata de formato
- 📊 Visibilidade clara de progresso
- 🔄 Possibilidade de correção/reprocessamento

### Para o Sistema
- 🎯 Dados consistentes e validados
- 📝 Rastreabilidade completa (auditoria)
- 🔍 Facilita debugging e correções
- 🏗️ Arquitetura extensível para novas fontes

## RISCOS E MITIGAÇÕES

| Risco | Impacto | Mitigação |
|-------|---------|-----------|
| Formato de fonte externa muda | Alto | Armazenar texto bruto para reprocessamento |
| Dados parseados incorretamente | Médio | Validações + comparação visual antes de salvar |
| Usuário fornece texto incorreto | Médio | Validação de estrutura + feedback claro |
| Performance com muitos textos | Baixo | Índices adequados + paginação |
| Múltiplas seções inconsistentes | Médio | Validação cruzada entre seções |

## ARQUITETURA DE REUSO

### Princípio Fundamental

A funcionalidade de **Importação Estruturada por Texto** foi projetada para suportar **múltiplos tipos de dados** (Dados Pessoais, Dados Escolares, etc.) através de **abstração e reutilização de componentes**.

### Categorias de Reuso

#### 1. **Hook de Gerenciamento de Estado** (`useModoColagem`)
- **Princípio:** Um único hook gerencia o fluxo completo de colagem para **todos os tipos de dados**
- **Abstração:** Detecção automática de tipo → abertura do modal correto
- **Reutilização:** Mesmo hook para Dados Pessoais e Dados Escolares

#### 2. **Estratégia de Parsing**
- **Princípio:** Descritores de campos como **fonte única da verdade**
- **Abstração:** Cada parser define seus próprios descritores (labels, regex, saneamento)
- **Reutilização:** Metodologia de parsing (não código duplicado)

#### 3. **Padrão de Modal de Confirmação**
- **Princípio:** Estrutura comum (exibir dados → confirmar → salvar)
- **Abstração:** Layout e interações (Enter, Esc) padronizados
- **Reutilização:** Componentes específicos (ModalConfirmacaoDados, ModalConfirmacaoPeriodos)

#### 4. **Armazenamento Dual**
- **Princípio:** Texto bruto + dados estruturados para **todos os tipos**
- **Abstração:** Rastreabilidade e possibilidade de reprocessamento
- **Reutilização:**
  - Dados Pessoais: `textoBrutoDadosPessoais` + `dadosOriginais` (JSONB)
  - Dados Escolares: `textoBrutoDadosEscolares` + `PeriodoCursado[]` (relacional)

#### 5. **Componentes de Interface**
- **Princípio:** UI genérica reutilizada entre tipos
- **Abstração:** Componentes não sabem qual tipo de dado processam
- **Reutilização:**
  - `BotaoColagemAluno` - Usado por todos os tipos
  - `AreaColagemDados` - Captura paste independente do tipo
  - `Tabs` - Sistema de abas para visualização multi-seção

### Diferenciação por Tipo

Embora a arquitetura seja compartilhada, cada tipo de dado tem especificidades:

| Aspecto | Dados Pessoais | Dados Escolares |
|---------|----------------|-----------------|
| **Formato de entrada** | Campos chave-valor (linha por linha) | Tabela (múltiplas linhas separadas por TAB) |
| **Destino no banco** | Campos do model `Aluno` + JSONB | Model relacional `PeriodoCursado` (1-N) |
| **Parser específico** | `parseDadosPessoais.ts` | `parsePeriodosCursados.ts` |
| **Modal específico** | `ModalConfirmacaoDados` | `ModalConfirmacaoPeriodos` |

### Extensibilidade

A arquitetura permite **adicionar novos tipos** (ex: Histórico Escolar Detalhado) sem modificar componentes core:

1. Criar novo parser específico
2. Adicionar marcadores de detecção em `detectarTipoPagina`
3. Criar novo modal de confirmação (seguindo padrão)
4. Hook `useModoColagem` automaticamente roteia para o novo tipo

---

## PRÓXIMOS PASSOS

1. ✅ **CONCEITO** (este documento)
2. ⏭️ **ESPECIFICAÇÃO:** Checklist executável com validações detalhadas
3. ⏭️ **TÉCNICO:** Modelagem de dados, parsers, APIs
4. ⏭️ **CICLO DE VIDA:** Roadmap de implementação incremental

---

## REFERÊNCIAS

### 📋 Modelos de Colagem
- 📄 **[modelos/DadosPessoaisColagemModelo.md](./modelos/DadosPessoaisColagemModelo.md)** - Exemplo completo de texto colado do sistema oficial (Dados Pessoais)

### 📚 Documentação Relacionada
- [DESCOBERTA.md](./IMPORTACAO_ESTRUTURADA_DESCOBERTA.md) - Análise colaborativa e exemplos reais
- [ESPECIFICAÇÃO.md](./IMPORTACAO_ESTRUTURADA_ESPECIFICACAO.md) - Checklist executável de validações
- [CHECKPOINT.md](./IMPORTACAO_ESTRUTURADA_CHECKPOINT.md) - Estado atual da implementação

---

**Status:** 🟢 Aprovado para prosseguir com ESPECIFICAÇÃO
**Data:** 2025-01-31 (atualizado 2025-11-15)
**Responsável:** Sistema CIF