# CICLO DE VIDA: Importação Estruturada por Texto

**Status:** 🟡 Em Desenvolvimento
**Metodologia:** CIF (Ciclo de Integridade de Funcionalidades)
**Fase:** CICLO DE VIDA
**Criado em:** 2025-01-09
**Última atualização:** 2025-01-09

---

## ÍNDICE

1. [Roadmap de Implementação](#1-roadmap-de-implementação)
2. [Fases de Desenvolvimento](#2-fases-de-desenvolvimento)
3. [Sprints e Entregas](#3-sprints-e-entregas)
4. [Plano de Testes](#4-plano-de-testes)
5. [Critérios de Aceite por Fase](#5-critérios-de-aceite-por-fase)
6. [Riscos e Mitigações](#6-riscos-e-mitigações)

---

## 1. ROADMAP DE IMPLEMENTAÇÃO

### 1.1 Visão Geral das Fases

```
┌─────────────────────────────────────────────────────────────┐
│                    FASE 1: FUNDAÇÃO                         │
│  ✓ Migration do banco de dados                             │
│  ✓ Módulo de parsing (detectar tipo + parsePagina1)        │
│  ✓ API básica (receber texto + validar matrícula)          │
│  Duração estimada: 2-3 dias                                 │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│                 FASE 2: UI BÁSICA - PÁGINA 1                │
│  ✓ Componente BotaoModoColagem                             │
│  ✓ Componente AreaColagem                                  │
│  ✓ Dialog de resumo (sem sexo ainda)                       │
│  ✓ Fluxo básico: colar → parse → revisar → salvar          │
│  Duração estimada: 3-4 dias                                 │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│              FASE 3: VALIDAÇÃO DE SEXO                      │
│  ✓ Normalização de sexo (Masculino → M)                    │
│  ✓ Dialog de confirmação de sexo                           │
│  ✓ Fluxo condicional (com/sem sexo)                        │
│  Duração estimada: 1-2 dias                                 │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│                  FASE 4: PÁGINA 2                           │
│  ✓ Detecção de Página 2                                    │
│  ✓ Armazenamento de texto bruto                            │
│  ✓ Dialog de confirmação simples                           │
│  Duração estimada: 1 dia                                    │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│                FASE 5: MERGE VISUAL                         │
│  ✓ Hook useMergeVisual                                     │
│  ✓ Badge de campo editado (✏️)                             │
│  ✓ Tooltip com comparação (original vs editado)            │
│  ✓ Resumo de campos editados                               │
│  Duração estimada: 2-3 dias                                 │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│            FASE 6: VALIDAÇÕES E POLIMENTO                   │
│  ✓ Validação de CPF                                        │
│  ✓ Validação de datas                                      │
│  ✓ Tratamento de erros completo                            │
│  ✓ Feedback visual aprimorado                              │
│  Duração estimada: 2-3 dias                                 │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│                  FASE 7: TESTES E DEPLOY                    │
│  ✓ Testes unitários (parsing)                              │
│  ✓ Testes de integração (API)                              │
│  ✓ Testes E2E (fluxo completo)                             │
│  ✓ Teste com usuário real                                  │
│  ✓ Deploy em produção                                      │
│  Duração estimada: 3-4 dias                                 │
└─────────────────────────────────────────────────────────────┘

📊 DURAÇÃO TOTAL ESTIMADA: 15-20 dias úteis (~3-4 semanas)
```

---

## 2. FASES DE DESENVOLVIMENTO

### 2.1 FASE 1: FUNDAÇÃO

**Objetivo:** Criar a base técnica (banco de dados, parsing, API básica)

#### Tarefas:

| ID     | Tarefa                                  | Responsável | Prioridade | Estimativa |
| ------ | --------------------------------------- | ----------- | ---------- | ---------- |
| F1-001 | Criar migration Prisma (novos campos)   | Dev Backend | 🔴 Crítico | 1h         |
| F1-002 | Rodar migration no banco local          | Dev Backend | 🔴 Crítico | 15min      |
| F1-003 | Implementar `detectarTipoPagina.ts`     | Dev Backend | 🔴 Crítico | 2h         |
| F1-004 | Implementar `parsePagina1.ts`           | Dev Backend | 🔴 Crítico | 3h         |
| F1-005 | Implementar `normalizarSexo.ts`         | Dev Backend | 🟡 Médio   | 30min      |
| F1-006 | Criar API `/api/importacao-estruturada` | Dev Backend | 🔴 Crítico | 3h         |
| F1-007 | Testar parsing com exemplos reais       | Dev Backend | 🔴 Crítico | 1h         |

**Critérios de Aceite:**

- ✅ Migration executada com sucesso
- ✅ API recebe texto e retorna dados parseados
- ✅ Detecção de tipo funciona (Página 1 vs 2)
- ✅ 100% dos 12 campos parseados corretamente

**Duração:** 2-3 dias

---

### 2.2 FASE 2: UI BÁSICA - PÁGINA 1

**Objetivo:** Criar interface de colagem e fluxo básico de importação

#### Tarefas:

| ID     | Tarefa                                             | Responsável  | Prioridade | Estimativa |
| ------ | -------------------------------------------------- | ------------ | ---------- | ---------- |
| F2-001 | Criar `BotaoModoColagem.tsx`                       | Dev Frontend | 🔴 Crítico | 2h         |
| F2-002 | Criar `AreaColagem.tsx`                            | Dev Frontend | 🔴 Crítico | 3h         |
| F2-003 | Criar `DialogResumoPagina1.tsx`                    | Dev Frontend | 🔴 Crítico | 3h         |
| F2-004 | Criar hook `useImportacaoEstruturada`              | Dev Frontend | 🔴 Crítico | 4h         |
| F2-005 | Integrar componentes na página de Gestão de Alunos | Dev Frontend | 🔴 Crítico | 2h         |
| F2-006 | Testar fluxo completo (colar → revisar → salvar)   | QA           | 🔴 Crítico | 2h         |

**Critérios de Aceite:**

- ✅ Toggle "Modo Colagem" aparece APENAS no aluno ativo
- ✅ Textarea aparece ao ativar toggle
- ✅ Dialog de resumo mostra 12 campos
- ✅ Dados salvos em `dadosOriginais` (JSONB)
- ✅ Campos normais do banco NÃO são alterados

**Duração:** 3-4 dias

---

### 2.3 FASE 3: VALIDAÇÃO DE SEXO

**Objetivo:** Implementar fluxo condicional para confirmar sexo quando ausente

#### Tarefas:

| ID     | Tarefa                                             | Responsável  | Prioridade | Estimativa |
| ------ | -------------------------------------------------- | ------------ | ---------- | ---------- |
| F3-001 | Criar `DialogConfirmarSexo.tsx`                    | Dev Frontend | 🔴 Crítico | 2h         |
| F3-002 | Adicionar lógica condicional no hook               | Dev Frontend | 🔴 Crítico | 1h         |
| F3-003 | Atualizar API para retornar `precisaConfirmarSexo` | Dev Backend  | 🔴 Crítico | 1h         |
| F3-004 | Testar fluxo SEM sexo no texto                     | QA           | 🔴 Crítico | 1h         |
| F3-005 | Testar normalização (Masculino → M)                | QA           | 🟡 Médio   | 30min      |

**Critérios de Aceite:**

- ✅ Dialog de sexo aparece quando campo ausente
- ✅ Normalização funciona (Masculino/Feminino → M/F)
- ✅ Fluxo prossegue para dialog de resumo após confirmar sexo
- ✅ Cancelamento funciona corretamente

**Duração:** 1-2 dias

---

### 2.4 FASE 4: PÁGINA 2

**Objetivo:** Implementar importação de texto bruto (histórico escolar)

#### Tarefas:

| ID     | Tarefa                                                 | Responsável  | Prioridade | Estimativa |
| ------ | ------------------------------------------------------ | ------------ | ---------- | ---------- |
| F4-001 | Adicionar detecção de Página 2 em `detectarTipoPagina` | Dev Backend  | 🔴 Crítico | 1h         |
| F4-002 | Implementar salvamento de texto bruto na API           | Dev Backend  | 🔴 Crítico | 1h         |
| F4-003 | Criar `DialogConfirmacaoPagina2.tsx`                   | Dev Frontend | 🟡 Médio   | 1h         |
| F4-004 | Atualizar hook para lidar com Página 2                 | Dev Frontend | 🟡 Médio   | 1h         |
| F4-005 | Testar importação de Página 2                          | QA           | 🟡 Médio   | 30min      |

**Critérios de Aceite:**

- ✅ Sistema detecta Página 2 corretamente
- ✅ Texto salvo em `textoHistoricoOriginal` (campo TEXT)
- ✅ Flag `pagina2Importada` atualizado
- ✅ Dialog de confirmação aparece
- ✅ Check visual ✅ "Página 2 importada" funciona

**Duração:** 1 dia

---

### 2.5 FASE 5: MERGE VISUAL

**Objetivo:** Implementar visualização de merge (dadosOriginais vs campos normais)

#### Tarefas:

| ID     | Tarefa                                            | Responsável  | Prioridade | Estimativa |
| ------ | ------------------------------------------------- | ------------ | ---------- | ---------- |
| F5-001 | Criar hook `useMergeVisual`                       | Dev Frontend | 🔴 Crítico | 3h         |
| F5-002 | Criar componente `BadgeCampoEditado.tsx`          | Dev Frontend | 🟡 Médio   | 1h         |
| F5-003 | Adicionar tooltips de comparação                  | Dev Frontend | 🟡 Médio   | 2h         |
| F5-004 | Implementar resumo de campos editados             | Dev Frontend | 🟡 Médio   | 2h         |
| F5-005 | Integrar merge visual na página de dados do aluno | Dev Frontend | 🔴 Crítico | 2h         |
| F5-006 | Testar merge com dados editados vs originais      | QA           | 🔴 Crítico | 2h         |

**Critérios de Aceite:**

- ✅ Campos normais sobrepõem `dadosOriginais` na visualização
- ✅ Badge ✏️ aparece quando campo foi editado
- ✅ Tooltip mostra "Original: X / Editado: Y"
- ✅ Resumo mostra "N campos editados manualmente"

**Duração:** 2-3 dias

---

### 2.6 FASE 6: VALIDAÇÕES E POLIMENTO

**Objetivo:** Adicionar validações extras e melhorar UX

#### Tarefas:

| ID     | Tarefa                                     | Responsável  | Prioridade | Estimativa |
| ------ | ------------------------------------------ | ------------ | ---------- | ---------- |
| F6-001 | Implementar `validarCPF.ts`                | Dev Backend  | 🟡 Médio   | 2h         |
| F6-002 | Implementar `validarData.ts`               | Dev Backend  | 🟡 Médio   | 1h         |
| F6-003 | Adicionar validações na API                | Dev Backend  | 🟡 Médio   | 2h         |
| F6-004 | Melhorar mensagens de erro (não técnicas)  | Dev Frontend | 🟡 Médio   | 1h         |
| F6-005 | Adicionar loading states (spinners)        | Dev Frontend | 🟢 Baixo   | 1h         |
| F6-006 | Adicionar animações de transição (dialogs) | Dev Frontend | 🟢 Baixo   | 1h         |
| F6-007 | Testar validações com dados inválidos      | QA           | 🟡 Médio   | 2h         |

**Critérios de Aceite:**

- ✅ CPF inválido: avisa, mas permite salvar
- ✅ Data inválida: avisa, mas permite salvar
- ✅ Erros em linguagem clara (não técnica)
- ✅ Loading states funcionam
- ✅ Transições suaves entre dialogs

**Duração:** 2-3 dias

---

### 2.7 FASE 7: TESTES E DEPLOY

**Objetivo:** Garantir qualidade e colocar em produção

#### Tarefas:

| ID     | Tarefa                              | Responsável  | Prioridade | Estimativa |
| ------ | ----------------------------------- | ------------ | ---------- | ---------- |
| F7-001 | Escrever testes unitários (parsing) | Dev Backend  | 🔴 Crítico | 3h         |
| F7-002 | Escrever testes de integração (API) | Dev Backend  | 🔴 Crítico | 3h         |
| F7-003 | Escrever testes E2E (Playwright)    | QA           | 🟡 Médio   | 4h         |
| F7-004 | Teste com usuário real (secretaria) | QA + Usuário | 🔴 Crítico | 2h         |
| F7-005 | Correções de bugs encontrados       | Dev          | 🔴 Crítico | Variável   |
| F7-006 | Deploy em ambiente de staging       | DevOps       | 🔴 Crítico | 1h         |
| F7-007 | Teste de regressão em staging       | QA           | 🔴 Crítico | 2h         |
| F7-008 | Deploy em produção                  | DevOps       | 🔴 Crítico | 1h         |
| F7-009 | Monitoramento pós-deploy (24h)      | DevOps       | 🔴 Crítico | -          |

**Critérios de Aceite:**

- ✅ 100% dos testes unitários passando
- ✅ 100% dos testes de integração passando
- ✅ Testes E2E cobrem fluxos principais
- ✅ Usuário real consegue usar sem treinamento
- ✅ Zero bugs críticos em produção nas primeiras 24h

**Duração:** 3-4 dias

---

## 3. SPRINTS E ENTREGAS

### Sprint 1 (Semana 1)

**Foco:** Fundação + UI Básica

**Entregas:**

- ✅ Migration do banco executada
- ✅ Módulo de parsing funcionando
- ✅ API básica implementada
- ✅ Toggle + Área de colagem funcionando
- ✅ Dialog de resumo implementado

**Demo:** Mostrar fluxo básico de importação (sem validação de sexo ainda)

---

### Sprint 2 (Semana 2)

**Foco:** Validações + Página 2 + Merge Visual

**Entregas:**

- ✅ Dialog de confirmação de sexo
- ✅ Normalização de sexo funcionando
- ✅ Importação de Página 2 (texto bruto)
- ✅ Merge visual implementado
- ✅ Badges e tooltips funcionando

**Demo:** Mostrar fluxo completo com validações + merge visual

---

### Sprint 3 (Semana 3)

**Foco:** Validações extras + Testes + Deploy

**Entregas:**

- ✅ Validações de CPF e data
- ✅ Mensagens de erro aprimoradas
- ✅ Testes unitários e E2E
- ✅ Deploy em staging
- ✅ Teste com usuário real
- ✅ Deploy em produção

**Demo:** Apresentação final + coleta de feedback

---

## 4. PLANO DE TESTES

### 4.1 Testes Unitários

**Módulo de Parsing:**

- ✅ `detectarTipoPagina` - 5 casos de teste
- ✅ `parsePagina1` - 10 casos de teste (com/sem campos opcionais)
- ✅ `normalizarSexo` - 7 casos de teste
- ✅ `validarCPF` - 8 casos de teste
- ✅ `validarData` - 6 casos de teste

**Total:** ~36 testes unitários

---

### 4.2 Testes de Integração

**APIs:**

- ✅ POST `/api/importacao-estruturada` - Página 1 com sexo
- ✅ POST `/api/importacao-estruturada` - Página 1 sem sexo
- ✅ POST `/api/importacao-estruturada` - Página 2
- ✅ POST `/api/importacao-estruturada` - Matrícula inexistente (erro)
- ✅ POST `/api/importacao-estruturada` - Formato inválido (erro)
- ✅ POST `/api/importacao-estruturada/salvar` - Salvar dados Página 1

**Total:** ~6 testes de integração

---

### 4.3 Testes E2E (Playwright)

**Fluxos principais:**

1. ✅ Importar Página 1 com todos os campos (incluindo sexo)
2. ✅ Importar Página 1 sem sexo (com dialog de confirmação)
3. ✅ Importar Página 2
4. ✅ Cancelar dialog de sexo
5. ✅ Cancelar dialog de resumo
6. ✅ Verificar merge visual (campo editado vs original)
7. ✅ Verificar checks visuais (✅ Página 1 e 2 importadas)
8. ✅ Erro: matrícula inexistente

**Total:** ~8 testes E2E

---

### 4.4 Teste com Usuário Real

**Roteiro:**

1. Entregar sistema sem manual
2. Pedir para importar dados de 3 alunos:
   - 1 com Página 1 completa
   - 1 com Página 1 sem sexo
   - 1 com Página 2
3. Observar dificuldades e pontos de confusão
4. Coletar feedback qualitativo

**Critérios de sucesso:**

- Usuário consegue importar sem perguntar como fazer
- Menos de 2 erros por fluxo
- Feedback geral positivo

---

## 5. CRITÉRIOS DE ACEITE POR FASE

### Fase 1: Fundação

- [ ] Migration executada sem erros
- [ ] Campos novos existem no banco
- [ ] `detectarTipoPagina` retorna 'pagina1', 'pagina2' ou null corretamente
- [ ] `parsePagina1` extrai 12 campos corretamente
- [ ] API retorna dados parseados

### Fase 2: UI Básica

- [ ] Toggle "Modo Colagem" aparece APENAS no aluno ativo
- [ ] Área de colagem aparece ao ativar toggle
- [ ] Dialog de resumo mostra 12 campos
- [ ] Dados salvos em `dadosOriginais` (verificar no banco)
- [ ] Campos normais NÃO são alterados

### Fase 3: Validação de Sexo

- [ ] Dialog de sexo aparece quando necessário
- [ ] Normalização funciona (Masculino → M)
- [ ] Fluxo prossegue após confirmar sexo
- [ ] Cancelamento funciona

### Fase 4: Página 2

- [ ] Sistema detecta Página 2
- [ ] Texto salvo em `textoHistoricoOriginal`
- [ ] Flag `pagina2Importada` = true
- [ ] Dialog de confirmação aparece
- [ ] Check visual ✅ funciona

### Fase 5: Merge Visual

- [ ] Campos normais sobrepõem `dadosOriginais`
- [ ] Badge ✏️ aparece quando editado
- [ ] Tooltip mostra comparação
- [ ] Resumo de campos editados funciona

### Fase 6: Validações

- [ ] CPF inválido avisa mas permite salvar
- [ ] Data inválida avisa mas permite salvar
- [ ] Mensagens de erro são claras
- [ ] Loading states funcionam

### Fase 7: Testes e Deploy

- [ ] Todos os testes passando
- [ ] Teste com usuário real bem-sucedido
- [ ] Deploy em produção sem erros
- [ ] Zero bugs críticos nas primeiras 24h

---

## 6. RISCOS E MITIGAÇÕES

### 6.1 Riscos Técnicos

| Risco                                     | Probabilidade | Impacto | Mitigação                                  |
| ----------------------------------------- | ------------- | ------- | ------------------------------------------ |
| Formato de texto muda no sistema oficial  | Média         | Alto    | Armazenar texto bruto para reprocessamento |
| Performance do parsing com textos grandes | Baixa         | Médio   | Otimizar regex + timeout de 2s             |
| Conflito de dados (original vs editado)   | Média         | Médio   | Merge visual claro + tooltip explicativo   |
| Bug em validação de CPF                   | Baixa         | Baixo   | Avisar mas permitir salvar (não bloquear)  |

### 6.2 Riscos de UX

| Risco                                     | Probabilidade | Impacto | Mitigação                                |
| ----------------------------------------- | ------------- | ------- | ---------------------------------------- |
| Usuário não entende toggle "Modo Colagem" | Média         | Médio   | Label descritivo + tooltip               |
| Usuário não percebe dialog de resumo      | Baixa         | Alto    | Dialog modal (bloqueia outras ações)     |
| Usuário confunde Página 1 e 2             | Baixa         | Médio   | Detecção automática (sem escolha manual) |
| Usuário cancela importação por engano     | Média         | Baixo   | Confirmação antes de fechar dialog       |

### 6.3 Riscos de Prazo

| Risco                                          | Probabilidade | Impacto | Mitigação                                  |
| ---------------------------------------------- | ------------- | ------- | ------------------------------------------ |
| Fase 5 (Merge Visual) demora mais que estimado | Média         | Médio   | Pode ser adiada para versão 2.0            |
| Bugs encontrados no teste com usuário real     | Alta          | Alto    | Buffer de 2 dias extras no cronograma      |
| Deploy em produção falha                       | Baixa         | Alto    | Testar em staging primeiro + rollback plan |

---

## 7. CHECKLIST DE ENTREGA FINAL

### Antes do Deploy em Produção:

- [ ] Todos os testes (unitários, integração, E2E) passando
- [ ] Teste com usuário real aprovado
- [ ] Documentação atualizada (README, CLAUDE.md)
- [ ] Migration testada em staging
- [ ] Rollback plan documentado
- [ ] Monitoramento configurado (logs, erros)
- [ ] Backup do banco de dados criado

### Pós-Deploy (24h):

- [ ] Monitorar logs de erro
- [ ] Verificar performance das queries
- [ ] Coletar feedback inicial dos usuários
- [ ] Criar issues para melhorias futuras

---

## 8. MELHORIAS FUTURAS (v2.0)

### Funcionalidades:

- 🔮 Parsing automático de Página 2 (histórico escolar)
- 🔮 Importação em lote (múltiplos alunos)
- 🔮 OCR integrado (upload de imagem → texto)
- 🔮 Histórico de importações (log de alterações)
- 🔮 Comparação lado a lado (original vs atual)
- 🔮 Exportar dados para correção em planilha

### Melhorias de UX:

- 🔮 Atalhos de teclado (Ctrl+V para colar)
- 🔮 Preview antes de importar
- 🔮 Undo/Redo de importações
- 🔮 Busca por alunos com dados incompletos

---

**📌 CHECKPOINT:** Documento CICLO DE VIDA completo.

**Status:** ✅ Pronto
**Duração total estimada:** 15-20 dias úteis (3-4 semanas)

---

## PRÓXIMOS PASSOS IMEDIATOS

1. **Revisão dos 4 documentos** (DESCOBERTA, CONCEITO, ESPECIFICAÇÃO, TÉCNICO, CICLO)
2. **Aprovação para iniciar implementação**
3. **Criar branch:** `feature/importacao-estruturada`
4. **Iniciar Sprint 1** (Fase 1: Fundação)
