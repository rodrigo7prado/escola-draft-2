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

Desenvolvimento incremental orientado por documentação, com foco em **escrita concisa, objetiva e facilmente legível por humanos**, usando o glossário como fonte única de verdade.

## Princípio da Não-Verbosidade

**CRÍTICO:** Esta metodologia prioriza documentos **curtos, escaneáveis e mantidos facilmente por humanos**:

- **Informação única**: referenciar `Termos` do glossário em vez de repetir definições
- **Objetividade**: descrever "o quê" sem justificar "por quê"
- **Concisão**: FLUXO.md deve ter ~5-10 linhas, TECNICO.md ~30-40 linhas
- **Checkboxes**: usar `[ ]` para rastreamento de requisitos
- **Legibilidade humana**: documentos devem ser compreendidos em segundos

**Se a documentação virar algo que "só IA consegue mexer com consistência", ela falhou.**

## Glossário como Fonte Única de Verdade

Todos os termos de domínio são definidos em `.ai/glossario/entradas*.md`:
- As 'entradas' são apenas agrupamentos de termos relacionados.

**Convenção de uso:**
- Termos do glossário são escritos entre crases na documentação: `Aluno Concluinte`, `Lista de Alunos Concluintes`
- A grafia deve ser a mesma do glossário
- Links podem ser criados para navegação: [Alunos Concluintes](../.ai/glossario/principal.md#alunos-concluintes)
- Há o sumário do glossário em `.ai/glossario/sumario.md` para facilitar a navegação

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
- **FLUXO.md** - Descrição concisa do que a feature faz (perspectiva do usuário)
- **TECNICO.md** - Lista objetiva de requisitos técnicos com `Termos` do glossário

## Workflow de Desenvolvimento

### Convenções e Procedimentos
[x] Indica requisito implementado
[ ] Indica requisito pendente
[!] Indica necessidade de refatoração ou atenção especial

*Onde houver "// TODO", se a pendência for resolvida:*
  - preencher com as informações necessárias se for o caso
  - eliminar o comentário
  - e marcar o requisito como implementado [x];

### Fase 1: Documentação (Claude)
1. Usuário solicita nova feature ou melhoria
2. Usuário pode criar um apoio lógico em  FLUXO.md, ou o Claude cria do zero
3. Usuário ou Claude constroem o TECNICO.md
4. Claude pode validar, corrigir ou atualizar o glossário se novos termos forem necessários

### Fase 2: Implementação ou Refatoração (Codex)
1. LEITURA INICIAL (ordem importante):
   1.1. Codex lê TODOS os glossários (.ai/glossario/entradas/*.md)
   1.2. Codex constrói índice mental de recursos disponíveis
   1.3. Codex lê FLUXO.md (contexto geral)
   1.4. Codex lê TECNICO.md (mapa de uso dos recursos)

2. VALIDAÇÃO:
   2.1. Para cada recurso em TECNICO.md:
        - Verificar se existe no glossário
        - Se NÃO existir: interromper e solicitar atualização do glossário
   2.2. Validar estrutura de layout
   2.3. Validar requisitos específicos

3. IMPLEMENTAÇÃO (para cada item em TECNICO.md):
   3.1. Identificar recurso do glossário (ex: `Campo de Pesquisa com Autocompletar`)
   3.2. Consultar glossário para obter:
        - Categoria
        - Descrição
        - Opções Ativáveis (se aplicável)
        - Parâmetros (se aplicável)
        - Definições técnicas (comportamento, componente, etc)
   3.3. Aplicar configurações específicas do TECNICO.md:
        - Local de uso
        - Opções ativadas
        - Valores de parâmetros
        - Labels/aliases
   3.4. Implementar código
   3.5. Marcar checkbox em TECNICO.md
   3.6. Preencher informações pedidas em TODOs nos glossários, se aplicável
   3.7. Repetir até finalizar

4. FINALIZAÇÃO:
   4.1. Adicionar comentários no código referenciando TECNICO.md
   4.2. Verificar todos os checkboxes marcados


## Formato dos Arquivos

### TECNICO.md - Formato Esperado

Exemplo real de [pagina-emissao-documentos/TECNICO.md](features/pagina-emissao-documentos/TECNICO.md):

```markdown
# DOCUMENTAÇÃO TÉCNICA DA FEATURE: Página de Emissão de Documentos
**Tipo de Documentação Técnica**: Componente de UI
**Local de Implementação**: `src/components/paginas/PaginaEmissaoDocumentos.tsx`
**Local de Chamada do Componente de UI**: `src/app/emissao-documentos/page.tsx`

Estrutura de Layout:
  - [Parte Superior]
  - [Wrapper Principal]
    - [Barra Lateral Esquerda]
    - [Bloco de Filtro e Conteúdo]
      - [Filtro de Alunos por Turma] // Barra horizontal
      - [Conteúdo]

[ ] TEC1: Estrutura Geral
*Definições*:
 
- `Estilo de UI Ultra-Compacto`;

[ ] TEC2: Parte superior
- A `Página de Emissão de Documentos` deve permitir a busca por nome do aluno ou matrícula
- O modo será `Campo de Pesquisa com Autocompletar com Coringa`;

[ ] TEC3: BARRA LATERAL ESQUERDA
A lista terá duas sublistas planas, uma abaixo da outra, organizadas em suas sessões nomeadas principais:
- `Alunos Concluintes`;
- `Alunos Pedentes`
    - Ao invés de usar o nome do glossário, usar o alias para usar no UI: `Alunos Pendentes`);

```

**Características:**
- Propriedades chave no topo (tipo, local de implementação, local de chamada)
- Estrutura de Layout
- Recursos usados e configurações (opcional)
- Requisitos técnicos organizados com prefixos (TEC1, TEC2, TEC3...)
- Checkboxes `[ ]` para rastreamento
- Referências diretas a `Termos` do glossário entre crases
- Pode usar aliases/nomes alternativos quando necessário
- 

Ver também templates de referência em:
- `docs/templates/TECNICO.md`

## Quando Criar Entradas em TECNICO.md

**SIM - Criar entrada para:**
- Requisitos específicos de UI/UX usando `Termos` do glossário
- Estrutura de componentes e organização de dados
- Comportamentos técnicos não-óbvios
- Integrações e dependências externas

**NÃO - Não criar para:**
- Convenções padrão da linguagem/framework
- Código autoexplicativo ou trivial
- Justificativas de decisões (focar no "o quê", não no "por quê")

## Rastreabilidade

- FLUXO.md → apoio lógico no início de uma construção
- TECNICO.md → lista requisitos e definições técnicas usando `Termos` do glossário
- Glossário → define `Termos` de forma única (fonte de verdade)
- Código → implementação concreta, consultando glossário via comentários quando necessário

## Diferenças da Metodologia Anterior

**Removido:**
- Checkpoints (CP1.2.3)
- Prefixos [DRY.*], [FEAT:*_TEC*]
- MAPEAMENTO.md por feature
- Estrutura docs/dry/

**Simplificado:**
- Apenas FLUXO.md + TECNICO.md por feature
- Termos em crases: `Termo`
- Documentos ultra-concisos (~5-10 linhas para FLUXO, ~30-40 para TECNICO)
- Checkboxes `[ ]` para rastreamento
- Foco total em legibilidade humana

**Preservado:**
- Separação Claude/Codex
- Glossário como SSOT
- Rastreabilidade documentação ↔ código
