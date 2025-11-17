# METODOLOGIA CIF (Ciclo de Integridade de Funcionalidades)

## O QUE É?

**CIF** é uma metodologia estruturada para desenvolvimento de funcionalidades complexas que exigem alta integridade de dados e comportamento. Ela previne "buracos lógicos" através de documentação em camadas e testes sistemáticos.

## POR QUE EXISTE?

### Problema Identificado

Em sistemas complexos (especialmente com banco de dados, validações de negócio, múltiplas camadas), é comum:

1. **Implementar funcionalidade sem documentar completamente** → Esquecemos casos extremos
2. **Documentar mas não testar** → Bugs passam despercebidos
3. **Testar mas não documentar por que** → Manutenção difícil no futuro
4. **Refatorar e quebrar comportamento** → Sem testes de regressão

### Solução: CIF

A metodologia garante que TODA funcionalidade complexa tenha:

- ✅ **Conceito claro** (o que é, por que existe)
- ✅ **Especificação executável** (checklist de validações → testes)
- ✅ **Documentação técnica** (como está implementado)
- ✅ **Registro de ciclo de vida** (histórico de mudanças)

---

## QUANDO USAR?

### ✅ USE CIF para:

- Funcionalidades com **múltiplas camadas de validação** (ex: upload → parse → banco → visualização)
- Operações **críticas** que não podem falhar (ex: migração de dados, emissão de documentos legais)
- Código com **alta complexidade de estado** (ex: máquina de estados, workflows)
- Features que **mudam frequentemente** e precisam de testes de regressão

### ❌ NÃO USE CIF para:

- Componentes simples de UI (botão, input)
- Utilidades triviais (formatação de data)
- Protótipos descartáveis
- Scripts one-off

---

## ESTRUTURA DA METODOLOGIA

### 5 Níveis de Documentação + CHECKPOINT

```
NÍVEL 1: CONCEITO                    (Funcionalidade - O QUÊ e POR QUÊ)
  ↓
NÍVEL 2: DESCOBERTA                  (Funcionalidade - Perguntas e análise colaborativa) ← NOVO
  ↓
NÍVEL 3: ESPECIFICAÇÃO               (Funcionalidade - Checklist executável)
  ↓
NÍVEL 4: TÉCNICO                     (Funcionalidade - COMO)
  ↓
NÍVEL 5: CICLO                       (Funcionalidade - Histórico permanente)

CHECKPOINT                           (Sessão - Memória temporária)
```

### ⚠️ IMPORTANTE: CHECKPOINT vs CICLO

| Aspecto                      | CHECKPOINT                                  | CICLO                           |
| ---------------------------- | ------------------------------------------- | ------------------------------- |
| **Propósito**                | Continuidade entre **sessões**              | Histórico da **funcionalidade** |
| **Duração**                  | Temporário (descartado após conclusão)      | Permanente                      |
| **Detalhamento**             | Detalhado (contexto para retomar)           | Conciso (marcos relevantes)     |
| **Conteúdo**                 | Estado atual, bloqueadores, próximos passos | Mudanças na funcionalidade      |
| **Pode ter infraestrutura?** | ✅ Sim (se bloqueia sessão)                 | ❌ Nunca                        |
| **Finalidade**               | Memória de curto prazo (Claude)             | Facilitar refatorações futuras  |

**Exemplo - Banco de testes:**

- ✅ **CHECKPOINT:** "Bloqueado: testes apagam dados. Próximo: criar certificados_test"
- ❌ **CICLO:** Não documentar (infraestrutura, não é mudança na funcionalidade)

### 1. CONCEITO (`*_CONCEITO.md`)

**Objetivo:** Explicar a funcionalidade em linguagem natural

**Conteúdo:**

- O que é esta funcionalidade?
- Qual problema resolve?
- Qual o escopo? (o que FAZ parte, o que NÃO FAZ parte)
- Fluxo do usuário
- Conceitos-chave

**Público:** Gestor de projeto, Product Owner, novos desenvolvedores

**Exemplo:** [docs/ciclos/MIGRACAO_CONCEITO.md](./ciclos/MIGRACAO_CONCEITO.md)

---

### 2. DESCOBERTA (`*_DESCOBERTA.md`) ⭐ PREVINE DECISÕES PREMATURAS

**Objetivo:** Checklist de perguntas para análise colaborativa antes de especificar

**Conteúdo:**

- Perguntas críticas sobre dados de origem (estrutura, formatos)
- Análise de mapeamento (campos, transformações necessárias)
- Definição de validações e regras de negócio
- Planejamento de UX (fluxos, pontos de entrada)
- Decisões de arquitetura (persistência, rastreabilidade)
- Definição de MVP e roadmap

**Princípios:**

1. **Baseado em exemplos reais** (não assumir estruturas)
2. **Colaborativo** (desenvolvedor + cliente definem juntos)
3. **Documentação viva** (atualizar conforme descobertas)
4. **Evita retrabalho** (especificar apenas após entender completamente)

**Quando usar:**

- ✅ Funcionalidades com dados externos (formatos desconhecidos)
- ✅ Integrações com sistemas de terceiros
- ✅ Features complexas com muitas incógnitas
- ❌ Funcionalidades com requisitos já claros e definidos

**Público:** Desenvolvedor e cliente/stakeholder (processo colaborativo)

**Exemplo:** [docs/ciclos/IMPORTACAO_ESTRUTURADA_DESCOBERTA.md](./ciclos/IMPORTACAO_ESTRUTURADA_DESCOBERTA.md)

---

### 3. ESPECIFICAÇÃO (`*_ESPECIFICACAO.md`) ⭐ CORAÇÃO DA METODOLOGIA

**Objetivo:** Checklist executável de validações que DEVEM ser testadas

**Conteúdo:**

- Cada validação numerada (V1.1.1, V1.1.2, ...)
- Para cada validação:
  - Descrição clara do que validar
  - **Como validar** (lógica esperada)
  - **Teste correspondente** (caminho do arquivo)
  - **Comportamento esperado** (output/erro)

**Princípios:**

1. **Cada item DEVE ter teste correspondente**
2. **Checklist é a fonte da verdade** (código segue checklist, não o contrário)
3. **Organizado em camadas** (validação de entrada → processamento → saída)
4. **ESPECIFICAÇÃO é write-once** (escrever ao planejar, NÃO atualizar após implementar)

**Público:** Desenvolvedores, QA, Claude (IA assistente)

**Exemplo:** [docs/ciclos/MIGRACAO_ESPECIFICACAO.md](./ciclos/MIGRACAO_ESPECIFICACAO.md)

---

### 4. TÉCNICO (`*_TECNICO.md`)

**Objetivo:** Documentar COMO está implementado (arquitetura, APIs, funções)

**Conteúdo:**

- Fluxo de dados completo
- Componentes e responsabilidades
- APIs (endpoints, payloads)
- Funções críticas (com exemplos de código)
- Decisões técnicas (por que escolhemos X em vez de Y)
- Dependências

**Público:** Desenvolvedores fazendo manutenção ou extensão

**Exemplo:** [docs/ciclos/MIGRACAO_TECNICO.md](./ciclos/MIGRACAO_TECNICO.md)

---

### 5. CICLO DE VIDA (`*_CICLO.md`)

**Objetivo:** Registro cronológico de mudanças, refatorações, bugs corrigidos

**Conteúdo:**

- Data da mudança
- Problema que motivou
- Solução implementada
- Issues/commits relacionados
- Testes afetados
- Impacto (breaking changes?)

**Público:** Gestores, auditoria, debugging de longo prazo

**Exemplo:** [docs/ciclos/MIGRACAO_CICLO.md](./ciclos/MIGRACAO_CICLO.md)

---

## WORKFLOW: COMO USAR NA PRÁTICA

### Cenário 1: Implementar Funcionalidade NOVA (Ainda Explorando)

**Abordagem:** EXPERIMENTAÇÃO PRIMEIRO, TESTES DEPOIS

```
1. CONCEITO (1-2h)
   - Escrever *_CONCEITO.md
   - Definir escopo, fluxo de usuário
   - Validar conceito com stakeholders

2. EXPERIMENTAÇÃO (1-3 dias)
   - Criar protótipo funcional (sem testes formais)
   - Testar manualmente
   - Iterar rapidamente no código
   - Validar viabilidade técnica

3. CONSOLIDAÇÃO (2-3 dias)
   - Quando estabilizar, escrever *_ESPECIFICACAO.md
   - Criar checklist de validações baseado no que funciona
   - Escrever testes para cobrir checklist
   - Refatorar código se necessário para melhorar testabilidade

4. DOCUMENTAÇÃO TÉCNICA (1 dia)
   - Escrever *_TECNICO.md baseado na implementação final
   - Documentar decisões técnicas

5. PRODUÇÃO
   - Iniciar *_CICLO.md com entrada de criação inicial
   - Atualizar CHECKPOINT ao final de cada sessão de trabalho
   - Qualquer mudança futura: TESTE ANTES
```

---

### Cenário 2: Funcionalidade JÁ EXISTE (Adicionar Testes Retrospectivamente)

**Abordagem:** DOCUMENTAR COMPORTAMENTO ATUAL, DEPOIS TESTAR

```
1. CONCEITO (1h)
   - Escrever *_CONCEITO.md baseado no código existente

2. ESPECIFICAÇÃO (2-3h)
   - Analisar código linha a linha
   - Criar checklist de validações que JÁ EXISTEM
   - Identificar GAPS (validações faltando)

3. TESTES (2-4 dias)
   - Escrever testes para validações existentes
   - Garantir que testes passam (validam comportamento atual)
   - Para GAPS críticos: adicionar validação + teste

4. TÉCNICO (1 dia)
   - Documentar implementação atual

5. CICLO DE VIDA (1h)
   - Criar entrada inicial: "Adição de testes retrospectivos"
```

**Caso de Estudo:** Painel de Migração (está neste cenário)

---

### Cenário 3: Adicionar Feature em Funcionalidade ESTÁVEL

**Abordagem:** TESTE PRIMEIRO, SEMPRE (TDD clássico)

```
1. Atualizar *_CONCEITO.md (se escopo mudar)

2. Escrever teste (Red)
   - Criar arquivo de teste
   - Rodar: deve FALHAR (ainda não implementado)

3. Implementar feature (Green)
   - Escrever código mínimo para passar

4. Refatorar (Refactor)
   - Melhorar código mantendo testes verdes

5. Atualizar CHECKPOINT ao final da sessão
```

---

### Cenário 4: Refatoração de Código Existente

**Abordagem:** TESTES GARANTEM SEGURANÇA

```
1. Garantir que *_ESPECIFICACAO.md está completo
   - Todos os comportamentos críticos têm validação?

2. Garantir que testes cobrem comportamento atual
   - Rodar testes: devem PASSAR
   - Verificar coverage: >80% no código a refatorar

3. Executar refatoração
   - Alterar estrutura, nomes, organização

4. Rodar testes continuamente
   - Se FALHAR → refatoração quebrou algo → reverter
   - Se PASSAR → refatoração preservou comportamento ✓

5. Atualizar *_TECNICO.md
   - Documentar nova estrutura

6. Adicionar entrada no *_CICLO.md
   - "Refatoração: movido X para Y, sem mudança de comportamento"
```

---

## SISTEMA DE NUMERAÇÃO DE VALIDAÇÕES

### Hierarquia por Camadas

```
V1.x.x - Camada 1 (ex: Validação de Arquivo - Frontend)
  V1.1.x - Grupo 1 (ex: Estrutura de CSV)
    V1.1.1 - Validação específica (ex: CSV não pode estar vazio)
    V1.1.2 - Validação específica (ex: Headers obrigatórios)
  V1.2.x - Grupo 2 (ex: Detecção de Duplicatas)

V2.x.x - Camada 2 (ex: Validação de Payload - Backend)
V3.x.x - Camada 3 (ex: Processamento de Dados)
...
```

### Exemplo Real (Painel de Migração)

```markdown
## CAMADA 1: VALIDAÇÃO DE ARQUIVO (Frontend)

### V1.1: Estrutura de CSV

- [ ] **V1.1.1** CSV não pode estar vazio

  - **Como validar:** Parser retorna headers.length === 0
  - **Teste:** `tests/unit/csv/parse-empty.test.ts`
  - **Comportamento esperado:** Exibir erro "CSV vazio ou inválido"

- [ ] **V1.1.2** Headers obrigatórios devem estar presentes
  - **Como validar:** Verificar presença de campos obrigatórios
  - **Teste:** `tests/unit/csv/validate-headers.test.ts`
  - **Comportamento esperado:** Exibir erro "Faltando: X, Y, Z"
```

---

## MARCAÇÃO DE STATUS

### Estados de Validação

| Marcação   | Significado                          |
| ---------- | ------------------------------------ |
| `- [ ]`    | Não implementado ainda               |
| `- [x]`    | Implementado E testado (teste passa) |
| `- [ ] ⚠️` | GAP identificado (falta implementar) |
| `- [ ] ❌` | GAP CRÍTICO (bloqueia produção)      |

### Indicadores de Problemas

```markdown
- [ ] **V4.1.1** Transação completa em caso de erro
  - **STATUS:** ❌ **GAP CRÍTICO** - Não implementado
  - **Impacto:** Risco de estado inconsistente no banco
  - **Prioridade:** ALTA
```

---

## INTEGRAÇÃO COM TESTES

### Mapeamento 1:1

**REGRA DE OURO:** Cada validação no checklist → 1 teste (mínimo)

Exemplo:

```markdown
<!-- ESPECIFICACAO.md -->

- [ ] **V3.1.1** Remover prefixo "Ano Letivo:"
  - **Input:** "Ano Letivo: 2024"
  - **Output:** "2024"
  - **Teste:** `tests/unit/lib/limpar-valor.test.ts`
```

```typescript
// tests/unit/lib/limpar-valor.test.ts
import { describe, it, expect } from "vitest";
import { limparValor } from "@/lib/csv-utils";

describe("V3.1: Função limparValor", () => {
  it('V3.1.1: should remove prefix "Ano Letivo:"', () => {
    const result = limparValor("Ano Letivo: 2024", "Ano Letivo:");
    expect(result).toBe("2024");
  });
});
```

### Rastreabilidade

- Nome do `describe` menciona grupo de validações (V3.1)
- Nome do `it` menciona validação específica (V3.1.1)
- Fácil encontrar qual teste valida qual item do checklist

---

## COMANDOS NATURAIS PARA CLAUDE (IA)

Claude deve entender estes comandos ao trabalhar com CIF:

| Comando                       | Ação Esperada                                                      |
| ----------------------------- | ------------------------------------------------------------------ |
| "Implemente V3.7.1"           | Criar teste + código para validação V3.7.1                         |
| "V3.1 está quebrado"          | Rodar testes V3.1.1 a V3.1.5, debugar                              |
| "Adicione validação de RG"    | Criar item no checklist → teste → código                           |
| "Refatore V5"                 | Garantir testes V5.x passam, refatorar, validar                    |
| "Gere relatório de gaps"      | Listar todos ❌ e ⚠️ do checklist                                  |
| "Marque V2.1.2 como completo" | Rodar teste, se passar: marcar [x]                                 |
| "Crie ciclo para Feature X"   | Criar 4 arquivos (\_CONCEITO, \_ESPECIFICACAO, \_TECNICO, \_CICLO) |

---

## TEMPLATES DISPONÍVEIS

Use estes templates ao criar nova funcionalidade:

- [CIF_CONCEITO.template.md](./templates/CIF_CONCEITO.template.md)
- [CIF_ESPECIFICACAO.template.md](./templates/CIF_ESPECIFICACAO.template.md)
- [CIF_TECNICO.template.md](./templates/CIF_TECNICO.template.md)
- [CIF_CICLO.template.md](./templates/CIF_CICLO.template.md)

---

## EXEMPLO COMPLETO: PAINEL DE MIGRAÇÃO

Veja a aplicação completa da metodologia:

- [Conceito](./ciclos/MIGRACAO_CONCEITO.md)
- [Especificação](./ciclos/MIGRACAO_ESPECIFICACAO.md)
- [Técnico](./ciclos/MIGRACAO_TECNICO.md)
- [Ciclo de Vida](./ciclos/MIGRACAO_CICLO.md)

---

## BENEFÍCIOS DA METODOLOGIA

### 1. Previne Buracos Lógicos

- Checklist força pensar em TODOS os casos
- Difícil esquecer validações críticas

### 2. Testes como Especificação

- Testes não são "extras", são parte da spec
- Se não tem teste, não está implementado

### 3. Refatoração Segura

- Testes garantem que comportamento não muda
- Confiança para melhorar código legado

### 4. Documentação Viva

- Especificação atualizada com código
- Histórico de mudanças registrado

### 5. Onboarding Facilitado

- Novo desenvolvedor lê CONCEITO → entende o que é
- Lê ESPECIFICACAO → entende o que deve funcionar
- Lê TECNICO → entende como está implementado

### 6. Amigável a IA

- Claude pode seguir checklist sistematicamente
- Rastreabilidade (V1.1.1 → teste → código)
- Menos ambiguidade = melhor código gerado

---

## ⚠️ REGRA DE OURO: CIF é para FUNCIONALIDADES, não Infraestrutura

**CIF documenta COMPORTAMENTO e LÓGICA DE NEGÓCIO, não infraestrutura.**

### O QUE documentar no CIF:

- ✅ Validações de dados (CPF, RG, campos obrigatórios)
- ✅ Regras de negócio (cálculo de notas, aprovação)
- ✅ Fluxos de usuário (upload → processamento → exibição)
- ✅ Mudanças funcionais (novo filtro, novo campo)
- ✅ Decisões de UX (por que modal em vez de página)

### O QUE NÃO documentar no CIF:

- ❌ Configuração de banco de dados (PostgreSQL vs SQLite)
- ❌ Setup de testes (banco de testes, fixtures)
- ❌ Configuração de ferramentas (Vitest, ESLint)
- ❌ Detalhes de deploy (Docker, ambiente)
- ❌ Dependências técnicas (versões de libs)

### Onde documentar infraestrutura:

- **Comentários no código:** Decisões técnicas pontuais
- **README.md:** Setup inicial, variáveis de ambiente
- **CHECKPOINT.md:** Se bloqueia sessão (temporário)

### Pós-Implementação:

✅ **ÚNICA ação obrigatória:** Atualizar CHECKPOINT ao final da sessão

❌ **NÃO atualizar:**

- ESPECIFICAÇÃO (write-once, não mexer)
- GAPS ou REGRAS DE NEGÓCIO (não existe mais)
- DEBUG documents (não criar)

---

## 📝 PRINCÍPIO DE CONCISÃO

**Documentação CIF deve ser completa, mas não verbosa.**

### Diretrizes:

- Escreva o **mínimo necessário** para entender 6 meses depois
- Evite exemplos de erros passados (não é diário)
- Use listas/tabelas ao invés de parágrafos longos
- Corte narrativas desnecessárias
- Templates são guias, não contratos (adapte ao contexto)

### Balanceamento:

- ✅ Decisões, motivos, consequências
- ✅ O que fazer, onde está, como validar
- ❌ Histórias sobre como chegamos lá
- ❌ Múltiplos exemplos do mesmo ponto
- ❌ Repetição de informações já óbvias

**Meta:** Outra pessoa (ou você no futuro) entende rapidamente sem precisar ler código.

---

## LIMITAÇÕES E TRADE-OFFS

### Quando CIF Adiciona Overhead

- ❌ **Protótipos descartáveis:** Não documente, apenas code
- ❌ **Features triviais:** Um botão não precisa de 4 documentos
- ❌ **Experimentação inicial:** Documente depois de estabilizar

### Custo vs Benefício

| Cenário                              | Custo CIF                  | Benefício CIF                      | Vale a pena? |
| ------------------------------------ | -------------------------- | ---------------------------------- | ------------ |
| Feature complexa (migração de dados) | Alto (2-3 dias doc+testes) | Muito Alto (previne bugs críticos) | ✅ SIM       |
| Feature média (CRUD com validações)  | Médio (1 dia)              | Alto (facilita manutenção)         | ✅ SIM       |
| Feature simples (botão)              | Baixo (30min)              | Baixo (overhead desnecessário)     | ❌ NÃO       |
| Protótipo descartável                | Alto (desperdício)         | Zero (será descartado)             | ❌ NÃO       |

---

## EVOLUÇÃO FUTURA

### Fase 1 (Atual): Metodologia Local

- CIF implementado dentro do projeto
- Validação em uso real
- Iteração e aperfeiçoamento

### Fase 2 (Futuro): Pacote Global

- Extrair para `@seunome/metodologia-cif`
- Publicar no npm/pnpm
- CLI para gerar skeleton de ciclos
- Reutilizar em múltiplos projetos

### Fase 3 (Futuro Distante): Ferramental

- Validador automático (checklist 100% coberto por testes?)
- Gerador de relatórios (coverage por camada)
- Integração com GitHub Actions (CI/CD)

---

## 🎨 REFATORAÇÕES DE UI EM FUNCIONALIDADES CIF

**Quando refatorar interface de funcionalidade CIF, seguir Protocolo de Frontend integrado.**

### Fluxo Obrigatório

1. **PROTOCOLO FRONTEND:** Seguir 3 fases (Captura Visual → Análise → Componentização)
2. **CIF - ATUALIZAR DOCUMENTAÇÃO:**
   - **TECNICO.md:** Atualizar seção de componentes
   - **CICLO.md:** Registrar mudança visual (data, motivo, impacto)
   - **ESPECIFICACAO.md:** Apenas se validações visuais mudarem
3. **CHECKPOINT:** Registrar refatoração com screenshots e componentes modificados

### Documentação Necessária

**No TECNICO.md:**
- Atualizar seção "Componentes" com novos componentes criados/modificados
- Listar componentes genéricos reutilizados de `ui/`
- Documentar decisões de componentização

**No CICLO.md:**
```markdown
### [Data] - Refatoração Visual: [Nome]

**Motivo:** [Por que foi necessário]

**Mudanças:**
- Componentes criados: [lista]
- Componentes modificados: [lista]
- Componentes genéricos reutilizados: [lista]

**Impacto:**
- ✅ Melhoria de UX: [descrição]
- ✅ Redução de código duplicado: [percentual]
- ⚠️ Breaking changes: [se houver]

**Arquivos modificados:**
- [lista completa com linhas]

**Protocolo Frontend aplicado:** ✅ Sim (Fases 1-3)
```

**No CHECKPOINT:**
- Seção "🎨 REFATORAÇÕES VISUAIS (Sessão X)"
- Screenshots antes/depois
- Referência ao CICLO.md atualizado

### Quando NÃO Atualizar ESPECIFICACAO.md

- ❌ Apenas mudanças visuais (cores, espaçamento, layout)
- ❌ Componentização de código existente
- ❌ Melhorias de UX sem alterar validações

### Quando ATUALIZAR ESPECIFICACAO.md

- ✅ Novas validações visuais (ex: campo obrigatório)
- ✅ Mudança em fluxo de interação (ex: modal → página)
- ✅ Adição/remoção de campos de dados

### Referência Completa

Ver: [CLAUDE.md - Integração CIF + Protocolo Frontend](../CLAUDE.md#🔗-integração-cif--protocolo-de-frontend)

Ver: [PROTOCOLO_FRONTEND.md](./PROTOCOLO_FRONTEND.md) - Guia completo em 3 fases

---

## RECURSOS ADICIONAIS

- [Guia de Fluxo de Trabalho](./METODOLOGIA_CIF_FLUXO.md) - Quando usar TDD vs TAD
- [Templates](./templates/) - Arquivos vazios para copiar
- [Exemplo: Painel de Migração](./ciclos/) - Caso de estudo completo
- [Protocolo de Frontend](./PROTOCOLO_FRONTEND.md) - Refatorações visuais em 3 fases

---

## RESUMO EXECUTIVO

**CIF = Checklist Executável + Testes + Documentação em Camadas**

1. ✅ **CONCEITO:** O que é, por que existe (linguagem natural)
2. ⭐ **DESCOBERTA:** Perguntas e análise colaborativa (previne decisões prematuras)
3. ✅ **ESPECIFICAÇÃO:** Checklist de validações → testes (executável)
4. ✅ **TÉCNICO:** Como está implementado (arquitetura)
5. ✅ **CICLO:** Histórico de mudanças (rastreabilidade)

**Quando usar:** Features complexas com alta integridade de dados
**Quando não usar:** Protótipos, features triviais, experimentação

**Resultado:** Código robusto, testado, documentado, manutenível.
