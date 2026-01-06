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

[ ] CP1: Padronizar e exportar objeto de configuração de fases
  [ ] CP1.1: Mover objeto `gestaoAlunos2` de [abstract.ts](../../../src/lib/core/data/gestao-alunos/def-objects/abstract.ts:81-114) para [phases.ts](../../../src/lib/core/data/gestao-alunos/phases.ts)
    [ ] TEC1.1.1: Renomear `gestaoAlunos2` para `PHASES_CONFIG`
    [ ] TEC1.1.2: Exportar o objeto como `export const PHASES_CONFIG`
    [ ] TEC1.1.3: Exportar os tipos relacionados (`GestaoAlunos`, `Schema<T>`)
  [ ] CP1.2: Completar campos `titulo` vazios no objeto
    [ ] TEC1.2.1: "FASE:DADOS_PESSOAIS" → titulo: "Dados Pessoais"
    [ ] TEC1.2.2: "FASE:DADOS_ESCOLARES" → titulo: "Dados Escolares"
    [ ] TEC1.2.3: "FASE:HISTORICO_ESCOLAR" → titulo: "Histórico Escolar"
    [ ] TEC1.2.4: "FASE:EMISSAO_DOCUMENTOS" → titulo já preenchido (manter)
  [ ] CP1.3: Adicionar propriedades UI necessárias ao tipo `Schema<T>`
    [ ] TEC1.3.1: Adicionar propriedade `abaId: string` (ex: "pessoais", "escolares", "historico", "emissao")
    [ ] TEC1.3.2: Adicionar propriedade `ordem: number` (1, 2, 3, 4)
    [ ] TEC1.3.3: Atualizar o objeto `PHASES_CONFIG` com esses valores para cada fase
  [ ] CP1.4: Atualizar importações em [abstract.ts](../../../src/lib/core/data/gestao-alunos/def-objects/abstract.ts)
    [ ] TEC1.4.1: Importar `PHASES_CONFIG` de phases.ts
    [ ] TEC1.4.2: Remover a declaração local do `gestaoAlunos2`
    [ ] TEC1.4.3: Garantir que tipos e constantes continuam funcionando

[ ] CP2: Refatorar componente de ícones de status para usar PHASES_CONFIG
  [ ] CP2.1: Analisar componente atual `IndicadoresDadosAluno` em [ListaAlunosCertificacao.tsx](../../../src/components/ListaAlunosCertificacao.tsx:277-300)
    [ ] TEC2.1.1: Componente atual renderiza apenas 2 ícones (UserCheck, GraduationCap)
    [ ] TEC2.1.2: Usa status hardcoded: "completo" | "incompleto" | "ausente"
    [ ] TEC2.1.3: Props: `resumoPessoais`, `resumoEscolares`
  [ ] CP2.2: Criar componente genérico `IconeStatusFase` (individual)
    [ ] TEC2.2.1: Localização: [src/components/ui/IconeStatusFase.tsx](../../../src/components/ui/IconeStatusFase.tsx)
    [ ] TEC2.2.2: Props: `phase: Phase`, `status: Status`, `label: string`, `title: string`
    [ ] TEC2.2.3: Renderizar ícone dinamicamente usando `PHASES_CONFIG[phase].icone`
    [ ] TEC2.2.4: Importar ícone do Lucide dinamicamente baseado em `icone.name`
    [ ] TEC2.2.5: Aplicar cores por status (verde/amarelo/vermelho)
  [ ] CP2.3: Criar componente agregador `AgregadorIconesFases` (conjunto completo)
    [ ] TEC2.3.1: Localização: [src/components/ui/AgregadorIconesFases.tsx](../../../src/components/ui/AgregadorIconesFases.tsx)
    [ ] TEC2.3.2: Props: `statusPorFase: Record<Phase, { status: Status; label: string; title: string }>`
    [ ] TEC2.3.3: Iterar sobre `PHASES` (ordem) e renderizar `IconeStatusFase` para cada fase
    [ ] TEC2.3.4: Exibir os 4 ícones em linha (flexbox)
  [ ] CP2.4: Atualizar `ListaAlunosCertificacao` para usar novo agregador
    [ ] TEC2.4.1: Substituir `IndicadoresDadosAluno` por `AgregadorIconesFases`
    [ ] TEC2.4.2: Adaptar props: transformar `resumoPessoais` e `resumoEscolares` em `statusPorFase`
    [ ] TEC2.4.3: Adicionar status para "FASE:HISTORICO_ESCOLAR" e "FASE:EMISSAO_DOCUMENTOS"
    [ ] TEC2.4.4: Para Histórico Escolar: verificar se existe `HistoricoEscolar` relacionado ao aluno
    [ ] TEC2.4.5: Para Emissão: status inicial = "ausente" (implementação futura)

[ ] CP3: Atualizar hooks e queries para incluir dados de Histórico Escolar
  [ ] CP3.1: Verificar hook `useAlunosCertificacao` em [src/hooks/useAlunosCertificacao.ts](../../../src/hooks/useAlunosCertificacao.ts)
    [ ] TEC3.1.1: Verificar se query já retorna informações de `HistoricoEscolar`
    [ ] TEC3.1.2: Se não, adicionar campo `progressoHistoricoEscolar` ao tipo `AlunoCertificacao`
  [ ] CP3.2: Atualizar tRPC query para incluir contagem de histórico escolar
    [ ] TEC3.2.1: Localizar query de listagem de alunos (provavelmente em `src/server/api/routers/`)
    [ ] TEC3.2.2: Adicionar `.include({ historicoEscolar: true })` ou `_count: { historicoEscolar: true }`
    [ ] TEC3.2.3: Calcular status: `status: histórico.length > 0 ? 'completo' : 'ausente'`
  [ ] CP3.3: Transformar dados no componente para passar ao agregador
    [ ] TEC3.3.1: Criar função `montarStatusPorFase(aluno)` que retorna `Record<Phase, StatusInfo>`
    [ ] TEC3.3.2: Mapear cada fase para seu status correspondente
    [ ] TEC3.3.3: Usar essa função ao renderizar `AgregadorIconesFases`

[ ] CP4: Documentar componentes DRY criados
  [ ] CP4.1: Documentar `IconeStatusFase` em [docs/dry/ui/ui-components.dry.md](../../../docs/dry/ui/ui-components.dry.md)
    [ ] TEC4.1.1: Seguir template de [docs/dry/templates/ui-component.md](../../../docs/dry/templates/ui-component.md)
    [ ] TEC4.1.2: ID DRY: `DRY.UI:ICONE_STATUS_FASE`
    [ ] TEC4.1.3: Descrever props, comportamento, uso do PHASES_CONFIG
  [ ] CP4.2: Documentar `AgregadorIconesFases` em [docs/dry/ui/ui-components.dry.md](../../../docs/dry/ui/ui-components.dry.md)
    [ ] TEC4.2.1: ID DRY: `DRY.UI:AGREGADOR_ICONES_FASES`
    [ ] TEC4.2.2: Descrever como itera sobre PHASES e renderiza ícones
    [ ] TEC4.2.3: Incluir referência cruzada para `[DRY.UI:ICONE_STATUS_FASE]`
  [ ] CP4.3: Atualizar [docs/dry/summary.md](../../../docs/dry/summary.md)
    [ ] TEC4.3.1: Executar `pnpm summary:dry` para atualizar automaticamente
    [ ] TEC4.3.2: Verificar se os novos componentes aparecem no índice

[ ] CP5: Validar e testar renderização de ícones
  [ ] CP5.1: Verificar visualmente na lista de alunos
    [ ] TEC5.1.1: Todos os 4 ícones devem aparecer para cada aluno
    [ ] TEC5.1.2: Ícones devem refletir status correto (cores adequadas)
    [ ] TEC5.1.3: Tooltips devem exibir informações corretas
  [ ] CP5.2: Validar que mudanças no PHASES_CONFIG refletem na UI
    [ ] TEC5.2.1: Trocar ordem de uma fase → verificar se ordem muda na UI
    [ ] TEC5.2.2: Trocar ícone de uma fase → verificar se ícone muda na UI
    [ ] TEC5.2.3: Confirmar que não há valores hardcoded na renderização

---

## Sessão 2 (implementação de Fluxos F2) - Feature: Sistema de Fases - Abas Dinâmicas

### Componentes DRY Usados
- [DRY.OBJECT:PHASES] - Sistema de fases (fonte única de configuração)
- [DRY.UI:TABS_FASES] - Sistema de abas (a documentar)
- [DRY.CONCEPT:DADOS_DO_ALUNO] - Conceito macro do painel

### Componentes DRY a Criar
- [DRY.UI:TABS_FASES] - Componente de abas específico para fases (wrapper do Tabs genérico)

### Checkpoints

[ ] CP6: Documentar componente de Tabs genérico existente
  [ ] CP6.1: Documentar `Tabs` em [docs/dry/ui/ui-components.dry.md](../../../docs/dry/ui/ui-components.dry.md)
    [ ] TEC6.1.1: Componente localizado em [src/components/ui/Tabs.tsx](../../../src/components/ui/Tabs.tsx)
    [ ] TEC6.1.2: ID DRY: `DRY.BASE-UI:TABS` (componente genérico reutilizável)
    [ ] TEC6.1.3: Descrever API: `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`
    [ ] TEC6.1.4: Descrever variants: "default" | "secondary" | "tertiary"
    [ ] TEC6.1.5: Uso atual: [FluxoCertificacao.tsx](../../../src/components/FluxoCertificacao.tsx:141-171)
  [ ] CP6.2: Atualizar [docs/dry/summary.md](../../../docs/dry/summary.md)
    [ ] TEC6.2.1: Executar `pnpm summary:dry`

[ ] CP7: Criar componentes placeholder para abas faltantes
  [ ] CP7.1: Criar componente `DadosAlunoHistorico.tsx`
    [ ] TEC7.1.1: Localização: [src/components/DadosAlunoHistorico.tsx](../../../src/components/DadosAlunoHistorico.tsx)
    [ ] TEC7.1.2: Props mínimas: `aluno`, `isLoading`, `erro`
    [ ] TEC7.1.3: Conteúdo placeholder: mensagem "Conteúdo do Histórico Escolar será implementado posteriormente"
    [ ] TEC7.1.4: Seguir mesma estrutura de [DadosAlunoEditavel.tsx](../../../src/components/DadosAlunoEditavel.tsx) e [DadosAlunoEscolares.tsx](../../../src/components/DadosAlunoEscolares.tsx)
    [ ] TEC7.1.5: Estados de loading e erro iguais aos componentes existentes
  [ ] CP7.2: Criar componente `DadosAlunoEmissao.tsx`
    [ ] TEC7.2.1: Localização: [src/components/DadosAlunoEmissao.tsx](../../../src/components/DadosAlunoEmissao.tsx)
    [ ] TEC7.2.2: Props mínimas: `aluno`, `isLoading`, `erro`
    [ ] TEC7.2.3: Conteúdo placeholder: mensagem "Conteúdo de Emissão de Documentos será implementado posteriormente"
    [ ] TEC7.2.4: Seguir mesma estrutura dos componentes existentes
    [ ] TEC7.2.5: Estados de loading e erro consistentes

[ ] CP8: Refatorar FluxoCertificacao para usar PHASES_CONFIG
  [ ] CP8.1: Analisar estrutura atual de abas em [FluxoCertificacao.tsx](../../../src/components/FluxoCertificacao.tsx:141-171)
    [ ] TEC8.1.1: Atualmente: 2 abas hardcoded ("pessoais", "escolares")
    [ ] TEC8.1.2: Estado local: `abaAtiva` com tipo `"pessoais" | "escolares"`
    [ ] TEC8.1.3: Componentes: `DadosAlunoEditavel`, `DadosAlunoEscolares`
  [ ] CP8.2: Criar tipo derivado de PHASES_CONFIG para ID de aba
    [ ] TEC8.2.1: Em [phases.ts](../../../src/lib/core/data/gestao-alunos/phases.ts): `export type AbaId = (typeof PHASES_CONFIG)[Phase]["abaId"]`
    [ ] TEC8.2.2: Ou extrair dos valores: `type AbaId = "pessoais" | "escolares" | "historico" | "emissao"`
  [ ] CP8.3: Refatorar estado de aba ativa para usar tipo derivado
    [ ] TEC8.3.1: Trocar `"pessoais" | "escolares"` por `AbaId`
    [ ] TEC8.3.2: Manter `defaultValue` como `"pessoais"` (primeira aba)
  [ ] CP8.4: Renderizar abas dinamicamente usando PHASES_CONFIG
    [ ] TEC8.4.1: Substituir `TabsTrigger` hardcoded por `.map()` sobre `PHASES`
    [ ] TEC8.4.2: Para cada fase, renderizar trigger com: `value={PHASES_CONFIG[fase].abaId}`, `children={PHASES_CONFIG[fase].titulo}`
    [ ] TEC8.4.3: Ordem respeitando `PHASES_CONFIG[fase].ordem`
  [ ] CP8.5: Criar mapeamento de componentes por fase
    [ ] TEC8.5.1: Criar objeto: `const componentesPorFase: Record<Phase, React.ComponentType<...>>`
    [ ] TEC8.5.2: Mapear: "FASE:DADOS_PESSOAIS" → `DadosAlunoEditavel`
    [ ] TEC8.5.3: Mapear: "FASE:DADOS_ESCOLARES" → `DadosAlunoEscolares`
    [ ] TEC8.5.4: Mapear: "FASE:HISTORICO_ESCOLAR" → `DadosAlunoHistorico`
    [ ] TEC8.5.5: Mapear: "FASE:EMISSAO_DOCUMENTOS" → `DadosAlunoEmissao`
  [ ] CP8.6: Renderizar conteúdo de abas dinamicamente
    [ ] TEC8.6.1: Substituir `TabsContent` hardcoded por `.map()` sobre `PHASES`
    [ ] TEC8.6.2: Para cada fase, renderizar content com componente correspondente de `componentesPorFase`
    [ ] TEC8.6.3: Passar props adequadas para cada componente

[ ] CP9: Criar wrapper específico TabsFases (opcional, se necessário)
  [ ] CP9.1: Avaliar necessidade de wrapper
    [ ] TEC9.1.1: Se a lógica no FluxoCertificacao ficar muito complexa, extrair
    [ ] TEC9.1.2: Se reutilizar em outros lugares, criar wrapper
    [ ] TEC9.1.3: Caso contrário, manter refatoração inline no FluxoCertificacao
  [ ] CP9.2: Se criar wrapper, localização: [src/components/ui/TabsFases.tsx](../../../src/components/ui/TabsFases.tsx)
    [ ] TEC9.2.1: Props: `alunoDetalhes`, `seriesCursadas`, `isLoading`, `erro`
    [ ] TEC9.2.2: Encapsular toda lógica de renderização dinâmica
    [ ] TEC9.2.3: Usar internamente `[DRY.BASE-UI:TABS]`
  [ ] CP9.3: Documentar wrapper em DRY (se criado)
    [ ] TEC9.3.1: ID: `[DRY.UI:TABS_FASES]`
    [ ] TEC9.3.2: Referência a `[DRY.BASE-UI:TABS]` e `[DRY.OBJECT:PHASES]`

[ ] CP10: Validar renderização de abas
  [ ] CP10.1: Verificar visualmente no painel de dados do aluno
    [ ] TEC10.1.1: Todas as 4 abas devem aparecer
    [ ] TEC10.1.2: Títulos devem vir do PHASES_CONFIG
    [ ] TEC10.1.3: Ordem deve respeitar propriedade `ordem`
    [ ] TEC10.1.4: Navegação entre abas deve funcionar
  [ ] CP10.2: Validar componentes placeholder
    [ ] TEC10.2.1: Aba "Histórico Escolar" exibe mensagem placeholder
    [ ] TEC10.2.2: Aba "Emissão de Documentos" exibe mensagem placeholder
    [ ] TEC10.2.3: Estados de loading funcionam corretamente
  [ ] CP10.3: Validar que mudanças no PHASES_CONFIG refletem nas abas
    [ ] TEC10.3.1: Trocar título de uma fase → verificar se título muda na aba
    [ ] TEC10.3.2: Trocar ordem → verificar se ordem das abas muda
    [ ] TEC10.3.3: Confirmar que não há valores hardcoded

[ ] CP11: Atualizar documentação DRY
  [ ] CP11.1: Atualizar [docs/dry/summary.md](../../../docs/dry/summary.md)
    [ ] TEC11.1.1: Executar `pnpm summary:dry`
  [ ] CP11.2: Verificar referências cruzadas
    [ ] TEC11.2.1: `[DRY.UI:TABS_FASES]` deve referenciar `[DRY.BASE-UI:TABS]`
    [ ] TEC11.2.2: `[DRY.UI:TABS_FASES]` deve referenciar `[DRY.OBJECT:PHASES]`
    [ ] TEC11.2.3: `[DRY.CONCEPT:DADOS_DO_ALUNO]` deve listar as 4 abas

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