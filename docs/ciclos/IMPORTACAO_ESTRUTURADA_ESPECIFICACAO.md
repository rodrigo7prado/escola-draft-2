# ESPECIFICAÇÃO: Importação Estruturada por Texto

**Status:** 🟡 Em Desenvolvimento
**Metodologia:** CIF (Ciclo de Integridade de Funcionalidade)
**Fase:** ESPECIFICAÇÃO
**Criado em:** 2025-01-09
**Última atualização:** 2025-01-09

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

### 1.1 Validações de Estrutura do Texto

| ID | Validação | Prioridade | Comportamento em Falha | Teste Correspondente |
|---|---|---|---|---|
| **V-EST-001** | Texto não pode estar vazio | 🔴 Crítico | Bloquear + erro: "Cole o texto antes de confirmar" | `test-validacao-texto-vazio` |
| **V-EST-002** | Texto deve ter pelo menos 3 linhas | 🔴 Crítico | Bloquear + erro: "Texto incompleto" | `test-validacao-texto-curto` |
| **V-EST-003** | Detectar se é Página 1 (contém "NOME COMPLETO:" ou "MATRÍCULA:") | 🔴 Crítico | Se não detectar tipo → erro: "Formato não reconhecido" | `test-deteccao-pagina-1` |
| **V-EST-004** | Detectar se é Página 2 (contém "COMPONENTE CURRICULAR" ou "NOTA" ou "FREQ") | 🔴 Crítico | Se não detectar tipo → erro: "Formato não reconhecido" | `test-deteccao-pagina-2` |
| **V-EST-005** | NÃO pode ser detectado como ambas as páginas | 🔴 Crítico | Erro: "Texto contém múltiplos formatos" | `test-deteccao-ambigua` |

### 1.2 Validações de Matrícula

| ID | Validação | Prioridade | Comportamento em Falha | Teste Correspondente |
|---|---|---|---|---|
| **V-MAT-001** | Matrícula deve ter 15 dígitos | 🔴 Crítico | Bloquear + erro: "Matrícula inválida (15 dígitos necessários)" | `test-matricula-15-digitos` |
| **V-MAT-002** | Matrícula deve conter apenas números | 🔴 Crítico | Bloquear + erro: "Matrícula deve conter apenas números" | `test-matricula-somente-numeros` |
| **V-MAT-003** | Matrícula DEVE existir no banco de dados | 🔴 Crítico | Bloquear + erro: "Matrícula XXX não encontrada. Cadastre o aluno primeiro." | `test-matricula-inexistente` |
| **V-MAT-004** | Buscar matrícula no texto (Página 1: campo "MATRÍCULA:") | 🔴 Crítico | Se não encontrar → erro: "Matrícula não encontrada no texto" | `test-parsing-matricula` |

### 1.3 Validações de Campos - Página 1 (Dados Pessoais)

| ID | Campo | Obrigatório | Validação | Comportamento em Falha | Teste Correspondente |
|---|---|---|---|---|---|
| **V-P1-001** | Nome Completo | ✅ Sim | Deve ter pelo menos 2 palavras | Avisar + permitir salvar com flag `dadosIncompletos=true` | `test-nome-completo` |
| **V-P1-002** | Matrícula | ✅ Sim | 15 dígitos numéricos | Bloquear (já validado em V-MAT-*) | `test-matricula-pagina1` |
| **V-P1-003** | Data de Nascimento | ✅ Sim | Formato DD/MM/YYYY válido | Avisar + permitir salvar com flag | `test-data-nascimento` |
| **V-P1-004** | Sexo | ✅ Sim | "M" ou "F" | **Perguntar via dialog se não vier ou se inválido** | `test-sexo-dialog` |
| **V-P1-005** | CPF | ⚠️ Opcional | Formato XXX.XXX.XXX-XX + dígitos verificadores | Avisar se inválido, mas permitir salvar | `test-cpf-validacao` |
| **V-P1-006** | RG | ⚠️ Opcional | Formato flexível (aceitar vários padrões) | Não validar formato, apenas armazenar | `test-rg-flexivel` |
| **V-P1-007** | Órgão Emissor | ⚠️ Opcional | Texto livre | Não validar | `test-orgao-emissor` |
| **V-P1-008** | Emissão RG | ⚠️ Opcional | Formato DD/MM/YYYY | Avisar se inválido, mas permitir salvar | `test-emissao-rg` |
| **V-P1-009** | Naturalidade | ⚠️ Opcional | Texto livre | Não validar | `test-naturalidade` |
| **V-P1-010** | Nacionalidade | ⚠️ Opcional | Texto livre | Não validar | `test-nacionalidade` |
| **V-P1-011** | Filiação | ⚠️ Opcional | Formato "NOME_MAE / NOME_PAI" | Separar em 2 campos; aceitar se vier só 1 nome | `test-filiacao-split` |

### 1.4 Validações de Sexo - Normalização

| ID | Validação | Entrada | Saída Esperada | Teste Correspondente |
|---|---|---|---|---|
| **V-SEX-001** | Normalizar "Masculino" | "Masculino" | "M" | `test-sexo-normalizar-masculino` |
| **V-SEX-002** | Normalizar "Feminino" | "Feminino" | "F" | `test-sexo-normalizar-feminino` |
| **V-SEX-003** | Normalizar "MASCULINO" | "MASCULINO" (maiúsculas) | "M" | `test-sexo-case-insensitive` |
| **V-SEX-004** | Normalizar "feminino" | "feminino" (minúsculas) | "F" | `test-sexo-case-insensitive-2` |
| **V-SEX-005** | Aceitar "M" direto | "M" | "M" | `test-sexo-m-direto` |
| **V-SEX-006** | Aceitar "F" direto | "F" | "F" | `test-sexo-f-direto` |
| **V-SEX-007** | Rejeitar valores inválidos | "X", "Outro", "" | **Abrir dialog para perguntar** | `test-sexo-invalido-dialog` |

### 1.5 Validações de Página 2 (Histórico Escolar)

| ID | Validação | Prioridade | Comportamento | Teste Correspondente |
|---|---|---|---|---|
| **V-P2-001** | Armazenar texto bruto completo | 🔴 Crítico | Campo `textoHistoricoOriginal` (TEXT) | `test-armazenar-pagina2` |
| **V-P2-002** | NÃO fazer parsing nesta versão | 🔴 Crítico | Apenas salvar texto bruto | `test-pagina2-sem-parsing` |
| **V-P2-003** | Confirmar recebimento ao usuário | 🟡 Médio | Dialog: "Página 2 recebida com sucesso" | `test-dialog-confirmacao-pagina2` |
| **V-P2-004** | Marcar check visual "Página 2 importada" | 🟡 Médio | UI mostra ✅ ao lado de "Página 2" | `test-check-visual-pagina2` |

### 1.6 Validações de Dados Originais vs Editáveis

**IMPORTANTE:** Campos atuais do banco = `dadosEditaveis`. Criar novos campos JSONB para `dadosOriginais`.

| ID | Validação | Prioridade | Comportamento | Teste Correspondente |
|---|---|---|---|---|
| **V-DAO-001** | Importação atualiza APENAS `dadosOriginais` (novo campo JSONB) | 🔴 Crítico | Campos normais do banco (dadosEditaveis) NÃO são alterados | `test-nao-alterar-editaveis` |
| **V-DAO-002** | Se `dadosOriginais` não existe → criar como JSONB vazio | 🔴 Crítico | Inicializar como `{}` (objeto vazio) | `test-criar-originais-vazio` |
| **V-DAO-003** | Merge visual: campos normais sobrepõem `dadosOriginais` | 🔴 Crítico | UI mostra valor do campo normal se existir, senão mostra `dadosOriginais` | `test-merge-visual` |
| **V-DAO-004** | Badge/ícone quando campo foi editado manualmente | 🟡 Médio | Mostrar ✏️ ao lado do campo se campo normal ≠ dadosOriginais | `test-badge-campo-editado` |
| **V-DAO-005** | Tooltip mostra valor original vs editado | 🟡 Médio | Hover revela: "Original: X / Editado: Y" | `test-tooltip-comparacao` |
| **V-DAO-006** | Resumo em nível de aluno: quantos campos editados | 🟡 Médio | Ex: "3 campos editados manualmente" | `test-resumo-campos-editados` |

### 1.7 Validações de UI - Modo Colagem

**CORREÇÃO IMPORTANTE:** Botão/toggle "Modo Colagem" aparece APENAS no aluno ativo, NÃO em todos os itens da lista.

| ID | Validação | Prioridade | Comportamento | Teste Correspondente |
|---|---|---|---|---|
| **V-UI-001** | Toggle "Modo Colagem" visível APENAS quando aluno está ativo | 🔴 Crítico | Se nenhum aluno selecionado → toggle NÃO existe | `test-toggle-aluno-ativo` |
| **V-UI-002** | Ao ativar toggle → área de colagem (textarea) aparece | 🔴 Crítico | Textarea visível com placeholder | `test-area-colagem-aparece` |
| **V-UI-003** | Ao desativar toggle → área de colagem desaparece | 🟡 Médio | Textarea oculta (sem perder texto se não salvo) | `test-area-colagem-desaparece` |
| **V-UI-004** | Check visual "Página 1 importada" (✅ ou ❌) | 🟡 Médio | Mostrar status atual do aluno | `test-check-pagina1` |
| **V-UI-005** | Check visual "Página 2 importada" (✅ ou ❌) | 🟡 Médio | Mostrar status atual do aluno | `test-check-pagina2` |

### 1.8 Validações de Dialogs

| ID | Dialog | Quando Aparece | Opções | Comportamento | Teste Correspondente |
|---|---|---|---|---|---|
| **V-DLG-001** | Confirmar Sexo | Se campo "SEXO:" não vier ou vier inválido | "M" / "F" / "Cancelar" | Se cancelar → não salvar | `test-dialog-sexo` |
| **V-DLG-002** | Resumo de Página 1 | Após parsing bem-sucedido | Mostrar 12 campos + "Confirmar" / "Cancelar" | Se confirmar → salvar no DB | `test-dialog-resumo-pagina1` |
| **V-DLG-003** | Confirmação Página 2 | Após detectar Página 2 | "Página 2 recebida" + "OK" | Fechar dialog → marcar check | `test-dialog-confirmacao-pagina2` |
| **V-DLG-004** | Erro de Matrícula | Matrícula não existe no DB | "Matrícula XXX não encontrada" + "OK" | Bloquear operação | `test-dialog-erro-matricula` |

---

## 2. CASOS DE TESTE

### 2.1 Testes de Parsing - Página 1

#### **Teste: `test-parsing-completo-pagina1`**
**Descrição:** Parsear texto completo de Página 1 com todos os 12 campos

**Input (texto colado):**
```
NOME COMPLETO: JOÃO SILVA SANTOS
MATRÍCULA: 123456789012345
DATA DE NASCIMENTO: 01/01/2005
SEXO: M
CPF: 123.456.789-00
RG: 12.345.678-9
ÓRGÃO EMISSOR: DETRAN
EMISSÃO: 15/03/2020
NATURALIDADE: Rio de Janeiro
NACIONALIDADE: Brasileira
FILIAÇÃO: MARIA SILVA / JOSÉ SANTOS
```

**Output esperado (salvo em `dadosOriginais` JSONB):**
```json
{
  "nomeCompleto": "JOÃO SILVA SANTOS",
  "matricula": "123456789012345",
  "dataNascimento": "2005-01-01",
  "sexo": "M",
  "cpf": "12345678900",
  "rg": "12.345.678-9",
  "orgaoEmissor": "DETRAN",
  "dataEmissaoRG": "2020-03-15",
  "naturalidade": "Rio de Janeiro",
  "nacionalidade": "Brasileira",
  "nomeMae": "MARIA SILVA",
  "nomePai": "JOSÉ SANTOS"
}
```

**Validações:**
- ✅ V-P1-001 a V-P1-011 todas passam
- ✅ Nenhum dialog de sexo (veio no texto)
- ✅ Dialog de resumo aparece
- ✅ Após confirmação → salva em `dadosOriginais` (JSONB)
- ✅ Campos normais do banco (dadosEditaveis) NÃO são alterados

---

#### **Teste: `test-parsing-sem-sexo`**
**Descrição:** Texto não contém campo "SEXO:" → deve abrir dialog

**Input:**
```
NOME COMPLETO: MARIA SOUZA
MATRÍCULA: 987654321098765
DATA DE NASCIMENTO: 15/05/2004
CPF: 987.654.321-00
```

**Comportamento esperado:**
1. Sistema detecta Página 1
2. Tenta parsear campo "SEXO:" → não encontra
3. **Abre Dialog:** "Informe o sexo do aluno: M / F"
4. Usuário seleciona "F"
5. Prossegue para dialog de resumo
6. Salva com `sexo: "F"` em `dadosOriginais`

**Validações:**
- ✅ V-P1-004 (sexo obrigatório)
- ✅ V-DLG-001 (dialog de sexo aparece)

---

#### **Teste: `test-normalizacao-sexo-masculino`**
**Descrição:** Normalizar "Masculino" → "M"

**Input:**
```
SEXO: Masculino
```

**Output esperado:**
```json
{ "sexo": "M" }
```

**Validações:**
- ✅ V-SEX-001

---

#### **Teste: `test-normalizacao-sexo-feminino`**
**Descrição:** Normalizar "Feminino" → "F"

**Input:**
```
SEXO: Feminino
```

**Output esperado:**
```json
{ "sexo": "F" }
```

**Validações:**
- ✅ V-SEX-002

---

#### **Teste: `test-filiacao-split`**
**Descrição:** Separar filiação em nome da mãe e nome do pai

**Input:**
```
FILIAÇÃO: MARIA SILVA / JOSÉ SANTOS
```

**Output esperado:**
```json
{
  "nomeMae": "MARIA SILVA",
  "nomePai": "JOSÉ SANTOS"
}
```

**Input alternativo (só mãe):**
```
FILIAÇÃO: MARIA SILVA
```

**Output esperado:**
```json
{
  "nomeMae": "MARIA SILVA",
  "nomePai": null
}
```

**Validações:**
- ✅ V-P1-011

---

### 2.2 Testes de Detecção de Tipo de Página

#### **Teste: `test-deteccao-pagina-1`**
**Input:**
```
NOME COMPLETO: TESTE
MATRÍCULA: 123456789012345
```

**Output esperado:**
- Tipo detectado: "Página 1"
- Prosseguir para parsing

**Validações:**
- ✅ V-EST-003

---

#### **Teste: `test-deteccao-pagina-2`**
**Input:**
```
COMPONENTE CURRICULAR          CH    NOTA  FREQ  RESULTADO
LÍNGUA PORTUGUESA              160   7.5   85%   APROVADO
MATEMÁTICA                     160   6.0   90%   APROVADO
```

**Output esperado:**
- Tipo detectado: "Página 2"
- Armazenar texto bruto
- Mostrar dialog: "Página 2 recebida com sucesso"

**Validações:**
- ✅ V-EST-004
- ✅ V-P2-001 a V-P2-004

---

#### **Teste: `test-deteccao-ambigua`**
**Input (contém marcadores de ambas):**
```
NOME COMPLETO: TESTE
COMPONENTE CURRICULAR          CH    NOTA
```

**Output esperado:**
- Erro: "Texto contém múltiplos formatos. Cole apenas uma página por vez."

**Validações:**
- ✅ V-EST-005

---

### 2.3 Testes de Matrícula

#### **Teste: `test-matricula-inexistente`**
**Pré-condição:** Matrícula 999999999999999 NÃO existe no banco

**Input:**
```
MATRÍCULA: 999999999999999
NOME COMPLETO: TESTE
```

**Output esperado:**
- Dialog de erro: "Matrícula 999999999999999 não encontrada. Cadastre o aluno primeiro."
- Operação bloqueada

**Validações:**
- ✅ V-MAT-003

---

### 2.4 Testes de Dados Originais vs Editáveis

#### **Teste: `test-nao-alterar-editaveis`**
**Pré-condição:**
- Aluno já tem `nome = "JOÃO DA SILVA"` (campo normal do banco = editado manualmente)
- `dadosOriginais.nomeCompleto = "JOÃO SILVA"`

**Input (colagem):**
```
NOME COMPLETO: JOÃO SILVA SANTOS
MATRÍCULA: 123456789012345
```

**Comportamento esperado:**
1. Sistema atualiza `dadosOriginais.nomeCompleto = "JOÃO SILVA SANTOS"`
2. Campo `nome` do banco continua "JOÃO DA SILVA" (NÃO alterado)
3. UI mostra "JOÃO DA SILVA" (campo normal sobrepõe dadosOriginais)
4. Badge ✏️ aparece ao lado do campo

**Validações:**
- ✅ V-DAO-001 (não alterar campos normais)
- ✅ V-DAO-003 (merge visual)
- ✅ V-DAO-004 (badge de edição)

---

#### **Teste: `test-merge-visual`**
**Cenário:** Visualizar dados mesclados na UI

**Pré-condição:**
```json
{
  "dadosOriginais": {
    "nomeCompleto": "JOÃO SILVA SANTOS",
    "cpf": "12345678900"
  }
}
```
**Campos normais do banco:**
- `nome = null`
- `cpf = "98765432100"` (editado manualmente)

**Output esperado na UI:**
```
Nome Completo: JOÃO SILVA SANTOS (vem de dadosOriginais, pois campo normal é null)
CPF: 987.654.321-00 ✏️ (vem do campo normal, sobrepõe dadosOriginais)
   (tooltip: "Original: 123.456.789-00 / Editado: 987.654.321-00")
```

**Validações:**
- ✅ V-DAO-003
- ✅ V-DAO-005 (tooltip)

---

### 2.5 Testes de UI

#### **Teste: `test-toggle-aluno-ativo`**
**Cenário:** Toggle "Modo Colagem" só aparece no aluno ativo

**Passos:**
1. Usuário acessa "Gestão de Alunos"
2. Nenhum aluno selecionado → toggle **NÃO EXISTE**
3. Usuário clica em um aluno (aluno fica ativo) → toggle **APARECE no item ativo**
4. Usuário clica em outro aluno → toggle **MOVE para o novo aluno ativo**

**Validações:**
- ✅ V-UI-001

---

#### **Teste: `test-area-colagem-aparece`**
**Cenário:** Ao ativar toggle, área de colagem aparece

**Passos:**
1. Aluno ativo (toggle visível)
2. Usuário clica em toggle "Modo Colagem" (OFF → ON)
3. Textarea aparece com placeholder: "Cole aqui o texto da Página 1 ou 2"

**Validações:**
- ✅ V-UI-002

---

## 3. REGRAS DE NEGÓCIO DETALHADAS

### 3.1 RN-001: Matrícula Obrigatória e Existente
**Descrição:** O sistema NÃO cria novos alunos via Importação Estruturada. Apenas atualiza dados de alunos já cadastrados.

**Implementação:**
1. Parsear matrícula do texto
2. Buscar no banco: `SELECT id FROM Aluno WHERE matricula = ?`
3. Se NÃO encontrar → erro e bloquear
4. Se encontrar → prosseguir

**Exceção:** Nenhuma. Sempre bloquear se matrícula não existir.

---

### 3.2 RN-002: Sexo Obrigatório
**Descrição:** Campo "sexo" é obrigatório para salvar no banco. Se não vier no texto ou vier inválido, perguntar ao usuário.

**Implementação:**
1. Tentar parsear campo "SEXO:"
2. Se encontrar e for válido (M/F/Masculino/Feminino) → normalizar
3. Se NÃO encontrar ou for inválido → abrir dialog
4. Dialog oferece: "M" / "F" / "Cancelar"
5. Se usuário cancelar → não salvar nada

---

### 3.3 RN-003: Dados Originais vs Editáveis
**Descrição:** Importação Estruturada atualiza APENAS `dadosOriginais` (novo campo JSONB). Campos normais do banco = `dadosEditaveis` e têm prioridade na visualização.

**Fluxo:**
```
[Importação Estruturada]
   ↓
   Atualiza dadosOriginais (JSONB)
   ↓
   NÃO toca em campos normais do banco
   ↓
[UI - Visualização]
   ↓
   Se campo normal existe e não é null → mostrar esse
   Senão → mostrar dadosOriginais[campo]
   ↓
   Se diferente → badge ✏️ + tooltip
```

**Exemplo:**
- Importação traz: `nomeCompleto = "JOÃO SILVA"`
- Salvo em: `dadosOriginais.nomeCompleto = "JOÃO SILVA"` (JSONB)
- Campo `nome` do banco = `null`
- UI mostra: "JOÃO SILVA" (vem de dadosOriginais)
- Usuário edita manualmente → `nome = "JOÃO DA SILVA"` (campo normal)
- UI agora mostra: "JOÃO DA SILVA ✏️" (campo normal sobrepõe)
- Nova importação traz: `nomeCompleto = "JOÃO SILVA SANTOS"`
- Salvo em: `dadosOriginais.nomeCompleto = "JOÃO SILVA SANTOS"`
- Campo `nome` continua: `"JOÃO DA SILVA"`
- UI continua mostrando: "JOÃO DA SILVA ✏️" (campo normal sobrepõe)

---

### 3.4 RN-004: Página 2 - Armazenamento Sem Parsing
**Descrição:** Página 2 (histórico escolar) é armazenada como texto bruto. Parsing será implementado em versão futura.

**Implementação:**
1. Detectar tipo de página
2. Se Página 2:
   - Armazenar em `textoHistoricoOriginal` (campo TEXT)
   - NÃO criar registros em outras tabelas
   - Marcar flag: `pagina2Importada = true`
   - Mostrar dialog: "Página 2 recebida com sucesso"
3. Funcionalidade futura: botão "Converter Página 2 em Dados"

---

### 3.5 RN-005: Detecção Automática de Tipo de Página
**Descrição:** Sistema detecta automaticamente se texto é Página 1 ou Página 2 sem usuário precisar informar.

**Critérios:**
| Tipo | Marcadores (pelo menos 1 deve existir) |
|------|----------------------------------------|
| **Página 1** | "NOME COMPLETO:", "MATRÍCULA:", "DATA DE NASCIMENTO:" |
| **Página 2** | "COMPONENTE CURRICULAR", "NOTA", "FREQ", "RESULTADO" |

**Ambiguidade:**
- Se detectar marcadores de AMBAS → erro: "Cole apenas uma página por vez"

---

## 4. REQUISITOS FUNCIONAIS

### 4.1 RF-001: Interface de Colagem
**Descrição:** Usuário deve poder colar texto estruturado em uma área dedicada.

**Critérios de Aceitação:**
- [ ] Toggle "Modo Colagem" visível APENAS no aluno ativo (NÃO em todos os itens)
- [ ] Ao ativar toggle → textarea aparece no aluno ativo
- [ ] Textarea aceita texto multi-linha
- [ ] Placeholder: "Cole aqui o texto da Página 1 ou 2"
- [ ] Botão "Importar" visível abaixo da textarea

**Relacionado a:** V-UI-001, V-UI-002

---

### 4.2 RF-002: Detecção Automática de Tipo
**Descrição:** Sistema deve detectar se texto é Página 1 ou Página 2.

**Critérios de Aceitação:**
- [ ] Detectar Página 1 corretamente (V-EST-003)
- [ ] Detectar Página 2 corretamente (V-EST-004)
- [ ] Rejeitar textos ambíguos (V-EST-005)
- [ ] Feedback visual: "Página 1 detectada" ou "Página 2 detectada"

**Relacionado a:** V-EST-003, V-EST-004, V-EST-005

---

### 4.3 RF-003: Parsing de Página 1
**Descrição:** Extrair 12 campos de dados pessoais de texto estruturado.

**Critérios de Aceitação:**
- [ ] Parsear todos os 12 campos (V-P1-001 a V-P1-011)
- [ ] Normalizar sexo (V-SEX-001 a V-SEX-007)
- [ ] Separar filiação em mãe/pai (V-P1-011)
- [ ] Validar formatos de data (DD/MM/YYYY)
- [ ] Validar CPF (opcional, mas avisar se inválido)

**Relacionado a:** V-P1-001 a V-P1-011, V-SEX-001 a V-SEX-007

---

### 4.4 RF-004: Dialog de Confirmação de Sexo
**Descrição:** Se sexo não vier no texto ou vier inválido, perguntar ao usuário.

**Critérios de Aceitação:**
- [ ] Dialog aparece quando necessário (V-DLG-001)
- [ ] Opções: "M" / "F" / "Cancelar"
- [ ] Se cancelar → operação abortada
- [ ] Se confirmar → valor salvo e prossegue

**Relacionado a:** V-DLG-001, RN-002

---

### 4.5 RF-005: Dialog de Resumo - Página 1
**Descrição:** Antes de salvar, mostrar resumo dos 12 campos parseados.

**Critérios de Aceitação:**
- [ ] Dialog mostra todos os campos extraídos
- [ ] Usuário pode revisar antes de confirmar
- [ ] Opções: "Confirmar" / "Cancelar"
- [ ] Se confirmar → salvar em `dadosOriginais` (JSONB)

**Relacionado a:** V-DLG-002

---

### 4.6 RF-006: Armazenamento de Página 2
**Descrição:** Armazenar texto bruto de Página 2 sem parsing.

**Critérios de Aceitação:**
- [ ] Campo `textoHistoricoOriginal` criado no banco (TEXT)
- [ ] Texto salvo integralmente (sem alterações)
- [ ] Flag `pagina2Importada = true` marcado
- [ ] Dialog: "Página 2 recebida com sucesso"

**Relacionado a:** V-P2-001 a V-P2-004, RN-004

---

### 4.7 RF-007: Atualização de Dados Originais
**Descrição:** Importação atualiza `dadosOriginais` (JSONB), NÃO os campos normais do banco.

**Critérios de Aceitação:**
- [ ] Criar campo JSONB `dadosOriginais` no banco (se não existir)
- [ ] Campos salvos em `dadosOriginais`
- [ ] Campos normais do banco NÃO são alterados
- [ ] Timestamp de importação registrado
- [ ] Auditoria criada (opcional)

**Relacionado a:** V-DAO-001, RN-003

---

### 4.8 RF-008: Merge Visual
**Descrição:** UI mostra merge de `dadosOriginais` e campos normais (dadosEditaveis).

**Critérios de Aceitação:**
- [ ] Se campo normal existe e não é null → mostrar esse
- [ ] Senão → mostrar `dadosOriginais[campo]`
- [ ] Badge ✏️ quando campo normal ≠ dadosOriginais
- [ ] Tooltip com comparação (original vs editado)
- [ ] Resumo: "X campos editados manualmente"

**Relacionado a:** V-DAO-003 a V-DAO-006, RN-003

---

### 4.9 RF-009: Checks Visuais de Status
**Descrição:** Mostrar se Página 1 e Página 2 já foram importadas.

**Critérios de Aceitação:**
- [ ] Check "Página 1 importada" (✅ ou ❌)
- [ ] Check "Página 2 importada" (✅ ou ❌)
- [ ] Atualização automática após importação

**Relacionado a:** V-UI-004, V-UI-005

---

## 5. REQUISITOS NÃO-FUNCIONAIS

### 5.1 RNF-001: Performance
**Descrição:** Parsing e salvamento devem ser rápidos.

**Critérios:**
- Parsing de Página 1: < 100ms
- Salvamento no banco: < 200ms
- Resposta total (cola → confirmação): < 500ms

**Como medir:**
- Console.time() no parsing
- Log de tempo de query SQL

---

### 5.2 RNF-002: Usabilidade
**Descrição:** Interface deve ser intuitiva e não exigir treinamento.

**Critérios:**
- Usuário consegue importar sem ler manual
- Feedback visual claro (checks, badges)
- Erros em linguagem não-técnica
- Placeholders e labels descritivos

**Como validar:**
- Teste com usuário real (secretaria)

---

### 5.3 RNF-003: Rastreabilidade
**Descrição:** Toda importação deve ser auditável.

**Critérios:**
- Timestamp de importação salvo
- Texto original preservado em `dadosOriginais` (JSONB)
- Registro de auditoria criado (opcional)

**Como validar:**
- Verificar banco de dados após importação

---

### 5.4 RNF-004: Extensibilidade
**Descrição:** Arquitetura deve permitir adicionar novos tipos de página facilmente.

**Critérios:**
- Parser modular (fácil adicionar Página 3, 4, etc)
- Detecção de tipo configurável (regex ou keywords)

**Como validar:**
- Code review da arquitetura

---

## 6. CRITÉRIOS DE ACEITAÇÃO

### 6.1 Critérios Gerais
- [ ] Todas as validações críticas (🔴) implementadas
- [ ] Todos os testes de casos de uso passando
- [ ] UI responsiva e sem bugs visuais
- [ ] Performance dentro dos limites (RNF-001)
- [ ] Teste com usuário real bem-sucedido

### 6.2 Critérios de Página 1
- [ ] 100% dos campos parseados corretamente
- [ ] Dialog de sexo funcional
- [ ] Dialog de resumo funcional
- [ ] Dados salvos em `dadosOriginais` (JSONB)
- [ ] Merge visual funcionando

### 6.3 Critérios de Página 2
- [ ] Texto bruto armazenado integralmente
- [ ] Confirmação visual ao usuário
- [ ] Check "Página 2 importada" atualizado

### 6.4 Critérios de Validação
- [ ] Matrícula inexistente bloqueada
- [ ] Sexo obrigatório validado
- [ ] Datas validadas (formato)
- [ ] CPF validado (opcional)

### 6.5 Critérios de UX
- [ ] Toggle "Modo Colagem" funcionando (apenas no aluno ativo)
- [ ] Área de colagem aparece/desaparece
- [ ] Checks visuais (Página 1/2) funcionando
- [ ] Badges ✏️ em campos editados
- [ ] Tooltips com comparação original vs editado

---

## 7. MATRIZ DE RASTREABILIDADE

| Requisito Funcional | Regra de Negócio | Validações | Testes |
|---------------------|------------------|------------|--------|
| RF-001 (Interface) | - | V-UI-001, V-UI-002 | test-toggle-aluno-ativo, test-area-colagem-aparece |
| RF-002 (Detecção) | RN-005 | V-EST-003, V-EST-004, V-EST-005 | test-deteccao-pagina-1, test-deteccao-pagina-2 |
| RF-003 (Parsing P1) | - | V-P1-001 a V-P1-011, V-SEX-001 a V-SEX-007 | test-parsing-completo-pagina1, test-filiacao-split |
| RF-004 (Dialog Sexo) | RN-002 | V-DLG-001 | test-dialog-sexo |
| RF-005 (Dialog Resumo) | - | V-DLG-002 | test-dialog-resumo-pagina1 |
| RF-006 (Armazenar P2) | RN-004 | V-P2-001 a V-P2-004 | test-armazenar-pagina2 |
| RF-007 (Dados Originais) | RN-003 | V-DAO-001 | test-nao-alterar-editaveis |
| RF-008 (Merge Visual) | RN-003 | V-DAO-003 a V-DAO-006 | test-merge-visual |
| RF-009 (Checks) | - | V-UI-004, V-UI-005 | test-check-pagina1, test-check-pagina2 |

---

**📌 CHECKPOINT:** Documento ESPECIFICAÇÃO completo e corrigido.

**Status:** ✅ Pronto para revisão
**Próximo documento:** [IMPORTACAO_ESTRUTURADA_TECNICO.md](./IMPORTACAO_ESTRUTURADA_TECNICO.md)
