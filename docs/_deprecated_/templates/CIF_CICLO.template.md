# CICLO DE VIDA: [Nome da Funcionalidade]

<!--
INSTRUÇÕES DE USO:
1. Este documento registra TODAS as mudanças ao longo do tempo
2. Substitua [Nome da Funcionalidade] pelo nome descritivo
3. Adicione nova entrada a cada mudança significativa
4. Organize em ordem cronológica REVERSA (mais recente primeiro)
5. Inclua commits, issues e PRs relacionados
6. Delete estas instruções antes de finalizar
-->

## ÍNDICE DE ENTRADAS

| Data | Tipo | Resumo | Autor |
|------|------|--------|-------|
| [YYYY-MM-DD] | [Tipo] | [Resumo em 1 linha] | [Nome] |
| [YYYY-MM-DD] | [Tipo] | [Resumo em 1 linha] | [Nome] |

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

### [YYYY-MM-DD] - [Tipo]: [Título da Mudança]

**Autor:** [Nome]

**Contexto:**

[Descreva o problema ou motivação que levou a esta mudança]

**Mudanças Realizadas:**

1. [Mudança 1]
2. [Mudança 2]
3. [Mudança 3]

**Arquivos Afetados:**

- `[caminho/arquivo1.ts]` - [Descrição da mudança]
- `[caminho/arquivo2.tsx]` - [Descrição da mudança]

**Validações Atualizadas:**

- ✅ V[X].[Y].[Z] - [Nome da validação] - Marcada como completa
- ⬜ V[X].[Y].[W] - [Nome da validação] - Adicionada ao checklist
- ♻️ V[X].[Y].[Q] - [Nome da validação] - Refatorada

**Testes:**

- ✅ Novos testes adicionados:
  - `tests/[caminho]/[arquivo].test.ts` - [Descrição]
- ✅ Testes existentes atualizados:
  - `tests/[caminho]/[outro].test.ts` - [Descrição]
- ✅ Todos os testes passando: `pnpm test`

**Commits:**

- [`abc1234`](link-do-commit) - [Mensagem do commit 1]
- [`def5678`](link-do-commit) - [Mensagem do commit 2]

**Issues/PRs:**

- Issue: [#123 - Título da issue](link)
- PR: [#124 - Título do PR](link)

**Impacto:**

- **Breaking Changes:** [Sim/Não - Se sim, descreva]
- **Migrations necessárias:** [Sim/Não - Se sim, descreva]
- **Deploy notes:** [Instruções especiais para deploy, se houver]

**Lições Aprendidas:**

[O que descobrimos durante esta mudança que pode ser útil no futuro]

---

### [YYYY-MM-DD] - 🐛 Bug Fix: [Exemplo de Bug]

**Autor:** João Silva

**Contexto:**

Usuários reportaram que alunos com `fonteAusente=true` não mostravam aviso visual na interface. Isso dificultava identificar quais alunos tinham dados desconectados da origem.

**Mudanças Realizadas:**

1. Adicionado campo `avisoFonteAusente` no response da API GET `/api/alunos/[id]`
2. Criado componente `<AlertFonteAusente>` para exibir aviso visual
3. Atualizado `DadosAlunoEditavel.tsx` para renderizar alerta quando aplicável

**Arquivos Afetados:**

- `src/app/api/alunos/[id]/route.ts` - Adicionado campo `avisoFonteAusente` no response
- `src/components/AlertFonteAusente.tsx` - Criado componente de alerta
- `src/components/DadosAlunoEditavel.tsx` - Integrado alerta na UI

**Validações Atualizadas:**

- ✅ V5.2.1 - API deve retornar flag `avisoFonteAusente` - Marcada como completa
- ✅ V5.2.2 - UI deve mostrar aviso amarelo para fonte ausente - Marcada como completa

**Testes:**

- ✅ Novos testes adicionados:
  - `tests/integration/api/alunos-fonte-ausente.test.ts` - Valida response da API
  - `tests/unit/components/AlertFonteAusente.test.tsx` - Renderização do alerta
- ✅ Todos os testes passando: `pnpm test`

**Commits:**

- [`abc1234`](link) - fix: add avisoFonteAusente to alunos API response
- [`def5678`](link) - feat: create AlertFonteAusente component
- [`ghi9012`](link) - test: add coverage for fonte ausente warning

**Issues/PRs:**

- Issue: [#45 - Aviso de fonte ausente não aparece](link)
- PR: [#46 - Fix fonte ausente warning](link)

**Impacto:**

- **Breaking Changes:** Não
- **Migrations necessárias:** Não
- **Deploy notes:** Nenhuma

**Lições Aprendidas:**

Sempre testar fluxos visuais com dados em diferentes estados (fonte presente, fonte ausente, editado manualmente). Considerar adicionar testes E2E para fluxos visuais críticos.

---

### [YYYY-MM-DD] - ♻️ Refatoração: [Exemplo de Refatoração]

**Autor:** Maria Santos

**Contexto:**

Função `limparValor` estava duplicada em 3 lugares diferentes, violando princípio DRY. Isso dificultava manutenção e aumentava risco de inconsistências.

**Mudanças Realizadas:**

1. Criado arquivo `src/lib/csv-utils.ts` com funções utilitárias de CSV
2. Movido função `limparValor` para este arquivo
3. Removido duplicatas de `src/app/api/files/route.ts` (2 ocorrências)
4. Atualizado imports em todos os arquivos afetados

**Arquivos Afetados:**

- `src/lib/csv-utils.ts` - Criado (nova localização da função)
- `src/app/api/files/route.ts` - Removido duplicatas, adicionado import
- `scripts/migrar-enturmacoes.ts` - Atualizado import

**Validações Atualizadas:**

- ✅ V3.1.1 a V3.1.5 - Função limparValor - Testes continuam passando (sem mudança de comportamento)

**Testes:**

- ✅ Nenhum teste novo necessário (refatoração sem mudança de comportamento)
- ✅ Testes existentes continuam passando:
  - `tests/unit/lib/limpar-valor.test.ts` - Atualizado caminho do import
- ✅ Todos os testes passando: `pnpm test`

**Commits:**

- [`abc1234`](link) - refactor: extract limparValor to csv-utils (DRY)

**Issues/PRs:**

- Issue: [#67 - Tech debt: duplicated limparValor function](link)
- PR: [#68 - Refactor: extract CSV utilities](link)

**Impacto:**

- **Breaking Changes:** Não (função interna)
- **Migrations necessárias:** Não
- **Deploy notes:** Nenhuma

**Lições Aprendidas:**

Sempre buscar oportunidades de DRY durante code reviews. Funções duplicadas devem ser extraídas imediatamente para evitar divergências futuras.

---

### [YYYY-MM-DD] - ✨ Feature: [Exemplo de Nova Feature]

**Autor:** Pedro Oliveira

**Contexto:**

Usuários precisavam reimportar dados de períodos letivos após correções no arquivo CSV original. Não havia forma de deletar um período inteiro de forma segura.

**Mudanças Realizadas:**

1. Criado endpoint DELETE `/api/periodos/[anoLetivo]`
2. Implementado soft delete com confirmação em 2 passos na UI
3. Adicionado flag `fonteAusente` para entidades órfãs
4. Implementado princípio: deletar CSV (hard delete) + SetNull em entidades estruturadas

**Arquivos Afetados:**

- `src/app/api/periodos/[anoLetivo]/route.ts` - Criado endpoint DELETE
- `src/components/MigrateUploads.tsx` - Adicionado botão de delete por período
- `prisma/schema.prisma` - Atualizado onDelete: SetNull em FKs
- `src/lib/delete-periodo.ts` - Lógica de delete seguro

**Validações Atualizadas:**

- ✅ V6.1.1 - Delete de ArquivoImportado remove hash - Marcada como completa
- ✅ V6.1.2 - Delete de LinhaImportada via cascade - Marcada como completa
- ✅ V6.2.1 - Aluno.linhaOrigemId → NULL (SetNull) - Marcada como completa
- ✅ V6.2.2 - Enturmacao.linhaOrigemId → NULL (SetNull) - Marcada como completa
- ✅ V6.3.1 - Marcar fonteAusente=true após delete - Marcada como completa

**Testes:**

- ✅ Novos testes adicionados:
  - `tests/integration/api/delete-periodo.test.ts` - Fluxo completo de delete
  - `tests/unit/lib/delete-periodo.test.ts` - Lógica de SetNull e fonteAusente
- ✅ Todos os testes passando: `pnpm test`

**Commits:**

- [`abc1234`](link) - feat: add DELETE endpoint for periodos
- [`def5678`](link) - feat: implement soft delete UI with confirmation
- [`ghi9012`](link) - feat: add fonteAusente flag logic
- [`jkl3456`](link) - test: add coverage for delete-periodo flow

**Issues/PRs:**

- Issue: [#89 - Permitir reimportação de períodos](link)
- PR: [#90 - Feat: safe period deletion with reimport support](link)

**Impacto:**

- **Breaking Changes:** Não (feature nova)
- **Migrations necessárias:** Sim
  ```bash
  pnpx prisma migrate dev --name add_fonte_ausente_flag
  ```
- **Deploy notes:**
  1. Rodar migration antes de deploy
  2. Backup do banco de dados recomendado

**Lições Aprendidas:**

O princípio de "Hard delete origem + SetNull estrutura" funciona muito bem para manter rastreabilidade enquanto permite reimportação. Considerar aplicar este padrão em outras funcionalidades similares.

---

### [YYYY-MM-DD] - 🧪 Testes: Adição de Testes Retrospectivos

**Autor:** Ana Costa

**Contexto:**

Código do Painel de Migração foi implementado e está funcional em produção há 2 meses, mas não possui testes automatizados. Isso dificulta refatorações e aumenta risco de regressão.

**Mudanças Realizadas:**

1. Criado `MIGRACAO_ESPECIFICACAO.md` com 68 validações identificadas
2. Implementado testes unitários para funções críticas (limparValor, hashData)
3. Implementado testes de integração para APIs principais
4. Configurado ambiente de testes (Vitest + fixtures)

**Arquivos Afetados:**

- `tests/unit/lib/limpar-valor.test.ts` - Criado (V3.1.1 a V3.1.5)
- `tests/unit/lib/hash-data.test.ts` - Criado (V2.1.2)
- `tests/integration/api/files-upload.test.ts` - Criado (V3.5, V3.6)
- `tests/integration/api/files-duplicate.test.ts` - Criado (V2.2.1, V2.2.2)
- `tests/helpers/db-setup.ts` - Criado (helper de setup/teardown)
- `tests/fixtures/alunos-sample.csv` - Criado (dados mockados)

**Validações Atualizadas:**

- ✅ V3.1.1 a V3.1.5 - Função limparValor - Todas marcadas como completas
- ✅ V2.1.2 - Hash determinístico - Marcada como completa
- ✅ V2.2.1, V2.2.2 - Detecção de duplicatas - Marcadas como completas
- ⚠️ V4.1.1 - Transação completa - GAP identificado (não implementado)

**Testes:**

- ✅ 18 novos testes adicionados
- ✅ Coverage: 72% (meta: 80%)
- ✅ Todos os testes passando: `pnpm test`

**Commits:**

- [`abc1234`](link) - test: add unit tests for limparValor
- [`def5678`](link) - test: add integration tests for file upload API
- [`ghi9012`](link) - test: create test helpers and fixtures

**Issues/PRs:**

- Issue: [#100 - Tech debt: add tests for Painel de Migração](link)
- PR: [#101 - Test: retrospective test coverage for migration panel](link)

**Impacto:**

- **Breaking Changes:** Não
- **Migrations necessárias:** Não
- **Deploy notes:** Nenhuma (apenas testes)

**Lições Aprendidas:**

Adicionar testes retrospectivamente é mais trabalhoso do que escrever testes durante implementação. Revelar gaps críticos (como falta de transação) que passaram despercebidos. Validou a Metodologia CIF: checklist ajudou a identificar sistematicamente o que testar.

---

### [YYYY-MM-DD] - 🆕 Criação: Implementação Inicial

**Autor:** [Nome do desenvolvedor original]

**Contexto:**

Sistema precisava importar dados de alunos a partir de arquivos CSV do Conexão Educação (SEEDUC-RJ). Dados vinham desorganizados e sem estrutura hierárquica.

**Mudanças Realizadas:**

1. Criado modelo de banco de dados em 3 camadas (Origem, Estruturada, Auditoria)
2. Implementado upload de CSV com drag-and-drop
3. Implementado parser de CSV com Papa Parse
4. Criado API POST `/api/files` para processar upload
5. Implementado detecção de duplicatas por hash SHA-256
6. Criado visualização hierárquica por período letivo e turma

**Arquivos Afetados:**

- `prisma/schema.prisma` - Models: ArquivoImportado, LinhaImportada, Aluno, Enturmacao
- `src/app/api/files/route.ts` - API de upload
- `src/components/MigrateUploads.tsx` - UI de upload
- `src/app/api/filtros/route.ts` - API de opções hierárquicas
- `src/lib/csv-parser.ts` - Lógica de parsing

**Validações Atualizadas:**

- ✅ ~40 validações implementadas (sem checklist formal na época)

**Testes:**

- ⚠️ Testes manuais realizados
- ❌ Sem testes automatizados

**Commits:**

- [`abc1234`](link) - feat: initial implementation of migration panel
- (múltiplos commits durante 2 semanas de desenvolvimento)

**Issues/PRs:**

- Issue: [#10 - Implementar importação de CSV do Conexão](link)
- PR: [#15 - Feat: CSV import and migration panel](link)

**Impacto:**

- **Breaking Changes:** N/A (implementação inicial)
- **Migrations necessárias:** Sim (primeira migration)
  ```bash
  pnpx prisma migrate dev --name initial_migration_panel
  ```
- **Deploy notes:** Requer setup inicial de banco PostgreSQL

**Lições Aprendidas:**

Implementação funcionou bem, mas falta de testes dificulta manutenção. Em funcionalidades futuras similares, aplicar Metodologia CIF desde o início.

---

## ESTATÍSTICAS

### Resumo de Mudanças por Tipo

| Tipo | Quantidade | % |
|------|------------|---|
| 🆕 Criação | 1 | 20% |
| 🐛 Bug Fix | 1 | 20% |
| ✨ Feature | 1 | 20% |
| ♻️ Refatoração | 1 | 20% |
| 🧪 Testes | 1 | 20% |
| **TOTAL** | **5** | **100%** |

### Contribuidores

| Autor | Commits | Período |
|-------|---------|---------|
| [Nome 1] | 15 | 2024-06 a 2024-12 |
| [Nome 2] | 8 | 2024-08 a 2024-12 |

---

## MÉTRICAS DE QUALIDADE

### Coverage de Testes

| Data | Coverage | Trend |
|------|----------|-------|
| 2025-01-04 | 72% | +72% (inicial) |
| [data] | [%] | [+/-X%] |

### Bugs Reportados vs Corrigidos

| Data | Reportados | Corrigidos | Abertos |
|------|------------|------------|---------|
| 2025-01 | 3 | 3 | 0 |
| [mês] | [X] | [Y] | [Z] |

---

## ROADMAP FUTURO

### Melhorias Planejadas

- [ ] Atingir 90% de coverage de testes
- [ ] Implementar transação completa (V4.1.1 - gap crítico)
- [ ] Adicionar testes E2E com Playwright
- [ ] Refatorar parsing de CSV para async/streaming (performance)

---

## REFERÊNCIAS

- **Documentação relacionada:**
  - [Conceito](./[NOME]_CONCEITO.md)
  - [Especificação](./[NOME]_ESPECIFICACAO.md)
  - [Documentação Técnica](./[NOME]_TECNICO.md)

- **Guias:**
  - [Metodologia CIF](../METODOLOGIA_CIF.md)
  - [Como Adicionar Entrada](../METODOLOGIA_CIF.md#ciclo-de-vida)

---

**Data de criação:** [YYYY-MM-DD]
**Última atualização:** [YYYY-MM-DD]
**Mantido por:** [Nome da equipe/pessoa]
