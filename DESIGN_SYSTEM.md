# Design System - Sistema de Certificação

Este documento descreve o design system implementado no projeto, incluindo tokens, componentes e padrões de uso.

---

## 📐 Design Tokens

Os design tokens estão centralizados em `src/app/globals.css` usando a funcionalidade `@theme inline` do Tailwind CSS v4.

### Border Radius
```css
--radius-default: 0.125rem;  /* rounded-sm - padrão do projeto */
--radius-none: 0;            /* rounded-none */
--radius-sm: 0.125rem;       /* rounded-sm */
--radius-md: 0.375rem;       /* rounded-md */
--radius-lg: 0.5rem;         /* rounded-lg */
--radius-full: 9999px;       /* rounded-full */
```

**Uso:** O padrão do projeto é `rounded-sm` para manter elementos compactos.

### Spacing

#### Inputs
```css
--spacing-input-x: 0.25rem;  /* px-1 */
--spacing-input-y: 0.125rem; /* py-0.5 */
```

#### Buttons
```css
--spacing-btn-sm-x: 0.75rem; /* px-3 */
--spacing-btn-sm-y: 0.375rem; /* py-1.5 */
--spacing-btn-md-x: 1rem;    /* px-4 */
--spacing-btn-md-y: 0.5rem;  /* py-2 */
--spacing-btn-lg-x: 1.5rem;  /* px-6 */
--spacing-btn-lg-y: 0.75rem; /* py-3 */
```

### Cores Semânticas

```css
--color-pendente: #ef4444;    /* Vermelho - tarefas pendentes */
--color-resolvendo: #f59e0b;  /* Laranja - em andamento */
--color-ok: #3b82f6;          /* Azul - OK sem alteração */
--color-corrigido: #10b981;   /* Verde - corrigido/completo */
```

### Tamanhos de Fonte
```css
--text-xs: 0.75rem;   /* 12px */
--text-sm: 0.875rem;  /* 14px */
--text-base: 1rem;    /* 16px */
--text-lg: 1.125rem;  /* 18px */
--text-xl: 1.25rem;   /* 20px */
```

---

## 🧩 Componentes UI Genéricos

Todos os componentes genéricos estão em `src/components/ui/`.

### Button

**Localização:** `src/components/ui/Button.tsx`

#### Props
```typescript
type ButtonProps = {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  children?: ReactNode;
  className?: string;
  // + todas as props de HTMLButtonElement
}
```

#### Variantes

| Variant | Aparência | Uso |
|---------|-----------|-----|
| `primary` | Azul sólido, texto branco | Ações principais (Salvar, Confirmar) |
| `secondary` | Cinza claro, texto escuro | Ações secundárias, navegação |
| `ghost` | Transparente, hover cinza | Links, ações discretas (Editar, Limpar) |
| `danger` | Vermelho sólido, texto branco | Ações destrutivas (Excluir) |
| `outline` | Borda cinza, fundo branco | Ações neutras (Cancelar, Selecionar) |

#### Tamanhos

| Size | Padding | Texto | Uso |
|------|---------|-------|-----|
| `sm` | `px-3 py-1.5` | `text-xs` | Interface compacta, controles pequenos |
| `md` | `px-4 py-2` | `text-sm` | Padrão, maioria dos botões |
| `lg` | `px-6 py-3` | `text-base` | Destaque, CTAs |

#### Exemplos de Uso

```tsx
// Botão primário
<Button variant="primary" size="sm">
  Salvar
</Button>

// Botão com ícone
<Button variant="ghost" icon={<Copy size={14} />}>
  Copiar
</Button>

// Botão full width
<Button variant="primary" fullWidth>
  Confirmar
</Button>

// Botão customizado (adiciona classes extras)
<Button variant="ghost" className="text-red-600 hover:underline">
  Remover
</Button>
```

---

### Input

**Localização:** `src/components/ui/Input.tsx`

#### Características
- Largura completa (`w-full`)
- Texto pequeno (`text-xs`)
- Padding compacto (`px-1 py-0.5`)
- Borda padrão com foco azul
- Aceita `className` para customização

#### Exemplo
```tsx
<Input
  type="text"
  value={valor}
  onChange={(e) => setValor(e.target.value)}
  placeholder="Digite aqui"
/>
```

---

### InputWithCopy

**Localização:** `src/components/ui/InputWithCopy.tsx`

Input com botão de copiar integrado. Ideal para valores que o usuário precisa copiar (matrícula, CPF, etc).

#### Props
```typescript
type InputWithCopyProps = {
  value: string;
  className?: string;
  readOnly?: boolean;
  label?: string; // Texto do tooltip
}
```

#### Exemplo
```tsx
<InputWithCopy
  value={aluno.matricula}
  label="Copiar matrícula"
/>
```

---

### DateInput

**Localização:** `src/components/ui/DateInput.tsx`

Input de data que aceita `Date | string | null`.

#### Exemplo
```tsx
<DateInput
  value={aluno.dataNascimento}
  onChange={(e) => handleDateChange(e.target.value)}
/>
```

---

### Textarea

**Localização:** `src/components/ui/Textarea.tsx`

Textarea padrão com estilos consistentes.

#### Exemplo
```tsx
<Textarea
  value={observacoes}
  rows={3}
  onChange={(e) => setObservacoes(e.target.value)}
/>
```

---

### Checkbox

**Localização:** `src/components/ui/Checkbox.tsx`

Checkbox com label opcional.

#### Exemplos
```tsx
// Com label
<Checkbox
  label="Certificação"
  checked={certificacao}
  onChange={(e) => setCertificacao(e.target.checked)}
/>

// Sem label
<Checkbox checked={valor} />
```

---

### FormField

**Localização:** `src/components/ui/FormField.tsx`

Container para campos de formulário com label.

#### Exemplo
```tsx
<FormField label="Nome Completo">
  <Input value={nome} />
</FormField>
```

---

### ButtonGroup

**Localização:** `src/components/ui/ButtonGroup.tsx`

Grupo de botões para seleção única (radio buttons visuais).

#### Props
```typescript
type ButtonGroupProps = {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  buttonClassName?: string;
}
```

#### Exemplo
```tsx
<ButtonGroup
  options={['2024', '2023', '2022']}
  value={anoSelecionado}
  onChange={setAnoSelecionado}
/>
```

---

### ScrollableButtonGroup

**Localização:** `src/components/ui/ScrollableButtonGroup.tsx`

ButtonGroup com scroll horizontal e setas de navegação. Ideal para muitas opções em espaço limitado.

#### Props
```typescript
type ScrollableButtonGroupProps = {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  buttonClassName?: string;
  maxVisibleItems?: number;
}
```

#### Exemplo
```tsx
<ScrollableButtonGroup
  options={turmasDisponiveis}
  value={turmaSelecionada}
  onChange={setTurmaSelecionada}
  maxVisibleItems={3}
/>
```

---

### Modal

**Localização:** `src/components/ui/Modal.tsx`

Modal genérico com overlay, título e botão de fechar.

#### Exemplo
```tsx
<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Confirmar ação"
>
  <p>Conteúdo do modal</p>
</Modal>
```

---

### Tabs

**Localização:** `src/components/ui/Tabs.tsx`

Sistema de abas com contexto.

#### Exemplo
```tsx
<Tabs defaultValue="tab1">
  <TabsList>
    <TabsTrigger value="tab1">Aba 1</TabsTrigger>
    <TabsTrigger value="tab2">Aba 2</TabsTrigger>
  </TabsList>

  <TabsContent value="tab1">
    Conteúdo da aba 1
  </TabsContent>

  <TabsContent value="tab2">
    Conteúdo da aba 2
  </TabsContent>
</Tabs>
```

---

## 🎨 Cores Semânticas (Status)

Use as classes utilitárias para indicar status:

```tsx
// Pendente (vermelho)
<div className="text-red-600 bg-red-50 border-red-200">
  Pendente
</div>

// Resolvendo (laranja)
<div className="text-orange-600 bg-orange-50 border-orange-200">
  Resolvendo
</div>

// OK (azul)
<div className="text-blue-600 bg-blue-50 border-blue-200">
  OK
</div>

// Corrigido (verde)
<div className="text-green-600 bg-green-50 border-green-200">
  Corrigido
</div>

// Aviso (amarelo)
<div className="text-yellow-800 bg-yellow-50 border-yellow-200">
  ⚠️ Aviso
</div>
```

---

## 📏 Padrões de Layout

### Spacing Vertical

```tsx
// Entre seções
<div className="space-y-6">

// Entre elementos dentro de seção
<div className="space-y-4">

// Entre campos de formulário
<div className="space-y-2">
```

### Spacing Horizontal (Gaps)

```tsx
// Entre elementos inline
<div className="flex gap-3">

// Entre elementos de grid
<div className="grid grid-cols-3 gap-2">
```

### Tipografia

```tsx
// Títulos de seção
<h3 className="text-xs font-semibold text-neutral-700 mb-2 pb-1 border-b">

// Labels
<label className="text-xs font-medium text-neutral-600">

// Hints/ajuda
<p className="text-[10px] text-neutral-500">
```

---

## ✅ Boas Práticas

### 1. Sempre use componentes genéricos
❌ **Evite:**
```tsx
<input className="w-full border..." />
<button className="bg-blue-600...">Salvar</button>
```

✅ **Prefira:**
```tsx
<Input />
<Button variant="primary">Salvar</Button>
```

### 2. Use className apenas para customizações específicas

✅ **Bom:**
```tsx
<Button variant="ghost" className="text-red-600 hover:underline">
  Excluir
</Button>
```

❌ **Ruim:**
```tsx
<Button className="bg-blue-600 text-white px-4 py-2 rounded">
  Salvar
</Button>
```
*Motivo:* Isso duplica estilos que já existem em `variant="primary"`

### 3. Componentize código repetido

Se você está copiando e colando, **crie um componente**.

### 4. Mantenha consistência

- Border radius: use `rounded-sm` (padrão do projeto)
- Inputs: sempre `text-xs px-1 py-0.5`
- Botões: use variantes, não crie estilos inline

---

## 🔄 Como Fazer Mudanças Globais

### Via IDE (Recomendado para estilos)
Use Find & Replace global para mudanças de CSS:
- `rounded-md` → `rounded-sm`
- `px-2` → `px-1`
- etc.

### Via Design Tokens
Para mudanças estruturais, atualize os tokens em `globals.css`:

```css
/* Exemplo: mudar padding padrão de inputs */
--spacing-input-x: 0.5rem; /* antes: 0.25rem */
```

Depois, atualize os componentes para usar:
```tsx
className="px-[--spacing-input-x]"
```

### Via Componentes
Mudanças em componentes afetam todas as instâncias automaticamente.

---

## 📚 Recursos

- **Tailwind CSS v4 Docs:** https://tailwindcss.com/docs
- **Componentes UI:** `src/components/ui/`
- **Tokens:** `src/app/globals.css` (seção `@theme inline`)

---

## 🚀 Próximos Passos

Melhorias futuras sugeridas:
1. Adicionar tema dark mode
2. Criar mais variantes de botões (success, warning)
3. Adicionar componentes de Select, Radio, Switch
4. Sistema de notificações/toasts
5. Componentes de loading/skeleton
