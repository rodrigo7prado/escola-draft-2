# Reformulação da Documentação do Projeto

## CONTEXTO DA REFORMULAÇÃO

Este documento orienta a migração completa da estrutura de documentação do projeto de uma metodologia baseada em DRY/Checkpoints para uma abordagem simplificada baseada em Glossário + Fluxos + Decisões Técnicas.

### Por que esta reformulação?

**Problemas identificados na estrutura anterior:**
1. **Checkpoints são voláteis:** Cada refatoração exige novos checkpoints, criando lixo documental
2. **DRY muito burocrático:** Prefixos `[DRY.*]`, `[FEAT:*_TEC*]`, `TEC*` criam fricção na escrita
3. **Glossário desconectado:** Termos definidos em arquivo separado, mas sem integração clara com documentação técnica
4. **Codex se perde em refatorações:** Contexto fragmentado entre múltiplos arquivos com formatação complexa

**O que funcionou bem e será preservado:**
- ✅ Separação Claude (documentação) / Codex (implementação)
- ✅ Conceito de sessões incrementais de trabalho
- ✅ Glossário como fonte de verdade para termos de domínio
- ✅ Rastreabilidade entre documentação e código

### Nova Abordagem

**Princípios:**
1. **Escrita fluida:** Markdown natural, sem prefixos ou tags especiais
2. **Glossário como SSOT:** Termos definidos em `.ai/glossario/*.md` são referenciados via crases: `Termo`
3. **Sem checkpoints:** FLUXO.md descreve "o quê", TECNICO.md descreve "como foi feito"
4. **Prosa natural:** Foco no conteúdo, não na estrutura

**Formato de Termos:**
- Na documentação, termos do glossário são escritos entre crases: `Aluno Concluinte`, `Turma (Modo Abreviado)`
- Isso torna visualmente claro que o termo tem definição específica no glossário
- Exemplo: "A lista deve exibir `Alunos Concluintes` e `Alunos Elegíveis para Emissão de Documentos`"

---

## IMPORTANTE: REGRAS PARA O CODEX

### O que NÃO fazer:
- ❌ **NUNCA** modificar, mover ou deletar nada em `docs_deprecated/`
- ❌ **NUNCA** criar estrutura `docs/dry/`
- ❌ **NUNCA** usar prefixos `[DRY.*]`, `[FEAT:*]`, `CP1.2.3`
- ❌ **NUNCA** criar arquivos `CHECKPOINT.md`

### O que fazer:
- ✅ Trabalhar apenas na pasta `docs/` (nova estrutura)
- ✅ Usar `docs_deprecated/` apenas como **referência de leitura**
- ✅ Ao migrar conteúdo, **adaptar** para novo formato (não copiar/colar)
- ✅ Usar `Termos` entre crases quando referenciar glossário
- ✅ Escrever em prosa natural e objetiva

---

## ESTRUTURA FINAL ESPERADA

```
docs/
├── IDD.md                    # Metodologia reformulada (sem checkpoints)
├── REFORMULACAO.md          # Este arquivo (contexto da migração)
├── features/
│   ├── pagina-emissao-documentos/
│   │   ├── FLUXO.md         # Fluxos usuário + mecanismos internos
│   │   └── TECNICO.md       # Decisões técnicas de implementação
│   ├── importacao-por-colagem/
│   │   ├── FLUXO.md
│   │   └── TECNICO.md
│   ├── sistema-fases-gestao-alunos/
│   │   ├── FLUXO.md
│   │   └── TECNICO.md
│   ├── importacao-ficha-individual-historico/
│   │   ├── FLUXO.md
│   │   └── TECNICO.md
│   └── emissao-documentos/
│       ├── FLUXO.md
│       └── TECNICO.md
├── structures/
│   └── [estruturas compartilhadas, se aplicável]
└── templates/
    ├── FLUXO.md             # Template para novas features
    └── TECNICO.md           # Template para decisões técnicas
```

---

## FASE 1: ESTRUTURA BASE E TEMPLATES

### 1.1 Criar Estrutura de Pastas

Criar toda a estrutura de pastas necessária:

```bash
docs/
docs/features/
docs/features/pagina-emissao-documentos/
docs/features/importacao-por-colagem/
docs/features/sistema-fases-gestao-alunos/
docs/features/importacao-ficha-individual-historico/
docs/features/emissao-documentos/
docs/structures/
docs/templates/
```

### 1.2 Criar Template: docs/templates/FLUXO.md

```markdown
# Fluxos - [Nome da Feature]

## Visão Geral

[Descrição breve da feature em 1-2 parágrafos, usando `Termos` do glossário quando aplicável]

---

## F1. [Nome do Fluxo Principal]

[Descrição do fluxo em prosa natural, focando na perspectiva do usuário]

### Mecanismo Interno

[Como o sistema processa internamente este fluxo - estruturas de dados, transformações, validações]

---

## F2. [Nome do Segundo Fluxo]

[Descrição do segundo fluxo...]

### Mecanismo Interno

[Detalhes técnicos do segundo fluxo...]

---

## Observações

[Qualquer observação adicional relevante sobre os fluxos]
```

**Instruções para uso:**
- Numerar fluxos de forma simples: F1, F2, F3...
- Usar `Termos` entre crases para referenciar glossário
- Escrever em prosa natural, evitando listas excessivas
- Focar no "o quê" e "por quê", não no "como" (isso vai no TECNICO.md)

### 1.3 Criar Template: docs/templates/TECNICO.md

```markdown
# Decisões Técnicas - [Nome da Feature]

*Este arquivo é criado e mantido pelo Codex durante a implementação.*

---

## [Nome da Decisão/Requisito 1]

[Descrição clara da decisão técnica ou requisito implementado]

**Motivação:**
[Por que esta abordagem foi escolhida - contexto de negócio, limitações técnicas, trade-offs]

**Implementação:**
- `arquivo.tsx:123` - Descrição breve do que está implementado nesta linha/seção
- `outro-arquivo.ts:45` - Descrição breve

**Termos relacionados:**
- `Termo do Glossário` - [link relativo para glossário](../../../.ai/glossario/arquivo.md#termo-do-glossario)

**Alternativas consideradas:**
- ❌ Alternativa A: Por que não foi escolhida
- ❌ Alternativa B: Por que não foi escolhida
- ✅ Solução implementada: Por que foi a melhor opção

---

## [Nome da Decisão/Requisito 2]

[...]
```

**Instruções para uso:**
- Criar uma seção para cada decisão técnica não-óbvia
- Incluir referências específicas ao código (arquivo:linha)
- Justificar escolhas técnicas (principalmente quando há alternativas)
- Usar `Termos` entre crases para referenciar glossário
- Não criar seções para código autoexplicativo ou convenções padrão

---

## FASE 2: REESCREVER DOCUMENTAÇÃO CORE

### 2.1 Reescrever docs/IDD.md

**Referência:** `docs_deprecated/IDD.md` (LER para entender estrutura, NÃO copiar)

**Objetivo:** Documentar a metodologia IDD reformulada, sem checkpoints.

**Conteúdo esperado:**

```markdown
# IDD - Incremental Documentation Development (Reformulado)

## Visão Geral

[Explicar o conceito de desenvolvimento incremental orientado por documentação]

## Glossário como Fonte Única de Verdade

Todos os termos de domínio são definidos em `.ai/glossario/*.md`:
- `glossario/principal.md` - Termos core do negócio
- `glossario/campo-de-pesquisa.md` - Padrões de UI específicos
- [outros conforme necessário]

**Convenção de uso:**
- Termos do glossário são escritos entre crases na documentação: `Aluno Concluinte`
- Isso indica que o termo tem definição específica no glossário
- Links podem ser criados para navegação: [Aluno Concluinte](../.ai/glossario/principal.md#alunos-concluintes)

## Separação de Responsabilidades

### Claude (Agente de Documentação)

**Foco:** Gestão de `docs/` e `.ai/glossario/*`

**Responsabilidades:**
1. Criar/atualizar FLUXO.md de features
2. Manter glossário atualizado com termos de domínio
3. Garantir consistência entre fluxos e glossário

**Produto entregue ao Codex:**
- FLUXO.md completo e claro
- Glossário atualizado com todos os `Termos` usados

### Codex (Agente de Implementação)

**Foco:** Código-fonte, testes e decisões técnicas

**Responsabilidades:**
1. Implementar features baseado em FLUXO.md
2. Criar/atualizar TECNICO.md com decisões reais de implementação
3. Usar `Termos` do glossário no código quando apropriado (via comentários)
4. Escrever testes

**Produto gerado:**
- Código implementado
- TECNICO.md documentando decisões técnicas
- Testes

## Estrutura de Documentação por Feature

Cada feature possui:
- **FLUXO.md** - O que a feature faz (perspectiva usuário + mecanismos internos)
- **TECNICO.md** - Como foi implementada (decisões técnicas reais)

## Workflow de Desenvolvimento

### Fase 1: Documentação (Claude)
1. Usuário solicita nova feature ou melhoria
2. Claude cria/atualiza FLUXO.md
3. Claude atualiza glossário se novos `Termos` aparecem
4. Claude entrega FLUXO.md ao Codex

### Fase 2: Implementação (Codex)
1. Codex lê FLUXO.md + glossário
2. Codex implementa código
3. Codex cria/atualiza TECNICO.md com decisões tomadas
4. Codex reporta conclusão ao Claude

### Fase 3: Iteração
- Refatorações seguem mesmo fluxo
- FLUXO.md é atualizado se comportamento muda
- TECNICO.md é atualizado com novas decisões
- Glossário é atualizado se termos mudam

## Formato dos Arquivos

[Incluir exemplos dos templates FLUXO.md e TECNICO.md aqui]

## Quando Criar Entradas em TECNICO.md

**SIM - Criar entrada para:**
- Escolhas arquiteturais (padrões, bibliotecas, estruturas)
- Trade-offs significativos (performance vs legibilidade, etc)
- Soluções não-óbvias para problemas complexos
- Decisões que precisarão ser explicadas no futuro

**NÃO - Não criar para:**
- Convenções padrão da linguagem/framework
- Código autoexplicativo
- Decisões triviais ou óbvias

## Rastreabilidade

- FLUXO.md → define comportamento esperado com `Termos`
- Glossário → define `Termos` de forma única
- TECNICO.md → documenta implementação real com referências a código
- Código → implementação concreta, com comentários quando necessário

## Diferenças da Metodologia Anterior

**Removido:**
- ❌ Checkpoints (CP1.2.3)
- ❌ Estrutura docs/dry/
- ❌ Prefixos [DRY.*], [FEAT:*_TEC*]
- ❌ MAPEAMENTO.md por feature

**Simplificado:**
- ✅ Apenas FLUXO.md + TECNICO.md por feature
- ✅ Termos em crases: `Termo`
- ✅ Prosa natural sem formatação excessiva

**Preservado:**
- ✅ Separação Claude/Codex
- ✅ Glossário como SSOT
- ✅ Desenvolvimento incremental em sessões
- ✅ Rastreabilidade documentação ↔ código
```

**Instruções:**
- Use o conteúdo acima como base
- Adapte/expanda conforme necessário
- Mantenha tom direto e objetivo
- Use exemplos práticos

---

## FASE 3: MIGRAÇÃO DAS FEATURES

### 3.1 Feature: pagina-emissao-documentos

**Referência em docs_deprecated:**
- `docs_deprecated/features/pagina-emissao-documentos/FLUXO.md`
- `docs_deprecated/features/pagina-emissao-documentos/TECNICO.md`
- `docs_deprecated/features/pagina-emissao-documentos/CHECKPOINT.md`

**Código implementado:**
- `src/app/emissao-documentos/page.tsx`
- `src/app/api/alunos-concluintes/route.ts` (se existir)

#### 3.1.1 Criar docs/features/pagina-emissao-documentos/FLUXO.md

**Instruções:**
1. LER `docs_deprecated/features/pagina-emissao-documentos/FLUXO.md`
2. LER `docs_deprecated/features/pagina-emissao-documentos/CHECKPOINT.md` para entender escopo completo
3. Reescrever em formato novo:
   - Usar template de FLUXO.md
   - Consolidar informações dos arquivos antigos
   - Adicionar `Termos` em crases (ex: `Alunos Concluintes`, `Turma (Modo Abreviado)`)
   - Descrever fluxos de forma clara e objetiva
   - Incluir mecanismos internos quando relevante

**Exemplo de estrutura esperada:**

```markdown
# Fluxos - Página de Emissão de Documentos

## Visão Geral

A `Página de Emissão de Documentos` permite emissão em lote de documentos para múltiplos alunos selecionados. Os alunos são divididos em duas categorias: `Alunos Concluintes` (aprovados) e `Alunos Elegíveis para Emissão de Documentos` (pendentes, não cancelados).

---

## F1. Buscar e Filtrar Alunos

Usuário acessa a página e visualiza duas listas laterais organizadas:
- `Alunos Concluintes` - alunos aprovados na última série
- `Alunos Elegíveis para Emissão de Documentos` - alunos pendentes (não aprovados, não cancelados)

O sistema oferece:
- Campo de busca com suporte a coringa (*) para nome ou matrícula
- Filtros por modalidade (ex: "Ensino Médio Regular")
- Filtros por turma em `Modo Abreviado` com `Ordenação Numérica`

### Mecanismo Interno

- Dados vêm do endpoint `/api/alunos-concluintes`
- Filtro de `Alunos Concluintes`: `situacaoFinal = "APROVADO"` na última série
- Filtro de pendentes: última série + não aprovados + não cancelados
- Busca com coringa converte `*` para regex case-insensitive
- Turmas são abreviadas (ex: "IFB-3003-18981" → "IFB-3003")
- Ordenação numérica inteligente: IFB-2 < IFB-10 < IFB-100

---

## F2. Selecionar Alunos para Emissão

Usuário marca checkboxes dos alunos desejados na lista lateral. O sistema mantém seleção ativa mesmo quando filtros são alterados.

### Mecanismo Interno

- Estado de seleção gerenciado via `Set<string>` de IDs
- Seleção persiste durante mudanças de filtro (modalidade/turma)
- Validação: apenas IDs existentes são mantidos no Set

---

## F3. Emitir Documentos (Planejado)

[Este fluxo ainda será implementado]

Usuário escolhe tipo de documento (Certificado, Histórico, Declaração) e confirma emissão para alunos selecionados.
```

#### 3.1.2 Criar docs/features/pagina-emissao-documentos/TECNICO.md

**Instruções:**
1. LER `docs_deprecated/features/pagina-emissao-documentos/TECNICO.md`
2. LER código implementado em `src/app/emissao-documentos/page.tsx`
3. Criar arquivo TECNICO.md seguindo template
4. Documentar decisões técnicas reais encontradas no código

**Exemplo de estrutura esperada:**

```markdown
# Decisões Técnicas - Página de Emissão de Documentos

*Criado por Codex durante implementação*

---

## Estrutura de UI Ultra-Compacta

A interface foi implementada com estilo ultra-compacto para maximizar densidade de informação em tela.

**Motivação:**
Usuários precisam visualizar muitos alunos simultaneamente para fazer seleções em lote eficientes.

**Implementação:**
- `page.tsx:260-420` - Layout flex com sidebar fixa de 320px + área principal responsiva
- `page.tsx:250-256` - Linhas de aluno com text-[11px] e padding mínimo (py-1 px-2)
- Checkbox customizado do componente `@/components/ui/Checkbox`

**Termos relacionados:**
- `Alunos Concluintes` - [principal.md](../../../.ai/glossario/principal.md#alunos-concluintes)

---

## Filtro de Turmas com Modo Abreviado e Ordenação Numérica

Turmas são exibidas de forma compacta e ordenadas numericamente para facilitar navegação.

**Motivação:**
Turmas no banco têm formato completo "SÉRIE-TURNO-ID" (ex: "IFB-3003-18981") que é muito verboso para UI. Ordenação alfabética produziria ordem incorreta: IFB-10, IFB-100, IFB-2.

**Implementação:**
- `page.tsx:430-437` - `abreviarTurma()` remove tudo após segundo hífen
- `page.tsx:439-470` - `compararTurmasNumericamente()` segmenta partes alfanuméricas e compara números como Number, strings como localeCompare
- `page.tsx:501-503` - `segmentarTurma()` usa regex `/(\d+)/g` para separar partes
- `page.tsx:131-144` - Turmas disponíveis calculadas via useMemo e ordenadas

**Termos relacionados:**
- `Turma (Modo Abreviado)` - [principal.md](../../../.ai/glossario/principal.md#turma-modo-abreviado)
- `Turmas Ordenadas Numericamente` - [principal.md](../../../.ai/glossario/principal.md#turmas-ordenadas-numericamente)

**Alternativas consideradas:**
- ❌ Ordenação alfabética simples: Produziria IFB-10, IFB-100, IFB-2
- ❌ Exibir nome completo da turma: Muito verboso, quebra layout compacto
- ✅ Abreviação + ordenação numérica: Compacto e intuitivo

---

## Busca com Coringa

Campo de pesquisa suporta wildcards (*) para buscas flexíveis.

**Motivação:**
Usuário pode não saber nome completo ou deseja buscar padrões (ex: "Mar*Silva" encontra "Maria Silva", "Marcos Silva").

**Implementação:**
- `page.tsx:473-481` - `criarRegexCoringa()` converte `*` em `.*` para regex
- `page.tsx:483-490` - `correspondeBusca()` testa regex case-insensitive
- `page.tsx:95-98` - Regex criada via useMemo para performance
- `page.tsx:209-214` - Dropdown de sugestões limitado a 8 itens (TOTAL_SUGESTOES)

**Alternativas consideradas:**
- ❌ Busca exata (substring): Menos flexível
- ❌ Fuzzy search (Levenshtein): Mais complexo, overhead desnecessário
- ✅ Coringa com regex: Simples, familiar aos usuários, performance adequada

---

## Categorização de Alunos (Concluintes vs Pendentes)

Sistema distingue `Alunos Concluintes` de `Alunos Elegíveis para Emissão de Documentos`.

**Motivação:**
Documentos têm regras diferentes dependendo da situação do aluno. Concluintes recebem certificados completos, pendentes podem receber declarações parciais.

**Implementação:**
- `page.tsx:29-30` - Estados separados: `concluintes` e `pendentes`
- `page.tsx:40-92` - Fetch de `/api/alunos-concluintes` retorna ambas listas
- `page.tsx:193-207` - Filtragem separada após aplicação de filtros de modalidade/turma
- `page.tsx:313-351` - Renderização em seções distintas na sidebar

**Termos relacionados:**
- `Alunos Concluintes` - [principal.md](../../../.ai/glossario/principal.md#alunos-concluintes)
- `Alunos Elegíveis para Emissão de Documentos` - [principal.md](../../../.ai/glossario/principal.md#alunos-elegiveis-para-emissao-de-documentos)

---

## Gestão de Estado de Seleção

Checkboxes mantêm seleção durante mudanças de filtro.

**Motivação:**
Usuário pode filtrar por turmas diferentes para revisar seleção, mas não deve perder alunos já selecionados.

**Implementação:**
- `page.tsx:36` - Estado `selecionados` como `Set<string>` (IDs dos alunos)
- `page.tsx:216-226` - `toggleAluno()` adiciona/remove do Set imutavelmente
- `page.tsx:177-191` - useEffect limpa seleções de IDs que não existem mais (alunos removidos)
- `page.tsx:236-237` - Checkbox recebe `isSelected = selecionados.has(aluno.id)`

**Alternativas consideradas:**
- ❌ Array de IDs: Menos performático para verificação de existência
- ❌ Limpar seleção ao trocar filtro: UX ruim, usuário perde trabalho
- ✅ Set com limpeza de IDs inválidos: Performance + UX adequado
```

---

### 3.2 Feature: importacao-por-colagem

**Referência em docs_deprecated:**
- `docs_deprecated/features/importacao-por-colagem/FLUXO.md`
- `docs_deprecated/features/importacao-por-colagem/TECNICO.md`
- `docs_deprecated/features/importacao-por-colagem/CHECKPOINT.md`

#### 3.2.1 Criar docs/features/importacao-por-colagem/FLUXO.md

**Instruções:**
1. LER arquivos de referência em `docs_deprecated`
2. Reescrever seguindo template de FLUXO.md
3. Consolidar informações de FLUXO + CHECKPOINT + TECNICO antigos
4. Usar `Termos` do glossário quando aplicável
5. Escrever em prosa natural, focando em "o quê" e "por quê"

#### 3.2.2 Criar docs/features/importacao-por-colagem/TECNICO.md

**Instruções:**
1. LER código implementado relacionado a esta feature
2. Identificar decisões técnicas não-óbvias
3. Documentar seguindo template de TECNICO.md
4. Incluir referências específicas ao código (arquivo:linha)
5. Justificar escolhas quando houver alternativas

---

### 3.3 Feature: sistema-fases-gestao-alunos

**Referência em docs_deprecated:**
- `docs_deprecated/features/sistema-fases-gestao-alunos/FLUXO.md`
- `docs_deprecated/features/sistema-fases-gestao-alunos/CHECKPOINT.md`

#### 3.3.1 Criar docs/features/sistema-fases-gestao-alunos/FLUXO.md

**Instruções:**
1. LER arquivos de referência
2. Reescrever seguindo template
3. Usar `Termos` do glossário
4. Descrever sistema de fases de forma clara

#### 3.3.2 Criar docs/features/sistema-fases-gestao-alunos/TECNICO.md

**Instruções:**
1. LER código implementado
2. Documentar decisões técnicas reais
3. Seguir template de TECNICO.md

---

### 3.4 Feature: importacao-ficha-individual-historico

**Referência em docs_deprecated:**
- `docs_deprecated/features/importacao-ficha-individual-historico/FLUXO.md`
- `docs_deprecated/features/importacao-ficha-individual-historico/CHECKPOINT.md`

#### 3.4.1 Criar docs/features/importacao-ficha-individual-historico/FLUXO.md

**Instruções:**
1. LER arquivos de referência
2. Reescrever seguindo template
3. Usar `Termos` do glossário

#### 3.4.2 Criar docs/features/importacao-ficha-individual-historico/TECNICO.md

**Instruções:**
1. LER código implementado
2. Documentar decisões técnicas
3. Seguir template

---

### 3.5 Feature: emissao-documentos

**Referência em docs_deprecated:**
- `docs_deprecated/features/emissao-documentos/PRE-FLUXO.md` ou `FLUXO.md`
- `docs_deprecated/features/emissao-documentos/TECNICO.md`
- `docs_deprecated/features/emissao-documentos/CHECKPOINT.md`

#### 3.5.1 Criar docs/features/emissao-documentos/FLUXO.md

**Instruções:**
1. LER arquivos de referência (incluir PRE-FLUXO.md se existir)
2. Reescrever seguindo template
3. Usar `Termos` do glossário

#### 3.5.2 Criar docs/features/emissao-documentos/TECNICO.md

**Instruções:**
1. LER código implementado
2. Documentar decisões técnicas
3. Seguir template

---

## FASE 4: ESTRUTURAS COMPARTILHADAS

### 4.1 Avaliar docs_deprecated/structures/

**Instruções:**
1. LER `docs_deprecated/structures/structures.md`
2. Avaliar se conteúdo ainda é relevante
3. Decidir:
   - Se irrelevante: não migrar
   - Se relevante e específico de domínio: incorporar ao glossário `.ai/glossario/`
   - Se relevante e técnico: criar `docs/structures/` e migrar adaptando formato

**Não criar estrutura `docs/structures/` se não houver conteúdo relevante a migrar.**

---

## FASE 5: ATUALIZAÇÃO DE ARQUIVOS DE CONFIGURAÇÃO

### 5.1 Atualizar CLAUDE.md

**Arquivo:** `/home/rmprado/projetos/next/escola-draft-2/CLAUDE.md`

**Mudanças necessárias:**

1. **Remover seção sobre docs/dry:**
```markdown
- **Documentação DRY:**
  - Criação e manutenção de toda estrutura em `docs/dry/`
  - Validação de documentação (scripts validate-dry, validate-tec, validate-summary-dry)
  - Gestão do `docs/dry/summary.md` e arquivos relacionados
```

2. **Remover referência a CHECKPOINT.md:**
```markdown
- **Documentação de Features:**
  - `FLUXO.md` - Fluxos de uso (perspectiva do usuário) e mecanismos internos
  - `CHECKPOINT.md` - Estados de sessão, checkpoints para orientar implementações
  - `TECNICO.md` - Ocasionalmente, quando relacionado a decisões arquiteturais documentais (embora seja mais responsabilidade do Codex)
```

3. **Substituir por:**
```markdown
- **Documentação de Features:**
  - `FLUXO.md` - Fluxos de uso (perspectiva do usuário) e mecanismos internos
  - Manutenção do glossário `.ai/glossario/*` com `Termos` de domínio
```

4. **Atualizar Workflow do Claude:**
```markdown
### Workflow do Claude:
1. Recebe solicitação de documentação de feature/conceito
2. Cria/atualiza FLUXO.md usando `Termos` do glossário em crases
3. Atualiza glossário `.ai/glossario/*` se novos termos aparecem
4. Entrega FLUXO.md ao Codex para implementação
```

5. **Atualizar seção COMUNICAÇÃO E COLABORAÇÃO item 5:**
```markdown
5. **Sempre usar `Termos` do glossário**, seguindo as práticas documentadas em /docs/IDD.md
```

6. **Atualizar protocolo de início de sessão:**
```markdown
# ⚠️ PROTOCOLO OBRIGATÓRIO DE INÍCIO DE SESSÃO ⚠️

**ANTES de responder a PRIMEIRA mensagem do usuário em QUALQUER sessão, você DEVE executar a leitura de `docs/IDD.md`**

**NÃO pule esta etapa. NÃO assuma que já leu. SEMPRE leia no início de CADA sessão nova.**
```

---

### 5.2 Atualizar AGENTS.md

**Arquivo:** `/home/rmprado/projetos/next/escola-draft-2/AGENTS.md`

**Mudanças necessárias:**

1. **Remover seção sobre DRY:**
```markdown
## METODOLOGIA DE DESENVOLVIMENTO

**DRY - Don't Repeat Yourself**
- Use o /docs/dry/* para referenciações DRY documentadas.
```

2. **Substituir por:**
```markdown
## METODOLOGIA DE DESENVOLVIMENTO

**Glossário como SSOT (Single Source of Truth)**
- Todos os `Termos` de domínio são definidos em `.ai/glossario/*.md`
- Use `Termos` entre crases na documentação para referenciar glossário
- Consulte `docs/IDD.md` para entender a metodologia completa
```

3. **Atualizar Workflow do Codex:**
```markdown
### Workflow do Codex:
1. Recebe FLUXO.md do Claude
2. Consulta glossário `.ai/glossario/*` para entender `Termos` usados
3. Implementa features baseado em FLUXO.md
4. Cria/atualiza TECNICO.md com decisões de implementação real
5. Usa `Termos` do glossário quando apropriado (via comentários ou código)
6. Reporta ao Claude para validação documental
```

4. **Remover seção problemática:**
```markdown
### Refatorações com base em TECNICO.md
Sempre que for pedida uma refatoração baseada em TECNICO.md:
1. Reanalise todo o conjunto
2. Refatore apenas as diferenças
3. Não escreva nada mais em TECNICO.md.
```

5. **Substituir por:**
```markdown
### Refatorações
Em refatorações:
1. Ler FLUXO.md + TECNICO.md da feature
2. Consultar glossário para `Termos` usados
3. Implementar mudanças solicitadas
4. Atualizar TECNICO.md com novas decisões (se houver)
```

6. **Atualizar Atribuições Específicas do Codex:**
```markdown
- **Documentação Técnica:**
  - `TECNICO.md` - Documenta decisões de implementação real
  - Usar `Termos` do glossário quando apropriado
  - Manter rastreabilidade código ↔ documentação técnica via referências (arquivo:linha)
```

---

### 5.3 Atualizar .ai/CORE.md

**Arquivo:** `/home/rmprado/projetos/next/escola-draft-2/.ai/CORE.md`

**Mudanças necessárias:**

1. **Atualizar instrução sobre glossário (linha ~21):**

Trocar:
```markdown
- sempre que encontrar palavras começando com maiúscula (e.g., Aluno, Turma), considerar como entidades do domínio e se certificar de já conhecer suas definições, dadas em [./.ai/glossario/principal.md](./glossario/*), através do glossário;
```

Por:
```markdown
- sempre que encontrar `Termos entre crases` (ex: `Aluno Concluinte`, `Turma`), consultar suas definições no glossário `.ai/glossario/*.md`;
```

2. **Atualizar seção IDD:**

Trocar referência:
```markdown
Referência do IDD: [docs/IDD.md](./docs/IDD.md)
```

Por:
```markdown
Referência do IDD: [docs/IDD.md](../docs/IDD.md)
```

3. **Atualizar seção "Estrutura de Documentação":**

Trocar:
```markdown
## Estrutura de Documentação

Cada feature possui:
- **FLUXO.md** - Fluxos de uso (perspectiva do usuário ) e dos mecanismos internos;
- **TECNICO.md** - Decisões técnicas + checkpoints de sessões
```

Por:
```markdown
## Estrutura de Documentação

Cada feature possui:
- **FLUXO.md** - Fluxos de uso (perspectiva do usuário) e mecanismos internos
- **TECNICO.md** - Decisões técnicas de implementação real
```

4. **Atualizar seção "BOAS PRÁTICAS":**

Adicionar após linha sobre DRY:
```markdown
- Usar `Termos` do glossário entre crases na documentação
- Manter glossário `.ai/glossario/*` como fonte única de verdade para termos de domínio
```

---

## FASE 6: VALIDAÇÃO E LIMPEZA

### 6.1 Checklist de Validação

Após concluir migração, verificar:

- [ ] Todos os arquivos em `docs/features/*/FLUXO.md` existem e seguem template
- [ ] Todos os arquivos em `docs/features/*/TECNICO.md` existem e seguem template
- [ ] `docs/IDD.md` está completo e explica nova metodologia
- [ ] `docs/templates/FLUXO.md` e `docs/templates/TECNICO.md` existem
- [ ] CLAUDE.md foi atualizado corretamente
- [ ] AGENTS.md foi atualizado corretamente
- [ ] .ai/CORE.md foi atualizado corretamente
- [ ] Nenhum arquivo em `docs_deprecated/` foi modificado
- [ ] Não foi criada pasta `docs/dry/`
- [ ] Não foram criados arquivos `CHECKPOINT.md`
- [ ] `Termos` usados na documentação existem no glossário `.ai/glossario/*.md`

### 6.2 Teste de Leitura

Após migração, fazer teste:

1. Escolher uma feature (ex: pagina-emissao-documentos)
2. Ler apenas FLUXO.md + glossário
3. Verificar se contexto é suficiente para entender "o quê" a feature faz
4. Ler TECNICO.md
5. Verificar se decisões técnicas estão claras e justificadas
6. Verificar se referências ao código (arquivo:linha) estão corretas

---

## OBSERVAÇÕES FINAIS PARA O CODEX

### Prioridades na Execução

1. **Fase 1 (estrutura + templates):** Executar completamente primeiro
2. **Fase 2 (IDD.md):** Executar antes de migrar features
3. **Fase 3 (features):** Começar por `pagina-emissao-documentos` (mais recente/completa)
4. **Fase 4 (structures):** Avaliar após completar features
5. **Fase 5 (configs):** Executar após tudo acima estar pronto
6. **Fase 6 (validação):** Executar ao final

### Qualidade sobre Velocidade

- Não copiar/colar conteúdo de `docs_deprecated/`
- Adaptar e reescrever em novo formato
- Garantir que `Termos` em crases correspondem ao glossário
- Incluir referências específicas a código em TECNICO.md
- Justificar decisões técnicas não-óbvias

### Comunicação

- Reportar progresso após cada fase
- Avisar se encontrar ambiguidades ou dúvidas
- Solicitar validação de exemplos antes de migrar todas as features

---

## RESUMO EXECUTIVO

**O que está sendo feito:**
Migração de metodologia baseada em DRY/Checkpoints para metodologia simplificada baseada em Glossário + Fluxos + Decisões Técnicas.

**Por quê:**
- Checkpoints são voláteis (cada refatoração = novos checkpoints)
- DRY é burocrático (prefixos, tags, formatação excessiva)
- Codex se perde em refatorações por contexto fragmentado

**Como:**
- Glossário `.ai/glossario/*` = SSOT para `Termos` de domínio
- FLUXO.md = O que a feature faz (prosa natural com `Termos`)
- TECNICO.md = Como foi implementada (decisões técnicas com referências a código)
- Sem checkpoints, sem DRY, sem prefixos

**Resultado esperado:**
Documentação fluida de escrever, fácil de ler, e que fornece contexto suficiente para implementação e refatoração sem fragmentação.