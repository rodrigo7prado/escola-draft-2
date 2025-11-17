# 🖼️ PROTOCOLO DE REFATORAÇÃO DE FRONT-END

**⚠️ ATENÇÃO CLAUDE: Este protocolo é OBRIGATÓRIO antes de qualquer refatoração de UI.**

**🔗 INTEGRAÇÃO CIF:** Se a refatoração for em funcionalidade CIF, seguir também:
- **[CLAUDE.md - Integração CIF + Protocolo Frontend](../CLAUDE.md#🔗-integração-cif--protocolo-de-frontend)**
- Atualizar TECNICO.md + CICLO.md da funcionalidade
- Registrar no CHECKPOINT com screenshots e componentes modificados

---

## 🎯 OBJETIVO

Garantir que Claude tenha "visão" completa antes de modificar interfaces, prevenindo:
- ❌ Quebra de layouts existentes
- ❌ Perda de funcionalidades visuais
- ❌ Inconsistências de estilo
- ❌ Código duplicado ao invés de componentização

---

## 📋 PROTOCOLO EM 3 FASES

### **FASE 1: CAPTURA VISUAL** *(Obrigatória antes de refatorar)*

**Responsabilidade:** USUÁRIO fornece as imagens

Antes de qualquer refatoração de UI, o usuário deve fornecer (o usuário deve ser lembrando se esquecer):

#### 1.1 Screenshot do Estado Atual
- ✅ Imagem da tela/componente a ser modificado
- ✅ Se possível: diferentes estados (hover, erro, loading, vazio)
- ✅ Indicação de áreas problemáticas (se houver)

#### 1.2 Screenshot de Referência (se aplicável)
- Mockup do resultado desejado
- Exemplo de UI similar para replicar
- Anotações sobre mudanças esperadas

#### 1.3 Contexto de Uso
- **Onde está:** Caminho de navegação na aplicação
- **Tamanho típico:** Desktop (1920x1080) / Mobile / Tablet
- **Interações esperadas:** Cliques, hover, drag, etc.
- **Restrições:** Manter cores, tamanhos, espaçamento específico

**Ação de Claude:** Analisar visualmente e confirmar compreensão antes de propor mudanças

---

### **FASE 2: ANÁLISE ESTRUTURADA** *(Claude executa)*

**Responsabilidade:** CLAUDE realiza análise hierárquica completa

#### 2.1 Leitura Hierárquica Obrigatória

**Ordem de leitura:**

```
1. Ler componente principal completo
2. Identificar componentes filhos importados
3. Ler cada filho na ordem de renderização
4. Mapear hooks utilizados
5. Ler implementação dos hooks
6. Identificar componentes genéricos de ui/ utilizados
```

**Comandos típicos:**

```bash
# 1. Ler componente principal
Read: src/components/MeuComponente.tsx

# 2. Identificar imports e ler filhos
Read: src/components/FilhoA.tsx
Read: src/components/FilhoB.tsx

# 3. Ler hooks utilizados
Read: src/hooks/useMeuHook.ts

# 4. Verificar componentes genéricos existentes
Glob: src/components/ui/*.tsx
```

#### 2.2 Mapeamento Visual → Código

**Criar mapa mental:**

- **Elementos visuais:** Identificar cada elemento da screenshot no código
- **Estilos:** Localizar classes Tailwind, CSS modules, styled-components
- **Estados:** Identificar todos os estados possíveis (loading, error, success, empty)
- **Responsividade:** Classes `md:`, `lg:`, breakpoints
- **Animações:** Transições, transformações, hover effects

**Exemplo de mapeamento:**

```
Screenshot mostra:
  - Título azul grande → <h1 className="text-xl text-blue-600">
  - Lista de cards → {items.map(item => <Card />)}
  - Botão verde à direita → <button className="bg-green-500">
  - Spinner ao carregar → {isLoading && <Spinner />}
```

#### 2.3 Checklist de Compreensão (OBRIGATÓRIO)

**Antes de propor mudanças, responder:**

```
□ Entendi a hierarquia de componentes?
□ Identifiquei todos os estados possíveis (loading, error, empty, success)?
□ Localizei onde estão os estilos de cada elemento?
□ Entendi o fluxo de dados (props, hooks, context)?
□ Sei quais componentes são reutilizados em outros lugares?
□ Identifiquei oportunidades de componentização?
□ Verifiquei se há componentes genéricos que posso reutilizar?
```

**Ação de Claude:** Descrever compreensão textualmente antes de qualquer edição

---

### **FASE 3: COMPONENTIZAÇÃO E REFATORAÇÃO** *(Claude executa)*

**Responsabilidade:** CLAUDE aplica mudanças incrementais com validação

#### 3.1 PRINCÍPIO FUNDAMENTAL: SEMPRE COMPONENTIZAR

**⚠️ REGRA DE OURO:**

> **Se um padrão aparece 2 vezes no código, COMPONENTIZAR.**
> **Se um elemento pode ser genérico, CRIAR em `ui/` para reutilização futura.**

#### 3.2 Identificar Oportunidades de Componentização

**ANTES de escrever código, procurar por:**

```
✅ Código duplicado (mesmo JSX em lugares diferentes)
✅ Padrões repetidos (formulários, cards, listas)
✅ Elementos com lógica similar (inputs, botões)
✅ Blocos que poderiam ser reutilizados
```

**Perguntas obrigatórias:**

```
1. Este código já existe em outro lugar?
   → Se SIM: usar componente existente
   → Se NÃO: continuar análise

2. Este padrão pode aparecer em outro lugar no futuro?
   → Se SIM: criar componente genérico em ui/
   → Se NÃO: continuar análise

3. Este elemento tem lógica de negócio específica?
   → Se SIM: criar componente de domínio em components/
   → Se NÃO: criar componente genérico em ui/
```

#### 3.3 Critérios: Componente Genérico vs Personalizado

**📦 Componente GENÉRICO (ui/):**

Criar em `src/components/ui/` quando:

- ✅ **Reutilizável em múltiplos contextos** (Button, Input, Modal)
- ✅ **Sem lógica de negócio** (apenas UI e interação básica)
- ✅ **Altamente configurável** (aceita props como `variant`, `size`, `className`)
- ✅ **Padrão de design system** (pode ser usado em qualquer domínio)

**Exemplos:**

```tsx
// ✅ GENÉRICO - Button reutilizável
<Button variant="primary" size="lg" onClick={handleClick}>
  Salvar
</Button>

// ✅ GENÉRICO - Input configurável
<Input
  type="text"
  placeholder="Digite..."
  error={errors.nome}
  className="w-full"
/>

// ✅ GENÉRICO - FormField container
<FormField label="Nome" required error={errors.nome}>
  <Input {...props} />
</FormField>
```

**🎨 Componente PERSONALIZADO (components/):**

Criar em `src/components/` quando:

- ✅ **Lógica de negócio específica** (validações, regras do domínio)
- ✅ **Integração com hooks de domínio** (useFiltros, useAlunos)
- ✅ **Combinação complexa de genéricos** (form específico, dashboard)
- ✅ **Layout específico da funcionalidade**

**Exemplos:**

```tsx
// ✅ PERSONALIZADO - Lógica de filtros de certificação
<FiltrosCertificacao
  anoLetivo={ano}
  turmas={turmas}
  onChange={handleChange}
/>

// ✅ PERSONALIZADO - Lista de alunos com regras de negócio
<ListaAlunosCertificacao
  alunos={alunosConcluintes}
  onSelect={handleSelect}
/>

// ✅ PERSONALIZADO - Container com composição complexa
<FluxoCertificacao>
  {/* Integra múltiplos componentes e hooks */}
</FluxoCertificacao>
```

#### 3.4 Decisão: Usar Existente vs Criar Novo

**FLUXOGRAMA DE DECISÃO:**

```
1. Preciso de um elemento de UI?
   ↓
2. Já existe genérico em ui/?
   → SIM: Verificar se atende necessidade
      ├─ Atende 100%? → USAR componente existente
      ├─ Atende 80%? → Adicionar props para flexibilizar
      └─ Atende <80%? → Criar novo genérico OU personalizado
   → NÃO: Ir para passo 3
   ↓
3. É reutilizável em outros contextos?
   → SIM: Criar GENÉRICO em ui/
   → NÃO: Ir para passo 4
   ↓
4. Tem lógica de negócio?
   → SIM: Criar PERSONALIZADO em components/
   → NÃO: Criar GENÉRICO em ui/
```

**Exemplo prático:**

```tsx
// ❌ ERRADO - Criar campo inline dentro de componente
function DadosAluno() {
  return (
    <div>
      <label>Nome:</label>
      <input type="text" className="border p-2" />
    </div>
  );
}

// ✅ CORRETO - Usar componentes genéricos
function DadosAluno() {
  return (
    <FormField label="Nome">
      <Input type="text" />
    </FormField>
  );
}
```

#### 3.5 Estratégia de Componentização

**ORDEM DE AÇÃO:**

1. **Buscar componentes existentes:**
   ```bash
   Glob: src/components/ui/*.tsx
   Read: src/components/ui/Input.tsx
   Read: src/components/ui/FormField.tsx
   ```

2. **Avaliar se atendem a necessidade:**
   - Ler interface de props
   - Verificar variantes disponíveis
   - Checar se aceita `className` para customização

3. **Decisão:**
   - **Usar existente:** Aplicar diretamente
   - **Estender existente:** Adicionar props necessárias
   - **Criar novo genérico:** Se for reutilizável
   - **Criar personalizado:** Se tiver lógica de negócio

4. **Implementar:**
   - Criar componente novo (se necessário)
   - Refatorar código existente para usar componente
   - Garantir tipagem TypeScript completa
   - Documentar props com JSDoc se componente genérico

#### 3.6 Refatoração Incremental

**ESTRATÉGIA:**

1. **Pequenas mudanças verificáveis:**
   - Alterar 1 componente por vez
   - Pedir confirmação visual após cada mudança significativa

2. **Ordem de refatoração:**
   ```
   1º: Criar/identificar componentes genéricos necessários
   2º: Extrair lógica para hooks (se necessário)
   3º: Refatorar componente principal
   4º: Refatorar componentes filhos
   5º: Ajustar estilos finais
   ```

3. **Checkpoint visual:**
   ```
   Após cada etapa:
   → Pedir screenshot do resultado
   → Comparar com objetivo
   → Ajustar se necessário
   → Só então prosseguir
   ```

4. **Estratégia de rollback:**
   - Manter histórico de alterações na sessão
   - Se algo quebrar, reverter mudança específica
   - Não fazer múltiplas mudanças simultâneas

---

## 🔍 EXEMPLOS PRÁTICOS

### Exemplo 1: Refatoração de Formulário

**Situação:** Formulário de cadastro com campos inline duplicados

**Screenshot recebido:** Formulário com 5 campos de texto similares

**Análise (Fase 2):**

```tsx
// ANTES - Código duplicado
function Cadastro() {
  return (
    <div>
      <div>
        <label>Nome:</label>
        <input type="text" className="border p-2 rounded" />
      </div>
      <div>
        <label>Email:</label>
        <input type="email" className="border p-2 rounded" />
      </div>
      <div>
        <label>Telefone:</label>
        <input type="tel" className="border p-2 rounded" />
      </div>
      {/* ... mais campos repetidos ... */}
    </div>
  );
}
```

**Checklist de compreensão:**

```
✓ Padrão repetido: label + input (5 vezes)
✓ Estilos idênticos: border p-2 rounded
✓ Oportunidade: componente genérico FormField + Input
✓ Verificar: componentes já existem em ui/?
```

**Buscar existentes:**

```bash
Glob: src/components/ui/*.tsx
Read: src/components/ui/FormField.tsx  # ✅ Existe!
Read: src/components/ui/Input.tsx      # ✅ Existe!
```

**Refatoração (Fase 3):**

```tsx
// DEPOIS - Usando componentes genéricos
import { FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';

function Cadastro() {
  return (
    <div className="space-y-4">
      <FormField label="Nome">
        <Input type="text" placeholder="Digite seu nome" />
      </FormField>

      <FormField label="Email">
        <Input type="email" placeholder="seu@email.com" />
      </FormField>

      <FormField label="Telefone">
        <Input type="tel" placeholder="(00) 00000-0000" />
      </FormField>
    </div>
  );
}
```

**Resultado:**
- ✅ Código mais limpo (redução de 60%)
- ✅ Reutilização de componentes genéricos
- ✅ Manutenção centralizada
- ✅ Consistência visual garantida

---

### Exemplo 2: Criar Novo Componente Genérico

**Situação:** Múltiplos modals com estrutura similar

**Screenshot recebido:** 3 modals diferentes com mesmo padrão (header, body, footer)

**Análise (Fase 2):**

```tsx
// ANTES - Código duplicado em 3 lugares
function ModalConfirmar() {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-96">
        <h2 className="text-xl font-bold mb-4">Confirmar</h2>
        <p>Tem certeza?</p>
        <div className="flex gap-2 mt-6">
          <button>Cancelar</button>
          <button>Confirmar</button>
        </div>
      </div>
    </div>
  );
}

// Outro modal com estrutura IDÊNTICA...
// Outro modal com estrutura IDÊNTICA...
```

**Checklist de compreensão:**

```
✓ Padrão repetido 3 vezes
✓ Estrutura comum: overlay → container → header → body → footer
✓ Oportunidade: componente genérico Modal
✓ Verificar: Modal genérico já existe?
```

**Buscar existente:**

```bash
Glob: src/components/ui/Modal*.tsx
Read: src/components/ui/Modal.tsx  # ❌ Não existe!
```

**Decisão:** Criar componente genérico Modal em ui/

**Refatoração (Fase 3):**

```tsx
// 1º PASSO: Criar componente genérico
// src/components/ui/Modal.tsx
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export function Modal({ isOpen, onClose, title, children, footer, className }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className={`bg-white rounded-lg p-6 w-96 ${className || ''}`}>
        <h2 className="text-xl font-bold mb-4">{title}</h2>
        <div className="mb-6">{children}</div>
        {footer && <div className="flex gap-2 justify-end">{footer}</div>}
      </div>
    </div>
  );
}

// 2º PASSO: Refatorar modals existentes
function ConfirmarModal({ isOpen, onClose, onConfirm }) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Confirmar"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" onClick={onConfirm}>Confirmar</Button>
        </>
      }
    >
      <p>Tem certeza?</p>
    </Modal>
  );
}
```

**Resultado:**
- ✅ Componente genérico reutilizável criado
- ✅ 3 modals refatorados usando o genérico
- ✅ Redução de 70% de código duplicado
- ✅ Fácil manutenção futura

---

### Exemplo 3: Componente Personalizado com Lógica de Negócio

**Situação:** Lista de alunos com filtros e regras específicas de certificação

**Screenshot recebido:** Sidebar com lista de alunos, indicadores de status

**Análise (Fase 2):**

```tsx
// Padrão identificado:
- Lista de alunos (genérico)
- Filtros de certificação (lógica de negócio)
- Indicadores de status (regras específicas)
- Integração com hook useAlunosCertificacao
```

**Checklist de compreensão:**

```
✓ Tem lógica de negócio específica (certificação)
✓ Usa hook de domínio (useAlunosCertificacao)
✓ Regras complexas (só 3ª série, regime anual)
✓ Decisão: componente PERSONALIZADO
```

**Refatoração (Fase 3):**

```tsx
// src/components/ListaAlunosCertificacao.tsx
// Componente PERSONALIZADO - lógica de certificação

interface ListaAlunosCertificacaoProps {
  alunos: Aluno[];
  alunoSelecionado: string | null;
  onSelectAluno: (id: string) => void;
}

export function ListaAlunosCertificacao({
  alunos,
  alunoSelecionado,
  onSelectAluno
}: ListaAlunosCertificacaoProps) {
  // Lógica específica de certificação
  const getStatusCor = (aluno: Aluno) => {
    if (!aluno.dadosConferidos) return 'red';
    if (aluno.fonteAusente) return 'yellow';
    return 'blue';
  };

  return (
    <div className="space-y-2">
      {alunos.map(aluno => (
        <div
          key={aluno.id}
          className={`p-3 rounded cursor-pointer ${
            alunoSelecionado === aluno.id ? 'bg-blue-100' : 'hover:bg-gray-50'
          }`}
          onClick={() => onSelectAluno(aluno.id)}
        >
          <div className="flex items-center gap-2">
            {/* Usa componente genérico Badge */}
            <Badge color={getStatusCor(aluno)} />
            <span className="text-sm">{aluno.nome}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
```

**Resultado:**
- ✅ Componente personalizado com lógica de negócio
- ✅ Reutiliza componente genérico Badge de ui/
- ✅ Encapsula regras específicas de certificação
- ✅ Interface clara e tipada

---

## 📚 REFERÊNCIA RÁPIDA

### Quando Usar Cada Tipo de Componente

| Tipo | Localização | Características | Exemplos |
|------|-------------|-----------------|----------|
| **Genérico** | `ui/` | Sem lógica de negócio, reutilizável, configurável | Button, Input, Modal, Badge |
| **Personalizado** | `components/` | Lógica de domínio, integração com hooks específicos | FiltrosCertificacao, ListaAlunos |
| **Container** | `components/` | Composição complexa, orquestra hooks e componentes | FluxoCertificacao, PainelMigracao |

### Hierarquia de Reutilização

```
1º: Usar componente genérico existente (ui/)
2º: Estender componente genérico com props
3º: Criar novo componente genérico (se reutilizável)
4º: Criar componente personalizado (se lógica específica)
5º: Código inline (EVITAR - apenas para casos únicos)
```

### Checklist Antes de Criar Componente

```
□ Verifiquei se já existe componente similar em ui/?
□ Identifiquei se tem lógica de negócio (personalizado) ou é genérico?
□ Planejei interface de props clara e tipada?
□ Considerei casos de uso futuros (flexibilidade)?
□ Defini se aceita className para customização?
□ Documentei props complexas com JSDoc (se genérico)?
```

---

## 🚨 ANTI-PADRÕES COMUNS

### ❌ Código Inline Duplicado

```tsx
// ❌ ERRADO
function ComponenteA() {
  return <div><label>Nome:</label><input /></div>;
}

function ComponenteB() {
  return <div><label>Email:</label><input /></div>;
}
```

```tsx
// ✅ CORRETO
function ComponenteA() {
  return <FormField label="Nome"><Input /></FormField>;
}

function ComponenteB() {
  return <FormField label="Email"><Input /></FormField>;
}
```

### ❌ Componente Genérico com Lógica de Negócio

```tsx
// ❌ ERRADO - Button genérico com lógica específica
function Button({ onClick }) {
  const { userData } = useUserData(); // ❌ Hook de domínio em genérico
  const canClick = userData.role === 'admin'; // ❌ Regra de negócio

  return <button disabled={!canClick} onClick={onClick}>Salvar</button>;
}
```

```tsx
// ✅ CORRETO - Separar genérico e lógica
// ui/Button.tsx - Genérico
function Button({ onClick, disabled, children }) {
  return <button disabled={disabled} onClick={onClick}>{children}</button>;
}

// components/AdminButton.tsx - Personalizado
function AdminButton({ onClick, children }) {
  const { userData } = useUserData();
  const canClick = userData.role === 'admin';

  return <Button disabled={!canClick} onClick={onClick}>{children}</Button>;
}
```

### ❌ Criar Novo ao Invés de Reutilizar

```tsx
// ❌ ERRADO - Criar novo componente similar
function MeuInputCustom() {
  return <input className="border p-2 rounded" />;
}
```

```tsx
// ✅ CORRETO - Usar componente existente
import { Input } from '@/components/ui/Input';

function MeuFormulario() {
  return <Input />; // Já tem estilos corretos
}
```

---

## 🎯 COMANDOS ÚTEIS PARA ANÁLISE

### Buscar Componentes Existentes

```bash
# Listar todos os componentes genéricos
Glob: src/components/ui/*.tsx

# Buscar componente específico por nome
Glob: src/components/ui/*Button*.tsx
Glob: src/components/ui/*Input*.tsx
Glob: src/components/ui/*Modal*.tsx

# Buscar uso de componente no projeto
Grep: "from '@/components/ui/Button'" --type ts
```

### Analisar Estrutura de Componente

```bash
# Ler componente completo
Read: src/components/MeuComponente.tsx

# Verificar props exportadas
Grep: "interface.*Props" src/components/MeuComponente.tsx

# Ver exemplos de uso
Grep: "<MeuComponente" --type tsx
```

### Identificar Duplicação

```bash
# Buscar padrões similares
Grep: "<input.*className" --output_mode content

# Buscar estruturas repetidas
Grep: "<div><label>.*<input" --output_mode content
```

---

## ✅ RESUMO DO PROTOCOLO

1. **FASE 1 - Captura Visual (Usuário)**
   - Fornecer screenshots (antes/depois)
   - Descrever contexto e restrições

2. **FASE 2 - Análise Estruturada (Claude)**
   - Ler hierarquia completa de componentes
   - Mapear visual → código
   - ✅ Completar checklist de compreensão
   - ✅ Identificar oportunidades de componentização

3. **FASE 3 - Componentização e Refatoração (Claude)**
   - ✅ Buscar componentes existentes PRIMEIRO
   - ✅ Decidir: genérico (ui/) vs personalizado (components/)
   - ✅ Criar/reutilizar conforme decisão
   - Aplicar mudanças incrementais
   - Solicitar validação visual após cada etapa

**PRINCÍPIO FUNDAMENTAL:**
> **SEMPRE componentizar. SEMPRE reutilizar. NUNCA duplicar.**

---

**Este protocolo é um documento vivo. Aperfeiçoe conforme surgirem novos padrões.**