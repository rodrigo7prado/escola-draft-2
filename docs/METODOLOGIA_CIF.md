# METODOLOGIA CIF (Ciclo de Integridade de Funcionalidade)

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

### 4 Níveis de Documentação

```
NÍVEL 1: CONCEITO                    (Para humanos - O QUÊ e POR QUÊ)
  ↓
NÍVEL 2: ESPECIFICAÇÃO               (Para testes - Checklist executável)
  ↓
NÍVEL 3: TÉCNICO                     (Para desenvolvedores - COMO)
  ↓
NÍVEL 4: CICLO DE VIDA               (Para histórico - QUANDO e MUDANÇAS)
```

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

### 2. ESPECIFICAÇÃO (`*_ESPECIFICACAO.md`) ⭐ CORAÇÃO DA METODOLOGIA

**Objetivo:** Checklist executável de validações que DEVEM ser testadas

**Conteúdo:**
- Cada validação numerada (V1.1.1, V1.1.2, ...)
- Para cada validação:
  - [ ] Checkbox (marcado quando implementado E testado)
  - Descrição clara do que validar
  - **Como validar** (lógica esperada)
  - **Teste correspondente** (caminho do arquivo)
  - **Comportamento esperado** (output/erro)

**Princípios:**
1. **Cada item DEVE ter teste correspondente**
2. **Apenas marcar [x] quando teste passar**
3. **Checklist é a fonte da verdade** (código segue checklist, não o contrário)
4. **Organizado em camadas** (validação de entrada → processamento → saída)

**Público:** Desenvolvedores, QA, Claude (IA assistente)

**Exemplo:** [docs/ciclos/MIGRACAO_ESPECIFICACAO.md](./ciclos/MIGRACAO_ESPECIFICACAO.md)

---

### 3. TÉCNICO (`*_TECNICO.md`)

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

### 4. CICLO DE VIDA (`*_CICLO.md`)

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
   - Marcar itens [x] conforme testes passam

4. DOCUMENTAÇÃO TÉCNICA (1 dia)
   - Escrever *_TECNICO.md baseado na implementação final
   - Documentar decisões técnicas

5. PRODUÇÃO
   - Iniciar *_CICLO.md com entrada de criação inicial
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

2. Adicionar validações ao *_ESPECIFICACAO.md
   - [ ] V3.8.1 Nova validação de CPF único
   - Teste: tests/integration/unique-cpf.test.ts

3. Escrever teste (Red)
   - Criar arquivo de teste
   - Rodar: deve FALHAR (ainda não implementado)

4. Implementar feature (Green)
   - Escrever código mínimo para passar

5. Refatorar (Refactor)
   - Melhorar código mantendo testes verdes

6. Marcar [x] no checklist

7. Atualizar *_TECNICO.md (se arquitetura mudar)

8. Adicionar entrada no *_CICLO.md
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

| Marcação | Significado |
|----------|-------------|
| `- [ ]` | Não implementado ainda |
| `- [x]` | Implementado E testado (teste passa) |
| `- [ ] ⚠️` | GAP identificado (falta implementar) |
| `- [ ] ❌` | GAP CRÍTICO (bloqueia produção) |

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
import { describe, it, expect } from 'vitest';
import { limparValor } from '@/lib/csv-utils';

describe('V3.1: Função limparValor', () => {
  it('V3.1.1: should remove prefix "Ano Letivo:"', () => {
    const result = limparValor('Ano Letivo: 2024', 'Ano Letivo:');
    expect(result).toBe('2024');
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

| Comando | Ação Esperada |
|---------|---------------|
| "Implemente V3.7.1" | Criar teste + código para validação V3.7.1 |
| "V3.1 está quebrado" | Rodar testes V3.1.1 a V3.1.5, debugar |
| "Adicione validação de RG" | Criar item no checklist → teste → código |
| "Refatore V5" | Garantir testes V5.x passam, refatorar, validar |
| "Gere relatório de gaps" | Listar todos ❌ e ⚠️ do checklist |
| "Marque V2.1.2 como completo" | Rodar teste, se passar: marcar [x] |
| "Crie ciclo para Feature X" | Criar 4 arquivos (_CONCEITO, _ESPECIFICACAO, _TECNICO, _CICLO) |

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

## LIMITAÇÕES E TRADE-OFFS

### Quando CIF Adiciona Overhead

- ❌ **Protótipos descartáveis:** Não documente, apenas code
- ❌ **Features triviais:** Um botão não precisa de 4 documentos
- ❌ **Experimentação inicial:** Documente depois de estabilizar

### Custo vs Benefício

| Cenário | Custo CIF | Benefício CIF | Vale a pena? |
|---------|-----------|---------------|--------------|
| Feature complexa (migração de dados) | Alto (2-3 dias doc+testes) | Muito Alto (previne bugs críticos) | ✅ SIM |
| Feature média (CRUD com validações) | Médio (1 dia) | Alto (facilita manutenção) | ✅ SIM |
| Feature simples (botão) | Baixo (30min) | Baixo (overhead desnecessário) | ❌ NÃO |
| Protótipo descartável | Alto (desperdício) | Zero (será descartado) | ❌ NÃO |

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

## RECURSOS ADICIONAIS

- [Guia de Fluxo de Trabalho](./METODOLOGIA_CIF_FLUXO.md) - Quando usar TDD vs TAD
- [Templates](./templates/) - Arquivos vazios para copiar
- [Exemplo: Painel de Migração](./ciclos/) - Caso de estudo completo

---

## RESUMO EXECUTIVO

**CIF = Checklist Executável + Testes + Documentação em Camadas**

1. ✅ **CONCEITO:** O que é, por que existe (linguagem natural)
2. ✅ **ESPECIFICAÇÃO:** Checklist de validações → testes (executável)
3. ✅ **TÉCNICO:** Como está implementado (arquitetura)
4. ✅ **CICLO:** Histórico de mudanças (rastreabilidade)

**Quando usar:** Features complexas com alta integridade de dados
**Quando não usar:** Protótipos, features triviais, experimentação

**Resultado:** Código robusto, testado, documentado, manutenível.
