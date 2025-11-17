# ESPECIFICAÇÃO: Colagem de Dados Escolares

**Status:** 🟡 Em elaboração
**Metodologia:** CIF (Ciclo de Integridade de Funcionalidades)
**Fase:** ESPECIFICAÇÃO
**Criado em:** 2025-11-14
**Última atualização:** 2025-11-14

---

## ÍNDICE

1. [Checklist de Validações](#1-checklist-de-validações)
2. [Casos de Teste](#2-casos-de-teste)
3. [Regras de Negócio Detalhadas](#3-regras-de-negócio-detalhadas)
4. [Requisitos Funcionais](#4-requisitos-funcionais)
5. [Requisitos Não-Funcionais](#5-requisitos-não-funcionais)
6. [Critérios de Aceitação](#6-critérios-de-aceitação)

---

## 1. CHECKLIST DE VALIDAÇÕES

### 1.1 Estrutura e Identificação

| ID            | Validação                                                                                 | Prioridade | Comportamento em Falha                                              | Teste Correspondente                 |
| ------------- | ------------------------------------------------------------------------------------------ | ---------- | ------------------------------------------------------------------- | ------------------------------------ |
| **V-EST-001** | Texto colado não pode estar vazio                                                          | 🟥 Crítico  | Bloquear com “Cole o texto completo da aba Dados Escolares”        | `ct-texto-vazio`                     |
| **V-EST-002** | Texto deve conter cabeçalho `Dados Escolares` e seção `Aluno`                              | 🟥 Crítico  | Bloquear com “Estrutura de dados escolares não encontrada”         | `ct-cabecalho-ausente`               |
| **V-EST-003** | Seções `Dados de Ingresso` e `Escolaridade` precisam existir                               | 🟥 Crítico  | Bloquear e informar qual seção está faltando                       | `ct-secao-faltando`                  |
| **V-EST-004** | Tabela `Renovação de Matrícula` precisa ter cabeçalho completo (10 colunas)                | 🟥 Crítico  | Bloquear com “Tabela de renovação incompleta”                      | `ct-tabela-incompleta`               |
| **V-EST-005** | Matrícula encontrada no texto deve coincidir com o aluno selecionado                       | 🟥 Crítico  | Bloquear com “Matrícula do texto não corresponde ao aluno ativo”   | `ct-matricula-incorreta`             |
| **V-EST-006** | Conteúdo deve ser recortado entre `Aluno` e `<< Anterior` (rodapé não pode ser interpretado) | 🟧 Alto     | Limpar automaticamente; se não for possível, avisar usuário        | `ct-rodape-presente`                 |

### 1.2 Campos e Normalizações

| ID            | Campo                          | Regra                                                                 | Prioridade | Falha                                                          | Teste |
| ------------- | ------------------------------ | --------------------------------------------------------------------- | ---------- | -------------------------------------------------------------- | ----- |
| **V-CAM-001** | Ano de Ingresso                | Deve conter quatro dígitos (ignorar `<` `>`)                          | 🟥 Crítico  | Bloquear + mensagem “Ano de ingresso inválido”                 | `ct-ano-ingresso` |
| **V-CAM-002** | Período de Ingresso            | Numérico (0–9). Valores não numéricos → erro                          | 🟥 Crítico  | Bloquear                                                       | `ct-periodo-ingresso` |
| **V-CAM-003** | Data de Inclusão               | Aceita `DD/MM/YYYY HH:MM:SS`; se ausente, salvar `null`               | 🟧 Alto     | Aviso não bloqueante + registro `null`                         | `ct-data-inclusao` |
| **V-CAM-004** | Unidade de Ensino (escolaridade) | Separar código (quando existir) e descrição                           | 🟧 Alto     | Salvar mesmo sem código, mas logar aviso                        | `ct-unidade-split` |
| **V-CAM-005** | Curso                           | Dividir código (`0023.29`) de descrição (texto)                       | 🟧 Alto     | Salvar descrição completa e registrar warning                   | `ct-curso-split` |
| **V-CAM-006** | Recebe Escolarização em Outro Espaço | Normalizar para boolean: `SIM` → `true`, `NÃO`/`NÃO RECEBE` → `false` | 🟧 Alto     | Se valor desconhecido, salvar `null` e avisar                   | `ct-booleano-escolarizacao` |

### 1.3 Tabelas

| ID            | Validação                                                                                               | Prioridade | Comportamento em Falha                                                 | Teste |
| ------------- | -------------------------------------------------------------------------------------------------------- | ---------- | ---------------------------------------------------------------------- | ----- |
| **V-TAB-001** | Tabela `Renovação de Matrícula` deve ter pelo menos uma linha                                           | 🟥 Crítico  | Bloquear com mensagem dedicada                                         | `ct-tabela-vazia` |
| **V-TAB-002** | Cada linha precisa gerar objeto contendo todas as colunas (mesmo que vazias → `null`)                    | 🟧 Alto     | Completar com `null`; logar aviso                                     | `ct-linha-incompleta` |
| **V-TAB-003** | Anos/períodos duplicados devem ser agrupados mantendo ordem do texto                                     | 🟧 Alto     | Agrupar e registrar `duplicated=true`; nunca descartar informações     | `ct-ano-duplicado` |
| **V-TAB-004** | Ano/Período do bloco de ingresso deve ser inserido no histórico caso não exista                          | 🟧 Alto     | Criar linha sintética com origem `ingresso`                            | `ct-ano-ingresso-no-historico` |
| **V-TAB-005** | “Histórico de Confirmação” deve ser armazenado com todos os campos (mesmo se tabela vazia → array vazio) | 🟧 Alto     | Persistir array vazio em vez de `null`                                | `ct-historico-confirmacao` |

### 1.4 Persistência e UI

| ID            | Validação                                                                                              | Prioridade | Comportamento                                                         | Teste |
| ------------- | ------------------------------------------------------------------------------------------------------- | ---------- | -------------------------------------------------------------------- | ----- |
| **V-PER-001** | Estrutura JSON (`dadosEscolares`) precisa ser salva em `Aluno`                                          | 🟥 Crítico  | Se falhar gravar, retornar erro 500 e manter indicador laranja       | `ct-salvar-json` |
| **V-PER-002** | Texto bruto deve ser salvo exatamente como colado em `textoBrutoDadosEscolares`                        | 🟥 Crítico  | Em falha, não permitir confirmação                                   | `ct-salvar-texto` |
| **V-UI-001** | Indicador escolar na lista mostra “Importado” verde se `dataImportacaoTextoDadosEscolares` não é `null` | 🟧 Alto     | Se data ausente → “Pendente” laranja                                 | `ct-indicador-verde` |
| **V-UI-002** | Modal apresenta blocos (Aluno, Ingresso, Escolaridade, Tabelas) apenas leitura                          | 🟧 Alto     | Campos não editáveis; se parser não enviou bloco → mensagem dedicada | `ct-modal-blocos` |
| **V-UI-003** | Reimportação atualiza timestamp e indicador imediatamente após POST /salvar                              | 🟧 Alto     | SWR `mutate`; caso falha → alerta e indicador permanece laranja       | `ct-reimportacao` |

---

## 2. CASOS DE TESTE

| ID         | Cenário                                                                                                  | Resultado Esperado |
|------------|-----------------------------------------------------------------------------------------------------------|--------------------|
| **CT-001** | Colagem completa com duas linhas na tabela de renovação                                                   | Parser retorna JSON, modal exibe dados e indicador fica verde após salvar |
| **CT-002** | Texto sem seção “Escolaridade”                                                                            | API bloqueia com erro específico, sem alterar estado do aluno |
| **CT-003** | Matrícula do texto diferente do aluno selecionado                                                         | Erro crítico; modal não abre |
| **CT-004** | Linha da tabela com campos vazios                                                                         | JSON contém `null` nos campos ausentes, sem quebrar processamento |
| **CT-005** | Usuário reimporta dados com nova linha de renovação                                                       | Novo histórico substitui o antigo e timestamp é atualizado |

---

## 3. REGRAS DE NEGÓCIO DETALHADAS

1. **Integridade por categoria:** dados pessoais e escolares são tratados de forma independente; erros em uma categoria não podem bloquear a outra.
2. **Reimportação destrutiva controlada:** ao confirmar nova colagem escolar, JSON anterior é substituído completamente, mas texto bruto antigo é mantido apenas no log/auditoria.
3. **Indicador binário:** dados escolares exibem apenas estado importado/pendente; não existe contagem de campos preenchidos.
4. **Histórico unificado:** tabela de renovação + dados de ingresso representam a linha do tempo completa; ausência de linhas implica em array vazio mas nunca `null`.
5. **Armazenamento fiel:** todo campo visível ao usuário na tela oficial deve existir no JSON ou no texto bruto, respeitando a instrução “guardar tudo que for da tela do aluno”.

---

## 4. REQUISITOS FUNCIONAIS

- RF1: Sistema precisa identificar automaticamente quando o texto corresponde à aba “Dados Escolares”.
- RF2: Usuário deve visualizar no modal um resumo legível com os blocos importados.
- RF3: API de salvamento deve armazenar JSON estruturado + texto bruto + timestamp.
- RF4: Lista de alunos deve mostrar o status de importação escolar de forma independente.
- RF5: Reimportações devem refletir imediatamente no frontend via SWR.

---

## 5. REQUISITOS NÃO-FUNCIONAIS

- RNF1: Parser deve concluir em < 500ms para textos com até 2 páginas.
- RNF2: Conjunto de testes unitários precisa cobrir 90% das ramificações do parser.
- RNF3: Logs devem registrar ID do aluno, hash do texto e resultado (sucesso/erro) para auditoria.
- RNF4: UI deve manter responsividade; indicador deve carregar sem causar layout shift.

---

## 6. CRITÉRIOS DE ACEITAÇÃO

1. Usuário consegue importar texto real (fornecido na coleta) e visualizar dados organizados no modal sem editar nada.
2. Após confirmar, `dadosEscolares` e `textoBrutoDadosEscolares` no banco refletem exatamente a importação.
3. Indicador “Importado” aparece em verde na lista imediatamente após o salvamento.
4. Reimportar atualiza o histórico inteiro e mantém apenas o último JSON.
5. Testes unitários e de integração descritos nos casos `CT-001` a `CT-005` passam com sucesso.

---

