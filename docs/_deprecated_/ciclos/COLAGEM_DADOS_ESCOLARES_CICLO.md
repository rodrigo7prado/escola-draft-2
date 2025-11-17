# CICLO DE VIDA: Colagem de Dados Escolares

**Status:** 🟡 Planejamento
**Metodologia:** CIF (Ciclo de Integridade de Funcionalidades)
**Fase:** CICLO DE VIDA
**Criado em:** 2025-11-14
**Última atualização:** 2025-11-14

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

```
F0 ──┬───────────┬───────────┬───────────┐
     │           │           │           │
     Fase 0      Fase 1      Fase 2      Fase 3
(alinhamento) (parser + DB) (UI/UX)   (testes + doc)
     │           │           │           │
     └──── 2 dias┴──── 3 dias┴──── 3 dias┴──── 2 dias
```

- **Fase 0 (Alinhamento CIF):** organizar documentação, responsáveis e exemplos.
- **Fase 1 (Parser + Persistência):** modelagem Prisma, parser, APIs.
- **Fase 2 (UI/UX):** indicadores, modal, integração com hooks.
- **Fase 3 (Testes + Documentação):** suíte completa + atualização CIF e checkpoint.

---

## 2. FASES DE DESENVOLVIMENTO

### Fase 0 – Alinhamento (D0–D1)

- Criar arquivos CIF (conceito, descoberta, especificação, técnico, ciclo).
- Consolidar exemplos reais e fixtures de testes.
- Definir responsáveis por parser, backend e frontend.

### Fase 1 – Parser & Persistência (D2–D4)

- Atualizar schema Prisma (`dadosEscolares` + índice).
- Implementar `parseDadosEscolares` com testes unitários.
- Ajustar rota `/api/importacao-estruturada` para categoria `dadosEscolares`.
- Garantir salvamento do texto bruto + JSON + timestamp.
- O salvamento do texto bruto excluirá dados de menu e usuário do sistema. Apenas importam os dados dos alunos.

### Fase 2 – UI/UX (D5–D7)

- Atualizar `useModoColagem` para trabalhar com múltiplas categorias.
- Utilizar o mesmo status de colagem já presente para os dados pessoais.
- Implementar reconhecimento de colagem de dados pessoais/dados escolares.
- Renomear `ModalConfirmacaoDados` para `ModalConfirmacaoDadosPessoais`.
- Criar `ModalConfirmacaoDadosEscolares` com seção escolar somente leitura.
- Validar experiência de reimportação e feedbacks visuais.

### Fase 3 – Testes & Documentação (D8–D9)

- Expandir testes (unit, integração e snapshot visual dos indicadores).
- Atualizar CIF (ESPECIFICAÇÃO + TÉCNICO + CICLO) com resultados finais.
- Registrar aprendizados e métricas no checkpoint principal (`docs/CHECKPOINT_METODOLOGIA_CIF.md`).

---

## 3. SPRINTS E ENTREGAS

| Sprint   | Duração | Objetivos Principais             | Entregáveis                                                       |
| -------- | ------- | -------------------------------- | ----------------------------------------------------------------- |
| Sprint 1 | 3 dias  | Fase 0 + início da Fase 1        | Arquivos CIF criados, schema Prisma atualizado, parser skeleton   |
| Sprint 2 | 3 dias  | Concluir Fase 1 e iniciar Fase 2 | Parser + testes, APIs funcionais, indicador básico na lista       |
| Sprint 3 | 2 dias  | Finalizar UI/UX e testes         | Modal completo, reimportação validada, suíte de testes passando   |
| Sprint 4 | 2 dias  | Fase 3 (refino + docs)           | Atualização CIF final, registro no checkpoint, métricas coletadas |

---

## 4. PLANO DE TESTES

1. **Unitários (Vitest):** parsers, helpers e hooks (`useModoColagem`).
2. **Integração (API Routes):** `/api/importacao-estruturada` e `/salvar` com banco em memória.
3. **Componentes (React Testing Library):** indicadores na lista e modal de confirmação.
4. **Testes Manuais Guiados:** colagem real com texto fornecido + cenários de erro (texto parcial, matrícula errada).

Saída esperada: relatório na pasta `tests/output` com evidências (snapshots, logs, print da UI).

---

## 5. CRITÉRIOS DE ACEITE POR FASE

| Fase | Critério                                           | Evidência Necessária                                               |
| ---- | -------------------------------------------------- | ------------------------------------------------------------------ |
| F0   | CIF completo e aprovado                            | PR com arquivos CIF revisados                                      |
| F1   | Parser e persistência funcionando com fixture real | Testes unitários (`parseDadosEscolares.test.ts`) + log do endpoint |
| F2   | UI refletindo status e modal escolar               | Screenshot + teste RTL para indicadores                            |
| F3   | Suite completa passando e docs atualizados         | Resultado do `pnpm test` + atualização no checkpoint CIF           |

---

## 6. RISCOS E MITIGAÇÕES

| Risco                                          | Impacto | Mitigação                                                                                |
| ---------------------------------------------- | ------- | ---------------------------------------------------------------------------------------- |
| Mudança no layout da fonte externa             | Alto    | Guardar texto bruto + construir testes com fixtures variados; facilitar ajuste do parser |
| Parser quebrar dados pessoais existentes       | Médio   | Feature flag por categoria e testes de regressão para dados pessoais antes do deploy     |
| Indicadores inconsistentes (SWR desatualizado) | Médio   | Garantir `mutate` após `/salvar` e adicionar testes de integração de hooks               |
| Falha em auditoria por falta de logs           | Médio   | Incluir logs estruturados desde o início (ver decisão técnica 7)                         |

---
