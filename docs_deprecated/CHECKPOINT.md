*Para uso das IAs*

# TEMPLATE DE CHECKPOINTS DE SESSÕES DE TRABALHO

Este arquivo serve como template/referência para criação de arquivos CHECKPOINT.md de features.

---

## Sessão X (implementação de Fluxos FX, FY) - Feature: [NOME_DA_FEATURE]

### Componentes DRY Usados
- [DRY.UI:COMPONENTE_1] - Breve descrição do uso
- [DRY.OBJECT:TIPO_1] - Breve descrição do uso
- [DRY.BACKEND:SERVICO_1] - Breve descrição do uso

### Checkpoints

[ ] CP1: Implementação do recurso X
  [ ] CP1.1: Subtarefa A do recurso X
    [ ] T1.1.1: Detalhe técnico de implementação 1 da Subtarefa A
    [ ] T1.1.2: Detalhe técnico de implementação 2 da Subtarefa A
  [ ] CP1.2: Subtarefa B do recurso X
    [ ] CP1.2.1: Bifurcação 1 da Subtarefa B
    [ ] CP1.2.2: Bifurcação 2 da Subtarefa B
      [ ] T1.2.2.1: Detalhe técnico de implementação da Bifurcação 2
      [ ] → TEC1.2: Referência a decisão técnica documentada (ver TECNICO.md)
[ ] CP2: Implementação do recurso Y
  [ ] CP2.1: Subtarefa do recurso Y
  [ ] → TEC2.1: Decisão arquitetural importante (ver TECNICO.md)

---

## CONVENÇÕES DE NOMENCLATURA

### Prefixos em CHECKPOINT.md:
- **CP*** = Checkpoint principal (tarefa/subtarefa)
- **T*** = Detalhe técnico de **implementação** (o que/como fazer)
- **→ TEC*** = Referência a decisão técnica documentada no TECNICO.md

### Quando usar cada prefixo:
- Use **CP** para tarefas e subtarefas mensuráveis
- Use **T** para detalhes de implementação (comandos, configurações, verificações)
- Use **→ TEC** quando a tarefa envolver decisão técnica não-óbvia que precisa ser documentada

### Exemplo de hierarquia completa:
```
[ ] CP5: Implementar sistema de cache
  [ ] CP5.1: Escolher estratégia de cache
    [ ] T5.1.1: Pesquisar bibliotecas disponíveis (Redis, Memcached)
    [ ] T5.1.2: Comparar performance e facilidade de uso
    [ ] → TEC5.1: Decisão de usar Redis em vez de in-memory (ver TECNICO.md)
  [ ] CP5.2: Implementar cache de queries
    [ ] T5.2.1: Criar wrapper para Prisma com cache
    [ ] T5.2.2: Definir TTL por tipo de query
```

---

## OBSERVAÇÕES

1. Checkpoints devem ser **mensuráveis** e **verificáveis**
2. Use `[x]` para marcar items concluídos
3. Mantenha hierarquia clara (indentação consistente)
4. Detalhes de implementação (T) são opcionais - use apenas quando necessário
5. Referências TEC devem sempre apontar para entrada existente no TECNICO.md
