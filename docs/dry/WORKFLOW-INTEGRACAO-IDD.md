# Integração DRY com Workflow IDD

Este documento explica como integrar os componentes DRY com a metodologia IDD (Incremental Documentation Development) durante o desenvolvimento de features.

## Visão Geral

Durante a implementação de uma feature usando IDD, você deve:
1. **Consultar componentes DRY existentes** antes de criar código novo
2. **Documentar componentes DRY usados** no arquivo CHECKPOINT da feature
3. **Criar novos componentes DRY** quando padrões se repetem
4. **Atualizar documentação DRY** ao final de cada sessão

---

## Workflow: Início de Sessão

### Passo 1: Consultar Componentes DRY Disponíveis

Antes de iniciar qualquer checkpoint, consulte os componentes DRY:

```bash
# Buscar componentes relacionados ao que você vai implementar
pnpm search:dry <termo-relacionado>

# Consultar índice completo
cat docs/dry/summary.md
```

**Exemplo:**
```bash
# Vou implementar um filtro dropdown
pnpm search:dry filtro

# Vou implementar um modal
pnpm search:dry modal
```

### Passo 2: Ler Guidelines de Decisão

Consulte [GUIDELINES.md](./GUIDELINES.md) para decidir:
- Usar componente DRY existente?
- Estender com props?
- Criar novo componente DRY?
- Criar código específico?

### Passo 3: Documentar no CHECKPOINT

No início de cada sessão, liste os componentes DRY que planeja usar:

```markdown
## Componentes DRY Usados
- [DRY.UI:OVERFLOW_MENU] - Menu de ações do aluno (editar, deletar)
- [DRY.OBJECT:PHASES] - Sistema de fases para validação de completude
- [DRY.BACKEND:IMPORT_PROFILE] - Importação de dados do perfil
```

---

## Workflow: Durante a Implementação

### Ao Implementar um Checkpoint

1. **Verificar se há componente DRY aplicável**
   - Consultar lista de "Componentes DRY Usados" da sessão
   - Buscar no summary.md se esqueceu de listar algum

2. **Seguir hierarquia de reutilização** (do CLAUDE.md):
   ```
   1º: Usar componente genérico existente (ui/)
   2º: Estender componente genérico com props
   3º: Criar novo componente genérico (se reutilizável)
   4º: Criar componente personalizado (se lógica específica)
   5º: Código inline (EVITAR - apenas casos únicos)
   ```

3. **Documentar no checkpoint a decisão técnica**
   ```markdown
   [x] CP3: Implementar menu de ações do aluno
     [x] T3.1: Usar [DRY.UI:OVERFLOW_MENU] para menu kebab
     [x] T3.2: Props customizadas: items=[editar, deletar, histórico]
   ```

### Quando Criar Novo Componente DRY

Se identificar que precisa criar um novo componente DRY:

1. **Verificar Regra dos 2 Usos**
   - É o 2º uso desse padrão? → Criar DRY
   - É o 1º uso? → Código específico (documentar para futuro)

2. **Usar template apropriado**
   ```bash
   # Copiar template
   cp docs/dry/templates/ui-component.md docs/dry/ui/meu-componente.md
   ```

3. **Documentar no checkpoint**
   ```markdown
   [x] CP5: Criar componente de filtro dropdown
     [x] T5.1: 2º uso de filtro dropdown (1º: filtro turmas)
     [x] T5.2: Criar [DRY.UI:FILTRO_DROPDOWN] genérico
     [x] T5.3: Documentado em docs/dry/ui/ui-components.dry.md
     [x] T5.4: Refatorar filtro turmas para usar novo componente
   ```

4. **Adicionar à seção "Componentes DRY Usados"**
   ```markdown
   ## Componentes DRY Usados
   - [DRY.UI:FILTRO_DROPDOWN] - Criado nesta sessão (2º uso)
   ```

---

## Workflow: Final de Sessão

### Checklist de Encerramento

Ao finalizar uma sessão IDD:

- [ ] **Atualizar seção "Componentes DRY Usados"**
  - Adicionar componentes criados nesta sessão
  - Remover componentes que não foram usados
  - Atualizar descrições se necessário

- [ ] **Se criou novos componentes DRY:**
  - [ ] Documentado no arquivo apropriado (ui/ui-components.dry.md, etc)
  - [ ] Seguiu template de docs/dry/templates/
  - [ ] Executou `pnpm summary:dry` para atualizar índice
  - [ ] Adicionou testes unitários
  - [ ] Incluiu referências cruzadas

- [ ] **Se identificou padrões que poderiam virar DRY:**
  - [ ] Documentar no checkpoint para futuras sessões
  - [ ] Exemplo: "TEC: Padrão X usado 1x, considerar DRY se repetir"

- [ ] **Atualizar arquivo TECNICO.md da feature**
  - Incluir motivação de uso/criação de componentes DRY
  - Explicar trade-offs (por que DRY vs específico)

---

## Exemplos Práticos

### Exemplo 1: Usando Componente DRY Existente

**Contexto:** Implementando menu de ações na listagem de alunos

**CHECKPOINT.md:**
```markdown
Sessão 3 - Feature: Gestão de Alunos

## Componentes DRY Usados
- [DRY.UI:OVERFLOW_MENU] - Menu de ações (editar, deletar, histórico)
- [DRY.CONCEPT:ITEM_ALUNO] - Estrutura de item de aluno na lista

## Checkpoints
[x] CP1: Adicionar menu de ações em cada item de aluno
  [x] T1.1: Usar [DRY.UI:OVERFLOW_MENU] com items customizados
  [x] T1.2: Ações: editar, deletar, ver histórico
```

**TECNICO.md:**
```markdown
T1. Uso de DRY.UI:OVERFLOW_MENU
  T1.1: Componente genérico atendeu perfeitamente
  T1.2: Props: items={[editar, deletar, histórico]}, onSelect={handleAction}
  T1.3: Mantém consistência visual com outros menus do sistema
```

---

### Exemplo 2: Criando Novo Componente DRY

**Contexto:** 2º uso de modal de confirmação (1º foi em deletar turma)

**CHECKPOINT.md:**
```markdown
Sessão 5 - Feature: Gestão de Alunos

## Componentes DRY Usados
- [DRY.UI:MODAL_CONFIRMACAO] - Criado nesta sessão (2º uso)

## Checkpoints
[x] CP3: Implementar confirmação de exclusão de aluno
  [x] T3.1: 2º uso de modal de confirmação (1º: deletar turma)
  [x] T3.2: Criar [DRY.UI:MODAL_CONFIRMACAO] genérico
  [x] T3.3: Props: title, message, confirmText, onConfirm, variant
  [x] T3.4: Documentado em docs/dry/ui/ui-components.dry.md
  [x] T3.5: Refatorar modal de deletar turma para usar componente
  [x] T3.6: Executado pnpm summary:dry
```

**TECNICO.md:**
```markdown
T3. Criação de DRY.UI:MODAL_CONFIRMACAO
  T3.1: Padrão identificado: modal com título, mensagem, botões confirm/cancel
  T3.2: 2º uso justificou criação (1º uso: deletar turma)
  T3.3: Design genérico com variants: 'danger' | 'warning' | 'info'
  T3.4: Refatoração do 1º uso economizou ~30 linhas de código
  T3.5: Futuro: todos os modais de confirmação usarão este componente
```

---

### Exemplo 3: Código Específico (Não DRY)

**Contexto:** Validação de matrícula específica do sistema

**CHECKPOINT.md:**
```markdown
Sessão 2 - Feature: Importação de Alunos

## Componentes DRY Usados
- [DRY.BACKEND:IMPORT_PROFILE] - Parser genérico de dados
- Nenhum componente DRY para validação (lógica específica)

## Checkpoints
[x] CP4: Validar formato de matrícula
  [x] T4.1: Lógica específica do sistema (ano + sequencial + dígito)
  [x] T4.2: Não generalizar (regras de negócio específicas)
  [x] T4.3: Implementar função validateMatricula() no módulo
```

**TECNICO.md:**
```markdown
T4. Validação de matrícula (código específico)
  T4.1: Regras específicas do sistema: AAAA-SSSSS-D
  T4.2: Não justifica criar DRY.BACKEND:VALIDADOR_MATRICULA
  T4.3: Lógica acoplada ao domínio (ano letivo, sequencial, dígito verificador)
  T4.4: Trade-off: duplicação é melhor que generalização forçada
```

---

## Padrões de Nomenclatura em CHECKPOINTs

### Referenciando Componentes DRY

Use colchetes para referenciar IDs DRY:

```markdown
✅ CORRETO:
[x] T2.1: Usar [DRY.UI:OVERFLOW_MENU] para menu de ações
[x] T3.2: Aplicar [DRY.OBJECT:PHASES] para validação

❌ INCORRETO:
[x] T2.1: Usar componente OverflowMenu
[x] T3.2: Usar objeto PHASES
```

### Documentando Criação de DRY

Quando criar novo componente DRY:

```markdown
[x] CP5: Criar filtro de dropdown genérico
  [x] T5.1: Identificado padrão (2º uso)
  [x] T5.2: Criar [DRY.UI:FILTRO_DROPDOWN]
  [x] T5.3: Documentar em docs/dry/ui/ui-components.dry.md
  [x] T5.4: Atualizar summary: pnpm summary:dry
  [x] T5.5: Refatorar 1º uso (filtro turmas)
```

### Documentando Decisão de NÃO Usar DRY

Quando decidir criar código específico:

```markdown
[x] CP7: Implementar cálculo de média escolar
  [x] T7.1: Lógica específica (regras do sistema de notas)
  [x] T7.2: Não criar DRY (1º uso, regras de domínio)
  [x] T7.3: Documentar: considerar DRY se repetir em outras features
```

---

## Integração com Ferramentas DRY

### Durante o desenvolvimento:

```bash
# 1. Buscar componentes antes de implementar
pnpm search:dry <termo>

# 2. Consultar índice completo
cat docs/dry/summary.md

# 3. Ler guidelines de decisão
cat docs/dry/GUIDELINES.md

# 4. Ao criar novo DRY, atualizar índice
pnpm summary:dry

# 5. Validar documentação DRY
pnpm validate:dry

# 6. Detectar duplicações candidatas a DRY
pnpm dry:dup
```

---

## Referências

- **Guidelines de decisão:** [GUIDELINES.md](./GUIDELINES.md)
- **Templates de componentes:** [templates/](./templates/)
- **Metodologia IDD:** [docs/IDD.md](../IDD.md)
- **Sumário de componentes DRY:** [summary.md](./summary.md)
- **Busca de componentes:** `pnpm search:dry <termo>`
- **Detecção de duplicações:** `pnpm dry:dup`
