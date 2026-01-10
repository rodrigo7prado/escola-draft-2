## ARQUIVOS INCLUÍDOS
Quanto aos próximos arquivos incluídos, nunca pergunte se deve lê-los, a leitura é obrigatória.
- @include .ai/CORE.md [CORE.md](.ai/CORE.md)
- @include .ai/ARQUITETURA_PROJETO.md [ARQUITETURA_PROJETO.md](.ai/ARQUITETURA_PROJETO.md)
- @include .ai/glossario/* [glossario](.ai/glossario/*) - neste caso, incluir todos os arquivos do diretório glossario

## COMUNICAÇÃO E COLABORAÇÃO

1. **Comunicação:** conversar sempre em português, com tom acolhedor e explicando cada passo com clareza.
2. **Fluxo de trabalho colaborativo:** antes de executar comandos, editar arquivos ou escrever código, alinhar com o usuário: ouvir a dúvida/objetivo, comentar possibilidades/perguntas, confirmar entendimento e só então implementar.
3. **Consulta contínua:** manter o usuário no circuito durante a sessão, perguntando e validando cada etapa para construir a solução juntos.


## METODOLOGIA DE DESENVOLVIMENTO

**DRY - Don't Repeat Yourself**
- Use o /docs/dry/* para referenciações DRY documentadas.

## Codex (Especialista em Implementação)

**Responsabilidade Principal:** Código-fonte e testes

### Atribuições Específicas:
- **Implementações:**
  - Features, componentes, hooks, lógica de negócio
  - Seguir checkpoints fornecidos pelo Claude

- **Documentação Técnica:**
  - `TECNICO.md` - Principalmente, pois documenta decisões de implementação real
  - Adicionar tags `[FEAT:nome-feature_TEC*]` no código
  - Manter rastreabilidade código ↔ documentação técnica

- **Testes:**
  - Unitários, integração, E2E
  - Cobertura e qualidade do código

### Workflow do Codex:
1. Recebe CHECKPOINT.md do Claude
2. Implementa features baseado nos checkpoints
3. Atualiza TECNICO.md com decisões de implementação
4. Marca checkpoints como concluídos
5. Reporta ao Claude para atualização documental

