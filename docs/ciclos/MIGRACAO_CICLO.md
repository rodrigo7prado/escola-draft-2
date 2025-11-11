# CICLO DE VIDA: Painel de Migração de Dados CSV

## ÍNDICE DE ENTRADAS

| Data       | Tipo            | Resumo                                                                    | Autor          |
| ---------- | --------------- | ------------------------------------------------------------------------- | -------------- |
| 2025-11-05 | 🧪 Testes       | Testes de integração (61/65 passando) + problema crítico banco descoberto | Claude/Rodrigo |
| 2025-11-05 | 🧪 Testes       | Configuração completa de testes automatizados (Vitest + Husky) + bug fix  | Claude/Rodrigo |
| 2025-01-04 | ♻️ Refatoração  | Extração de funções utilitárias CSV + edge case #9 documentado            | Claude/Rodrigo |
| 2025-01-04 | 📝 Documentação | Criação completa da documentação CIF (Conceito, Especificação, Técnico)   | Claude/Rodrigo |
| 2025-01-04 | 🆕 Criação      | Implementação inicial do Painel de Migração (70% das validações)          | Rodrigo Prado  |

**Legenda de Tipos:**

- 🆕 **Criação:** Implementação inicial da funcionalidade
- 🐛 **Bug Fix:** Correção de comportamento incorreto
- ✨ **Feature:** Nova funcionalidade adicionada
- ♻️ **Refatoração:** Melhoria de código sem mudança de comportamento
- 📝 **Documentação:** Atualização de docs
- 🧪 **Testes:** Adição/modificação de testes
- ⚡ **Performance:** Otimização de performance
- 🔒 **Segurança:** Correção de vulnerabilidade
- 💥 **Breaking Change:** Mudança que quebra compatibilidade

---

## ENTRADAS (Ordem cronológica reversa)

---

### 2025-11-05 - 🧪 Testes de Integração + 🚨 Problema Crítico de Banco

**Autor:** Claude (Anthropic) + Rodrigo Prado

**Contexto:** Implementação de testes de integração (API + banco) conforme Metodologia CIF.

**Mudanças:**

- ✅ Criado `tests/helpers/db-setup.ts` (PostgreSQL connection + cleanup)
- ✅ Criado `tests/helpers/csv-fixtures.ts` (CSV_VALIDO_3_ALUNOS)
- ✅ Criado `tests/integration/api/files-upload.test.ts` (11 testes, 61/65 passando)
- ✅ Documentada decisão PostgreSQL real (ADR-005 em MIGRACAO_TECNICO.md)

**🚨 Problema Crítico Descoberto:**
Testes apagaram dados reais (832 alunos, 1301 enturmações) - `clearTestDatabase()` usa banco de desenvolvimento ao invés de banco separado.

**Impacto:** **BLOQUEADOR** - testes não podem rodar até corrigir.

**Solução pendente:** Criar `certificados_test` + DATABASE_URL_TEST

---

### 2025-01-04 - ♻️ Refatoração: Extração de Funções Utilitárias CSV + Edge Case #9

**Autor:** Claude (Anthropic) + Rodrigo Prado

**Contexto:**

Após completar a documentação CIF, duas necessidades prioritárias foram identificadas:

1. **Duplicação de código crítico:** Função `limparValor()` estava duplicada em 2 lugares de `src/app/api/files/route.ts` (linhas 63-70 e 235-242), violando princípio DRY (Don't Repeat Yourself)
2. **Edge case crítico não documentado:** Descoberto que turma 3004/2024 existia no banco mas sem CSV correspondente, indicando gap na detecção de dados órfãos

**Motivação para "Quick Win":**

- Refatoração pequena (~20min) com alto valor
- Elimina duplicação de função crítica (sem ela, uploads falham)
- Prepara terreno para testes unitários
- JSDoc completo facilita onboarding

**Mudanças Realizadas:**

1. **Criado `src/lib/csv.ts` (85 linhas):**

   - Função `limparValor(valor, prefixo)` - Remove prefixos de valores CSV
   - Função `limparCamposEnturmacao(dados)` - Helper para limpar múltiplos campos de uma vez
   - JSDoc completo com 5+ exemplos práticos
   - Comentários explicando problema que resolve ("value too long for column")

2. **Atualizado `src/app/api/files/route.ts`:**

   - Adicionado import: `import { limparValor } from '@/lib/csv';`
   - Removida duplicação 1 (POST section, linhas 63-70)
   - Removida duplicação 2 (GET section, linhas 235-242)
   - Comentário adicionado indicando origem centralizada
   - Todas 7 chamadas da função agora usam versão importada

3. **Atualizado `docs/ciclos/MIGRACAO_ESPECIFICACAO.md` (linhas 2526-2540):**

   - **Adicionado Edge Case #9:** "Dados no banco SEM arquivo CSV correspondente"
   - **Cenário real:** Turma 3004/2024 existe mas CSV foi deletado (fonteAusente=false incorreto)
   - **Risco:** ALTO - Painel mostra dados inconsistentes
   - **Problema:** GET /api/files compara apenas "CSV → Banco", não "Banco → CSV"
   - **Ação recomendada:** Nova validação V5.3.4 para detectar dados órfãos
   - **Fixtures planejados:**
     - `tests/fixtures/orphaned-data.sql` - Criar aluno/enturmação sem CSV
     - `tests/integration/api/files-orphaned.test.ts` - Validar detecção
   - **Status:** 🔴 GAP CRÍTICO - Não implementado
   - **Prioridade:** ALTA
   - **Estimativa:** 2h

4. **Atualizado `docs/CHECKPOINT_METODOLOGIA_CIF.md`:**
   - Status alterado: "DOCUMENTAÇÃO CIF COMPLETA + REFATORAÇÃO"
   - Seção 5 adicionada: "Refatoração de Código (Quick Win)"
   - OPÇÃO 2 marcada como ✅ CONCLUÍDA
   - Fase 6.5 adicionada ao progresso geral
   - Próxima ação #9 adicionada: "Implementar detecção de edge case #9"

**Arquivos Afetados:**

- `src/lib/csv.ts` - ✅ Criado (85 linhas, 2 funções exportadas)
- `src/app/api/files/route.ts` - ♻️ Refatorado (2 duplicações removidas, 1 import adicionado)
- `docs/ciclos/MIGRACAO_ESPECIFICACAO.md` - 📝 Atualizado (edge case #9 adicionado, linhas 2526-2540)
- `docs/CHECKPOINT_METODOLOGIA_CIF.md` - 📝 Atualizado (progresso e próximas ações)
- `docs/ciclos/MIGRACAO_CICLO.md` - 📝 Atualizado (esta entrada)

**Antes → Depois:**

```typescript
// ANTES: Duplicação em route.ts (2 ocorrências)
const limparValor = (valor: string | undefined, prefixo: string): string => {
  if (!valor) return "";
  const str = valor.toString().trim();
  if (str.startsWith(prefixo)) {
    return str.substring(prefixo.length).trim();
  }
  return str;
};

// DEPOIS: Centralizado em src/lib/csv.ts
import { limparValor } from "@/lib/csv";
```

**Impacto:**

- **Breaking Changes:** Não (refatoração interna)
- **Testes afetados:** Nenhum (não há testes ainda)
- **Performance:** Sem impacto (mesma lógica)
- **Manutenibilidade:** ✅ Melhoria significativa (DRY aplicado)

**Validação:**

- ✅ Código compila sem erros TypeScript
- ✅ Todas 7 chamadas de `limparValor()` agora usam versão centralizada
- ⚠️ Testes manuais recomendados (dev server não rodado)

**Testes:**

- ❌ Nenhum teste automatizado criado (próxima fase)
- ✅ Estrutura pronta para `tests/unit/lib/limparValor.test.ts`
- ✅ JSDoc com exemplos facilita criação de casos de teste

**Lições Aprendidas:**

1. **"Quick Wins" têm alto ROI:**

   - 20min de trabalho eliminaram tech debt crítico
   - Refatoração simples facilita testes futuros
   - JSDoc bem escrito economiza tempo de manutenção

2. **Edge cases emergem durante documentação:**

   - Edge case #9 só foi identificado ao analisar dados reais
   - Documentação sistemática (CIF) revela problemas invisíveis
   - Usuário (Rodrigo) é fonte valiosa de cenários reais

3. **Função crítica merece atenção especial:**

   - `limparValor()` é literalmente crítica - sem ela, nada funciona
   - Duplicação passou despercebida por não ter destaque suficiente
   - Centralização + JSDoc dão visibilidade merecida

4. **Edge case de dados órfãos é comum:**
   - Cenário: CSV deletado, mas dados no banco (fonteAusente=false)
   - Pode ocorrer por: migração manual, correção direta no banco, bug em delete
   - Validação reversa ("Banco → CSV") é tão importante quanto "CSV → Banco"

**Próximas Ações:**

1. ✅ Testar refatoração manualmente (restart dev server recomendado)
2. ⏳ Configurar ambiente de testes (Vitest + Playwright) - **PRÓXIMO RECOMENDADO**
3. ⏳ Criar `tests/unit/lib/limparValor.test.ts` (casos de teste já mapeados no JSDoc)
4. ⏳ Implementar detecção de edge case #9:
   - Query reversa: buscar Alunos/Enturmações sem LinhaImportada correspondente
   - Marcar `fonteAusente=true` automaticamente
   - Exibir badge visual "⚠️ Sem origem CSV" no Painel de Migração
5. ⏳ Corrigir bugs críticos (V5.3.3, V8.1.2, V2.4.1)

**Commits:**

- Pendente (não commitado ainda)

**Issues/PRs:**

- N/A (refatoração interna)

**Notas Adicionais:**

- **IDE pode mostrar erro temporário:** Após refatoração, VSCode/IDE pode cachear referências antigas. Solução: Restart dev server ou reload window.
- **Função `limparCamposEnturmacao()` não usada ainda:** Criada para facilitar uso futuro, mas pode ser aplicada em `route.ts` para reduzir ainda mais código repetitivo.

---

### 2025-01-04 - 📝 Documentação: Criação Completa da Documentação CIF

**Autor:** Claude (Anthropic) + Rodrigo Prado

**Contexto:**

Painel de Migração foi implementado e está funcional, mas sem documentação formal. Isso dificultava manutenção, onboarding de novos desenvolvedores e identificação sistemática de bugs/gaps. Decisão de aplicar **Metodologia CIF (Ciclo de Integridade de Funcionalidades)** retrospectivamente para:

1. Documentar completamente a funcionalidade existente
2. Identificar gaps críticos e não-críticos
3. Planejar testes e melhorias futuras
4. Criar base de conhecimento para evolução

**Mudanças Realizadas:**

1. **Criado MIGRACAO_CONCEITO.md (390 linhas):**

   - Visão geral do problema e solução
   - Fluxo do usuário completo (5 passos)
   - 9 conceitos-chave explicados
   - Escopo definido (o que está/não está incluído)
   - Stakeholders e métricas de sucesso

2. **Criado MIGRACAO_ESPECIFICACAO.md (1247 linhas):**

   - **80 validações** organizadas em 8 camadas
   - Status atual: **56 implementadas (70%)**, 24 pendentes (30%)
   - **3 gaps críticos** identificados
   - **10 gaps não-críticos** documentados
   - 8 casos extremos mapeados
   - 9 regras de negócio formalizadas
   - 20+ arquivos de teste planejados

3. **Criado MIGRACAO_TECNICO.md (~1000 linhas):**

   - Arquitetura de 3 camadas detalhada
   - Stack tecnológica com versões exatas
   - Fluxo de dados end-to-end (upload + delete)
   - 3 componentes React documentados
   - 3 APIs Next.js documentadas
   - 3 funções críticas (hashData, limparValor, parseCsvLoose)
   - 4 models Prisma explicados
   - 4 decisões técnicas (ADRs)
   - Performance, segurança, debugging, testes (estrutura)
   - 5 problemas de troubleshooting com soluções

4. **Criado MIGRACAO_CICLO.md (este arquivo):**
   - Registro de histórico de mudanças
   - Framework para futuras entradas

**Arquivos Afetados:**

- `docs/ciclos/MIGRACAO_CONCEITO.md` - Criado
- `docs/ciclos/MIGRACAO_ESPECIFICACAO.md` - Criado
- `docs/ciclos/MIGRACAO_TECNICO.md` - Criado
- `docs/ciclos/MIGRACAO_CICLO.md` - Criado
- `docs/CHECKPOINT_METODOLOGIA_CIF.md` - Atualizado com progresso

**Validações Documentadas:**

- **V1 (Frontend):** 10 validações - 7 ✅, 3 ⬜
- **V2 (Backend):** 9 validações - 7 ✅, 2 ⬜
- **V3 (Transformação):** 7 validações - 7 ✅ (100% completo!)
- **V4 (Banco):** 18 validações - 13 ✅, 4 ⚠️, 1 ❌
- **V5 (Visualização):** 11 validações - 6 ✅, 4 ⚠️, 1 ❌
- **V6 (Delete):** 12 validações - 10 ✅, 2 ⚠️
- **V7 (Erros):** 6 validações - 4 ✅, 2 ⚠️
- **V8 (Sincronização):** 7 validações - 2 ✅, 4 ⬜, 1 ❌

**Gaps Críticos Identificados:**

1. **V2.4.1 - Transação Completa:**

   - **Problema:** POST /api/files não usa transação atômica
   - **Risco:** Se falhar no meio (ex: criar Arquivo mas falhar em Aluno), estado inconsistente
   - **Prioridade:** Alta
   - **Solução planejada:** Envolver tudo em `prisma.$transaction()`

2. **V5.3.3 - Identificar Alunos Pendentes:**

   - **Problema:** GET /api/files retorna arrays vazios para `alunosPendentes`
   - **Risco:** Usuário não sabe quais alunos faltam criar no banco
   - **Prioridade:** Alta
   - **Solução planejada:** Debugar lógica de comparação CSV vs Banco (linha 359-361 de route.ts)

3. **V8.1.2 - Sincronização Frontend-Backend:**
   - **Problema:** Após upload, visualização não atualiza corretamente
   - **Risco:** Dados inconsistentes entre backend e UI
   - **Prioridade:** Alta
   - **Solução planejada:** Relacionado a V5.3.3, corrigir em conjunto

**Gaps Não-Críticos (Top 5):**

1. **V4.2.2:** Usar `createMany()` ao invés de loop de `create()` (performance)
2. **V1.3.2:** Validação de tamanho máximo de arquivo (UX)
3. **V2.3.1:** Validação de schema com Zod (segurança)
4. **V6.5.1:** Permitir re-importação (funciona, mas não testado)
5. **V7.3.1:** Rate limiting (segurança)

**Testes:**

- ⚠️ **Nenhum teste automatizado ainda**
- ✅ Estrutura de testes planejada em MIGRACAO_TECNICO.md
- ✅ 20+ arquivos de teste identificados na ESPECIFICACAO.md
- 📝 Próxima fase: configurar Vitest + Playwright

**Commits:**

- Documentação criada via sessão com Claude (não commitada ainda)

**Issues/PRs:**

- N/A (documentação interna)

**Impacto:**

- **Breaking Changes:** Não (apenas documentação)
- **Migrations necessárias:** Não
- **Deploy notes:** Nenhuma

**Lições Aprendidas:**

1. **Metodologia CIF é eficaz retrospectivamente:**

   - Mesmo aplicada após implementação, conseguiu identificar 3 bugs críticos que estavam passando despercebidos
   - Checklist sistemático (80 validações) revelou gaps que análise ad-hoc não detectaria

2. **Documentação técnica completa vale o investimento:**

   - ~3-4h de trabalho geraram ~3000 linhas de documentação
   - Troubleshooting documentado vai economizar horas de debugging futuro
   - ADRs (decisões técnicas) explicam "por quês" que código não explica

3. **Funções críticas merecem destaque:**

   - `limparValor()` é crítica mas estava duplicada e sem documentação
   - Sem ela, todo upload falharia com "value too long for column"
   - Precisa ser refatorada para `src/lib/csv.ts` urgentemente

4. **Visualização hierárquica tem bug silencioso:**
   - GET /api/files retorna dados, mas frontend não processa corretamente
   - Bug não causa erro visível, apenas dados vazios
   - Difícil de detectar sem testes ou documentação

**Próximas Ações:**

1. ✅ Configurar ambiente de testes (Vitest + Playwright)
2. ✅ Extrair `limparValor()` para `src/lib/csv.ts` (refatoração DRY)
3. ✅ Implementar testes prioritários:
   - `tests/unit/lib/limparValor.test.ts` (V3.1.1 a V3.2.2)
   - `tests/unit/lib/hashData.test.ts` (V2.2.1)
   - `tests/integration/api/files.post.test.ts` (V2.x, V4.x)
4. 🐛 Corrigir bugs críticos:
   - V5.3.3: Debugar `alunosPendentes` vazios
   - V8.1.2: Sincronização frontend-backend
   - V2.4.1: Implementar transação completa
5. 📊 Gerar relatório de coverage após testes implementados

---

### 2025-01-04 - 🆕 Criação: Implementação Inicial do Painel de Migração

**Autor:** Rodrigo Prado

**Contexto:**

Sistema de emissão de certificados para alunos de Ensino Médio precisava importar dados históricos a partir de arquivos CSV exportados do **Conexão Educação (SEEDUC-RJ)**. Desafios principais:

1. **Dados desorganizados:** CSVs vêm com prefixos em todos os valores

   - Ex: "Ano Letivo: 2024", "Modalidade: REGULAR", "Turma: 3001"
   - Sem limpeza, causaria erro "value too long for column"

2. **Estrutura não-hierárquica:** Dados planos, sem organização por período/turma

3. **Duplicatas:** Risco de importar mesmo arquivo múltiplas vezes

4. **Rastreabilidade:** Precisava manter origem dos dados para auditoria

5. **Re-importação:** Correções nos CSVs originais exigiam deletar e reimportar

**Mudanças Realizadas:**

1. **Modelo de Banco de Dados (3 Camadas):**

   - **Camada 1 (Origem - Imutável):**
     - `ArquivoImportado` - Metadados do CSV (nome, hash SHA-256, status)
     - `LinhaImportada` - Dados originais em JSONB (preserva prefixos)
   - **Camada 2 (Estruturada - Editável):**
     - `Aluno` - Dados normalizados do aluno (sem prefixos)
     - `Enturmacao` - Múltiplas enturmações por aluno (anoLetivo, turma, serie)
   - **Camada 3 (Auditoria):**
     - `Auditoria` - Histórico de edições (não implementado ainda)

2. **API de Upload (POST /api/files):**

   - Parser CSV customizado (`parseCsvLoose`) - tolerante a BOM, aspas, linhas vazias
   - Cálculo de hash SHA-256 (dados ordenados) para detecção de duplicatas
   - Função crítica `limparValor()` para remover prefixos
   - Criação de registros em 3 models: ArquivoImportado, LinhaImportada, Aluno
   - Criação de Enturmacao com deduplicação por (alunoId, anoLetivo, turma, serie)

3. **API de Visualização (GET /api/files):**

   - Hierarquia: Período Letivo → Turma → Alunos
   - Cálculo de resumo (total CSV, total banco, pendentes)
   - Identificação de alunos faltando no banco (⚠️ bugado)

4. **API de Delete (DELETE /api/files):**

   - Hard delete de ArquivoImportado (remove hash → permite re-importação)
   - Cascade delete de LinhaImportada (libera storage JSONB)
   - SetNull em Aluno/Enturmacao.linhaOrigemId
   - Marcar `fonteAusente=true` para entidades órfãs

5. **Interface de Usuário:**
   - `MigrateUploads.tsx` - Container principal com estado
   - `DropCsv.tsx` - Drag-and-drop de arquivo CSV
   - `PeriodoCard.tsx` - Visualização hierárquica por período
   - Validação de headers obrigatórios (14 campos)
   - Detecção de duplicatas locais (múltiplos uploads)

**Arquivos Afetados:**

- `prisma/schema.prisma` - Models: ArquivoImportado, LinhaImportada, Aluno, Enturmacao
- `src/app/api/files/route.ts` - APIs: POST, GET, DELETE (549 linhas)
- `src/components/MigrateUploads.tsx` - Container principal
- `src/components/DropCsv.tsx` - Upload + parsing
- `src/components/PeriodoCard.tsx` - Visualização hierárquica
- `package.json` - Dependências: Next.js 16, React 19.2, Prisma 6.18

**Decisões Técnicas Principais:**

1. **3 Camadas de Dados:**

   - **Por quê:** Rastreabilidade completa + permitir edição + histórico
   - **Trade-off:** Complexidade maior, mais storage (JSONB)

2. **Hard Delete ao invés de Soft Delete:**

   - **Por quê:** Liberar hash → permitir re-importação
   - **Trade-off:** Não recuperável (mas entidades estruturadas preservadas)

3. **Parser CSV Customizado:**

   - **Por quê:** CSVs do Conexão têm formato não-padrão (headers não na linha 1, BOM, etc)
   - **Trade-off:** Responsabilidade de manter código de parsing

4. **Função limparValor():**
   - **Por quê:** CSVs vêm com prefixos que quebram colunas do banco
   - **Crítico:** Sem essa função, todo upload falharia
   - **Problema:** Função duplicada em 2 lugares (precisa refatorar)

**Validações Implementadas:**

- **56/80 validações (70%)** implementadas (checklist criado posteriormente)
- **Camada V3 (Transformação):** 100% completa (7/7 validações)
- **Camadas V1, V2, V4, V6:** Maioria implementada (~70-80%)
- **Camadas V5, V7, V8:** Parcialmente implementadas (~30-60%)

**Testes:**

- ⚠️ **Testes manuais realizados com CSVs reais do Conexão**
- ❌ **Sem testes automatizados** (tech debt identificado)
- ✅ **Funciona em produção** para importação de ~800 alunos

**Commits:**

- `42ae1d2` - refactor: refatorando estrutura de Painel de Migração
- `796dd09` - docs: criando documentação de ciclo de vida e registro para resolução de problemas
- (múltiplos commits anteriores durante implementação)

**Issues/PRs:**

- N/A (implementação inicial do projeto)

**Impacto:**

- **Breaking Changes:** N/A (implementação inicial)
- **Migrations necessárias:** Sim (primeira migration)
  ```bash
  pnpx prisma migrate dev --name initial_migration_models
  ```
- **Deploy notes:**
  - Requer PostgreSQL configurado
  - Variável `DATABASE_URL` em `.env.local`
  - Porta customizada: 3006 (`pnpm dev`)

**Problemas Conhecidos (na época):**

1. ⚠️ Visualização hierárquica mostra dados vazios (detectado depois)
2. ⚠️ Frontend não sincroniza após upload (detectado depois)
3. ⚠️ Sem transação completa - risco de estado inconsistente (detectado depois)

**Lições Aprendidas:**

1. **Função crítica sem destaque suficiente:**

   - `limparValor()` é essencial mas estava "escondida" no código
   - Sem documentação, futuro desenvolvedor poderia não entender sua importância
   - Duplicação passou despercebida (violação de DRY)

2. **Arquitetura de 3 camadas funcionou muito bem:**

   - Rastreabilidade completa (JSONB preserva original)
   - Permitiu edição manual de dados estruturados
   - Hard delete + SetNull permitiu re-importação

3. **Falta de testes desde início criou tech debt:**

   - Bugs sutis (arrays vazios) passaram despercebidos
   - Refatoração futura será mais arriscada sem testes
   - **Aplicar Metodologia CIF desde o início em próximas features**

4. **Parser customizado deu controle, mas exige manutenção:**

   - Flexibilidade de buscar headers em qualquer linha foi essencial
   - Mas precisa de testes abrangentes (BOM, aspas, casos extremos)

5. **Documentação técnica deveria ser criada junto com código:**
   - Criar retrospectivamente funciona, mas é mais trabalhoso
   - ADRs (decisões técnicas) são mais fáceis de escrever durante implementação

**Próximas Ações (planejadas na época):**

1. ✅ Implementar visualização hierárquica funcional
2. ✅ Adicionar botão de delete por período
3. ⬜ Criar testes (adiado por prioridade de outras features)
4. ⬜ Adicionar sistema de auditoria (Camada 3)
5. ⬜ Implementar re-importação (funcionou sem implementação explícita)

---

## ESTATÍSTICAS

### Resumo de Mudanças por Tipo

| Tipo            | Quantidade | %        |
| --------------- | ---------- | -------- |
| 🆕 Criação      | 1          | 33%      |
| 📝 Documentação | 1          | 33%      |
| ♻️ Refatoração  | 1          | 33%      |
| **TOTAL**       | **3**      | **100%** |

### Contribuidores

| Autor          | Entradas | Período |
| -------------- | -------- | ------- |
| Rodrigo Prado  | 1        | 2025-01 |
| Claude/Rodrigo | 2        | 2025-01 |

---

## MÉTRICAS DE QUALIDADE

### Coverage de Testes

| Data       | Coverage | Trend | Observações                                      |
| ---------- | -------- | ----- | ------------------------------------------------ |
| 2025-01-04 | 0%       | N/A   | Sem testes automatizados (implementação inicial) |

**Meta:** 80% de coverage após implementação de testes planejados

### Validações Implementadas (ESPECIFICACAO.md)

| Data       | Total | Implementadas | %   | Gaps Críticos |
| ---------- | ----- | ------------- | --- | ------------- |
| 2025-01-04 | 80    | 56            | 70% | 3             |

**Meta:** 90% (72/80 validações) implementadas até próxima milestone

### Bugs Conhecidos

| Data       | Reportados | Críticos | Não-Críticos | Corrigidos | Abertos |
| ---------- | ---------- | -------- | ------------ | ---------- | ------- |
| 2025-01-04 | 3          | 3        | 10           | 0          | 13      |

**Bugs críticos abertos:**

- V5.3.3: Identificar alunos pendentes (arrays vazios)
- V8.1.2: Sincronização frontend-backend
- V2.4.1: Transação completa não implementada

---

## ROADMAP FUTURO

### Melhorias Planejadas (Próximas 2-4 semanas)

**Fase 1 - Testes (Prioridade Alta):**

- [ ] Configurar Vitest + Playwright
- [ ] Implementar testes unitários para funções críticas
  - [ ] `tests/unit/lib/limparValor.test.ts` (V3.1.1 a V3.2.2)
  - [ ] `tests/unit/lib/hashData.test.ts` (V2.2.1)
  - [ ] `tests/unit/components/parseCsv.test.ts` (V1.1.3, V1.1.4, V1.2.1)
- [ ] Implementar testes de integração para APIs
  - [ ] `tests/integration/api/files.post.test.ts` (V2.x, V4.x)
  - [ ] `tests/integration/api/files.get.test.ts` (V5.x)
  - [ ] `tests/integration/api/files.delete.test.ts` (V6.x)
- [ ] Meta: Atingir 60% de coverage

**Fase 2 - Correções de Bugs Críticos (Prioridade Alta):**

- [ ] V5.3.3: Corrigir identificação de alunos pendentes
- [ ] V8.1.2: Corrigir sincronização frontend-backend
- [ ] V2.4.1: Implementar transação completa em POST /api/files
- [ ] Validar correções com testes automatizados

**Fase 3 - Refatorações (Prioridade Média):**

- [ ] Extrair `limparValor()` para `src/lib/csv.ts` (DRY)
- [ ] Extrair outras funções utilitárias de CSV
- [ ] Refatorar queries de banco para melhor performance (batch queries)
- [ ] Meta: Reduzir tempo de upload de CSV em 50%

**Fase 4 - Features Novas (Prioridade Baixa):**

- [ ] Implementar Camada 3 (Auditoria) completa
- [ ] Adicionar visualização de histórico de edições
- [ ] Implementar exportação de dados (CSV/Excel)
- [ ] Adicionar filtros avançados na visualização hierárquica

**Fase 5 - Segurança e UX (Prioridade Média):**

- [ ] Implementar autenticação/autorização (NextAuth.js)
- [ ] Adicionar rate limiting em APIs
- [ ] Validar schema de CSV com Zod (V2.3.1)
- [ ] Adicionar validação de tamanho máximo de arquivo (V1.3.2)
- [ ] Melhorar feedback visual de upload (progress bar)

### Metas de Longo Prazo (2-6 meses)

- [ ] 90% de coverage de testes
- [ ] 0 bugs críticos abertos
- [ ] 95% das validações (76/80) implementadas
- [ ] Documentação completa de todos os casos extremos
- [ ] Testes E2E cobrindo fluxos principais
- [ ] Performance: Upload de 1000 alunos em <3s

---

## DEPENDÊNCIAS E INTEGRAÇÕES

### Sistemas Externos

| Sistema                      | Tipo           | Descrição                                 | Status   |
| ---------------------------- | -------------- | ----------------------------------------- | -------- |
| Conexão Educação (SEEDUC-RJ) | Fonte de Dados | Exporta CSVs de atas de resultados finais | ✅ Ativo |
| PostgreSQL                   | Banco de Dados | Armazenamento de dados estruturados       | ✅ Ativo |

### Dependências Críticas

| Dependência | Versão     | Motivo                       | Risco de Breaking Change |
| ----------- | ---------- | ---------------------------- | ------------------------ |
| Next.js     | 16.0.0     | Framework (API Routes + SSR) | Baixo                    |
| React       | 19.2.0     | UI Library                   | Baixo                    |
| Prisma      | 6.18.0     | ORM (banco de dados)         | Médio                    |
| TypeScript  | ^5         | Type safety                  | Baixo                    |
| PostgreSQL  | (qualquer) | Banco de dados               | Baixo                    |

**Notas:**

- Prisma tem risco médio pois mudanças no schema exigem migrations
- Não usa bibliotecas de parsing CSV (Parser customizado)

---

## REFERÊNCIAS

- **Documentação relacionada:**

  - [Conceito](./MIGRACAO_CONCEITO.md) - Visão geral, problema, solução
  - [Especificação](./MIGRACAO_ESPECIFICACAO.md) - 80 validações, casos de teste
  - [Documentação Técnica](./MIGRACAO_TECNICO.md) - Arquitetura, APIs, funções

- **Guias:**

  - [Metodologia CIF](../METODOLOGIA_CIF.md) - Metodologia completa
  - [Fluxo de Trabalho CIF](../METODOLOGIA_CIF_FLUXO.md) - Como usar CIF

- **Templates:**

  - [Template de Conceito](../templates/CIF_CONCEITO.template.md)
  - [Template de Especificação](../templates/CIF_ESPECIFICACAO.template.md)
  - [Template Técnico](../templates/CIF_TECNICO.template.md)
  - [Template de Ciclo de Vida](../templates/CIF_CICLO.template.md)

- **Commits importantes:**
  - `42ae1d2` - Refatoração da estrutura do Painel
  - `796dd09` - Criação da documentação de ciclo de vida

---

**Data de criação:** 2025-01-04
**Última atualização:** 2025-01-04
**Mantido por:** Rodrigo Prado
**Versão da implementação:** v1.0.0
**Status do ciclo:** 🟡 Em evolução ativa (bugs críticos + testes pendentes)
