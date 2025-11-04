# GUIA DE FLUXO DE TRABALHO CIF

## QUANDO ESCREVER TESTES?

Este guia ajuda a decidir se você deve escrever testes **ANTES** ou **DEPOIS** do código.

---

## DIAGRAMA DE DECISÃO

```
┌─ A funcionalidade JÁ EXISTE e está em produção?
│
├─ SIM → TESTES OBRIGATÓRIOS ANTES DE MUDAR
│         ├─ Adicionar feature: Teste antes (TDD)
│         ├─ Corrigir bug: Teste de regressão antes
│         └─ Refatorar: Garantir testes existentes cobrem tudo
│
└─ NÃO → Funcionalidade NOVA
          │
          ├─ Você JÁ SABE exatamente como implementar?
          │   │
          │   ├─ SIM → TESTE ANTES (TDD clássico)
          │   │         └─ Ex: CRUD simples, validação conhecida
          │   │
          │   └─ NÃO → Ainda EXPLORANDO possibilidades?
          │             │
          │             ├─ SIM → EXPERIMENTAR PRIMEIRO
          │             │         ├─ Prototipar sem testes formais
          │             │         ├─ Iterar rapidamente
          │             │         └─ Testar DEPOIS quando estabilizar
          │             │
          │             └─ NÃO → Se não sabe e não está explorando...
          │                       └─ Volte 2 casas: defina o problema primeiro!
```

---

## CENÁRIO 1: FUNCIONALIDADE NOVA - EXPLORANDO

### Quando aplicar?

- ✅ Você não tem certeza da melhor abordagem técnica
- ✅ Precisa validar viabilidade (pode não funcionar)
- ✅ Design da UI/UX ainda está sendo definido
- ✅ Modelo de dados pode mudar drasticamente

### Estratégia: EXPERIMENTAÇÃO PRIMEIRO, TESTES DEPOIS

#### Fase 1: EXPLORAÇÃO (1-3 dias)

**O QUE FAZER:**
1. Criar protótipo funcional (sem testes formais)
2. Testar manualmente com dados reais
3. Iterar rapidamente no código
4. Conversar com stakeholders/usuários
5. Validar viabilidade técnica

**O QUE NÃO FAZER:**
- ❌ Escrever testes para código que pode ser descartado
- ❌ Documentar detalhadamente antes de estabilizar
- ❌ Refatorar excessivamente (ainda está mudando)
- ❌ Commit para produção (ainda é experimental)

**ENTREGÁVEIS:**
- Código funcional (mas não necessariamente limpo)
- Validação de conceito
- Aprendizados sobre o domínio

#### Fase 2: CONSOLIDAÇÃO (2-3 dias)

**Quando passar para esta fase:**
- ✅ Você diz: "Ok, essa abordagem funciona!"
- ✅ Não há mais mudanças drásticas na estrutura
- ✅ Você quer que isso vá para produção

**O QUE FAZER:**
1. Escrever `*_CONCEITO.md` (o que aprendeu)
2. Criar checklist em `*_ESPECIFICACAO.md` baseado no que funciona
3. Escrever testes para cobrir checklist
4. Refatorar código experimental se necessário
5. Marcar validações [x] conforme testes passam

**ENTREGÁVEIS:**
- Código limpo e testado
- Documentação completa
- Confiança para produção

### Exemplo Real: Validação de Histórico Escolar

**Contexto:** Você quer adicionar validação de que aluno não pode ter dependência não resolvida.

**Problema:** Não está claro como modelar "dependência" no banco de dados.

**Abordagem:**

```
DIA 1-2: EXPLORAÇÃO
├─ Criar componente de Histórico Escolar (sem testes)
├─ Experimentar diferentes estruturas de dados:
│   ├─ Opção A: Campo "dependencias" no modelo Aluno
│   ├─ Opção B: Tabela "Dependencia" separada
│   └─ Opção C: Calcular em tempo real baseado em notas
├─ Testar manualmente com dados de 10 alunos reais
└─ Decidir: "Opção C funciona melhor!"

DIA 3-4: CONSOLIDAÇÃO
├─ Escrever CONCEITO: "Dependências são calculadas em tempo real..."
├─ Criar checklist:
│   ├─ [ ] V4.1.1 Aluno com nota < 5 em componente → tem dependência
│   ├─ [ ] V4.1.2 Dependência resolvida se retomou e passou
│   └─ [ ] V4.1.3 Não pode emitir certificado com dependência pendente
├─ Escrever testes para V4.1.x
├─ Refatorar código experimental
└─ Marcar [x] conforme testes passam

DIA 5: PRODUÇÃO
└─ Deploy com confiança (está testado!)
```

---

## CENÁRIO 2: FUNCIONALIDADE NOVA - JÁ SEI COMO FAZER

### Quando aplicar?

- ✅ Você já fez algo parecido antes
- ✅ Requisitos estão claros e bem definidos
- ✅ Não há incerteza técnica significativa
- ✅ Exemplo: CRUD simples, validação de formato conhecido

### Estratégia: TDD CLÁSSICO (Teste Antes)

#### Ciclo Red-Green-Refactor

```
1. RED (Escrever teste que FALHA)
   ├─ Adicionar item ao checklist: [ ] V3.8.1 CPF deve ser único
   ├─ Escrever teste em `tests/integration/unique-cpf.test.ts`
   ├─ Rodar teste → deve FALHAR (ainda não implementado)
   └─ Confirmar que teste está correto

2. GREEN (Implementar código mínimo para PASSAR)
   ├─ Adicionar unique constraint no Prisma schema
   ├─ Rodar migração
   ├─ Adicionar validação na API
   ├─ Rodar teste → deve PASSAR
   └─ Não refatorar ainda!

3. REFACTOR (Melhorar código mantendo testes VERDES)
   ├─ Extrair função de validação
   ├─ Adicionar mensagem de erro amigável
   ├─ Rodar testes continuamente → devem PASSAR sempre
   └─ Marcar [x] no checklist

4. REPETIR para próxima validação
```

### Exemplo Real: Validação de CPF Único

```typescript
// 1. RED - Escrever teste que falha
describe('V3.8: Validação de CPF', () => {
  it('V3.8.1: should reject duplicate CPF', async () => {
    await prisma.aluno.create({
      data: { matricula: '123', cpf: '111.222.333-44' }
    });

    await expect(
      prisma.aluno.create({
        data: { matricula: '456', cpf: '111.222.333-44' }
      })
    ).rejects.toThrow('CPF já cadastrado');
  });
});

// Rodar: pnpm test → FALHA ❌ (ainda não tem validação)

// 2. GREEN - Implementar mínimo necessário
// prisma/schema.model
model Aluno {
  cpf String? @unique  // ← Adicionar unique
}

// src/app/api/alunos/route.ts
if (cpf) {
  const exists = await prisma.aluno.findUnique({ where: { cpf } });
  if (exists) throw new Error('CPF já cadastrado');
}

// Rodar: pnpm test → PASSA ✅

// 3. REFACTOR - Melhorar sem quebrar
// src/lib/validations.ts
export async function validateUniqueCPF(cpf: string) {
  const exists = await prisma.aluno.findUnique({ where: { cpf } });
  if (exists) {
    throw new ConflictError('CPF já cadastrado para outro aluno');
  }
}

// Rodar: pnpm test → ainda PASSA ✅

// 4. Marcar checklist
// ESPECIFICACAO.md
- [x] **V3.8.1** CPF deve ser único no banco
```

---

## CENÁRIO 3: FUNCIONALIDADE JÁ EXISTE - ADICIONAR TESTES RETROSPECTIVAMENTE

### Quando aplicar?

- ✅ Código legado sem testes
- ✅ Funcionalidade está estável e em produção
- ✅ Você quer refatorar mas precisa de segurança

### Estratégia: DOCUMENTAR COMPORTAMENTO ATUAL, DEPOIS TESTAR

#### Processo

```
1. ANALISAR (Ler código linha a linha)
   ├─ Identificar todas as validações que JÁ EXISTEM
   ├─ Identificar casos extremos tratados
   ├─ Identificar GAPS (validações faltando)
   └─ Entrega: Checklist completo

2. TESTAR COMPORTAMENTO ATUAL
   ├─ Escrever testes para validações existentes
   ├─ Testes devem PASSAR (confirmam comportamento atual)
   ├─ Se teste FALHA → código tem bug ou teste está errado
   └─ Entrega: Testes cobrindo comportamento atual

3. IDENTIFICAR E CORRIGIR GAPS CRÍTICOS
   ├─ Para gaps ❌ CRÍTICOS: adicionar validação + teste
   ├─ Para gaps ⚠️ não-críticos: documentar para depois
   └─ Entrega: Sistema mais robusto

4. DOCUMENTAR
   ├─ Escrever CONCEITO (o que o código faz)
   ├─ Escrever TÉCNICO (como está implementado)
   ├─ Iniciar CICLO (entrada: "Adição de testes retrospectivos")
   └─ Entrega: Documentação completa
```

### Exemplo Real: Painel de Migração (Este Projeto!)

**Situação:**
- ✅ Código implementado e funcionando
- ❌ Zero testes automatizados
- ❌ Risco: refatoração pode quebrar algo

**Processo:**

```
FASE 1: ANÁLISE (2-3h)
├─ Ler src/app/api/files/route.ts linha a linha
├─ Criar MIGRACAO_ESPECIFICACAO.md
├─ Listar validações existentes:
│   ├─ [x] V1.1.1 CSV não pode estar vazio
│   ├─ [x] V1.1.2 Headers obrigatórios (já implementado!)
│   ├─ [x] V2.2.1 Detectar duplicatas por hash
│   └─ ...
├─ Identificar GAPS:
│   ├─ [ ] ❌ V4.1.1 Transação completa (NÃO implementado)
│   └─ [ ] ⚠️ V7.2.1 Erros específicos (genéricos demais)
└─ Entrega: Checklist de 50+ validações

FASE 2: TESTES DE COMPORTAMENTO ATUAL (2-3 dias)
├─ Escrever tests/unit/lib/limpar-valor.test.ts
│   └─ Testa função que JÁ EXISTE e funciona
├─ Escrever tests/integration/api/files-upload.test.ts
│   └─ Testa upload que JÁ FUNCIONA em produção
├─ Rodar testes → devem PASSAR ✅
└─ Entrega: 30+ testes passando

FASE 3: CORRIGIR GAPS CRÍTICOS (1-2 dias)
├─ Implementar V4.1.1 (transação completa)
│   ├─ Escrever teste que FALHA sem transação
│   ├─ Implementar $transaction
│   └─ Teste PASSA ✅
├─ Implementar V7.2.1 (erros específicos)
└─ Entrega: Gaps críticos resolvidos

FASE 4: DOCUMENTAR (1 dia)
├─ Escrever MIGRACAO_CONCEITO.md
├─ Escrever MIGRACAO_TECNICO.md (já existe, revisar)
├─ Iniciar MIGRACAO_CICLO.md
└─ Entrega: Documentação completa
```

---

## CENÁRIO 4: REFATORAÇÃO DE CÓDIGO EXISTENTE

### Quando aplicar?

- ✅ Código funciona mas está desorganizado
- ✅ Quer melhorar performance, legibilidade, arquitetura
- ✅ NÃO quer mudar comportamento (apenas estrutura)

### Estratégia: TESTES GARANTEM QUE NADA QUEBRA

#### Regra de Ouro

> "Só refatore se tiver testes. Se não tem, crie antes."

#### Processo Seguro

```
PRÉ-REFATORAÇÃO (Garantir Segurança)
├─ 1. Testes existem e cobrem código a refatorar?
│    ├─ SIM → Prosseguir
│    └─ NÃO → Escrever testes ANTES (ver Cenário 3)
│
├─ 2. Rodar todos os testes
│    ├─ Todos PASSAM? → Prosseguir
│    └─ Algum FALHA? → Corrigir antes de refatorar
│
└─ 3. Verificar coverage
     ├─ >80% no código a refatorar? → Prosseguir
     └─ <80%? → Adicionar mais testes

DURANTE REFATORAÇÃO (Iteração Contínua)
├─ 1. Fazer pequena mudança (ex: renomear função)
├─ 2. Rodar testes
│    ├─ PASSAM? → Commit + próxima mudança
│    └─ FALHAM? → Reverter mudança
├─ 3. Repetir até refatoração completa
└─ NUNCA fazer múltiplas mudanças sem rodar testes

PÓS-REFATORAÇÃO (Validação)
├─ 1. Rodar TODOS os testes (não apenas unit)
├─ 2. Rodar testes E2E (comportamento de usuário)
├─ 3. Verificar que nenhum comportamento mudou
├─ 4. Atualizar TECNICO.md (nova estrutura)
└─ 5. Adicionar entrada no CICLO.md
```

### Exemplo Real: Refatorar Função `limparValor`

**Problema:** Função `limparValor` está duplicada em 3 lugares.

**Objetivo:** Extrair para `src/lib/csv-utils.ts` (DRY).

**Processo:**

```bash
# 1. PRÉ-REFATORAÇÃO: Garantir que tem testes
pnpm test tests/unit/lib/limpar-valor.test.ts
# ✅ 5 testes passando

# 2. Verificar coverage
pnpm test:coverage
# ✅ limparValor tem 100% coverage

# 3. REFATORAÇÃO: Mover função
# Antes:
# src/app/api/files/route.ts (linha 63-70)
# src/app/api/files/route.ts (linha 235-242) ← duplicata!

# Depois:
# src/lib/csv-utils.ts ← único lugar

# 4. Atualizar imports
# src/app/api/files/route.ts
import { limparValor } from '@/lib/csv-utils';

# 5. Rodar testes IMEDIATAMENTE
pnpm test
# ✅ Todos passando

# 6. Commit
git add .
git commit -m "refactor: extract limparValor to csv-utils (DRY)"

# 7. Atualizar TECNICO.md
# Documentar que função está em src/lib/csv-utils.ts

# 8. Atualizar CICLO.md
# "2025-02-10: Refatoração DRY de limparValor, sem mudança de comportamento"
```

---

## CENÁRIO 5: CORRIGIR BUG EM PRODUÇÃO

### Quando aplicar?

- ✅ Comportamento incorreto reportado
- ✅ Funcionalidade já existe e está testada
- ✅ Urgência: precisa corrigir rápido

### Estratégia: TESTE DE REGRESSÃO ANTES DE CORRIGIR

#### Processo

```
1. REPRODUZIR BUG (Escrever teste que FALHA)
   ├─ Criar teste que expõe o bug
   ├─ Rodar teste → deve FALHAR ❌ (confirma bug)
   └─ Commit teste falhando (prova que bug existe)

2. CORRIGIR BUG
   ├─ Fazer correção mínima necessária
   ├─ Rodar teste → deve PASSAR ✅
   └─ Rodar TODOS os testes (garantir que não quebrou nada)

3. DOCUMENTAR
   ├─ Adicionar validação ao checklist (se não existia)
   ├─ Adicionar entrada no CICLO.md (bug + correção)
   └─ Atualizar TECNICO.md (se correção mudou arquitetura)

4. DEPLOY E VERIFICAR
```

### Exemplo Real: Bug de Fonte Ausente

**Bug reportado:** "Alunos com `fonteAusente=true` não mostram aviso na UI."

**Processo:**

```typescript
// 1. REPRODUZIR (Teste que FALHA)
it('should show warning for fonte ausente', async () => {
  const aluno = await prisma.aluno.create({
    data: {
      matricula: '123',
      fonteAusente: true
    }
  });

  const response = await fetch(`/api/alunos/${aluno.id}`);
  const data = await response.json();

  expect(data.avisoFonteAusente).toBe(true); // ❌ FALHA (não retorna)
});

// 2. CORRIGIR
// src/app/api/alunos/[id]/route.ts
export async function GET(req, { params }) {
  const aluno = await prisma.aluno.findUnique({
    where: { id: params.id }
  });

  return NextResponse.json({
    ...aluno,
    avisoFonteAusente: aluno.fonteAusente  // ← Adicionar
  });
}

// Rodar teste → ✅ PASSA

// 3. DOCUMENTAR
// MIGRACAO_CICLO.md
### 2025-02-10: Bug: Aviso de Fonte Ausente não aparecia
**Problema:** API não retornava flag `avisoFonteAusente`
**Solução:** Adicionar campo no response do endpoint GET /api/alunos/[id]
**Teste:** tests/integration/api/alunos-fonte-ausente.test.ts
**Commit:** abc123

// 4. DEPLOY
git add .
git commit -m "fix: show avisoFonteAusente in alunos API"
git push
```

---

## RESUMO DAS ESTRATÉGIAS

| Cenário | Quando | Estratégia | Teste Antes ou Depois? |
|---------|--------|------------|------------------------|
| Funcionalidade nova (explorando) | Não sabe como fazer | Experimentar primeiro | **DEPOIS** |
| Funcionalidade nova (sei como fazer) | Requisitos claros | TDD clássico | **ANTES** |
| Código legado sem testes | Já existe em produção | Documentar comportamento | **DEPOIS** (retrospectivo) |
| Refatoração | Melhorar código existente | Testes garantem segurança | **ANTES** (pré-requisito) |
| Correção de bug | Comportamento incorreto | Teste de regressão | **ANTES** (reproduzir bug) |

---

## ANTI-PADRÕES (O QUE NÃO FAZER)

### ❌ Escrever teste depois de deploy

**Problema:** Se quebrou em produção, teste chegou tarde.

**Solução:** Teste deve ser escrito ANTES de código ir para produção.

---

### ❌ Testar implementação (em vez de comportamento)

```typescript
// ❌ ERRADO (teste de implementação)
it('should call prisma.create with correct params', () => {
  expect(prisma.create).toHaveBeenCalledWith({ data: {...} });
});

// ✅ CERTO (teste de comportamento)
it('should create aluno in database', async () => {
  const aluno = await createAluno({ matricula: '123' });
  const found = await prisma.aluno.findUnique({ where: { matricula: '123' } });
  expect(found).toBeDefined();
});
```

**Problema:** Teste de implementação quebra quando você refatora (mesmo que comportamento não mude).

---

### ❌ Marcar checklist [x] sem rodar teste

**Problema:** Checklist mente sobre estado real.

**Solução:** Apenas marcar [x] após rodar `pnpm test` e ver ✅ PASS.

---

### ❌ TDD estrito em código experimental

**Problema:** Escrever 50 testes para código que será descartado = desperdício.

**Solução:** Experimentar livremente, testar DEPOIS quando estabilizar.

---

## DICAS PRÁTICAS

### 1. Comece Pequeno

Não tente testar tudo de uma vez. Priorize:
1. Funções críticas (processamento de dados, validações)
2. Bugs recorrentes (escreva teste de regressão)
3. Código que muda frequentemente (precisa de segurança)

### 2. Use Coverage como Guia (Não como Meta)

- ✅ 80% coverage em código crítico = bom
- ❌ 100% coverage forçado = testes inúteis

Priorize **qualidade** dos testes, não quantidade.

### 3. Teste o Comportamento, Não a Implementação

Pergunte: "Se eu refatorar, esse teste ainda deve passar?"
- SIM → teste de comportamento ✅
- NÃO → teste de implementação ❌ (evitar)

### 4. Testes Devem Ser Rápidos

- Testes unitários: < 100ms cada
- Testes de integração: < 1s cada
- Testes E2E: < 10s cada

Se está lento, otimize ou use mocks.

### 5. Um Teste, Uma Responsabilidade

```typescript
// ❌ ERRADO (testa múltiplas coisas)
it('should create aluno and enturmacao and send email', () => {
  // ... 50 linhas
});

// ✅ CERTO (1 teste, 1 coisa)
it('should create aluno', () => { ... });
it('should create enturmacao', () => { ... });
it('should send email notification', () => { ... });
```

---

## RECURSOS

- [Metodologia CIF](./METODOLOGIA_CIF.md) - Visão geral completa
- [Templates](./templates/) - Arquivos vazios para copiar
- [Exemplo: Painel de Migração](./ciclos/) - Caso real aplicado

---

**Dúvidas?** Consulte o [diagrama de decisão](#diagrama-de-decisão) no início deste documento.
