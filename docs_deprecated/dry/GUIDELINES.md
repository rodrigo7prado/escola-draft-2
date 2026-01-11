# Guidelines: DRY vs Novo Componente

Quando implementar uma funcionalidade, siga este guia de decisão para garantir reutilização apropriada e evitar sobre-engenharia.

## Fluxo de Decisão

```
┌─────────────────────────────────────┐
│ Preciso implementar funcionalidade │
└──────────────┬──────────────────────┘
               │
               ▼
    ┌──────────────────────┐
    │ Existe componente    │
    │ DRY que atende?      │───── SIM ──────┐
    └──────┬───────────────┘                │
           │                                 ▼
          NÃO                    ┌────────────────────────┐
           │                     │ Usar componente DRY    │
           ▼                     │ existente              │
    ┌──────────────────────┐    └────────────────────────┘
    │ Pode ser adaptado    │
    │ com props?           │───── SIM ──────┐
    └──────┬───────────────┘                │
           │                                 ▼
          NÃO                    ┌────────────────────────┐
           │                     │ Estender com props     │
           ▼                     │ (propor no código)     │
    ┌──────────────────────┐    └────────────────────────┘
    │ Padrão aparece 2+    │
    │ vezes no projeto?    │───── SIM ──────┐
    └──────┬───────────────┘                │
           │                                 ▼
          NÃO                    ┌────────────────────────┐
           │                     │ Criar novo DRY         │
           ▼                     │ genérico               │
    ┌──────────────────────┐    └────────────────────────┘
    │ Será reutilizado     │
    │ em outras features?  │───── SIM ──────┘
    └──────┬───────────────┘
           │
          NÃO
           │
           ▼
    ┌──────────────────────┐
    │ Criar código         │
    │ específico (não DRY) │
    └──────────────────────┘
```

---

## Regra dos 2 Usos

**NUNCA crie um componente DRY genérico até que o padrão apareça pelo menos 2 vezes.**

### Exemplos:

#### ✅ CORRETO - Aguardar segundo uso
```
1º uso: Modal de confirmação específico para deletar aluno
→ Implementar inline no componente

2º uso: Modal de confirmação para deletar turma
→ AGORA criar DRY.UI:MODAL_CONFIRMACAO genérico
```

#### ❌ INCORRETO - Generalizar prematuramente
```
1º uso: Modal de confirmação para deletar aluno
→ Já criar DRY.UI:MODAL_CONFIRMACAO genérico
   (sobre-engenharia, YAGNI violation)
```

---

## Quando Usar Componente DRY Existente

### ✅ Use se:
1. **Funcionalidade idêntica ou muito similar**
   - Exemplo: Precisa de menu kebab → use `[DRY.UI:OVERFLOW_MENU]`

2. **Pode adaptar com props existentes**
   - Componente já tem props para customizar comportamento
   - Não requer mudanças no componente base

3. **Segue mesmo padrão de interação**
   - Mesmo fluxo de usuário
   - Mesmas expectativas de acessibilidade

### ❌ NÃO use se:
1. **Requer lógica de domínio específica**
   - Componente base deve ser genérico
   - Lógica de negócio vai no componente específico

2. **Necessita modificações profundas**
   - Se precisa mudar o core do componente
   - Considere criar novo ou propor extensão

---

## Quando Estender com Props

### ✅ Estenda se:
1. **Variação legítima de uso**
   - Exemplo: Modal pode ter ou não botão de cancelar
   - Props: `showCancel?: boolean`

2. **Mantém simplicidade**
   - Não adiciona mais de 2-3 props novas
   - Props são boolean, string ou enum simples

3. **Beneficia outros casos de uso**
   - Outros componentes também precisariam dessa variação

### ❌ NÃO estenda se:
1. **Props se tornam complexas**
   - Mais de 5 props obrigatórias
   - Props com objetos aninhados complexos

2. **Cria condicionais excessivas**
   - Muitos `if/else` baseados em props
   - Código difícil de manter

3. **Casos de uso divergem**
   - Comportamentos muito diferentes
   - Melhor ter 2 componentes simples que 1 complexo

**Exemplo de extensão boa:**
```typescript
// Antes
interface ModalProps {
  title: string;
  children: React.ReactNode;
}

// Depois - extensão simples e clara
interface ModalProps {
  title: string;
  children: React.ReactNode;
  showCancel?: boolean;  // ✅ Adiciona funcionalidade útil
  size?: 'sm' | 'md' | 'lg';  // ✅ Enum simples
}
```

---

## Quando Criar Novo Componente DRY

### ✅ Crie novo DRY se:

1. **Padrão aparece 2+ vezes (Regra dos 2 Usos)**
   ```
   Uso 1: Filtro de turmas por ano
   Uso 2: Filtro de alunos por turma
   → Criar DRY.UI:FILTRO_DROPDOWN genérico
   ```

2. **Será reutilizado em múltiplas features**
   - Componente resolve problema comum
   - Outras features terão mesma necessidade

3. **É genérico e sem lógica de domínio**
   - Pode ser documentado de forma abstrata
   - Funciona independente do contexto de negócio

4. **Segue padrões de design existentes**
   - Alinhado com design system do projeto
   - Consistente com outros componentes DRY

### Processo de criação:
1. **Identificar padrão repetido**
2. **Usar template:** `docs/dry/templates/ui-component.md`
3. **Documentar no arquivo apropriado:**
   - Base: `docs/dry/ui/ui-components.dry.md`
   - Macro: `docs/dry/ui/ui-macro.md`
   - Backend: `docs/dry/backend/`
4. **Atualizar summary:** `pnpm summary:dry`
5. **Adicionar testes unitários**
6. **Registrar no CHECKPOINT da feature**

---

## Quando Criar Código Específico (Não DRY)

### ✅ Código específico se:

1. **Caso de uso único**
   - Não há indício de repetição futura
   - Funcionalidade específica de uma feature

2. **Lógica de domínio acoplada**
   - Regras de negócio específicas
   - Não faz sentido generalizar

3. **Complexidade de generalização alta**
   - Tornar genérico seria mais complexo que duplicar
   - Trade-off não compensa

**Exemplo:**
```typescript
// ✅ Específico - lógica de domínio acoplada
function validarMatriculaAluno(matricula: string, ano: number) {
  // Regras específicas de matrícula do sistema
  // Não faz sentido generalizar
}

// ❌ Não criar DRY.BACKEND:VALIDADOR_MATRICULA_GENERICA
// (seria over-engineering)
```

---

## Hierarquia de Reutilização

Siga esta ordem (do CLAUDE.md):

```
1º: Usar componente genérico existente (ui/)
2º: Estender componente genérico com props
3º: Criar novo componente genérico (se reutilizável)
4º: Criar componente personalizado (se lógica específica)
5º: Código inline (EVITAR - apenas casos únicos)
```

---

## Checklist de Decisão

Antes de implementar, responda:

- [ ] **Busquei no DRY?** `pnpm search:dry <termo>`
- [ ] **Consultei summary.md?** `docs/dry/summary.md`
- [ ] **Componente existente atende?** Se SIM → usar
- [ ] **Pode estender com props simples?** Se SIM → propor extensão
- [ ] **Padrão aparece 2+ vezes?** Se SIM → criar DRY
- [ ] **Será reutilizado no futuro?** Se SIM → criar DRY
- [ ] **É lógica de domínio específica?** Se SIM → código específico

---

## Sinais de Alerta (Code Smells)

### 🚨 Você pode estar fazendo errado se:

1. **Criou DRY no primeiro uso**
   - Viola regra dos 2 usos
   - Possível YAGNI (You Aren't Gonna Need It)

2. **Componente DRY tem muitas props condicionais**
   - Mais de 7 props
   - Muitos `if/else` baseados em combinações de props

3. **Nome do componente é muito específico**
   - `DRY.UI:BOTAO_DELETAR_ALUNO_COM_CONFIRMACAO`
   - Deveria ser: `DRY.UI:BOTAO_ACAO_DESTRUTIVA`

4. **Componente DRY tem lógica de domínio**
   - Conhece modelo `Aluno`, `Turma`, etc
   - Componente base deve ser agnóstico

---

## Exemplos Práticos

### Exemplo 1: Menu de Opções

**Situação:** Preciso de menu com 3 pontinhos (kebab menu)

**Decisão:**
```
1. Buscar: pnpm search:dry menu
2. Encontrado: DRY.UI:OVERFLOW_MENU
3. Verificar: Atende minha necessidade? SIM
4. Ação: Usar componente existente ✅
```

### Exemplo 2: Filtro Personalizado

**Situação:** Preciso de filtro de turmas por ano e série

**Decisão:**
```
1. Buscar: pnpm search:dry filtro
2. Não encontrado componente genérico
3. É primeiro uso? SIM
4. Ação: Criar código específico ✅
5. Documentar no CHECKPOINT: "Se precisar de filtro similar em outra feature, criar DRY.UI:FILTRO_DROPDOWN genérico"
```

### Exemplo 3: Modal de Confirmação (2º uso)

**Situação:** Segunda vez que preciso de modal de confirmação

**Decisão:**
```
1. Já existe uso similar? SIM (modal de delete)
2. Padrão se repete? SIM (2º uso)
3. Ação: Criar DRY.UI:MODAL_CONFIRMACAO genérico ✅
4. Refatorar primeiro uso para usar novo componente
5. Documentar em docs/dry/ui/ui-components.dry.md
6. Atualizar: pnpm summary:dry
```

---

## Referências

- **Templates:** `docs/dry/templates/`
- **Componentes existentes:** `docs/dry/summary.md`
- **Busca:** `pnpm search:dry <termo>`
- **Metodologia IDD:** `docs/IDD.md`
- **Princípio DRY:** `CLAUDE.md` (Hierarquia de Reutilização)