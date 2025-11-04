# DOCUMENTAÇÃO TÉCNICA: [Nome da Funcionalidade]

<!--
INSTRUÇÕES DE USO:
1. Este documento é para DESENVOLVEDORES que vão manter/estender o código
2. Substitua [Nome da Funcionalidade] pelo nome descritivo
3. Foco: COMO está implementado (arquitetura, APIs, funções)
4. Inclua exemplos de código quando relevante
5. Mantenha atualizado quando refatorar
6. Delete estas instruções antes de finalizar
-->

## VISÃO GERAL

**O que este documento cobre:**

Este documento descreve a implementação técnica de [nome da funcionalidade], incluindo arquitetura, fluxo de dados, APIs, componentes, funções críticas e decisões técnicas.

**Público-alvo:** Desenvolvedores fazendo manutenção, extensão ou debugging.

---

## ARQUITETURA

### Diagrama de Alto Nível

```
┌─────────────────┐
│   [CAMADA 1]    │  Ex: Frontend (React)
│   [Componentes] │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   [CAMADA 2]    │  Ex: API Routes (Next.js)
│   [Endpoints]   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   [CAMADA 3]    │  Ex: Lógica de Negócio
│   [Funções]     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   [CAMADA 4]    │  Ex: Banco de Dados (Prisma)
│   [Models]      │
└─────────────────┘
```

### Stack Tecnológica

| Camada | Tecnologias | Versão |
|--------|-------------|--------|
| Frontend | React, TypeScript, Tailwind CSS | [versão] |
| Backend | Next.js API Routes, Node.js | [versão] |
| Banco de Dados | PostgreSQL, Prisma | [versão] |
| Testes | Vitest, Playwright | [versão] |
| Outras | [Ex: Papa Parse, Zod] | [versão] |

---

## FLUXO DE DADOS COMPLETO

### Fluxo Principal (Happy Path)

```
1. [AÇÃO DO USUÁRIO]
   └─> [Componente React]
       └─> [Hook/Handler]
           └─> [API Call (fetch/axios)]
               └─> [API Route]
                   └─> [Função de Validação]
                       └─> [Função de Processamento]
                           └─> [Prisma Query]
                               └─> [Banco de Dados]
                                   └─> [Response JSON]
                                       └─> [Atualização de Estado]
                                           └─> [Re-render UI]
```

**Exemplo concreto:**

```
1. Usuário faz upload de CSV
   └─> UploadComponent.tsx
       └─> handleFileSelect()
           └─> POST /api/files
               └─> route.ts (API Handler)
                   └─> validateCSV()
                       └─> parseCSVData()
                           └─> prisma.arquivoImportado.create()
                               └─> PostgreSQL
                                   └─> { id, nomeArquivo, status }
                                       └─> setUploadedFiles([...])
                                           └─> UI mostra arquivo na lista
```

---

## COMPONENTES (Frontend)

### Estrutura de Pastas

```
src/
  components/
    ui/                           # Componentes genéricos
      [ComponenteGenerico].tsx
    [NomeFuncionalidade]/         # Componentes específicos
      [Componente1].tsx
      [Componente2].tsx
  hooks/
    use[NomeFuncionalidade].ts
```

---

### Componente Principal: [Nome]

**Localização:** `src/components/[caminho]/[Nome].tsx`

**Responsabilidade:** [O que este componente faz]

**Props:**

```typescript
interface [Nome]Props {
  prop1: string;              // Descrição
  prop2?: number;             // Opcional - descrição
  onEvent: (data: Type) => void;  // Callback
}
```

**Estado interno:**

```typescript
const [state1, setState1] = useState<Type>(initialValue);
const [state2, setState2] = useState<Type>(initialValue);
```

**Hooks utilizados:**

- `use[Hook1]` - [Descrição]
- `use[Hook2]` - [Descrição]

**Exemplo de uso:**

```typescript
<NomeComponente
  prop1="valor"
  prop2={42}
  onEvent={(data) => console.log(data)}
/>
```

---

### Hook: use[Nome]

**Localização:** `src/hooks/use[Nome].ts`

**Responsabilidade:** [O que este hook faz]

**Retorno:**

```typescript
interface Use[Nome]Return {
  // Estados
  data: Type | null;
  isLoading: boolean;
  error: Error | null;

  // Handlers
  handleAction: (param: Type) => void;

  // Helpers
  helperFunction: (param: Type) => Type;
}
```

**Dependências:**

- API: `[endpoint]`
- Hooks externos: `[ex: useRouter, useContext]`

**Exemplo de uso:**

```typescript
const { data, isLoading, handleAction } = use[Nome]();

// Chamar ação
handleAction(param);
```

---

## APIs (Backend)

### Estrutura de Rotas

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/[recurso]` | Lista todos os [recursos] |
| GET | `/api/[recurso]/[id]` | Busca [recurso] por ID |
| POST | `/api/[recurso]` | Cria novo [recurso] |
| PUT | `/api/[recurso]/[id]` | Atualiza [recurso] |
| DELETE | `/api/[recurso]/[id]` | Deleta [recurso] |

---

### API: POST /api/[endpoint]

**Localização:** `src/app/api/[caminho]/route.ts`

**Responsabilidade:** [O que esta API faz]

**Request:**

```typescript
// Body
{
  campo1: string;
  campo2: number;
  campo3?: boolean;
}

// Headers
{
  "Content-Type": "application/json"
}
```

**Response (Sucesso - 200):**

```typescript
{
  success: true;
  data: {
    id: string;
    campo1: string;
    // ...
  }
}
```

**Response (Erro - 400/500):**

```typescript
{
  success: false;
  error: {
    message: string;
    code: string;
    details?: any;
  }
}
```

**Validações:**

1. [Validação 1] - Validação correspondente: V[X].[Y].[Z]
2. [Validação 2] - Validação correspondente: V[X].[Y].[Z]

**Exemplo de uso:**

```typescript
const response = await fetch('/api/[endpoint]', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ campo1: 'valor', campo2: 42 })
});

const result = await response.json();
```

---

## FUNÇÕES CRÍTICAS

### Função: [nomeFuncao]

**Localização:** `src/lib/[arquivo].ts`

**Responsabilidade:** [O que esta função faz]

**Assinatura:**

```typescript
function [nomeFuncao](
  param1: Type1,
  param2: Type2
): ReturnType {
  // Implementação
}
```

**Parâmetros:**

- `param1`: [Descrição do parâmetro]
- `param2`: [Descrição do parâmetro]

**Retorno:**

- `ReturnType`: [Descrição do retorno]

**Exemplo:**

```typescript
const resultado = [nomeFuncao]('valor1', 42);
// resultado = { ... }
```

**Casos extremos tratados:**

1. [Caso 1] - Validação: V[X].[Y].[Z]
2. [Caso 2] - Validação: V[X].[Y].[Z]

**Testes:**

- `tests/unit/lib/[arquivo].test.ts` - V[X].[Y].[Z] a V[X].[Y].[W]

---

### Função: [outraFuncao]

[Mesmo formato acima]

---

## BANCO DE DADOS

### Models Prisma

**Localização:** `prisma/schema.prisma`

---

#### Model: [NomeModel]

```prisma
model [NomeModel] {
  id          String   @id @default(cuid())
  campo1      String
  campo2      Int?
  campo3      Boolean  @default(false)

  // Relações
  relacao     [OutroModel]?  @relation(fields: [relacaoId], references: [id])
  relacaoId   String?

  // Metadados
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

**Descrição dos campos:**

- `id`: Identificador único (CUID)
- `campo1`: [Descrição]
- `campo2`: [Descrição - opcional]
- `campo3`: [Descrição - padrão: false]

**Relações:**

- `relacao` → `[OutroModel]` (N:1)

**Índices:**

```prisma
@@index([campo1])
@@unique([campo1, campo2])
```

**Queries comuns:**

```typescript
// Buscar por ID
const item = await prisma.[nomeModel].findUnique({
  where: { id: '...' }
});

// Buscar com filtros
const items = await prisma.[nomeModel].findMany({
  where: { campo1: 'valor' },
  include: { relacao: true }
});

// Criar
const novo = await prisma.[nomeModel].create({
  data: { campo1: 'valor', campo2: 42 }
});

// Atualizar
const atualizado = await prisma.[nomeModel].update({
  where: { id: '...' },
  data: { campo1: 'novo valor' }
});

// Deletar
await prisma.[nomeModel].delete({
  where: { id: '...' }
});
```

---

## DECISÕES TÉCNICAS

### Decisão 1: [Título da Decisão]

**Contexto:** [Por que essa decisão foi necessária?]

**Opções consideradas:**

1. **Opção A:** [Descrição]
   - Prós: [...]
   - Contras: [...]

2. **Opção B:** [Descrição]
   - Prós: [...]
   - Contras: [...]

3. **Opção C:** [Descrição]
   - Prós: [...]
   - Contras: [...]

**Decisão:** Escolhemos **Opção [X]**

**Justificativa:** [Por que essa opção foi a melhor]

**Trade-offs aceitos:** [O que sacrificamos ao escolher essa opção]

**Impacto:** [Onde essa decisão impacta o código]

---

### Decisão 2: [Título da Decisão]

[Mesmo formato acima]

---

## DEPENDÊNCIAS

### Dependências de Produção

```json
{
  "[pacote1]": "^[versão]",  // Descrição do uso
  "[pacote2]": "^[versão]",  // Descrição do uso
}
```

### Dependências de Desenvolvimento

```json
{
  "[pacote-test1]": "^[versão]",  // Descrição do uso
  "[pacote-test2]": "^[versão]",  // Descrição do uso
}
```

---

## CONFIGURAÇÕES

### Variáveis de Ambiente

**Localização:** `.env.local`

```bash
# [Categoria 1]
VAR1=valor                     # Descrição
VAR2=valor                     # Descrição

# [Categoria 2]
DATABASE_URL=postgresql://...  # URL do banco de dados
```

---

## PERFORMANCE

### Otimizações Implementadas

1. **[Otimização 1]:**
   - **Onde:** [Localização no código]
   - **Técnica:** [Ex: Memoização, lazy loading, indexação]
   - **Impacto:** [Ex: Redução de 50% no tempo de resposta]

2. **[Otimização 2]:**
   - [...]

### Gargalos Conhecidos

1. **[Gargalo 1]:**
   - **Onde:** [Localização]
   - **Problema:** [Descrição]
   - **Solução futura:** [Como resolver]

---

## SEGURANÇA

### Medidas Implementadas

1. **[Medida 1]:** [Ex: Validação de input com Zod]
   - **Onde:** [Localização]
   - **Protege contra:** [Ex: Injection attacks]

2. **[Medida 2]:** [Ex: Sanitização de CSV]
   - **Onde:** [Localização]
   - **Protege contra:** [Ex: CSV injection]

### Vulnerabilidades Conhecidas

1. **[Vulnerabilidade 1]:**
   - **Risco:** [Baixo/Médio/Alto]
   - **Descrição:** [O que pode acontecer]
   - **Mitigação planejada:** [Como será resolvido]

---

## DEBUGGING

### Logs Importantes

**Localização:** [Console, arquivo, serviço de log]

```typescript
// Exemplo de log útil
console.log('[FUNCIONALIDADE] Processando arquivo:', nomeArquivo);
console.error('[FUNCIONALIDADE] Erro ao processar:', error);
```

### Ferramentas de Debug

1. **[Ferramenta 1]:** [Ex: Prisma Studio]
   - **Comando:** `pnpx prisma studio`
   - **Uso:** [Visualizar dados do banco]

2. **[Ferramenta 2]:** [Ex: Next.js DevTools]
   - **Como acessar:** [...]
   - **Uso:** [...]

---

## TESTES

### Estrutura de Testes

```
tests/
  unit/
    [funcionalidade]/
      [arquivo].test.ts        # Testes unitários
  integration/
    [funcionalidade]/
      [arquivo].test.ts        # Testes de integração
  e2e/
    [funcionalidade]/
      [arquivo].spec.ts        # Testes E2E
  helpers/
    [helper].ts               # Utilitários de teste
  fixtures/
    [dados-mockados].json     # Dados de teste
```

### Comandos de Teste

```bash
# Rodar todos os testes
pnpm test

# Rodar testes específicos
pnpm test [funcionalidade]

# Coverage
pnpm test:coverage

# Watch mode
pnpm test:watch

# E2E
pnpm test:e2e
```

---

## MANUTENÇÃO

### Tarefas Recorrentes

1. **[Tarefa 1]:** [Ex: Limpeza de arquivos antigos]
   - **Frequência:** [Semanal/Mensal]
   - **Como executar:** `[comando ou script]`

2. **[Tarefa 2]:** [Ex: Backup do banco de dados]
   - **Frequência:** [Diária]
   - **Como executar:** `[comando ou script]`

### Migrations de Banco

```bash
# Criar migration
pnpx prisma migrate dev --name [nome-descritivo]

# Aplicar migrations em produção
pnpx prisma migrate deploy

# Resetar banco (DEV ONLY!)
pnpx prisma migrate reset
```

---

## EXTENSIBILIDADE

### Como Adicionar [Feature X]

1. **[Passo 1]:** [Ex: Criar novo endpoint em /api/...]
2. **[Passo 2]:** [Ex: Adicionar componente em src/components/...]
3. **[Passo 3]:** [Ex: Atualizar ESPECIFICACAO.md com novas validações]
4. **[Passo 4]:** [Ex: Escrever testes]

### Pontos de Extensão

- **[Ponto 1]:** [Ex: Hook use[Nome] pode ser estendido para...]
- **[Ponto 2]:** [Ex: Função [nome] aceita plugins via...]

---

## TROUBLESHOOTING

### Problema 1: [Descrição do problema comum]

**Sintomas:** [O que o usuário/dev observa]

**Causa:** [Por que acontece]

**Solução:**

```bash
# Passo 1
[comando ou ação]

# Passo 2
[comando ou ação]
```

---

### Problema 2: [Descrição]

[Mesmo formato acima]

---

## REFERÊNCIAS

- **Documentação relacionada:**
  - [Conceito](./[NOME]_CONCEITO.md)
  - [Especificação](./[NOME]_ESPECIFICACAO.md)
  - [Ciclo de Vida](./[NOME]_CICLO.md)

- **Recursos externos:**
  - [Documentação do Prisma](https://www.prisma.io/docs)
  - [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
  - [Vitest](https://vitest.dev/)

- **Issues relacionadas:**
  - [#123 - Nome da issue](link)

---

**Data de criação:** [YYYY-MM-DD]
**Última atualização:** [YYYY-MM-DD]
**Autor:** [Nome]
**Revisado por:** [Nome(s)]
**Versão da implementação:** [v1.0.0]
