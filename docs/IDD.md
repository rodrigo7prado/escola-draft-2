# IDD Simplificado - Metodologia para Novas Features

## Nota sobre Coexistência

Esta metodologia simplificada coexiste com a metodologia IDD/DRY original documentada em `docs_deprecated/IDD.md`.

**Features antigas** (importacao-por-colagem, sistema-fases-gestao-alunos, importacao-ficha-individual-historico, emissao-documentos):
- Continuam usando metodologia original em `docs_deprecated/`
- Mantêm checkpoints, estrutura DRY, prefixos e tags

**Feature pagina-emissao-documentos + novas features:**
- Usam esta metodologia simplificada
- Documentação em `docs/`
- Sem checkpoints, sem prefixos

---

## Visão Geral

Desenvolvimento incremental orientado por documentação, com foco em escrita fluida e rastreabilidade via glossário.

## Glossário como Fonte Única de Verdade

Todos os termos de domínio são definidos em `.ai/glossario/*.md`:
- `glossario/principal.md` - Termos core do negócio
- `glossario/campo-de-pesquisa.md` - Padrões de UI específicos
- Outros conforme necessário

**Convenção de uso:**
- Termos do glossário são escritos entre crases na documentação: `Aluno Concluinte`, `Lista de Alunos Concluintes`
- A grafia deve ser a mesma do glossário
- Links podem ser criados para navegação: [Alunos Concluintes](../.ai/glossario/principal.md#alunos-concluintes)

## Separação de Responsabilidades

### Claude (Agente de Documentação)

**Foco:** Gestão de `docs/features/*/FLUXO.md` e `.ai/glossario/*`

**Responsabilidades:**
1. Criar/atualizar FLUXO.md de features
2. Manter glossário atualizado com todos os `Termos` usados
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
- Refatorações seguem o mesmo fluxo
- FLUXO.md é atualizado se o comportamento muda
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
- Checkpoints (CP1.2.3)
- Prefixos [DRY.*], [FEAT:*_TEC*]
- MAPEAMENTO.md por feature
- Estrutura docs/dry/

**Simplificado:**
- Apenas FLUXO.md + TECNICO.md por feature
- Termos em crases: `Termo`
- Prosa natural sem formatação excessiva

**Preservado:**
- Separação Claude/Codex
- Glossário como SSOT
- Rastreabilidade documentação ↔ código
