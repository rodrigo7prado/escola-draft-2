*Para uso das IAs*

# CHECKPOINTS DE SESSÕES DE TRABALHO

---

## Sessão 1 (implementação de Fluxos F1, F3.1, F3.2, F3.3) - Feature: Sistema de Fases - Ícones de Status

### Componentes DRY Usados
- [DRY.OBJECT:PHASES] - Sistema de fases (fonte única de configuração)
- [DRY.UI:ICONE_PERSONALIZADO_STATUS] - Ícone individual de status (a documentar)
- [DRY.UI:AGREGADOR_ICONES_STATUS] - Coleção de ícones de status (a documentar)

### Componentes DRY a Criar
- [DRY.UI:ICONE_STATUS_FASE] - Componente individual de ícone de status de fase
- [DRY.UI:AGREGADOR_ICONES_FASES] - Agregador completo de ícones das 4 fases

### Checkpoints

[x] CP1: Padronizar e exportar objeto de configuração de fases
  [x] CP1.1: Mover objeto `gestaoAlunos2` de [abstract.ts](../../../src/lib/core/data/gestao-alunos/def-objects/abstract.ts:81-114) para [phases.ts](../../../src/lib/core/data/gestao-alunos/phases.ts)
    [x] T1.1.1: Renomear `gestaoAlunos2` para `PHASES_CONFIG`
    [x] T1.1.2: Exportar o objeto como `export const PHASES_CONFIG`
    [x] T1.1.3: Exportar os tipos relacionados (`GestaoAlunos`, `Schema<T>`)
  [x] CP1.2: Completar campos `titulo` vazios no objeto
    [x] T1.2.1: "FASE:DADOS_PESSOAIS" → titulo: "Dados Pessoais"
    [x] T1.2.2: "FASE:DADOS_ESCOLARES" → titulo: "Dados Escolares"
    [x] T1.2.3: "FASE:HISTORICO_ESCOLAR" → titulo: "Histórico Escolar"
    [x] T1.2.4: "FASE:EMISSAO_DOCUMENTOS" → titulo já preenchido (manter)
  [x] CP1.3: Adicionar propriedades UI necessárias ao tipo `Schema<T>`
    [x] T1.3.1: Adicionar propriedade `abaId: string` (ex: "pessoais", "escolares", "historico", "emissao")
    [x] T1.3.2: Adicionar propriedade `ordem: number` (1, 2, 3, 4)
    [x] T1.3.3: Atualizar o objeto `PHASES_CONFIG` com esses valores para cada fase
  [x] CP1.4: Atualizar importações em [abstract.ts](../../../src/lib/core/data/gestao-alunos/def-objects/abstract.ts)
    [x] T1.4.1: Importar `PHASES_CONFIG` de phases.ts
    [x] T1.4.2: Remover a declaração local do `gestaoAlunos2`
    [x] T1.4.3: Garantir que tipos e constantes continuam funcionando

[x] CP2: Refatorar componente de ícones de status para usar PHASES_CONFIG
  [x] CP2.1: Analisar componente atual `IndicadoresDadosAluno` em [ListaAlunosCertificacao.tsx](../../../src/components/ListaAlunosCertificacao.tsx:277-300)
    [x] T2.1.1: Componente atual renderiza apenas 2 ícones (UserCheck, GraduationCap)
    [x] T2.1.2: Usa status hardcoded: "completo" | "incompleto" | "ausente"
    [x] T2.1.3: Props: `resumoPessoais`, `resumoEscolares`
  [x] CP2.2: Criar componente genérico `IconeStatusFase` (individual)
    [x] T2.2.1: Localização: [src/components/ui/IconeStatusFase.tsx](../../../src/components/ui/IconeStatusFase.tsx)
    [x] T2.2.2: Props: `phase: Phase`, `status: Status`, `label: string`, `title: string`
    [x] T2.2.3: Renderizar ícone dinamicamente usando `PHASES_CONFIG[phase].icone`
    [x] T2.2.4: Importar ícone do Lucide dinamicamente baseado em `icone.name`
    [x] T2.2.5: Aplicar cores por status (verde/amarelo/vermelho)
  [x] CP2.3: Criar componente agregador `AgregadorIconesFases` (conjunto completo)
    [x] T2.3.1: Localização: [src/components/ui/AgregadorIconesFases.tsx](../../../src/components/ui/AgregadorIconesFases.tsx)
    [x] T2.3.2: Props: `statusPorFase: Record<Phase, { status: Status; label: string; title: string }>`
    [x] T2.3.3: Iterar sobre `PHASES` (ordem) e renderizar `IconeStatusFase` para cada fase
    [x] T2.3.4: Exibir os 4 ícones em linha (flexbox)
  [x] CP2.4: Atualizar `ListaAlunosCertificacao` para usar novo agregador
    [x] T2.4.1: Substituir `IndicadoresDadosAluno` por `AgregadorIconesFases`
    [x] T2.4.2: Adaptar props: transformar `resumoPessoais` e `resumoEscolares` em `statusPorFase`
    [x] T2.4.3: Adicionar status para "FASE:HISTORICO_ESCOLAR" e "FASE:EMISSAO_DOCUMENTOS"
    [x] T2.4.4: Para Histórico Escolar: verificar se existe `HistoricoEscolar` relacionado ao aluno
    [x] T2.4.5: Para Emissão: status inicial = "ausente" (implementação futura)

[x] CP3: Atualizar hooks e queries para incluir dados de Histórico Escolar
  [x] CP3.1: Verificar hook `useAlunosCertificacao` em [src/hooks/useAlunosCertificacao.ts](../../../src/hooks/useAlunosCertificacao.ts)
    [x] T3.1.1: Verificar se query já retorna informações de `HistoricoEscolar`
    [x] T3.1.2: Se não, adicionar campo `progressoHistoricoEscolar` ao tipo `AlunoCertificacao`
  [x] CP3.2: Atualizar tRPC query para incluir contagem de histórico escolar
    [x] T3.2.1: Localizar query de listagem de alunos (provavelmente em `src/server/api/routers/`)
    [x] T3.2.2: Adicionar `.include({ historicoEscolar: true })` ou `_count: { historicoEscolar: true }`
    [x] T3.2.3: Calcular status: `status: histórico.length > 0 ? 'completo' : 'ausente'`
  [x] CP3.3: Transformar dados no componente para passar ao agregador
    [x] T3.3.1: Criar função `montarStatusPorFase(aluno)` que retorna `Record<Phase, StatusInfo>`
    [x] T3.3.2: Mapear cada fase para seu status correspondente
    [x] T3.3.3: Usar essa função ao renderizar `AgregadorIconesFases`

[x] CP4: Documentar componentes DRY criados
  [x] CP4.1: Documentar `IconeStatusFase` em [docs/dry/ui/ui-components.dry.md](../../../docs/dry/ui/ui-components.dry.md)
    [x] T4.1.1: Seguir template de [docs/dry/templates/ui-component.md](../../../docs/dry/templates/ui-component.md)
    [x] T4.1.2: ID DRY: `DRY.UI:ICONE_STATUS_FASE`
    [x] T4.1.3: Descrever props, comportamento, uso do PHASES_CONFIG
  [x] CP4.2: Documentar `AgregadorIconesFases` em [docs/dry/ui/ui-components.dry.md](../../../docs/dry/ui/ui-components.dry.md)
    [x] T4.2.1: ID DRY: `DRY.UI:AGREGADOR_ICONES_FASES`
    [x] T4.2.2: Descrever como itera sobre PHASES e renderiza ícones
    [x] T4.2.3: Incluir referência cruzada para `[DRY.UI:ICONE_STATUS_FASE]`
  [x] CP4.3: Atualizar [docs/dry/summary.md](../../../docs/dry/summary.md)
    [x] T4.3.1: Executar `pnpm summary:dry` para atualizar automaticamente
    [x] T4.3.2: Verificar se os novos componentes aparecem no índice

[ ] CP5: Validar e testar renderização de ícones
  [x] CP5.1: Verificar visualmente na lista de alunos
    [x] T5.1.1: Todos os 4 ícones devem aparecer para cada aluno
    [x] T5.1.2: Ícones devem refletir status correto (cores adequadas)
    [x] T5.1.3: Tooltips devem exibir informações corretas
  [ ] CP5.2: Validar que mudanças no PHASES_CONFIG refletem na UI
    [ ] T5.2.1: Trocar ordem de uma fase → verificar se ordem muda na UI
    [ ] T5.2.2: Trocar ícone de uma fase → verificar se ícone muda na UI
    [ ] T5.2.3: Confirmar que não há valores hardcoded na renderização

---

## Sessão 2 (implementação de Fluxos F2) - Feature: Sistema de Fases - Abas Dinâmicas

### Componentes DRY Usados
- [DRY.OBJECT:PHASES] - Sistema de fases (fonte única de configuração)
- [DRY.UI:TABS_FASES] - Sistema de abas (a documentar)
- [DRY.CONCEPT:DADOS_DO_ALUNO] - Conceito macro do painel

### Componentes DRY a Criar
- [DRY.UI:TABS_FASES] - Componente de abas específico para fases (wrapper do Tabs genérico)

### Checkpoints

[x] CP6: Documentar componente de Tabs genérico existente
  [x] CP6.1: Documentar `Tabs` em [docs/dry/ui/ui-components.dry.md](../../../docs/dry/ui/ui-components.dry.md)
    [x] T6.1.1: Componente localizado em [src/components/ui/Tabs.tsx](../../../src/components/ui/Tabs.tsx)
    [x] T6.1.2: ID DRY: `DRY.BASE-UI:TABS` (componente genérico reutilizável)
    [x] T6.1.3: Descrever API: `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`
    [x] T6.1.4: Descrever variants: "default" | "secondary" | "tertiary"
    [x] T6.1.5: Uso atual: [FluxoCertificacao.tsx](../../../src/components/FluxoCertificacao.tsx:141-171)
  [x] CP6.2: Atualizar [docs/dry/summary.md](../../../docs/dry/summary.md)
    [x] T6.2.1: Executar `pnpm summary:dry`

[x] CP7: Criar componentes placeholder para abas faltantes
  [x] CP7.1: Criar componente `DadosAlunoHistorico.tsx`
    [x] T7.1.1: Localização: [src/components/DadosAlunoHistorico.tsx](../../../src/components/DadosAlunoHistorico.tsx)
    [x] T7.1.2: Props mínimas: `aluno`, `isLoading`, `erro`
    [x] T7.1.3: Conteúdo placeholder: mensagem "Conteúdo do Histórico Escolar será implementado posteriormente"
    [x] T7.1.4: Seguir mesma estrutura de [DadosAlunoEditavel.tsx](../../../src/components/DadosAlunoEditavel.tsx) e [DadosAlunoEscolares.tsx](../../../src/components/DadosAlunoEscolares.tsx)
    [x] T7.1.5: Estados de loading e erro iguais aos componentes existentes
  [x] CP7.2: Criar componente `DadosAlunoEmissao.tsx`
    [x] T7.2.1: Localização: [src/components/DadosAlunoEmissao.tsx](../../../src/components/DadosAlunoEmissao.tsx)
    [x] T7.2.2: Props mínimas: `aluno`, `isLoading`, `erro`
    [x] T7.2.3: Conteúdo placeholder: mensagem "Conteúdo de Emissão de Documentos será implementado posteriormente"
    [x] T7.2.4: Seguir mesma estrutura dos componentes existentes
    [x] T7.2.5: Estados de loading e erro consistentes

[x] CP8: Refatorar FluxoCertificacao para usar PHASES_CONFIG
  [x] CP8.1: Analisar estrutura atual de abas em [FluxoCertificacao.tsx](../../../src/components/FluxoCertificacao.tsx:141-171)
    [x] T8.1.1: Atualmente: 2 abas hardcoded ("pessoais", "escolares")
    [x] T8.1.2: Estado local: `abaAtiva` com tipo `"pessoais" | "escolares"`
    [x] T8.1.3: Componentes: `DadosAlunoEditavel`, `DadosAlunoEscolares`
  [x] CP8.2: Criar tipo derivado de PHASES_CONFIG para ID de aba
    [x] T8.2.1: Em [phases.ts](../../../src/lib/core/data/gestao-alunos/phases.ts): `export type AbaId = (typeof PHASES_CONFIG)[Phase]["abaId"]`
    [x] T8.2.2: Ou extrair dos valores: `type AbaId = "pessoais" | "escolares" | "historico" | "emissao"`
  [x] CP8.3: Refatorar estado de aba ativa para usar tipo derivado
    [x] T8.3.1: Trocar `"pessoais" | "escolares"` por `AbaId`
    [x] T8.3.2: Manter `defaultValue` como `"pessoais"` (primeira aba)
  [x] CP8.4: Renderizar abas dinamicamente usando PHASES_CONFIG
    [x] T8.4.1: Substituir `TabsTrigger` hardcoded por `.map()` sobre `PHASES`
    [x] T8.4.2: Para cada fase, renderizar trigger com: `value={PHASES_CONFIG[fase].abaId}`, `children={PHASES_CONFIG[fase].titulo}`
    [x] T8.4.3: Ordem respeitando `PHASES_CONFIG[fase].ordem`
  [x] CP8.5: Criar mapeamento de componentes por fase
    [x] T8.5.1: Criar objeto: `const componentesPorFase: Record<Phase, React.ComponentType<...>>`
    [x] T8.5.2: Mapear: "FASE:DADOS_PESSOAIS" → `DadosAlunoEditavel`
    [x] T8.5.3: Mapear: "FASE:DADOS_ESCOLARES" → `DadosAlunoEscolares`
    [x] T8.5.4: Mapear: "FASE:HISTORICO_ESCOLAR" → `DadosAlunoHistorico`
    [x] T8.5.5: Mapear: "FASE:EMISSAO_DOCUMENTOS" → `DadosAlunoEmissao`
  [x] CP8.6: Renderizar conteúdo de abas dinamicamente
    [x] T8.6.1: Substituir `TabsContent` hardcoded por `.map()` sobre `PHASES`
    [x] T8.6.2: Para cada fase, renderizar content com componente correspondente de `componentesPorFase`
    [x] T8.6.3: Passar props adequadas para cada componente

[x] CP9: Criar wrapper específico TabsFases (opcional, se necessário)
  [x] CP9.1: Avaliar necessidade de wrapper
    [x] T9.1.1: Se a lógica no FluxoCertificacao ficar muito complexa, extrair
    [x] T9.1.2: Se reutilizar em outros lugares, criar wrapper
    [x] T9.1.3: Caso contrário, manter refatoração inline no FluxoCertificacao
  [ ] CP9.2: Se criar wrapper, localização: [src/components/ui/TabsFases.tsx](../../../src/components/ui/TabsFases.tsx) (não aplicável - wrapper não necessário no momento)
    [ ] T9.2.1: Props: `alunoDetalhes`, `seriesCursadas`, `isLoading`, `erro`
    [ ] T9.2.2: Encapsular toda lógica de renderização dinâmica
    [ ] T9.2.3: Usar internamente `[DRY.BASE-UI:TABS]`
  [ ] CP9.3: Documentar wrapper em DRY (se criado) (não aplicável)
    [ ] T9.3.1: ID: `[DRY.UI:TABS_FASES]`
    [ ] T9.3.2: Referência a `[DRY.BASE-UI:TABS]` e `[DRY.OBJECT:PHASES]`

[x] CP10: Validar renderização de abas
  [x] CP10.1: Verificar visualmente no painel de dados do aluno
    [x] T10.1.1: Todas as 4 abas devem aparecer
    [x] T10.1.2: Títulos devem vir do PHASES_CONFIG
    [x] T10.1.3: Ordem deve respeitar propriedade `ordem`
    [x] T10.1.4: Navegação entre abas deve funcionar
  [x] CP10.2: Validar componentes placeholder
    [x] T10.2.1: Aba "Histórico Escolar" exibe mensagem placeholder
    [x] T10.2.2: Aba "Emissão de Documentos" exibe mensagem placeholder
    [x] T10.2.3: Estados de loading funcionam corretamente
  [x] CP10.3: Validar que mudanças no PHASES_CONFIG refletem nas abas
    [x] T10.3.1: Trocar título de uma fase → verificar se título muda na aba
    [x] T10.3.2: Trocar ordem → verificar se ordem das abas muda
    [x] T10.3.3: Confirmar que não há valores hardcoded

[x] CP11: Atualizar documentação DRY
  [x] CP11.1: Atualizar [docs/dry/summary.md](../../../docs/dry/summary.md)
    [x] T11.1.1: Executar `pnpm summary:dry`
  [x] CP11.2: Verificar referências cruzadas
    [x] T11.2.1: `[DRY.BASE-UI:TABS]` referencia uso em FluxoCertificacao (linha 142)
    [x] T11.2.2: `[DRY.UI:ICONE_STATUS_FASE]` referencia `[DRY.OBJECT:PHASES]` (linha 172, 187)
    [x] T11.2.3: `[DRY.UI:AGREGADOR_ICONES_FASES]` referencia `[DRY.UI:ICONE_STATUS_FASE]` e `[DRY.OBJECT:PHASES]` (linha 196, 208)
    [x] T11.2.4: `[DRY.CONCEPT:DADOS_DO_ALUNO]` lista as 4 abas (linhas 18-23 em ui-macro.md)
    [x] T11.2.5: `[DRY.CONCEPT:ITEM_ALUNO]` referencia `[DRY.UI:AGREGADOR_ICONES_FASES]` (linhas 14-15 em ui-macro.md)

---

## Sessão 3 (Opcional) - Feature: Integração Ícones ↔ Abas

### Componentes DRY Usados
- [DRY.UI:AGREGADOR_ICONES_FASES] - Ícones de status
- [DRY.UI:TABS_FASES] - Sistema de abas
- [DRY.OBJECT:PHASES] - Configuração

### Checkpoints

[ ] CP12: Sincronizar visualização de ícones com aba ativa (se desejado no futuro)
  [ ] CP12.1: Adicionar prop `abaAtiva` ao `AgregadorIconesFases`
  [ ] CP12.2: Destacar visualmente ícone da aba ativa (borda, background, etc)
  [ ] CP12.3: Callback `onIconeClick` para permitir navegação via ícone

---

## Observações Gerais

- **Prioridade:** Sessão 1 ANTES de Sessão 2 (conforme solicitado pelo usuário)
- **Granularidade:** Checkpoints detalhados para facilitar execução pelo Codex
- **DRY:** Todos os componentes criados devem ser documentados conforme metodologia
- **Fonte única:** PHASES_CONFIG é a única fonte de verdade para configuração de fases
- **Testes:** Não incluídos nesta iteração (conforme solicitado)
- **Conteúdo placeholder:** Abas faltantes terão apenas estrutura básica, conteúdo será adicionado posteriormente
