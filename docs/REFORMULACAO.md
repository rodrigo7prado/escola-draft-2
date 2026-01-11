# Reformulação da Documentação do Projeto

## CONTEXTO DA REFORMULAÇÃO

Este documento orienta a implementação de uma **nova metodologia simplificada** para documentação de features, que **coexistirá** com a metodologia IDD/DRY existente.

### Por que esta reformulação?

**Problemas identificados na estrutura IDD/DRY atual:**
1. **Checkpoints são voláteis:** Cada refatoração exige novos checkpoints, criando lixo documental
2. **DRY muito burocrático:** Prefixos `[DRY.*]`, `[FEAT:*_TEC*]`, `TEC*` criam fricção na escrita
3. **Glossário desconectado:** Termos definidos em arquivo separado, mas sem integração clara com documentação técnica
4. **Codex se perde em refatorações:** Contexto fragmentado entre múltiplos arquivos com formatação complexa

**O que funcionou bem e será preservado:**
- ✅ Separação Claude (documentação) / Codex (implementação)
- ✅ Glossário como fonte de verdade para termos de domínio
- ✅ Rastreabilidade entre documentação e código

### Nova Abordagem (Metodologia Simplificada)

**Princípios:**
1. **Escrita fluida:** Markdown natural, sem prefixos ou tags especiais
2. **Glossário como SSOT:** Termos definidos em `.ai/glossario/*.md` são referenciados via crases: `Termo`
3. **Sem checkpoints:** FLUXO.md descreve "o quê", TECNICO.md descreve "como foi feito"
4. **Prosa natural:** Foco no conteúdo, não na estrutura

**Formato de Termos:**
- Na documentação, termos do glossário são escritos entre crases: `Aluno Concluinte`, `Turma (Modo Abreviado)`
- Isso torna visualmente claro que o termo tem definição específica no glossário
- Exemplo: "A lista deve exibir `Alunos Concluintes` e `Alunos Elegíveis para Emissão de Documentos`"

### Estratégia de Coexistência

**Features ANTIGAS (já implementadas):**
- Mantêm metodologia IDD/DRY existente
- Documentação em `docs_deprecated/features/*`
- Continuam usando checkpoints, prefixos [DRY.*], etc
- **NÃO serão migradas**

**Feature pagina-emissao-documentos + NOVAS features:**
- Usam metodologia simplificada
- Documentação em `docs/features/*`
- Sem checkpoints, sem prefixos
- Apenas FLUXO.md + TECNICO.md

**Referência de IDD:**
- `docs_deprecated/IDD.md` - Metodologia antiga (preservada)
- `docs/IDD.md` - Metodologia nova (a ser criada)

---

## IMPORTANTE: REGRAS PARA O CODEX

### O que NÃO fazer:
- ❌ **NUNCA** modificar ou deletar `docs_deprecated/`
- ❌ **NUNCA** migrar features antigas para novo formato
- ❌ **NUNCA** criar `docs/dry/` na nova estrutura
- ❌ **NUNCA** usar prefixos `[DRY.*]`, `[FEAT:*]`, `CP1.2.3` em `docs/`

### O que fazer:
- ✅ Criar `docs/` com nova estrutura apenas para `pagina-emissao-documentos`
- ✅ Usar `docs_deprecated/` como referência de leitura quando necessário
- ✅ Usar `Termos` entre crases na nova documentação
- ✅ Escrever em prosa natural e objetiva

---

## ESTRUTURA FINAL ESPERADA

```
docs_deprecated/              # Features antigas - NÃO MEXER
├── IDD.md                    # Metodologia antiga
├── dry/                      # Estrutura DRY antiga
├── features/
│   ├── importacao-por-colagem/
│   ├── sistema-fases-gestao-alunos/
│   ├── importacao-ficha-individual-historico/
│   └── emissao-documentos/
└── ...

docs/                         # Nova estrutura (simplificada)
├── IDD.md                    # Metodologia nova
├── REFORMULACAO.md          # Este arquivo
├── features/
│   └── pagina-emissao-documentos/    # ÚNICA feature no novo formato
│       ├── FLUXO.md
│       └── TECNICO.md
└── templates/
    ├── FLUXO.md
    └── TECNICO.md
```

---

## FASE 1: ESTRUTURA BASE E TEMPLATES

### 1.1 Criar Estrutura de Pastas

Criar apenas a estrutura necessária para a nova metodologia:

```bash
docs/
docs/features/
docs/features/pagina-emissao-documentos/
docs/templates/
```

**NÃO criar:**
- ❌ `docs/dry/`
- ❌ `docs/structures/` (por enquanto)
- ❌ Pastas para outras features

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

## FASE 2: CRIAR docs/IDD.md (Nova Metodologia)

**Objetivo:** Documentar a metodologia simplificada que será usada em `pagina-emissao-documentos` e futuras features.

**Conteúdo esperado:**

```markdown
# IDD Simplificado - Metodologia para Novas Features

## Nota sobre Coexistência

Esta metodologia simplificada coexiste com a metodologia IDD/DRY original documentada em `docs_deprecated/IDD.md`.

**Features antigas** (importacao-por-colagem, sistema-fases-gestao-alunos, etc):
- Continuam usando metodologia original em `docs_deprecated/`
- Mantêm checkpoints, estrutura DRY, prefixos, etc

**Feature pagina-emissao-documentos + novas features:**
- Usam esta metodologia simplificada
- Documentação em `docs/features/`
- Sem checkpoints, sem prefixos

---

## Visão Geral

Desenvolvimento incremental orientado por documentação, com foco em escrita fluida e rastreabilidade via glossário.

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

**Foco:** Gestão de `docs/features/*/FLUXO.md` e `.ai/glossario/*`

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

Ver templates em:
- `docs/templates/FLUXO.md`
- `docs/templates/TECNICO.md`

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
- ❌ Prefixos [DRY.*], [FEAT:*_TEC*]
- ❌ MAPEAMENTO.md por feature
- ❌ Estrutura docs/dry/

**Simplificado:**
- ✅ Apenas FLUXO.md + TECNICO.md por feature
- ✅ Termos em crases: `Termo`
- ✅ Prosa natural sem formatação excessiva

**Preservado:**
- ✅ Separação Claude/Codex
- ✅ Glossário como SSOT
- ✅ Rastreabilidade documentação ↔ código
```

**Instruções:**
- Use o conteúdo acima como base
- Adapte/expanda conforme necessário
- Mantenha tom direto e objetivo
- Deixe claro que esta é metodologia para novas features

---

## FASE 3: MIGRAR APENAS pagina-emissao-documentos

### 3.1 Criar docs/features/pagina-emissao-documentos/FLUXO.md

**Referência em docs_deprecated:**
- `docs_deprecated/features/pagina-emissao-documentos/FLUXO.md`
- `docs_deprecated/features/pagina-emissao-documentos/CHECKPOINT.md`

**Código implementado:**
- `src/app/emissao-documentos/page.tsx`

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

### 3.2 Criar docs/features/pagina-emissao-documentos/TECNICO.md

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

## FASE 4: ATUALIZAR ARQUIVOS DE CONFIGURAÇÃO

### 4.1 Atualizar CLAUDE.md

**Arquivo:** `/home/rmprado/projetos/next/escola-draft-2/CLAUDE.md`

**Objetivo:** Adicionar seção sobre metodologia híbrida (coexistência de IDD/DRY e IDD Simplificado)

**Mudanças necessárias:**

1. **Adicionar nova seção após "SEPARAÇÃO DE RESPONSABILIDADES":**

```markdown
## METODOLOGIAS DE DOCUMENTAÇÃO (COEXISTÊNCIA)

Este projeto usa **duas metodologias** de documentação que coexistem:

### Metodologia IDD/DRY (Features Antigas)

**Localização:** `docs_deprecated/`

**Features que usam:**
- importacao-por-colagem
- sistema-fases-gestao-alunos
- importacao-ficha-individual-historico
- emissao-documentos

**Características:**
- Estrutura `docs_deprecated/dry/` com prefixos [DRY.*]
- Arquivos CHECKPOINT.md com prefixos CP1.2.3, TEC*
- Tags [FEAT:*_TEC*] no código
- Referência: `docs_deprecated/IDD.md`

### Metodologia IDD Simplificada (Novas Features)

**Localização:** `docs/`

**Features que usam:**
- pagina-emissao-documentos
- [todas as novas features a partir daqui]

**Características:**
- Apenas FLUXO.md + TECNICO.md por feature
- `Termos` do glossário entre crases
- Sem checkpoints, sem prefixos
- Prosa natural
- Referência: `docs/IDD.md`

### Glossário (Compartilhado)

**Localização:** `.ai/glossario/*.md`

O glossário é **compartilhado** por ambas metodologias e serve como SSOT (Single Source of Truth) para todos os termos de domínio.

**Convenção:**
- Na metodologia simplificada: usar `Termos` entre crases
- Na metodologia antiga: usar Termos com Maiúscula
```

2. **Atualizar seção "Claude (Especialista em Documentação)":**

Adicionar ao final das Atribuições Específicas:

```markdown
- **Escolha de Metodologia:**
  - Features novas: usar metodologia simplificada (`docs/`)
  - Features antigas: manter metodologia IDD/DRY (`docs_deprecated/`)
  - Sempre consultar qual metodologia usar antes de iniciar documentação
```

3. **Atualizar Workflow do Claude:**

```markdown
### Workflow do Claude:
1. Recebe solicitação de documentação de feature/conceito
2. **Identifica qual metodologia usar:**
   - Feature nova → metodologia simplificada (`docs/`)
   - Feature existente → metodologia correspondente
3. Para metodologia simplificada:
   - Cria/atualiza FLUXO.md usando `Termos` do glossário em crases
   - Atualiza glossário `.ai/glossario/*` se novos termos aparecem
   - Entrega FLUXO.md ao Codex
4. Para metodologia IDD/DRY:
   - Segue workflow original em `docs_deprecated/IDD.md`
```

4. **Atualizar protocolo de início de sessão:**

```markdown
# ⚠️ PROTOCOLO OBRIGATÓRIO DE INÍCIO DE SESSÃO ⚠️

**ANTES de responder a PRIMEIRA mensagem do usuário em QUALQUER sessão:**

1. Se trabalhar com **features novas** (pagina-emissao-documentos em diante):
   - Ler `docs/IDD.md` (metodologia simplificada)

2. Se trabalhar com **features antigas** (importacao-por-colagem, etc):
   - Ler `docs_deprecated/IDD.md` (metodologia IDD/DRY)

3. **SEMPRE** ter acesso ao glossário `.ai/glossario/*` (compartilhado)

**NÃO pule esta etapa. NÃO assuma que já leu. SEMPRE leia no início de CADA sessão nova.**
```

---

### 4.2 Atualizar AGENTS.md

**Arquivo:** `/home/rmprado/projetos/next/escola-draft-2/AGENTS.md`

**Objetivo:** Adicionar seção sobre metodologias coexistentes para o Codex

**Mudanças necessárias:**

1. **Adicionar nova seção após "ARQUIVOS INCLUÍDOS":**

```markdown
## METODOLOGIAS DE DOCUMENTAÇÃO (COEXISTÊNCIA)

Este projeto usa **duas metodologias** de documentação:

### Metodologia IDD/DRY (Features Antigas)
- Localização: `docs_deprecated/`
- Features: importacao-por-colagem, sistema-fases-gestao-alunos, importacao-ficha-individual-historico, emissao-documentos
- Usa: CHECKPOINT.md, TECNICO.md com prefixos TEC*, tags [FEAT:*_TEC*] no código
- Referência: `docs_deprecated/IDD.md`

### Metodologia IDD Simplificada (Novas Features)
- Localização: `docs/`
- Features: pagina-emissao-documentos + todas as novas
- Usa: FLUXO.md + TECNICO.md, `Termos` em crases, sem checkpoints
- Referência: `docs/IDD.md`

### Glossário (Compartilhado)
- Localização: `.ai/glossario/*.md`
- SSOT para termos de domínio
- Usar `Termos` entre crases na metodologia simplificada
```

2. **Atualizar seção "METODOLOGIA DE DESENVOLVIMENTO":**

```markdown
## METODOLOGIA DE DESENVOLVIMENTO

**Para features novas (pagina-emissao-documentos em diante):**
- Glossário como SSOT: `.ai/glossario/*.md`
- Usar `Termos` entre crases na documentação
- Consultar `docs/IDD.md` para metodologia completa

**Para features antigas:**
- Continuar usando estrutura DRY em `docs_deprecated/dry/*`
- Consultar `docs_deprecated/IDD.md` para metodologia completa
```

3. **Atualizar Workflow do Codex:**

```markdown
### Workflow do Codex:

**Para features novas (metodologia simplificada):**
1. Recebe FLUXO.md do Claude
2. Consulta glossário `.ai/glossario/*` para entender `Termos` usados
3. Implementa features baseado em FLUXO.md
4. Cria/atualiza TECNICO.md com decisões de implementação real
5. Usa `Termos` do glossário quando apropriado (via comentários ou código)
6. Reporta ao Claude para validação documental

**Para features antigas (metodologia IDD/DRY):**
1. Recebe CHECKPOINT.md do Claude
2. Implementa baseado nos checkpoints
3. Atualiza TECNICO.md com decisões, usando prefixos TEC*
4. Adiciona tags [FEAT:nome-feature_TEC*] no código
5. Marca checkpoints como concluídos
6. Reporta ao Claude para atualização documental
```

4. **Atualizar Atribuições Específicas do Codex:**

```markdown
- **Documentação Técnica:**
  - **Features novas:** TECNICO.md com `Termos` em crases, sem prefixos
  - **Features antigas:** TECNICO.md com prefixos TEC* e tags [FEAT:*_TEC*] no código
  - Manter rastreabilidade código ↔ documentação técnica via referências (arquivo:linha)
```

---

### 4.3 Atualizar .ai/CORE.md

**Arquivo:** `/home/rmprado/projetos/next/escola-draft-2/.ai/CORE.md`

**Mudanças necessárias:**

1. **Atualizar instrução sobre glossário (linha ~21):**

```markdown
- sempre que encontrar `Termos entre crases` (ex: `Aluno Concluinte`, `Turma`) em documentação de features novas, consultar suas definições no glossário `.ai/glossario/*.md`;
- sempre que encontrar Termos com Maiúscula (ex: Aluno Concluinte, Turma) em documentação de features antigas, consultar suas definições no glossário `.ai/glossario/*.md`;
```

2. **Atualizar seção IDD:**

```markdown
## 🎯 METODOLOGIAS IDD

Este projeto usa duas metodologias IDD que coexistem:

### IDD Simplificado (Features Novas)
- Referência: [docs/IDD.md](../docs/IDD.md)
- Features: pagina-emissao-documentos + novas
- Estrutura: FLUXO.md + TECNICO.md
- Termos: `Entre crases`

### IDD/DRY (Features Antigas)
- Referência: [docs_deprecated/IDD.md](../docs_deprecated/IDD.md)
- Features: importacao-por-colagem, sistema-fases-gestao-alunos, etc
- Estrutura: CHECKPOINT.md + TECNICO.md + docs_deprecated/dry/*
- Termos: Com Maiúscula
```

3. **Atualizar seção "Estrutura de Documentação":**

```markdown
## Estrutura de Documentação

**Features novas (metodologia simplificada):**
- **FLUXO.md** - Fluxos de uso (perspectiva do usuário) e mecanismos internos
- **TECNICO.md** - Decisões técnicas de implementação real

**Features antigas (metodologia IDD/DRY):**
- **FLUXO.md** - Fluxos de uso
- **CHECKPOINT.md** - Estados de sessão e checkpoints
- **TECNICO.md** - Decisões técnicas com prefixos TEC*
```

---

## FASE 5: VALIDAÇÃO E LIMPEZA

### 5.1 Checklist de Validação

Após concluir migração, verificar:

- [ ] `docs/features/pagina-emissao-documentos/FLUXO.md` existe e segue template
- [ ] `docs/features/pagina-emissao-documentos/TECNICO.md` existe e segue template
- [ ] `docs/IDD.md` está completo e explica metodologia simplificada
- [ ] `docs/templates/FLUXO.md` e `docs/templates/TECNICO.md` existem
- [ ] CLAUDE.md foi atualizado com seção de coexistência
- [ ] AGENTS.md foi atualizado com seção de coexistência
- [ ] .ai/CORE.md foi atualizado
- [ ] Nenhum arquivo em `docs_deprecated/` foi modificado
- [ ] Não foi criada pasta `docs/dry/`
- [ ] Não foram migradas outras features além de pagina-emissao-documentos
- [ ] `Termos` usados na documentação existem no glossário `.ai/glossario/*.md`

### 5.2 Teste de Leitura

Após migração, fazer teste:

1. Ler apenas `docs/features/pagina-emissao-documentos/FLUXO.md` + glossário
2. Verificar se contexto é suficiente para entender "o quê" a feature faz
3. Ler `docs/features/pagina-emissao-documentos/TECNICO.md`
4. Verificar se decisões técnicas estão claras e justificadas
5. Verificar se referências ao código (arquivo:linha) estão corretas

---

## OBSERVAÇÕES FINAIS PARA O CODEX

### Prioridades na Execução

1. **Fase 1:** Criar estrutura + templates
2. **Fase 2:** Criar docs/IDD.md
3. **Fase 3:** Migrar APENAS pagina-emissao-documentos
4. **Fase 4:** Atualizar arquivos de configuração (CLAUDE.md, AGENTS.md, CORE.md)
5. **Fase 5:** Validação

### O que NÃO fazer

- ❌ **NUNCA** migrar outras features além de pagina-emissao-documentos
- ❌ **NUNCA** modificar `docs_deprecated/`
- ❌ **NUNCA** criar `docs/dry/`
- ❌ **NUNCA** usar prefixos [DRY.*], [FEAT:*], CP1.2.3 em `docs/`

### Qualidade sobre Velocidade

- Não copiar/colar de `docs_deprecated/`
- Adaptar e reescrever em novo formato
- Garantir que `Termos` em crases correspondem ao glossário
- Incluir referências específicas a código em TECNICO.md
- Justificar decisões técnicas não-óbvias

### Comunicação

- Reportar progresso após cada fase
- Avisar se encontrar ambiguidades ou dúvidas

---

## RESUMO EXECUTIVO

**O que está sendo feito:**
Implementação de metodologia simplificada que coexiste com IDD/DRY existente.

**Escopo:**
- Criar nova estrutura `docs/` para metodologia simplificada
- Migrar APENAS `pagina-emissao-documentos` para novo formato
- Atualizar configs para reconhecer duas metodologias
- Features antigas permanecem em `docs_deprecated/` intocadas

**Por quê:**
- Reduzir fricção de escrita em novas features
- Preservar investimento em documentação existente
- Permitir transição gradual

**Resultado esperado:**
- `docs_deprecated/` preservado e funcional
- `docs/` com nova metodologia para pagina-emissao-documentos
- Configs atualizados explicando coexistência
- Features futuras usarão metodologia simplificada