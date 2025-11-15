# DESCOBERTA: Importação Estruturada por Texto

## PROPÓSITO DESTE DOCUMENTO

Este documento contém **perguntas críticas** que precisam ser respondidas antes de criar especificações técnicas detalhadas. Evita decisões prematuras e garante que a solução seja baseada em **dados reais** e **necessidades concretas**.

**Fluxo CIF Atualizado:**
```
CONCEITO → DESCOBERTA → ESPECIFICAÇÃO → TÉCNICO → CICLO DE VIDA
```

---

## 📋 CHECKLIST DE DESCOBERTA

### ✅ = Respondida | ⏳ = Em análise | ⚪ = Pendente

---

## 1. ANÁLISE DE DADOS DE ORIGEM

### 1.1 Estrutura do Texto Fonte ✅

**Pergunta:** Como é exatamente a estrutura do texto que será fornecido?

**Resposta:**
- ✅ Texto copiado diretamente do sistema web externo (Conexão Educação SEEDUC-RJ)
- ✅ Formato: Texto puro com estrutura "Label: Valor"
- ✅ Múltiplas páginas/abas distintas (Dados Pessoais, Dados Escolares, etc)
- ✅ Contém muito ruído (menu lateral, cabeçalhos, rodapé)
- ✅ Padrão identificado: Linhas com `:` = campos de dados

**Decisão Crítica - Privacidade:**
🔒 **O texto bruto armazenado NÃO deve conter dados do usuário do sistema externo** (nome do operador, email, IP). Apenas dados do formulário devem ser salvos.

**Ponto de corte:** Ignorar tudo até primeira linha que seja claramente um campo de formulário (contém `:` e valor)

**Registro de exemplos:**

> 📄 **Modelo completo de colagem:** [modelos/DadosPessoaisColagemModelo.md](./modelos/DadosPessoaisColagemModelo.md)

```
✅ EXEMPLO 1 - PÁGINA: DADOS PESSOAIS
--------------------------------------
Nome:*	ANDRÉ RODRIGUES DE SOUSA FILHO
Data Nascimento:*	29/03/2007
Sexo:*	Masculino	Feminino
Naturalidade:*	00001404	IPU
Nome da Mãe:*	LUIZA MÁRCIA SOUSA RODRIGUES
CPF:	031.491.753-56
Nome do Pai:*	ANDRÉ RODRIGUES DE SOUSA
Responsável Legal:*	Mãe	Pai	Próprio Aluno	Outros
CEP:*	20251062
Município:*	RIO DE JANEIRO
Endereço:*	Rua Barão de Petrópolis
N.º:*	1064
CPF:	206.119.417-67
Tipo:	RG
Número*:	297398208
Estado*:	RJ
Órgão Emissor*:	DETRAN
Data de Expedição*:	05/09/2012

✅ EXEMPLO 2 - PÁGINA: DADOS ESCOLARES
--------------------------------------
Matrícula:*	202201940865733
Situação:	Concluido
Ano Ingresso:*	<2022>
Período Ingresso:*	0
Tipo Ingresso:*	Outros
Unidade de Ensino:*	33063397	CE SENOR ABRAVANEL
Nível/Segmento*:	MÉDIO
Modalidade*:	REGULAR
Série/Ano Escolar:*	ENSINO MÉDIO REGULAR - 3ª SÉRIE
```

**Características identificadas:**
- ✅ Campos marcados com `*` após o label
- ✅ Separador: tab (`\t`) ou espaços múltiplos
- ✅ Campos multi-valor (radio/checkbox): valores separados por tab
- ✅ Alguns campos têm código + descrição (ex: "00001404 IPU")

---

### 1.2 Marcadores e Rótulos ✅

**Pergunta:** Quais são os rótulos/marcadores exatos usados no sistema externo?

**Decisão:**
- ✅ Mapeamento criado: **Label do sistema externo → Campo do banco interno**
- ✅ Campos baseados no schema `Aluno` existente
- ✅ Caráter incremental - expandir conforme necessário

**Padrão de parsing:**
```regex
^([A-Za-zÀ-úÀ-ÿ\s/\.º\(\)]+):\*?\s+(.+)$
```

**Mapeamento Completo - DADOS PESSOAIS (Página 1):**

| Label no Sistema Externo | Campo no Banco (`Aluno`) | Tipo | Transformação | Observações |
|--------------------------|--------------------------|------|---------------|-------------|
| `Nome:`                  | `nome`                   | String(200) | Trim, uppercase | ✅ Existe |
| `Nome Social:`           | - | - | Ignorar por enquanto | ❌ Não existe |
| `Data Nascimento:`       | `dataNascimento`         | Date | Parse DD/MM/YYYY | ✅ Existe |
| `Sexo:`                  | `sexo`                   | String(1) | **ESPECIAL** - escolha manual | ✅ Existe |
| `Estado Civil:`          | - | - | Ignorar por enquanto | ❌ Não existe |
| `País de Nascimento:`    | - | - | Ignorar por enquanto | ❌ Não existe |
| `Nacionalidade:`         | `nacionalidade`          | String(50) | Trim, uppercase | ✅ Existe |
| `UF de Nascimento:`      | `uf`                     | String(2) | Trim, uppercase | ✅ Existe |
| `Naturalidade:` (código) | - | - | Ignorar código | ⚠️ Não mapear |
| `Naturalidade:` (nome)   | `naturalidade`           | String(100) | Trim, pegar 2º valor | ✅ Existe |
| `Necessidade Especial:`  | - | - | Ignorar por enquanto | ❌ Não existe |
| `Nome da Mãe:`           | `nomeMae`                | String(200) | Trim, uppercase | ✅ Existe |
| `CPF` (mãe)              | - | - | Ignorar por enquanto | ❌ Não existe |
| `Nome do Pai:`           | `nomePai`                | String(200) | Trim, uppercase | ✅ Existe |
| `CPF` (pai)              | - | - | Ignorar por enquanto | ❌ Não existe |
| `E-mail:`                | - | - | Ignorar por enquanto | ❌ Não existe |
| **Seção: Outras Informações** |||
| `CPF:` (aluno)           | `cpf`                    | String(14) | Remover pontuação | ✅ Existe |
| `Tipo:` (doc identidade) | - | - | Não assumir "RG"  | ❌ Não existe (Criar campo) |
| `Número:`                | `rg`                     | String(20) | Trim | ✅ Existe |
| `Complemento da identidade:` | - | - | Ignorar | ❌ Não existe |
| `Estado:` (emissão)      | - | - | Ignorar | ❌ Não existe |
| `Órgão Emissor:`         | `rgOrgaoEmissor`         | String(20) | Trim, uppercase | ✅ Existe |
| `Data de Expedição:`     | `rgDataEmissao`          | Date | Parse DD/MM/YYYY | ✅ Existe |
| **Seção: Certidão Civil** | | | **Ignorar toda seção por enquanto** | |
| `Tipo Certidão Civil:`   | - | - | Ignorar | ❌ Não existe |
| `Certidão Civil:`        | - | - | Ignorar | ❌ Não existe |
| `UF do Cartório:`        | - | - | Ignorar | ❌ Não existe |
| `Município do Cartório:` | - | - | Ignorar | ❌ Não existe |
| `Cartório:`              | - | - | Ignorar | ❌ Não existe |
| `Número do Termo:`       | - | - | Ignorar | ❌ Não existe |
| `Data de Emissão:`       | - | - | Ignorar | ❌ Não existe |
| `Estado:`                | - | - | Ignorar | ❌ Não existe |
| `Folha:`                 | - | - | Ignorar | ❌ Não existe |
| `Livro:`                 | - | - | Ignorar | ❌ Não existe |

**Campos que serão importados (MVP):**
```
✅ Nome
✅ Data Nascimento
✅ Sexo (com escolha manual obrigatória)
✅ Nacionalidade
✅ UF de Nascimento
✅ Naturalidade
✅ Nome da Mãe
✅ Nome do Pai
✅ CPF (aluno)
✅ Tipo de documento
✅ RG (número)
✅ Órgão Emissor
✅ Data de Expedição (RG)

Total: 13 campos
```

**Campos especiais:**
- `Sexo:` → Exige escolha manual entre "Masculino"/"Feminino"
- `Naturalidade:` → Vem como "00001404 IPU", pegar apenas "IPU" (2º valor)

---

### 1.3 Tipos de Seções ✅

**Pergunta:** Quantas e quais "páginas" ou seções diferentes existem?

**Resposta:**
- ✅ Identificadas 3 seções principais no sistema oficial
- ✅ Definido escopo de importação (2 de 3)
- ✅ Não há interdependência obrigatória (são independentes)
- ✅ Ordem de importação: livre (usuário escolhe)

**Registro de seções:**
```
✅ Seção 1: Dados Pessoais (IMPLEMENTADA)
✅ Seção 2: Períodos Cursados - Renovação de Matrícula (NOVA)
❌ Seção 3: Histórico Escolar Detalhado (FORA DO ESCOPO)
```

**Detalhes:**

**Seção 1 - Dados Pessoais** (já implementada):
- Origem: Aba "Dados Pessoais" no sistema oficial
- 32 campos capturados
- Destino: Model `Aluno` + JSONB `dadosOriginais`

**Seção 2 - Períodos Cursados** (nova):
- Origem: Tabela "Renovação de Matrícula" no sistema oficial
- Dados de Ingresso (1ª linha) + Dados de Renovação (todas as linhas)
- Destino: Model `PeriodoCursado` (novo)

**Seção 3 - Histórico Escolar Detalhado** (fora do escopo):
- Origem: Tabela "Histórico de Confirmação de Matrícula" (segunda tabela)
- Motivo da exclusão: Foco nos períodos cursados, não nas confirmações individuais
- Será implementado futuramente quando houver necessidade de disciplinas/notas

---

### 1.4 Estrutura da Tabela "Renovação de Matrícula" ✅

**Pergunta:** Como é exatamente a estrutura da tabela de renovação de matrícula?

**Resposta:**
- ✅ Formato: Tabela HTML copiada do sistema oficial
- ✅ Múltiplas linhas (uma por período letivo cursado)
- ✅ Primeira linha contém TAMBÉM os dados de ingresso
- ✅ Cabeçalhos fixos separados por TAB

**Exemplo real de colagem fornecido pelo usuário:**

> 📄 **Modelo completo de colagem:** [modelos/DadosPessoaisColagemModelo.md](./modelos/DadosPessoaisColagemModelo.md)

```
Renovação de Matrícula
Ano Letivo	Período Letivo	Unidade de Ensino	Modalidade / Segmento / Curso	Série/Ano Escolar	Turno	Ensino Religioso	Língua Estrangeira Facultativa	Situação	Tipo Vaga
2024	0	CE ESCOLA TESTE	REGULAR / MÉDIO / NEM ITINERÁRIO FORMATIVO BLOCO TEMÁTICO LGG+CHS - CIDADANIA ATIVA	3	M			Possui confirmação	Vaga de Continuidade
2023	0	CE OUTRA ESCOLA TESTE / MÉDIO / NEM ITINERÁRIO FORMATIVO DE LINGUAGENS E SUAS TECNOLOGIAS - MÍDIAS: LINGUAGENS EM AÇÃO	2	M			Possui confirmação	Vaga de Continuidade
```

**Dados de Ingresso (aparecem separadamente, ANTES da tabela):**

```
Dados de Ingresso
Ano Ingresso:*	<2022>
Período Ingresso:*	0
Data de Inclusão do Aluno:	11/01/2022 11:45:07
Tipo Ingresso:*	Outros
Rede de Ensino Origem:*	Estadual
```

**Estrutura de Escolaridade (contexto do aluno, ANTES dos dados de ingresso):**

```
Escolaridade
Unidade de Ensino:*	33063397	CE ESCOLA TESTE
Nível/Segmento*:	MÉDIO
Modalidade*:	REGULAR
Curso:*	0023.29	NEM ITINERÁRIO FORMATIVO BLOCO TEMÁTICO LGG+CHS - CIDADANIA ATIVA
Turno:*	MANHÃ
Matriz Curricular:*	NEM_IF_LGG+CHS_01_24
Série/Ano Escolar:*	ENSINO MÉDIO REGULAR - 3ª SÉRIE
```

**Mapeamento de Campos - Tabela de Renovação:**

| Coluna da Tabela                 | Campo no Model `PeriodoCursado` | Tipo        | Transformação            | Observações                                    |
|----------------------------------|---------------------------------|-------------|--------------------------|------------------------------------------------|
| `Ano Letivo`                     | `anoLetivo`                     | String(4)   | Trim                     | ✅ Sempre presente (ex: "2024")                |
| `Período Letivo`                 | `periodoLetivo`                 | String(1)   | Trim                     | ✅ "0" (anual), "1" ou "2" (semestral)         |
| `Unidade de Ensino`              | `unidadeEnsino` + `codigoEscola`| String      | Split por tab            | ✅ Pode vir só nome ou código + nome           |
| `Modalidade / Segmento / Curso`  | 3 campos separados              | String      | Split por " / "          | ✅ Ex: "REGULAR / MÉDIO / NEM ITINERÁRIO..."   |
| `Série/Ano Escolar`              | `serie`                         | String(10)  | Trim                     | ✅ Ex: "3" ou "3ª SÉRIE"                       |
| `Turno`                          | `turno`                         | String(1)   | Trim                     | ✅ "M", "T", "N"                               |
| `Ensino Religioso`               | `ensinoReligioso`               | String?     | NULL                     | ⚠️ NÃO capturável (input radio vazio na colagem)|
| `Língua Estrangeira Facultativa` | `linguaEstrangeira`             | String?     | NULL                     | ⚠️ NÃO capturável (input radio vazio na colagem)|
| `Situação`                       | `situacao`                      | String(50)  | Trim                     | ✅ Ex: "Possui confirmação"                    |
| `Tipo Vaga`                      | `tipoVaga`                      | String(50)  | Trim                     | ✅ Ex: "Vaga de Continuidade"                  |

**Mapeamento de Campos - Dados de Ingresso (primeira linha apenas):**

| Label no Texto          | Campo no Model `PeriodoCursado` | Tipo        | Transformação            | Observações                                    |
|-------------------------|---------------------------------|-------------|--------------------------|------------------------------------------------|
| `Ano Ingresso:`         | `anoIngresso`                   | String(4)   | Remover `<>` se presente | ✅ Ex: "<2022>" → "2022"                       |
| `Período Ingresso:`     | `periodoIngresso`               | String(1)   | Trim                     | ✅ "0", "1" ou "2"                             |
| `Data de Inclusão do Aluno:` | `dataInclusao`             | DateTime    | Parse DD/MM/YYYY HH:mm:ss| ⚠️ Formato com horário: "11/01/2022 11:45:07"  |
| `Tipo Ingresso:`        | `tipoIngresso`                  | String(50)  | Trim                     | ✅ Ex: "Outros", "Transferência"               |
| `Rede de Ensino Origem:`| `redeEnsinoOrigem`              | String(50)  | Trim                     | ✅ Ex: "Estadual", "Municipal", "Particular"   |

**Mapeamento de Campos - Escolaridade Atual (contexto, para primeira linha):**

| Label no Texto          | Campo no Model `PeriodoCursado` | Tipo        | Transformação            | Observações                                    |
|-------------------------|---------------------------------|-------------|--------------------------|------------------------------------------------|
| `Matriz Curricular:`    | `matrizCurricular`              | String(100) | Trim                     | ✅ Ex: "NEM_IF_LGG+CHS_01_24"                  |

**Campos que serão importados por período:**

```
✅ Ano Letivo
✅ Período Letivo
✅ Unidade de Ensino (nome)
✅ Código da Escola (se presente)
✅ Modalidade
✅ Segmento
✅ Curso (descrição completa)
✅ Série/Ano Escolar
✅ Turno
✅ Situação
✅ Tipo Vaga
✅ Matriz Curricular (se presente)

Apenas na primeira linha (dados de ingresso):
✅ Ano Ingresso
✅ Período Ingresso
✅ Data de Inclusão do Aluno
✅ Tipo Ingresso
✅ Rede de Ensino Origem

Não capturáveis (sempre NULL):
❌ Ensino Religioso
❌ Língua Estrangeira Facultativa
```

**Características especiais:**

1. **Primeira linha = Dados de Ingresso + Renovação:**
   - Contém TODOS os campos de renovação
   - MAIS os campos de ingresso (ano, período, data, tipo, rede)

2. **Demais linhas = Apenas Renovação:**
   - Apenas os campos da tabela
   - Campos de ingresso ficam NULL

3. **Parsing de "Modalidade / Segmento / Curso":**
   - Split por " / " (espaço barra espaço)
   - 3 partes: modalidade, segmento, curso

4. **Parsing de "Unidade de Ensino":**
   - Pode vir como "CE ESCOLA TESTE" (só nome)
   - Ou "33063397 CE ESCOLA TESTE" (código + nome)
   - Split por tab ou espaço múltiplo

5. **Formato de data com horário:**
   - "11/01/2022 11:45:07" → precisa parsear com hora

---

### 1.5 Dados Opcionais vs Obrigatórios ⚪

**Pergunta:** Quais campos são obrigatórios vs opcionais no sistema externo?

**Necessário:**
- [ ] Distinguir campos que sempre aparecem
- [ ] Identificar campos condicionais
- [ ] Verificar campos que podem estar vazios
- [ ] Definir quais são críticos para nosso sistema

**Ação:** Analisar múltiplos exemplos (casos variados)

**Registro:**
```
Obrigatórios: [ ]
Opcionais: [ ]
Críticos para nós: [ ]
```

---

## 2. MAPEAMENTO DE DADOS

### 2.1 Correspondência com Modelo Atual ⚪

**Pergunta:** Como os campos do texto se mapeiam para o modelo `Aluno`?

**Necessário:**
- [ ] Revisar schema atual de `Aluno` (Prisma)
- [ ] Mapear cada campo do texto para coluna do banco
- [ ] Identificar campos que não existem no modelo atual
- [ ] Decidir se novos campos precisam ser criados

**Ação:** Criar tabela de mapeamento

**Registro de mapeamento:**
```
| Campo no Texto | Campo no Banco | Transformação Necessária | Status |
|----------------|----------------|--------------------------|---------|
| "Nome:"        | aluno.nome     | Trim, Title Case         | ✓      |
| "CPF:"         | aluno.cpf      | Remover pontuação        | ✓      |
| ...            | ...            | ...                      | ...    |
```

---

### 2.2 Campos Novos no Schema ⚪

**Pergunta:** Precisamos adicionar novos campos ao modelo `Aluno`?

**Necessário:**
- [ ] Listar campos presentes no texto mas ausentes no banco
- [ ] Definir tipos de dados adequados
- [ ] Decidir se são obrigatórios ou opcionais
- [ ] Planejar migração do Prisma

**Ação:** Propor alterações no schema

**Registro de novos campos:**
```prisma
model Aluno {
  // Existentes
  matricula String @id
  nome String

  // NOVOS (a definir)
  // exemplo: orgaoEmissorRG String?
}
```

---

### 2.3 Transformações de Dados ⚪

**Pergunta:** Quais transformações são necessárias entre texto e banco?

**Necessário:**
- [ ] Formatação de datas (DD/MM/YYYY → ISO?)
- [ ] Limpeza de pontuação (CPF, RG)
- [ ] Normalização de nomes (case, acentos)
- [ ] Conversão de valores (ex: "Sim"/"Não" → boolean)

**Ação:** Documentar regras de transformação

**Registro de transformações:**
```typescript
// Exemplos (a definir)
transformarData(texto: string): Date
transformarCPF(texto: string): string
transformarNome(texto: string): string
```

---

## 3. VALIDAÇÕES E REGRAS DE NEGÓCIO

### 3.1 Validações Específicas ⚪

**Pergunta:** Quais validações são críticas para os dados importados?

**Necessário:**
- [ ] Definir validações de formato (CPF, RG, datas)
- [ ] Definir validações de lógica (idade plausível, etc)
- [ ] Definir validações de consistência (nome mãe vs pai)
- [ ] Priorizar validações (bloqueantes vs avisos)

**Ação:** Listar e priorizar validações

**Registro:**
```
Bloqueantes (impedem importação):
- [ ] CPF inválido
- [ ] Data de nascimento futura
...

Avisos (permitem importação com alerta):
- [ ] Nome com apenas 1 palavra
- [ ] Idade fora da faixa típica
...
```

---

### 3.2 Conflitos com Dados Existentes ✅

**Pergunta:** O que fazer se aluno já tem dados preenchidos?

**Decisão:**
- ✅ **SEMPRE sobrescrever** dados existentes com os da colagem
- ✅ Atualizar `ultimaAtualizacao` (timestamp)
- ✅ Manter **dois conjuntos de dados:**
  - **`dadosOriginais`:** Imutáveis, não editáveis pela UI (vêm da colagem)
  - **`dadosEditaveis`:** Cópia que pode ser modificada pelo usuário

**Estratégia:**
```
SE não houver campo original ANTES:
  → Criar dadosOriginais (mesmo com informações parciais)
  → Criar dadosEditaveis (cópia)

SE já houver campo original:
  → Atualizar dadosOriginais
  → Atualizar ultimaAtualizacaoTexto (originais)

SOBRE o campo editável:
  → não modificar nada no momento da colagem;
```

**UI futura:**
- 🎯 Sistema de comparação visual (original vs editado)
- 🎯 Indicador de modificações

---

### 3.3 Dados Incompletos ⚪

**Pergunta:** Como tratar importação parcial (campos ausentes)?

**Necessário:**
- [ ] Definir se importação parcial é permitida
- [ ] Decidir como sinalizar dados incompletos
- [ ] Planejar fluxo para completar dados depois
- [ ] Verificar se há dependências entre campos

**Ação:** Definir regras de importação parcial

**Registro:**
```
Permitir importação se:
- [ ] Pelo menos X% dos campos obrigatórios presentes
- [ ] Campos críticos (quais?) sempre presentes
- [ ] Outras condições: _______________
```

---

## 4. EXPERIÊNCIA DO USUÁRIO

### 4.1 Ponto de Entrada na Interface ✅

**Pergunta:** Onde na UI o usuário iniciará a importação?

**Decisão:**
- ✅ **Fluxo de Certificação → Lista lateral de alunos**
- ✅ Cada item da lista terá 2 novos botões:
  1. **📋 Copiar matrícula** - Copia número para clipboard
  2. **🔓 Habilitar colagem** - Botão alternante para ativar modo colagem

**Possível variação (a testar):**
- Controles também na área de dados à direita
- Decisão final após experimentação

**Componentes afetados:**
- `ListaAlunosCertificacao.tsx` - Adicionar botões no item da lista
- Criar novo componente: `BotaoColagemAluno.tsx`

---

### 4.2 Fluxo Passo a Passo ⚪

**Pergunta:** Qual é o fluxo ideal de interação do usuário?

**Necessário:**
- [ ] Definir número de etapas (1 passo, wizard, etc)
- [ ] Decidir se validação é síncrona (tempo real) ou assíncrona (após submit)
- [ ] Planejar feedback visual em cada etapa
- [ ] Considerar possibilidade de cancelamento/voltar

**Ação:** Desenhar wireframe ou descrever fluxo

**Registro de fluxo:**
```
Passo 1: Selecionar aluno (ou já está selecionado?)
Passo 2: Escolher tipo de seção (ou detectar automaticamente?)
Passo 3: Colar texto
Passo 4: Validar (botão ou automático?)
Passo 5: Pré-visualizar dados extraídos
Passo 6: Confirmar importação
```

---

### 4.3 Indicadores de Status ⚪

**Pergunta:** Como sinalizar visualmente o estado de completude dos dados?

**Necessário:**
- [ ] Definir onde exibir status (card, badge, ícone?)
- [ ] Decidir granularidade (por categoria, por campo, geral?)
- [ ] Escolher cores/ícones semânticos
- [ ] Planejar detalhamento ao clicar/hover

**Ação:** Mockup de indicadores

**Registro:**
```
Localização: _______________
Formato: [ ] Badge [ ] Barra de progresso [ ] Checklist [ ] Outro: ___
Cores: 🟢 Completo | 🟡 Parcial | 🔴 Ausente | ⚪ Não aplicável
```

---

### 4.4 Mensagens de Erro ⚪

**Pergunta:** Como comunicar erros de forma clara e acionável?

**Necessário:**
- [ ] Definir tom das mensagens (técnico vs leigo)
- [ ] Decidir nível de detalhe
- [ ] Planejar sugestões de correção
- [ ] Considerar múltiplos erros simultâneos

**Ação:** Rascunhar exemplos de mensagens

**Registro:**
```
Erro: Texto não reconhecido
Mensagem: "O texto fornecido não corresponde a nenhuma seção conhecida. Verifique se copiou da página correta."

Erro: CPF inválido
Mensagem: "CPF encontrado (123.456.789-00) possui dígitos verificadores inválidos. Confira o valor no sistema original."
```

---

## 5. ARQUITETURA E PERSISTÊNCIA

### 5.1 Modelo de Dados para Textos ⚪

**Pergunta:** Como estruturar a tabela de textos importados?

**Necessário:**
- [ ] Definir campos da tabela `TextoImportado` (ou nome melhor?)
- [ ] Decidir se armazenar múltiplas seções como registros separados ou array
- [ ] Planejar relacionamentos (1-N com Aluno?)
- [ ] Considerar indexação para queries rápidas

**Ação:** Propor schema Prisma

**Registro:**
```prisma
model TextoImportado {
  id String @id @default(cuid())
  alunoMatricula String
  tipoSecao String // ou enum?
  textoOriginal String @db.Text
  status String // 'pendente' | 'processado' | 'erro'

  // Campos adicionais?
  criadoEm DateTime @default(now())
  processadoEm DateTime?
  erroMensagem String?

  aluno Aluno @relation(fields: [alunoMatricula], references: [matricula])
}
```

---

### 5.2 Rastreabilidade e Auditoria ⚪

**Pergunta:** Como garantir rastreabilidade de cada dado importado?

**Necessário:**
- [ ] Decidir se usar campo `origemTipo` existente ou criar novo
- [ ] Definir se armazenar referência ao `TextoImportado.id` em cada campo
- [ ] Planejar consulta de origem (dado X veio de qual importação?)
- [ ] Considerar impacto em edições manuais posteriores

**Ação:** Definir estratégia de rastreabilidade

**Registro:**
```
Opção 1: Campo `origemTipo` = 'importacao_texto' (genérico)
Opção 2: Novo campo `textoImportadoId` em Aluno (específico)
Opção 3: Usar tabela Auditoria existente
Opção escolhida: _______________
```

---

### 5.3 Performance e Escalabilidade ⚪

**Pergunta:** Há preocupações de performance com volume de dados?

**Necessário:**
- [ ] Estimar quantidade de textos armazenados (por aluno, total)
- [ ] Verificar tamanho médio de texto (KB)
- [ ] Considerar limpeza de textos antigos (política de retenção)
- [ ] Planejar índices para queries frequentes

**Ação:** Estimar e planejar

**Registro:**
```
Estimativa:
- Alunos no sistema: ~800
- Textos por aluno: ~3 seções
- Tamanho médio: ??? KB
- Total: ??? MB

Índices necessários:
- [ ] alunoMatricula
- [ ] status
- [ ] criadoEm
```

---

## 6. IMPLEMENTAÇÃO E PRIORIZAÇÃO

### 6.1 MVP (Mínimo Viável) ⚪

**Pergunta:** Qual é o escopo mínimo para validar a solução?

**Necessário:**
- [ ] Escolher 1 tipo de seção para implementar primeiro
- [ ] Definir validações essenciais vs "nice to have"
- [ ] Decidir interface mínima funcional
- [ ] Planejar teste com dados reais

**Ação:** Definir escopo do MVP

**Registro de MVP:**
```
Seção escolhida: _______________
Campos obrigatórios: [ ]
Validações críticas: [ ]
Interface: [ ] Modal simples [ ] Página dedicada
Critério de sucesso: _______________
```

---

### 6.2 Roadmap de Expansão ⚪

**Pergunta:** Qual a ordem de implementação das demais seções?

**Necessário:**
- [ ] Priorizar seções por criticidade
- [ ] Considerar complexidade de parsing
- [ ] Verificar dependências entre seções
- [ ] Alinhar com necessidades do usuário

**Ação:** Ordenar seções

**Registro de roadmap:**
```
Fase 1 (MVP): [ ] Seção _______________
Fase 2: [ ] Seção _______________
Fase 3: [ ] Seção _______________
...
```

---

### 6.3 Riscos Técnicos ⚪

**Pergunta:** Quais são os principais desafios técnicos previstos?

**Necessário:**
- [ ] Identificar pontos de incerteza (parsing complexo, etc)
- [ ] Avaliar necessidade de bibliotecas externas
- [ ] Considerar testes com dados reais
- [ ] Planejar estratégia de validação

**Ação:** Listar e mitigar riscos

**Registro de riscos:**
```
Risco 1: Variação de formato no texto fonte
Mitigação: Armazenar texto bruto + permitir reprocessamento

Risco 2: Performance de parsing em tempo real
Mitigação: Processar em background + feedback assíncrono

...
```

---

## 7. RESUMO EXECUTIVO - FLUXO CONSOLIDADO ✅

> **Propósito:** Visão única do fluxo completo para referência rápida durante implementação

### Fluxo do Usuário

**PÁGINA 1 - DADOS PESSOAIS (com parsing completo):**
```
1. Sistema Interno → Clicar "📋 Copiar matrícula" (item da lista)
2. Sistema Externo → Buscar aluno, copiar dados
3. Sistema Interno → Clicar "🔓 Habilitar colagem"
4. Sistema Interno → Colar texto (Ctrl+V)
5. Preview → Preencher campos especiais obrigatórios (ex: Sexo)
6. Confirmar (Enter) → Dados parseados e salvos em campos estruturados
```

**PÁGINA 2 - DADOS ESCOLARES (apenas armazenamento):**
```
1. Sistema Interno → Clicar "📋 Copiar matrícula" (item da lista)
2. Sistema Externo → Buscar aluno, copiar dados escolares
3. Sistema Interno → Clicar "🔓 Habilitar colagem"
4. Sistema Interno → Colar texto (Ctrl+V)
5. Confirmação simples → Texto bruto salvo em TextoImportado
6. FUTURO: Botão "Processar Dados Escolares" para parsing posterior
```

### Validações Críticas
- ✅ Matrícula no texto DEVE bater com aluno ativo (senão: cancelar + permitir retry)
- ✅ Campos especiais (Sexo) DEVEM ser preenchidos (senão: bloquear confirmação)
- ✅ Texto bruto armazenado SEM dados do usuário externo (privacidade)

### Detecção de Página
- Automática por comparação de campos presentes
- Ver detalhes em seção 7.3 (se implementada) ou estratégia multi-campos

### Armazenamento
- `dadosOriginais` (imutáveis, da colagem) + `dadosEditaveis` (modificáveis)
- Ver política completa em **seção 3.2**

### Componentes a Criar
- `BotaoColagemAluno.tsx` - Botões copiar matrícula + habilitar colagem
- `PreviewImportacao.tsx` - Modal de preview com campos encontrados/faltantes
- `src/lib/keyboard-shortcuts.ts` - Módulo de atalhos (Enter, Esc)

### Teclas de Atalho
- `Enter` → Confirmar preview
- `Esc` → Cancelar colagem
- `Ctrl+V` → Detectar colagem (quando habilitado)

---

## 📊 PRÓXIMOS PASSOS

### ✅ Concluído
1. ✅ Lista completa de campos definida (seção 1.2)
2. ✅ Mapeamento criado: Label externo → Campo interno
3. ✅ MVP definido: **Dados Pessoais (Página 1)** - 13 campos

### Próxima Ação
4. **Criar documento CONCEITO** - Visão de alto nível da funcionalidade
5. **Criar documento ESPECIFICAÇÃO** - Checklist executável com validações
6. **Criar documento TÉCNICO** - Schema Prisma, APIs, funções de parsing
7. **Criar documento CICLO DE VIDA** - Roadmap de implementação

### Decisão Sobre Segunda Página
- **Dados Escolares (Página 2):** Armazenar apenas texto bruto por enquanto
- **NÃO haverá parsing automático** na colagem da página 2
- **NÃO haverá gravação em campos estruturados** na colagem da página 2
- **Workflow futuro:**
  1. Usuário cola → Texto bruto salvo em `TextoImportado`
  2. Sistema exibe botão/ação "Processar Dados Escolares" (futuro)
  3. Ao clicar → Parser extrai campos → Grava em modelo estruturado
- Parsing e mapeamento completo serão implementados em fase posterior

---

## 🔄 ATUALIZAÇÃO DA METODOLOGIA CIF

Este documento estabelece novo padrão CIF:

```
┌─────────────┐
│  CONCEITO   │  Visão de alto nível, motivação, objetivos
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ DESCOBERTA  │  Perguntas, exemplos reais, análise colaborativa ← NOVO
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ESPECIFICAÇÃO│  Checklist executável, validações (baseado em Descoberta)
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  TÉCNICO    │  Schema, APIs, parsers (baseado em Descoberta)
└──────┬──────┘
       │
       ▼
┌─────────────┐
│CICLO DE VIDA│  Roadmap, implementação incremental
└─────────────┘
```

**Benefícios:**
- ✅ Evita decisões prematuras
- ✅ Baseado em dados reais
- ✅ Colaboração ativa entre desenvolvedor e cliente
- ✅ Documentação viva (atualizada conforme descobertas)
- ✅ Reduz retrabalho

---

**Status:** 🟡 Em preenchimento
**Data de criação:** 2025-01-31
**Última atualização:** 2025-01-31
**Responsável:** Sistema CIF