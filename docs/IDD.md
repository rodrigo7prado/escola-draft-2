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

### Fase 1: Documentação (Claude)
1. Usuário solicita nova feature ou melhoria
2. Usuário pode criar um apoio lógico em  FLUXO.md, ou o Claude cria do zero
3. Usuário ou Claude constroem o TECNICO.md
4. Claude pode validar, corrigir ou atualizar o glossário se novos termos forem necessários

### Fase 2: Implementação ou Refatoração (Codex)
1. Codex lê FLUXO.md + TECNICO.md + glossários (todos os arquivos em .ai/glossario/entradas*.md)
2. Codex analisa recursos usados e requisitos técnicos e avalia a viabilidade e consistência da proposta
3. Se for uma refatoração, Codex avaliará os checks vazios e implementará na ordem numérica dos itens
  3.1. A cada item lido, Codex tentará entender aquele checkpoint integrado no fluxo geral
  3.2. Codex então atualizará o seu entendimento do fluxo geral após olhar os checkpoints a serem revisados, corrigidos ou implementados
4. Se houver inconsistências ou dúvidas, Codex pode solicitar esclarecimentos ao Usuário
5. Após esclarecimentos, Codex NÃO prossegue para implementação. Codex deve REINICIAR a Fase 2, voltando ao passo 1.
6. Se passar na avaliação inicial, Codex tentará implementar o código seguindo os seguintes passos:
    6.1. Codex lê o item de TECNICO.md
    6.2. Codex consulta o glossário para entender os `Termos` usados
    6.3. Se não encontrar o termo, Codex interrompe a implementação e solicita ao Usuário para atualizar o glossário.
    6.4. Codex consulta da 'definição técnica' do termo no glossário para detalhes de implementação
    6.5. Codex analisa a viabilidade técnica do item atual de TECNICO.md
    6.6. Se não houver estratégia clara, não buscar soluções alternativas. Codex interrompe a implementação e solicita esclarecimentos ao Usuário.
    6.7. Não buscar documentação em docs/deprecated/ se não houver recomendações prévias.
    6.8. Se houver dúvidas ou inconsistências, Codex interrompe a implementação e solicita esclarecimentos ao Usuário
    6.9. Após esclarecimentos, Codex volta ao passo 6.5
    6.10. Após implementação do item, Codex marca o checkbox correspondente em TECNICO.md como concluído
    6.11. Codex verifica se há mais itens pendentes em TECNICO.md
    6.12. Se houver mais itens, Codex volta ao passo 6.1
    6.13. Se não houver mais itens, Codex escreve comentários no código implementado estabelecendo referência para TECNICO.md mencionando o número do item correspondente
7. Codex dá checklist nos itens concluídos em TECNICO.md


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
