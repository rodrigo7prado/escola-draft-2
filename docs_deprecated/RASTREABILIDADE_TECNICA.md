# GUIA DE RASTREABILIDADE TÉCNICA

Este guia explica como usar o sistema de rastreabilidade bidirecional entre código e documentação técnica.

---

## Visão Geral

O sistema IDD usa três tipos de marcadores para organizar decisões técnicas:

| Marcador | Localização | Propósito |
|----------|-------------|-----------|
| **T*** | CHECKPOINT.md | Detalhes de **implementação** (o que/como fazer) |
| **TEC*** | TECNICO.md | **Decisões técnicas** documentadas (por que fazer) |
| **[FEAT:*_TEC*]** | Código (.ts/.tsx) | **Referência** a decisão técnica no TECNICO.md |

---

## Como Usar no Código

### Formato do Comentário

```typescript
// [FEAT:nome-feature_TECX.Y] Resumo breve (máx 1 linha) da decisão
```

**Componentes:**
- `FEAT:` - Prefixo fixo identificando referência IDD
- `nome-feature` - Nome da feature (ex: `emissao-documentos`, `importacao-por-colagem`)
- `TEC` - Indica que é decisão técnica (não confundir com `T` de checkpoint)
- `X.Y` - Número da decisão (ex: `TEC1`, `TEC2.3`)
- Resumo - 1 linha explicando a decisão de forma concisa

### Exemplos Reais

```typescript
// [FEAT:emissao-documentos_TEC1] Modal com PDFViewer para prévia de documentos
export function DadosAlunoEmissao() {
  // ...
}
```

```typescript
// [FEAT:emissao-documentos_TEC2] Uso de @react-pdf/renderer para geração de PDFs
import { Document, Page, Text } from "@react-pdf/renderer";
```

```typescript
// [FEAT:emissao-documentos_TEC6] Formatters centralizados para consistência
import { formatarData, getCampoTexto } from "@/components/pdf/common/formatters";
```

### Onde Colocar Comentários

✅ **Coloque comentários em:**
- Topo de componentes/funções que implementam decisão técnica
- Imports de bibliotecas escolhidas após análise de alternativas
- Blocos de código que implementam padrão arquitetural específico
- Lógica não-óbvia que teve trade-offs considerados

❌ **NÃO coloque comentários em:**
- Código óbvio ou autoexplicativo
- Convenções padrão da linguagem/framework
- Cada linha de código (use com parcimônia)

---

## Como Documentar no TECNICO.md

### Estrutura de Uma Entrada TEC

```markdown
## TEC1: Título da decisão técnica

**Motivação:**
- Razão 1 (contexto de negócio, requisitos)
- Razão 2 (limitações técnicas, constraints)
- Razão 3 (benefícios esperados)

**Alternativas Consideradas:**
- ❌ **Alternativa A**: Por que não foi escolhida (desvantagens específicas)
- ❌ **Alternativa B**: Por que não foi escolhida
- ✅ **Solução escolhida**: Por que foi a melhor opção

**Referências no Código:**
- `caminho/arquivo.ts:linha` - Descrição breve da implementação
- `caminho/outro.tsx:linha-linha` - Outra referência

### TEC1.1: Subitem (quando necessário)
Detalhamento específico de aspecto da decisão principal
```

### Exemplo Real

```markdown
## TEC1: UI de emissão usa Modal genérico com PDFViewer para prévia

**Motivação:**
- Usuário precisa revisar documento antes de imprimir (evitar desperdício de papel)
- Reutilizar componente Modal existente (princípio DRY)
- Permitir correção de dados sem sair da página

**Alternativas Consideradas:**
- ❌ **Abrir em nova aba do navegador**: Perde contexto, dificulta correção imediata
- ❌ **Renderizar inline no formulário**: Polui a UI, dificulta foco
- ✅ **Modal com PDFViewer**: Mantém contexto, permite foco, reutiliza componente existente

**Referências no Código:**
- `src/components/DadosAlunoEmissao.tsx:47` - Implementação do modal de prévia
- `src/components/ui/Modal.tsx` - Componente Modal reutilizado
```

---

## Workflow Completo

### 1. Durante Implementação

```
Desenvolvedor implementa código
     ↓
Identifica decisão técnica não-óbvia
     ↓
Adiciona comentário [FEAT:*_TECX] no código
     ↓
Anota decisão para documentar depois
```

### 2. Ao Final da Sessão

```
Revisar decisões técnicas implementadas
     ↓
Para cada decisão:
  - Criar/atualizar entrada TECX no TECNICO.md
  - Incluir motivação + alternativas + referências
     ↓
Verificar consistência:
  - Todo comentário [FEAT:*_TEC*] tem entrada no TECNICO.md
  - Toda entrada TEC tem pelo menos 1 referência de código
```

### 3. Durante Manutenção Futura

```
Desenvolvedor encontra código com [FEAT:*_TECX]
     ↓
Abre docs/features/nome-feature/TECNICO.md
     ↓
Busca por "TECX" no arquivo
     ↓
Entende motivação e alternativas consideradas
     ↓
Toma decisão informada sobre refatoração
```

---

## Buscando Decisões Técnicas

### Do Código para Documentação

1. Vê comentário no código: `[FEAT:emissao-documentos_TEC1.2]`
2. Abre: `docs/features/emissao-documentos/TECNICO.md`
3. Busca por: `TEC1.2`
4. Lê motivação e alternativas consideradas

### Da Documentação para Código

1. Abre TECNICO.md da feature
2. Encontra entrada TEC desejada
3. Olha seção "Referências no Código"
4. Abre arquivo:linha indicado
5. Vê implementação prática

### Usando Grep

```bash
# Encontrar todas as decisões técnicas de uma feature no código
grep -r "FEAT:emissao-documentos_TEC" src/

# Encontrar onde uma decisão específica é usada
grep -r "TEC1.2" src/

# Listar todas as decisões técnicas documentadas
grep "^## TEC" docs/features/*/TECNICO.md
```

---

## Quando Criar Uma Entrada TEC

### ✅ Criar TEC para:

- **Escolhas arquiteturais**: "Por que usamos Modal em vez de página separada?"
- **Seleção de bibliotecas**: "Por que @react-pdf/renderer e não jsPDF?"
- **Trade-offs significativos**: "Por que sacrificamos performance por legibilidade aqui?"
- **Padrões personalizados**: "Por que criamos def-objects com array de documentos?"
- **Decisões com consequências**: "Por que centralizamos layout em vez de inline?"

### ❌ NÃO criar TEC para:

- Convenções padrão do Next.js/React
- Imports triviais (`import React from 'react'`)
- Código autoexplicativo
- Formatação/estilo de código
- Decisões óbvias sem alternativas viáveis

---

## Mantendo Consistência

### Checklist ao Finalizar Feature

- [ ] Toda decisão técnica tem entrada TEC no TECNICO.md
- [ ] Toda entrada TEC tem referências válidas no código
- [ ] Comentários `[FEAT:*_TEC*]` no código correspondem a entradas existentes
- [ ] Nenhuma entrada TEC está órfã (sem referência no código)
- [ ] Motivações estão claras e contextualizadas
- [ ] Alternativas consideradas estão documentadas

### Validação Automatizada (Futuro)

Será criado skill `/validate-tec` que:
- Faz Grep de comentários `[FEAT:*_TEC*]` no código
- Verifica se cada TEC referenciado existe no TECNICO.md correspondente
- Verifica se cada TEC no TECNICO.md tem ao menos 1 referência no código
- Reporta inconsistências

---

## Exemplo Completo: Fluxo Real

### 1. Implementação Inicial

Desenvolvedor cria componente de emissão:

```typescript
// src/components/DadosAlunoEmissao.tsx

export function DadosAlunoEmissao() {
  const [modalAberto, setModalAberto] = useState(false);

  // Implementa modal com PDFViewer...
}
```

### 2. Identifica Decisão Técnica

Desenvolvedor percebe: "Poderia ter sido página separada, por que modal?"

### 3. Adiciona Comentário

```typescript
// [FEAT:emissao-documentos_TEC1] Modal com PDFViewer para prévia de documentos
export function DadosAlunoEmissao() {
  // ...
}
```

### 4. Documenta no TECNICO.md

```markdown
## TEC1: UI de emissão usa Modal genérico com PDFViewer para prévia

**Motivação:**
- Usuário precisa revisar documento antes de imprimir
- Reutilizar componente Modal existente (DRY)
- Permitir correção de dados sem sair da página

**Alternativas Consideradas:**
- ❌ Abrir em nova aba: Perde contexto
- ✅ Modal: Mantém contexto, melhor UX

**Referências no Código:**
- `src/components/DadosAlunoEmissao.tsx:47` - Implementação do modal
```

### 5. Manutenção Futura

Outro desenvolvedor (ou IA) precisa refatorar:

1. Vê `[FEAT:emissao-documentos_TEC1]` no código
2. Abre `docs/features/emissao-documentos/TECNICO.md`
3. Lê TEC1 e entende que modal foi escolhido por manter contexto
4. Decide manter abordagem (ou justificar mudança se necessário)

---

## Dicas Práticas

### Para Desenvolvedores

- **Use Grep**: `grep -r "FEAT:emissao" src/` mostra todas as decisões da feature
- **IDE Search**: Configure busca para `[FEAT:*_TEC` no projeto
- **Consulte antes de refatorar**: Sempre leia TEC correspondente antes de mudar código

### Para IAs (Claude, GPT)

- **Leia TECNICO.md**: Sempre consulte antes de propor mudanças arquiteturais
- **Mantenha consistência**: Ao adicionar código, adicione comentários TEC correspondentes
- **Documente ao final**: Atualize TECNICO.md ao final de cada sessão de implementação

### Para Revisores de Código

- **Verifique rastreabilidade**: PRs com decisões técnicas devem ter comentários + doc
- **Exija justificativas**: Mudanças em código com `[FEAT:*_TEC*]` precisam justificar quebra de decisão anterior
- **Atualize TECNICO.md**: Se decisão mudou, doc deve refletir isso

---

## Benefícios do Sistema

✅ **Rastreabilidade**: Do código para doc e vice-versa
✅ **Contexto preservado**: Motivações não se perdem no tempo
✅ **Onboarding rápido**: Novos devs entendem "por quês" rapidamente
✅ **Refatoração segura**: Decisões anteriores são consideradas
✅ **Reduz reuniões**: Menos "Por que fizemos assim?" em code review
✅ **Facilita IAs**: Claude/GPT conseguem manter consistência arquitetural

---

## Referências

- [docs/IDD.md](./IDD.md) - Metodologia IDD completa
- [docs/CHECKPOINT.md](./CHECKPOINT.md) - Template de checkpoints
- [docs/features/emissao-documentos/TECNICO.md](./features/emissao-documentos/TECNICO.md) - Exemplo real de TECNICO.md

---

**Última atualização:** 2026-01-08
**Versão:** 1.0
