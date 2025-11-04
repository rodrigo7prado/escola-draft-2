# ESPECIFICAÇÃO: [Nome da Funcionalidade]

<!--
INSTRUÇÕES DE USO:
1. Este é o CORAÇÃO da Metodologia CIF - O CHECKLIST EXECUTÁVEL
2. Substitua [Nome da Funcionalidade] pelo nome descritivo
3. Cada validação DEVE ter teste correspondente
4. Apenas marcar [x] quando teste passar
5. Organize em camadas lógicas (frontend → backend → banco)
6. Delete estas instruções antes de finalizar
-->

## STATUS GERAL

| Camada | Total de Validações | Implementadas | Coverage | Status |
|--------|---------------------|---------------|----------|--------|
| V1 - [Camada 1] | [X] | [Y] | [Z%] | [🟡 Em progresso] |
| V2 - [Camada 2] | [X] | [Y] | [Z%] | [🔴 Pendente] |
| V3 - [Camada 3] | [X] | [Y] | [Z%] | [🟢 Completo] |
| **TOTAL** | **[X]** | **[Y]** | **[Z%]** | **[Status]** |

**Legenda:**
- 🟢 Completo: Todas validações implementadas e testadas
- 🟡 Em progresso: Algumas validações faltando
- 🔴 Pendente: Não iniciado
- ❌ GAP CRÍTICO: Bloqueia produção
- ⚠️ GAP: Deve ser implementado (não crítico)

---

## CAMADA 1: [NOME DA CAMADA - ex: VALIDAÇÃO DE ARQUIVO (Frontend)]

**Responsabilidade:** [Descreva o que esta camada faz]

**Tecnologias:** [Ex: React, Papa Parse, Form Validation]

---

### V1.1: [GRUPO DE VALIDAÇÕES - ex: Estrutura de CSV]

**Objetivo:** [Descreva o que este grupo valida]

---

#### ✅ V1.1.1: [Descrição da validação]

- **Como validar:**
  ```
  [Descreva a lógica de validação]
  Exemplo: Parser retorna headers.length === 0
  ```

- **Teste correspondente:**
  ```
  tests/unit/[caminho]/[arquivo].test.ts
  ```

- **Comportamento esperado:**
  - **Input:** [Ex: CSV vazio]
  - **Output:** [Ex: Erro "CSV vazio ou inválido"]
  - **UI:** [Ex: Toast vermelho com mensagem]

- **Status:** ✅ Implementado e testado

---

#### ⬜ V1.1.2: [Descrição da validação]

- **Como validar:**
  ```
  [Descreva a lógica de validação]
  ```

- **Teste correspondente:**
  ```
  tests/unit/[caminho]/[arquivo].test.ts
  ```

- **Comportamento esperado:**
  - **Input:** [Dados de entrada]
  - **Output:** [Resultado esperado]
  - **Side effects:** [Ex: Log no console, atualização de estado]

- **Status:** ⬜ Pendente

---

#### ❌ V1.1.3: [Descrição da validação] **GAP CRÍTICO**

- **Como validar:**
  ```
  [Descreva a lógica de validação]
  ```

- **Teste correspondente:**
  ```
  tests/unit/[caminho]/[arquivo].test.ts
  ```

- **Comportamento esperado:**
  - **Input:** [Dados de entrada]
  - **Output:** [Resultado esperado]

- **Status:** ❌ **GAP CRÍTICO** - Não implementado
  - **Impacto:** [Ex: Risco de estado inconsistente no banco]
  - **Prioridade:** ALTA
  - **Estimativa:** [Ex: 2h]

---

#### ⚠️ V1.1.4: [Descrição da validação] **GAP**

- **Como validar:**
  ```
  [Descreva a lógica de validação]
  ```

- **Teste correspondente:**
  ```
  tests/unit/[caminho]/[arquivo].test.ts
  ```

- **Comportamento esperado:**
  - **Input:** [Dados de entrada]
  - **Output:** [Resultado esperado]

- **Status:** ⚠️ **GAP** - Deve ser implementado
  - **Impacto:** [Ex: UX não ideal, mas funcional]
  - **Prioridade:** MÉDIA
  - **Estimativa:** [Ex: 30min]

---

### V1.2: [PRÓXIMO GRUPO DE VALIDAÇÕES]

**Objetivo:** [Descreva o que este grupo valida]

---

#### ✅ V1.2.1: [Descrição]

[Mesmo formato acima]

---

## CAMADA 2: [NOME DA CAMADA - ex: PROCESSAMENTO DE PAYLOAD (Backend)]

**Responsabilidade:** [Descreva o que esta camada faz]

**Tecnologias:** [Ex: Next.js API Routes, Prisma]

---

### V2.1: [GRUPO DE VALIDAÇÕES]

[Seguir mesmo formato da Camada 1]

---

## CAMADA 3: [NOME DA CAMADA - ex: TRANSFORMAÇÃO DE DADOS]

**Responsabilidade:** [Descreva o que esta camada faz]

**Tecnologias:** [Ex: Funções utilitárias, parsers]

---

### V3.1: [GRUPO DE VALIDAÇÕES]

[Seguir mesmo formato]

---

## CAMADA 4: [NOME DA CAMADA - ex: OPERAÇÕES DE BANCO DE DADOS]

**Responsabilidade:** [Descreva o que esta camada faz]

**Tecnologias:** [Ex: Prisma, PostgreSQL]

---

### V4.1: [GRUPO DE VALIDAÇÕES]

[Seguir mesmo formato]

---

## RELATÓRIO DE GAPS

### ❌ GAPS CRÍTICOS (Bloqueiam Produção)

1. **V[X].[Y].[Z]: [Nome da validação]**
   - **Impacto:** [Descrição do problema se não for implementado]
   - **Prioridade:** ALTA
   - **Estimativa:** [Tempo]
   - **Responsável:** [Nome ou "A definir"]

2. **V[X].[Y].[Z]: [Nome da validação]**
   - [...]

### ⚠️ GAPS Não-Críticos (Deve ser implementado)

1. **V[X].[Y].[Z]: [Nome da validação]**
   - **Impacto:** [Descrição do problema se não for implementado]
   - **Prioridade:** MÉDIA/BAIXA
   - **Estimativa:** [Tempo]
   - **Responsável:** [Nome ou "A definir"]

---

## MAPA DE TESTES

### Arquivos de Teste

| Arquivo | Validações Cobertas | Status |
|---------|---------------------|--------|
| `tests/unit/[path]/[file].test.ts` | V1.1.1, V1.1.2 | ✅ Implementado |
| `tests/integration/[path]/[file].test.ts` | V2.1.1, V2.1.2, V2.1.3 | 🟡 Parcial |
| `tests/e2e/[path]/[file].spec.ts` | V1-V8 (fluxo completo) | 🔴 Pendente |

---

## CASOS EXTREMOS (EDGE CASES)

### Identificados e Testados

1. **[Nome do caso extremo]**
   - **Cenário:** [Descrição]
   - **Validação:** V[X].[Y].[Z]
   - **Teste:** [Caminho do teste]
   - **Status:** ✅ Testado

### Identificados mas NÃO Testados

1. **[Nome do caso extremo]**
   - **Cenário:** [Descrição]
   - **Risco:** [Ex: Baixo/Médio/Alto]
   - **Ação:** [Ex: Adicionar validação V3.7.5]
   - **Status:** ⚠️ Pendente

---

## REGRAS DE NEGÓCIO (CHECKLIST)

**Regras que NÃO PODEM ser violadas:**

- [ ] **[Regra 1]:** [Ex: Não permitir arquivo duplicado (mesmo hash)]
  - **Validações relacionadas:** V2.2.1, V2.2.2
  - **Status:** ✅ Testado

- [ ] **[Regra 2]:** [Ex: Aluno não pode ter múltiplas enturmações idênticas]
  - **Validações relacionadas:** V4.3.1, V4.3.2
  - **Status:** ⚠️ Pendente

- [ ] **[Regra 3]:** [Ex: Delete de CSV não pode apagar alunos editados manualmente]
  - **Validações relacionadas:** V6.1.1, V6.2.1
  - **Status:** ✅ Testado

---

## COMANDOS ÚTEIS

### Rodar testes desta funcionalidade

```bash
# Todos os testes
pnpm test [nome-da-funcionalidade]

# Apenas camada específica
pnpm test V1  # Frontend
pnpm test V2  # Backend
pnpm test V4  # Banco de dados

# Coverage
pnpm test:coverage [nome-da-funcionalidade]
```

### Marcar validação como completa

```bash
# 1. Implementar código
# 2. Escrever teste
# 3. Rodar teste
pnpm test [caminho-do-teste]

# 4. Se PASSAR ✅, marcar [x] neste checklist
# 5. Commit
git add .
git commit -m "feat: implement V[X].[Y].[Z] - [descrição]"
```

---

## PRÓXIMOS PASSOS

### Prioridade ALTA

1. [ ] Implementar gaps críticos (❌)
2. [ ] Completar testes de camadas prioritárias (V1, V2, V4)
3. [ ] Atingir coverage > 80% em código crítico

### Prioridade MÉDIA

1. [ ] Implementar gaps não-críticos (⚠️)
2. [ ] Adicionar testes E2E de fluxo completo
3. [ ] Documentar casos extremos adicionais

### Prioridade BAIXA

1. [ ] Refatorar testes duplicados
2. [ ] Melhorar mensagens de erro
3. [ ] Otimizar performance de testes

---

## REFERÊNCIAS

- **Documentação relacionada:**
  - [Conceito](./[NOME]_CONCEITO.md)
  - [Documentação Técnica](./[NOME]_TECNICO.md)
  - [Ciclo de Vida](./[NOME]_CICLO.md)

- **Guias:**
  - [Metodologia CIF](../METODOLOGIA_CIF.md)
  - [Guia de Fluxo de Trabalho](../METODOLOGIA_CIF_FLUXO.md)

---

**Data de criação:** [YYYY-MM-DD]
**Última atualização:** [YYYY-MM-DD]
**Autor:** [Nome]
**Revisado por:** [Nome(s)]

---

## EXEMPLO DE USO

### Adicionar Nova Validação

```markdown
#### ⬜ V3.7.1: CPF deve ter formato válido

- **Como validar:**
  ```
  Regex: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/
  E validar dígitos verificadores
  ```

- **Teste correspondente:**
  ```
  tests/unit/validations/cpf.test.ts
  ```

- **Comportamento esperado:**
  - **Input:** "123.456.789-10"
  - **Output:** true (válido)
  - **Input:** "123.456.789-00"
  - **Output:** false (dígito verificador inválido)

- **Status:** ⬜ Pendente
```

### Marcar como Completo

1. Implementar código de validação
2. Escrever teste
3. Rodar `pnpm test tests/unit/validations/cpf.test.ts`
4. Se PASSAR ✅:
   - Trocar `⬜` por `✅` no checkbox
   - Atualizar status para `✅ Implementado e testado`
   - Atualizar tabela de STATUS GERAL
   - Commit