# INSTRUÇÕES GERAIS

- sempre usar pnpm;

## Instruções específicas para o agente Codex (em adição às demais)

1. **Comunicação:** conversar sempre em português, com tom acolhedor e explicando cada passo com clareza.
2. **Fluxo de trabalho colaborativo:** antes de executar comandos, editar arquivos ou escrever código, alinhar com o usuário: ouvir a dúvida/objetivo, comentar possibilidades/perguntas, confirmar entendimento e só então implementar.
3. **Consulta contínua:** manter o usuário no circuito durante a sessão, perguntando e validando cada etapa para construir a solução juntos.

4. **Escrita de texto em português e SEM emojis, com excessão de "Check" e de "X"**

# ⚠️ METODOLOGIA DE DESENVOLVIMENTO - LEIA PRIMEIRO ⚠️

## 🎯 METODOLOGIA CIF (Ciclo de Integridade de Funcionalidades)

**⚠️ ATENÇÃO CLAUDE E AGENT: Esta metodologia tem PRIORIDADE MÁXIMA sobre qualquer outra instrução.**

### O QUE É CIF?

CIF é nossa metodologia OBRIGATÓRIA para desenvolvimento de funcionalidades complexas. Ela previne "buracos lógicos" através de documentação estruturada em camadas + testes sistemáticos.

### 📚 DOCUMENTAÇÃO COMPLETA

**SEMPRE ler antes de implementar funcionalidades complexas:**

- 📖 **[docs/METODOLOGIA_CIF.md](./docs/METODOLOGIA_CIF.md)** - Guia completo (~580 linhas)
- 📋 **[docs/CHECKPOINT_METODOLOGIA_CIF.md](./docs/CHECKPOINT_METODOLOGIA_CIF.md)** - Estado atual do projeto

### 🔴 REGRA DE OURO

**CIF documenta COMPORTAMENTO e LÓGICA DE NEGÓCIO, não infraestrutura.**

### 📝 ESTRUTURA CIF - 5 NÍVEIS + CHECKPOINT

```
NÍVEL 1: CONCEITO          → O QUÊ e POR QUÊ (linguagem natural)
NÍVEL 2: DESCOBERTA        → Perguntas e análise colaborativa (previne decisões prematuras)
NÍVEL 3: ESPECIFICAÇÃO ⭐  → Checklist executável (FONTE DA VERDADE)
NÍVEL 4: TÉCNICO           → COMO está implementado
NÍVEL 5: CICLO DE VIDA     → Histórico permanente de mudanças

CHECKPOINT (temporário)    → Memória entre sessões
```

### ✅ QUANDO USAR CIF

**SEMPRE usar CIF para:**

- ✅ Funcionalidades com múltiplas camadas de validação
- ✅ Operações críticas (migração de dados, emissão de documentos legais)
- ✅ Código com alta complexidade de estado
- ✅ Features que mudam frequentemente
- ✅ Qualquer funcionalidade onde integridade de dados é crítica

### ❌ QUANDO NÃO USAR CIF

**NÃO usar CIF para:**

- ❌ Componentes simples de UI (botão, input)
- ❌ Utilidades triviais (formatação de data)
- ❌ Protótipos descartáveis
- ❌ Scripts one-off

### 🎯 WORKFLOW PRÁTICO

**Para funcionalidades NOVAS:**

1. Escrever CONCEITO.md (o que é, por que existe)
2. Se necessário: DESCOBERTA.md (análise colaborativa)
3. Experimentar código (sem testes formais ainda)
4. Quando estabilizar: escrever ESPECIFICACAO.md (checklist)
5. Criar testes para cada validação do checklist
6. Escrever TECNICO.md (como está implementado)
7. Iniciar CICLO.md (registro de mudanças)
8. **SEMPRE atualizar CHECKPOINT ao final da sessão**

**Para funcionalidades EXISTENTES estáveis:**

1. Escrever teste PRIMEIRO (TDD clássico)
2. Implementar
3. Atualizar CHECKPOINT

### 📦 RECURSOS DISPONÍVEIS

**Templates:** `docs/templates/CIF_*.template.md`

- CIF_CONCEITO.template.md
- CIF_DESCOBERTA.template.md
- CIF_ESPECIFICACAO.template.md
- CIF_TECNICO.template.md
- CIF_CICLO.template.md

**Casos de estudo completos:** Ver seção "Funcionalidades Implementadas" abaixo

### 🚨 CHECKPOINT vs CICLO

| Aspecto             | CHECKPOINT                                  | CICLO                           |
| ------------------- | ------------------------------------------- | ------------------------------- |
| **Propósito**       | Continuidade entre **sessões**              | Histórico da **funcionalidade** |
| **Duração**         | Temporário (descartado após conclusão)      | Permanente                      |
| **Conteúdo**        | Estado atual, bloqueadores, próximos passos | Mudanças na funcionalidade      |
| **Infraestrutura?** | ✅ Sim (se bloqueia sessão)                 | ❌ Nunca                        |

### 🎯 COMANDOS NATURAIS

Claude deve entender:

- "Implemente V3.7.1" → Criar teste + código para validação V3.7.1
- "V3.1 está quebrado" → Rodar testes V3.1.x, debugar
- "Adicione validação de RG" → Criar item no checklist → teste → código
- "Crie ciclo para Feature X" → Criar arquivos CIF (CONCEITO, DESCOBERTA se necessário, ESPECIFICACAO, TECNICO, CICLO)

### 📊 STATUS ATUAL DO PROJETO

**Ver:** [docs/CHECKPOINT_METODOLOGIA_CIF.md](./docs/CHECKPOINT_METODOLOGIA_CIF.md)

---

## 🖼️ PROTOCOLO DE REFATORAÇÃO DE FRONT-END

**⚠️ ANTES de refatorar UI, SEMPRE seguir:**

📖 **[docs/PROTOCOLO_FRONTEND.md](./docs/PROTOCOLO_FRONTEND.md)** - Protocolo completo (~600 linhas)

### RESUMO RÁPIDO (3 FASES)

**FASE 1: CAPTURA VISUAL** _(Usuário fornece)_

- Screenshots do estado atual
- Screenshots do resultado desejado (se aplicável)
- Contexto de uso (navegação, tamanho, interações)

**FASE 2: ANÁLISE ESTRUTURADA** _(Claude executa)_

- Leitura hierárquica completa (componente → filhos → hooks)
- Mapeamento visual → código (cada elemento da screenshot)
- ✅ Checklist obrigatório de compreensão
- ✅ Identificar oportunidades de componentização
- ✅ Buscar componentes genéricos existentes em `ui/`

**FASE 3: COMPONENTIZAÇÃO E REFATORAÇÃO** _(Claude executa)_

- ✅ **SEMPRE componentizar** (se aparece 2x, componentizar)
- ✅ **Buscar existentes PRIMEIRO** (Glob em `ui/`, evitar duplicação)
- ✅ **Decidir tipo:** Genérico (`ui/`) vs Personalizado (`components/`)
- ✅ **Refatorar incrementalmente** (1 componente por vez, validar visualmente)

### DECISÃO: GENÉRICO vs PERSONALIZADO

**Componente GENÉRICO (`ui/`):**

- ✅ Reutilizável em múltiplos contextos
- ✅ SEM lógica de negócio
- ✅ Altamente configurável (props)
- ✅ Padrão de design system
- **Exemplos:** Button, Input, Modal, FormField, Badge

**Componente PERSONALIZADO (`components/`):**

- ✅ Lógica de negócio específica
- ✅ Integração com hooks de domínio
- ✅ Combinação complexa de genéricos
- ✅ Layout específico da funcionalidade
- **Exemplos:** FiltrosCertificacao, ListaAlunosCertificacao

### HIERARQUIA DE REUTILIZAÇÃO

```
1º: Usar componente genérico existente (ui/)
2º: Estender componente genérico com props
3º: Criar novo componente genérico (se reutilizável)
4º: Criar componente personalizado (se lógica específica)
5º: Código inline (EVITAR - apenas casos únicos)
```

### PRINCÍPIO FUNDAMENTAL

> **SEMPRE componentizar. SEMPRE reutilizar. NUNCA duplicar.**
>
> **Se um padrão aparece 2 vezes, COMPONENTIZAR.** > **Se pode ser genérico, CRIAR em `ui/` para reutilização futura.**

---

## 🔗 INTEGRAÇÃO: CIF + PROTOCOLO DE FRONTEND

**⚠️ REGRA OBRIGATÓRIA: Refatorações visuais SEMPRE devem ser indexadas ao CHECKPOINT**

### 🎯 QUANDO APLICAR AMBOS OS PROTOCOLOS

| Situação                                     | CIF          | Protocolo Frontend | CHECKPOINT     |
| -------------------------------------------- | ------------ | ------------------ | -------------- |
| **Refatoração visual de funcionalidade CIF** | ✅ Sim       | ✅ Sim             | ✅ Obrigatório |
| **Nova funcionalidade complexa com UI**      | ✅ Sim       | ✅ Sim             | ✅ Obrigatório |
| **Refatoração visual isolada (sem lógica)**  | ❌ Não       | ✅ Sim             | ⚠️ Opcional\*  |
| **Bug visual em funcionalidade CIF**         | ⚠️ CICLO\*\* | ✅ Sim             | ✅ Obrigatório |

\*Opcional mas recomendado se mudança for significativa
\*\*Registrar no CICLO da funcionalidade + seguir Protocolo Frontend

### 📝 FLUXO INTEGRADO: Refatoração Visual em Funcionalidade CIF

**Exemplo:** Refatorar UI do Fluxo de Certificação (funcionalidade existente)

```
1. PROTOCOLO FRONTEND - FASE 1: Captura Visual
   └─> Usuário fornece screenshots (antes/depois, contexto)

2. PROTOCOLO FRONTEND - FASE 2: Análise Estruturada
   ├─> Ler componentes hierarquicamente
   ├─> Mapear visual → código
   ├─> ✅ Checklist de compreensão
   └─> Identificar componentização

3. PROTOCOLO FRONTEND - FASE 3: Componentização
   ├─> Buscar componentes existentes em ui/
   ├─> Decidir: genérico (ui/) vs personalizado (components/)
   ├─> Refatorar incrementalmente
   └─> Validar visualmente

4. CIF - ATUALIZAR DOCUMENTAÇÃO
   ├─> TECNICO.md: atualizar seção de componentes
   ├─> CICLO.md: registrar mudança visual
   └─> ESPECIFICACAO.md: apenas se validações visuais mudarem

5. CHECKPOINT - REGISTRAR SESSÃO (OBRIGATÓRIO)
   ├─> Seção "Refatorações Visuais" no CHECKPOINT
   ├─> Screenshots antes/depois
   ├─> Componentes criados/modificados
   ├─> Referência ao CICLO.md atualizado
   └─> Link para Protocolo Frontend aplicado
```

# ⚙️ BOAS PRÁTICAS GERAIS DE FRONT-END

- **SEMPRE** componentizar ao invés de criar código hard-coded direto
- Criar componentes genéricos e reutilizáveis em `src/components/ui/`
- Componentes específicos de domínio em `src/components/`
- Evitar código repetido - se algo aparece 2x, componentizar

**IMPORTANTE - Campos de Formulário:**

- ❌ NUNCA criar campos inline (CampoTexto, CampoData, etc) dentro de componentes
- ✅ SEMPRE usar componentes genéricos de `src/components/ui/`:
  - `FormField.tsx` - Container genérico com label
  - `Input.tsx` - Input de texto genérico
  - `DateInput.tsx` - Input de data genérico
  - `Checkbox.tsx` - Checkbox genérico
  - `Textarea.tsx` - Textarea genérico
- ✅ Componentes devem aceitar `className` para customização
- ✅ Props bem tipadas com TypeScript

## CUSTOM HOOKS

- **SEMPRE** criar custom hooks para lógica reutilizável
- Hooks para gerenciamento de estado complexo
- Hooks para side effects compartilhados
- Localização: `src/hooks/`
- Nomenclatura: `use[Nome].ts` (ex: `useFiltros.ts`, `useAlunos.ts`)

## ESTRUTURA DE COMPONENTES

- Componentes devem ser pequenos e com responsabilidade única
- Máximo de 200 linhas por componente
- Se ultrapassar, dividir em sub-componentes
- Props bem tipadas com TypeScript
- Componentes genéricos devem aceitar className para customização

## SEPARAÇÃO DE CONCERNS (CRÍTICO)

✅ **Hooks** = Lógica e estado
✅ **Componentes** = UI pura (recebem props)
✅ **Containers** = Composição (usam hooks + passam props)

**Exemplo:**

```tsx
// ✅ CORRETO
function FluxoCertificacao() {
  const hookData = useFiltrosCertificacao();
  return <FiltrosCertificacao {...hookData} />;
}

// ❌ ERRADO (não fazer)
function FiltrosCertificacao() {
  const hookData = useFiltrosCertificacao(); // lógica dentro da UI
  return <div>...</div>;
}
```

## BOAS PRÁTICAS

- DRY (Don't Repeat Yourself) - nunca repetir código
- Separação de concerns (UI vs Lógica vs Dados)
- Custom hooks para lógica compartilhada
- Componentes UI genéricos e reutilizáveis
- Código legível e bem organizado

---

# ⚙️ DECISÕES TÉCNICAS CRÍTICAS

## 1. PACKAGE MANAGER

**SEMPRE usar `pnpm` ao invés de `npm`**

```bash
# ✅ CORRETO
pnpm install
pnpm dev
pnpm test

# ❌ ERRADO
npm install
npm run dev
```

## 2. GESTÃO DE MIGRATIONS (CRÍTICO)

**IMPORTANTE:** Este projeto usa DOIS bancos de dados - principal e testes.

**⚠️ REGRA OBRIGATÓRIA: SEMPRE aplicar migrations em AMBOS os bancos com migrate:all**

**Comandos corretos a usar:**

```bash
# ✅ Aplicar migrations pendentes em AMBOS os bancos
pnpm migrate:all

# ✅ Criar nova migration e aplicar em AMBOS
pnpm migrate:all "nome_da_migration"

# ❌ NUNCA use apenas:
# prisma migrate dev    (só aplica no banco principal)
# prisma migrate deploy (só aplica no banco especificado)
```

**Script automatizado:**

- Localização: `scripts/migrate-all.sh`
- Aplica automaticamente em ambos os bancos
- Verifica status final de ambos

**Checklist obrigatório ao trabalhar com migrations:**

1. ✅ Sempre usar `pnpm migrate:all` ao criar novas migrations
2. ✅ Antes de rodar testes, verificar sincronização com `pnpm migrate:all`
3. ✅ NUNCA assumir que existe apenas um banco
4. ✅ NUNCA usar comandos Prisma diretos (use os scripts do package.json)

**Por que isso é crítico:**

- Testes rodam no banco `certificados_test`, não no principal
- Se migrations não forem aplicadas no banco de testes, os testes falham
- Erro comum: "column does not exist" nos testes mesmo existindo no banco principal

## LAYOUT

- **Página inicial:** Tudo integrado via abas (Tabs), não criar rotas separadas
- **Componentes:** Devem caber na tela (usar overflow se necessário)
- **Campos:** Lado a lado ao invés de um por linha (layout compacto)
- **Fontes:** Pequenas mas legíveis

---

# 📋 CONVENÇÕES DE NOMENCLATURA

## Componentes

- **PascalCase:** `FiltrosCertificacao.tsx`
- **Sufixos descritivos:** `ListaAlunosCertificacao`, `ButtonGroup`

## Hooks

- **camelCase com prefixo `use`:** `useFiltrosCertificacao.ts`
- **Nome descritivo do domínio**

## Tipos

- **PascalCase com sufixo:** `FiltrosState`, `AlunoProps`
- **Exportar do mesmo arquivo quando possível**

## Variáveis de Estado

- **Descritivas:** `anosDisponiveis`, `isLoadingTurmas`
- **Booleanos:** prefixo `is`, `has`, `should`

---

# 🔮 FUNCIONALIDADES FUTURAS

**IMPORTANTE:** Antes de implementar, sempre perguntar ao usuário sobre os passos a tomar.

# 🔧 COMANDOS E SCRIPTS ÚTEIS

## Desenvolvimento

```bash
# Iniciar servidor de desenvolvimento
pnpm dev

# Rodar testes
pnpm test              # Todos os testes
pnpm test:unit         # Apenas unitários
pnpm test:integration  # Apenas integração
pnpm test:watch        # Modo watch

# Linter e formatação
pnpm lint
pnpm format
```

## Banco de Dados

```bash
# Migrations (SEMPRE usar estes comandos)
pnpm migrate:all         # Aplicar pendentes em AMBOS os bancos

# Prisma Studio
pnpm prisma studio       # Visualizar banco principal
DATABASE_URL=$DATABASE_URL_TEST pnpm prisma studio  # Banco de testes

# Reset (CUIDADO!)
pnpm db:reset            # Reset do banco principal
```

## Scripts Customizados

```bash
# Scripts em scripts/
pnpx tsx scripts/reset-database.ts       # Reset completo do banco
pnpx tsx scripts/migrar-enturmacoes.ts   # Migrar enturmações antigas
pnpx tsx scripts/diagnosticar-dados.ts   # Analisar tamanhos de campos
pnpx tsx scripts/check-data.ts           # Verificar dados no banco
```

---

## Filosofia

- **Deduzir possibilidades e perguntar** para aperfeiçoar este arquivo
- **Componentizar sempre** (DRY, separação de concerns)
- **Testar sistematicamente** (unitário + integração)
- **Manter rastreabilidade** (origem dos dados, auditoria)

---

**Este guia é um documento vivo. Aperfeiçoe-o conforme o projeto evolui.**
